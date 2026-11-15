/* Copyright (c) 2026 TylerAustin. */
((window, document) =>
{
    'use strict';

    const assetBase = new URL(document.currentScript.src);
    const scriptNonce = document.currentScript.nonce;
    const assetUrl = path =>
    {
        const url = new URL(path, assetBase);
        for (const key of ['_v', '_mt'])
        {
            if (assetBase.searchParams.has(key)) url.searchParams.set(key, assetBase.searchParams.get(key));
        }
        return url.href;
    };
    const vidstackUrl = assetUrl('vendor/vidstack/player.min.js');
    const videojs10Url = assetUrl('vendor/videojs10/player.min.js');
    const videojs10SkinUrl = assetUrl('videojs10-skin.min.js');
    const mediaAttributes = ['crossorigin', 'poster', 'muted', 'disableremoteplayback', 'disablepictureinpicture', 'autopictureinpicture', 'x-webkit-airplay'];

    XF.TylVideoPlayer = XF.Element.newHandler({
        scope: null,
        options: {
            mediaType: 'video',
            src: '',
            sourceType: '',
            start: 0,
            playlist: '',
            videoPresentation: false,
        },

        async init ()
        {
            const media = this.target;
            const iframeSrc = media instanceof HTMLIFrameElement ? media.getAttribute('src') : null;
            const configElement = document.querySelector('.js-tylVideoPlayerConfig');
            if (!configElement)
            {
                this.activateNativeFallback(media);
                return;
            }

            const config = XF.applyDataOptions({
                engine: 'vidstack',
                translations: {},
                pauseOthers: true,
                seekStep: 10,
                keyboard: true,
            }, configElement.dataset);

            // Keep embeds with explicit isolation policies on their native path;
            // an SDK replacement cannot preserve every supported configuration.
            if (media instanceof HTMLIFrameElement && ['sandbox', 'csp', 'credentialless', 'srcdoc'].some(attribute => media.hasAttribute(attribute))
                || !['vidstack', 'videojs10'].includes(config.engine) || !this.supportsCustomPlayer(config.engine)
                || !this.canEnhanceWithAds(media))
            {
                this.activateNativeFallback(media);
                return;
            }

            this.scope = {
                events: new AbortController(),
                cleanups: [],
                root: null,
                destroyRoot: null,
                releaseMedia: null,
                pause: null,
                committed: false,
                disposed: false,
                overlayHidden: false,
                ads: null,
                adsComplete: false,
                beginAds: null,
                pendingPlay: false,
                pendingPlaySource: null,
                playbackRequested: false,
            };
            if (media instanceof HTMLMediaElement)
            {
                // A lightbox can request autoplay while the library imports. Retain
                // that intent without starting a native pre-roll on the fallback.
                this.listen(media, 'play', event =>
                {
                    if (this.scope.committed || this.scope.disposed || media.paused) return;
                    this.scope.pendingPlay = true;
                    this.scope.pendingPlaySource = this.mediaSourceSignature(media);
                    media.pause();
                    event.stopImmediatePropagation();
                }, { capture: true });
            }
            const lightboxSlide = media.closest('.fancybox__slide');
            const lightbox = lightboxSlide?.closest('.fancybox__container');
            if (lightbox)
            {
                this.scope.overlayHidden = !lightboxSlide.classList.contains('is-selected');
                this.listen(document, 'lightbox:slide-displayed', event =>
                {
                    if (event.instance?.container !== lightbox) return;
                    this.scope.overlayHidden = event.slide?.el !== lightboxSlide;
                    if (this.scope.overlayHidden)
                    {
                        this.scope.pendingPlay = false;
                        this.scope.pause?.();
                    }
                });
                this.listen(document, 'lightbox:closed', event =>
                {
                    if (event.instance?.container !== lightbox) return;
                    this.scope.overlayHidden = true;
                    this.scope.pendingPlay = false;
                    if (this.scope.root) this.disposePlayer(true);
                });
            }
            const overlay = media.closest('.overlay-container');
            if (overlay)
            {
                const dialog = media.closest('[role="dialog"], [role="alertdialog"]');
                this.scope.overlayHidden = dialog?.getAttribute('aria-hidden') === 'true';
                this.listen(overlay, 'overlay:hiding', event =>
                {
                    if (event.target !== overlay) return;
                    this.scope.overlayHidden = true;
                    this.scope.pendingPlay = false;
                    if (this.scope.pause) this.scope.pause();
                    else if (media instanceof HTMLMediaElement) media.pause();
                });
                this.listen(overlay, 'overlay:showing', event =>
                {
                    if (event.target === overlay) this.scope.overlayHidden = false;
                });
            }

            try
            {
                // Retain XF's native iframe as the fallback, without loading it beside the custom provider.
                if (iframeSrc && this.options.mediaType === 'youtube' && ['vidstack', 'videojs10'].includes(config.engine)) media.removeAttribute('src');
                const sourceSignature = this.sourceSignature(media);
                if (config.engine === 'videojs10')
                {
                    await this.initVideojs10(media, config, sourceSignature);
                    return;
                }
                if (config.engine !== 'vidstack')
                {
                    return;
                }
                const { VidstackPlayer, VidstackPlayerLayout, isAudioProvider, isVideoProvider, isHLSProvider, isYouTubeProvider,
                    isAudioSrc, isVideoSrc, isHLSSrc, HLSProviderLoader, loadHLS, YouTubePlaylistLoader } = await import(vidstackUrl);
                if (!media.isConnected || this.sourceSignature(media) !== sourceSignature)
                {
                    return;
                }

                // Build on a detached copy: the native element remains usable until setup succeeds.
                const copy = this.cloneMedia(media);
                copy.removeAttribute('data-xf-init');
                copy.removeAttribute('autoplay');
                // Vidstack moves element children out of the native media tag.
                // XF's browser fallback belongs only to the original media element.
                for (const fallback of copy.querySelectorAll('.bbMediaWrapper-fallback')) fallback.remove();
                if (copy instanceof HTMLIFrameElement)
                {
                    // XF's wrapper owns responsive embed sizing. Vidstack otherwise
                    // treats HTML iframe dimensions as CSS and clears its aspect ratio.
                    copy.removeAttribute('width');
                    copy.removeAttribute('height');
                }
                const directSrc = this.options.src || (media.getAttribute('src') ? media.src : '');
                const src = directSrc || media.querySelector('source')?.src;
                if (!src)
                {
                    return;
                }

                // Native attachment URLs may have no extension; XF supplies its registered MIME type.
                const sources = this.options.mediaType === 'youtube'
                    ? [{ src, type: this.options.playlist ? 'video/tyl-youtube-playlist' : 'video/youtube' }]
                    : directSrc
                    ? [{ src, type: this.options.sourceType }]
                    : Array.from(media.querySelectorAll('source'), source => ({
                        src: source.src,
                        type: source.type || this.options.sourceType,
                    }));

                if (this.options.mediaType !== 'youtube'
                    && !sources.some(source => isHLSSrc(source)
                        ? HLSProviderLoader.supported || this.supportsNativeHLS()
                        : isAudioSrc(source) || isVideoSrc(source)))
                {
                    return;
                }

                const player = await VidstackPlayer.create({
                    target: copy,
                    src: sources.length ? sources : src,
                    viewType: this.options.mediaType === 'audio' && !this.options.videoPresentation ? 'audio' : 'video',
                    title: this.mediaTitle(media) || (this.options.mediaType === 'youtube' ? '' : config.translations[this.options.mediaType === 'audio' ? 'Audio' : 'Playback']),
                    ariaLabel: media.getAttribute('aria-label') || '',
                    crossOrigin: media instanceof HTMLMediaElement ? media.crossOrigin : null,
                    poster: media.getAttribute('poster') || '',
                    playsInline: true,
                    load: 'play',
                    posterLoad: 'visible',
                    autoPlay: false,
                    keyDisabled: !config.keyboard,
                    keyTarget: 'player',
                    currentTime: this.options.start,
                    // Storage is deliberately opt-in upstream; the add-on adds no browser tracking storage.
                    storage: null,
                    layout: new VidstackPlayerLayout({
                        translations: config.translations,
                        seekStep: config.seekStep,
                        colorScheme: 'dark',
                        noAudioGain: true,
                        playbackRates: { min: 0.25, max: 2, step: 0.25 },
                    }),
                });
                this.trackRoot(player, () => player.destroy(), () => player.pause().catch(error =>
                {
                    if (!this.scope.disposed && error.name !== 'AbortError') console.error('[TylerAustin/VideoPlayer] Unable to pause playback.', error);
                }));
                this.listen(player, 'tyl-player-play-request', event => this.coordinatePlayback(config, event));
                this.listen(player, 'source-change', () => this.scope.checkAdSource?.());
                this.listen(player, 'tyl-player-pause-request', () =>
                {
                    if (!this.scope.pausingForAd)
                    {
                        this.scope.playbackRequested = false;
                        this.scope.ads?.pause();
                    }
                });

                if (this.options.mediaType === 'audio' || media.hasAttribute('disablepictureinpicture'))
                {
                    // Safari's presentation adapter does not enforce the native PiP attribute.
                    // Cancel the public request before keyboard/buttons reach that adapter.
                    player.dataset.tylPipDisabled = '';
                    this.listen(player, 'media-enter-pip-request', event => event.preventDefault(), { capture: true });
                }

                if (this.options.playlist)
                {
                    // Set loaders before this detached player joins XenForo's document.
                    player.querySelector('media-provider').loaders = [new YouTubePlaylistLoader()];
                    const playlistControls = this.addPlaylistControls(player, player, 'can-play', direction =>
                    {
                        if (!this.coordinatePlayback(config)) return Promise.resolve();
                        return player.provider.navigate(direction);
                    }, event => Number.isFinite(event.detail?.error?.youtubeErrorCode));
                    this.listen(player, 'source-change', event =>
                    {
                        const source = event.detail;
                        const list = source.type === 'video/tyl-youtube-playlist' ? new URL(source.src).searchParams.get('list') : null;
                        this.setPlaylistSource(player, playlistControls, list);
                    });
                    this.listen(player, 'title-change', event =>
                    {
                        if (typeof event.detail === 'string' && player.querySelector('media-announcer'))
                        {
                            this.announcePlaylistItem(playlistControls, event.detail);
                        }
                    });
                }
                this.addVidstackErrorAlert(player, config.translations['Playback Error']);

                // Use the locally bundled HLS implementation instead of the upstream CDN default.
                this.listen(player, 'provider-change', event =>
                {
                    const provider = event.detail;
                    if (isAudioProvider(provider) || isVideoProvider(provider) || isHLSProvider(provider))
                    {
                        provider.media.setAttribute('data-ta-video-ad-ignore', '1');
                        for (const attribute of mediaAttributes)
                        {
                            if (media.hasAttribute(attribute)) provider.media.setAttribute(attribute, media.getAttribute(attribute));
                        }
                        if (this.options.mediaType === 'audio') provider.media.setAttribute('disablepictureinpicture', '');
                    }
                    if (isHLSProvider(provider))
                    {
                        // hls.js fetches manifests, keys, segments and subtitles itself.
                        // Honor credentialed media requests and retain configured loader hooks.
                        const config = provider.config;
                        const { xhrSetup, fetchSetup } = config;
                        provider.config = {
                            ...config,
                            async xhrSetup (xhr, url, context)
                            {
                                if (provider.media.crossOrigin === 'use-credentials') xhr.withCredentials = true;
                                await xhrSetup?.call(this, xhr, url, context);
                            },
                            fetchSetup (context, initParams)
                            {
                                if (provider.media.crossOrigin === 'use-credentials') initParams.credentials = 'include';
                                return fetchSetup ? fetchSetup.call(this, context, initParams) : new Request(context.url, initParams);
                            },
                        };
                        provider.library = loadHLS;
                        if (!media.hasAttribute('disableremoteplayback')
                            && media.getAttribute('x-webkit-airplay')?.toLowerCase() !== 'deny')
                        {
                            this.onCleanup(provider.onInstance(instance =>
                            {
                                const onAttached = () =>
                                {
                                    // hls.js enables this flag for MMS. Vidstack already adds the
                                    // original manifest as an AirPlay source after attaching media.
                                    if (player.isConnected) provider.video.disableRemotePlayback = false;
                                };
                                instance.on(provider.ctor.Events.MEDIA_ATTACHED, onAttached);
                                this.onCleanup(() => instance.off(provider.ctor.Events.MEDIA_ATTACHED, onAttached));
                            }));
                        }
                    }
                    if (isYouTubeProvider(event.detail))
                    {
                        event.detail.language = document.documentElement.lang;
                        event.detail.cookies = false;
                        // YouTube requires client identification even when the page or original
                        // iframe suppresses referrers. Send only the forum origin across origins.
                        for (const attribute of ['allow', 'allowfullscreen'])
                        {
                            if (media.hasAttribute(attribute)) event.detail.iframe.setAttribute(attribute, media.getAttribute(attribute));
                            else event.detail.iframe.removeAttribute(attribute);
                        }
                        event.detail.iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
                    }
                });

                this.listen(player, 'play', () =>
                {
                    if (!player.paused) this.coordinatePlayback(config);
                });

                player.classList.add('tylVideoPlayer');
                // Preserve sizing supplied by XenForo's native attachment display modifiers.
                this.copyMediaStyle(media, player);
                // Vidstack.create sets keep-alive for manual ownership; XF fragments need automatic disposal.
                player.removeAttribute('keep-alive');
                if (!media.isConnected || this.sourceSignature(media) !== sourceSignature || !this.canEnhanceWithAds(media))
                {
                    return;
                }
                const readSource = () => JSON.stringify(player.src);
                const preparedSource = readSource();
                this.setupAds(media, player, () => player.play(), () => player.pause(), config,
                    () => ({ volume: player.volume, muted: player.muted }), state =>
                    {
                        player.volume = state.volume;
                        player.muted = state.muted;
                    }, readSource);
                const resumePlayback = (this.scope.pendingPlay && this.scope.pendingPlaySource === this.mediaSourceSignature(media))
                    || (media instanceof HTMLMediaElement && !media.paused && !media.ended);
                this.scope.playbackRequested = resumePlayback;
                this.copyTrackSelection(media, player.querySelector('media-provider'));
                if (media instanceof HTMLMediaElement)
                {
                    // Read the live controls after asynchronous setup, immediately before replacement.
                    player.setAttribute('volume', String(media.volume));
                    player.toggleAttribute('muted', media.muted);
                    player.setAttribute('playback-rate', String(media.playbackRate));
                    player.setAttribute('current-time', String(media.currentTime));
                    media.pause();
                }
                this.replaceMedia(media, player);
                if (resumePlayback && this.scope.playbackRequested && !this.scope.disposed
                    && !this.scope.overlayHidden && player.isConnected && readSource() === preparedSource)
                {
                    player.play().catch(error =>
                    {
                        if (!this.scope.disposed && error.name !== 'AbortError') console.error('[TylerAustin/VideoPlayer] Unable to resume attachment playback.', error);
                    });
                }
            }
            catch (error)
            {
                console.error('[TylerAustin/VideoPlayer] Player initialization failed.', error);
            }
            finally
            {
                if (!this.scope.committed)
                {
                    this.disposePlayer(true);
                }
                this.activateNativeFallback(media, this.scope.committed ? null : iframeSrc);
                if (!this.scope.committed && this.scope.pendingPlay && !this.scope.overlayHidden && media.isConnected
                    && this.scope.pendingPlaySource === this.mediaSourceSignature(media))
                {
                    media.play().catch(error =>
                    {
                        if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') console.error('[TylerAustin/VideoPlayer] Unable to resume native playback.', error);
                    });
                }
            }
        },

        async initVideojs10 (media, config, sourceSignature)
        {
            // This runtime registers control tags shared with Vidstack, so only one engine is imported.
            // The skin imports this same runtime; ESM preserves evaluation order while both files fetch.
            const [runtime] = await Promise.all([import(videojs10Url), import(videojs10SkinUrl)]);
            if (!media.isConnected || this.sourceSignature(media) !== sourceSignature) return;
            const { resolveAdapterType, loadHLS, loadYouTube, parseYouTubeVideoId, configureCspNonce, getDeepActiveElement } = runtime;
            configureCspNonce(scriptNonce);
            const source = media.querySelector('source');
            const directSrc = this.options.src || (media.getAttribute('src') ? media.src : '');
            const src = directSrc || source?.src;
            if (!src || !media.isConnected)
            {
                return;
            }

            const type = directSrc ? this.options.sourceType : source?.type || this.options.sourceType;
            const adapter = this.options.mediaType === 'youtube' ? 'youtube' : resolveAdapterType(src, type);
            if (adapter === 'youtube')
            {
                await loadYouTube();
            }
            else if (adapter === 'hls')
            {
                const Hls = await loadHLS();
                if (!Hls.isSupported() && !this.supportsNativeHLS()) return;
            }
            // The add-on accepts progressive files, HLS, and native XF YouTube embeds.
            else if (![null, 'video', 'audio'].includes(adapter))
            {
                return;
            }
            if (!media.isConnected || this.sourceSignature(media) !== sourceSignature || !this.canEnhanceWithAds(media))
            {
                return;
            }

            const audio = this.options.mediaType === 'audio';
            const captionedAudio = audio && media.querySelector('track[kind="captions"], track[kind="subtitles"], track[kind="chapters"]') !== null;
            // A video presentation gives audio tracks a visible native WebVTT caption area.
            // HLS can announce captions and chapters after loading its manifest.
            const audioLayout = audio && !this.options.videoPresentation && !captionedAudio && adapter !== 'hls';
            const player = document.createElement(audioLayout ? 'tyl-audio-player' : 'video-player');
            let nextMedia;
            this.trackRoot(player, () => player.destroy(), () => nextMedia?.pause());
            const skin = document.createElement(audioLayout ? 'audio-skin' : 'tyl-video-skin');
            const locale = document.createElement('media-i18n');
            const wrapper = document.createElement('div');
            wrapper.classList.add('tylVideoPlayer', 'tylVideoPlayer--videojs10');
            wrapper.dataset.viewType = audioLayout ? 'audio' : 'video';
            wrapper.dataset.captionRenderer = adapter === 'youtube' ? 'provider' : 'native';
            wrapper.dataset.pipDisabled = audio || media.hasAttribute('disablepictureinpicture') ? 'true' : 'false';
            wrapper.dataset.airplayDisabled = media.hasAttribute('disableremoteplayback')
                || media.getAttribute('x-webkit-airplay')?.toLowerCase() === 'deny' ? 'true' : 'false';
            this.copyMediaStyle(media, wrapper);
            const authoredTitle = this.mediaTitle(media);
            player.setAttribute('content-title', authoredTitle || config.translations[audio ? 'Audio' : 'Playback']);
            if (media.hasAttribute('poster')) player.setAttribute('poster', media.getAttribute('poster'));
            if (!audioLayout && media.hasAttribute('crossorigin')) skin.shadowRoot.querySelector('media-poster img').setAttribute('crossorigin', media.getAttribute('crossorigin'));
            const authoredLabel = media.getAttribute('aria-label');
            if (authoredLabel) skin.shadowRoot.querySelector('media-container').setAttribute('aria-label', authoredLabel);
            if (adapter === 'youtube' || adapter === 'hls' || captionedAudio || (audio && this.options.videoPresentation))
            {
                nextMedia = document.createElement(adapter === 'youtube' ? 'youtube-video' : adapter === 'hls' ? 'hlsjs-video' : 'video');
                this.trackMedia(nextMedia, adapter === 'youtube' || adapter === 'hls');
                nextMedia.setAttribute('preload', 'none');
                nextMedia.setAttribute('playsinline', '');
                if (adapter === 'youtube')
                {
                    // Keyboard focus belongs to the skin's fullscreen container, not the
                    // cross-origin iframe whose key events cannot reach the forum player.
                    nextMedia.target.tabIndex = -1;
                    nextMedia.target.setAttribute('aria-hidden', 'true');
                    // Apply before assigning the source so the first embed request identifies
                    // the forum without sharing the thread URL or its query parameters.
                    for (const attribute of ['allow', 'allowfullscreen'])
                    {
                        if (media.hasAttribute(attribute)) nextMedia.target.setAttribute(attribute, media.getAttribute(attribute));
                        else nextMedia.target.removeAttribute(attribute);
                    }
                    nextMedia.target.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
                }
                for (const attribute of [...mediaAttributes, 'loop'])
                {
                    if (media.hasAttribute(attribute)) nextMedia.setAttribute(attribute, media.getAttribute(attribute));
                }
                if (audio) nextMedia.setAttribute('disablepictureinpicture', '');
                // The HLS component's native media slot keeps WebVTT cues styleable by the forum stylesheet.
                let trackTarget = nextMedia;
                if (adapter === 'hls')
                {
                    trackTarget = document.createElement('video');
                    trackTarget.setAttribute('data-ta-video-ad-ignore', '1');
                    trackTarget.setAttribute('slot', 'media');
                    trackTarget.setAttribute('playsinline', '');
                    trackTarget.setAttribute('preload', 'none');
                    for (const attribute of [...mediaAttributes, 'loop'])
                    {
                        if (nextMedia.hasAttribute(attribute)) trackTarget.setAttribute(attribute, nextMedia.getAttribute(attribute));
                    }
                    nextMedia.append(trackTarget);
                }
                for (const track of media.querySelectorAll('track'))
                {
                    trackTarget.append(track.cloneNode(true));
                }
                this.copyTrackSelection(media, trackTarget);
                if (adapter === 'youtube' && this.options.playlist)
                {
                    // Use Video.js's native playlist source rather than its single-video cue path.
                    const playlistUrl = new URL('https://www.youtube-nocookie.com/embed/videoseries');
                    playlistUrl.searchParams.set('list', this.options.playlist);
                    const initialPosition = new AbortController();
                    this.onCleanup(() => initialPosition.abort());
                    let playlistControls = null;
                    const videoId = parseYouTubeVideoId(src);
                    const alignStart = () =>
                    {
                        const engine = nextMedia.adapter.engine;
                        if (!nextMedia.isConnected || !engine || nextMedia.readyState < 1) return;
                        const items = engine.getPlaylist();
                        if (!Array.isArray(items) || items.length === 0) return;
                        initialPosition.abort();
                        const options = {
                            list: this.options.playlist,
                            listType: 'playlist',
                            index: Math.max(0, items.indexOf(videoId)),
                            startSeconds: this.options.start,
                        };
                        // Metadata can arrive after a visitor presses Play. Preserve that intent.
                        const state = engine.getPlayerState();
                        if ((state === 1 || state === 3) && !nextMedia.paused && !this.scope.overlayHidden) engine.loadPlaylist(options);
                        else engine.cuePlaylist(options);
                    };
                    if (videoId || this.options.start > 0)
                    {
                        for (const event of ['loadedmetadata', 'durationchange', 'playing'])
                        {
                            this.listen(nextMedia, event, alignStart, { signal: initialPosition.signal });
                        }
                        this.listen(nextMedia, 'error', () =>
                        {
                            // SDK startup can be retried before an item exists. Preserve its initial position.
                            if (Number.isFinite(nextMedia.error?.data?.youtubeErrorCode)) initialPosition.abort();
                        }, {
                            signal: initialPosition.signal,
                        });
                    }
                    else
                    {
                        initialPosition.abort();
                    }
                    let playlistEngine = null;
                    let stopPlaylistEvents = () => {};
                    let metadataTitle = player.getAttribute('content-title');
                    const updatePlaylistMetadata = index =>
                    {
                        if (authoredTitle || player.getAttribute('content-title') !== metadataTitle || player.contentTitle !== metadataTitle) return;
                        const status = playlistControls.querySelector('[data-tyl-playlist-status]');
                        metadataTitle = !playlistControls.hidden && Number.isInteger(index) && index >= 0
                            ? status.dataset.itemLabel.replace(/\{number\}/g, String(index + 1))
                            : config.translations.Playback;
                        player.setAttribute('content-title', metadataTitle);
                    };
                    this.onCleanup(() => stopPlaylistEvents());
                    this.listen(nextMedia, 'loadedmetadata', () =>
                    {
                        const engine = nextMedia.adapter.engine;
                        if (!engine) return;
                        updatePlaylistMetadata(engine.getPlaylistIndex());
                        if (engine === playlistEngine) return;
                        stopPlaylistEvents();
                        playlistEngine = engine;
                        stopPlaylistEvents = this.listenYouTube(nextMedia, engine, 'onStateChange', ({ data: state }) =>
                        {
                            if (!nextMedia.isConnected || nextMedia.adapter.engine !== engine) return;
                            if (!initialPosition.signal.aborted) alignStart();
                            if (state === 1 || state === 5)
                            {
                                updatePlaylistMetadata(engine.getPlaylistIndex());
                                this.announcePlaylistItem(playlistControls, engine.getPlaylistIndex());
                            }
                        });
                    });
                    playlistControls = this.addPlaylistControls(skin, nextMedia, 'loadedmetadata', direction =>
                    {
                        if (!this.coordinatePlayback(config)) return Promise.resolve();
                        // A manual choice wins over a delayed initial-position adjustment.
                        initialPosition.abort();
                        const engine = nextMedia.adapter.engine;
                        if (direction === 'previous') engine.previousVideo();
                        else engine.nextVideo();
                        return nextMedia.play();
                    }, () => Number.isFinite(nextMedia.error?.data?.youtubeErrorCode));
                    playlistControls.slot = 'tyl-playlist-controls';
                    nextMedia.source = {
                        src: playlistUrl.href,
                        engine: { youtube: {
                            list: this.options.playlist,
                            listType: 'playlist',
                            origin: window.location.origin,
                            hl: document.documentElement.lang,
                            start: this.options.start,
                            disablekb: 1,
                        } },
                    };
                    this.listen(nextMedia, 'sourcechange', () =>
                    {
                        initialPosition.abort();
                        const src = nextMedia.source?.src || '';
                        const list = src ? new URL(src, document.baseURI).searchParams.get('list') : null;
                        this.setPlaylistSource(skin, playlistControls, list);
                        updatePlaylistMetadata(-1);
                    });
                }
                else if (adapter === 'youtube')
                {
                    nextMedia.source = { src, engine: { youtube: {
                        origin: window.location.origin,
                        hl: document.documentElement.lang,
                        start: this.options.start,
                        disablekb: 1,
                    } } };
                }
                else if (adapter === 'hls')
                {
                    // Preserve the MIME hint instead of reclassifying the stream by its URL.
                    nextMedia.source = { src, type: type || 'application/vnd.apple.mpegurl' };
                }
                else
                {
                    nextMedia.setAttribute('src', src);
                }
            }
            else
            {
                nextMedia = this.cloneMedia(media);
                this.trackMedia(nextMedia, false);
                nextMedia.removeAttribute('data-xf-init');
                nextMedia.removeAttribute('controls');
                nextMedia.removeAttribute('autoplay');
                nextMedia.removeAttribute('style');
                nextMedia.setAttribute('preload', 'none');
                nextMedia.setAttribute('playsinline', '');
            }
            nextMedia.dataset.tylPlayerMedia = '';
            nextMedia.setAttribute('data-ta-video-ad-ignore', '1');
            if (media instanceof HTMLMediaElement)
            {
                nextMedia.volume = media.volume;
                nextMedia.muted = media.muted;
                nextMedia.playbackRate = media.playbackRate;
                if (nextMedia instanceof HTMLMediaElement) nextMedia.defaultPlaybackRate = media.playbackRate;
                nextMedia.currentTime = media.currentTime;
                if (adapter === 'hls')
                {
                    // The public media slot replaces the component's initial internal target.
                    nextMedia.target.volume = media.volume;
                    nextMedia.target.muted = media.muted;
                    nextMedia.target.playbackRate = media.playbackRate;
                    nextMedia.target.defaultPlaybackRate = media.playbackRate;
                    nextMedia.target.currentTime = media.currentTime;
                }
            }
            // Chapter cues must load even before the visitor selects a subtitle track.
            for (const track of nextMedia.querySelectorAll('track[kind="chapters"]'))
            {
                track.default = true;
            }
            this.listen(nextMedia, 'play', () =>
            {
                // HTML media can deliver a queued play event after a newer pause.
                if (!nextMedia.paused) this.coordinatePlayback(config);
            });
            this.listen(nextMedia, 'tyl-player-play-request', event => this.coordinatePlayback(config, event));
            this.listen(nextMedia, 'tyl-player-pause-request', () =>
            {
                if (!this.scope.pausingForAd)
                {
                    this.scope.playbackRequested = false;
                    this.scope.ads?.pause();
                }
            });
            for (const event of ['sourcechange', 'loadstart', 'emptied']) this.listen(nextMedia, event, () => this.scope.checkAdSource?.());
            this.listen(nextMedia, 'ratechange', () =>
            {
                const target = adapter === 'hls' ? nextMedia.target : nextMedia;
                if (target instanceof HTMLMediaElement) target.defaultPlaybackRate = nextMedia.playbackRate;
            });

            skin.append(nextMedia);
            player.append(skin);
            if (audioLayout)
            {
                const airplay = document.createElement('media-airplay-button');
                airplay.className = 'button button--small tylVideoPlayerAudioAirPlay';
                airplay.textContent = config.translations.AirPlay;
                airplay.hidden = true;
                airplay.disabled = wrapper.dataset.airplayDisabled === 'true';
                player.append(airplay);
            }
            locale.append(player);
            wrapper.append(locale);
            if (!media.isConnected || this.sourceSignature(media) !== sourceSignature || !this.canEnhanceWithAds(media)) return;
            const readSource = () => JSON.stringify([nextMedia.getAttribute('src'), nextMedia.getAttribute('type'),
                (adapter === 'hls' || adapter === 'youtube') ? [nextMedia.source?.src ?? '', nextMedia.source?.type ?? ''] : null,
                ...Array.from(nextMedia.querySelectorAll('source'), source => [source.getAttribute('src'), source.getAttribute('type')])]);
            const preparedSource = readSource();
            this.setupAds(media, skin, () => nextMedia.play(), () => nextMedia.pause(), config,
                () => ({ volume: nextMedia.volume, muted: nextMedia.muted }), state =>
                {
                    nextMedia.volume = state.volume;
                    nextMedia.muted = state.muted;
                }, readSource, getDeepActiveElement);
            const resumePlayback = (this.scope.pendingPlay && this.scope.pendingPlaySource === this.mediaSourceSignature(media))
                || (media instanceof HTMLMediaElement && !media.paused && !media.ended);
            this.scope.playbackRequested = resumePlayback;
            if (media instanceof HTMLMediaElement)
            {
                media.pause();
            }
            this.replaceMedia(media, wrapper);
            if (resumePlayback && this.scope.playbackRequested && !this.scope.overlayHidden && readSource() === preparedSource)
            {
                // Native player discovery and custom-media slot attachment run in a microtask.
                queueMicrotask(() =>
                {
                    if (!this.scope.playbackRequested || this.scope.disposed || this.scope.overlayHidden
                        || !nextMedia.isConnected || readSource() !== preparedSource) return;
                    nextMedia.play().catch(error =>
                    {
                        if (!this.scope.disposed && error.name !== 'AbortError') console.error('[TylerAustin/VideoPlayer] Unable to resume attachment playback.', error);
                    });
                });
            }
        },

        mediaTitle (media)
        {
            const title = media.getAttribute('title') || '';
            return title === media.getAttribute('data-tyl-fallback-title') ? '' : title;
        },

        copyMediaStyle (media, target)
        {
            // Individual CSSOM properties work with style-src-attr restrictions;
            // cssText would recreate a blocked inline style attribute.
            for (const property of Array.from(media.style))
            {
                target.style.setProperty(property, media.style.getPropertyValue(property), media.style.getPropertyPriority(property));
            }
        },

        replaceMedia (media, player)
        {
            let parent = media.parentElement;
            if (parent?.classList.contains('bbMediaWrapper-inner'))
            {
                // Use an owned marker so Vidstack does not depend on CSS :has().
                parent.classList.add('tylVideoPlayerInner');
                const observer = new MutationObserver(() =>
                {
                    if (this.scope.disposed) return;
                    const next = player.parentElement;
                    const current = next?.classList.contains('bbMediaWrapper-inner') ? next : null;
                    if (current === parent) return;
                    observer.disconnect();
                    if (parent && !parent.querySelector('[data-tyl-player-root]')) parent.classList.remove('tylVideoPlayerInner');
                    parent = current;
                    if (parent)
                    {
                        parent.classList.add('tylVideoPlayerInner');
                        observer.observe(parent, { childList: true });
                    }
                });
                observer.observe(parent, { childList: true });
                this.onCleanup(() =>
                {
                    observer.disconnect();
                    if (parent && !parent.querySelector('[data-tyl-player-root]')) parent.classList.remove('tylVideoPlayerInner');
                    parent = null;
                });
            }
            media.replaceWith(player);
            this.scope.committed = true;
        },

        mediaSourceSignature (media)
        {
            return JSON.stringify([media.hasAttribute('src') ? media.src : null, media.getAttribute('type'),
                ...Array.from(media.querySelectorAll('source'), source => [source.src, source.getAttribute('type'), source.getAttribute('media')])]);
        },

        sourceSignature (media)
        {
            return JSON.stringify([media.getAttribute('src'), media.getAttribute('poster'), media.getAttribute('style'), media.getAttribute('title'), media.getAttribute('data-tyl-fallback-title'), media.getAttribute('aria-label'), media.getAttribute('crossorigin'), media.getAttribute('referrerpolicy'), ...['allow', 'allowfullscreen', 'sandbox', 'csp', 'credentialless', 'srcdoc'].map(attribute => media.getAttribute(attribute)), media.hasAttribute('loop'), ...Array.from(media.querySelectorAll('source, track'), item =>
                [item.localName, item.getAttribute('src'), item.getAttribute('type'), item.getAttribute('kind'), item.getAttribute('srclang'), item.getAttribute('label'), item.getAttribute('id'), item.hasAttribute('default')])]);
        },

        cloneMedia (media)
        {
            const copy = media.cloneNode(true);
            copy.setAttribute('data-ta-video-ad-ignore', '1');
            copy.removeAttribute('data-tyl-gallery-player');
            copy.removeAttribute('data-tyl-player-attachment');
            copy.removeAttribute('data-tyl-player-lightbox');
            this.copyTrackSelection(media, copy);
            // Vidstack selects chapter tracks through its native default-track path.
            for (const track of copy.querySelectorAll('track[kind="chapters"]')) track.default = true;
            return copy;
        },

        copyTrackSelection (media, copy)
        {
            if (media instanceof HTMLMediaElement && media.readyState >= 1)
            {
                const tracks = media.querySelectorAll('track');
                copy.querySelectorAll('track').forEach((track, index) =>
                {
                    if (['captions', 'subtitles'].includes(track.kind))
                    {
                        track.default = tracks[index].track.mode === 'showing';
                        track.track.mode = tracks[index].track.mode;
                    }
                });
            }
        },

        listen (target, type, listener, options = {})
        {
            const signal = this.scope.events.signal;
            const { signal: requestedSignal, ...settings } = options;
            if (signal.aborted || requestedSignal?.aborted) return;
            target.addEventListener(type, listener, { ...settings, signal });
            if (requestedSignal)
            {
                requestedSignal.addEventListener('abort', () =>
                {
                    target.removeEventListener(type, listener, settings.capture || false);
                }, { once: true, signal });
            }
        },

        onCleanup (callback)
        {
            if (this.scope.disposed) callback();
            else this.scope.cleanups.push(callback);
        },

        listenYouTube (media, engine, type, listener)
        {
            engine.addEventListener(type, listener);
            return () =>
            {
                if (media.adapter.engine === engine) engine.removeEventListener(type, listener);
            };
        },

        trackRoot (root, destroyRoot, pause)
        {
            this.scope.root = root;
            this.scope.destroyRoot = destroyRoot;
            this.scope.pause = () =>
            {
                this.scope.playbackRequested = false;
                this.scope.ads?.pause();
                return pause();
            };
            root.setAttribute('data-tyl-player-root', '');
            this.listen(root, 'tyl-player-pause', () =>
            {
                try { this.scope.pause(); }
                catch (error) { console.error('[TylerAustin/VideoPlayer] Unable to pause another player.', error); }
            });
            this.listen(root, 'tyl-player-dispose', () => this.disposePlayer(false), { once: true });
        },

        coordinatePlayback (config, event, adPlayback = false)
        {
            const { root, disposed, overlayHidden, pause } = this.scope;
            if (event?.defaultPrevented) return false;
            if (disposed || !root?.isConnected || overlayHidden)
            {
                event?.preventDefault();
                if (!disposed) pause();
                return false;
            }
            this.scope.playbackRequested = true;
            if (config.pauseOthers)
            {
                // Discover live roots at each request, including dynamically inserted audio.
                // Each handler owns its provider pause and aborts this listener on disposal.
                for (const other of document.querySelectorAll('[data-tyl-player-root]'))
                {
                    if (other !== root) other.dispatchEvent(new Event('tyl-player-pause'));
                }
            }
            if (!this.scope.playbackRequested || this.scope.disposed || !root.isConnected || this.scope.overlayHidden)
            {
                event?.preventDefault();
                return false;
            }
            if (!adPlayback && this.scope.beginAds && !this.scope.adsComplete)
            {
                if (this.scope.beginAds())
                {
                    event?.preventDefault();
                    return false;
                }
            }
            return true;
        },

        canEnhanceWithAds (media)
        {
            if (!(media instanceof HTMLVideoElement) || this.options.mediaType === 'audio') return true;
            const configured = document.querySelector('[data-xf-init~="ta-video-ad-loader"][data-vast-url]');
            // An older or failed VideoAds asset must keep its native ad-capable player.
            if (configured && XF.TaVideoAd?.version !== 1) return false;
            return !XF.TaVideoAd || XF.TaVideoAd.canEnhance(media);
        },

        setupAds (media, host, play, pause, config, readMediaState, updateMediaState, readSource, readFocusedElement = () => document.activeElement)
        {
            if (!(media instanceof HTMLVideoElement) || this.options.mediaType === 'audio' || !XF.TaVideoAd) return;
            const layer = document.createElement('div');
            layer.className = 'tylVideoPlayerAd';
            layer.hidden = true;
            layer.setAttribute('role', 'group');
            layer.setAttribute('aria-label', config.translations.Playback);
            if (host.localName === 'tyl-video-skin') layer.slot = 'tyl-video-ad';
            host.append(layer);
            for (const type of ['keydown', 'keyup'])
            {
                this.listen(layer, type, event =>
                {
                    // Native button activation stays available without also seeking or
                    // toggling the paused content through its player's shortcuts.
                    if (event.key !== 'Escape') event.stopPropagation();
                });
            }
            let inertNodes = [];
            let previousFocus = null;
            let adHadFocus = false;
            const contentSource = readSource();
            const pauseContent = () =>
            {
                this.scope.pausingForAd = true;
                try { return pause(); }
                finally { this.scope.pausingForAd = false; }
            };
            this.listen(document, 'focusin', event => { adHadFocus = event.composedPath().includes(layer); });
            const restoreControls = () =>
            {
                for (const [node, inert] of inertNodes) node.inert = inert;
                inertNodes = [];
                layer.hidden = true;
                if (adHadFocus && previousFocus?.isConnected && !this.scope.disposed) previousFocus.focus({ preventScroll: true });
                adHadFocus = false;
            };
            this.scope.checkAdSource = () =>
            {
                if (readSource() === contentSource) return;
                const session = this.scope.ads;
                this.scope.ads = null;
                this.scope.adsComplete = true;
                session?.dispose();
                restoreControls();
            };
            this.onCleanup(() =>
            {
                this.scope.ads?.dispose();
                this.scope.ads = null;
                restoreControls();
                layer.remove();
            });
            this.listen(this.scope.root, 'keydown', event =>
            {
                if (this.scope.ads && !event.composedPath().includes(layer))
                {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            }, { capture: true });
            this.scope.beginAds = () =>
            {
                const requestedSource = readSource();
                const root = this.scope.root;
                const isCurrent = () => !this.scope.disposed && this.scope.root === root
                    && root?.isConnected && !this.scope.overlayHidden
                    && this.scope.playbackRequested && readSource() === requestedSource;
                const discardSession = session =>
                {
                    if (session && this.scope.ads === session)
                    {
                        this.scope.ads = null;
                        restoreControls();
                    }
                    session?.dispose();
                    if (!this.scope.ads) layer.hidden = true;
                };
                // Source properties can change before native load events are delivered.
                // The ad context belongs to the original content captured at setup.
                this.scope.checkAdSource();
                if (!isCurrent()) return true;
                if (this.scope.adsComplete) return false;
                if (this.scope.ads)
                {
                    const session = this.scope.ads;
                    pauseContent();
                    if (!isCurrent() || this.scope.ads !== session || this.scope.adsComplete || session.disposed)
                    {
                        discardSession(session);
                        return true;
                    }
                    session.play();
                    return true;
                }
                layer.hidden = false;
                let session;
                const ownsSession = () => session && this.scope.ads === session && !session.disposed
                    && !this.scope.adsComplete && !this.scope.disposed && this.scope.root === root
                    && root?.isConnected && !this.scope.overlayHidden && readSource() === contentSource;
                try
                {
                    session = XF.TaVideoAd.createSession(media, layer, () =>
                    {
                        this.scope.checkAdSource();
                        if (!ownsSession()) return false;
                        const allowed = this.coordinatePlayback(config, null, true);
                        // Pause-others callbacks may change this player's source too.
                        this.scope.checkAdSource();
                        return allowed && ownsSession();
                    },
                        { ...readMediaState(), onVolumeChange: updateMediaState });
                }
                catch (error)
                {
                    if (!this.scope.ads) layer.hidden = true;
                    if (isCurrent() && !this.scope.ads && !this.scope.adsComplete) pauseContent();
                    console.error('[TylerAustin/VideoPlayer] Unable to initialize the ad session.', error);
                    return true;
                }
                // XF.ajax can synchronously publish ajax:send inside createSession.
                // A newer Pause, source, session or disposal must win that handoff.
                if (!isCurrent() || this.scope.ads || this.scope.adsComplete || session?.disposed)
                {
                    discardSession(session);
                    return true;
                }
                if (!session)
                {
                    layer.hidden = true;
                    this.scope.adsComplete = true;
                    return false;
                }
                this.scope.ads = session;
                pauseContent();
                // Provider pause requests can synchronously invalidate this session.
                if (!isCurrent() || this.scope.ads !== session || this.scope.adsComplete || session.disposed)
                {
                    discardSession(session);
                    return true;
                }
                previousFocus = readFocusedElement();
                const controls = host.shadowRoot?.querySelector('media-container') || host;
                for (const node of controls.children)
                {
                    if (node === layer || (node.localName === 'slot' && node.name === 'tyl-video-ad')) continue;
                    inertNodes.push([node, node.inert]);
                    node.inert = true;
                }
                session.finished.then(result =>
                {
                    if (this.scope.ads !== session) return;
                    this.scope.ads = null;
                    this.scope.adsComplete = !session.disposed;
                    restoreControls();
                    if (result.resume && this.scope.playbackRequested && readSource() === contentSource
                        && !this.scope.disposed && !this.scope.overlayHidden && this.scope.root?.isConnected)
                    {
                        play().catch(error =>
                        {
                            if (!this.scope.disposed && error.name !== 'AbortError') console.error('[TylerAustin/VideoPlayer] Unable to resume content after an ad.', error);
                        });
                    }
                });
                return true;
            };
        },

        trackMedia (media, component)
        {
            this.scope.releaseMedia = () =>
            {
                if (component)
                {
                    // The component owns adapter teardown and subsequent target unloading.
                    media.adapter.destroy();
                    return;
                }
                const target = media;
                if (target instanceof HTMLMediaElement)
                {
                    target.pause();
                    target.removeAttribute('src');
                    for (const source of target.querySelectorAll('source')) source.removeAttribute('src');
                    target.load();
                }
            };
            if (component)
            {
                this.listen(media, 'tyl-player-media-dispose', () =>
                {
                    // The component is already entering its native adapter destroy.
                    // Let that call finish before its iframe/media target is changed.
                    this.scope.releaseMedia = null;
                    this.disposePlayer(true);
                }, { once: true });
            }
        },

        disposePlayer (destroyRoot)
        {
            const scope = this.scope;
            if (!scope || scope.disposed) return;
            scope.disposed = true;
            scope.playbackRequested = false;
            scope.root?.removeAttribute('data-tyl-player-root');
            scope.events.abort();
            const callbacks = scope.cleanups.splice(0);
            if (scope.releaseMedia) callbacks.push(scope.releaseMedia);
            if (destroyRoot && scope.destroyRoot) callbacks.push(scope.destroyRoot);
            scope.releaseMedia = null;
            scope.destroyRoot = null;
            scope.pause = null;
            scope.root = null;
            for (const callback of callbacks)
            {
                try { callback(); }
                catch (error) { console.error('[TylerAustin/VideoPlayer] Player cleanup failed.', error); }
            }
        },

        supportsCustomPlayer (engine)
        {
            // Check required browser capabilities before imports or suspending XF's iframe.
            // Optional APIs (popover, PiP, AirPlay, constructed stylesheets) retain native fallbacks.
            if (!window.customElements || !HTMLElement.prototype.attachShadow || !window.AbortController) return false;
            if (engine === 'vidstack') return !!window.ResizeObserver && !!window.IntersectionObserver;
            return !!window.CSS?.supports
                && CSS.supports('selector(:has(*))')
                && CSS.supports('container-type', 'inline-size')
                && CSS.supports('color', 'color-mix(in srgb, black, white)')
                && CSS.supports('color', 'oklch(0% 0 0)');
        },

        supportsNativeHLS ()
        {
            return document.createElement('video').canPlayType('application/vnd.apple.mpegurl') !== '';
        },

        activateNativeFallback (media, iframeSrc = null)
        {
            if (media instanceof HTMLIFrameElement)
            {
                if (iframeSrc && !media.hasAttribute('src')) media.setAttribute('src', iframeSrc);
                return;
            }
            // XFMG and Fancybox can present audio in a video element. Audio has
            // no first video frame for XF's iOS poster initializer to capture.
            if (!(media instanceof HTMLVideoElement) || this.options.mediaType === 'audio') return;
            const init = media.getAttribute('data-xf-init') || 'tyl-video-player';
            media.setAttribute('data-xf-init', init.replace('tyl-video-player', 'video-init'));
            if (media.isConnected) XF.activate(media);
        },

        addPlaylistControls (player, readyTarget, readyEvent, navigate, canNavigateAfterError)
        {
            player.setAttribute('data-tyl-playlist', '');
            const template = document.querySelector('.js-tylYouTubePlaylistControls');
            const controls = template.content.firstElementChild.cloneNode(true);
            const activate = () => { controls.dataset.tylInteracted = 'true'; };
            for (const type of ['focusin', 'pointerdown', 'keydown', 'click'])
            {
                this.listen(player, type, activate, { capture: true });
            }
            const buttons = controls.querySelectorAll('button');
            for (const button of buttons)
            {
                this.listen(button, 'click', event =>
                {
                    event.stopPropagation();
                    try
                    {
                        navigate(button.dataset.direction).catch(error =>
                        {
                            if (!this.scope.disposed && error.name !== 'AbortError') console.error('[TylerAustin/VideoPlayer] Playlist navigation failed.', error);
                        });
                    }
                    catch (error)
                    {
                        console.error('[TylerAustin/VideoPlayer] Playlist navigation failed.', error);
                    }
                });
            }
            this.listen(readyTarget, readyEvent, () =>
            {
                for (const button of buttons) button.disabled = false;
            });
            this.listen(readyTarget, 'error', event =>
            {
                // A real SDK item error still leaves Previous/Next usable, including
                // when the first item fails before the normal readiness event.
                if (canNavigateAfterError(event))
                {
                    for (const button of buttons) button.disabled = false;
                }
            });
            // An unavailable item must not disable navigation to another playlist item.
            this.listen(readyTarget, 'emptied', () =>
            {
                for (const button of buttons) button.disabled = true;
            });
            this.setPlaylistSource(player, controls, this.options.playlist);
            player.append(controls);
            return controls;
        },

        setPlaylistSource (player, controls, list)
        {
            controls.hidden = !list;
            player.toggleAttribute('data-tyl-playlist', Boolean(list));
            if (list)
            {
                const url = new URL('https://www.youtube.com/playlist');
                url.searchParams.set('list', list);
                controls.querySelector('a').href = url.href;
            }
            else for (const button of controls.querySelectorAll('button')) button.disabled = true;
        },

        announcePlaylistItem (controls, item)
        {
            if (!controls?.isConnected || controls.dataset.tylInteracted !== 'true') return;
            const status = controls.querySelector('[data-tyl-playlist-status]');
            const label = typeof item === 'number'
                ? Number.isInteger(item) && item >= 0 ? status.dataset.itemLabel.replace(/\{number\}/g, String(item + 1)) : ''
                : typeof item === 'string' ? item.trim() : '';
            if (label && status.textContent !== label) status.replaceChildren(document.createTextNode(label));
        },

        addVidstackErrorAlert (player, message)
        {
            const alert = document.createElement('span');
            alert.className = 'tylVideoPlayerAnnounce';
            alert.setAttribute('role', 'alert');
            alert.setAttribute('aria-atomic', 'true');
            player.append(alert);
            this.listen(player, 'error', () =>
            {
                alert.replaceChildren(document.createTextNode(message));
            });
            for (const type of ['source-change', 'can-play', 'playing'])
            {
                this.listen(player, type, () =>
                {
                    if (!player.state.error) alert.replaceChildren();
                });
            }
        },
    });

    XF.Element.register('tyl-video-player', 'XF.TylVideoPlayer');

    const discoverPlayers = root =>
    {
        if (!root?.querySelectorAll) return;
        const configElement = document.querySelector('.js-tylVideoPlayerConfig');
        if (!configElement) return;
        const config = XF.applyDataOptions({ engine: 'xf', youtube: false }, configElement.dataset);
        if (!['vidstack', 'videojs10'].includes(config.engine)) return;

        // Markers come from native authorized attachment and XFMG playback markup.
        // Independent add-on handlers stay on the original; video-init is the fallback.
        const selector = 'video[data-tyl-gallery-player], video[data-tyl-player-attachment], audio[data-tyl-player-attachment], video[data-tyl-player-lightbox]';
        const mediaElements = Array.from(root.querySelectorAll(selector));
        if (root instanceof HTMLMediaElement && root.matches(selector)) mediaElements.unshift(root);
        for (const media of mediaElements)
        {
            if (!media.isConnected || media.closest('[data-tyl-player-root], .tylVideoPlayer')) continue;
            if (XF.Element.getHandler(media, 'tyl-video-player')) continue;
            const gallery = media.getAttribute('data-tyl-gallery-player');
            const lightbox = media.getAttribute('data-tyl-player-lightbox');
            const mediaType = gallery || lightbox || media.getAttribute('data-tyl-player-attachment');
            XF.Element.applyHandler(media, 'tyl-video-player', { mediaType, videoPresentation: (gallery || lightbox) === 'audio' });
        }

        if (!config.youtube) return;
        const frames = Array.from(root.querySelectorAll('iframe[src]'));
        if (root instanceof HTMLIFrameElement && root.hasAttribute('src')) frames.unshift(root);
        for (const frame of frames)
        {
            if (!frame.isConnected || ['sandbox', 'csp', 'credentialless', 'srcdoc'].some(attribute => frame.hasAttribute(attribute))
                || frame.closest('[data-tyl-player-root], .tylVideoPlayer')) continue;
            let url;
            try { url = new URL(frame.getAttribute('src'), document.baseURI); }
            catch { continue; }
            if (url.protocol !== 'https:' || url.port || url.username || url.password
                || !['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com'].includes(url.hostname)) continue;
            const match = /^\/embed\/([A-Za-z0-9_-]{11}|videoseries)\/?$/.exec(url.pathname);
            if (!match) continue;
            const candidate = url.searchParams.get('list') || '';
            const playlist = /^[A-Za-z0-9_-]{2,256}$/.test(candidate) ? candidate : '';
            if (match[1] === 'videoseries' && !playlist) continue;
            if (XF.Element.getHandler(frame, 'tyl-video-player')) continue;
            const requestedStart = Number(url.searchParams.get('start') || url.searchParams.get('t') || 0);
            const start = Number.isFinite(requestedStart) && requestedStart >= 0 ? requestedStart : 0;
            const src = new URL('https://www.youtube-nocookie.com/embed/' + match[1]);
            if (playlist) src.searchParams.set('list', playlist);
            if (start) src.searchParams.set('t', String(start));

            // Third-party movie lists can render bare iframes outside XF's responsive wrapper.
            if (!frame.closest('.bbMediaWrapper-inner'))
            {
                const wrapper = document.createElement('div');
                wrapper.className = 'bbMediaWrapper bbMediaWrapper--inline';
                const inner = document.createElement('div');
                inner.className = 'bbMediaWrapper-inner';
                const width = frame.getAttribute('width');
                if (width && /^\d+$/.test(width)) wrapper.style.width = Number(width) + 'px';
                wrapper.style.maxWidth = '100%';
                frame.replaceWith(wrapper);
                wrapper.append(inner);
                inner.append(frame);
            }
            // Discover only real, rendered iframe sources; consent placeholders stay native.
            XF.Element.applyHandler(frame, 'tyl-video-player', { mediaType: 'youtube', src: src.href, playlist, start });
        }
    };

    const discoverLightboxPlayer = event =>
    {
        const { slide } = event;
        const trigger = slide?.triggerEl;
        const mediaType = trigger?.getAttribute('data-tyl-player-lightbox');
        const configElement = document.querySelector('.js-tylVideoPlayerConfig');
        const config = configElement && XF.applyDataOptions({ engine: 'xf', audio: false, video: false }, configElement.dataset);
        if (['vidstack', 'videojs10'].includes(config?.engine) && config[mediaType]
            && slide?.el?.isConnected && ['audio', 'video'].includes(mediaType))
        {
            // Fancybox owns the content container and supplies this real media node.
            // Keep that container in place while the existing player handler replaces its child.
            const media = slide.el.querySelector('video.fancybox__html5video');
            if (media && !media.closest('[data-tyl-player-root], .tylVideoPlayer')
                && !XF.Element.getHandler(media, 'tyl-video-player'))
            {
                media.setAttribute('data-tyl-player-lightbox', mediaType);
                media.setAttribute('data-video-type', mediaType);
                media.setAttribute('data-source-type', trigger.getAttribute('data-video-format') || '');
                media.setAttribute('data-ta-video-ad-content-type', trigger.getAttribute('data-ta-video-ad-content-type') || '');
                media.setAttribute('title', trigger.getAttribute('title') || media.getAttribute('title') || '');
                if (!media.hasAttribute('preload')) media.setAttribute('preload', 'none');
                if (!media.closest('.tylVideoPlayerLightbox'))
                {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'bbMediaWrapper bbMediaWrapper--inline tylVideoPlayerLightbox';
                    const inner = document.createElement('div');
                    inner.className = 'bbMediaWrapper-inner';
                    media.replaceWith(wrapper);
                    wrapper.append(inner);
                    inner.append(media);
                    slide.contentEl.classList.add('tylVideoPlayerLightboxContent');
                }
            }
        }
        discoverPlayers(slide?.el);
    };

    XF.on(document, 'xf:reinit', event => discoverPlayers(event.element));
    for (const type of ['lightbox:loaded', 'lightbox:reveal', 'lightbox:done'])
    {
        XF.on(document, type, discoverLightboxPlayer);
    }
    XF.ready(() => discoverPlayers(document));
})(window, document);
