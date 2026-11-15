# [TylerAustin] Video Player - XF2

Choose Video.js 10, XenForo default playback, or Vidstack for uploaded audio, uploaded video, and YouTube video and playlist embeds.

With Vidstack or Video.js 10 selected, existing and new posts automatically use that player for full-size audio/video attachments and YouTube video and playlist embeds. Uploaded Media Gallery audio/video pages, album lightboxes, Resource Manager descriptions and updates, and rendered YouTube embeds in third-party movie templates are also supported. Attachment URLs, permissions, and stored post content remain managed by XenForo. Choose XenForo default to restore its original players.

## Key Features

- Select Video.js 10, XenForo default, or Vidstack in the Player library setting. Vidstack remains the default.
- Custom players enhance full-size video and audio attachments in threads and posts while preserving XenForo attachment permissions. Authorized audio/video preview links in attachment lists and non-full-size BB-code attachments also open in XenForo's native lightbox using the selected player. Image previews and ordinary file downloads keep their native behavior.
- Uploaded Media Gallery audio/video pages and lightboxes use the selected player, including media opened from albums, while retaining native media URLs, posters and access checks. Gallery audio keeps its poster/video presentation. Media Gallery is optional.
- Resource Manager descriptions and updates use the same authorized attachment, direct-media BB-code and YouTube hooks. Resource Manager is optional; downloadable resource archives remain downloads.
- Optional [TylerAustin] Video Ads integration supplies VAST pre-rolls for eligible uploaded/direct video through a separate ad layer, retaining the content provider, captions, chapter tracks and appearance settings. Audio has no video pre-roll and YouTube advertising remains provider-managed.
- Enhances YouTube video and playlist embeds, including native start times and XenForo's third-party cookie-consent prompt. Playlist controls provide Previous, Next, and a link to open the playlist on YouTube.
- Finds rendered YouTube embeds in custom movie templates and content loaded through XenForo, including bare movie-list iframes. Consent placeholders stay untouched until the actual iframe exists.
- WebVTT captions, subtitles, and chapter tracks for direct media links, with the controls offered by your selected library.
- AirPlay, picture-in-picture, fullscreen, playback speed, volume, and keyboard controls when available for the source and browser.
- Responsive audio and video controls with translatable player labels.

## Bonus Features

- HLS streaming, live controls, and available stream quality selection.
- Option to pause other players on the page when playback starts.
- Separate switches for attachment audio, attachment video, and YouTube replacement.
- Adjustable Vidstack seek interval and keyboard shortcut setting. Video.js 10 uses its standard skin shortcuts and 10-second seek interval.

## Extra Requirements

- PHP 8.3.0+ and MySQL 8.0+.
- HTTPS and a current browser with JavaScript enabled.
- Video.js 10's supported browser baseline is Chrome/Edge 111+, Firefox 121+, and Safari/iOS 16.4+; see its [browser support guide](https://videojs.org/docs/framework/html/guides/browser-support). Required Custom Elements, Shadow DOM and CSS capabilities are checked before replacement. Vidstack also requires ResizeObserver and IntersectionObserver. Missing required capabilities retain the native attachment player or original YouTube playlist iframe. Initialization/import failures also restore native playback. Optional popover and constructed-stylesheet APIs use the bundled library's fallbacks, so their absence alone does not disable caption styling or chapter menus.
- HLS requires either the selected engine's supported Media Source implementation or browser-native HLS. Sources without either path retain the original media element; this cannot make an unsupported codec or stream playable. Video.js recognizes the same seven HLS MIME aliases as Vidstack, including extensionless `video/mpegurl` and `video/x-mpegurl` sources. Native HLS and MSE playback retain authored caption and chapter tracks; native playback may expose fewer quality choices.
- Media must use a codec supported by the visitor's browser. This add-on does not transcode files or change attachment upload limits.
- Vidstack recognizes XenForo's registered attachment MIME types, including MOV and WAV on protected addresses without file extensions. Browser codec support still applies. Unrecognized sources keep their native player.
- Remote media and WebVTT servers must permit your forum origin through CORS. HLS playlists and segments must also allow CORS. WebVTT files should be served as `text/vtt`.
- AirPlay requires a compatible Apple device/browser and receiver that can access the media URL. A protected attachment URL may require authentication the receiver does not have. PiP is for video and depends on browser and provider support; YouTube does not expose AirPlay or PiP through either custom provider. YouTube caption and quality choices are subject to its embedded player API.

## CSP and CORS

The add-on does not modify response security headers or proxy remote media. Configure your existing policy for the actual origins in use; blocked resources remain subject to the browser's policy. See the upstream [Video.js CSP guide](https://videojs.org/docs/framework/html/guides/content-security-policy).

| CSP directive | Resources used by this add-on |
| --- | --- |
| `script-src` | The local player, provider modules and chunks, or the configured JavaScript asset/CDN origin. Video.js YouTube playback also loads `https://www.youtube.com/iframe_api`; its SDK may need additional provider script origins. Vidstack uses iframe messaging without loading that SDK in the forum page. |
| `style-src` / `style-src-elem` | XenForo CSS, the Vidstack stylesheet on the configured JavaScript asset origin, and Video.js generated styles. Video.js reuses an existing page style nonce, falling back to the script nonce, on generated style elements. The script loader reuses the bootstrap script's nonce or an existing page script nonce. These values must already be authorized by the site's policy; a script nonce alone cannot authorize a different style policy. Existing XenForo inline styling requirements still apply. |
| `media-src` | Attachment/direct-media origins and `blob:` for Media Source HLS playback. |
| `connect-src` | HLS manifest, playlist, key, segment and subtitle origins; external WebVTT captions/chapters. |
| `img-src` | Authored poster/image origins and `https://i.ytimg.com` for Vidstack YouTube posters. |
| `worker-src` | `blob:` when the bundled hls.js worker path is available and enabled. The pinned hls.js versions retain their native fallback to playback work on the main thread if worker initialization fails. |
| `frame-src` | `https://www.youtube-nocookie.com` for the custom YouTube players, plus `https://www.youtube.com` when retaining XenForo's original embeds. A playlist uses the same frame origin as a single video. |

No extra `unsafe-eval` requirement is introduced by the add-on. Media sizing is copied through individual CSS properties, preserving priorities without assigning `cssText`. Nonce forwarding does not implement a Trusted Types policy or authorize blocked inline style attributes. The bundled players and XenForo must both be compatible with any stricter policy in use. Vidstack validates YouTube posters with image loading, so the poster host needs `img-src` permission rather than `connect-src`. Missing poster formats and sizes fall back to the next candidate. A blocked lookup settles without preventing playback; caption appearance and chapter controls remain part of the player.

If player modules are served from a different origin, that server must allow cross-origin module requests from the forum and serve JavaScript with a JavaScript MIME type. Native iframe embedding uses `frame-src`, rather than CORS permission for the iframe's document.

For cross-origin media requests, configure CORS on every relevant resource, including redirects, HLS child playlists, encryption keys, segments, subtitles, and external caption/chapter VTT files. `crossorigin="anonymous"` uses same-origin credentials only. Both HLS engines honor an authored `crossorigin="use-credentials"`; the remote server must return the exact allowed forum origin and `Access-Control-Allow-Credentials: true`, rather than `Access-Control-Allow-Origin: *`. Browser cookie restrictions still apply. Existing HLS request hooks are preserved. See [CORS credentials requirements](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS#requests_with_credentials).

Replacement YouTube video and playlist frames use `referrerpolicy="strict-origin-when-cross-origin"`, as recommended for [YouTube client identification](https://developers.google.com/youtube/terms/required-minimum-functionality#api-client-identity-and-credentials). This sends the forum origin to YouTube without the thread path or query parameters and prevents error 153 caused by a suppressing page or original iframe policy. Both custom providers also send the forum origin player parameter. Browser extensions or network filters can still strip identification. The original iframe and site-wide response headers remain unchanged. Caption language/appearance and chapter availability remain subject to the documented YouTube provider limits.

Replacement YouTube frames retain the original iframe's `allow` and `allowfullscreen` attributes, including their absence. Frames with explicit `sandbox`, `csp`, `credentialless` or `srcdoc` attributes retain native playback so their isolation policy or inline document is preserved. A native source or policy change while the player library loads also retains that newer original embed.

Keep the bootstrap, skin, provider bundles, chunks and `hashes.json` from the same source update. Follow the source-folder update steps below, then purge cached JavaScript from your CDN or site cache and reload the forum page in Safari.

## Supported XF Versions

XenForo 2.3.0+. Custom styles must retain the standard attachment, YouTube, and page-container template insertion points.

## How To Install

1. Back up your forum.
2. In AdminCP, open **Add-ons → Install/upgrade from archive** and select the supplied ZIP.
3. Open **Setup → Options → [TylerAustin] Video Player**, choose a **Player library**, and select the replacements you want. Reload open forum pages after changing the library.
4. Insert an audio or video attachment as **Full image** to use its player. Audio/video attachment preview links open in the native lightbox when their replacement switch is enabled. Image thumbnails and editor upload previews keep their existing presentation.
5. Paste a YouTube link using XenForo's media embedding feature, or keep an existing `[MEDIA=youtube]` tag.

For a source-folder update of an existing installation, back up your forum and upload the complete contents of `upload/` to the XenForo root. Include the bootstrap, skin, both provider bundles and their chunks, exported add-on data and `hashes.json` together. From the XenForo root, use the site's PHP 8.3 runtime for the command matching the installed Video Player version:

- If the installed version is older than **1.0.0 Dev 4**, run `php cmd.php xf:addon-upgrade TylerAustin/VideoPlayer`.
- If **1.0.0 Dev 4** is already installed, run `php cmd.php xf:addon-rebuild TylerAustin/VideoPlayer` and confirm XenForo's rebuild prompt. The normal upgrade command requires a newer version ID and does not apply a same-version source refresh.

Complete the native upgrade or rebuild so XenForo imports the current templates, modifications, options and phrases and refreshes its JavaScript asset version. Then purge cached JavaScript from your CDN or site cache and fully reload open forum pages. Update the matching Video Ads source through that add-on's own update instructions when it is installed.

The public footer displays the add-on's copyright by default. The **Branding** settings tab includes the Remove Branding option and purchase information.

## Thread and post audio/video lightboxes

Full-size audio/video attachments and direct-media BB codes keep their inline players. Eligible media preview links in attachment lists and non-full-size `[ATTACH]` renderings open in XenForo's existing lightbox. The native can-view check, no-lightbox BB-code setting, attachment URL, temporary hash and gallery grouping remain in force. Audio and video each follow their replacement switch; XenForo default keeps the original link behavior.

The lightbox uses its native HTML5 media markup and the selected player enhances the actual media node inside its existing content container. It keeps authored caption/chapter tracks and uses a video-style audio presentation so captions remain visible. New attachment lightboxes wait for Play. Moving to another slide pauses playback, closing disposes the player and ads, and Previous/Next navigation continues to use XenForo's grouping. Video pre-rolls retain the attachment's content type; audio has no video pre-roll. Unavailable libraries retain native playback. This does not add captions or chapters to attachments that have no tracks.

## Video Ads integration

Use Video Player 1.0.0 Dev 4 and Video Ads 1.0.3 or later. Follow the Video Player source-folder update steps above, including a native rebuild for an already installed Dev 4, and the Video Ads add-on's own update instructions. Purge cached JavaScript and reload forum pages after both updates finish. Video Ads continues to own consent, Global Privacy Control, bypass permissions, selected content types, frequency limits, failure cooldown, the VAST proxy, ad tracking and reporting. The Media Gallery content type covers album videos and their lightboxes; Resource Manager attachments and direct-media BB codes keep the native resource-update content type.

Pre-roll controls include Play/Pause, Mute/Unmute, the configured Skip countdown and optional Report ad button. Ads stay in the selected player when using custom-player fullscreen. Browser autoplay restrictions can require pressing Play ad. Pausing another player or hiding a lightbox pauses the ad; closing/removing the player disposes it and cancels pending requests. The content resumes only while playback is still intended and visible. The native attachment prefix is preserved so both add-ons' template modifications can apply. Enabled Video Ads configuration with a missing/older bridge retains the native video player instead of dropping ads.

Video Ads is optional and this integration does not install or enable it, configure a provider, or add video pre-rolls to YouTube or audio. Its ad media/tracking origins must be allowed by your existing CSP. Live playback and ad-provider behavior still require staging checks after deployment.

## Player Choices

| Choice | Playback and controls |
| --- | --- |
| Video.js 10 | Locally bundled Video.js 10.3.0 for direct audio/video, HLS, and YouTube video and playlist embeds. Includes native WebVTT captions with appearance controls, a chapter menu with timestamps and the current chapter marked, timeline chapter markers, speed, fullscreen, AirPlay, and PiP where supported. Uses the forum language through Video.js locale packs. |
| XenForo default | Standard browser audio/video controls and XenForo's original YouTube embeds. Availability of captions, fullscreen, AirPlay, and PiP follows the browser. |
| Vidstack | The existing Vidstack interface, including its caption appearance controls, chapter menu, and configurable keyboard and seek settings. |

Each page uses only the selected custom library. Vidstack and Video.js 10 both replace YouTube playlist embeds. XenForo default retains its original playlist iframe. The pause-other-players option works with either custom library.

After changing Player library, fully reload each open forum page. Existing players stay with the page's original selection until it is reloaded. The new selection applies to attachment audio/video, Media Gallery pages and album lightboxes, Resource Manager rich-text media, individual YouTube embeds, playlists, and direct-media BB codes without editing posts. XenForo default uses the original browser controls and YouTube iframe; caption tracks stay attached, while custom caption styling and chapter menus return when Vidstack or Video.js 10 is selected again. An unrecognized library choice keeps native playback.

The runtimes, Video.js skin and Vidstack stylesheet use XenForo's asset-version URLs. Completing the native upgrade or same-version rebuild refreshes that version for new page loads; cached CDN or site copies must also be purged. Video.js's skin uses the same versioned runtime URL as the bootstrap, avoiding duplicate control registration.

YouTube playlists use the same replacement switch as individual YouTube videos. Existing video embeds containing a playlist ID keep that playlist, their initial video, and their XenForo start time. Playlist-only embeds using YouTube's `embed/videoseries?list=...` format are also supported. Previous and Next controls stay inside the selected player for fullscreen use. No YouTube Data API key is required. A playlist must be accessible to the visitor and permit embedding; private, deleted, restricted, or unavailable videos follow YouTube's normal restrictions. Playlist links that XenForo has not converted to a media embed remain links.

Video.js 10 uses a video-style presentation for audio BB codes with caption or chapter tracks, and for HLS audio whose tracks may be announced by the manifest, so captions have a visible display area and the chapter menu remains available. Its customized Settings menu includes Caption Styles and Chapters. HLS streams play with its video skin; Vidstack retains its automatic live-specific controls and its audio layout includes caption and chapter controls.

An explicit pause cancels automatic playlist continuation in Vidstack. Delayed initial positioning in Video.js respects active playback and manual Previous/Next choices. Video.js refreshes the available YouTube caption languages and active selection for each playlist video without temporarily turning captions off. Caption styling and chapter menus for direct media and HLS remain available when their tracks exist; YouTube supplies its own caption appearance and does not expose chapter cues through these providers. Vidstack's YouTube provider does not expose caption languages to its custom menu; YouTube caption controls depend on the embedded player.

Vidstack and Video.js 10 offer AirPlay for supported audio and video sources, including HLS. Compact Video.js audio playback includes an AirPlay button that appears when its native feature reports a receiver is available. Audio presentations keep PiP disabled even when they use a video-style layout for captions. Explicit media restrictions on remote playback or PiP are preserved. Caption styling and chapter menus remain in the forum player; the floating PiP window and AirPlay receiver use their own controls and caption presentation.

Video.js suspends local HLS loading during AirPlay. Returning to local playback resumes the stream stopped by that handoff at the reported position; a changed source follows its current preload policy. The handoff does not request Play, clear a terminal playback error or reset caption styling and chapter controls.

## Play, Pause And Autoplay

Media waits for a visitor to press Play; replacing an attachment that is already playing resumes its current position, volume, and mute state when the browser allows it. Initial autoplay stays disabled for audio, video, HLS, and YouTube embeds. Previous/Next and automatic YouTube playlist advancement continue after playback has been started.

Pause cancels queued playback during loading. Video.js exposes a pending YouTube play to its Play/Pause control, so a second press can cancel it before metadata arrives. The option to pause other players also cancels their pending playback. If the browser blocks scripted YouTube playback or a playlist transition, the controls return to Play without forcing mute, retrying playback, or clearing caption and chapter settings. Press Play again to retry. HLS uses the selected library's native HTML media playback and browser autoplay policy.

Vidstack YouTube state callbacks recheck pause requests and provider ownership after loading and playback notifications. A callback that pauses, removes or replaces the player cannot be followed by an older Playing notification from that same SDK update.

## Lazy Loading

Only the selected custom library loads. Video.js loads its runtime and skin together. Its initial HLS engine and YouTube SDK wait for Play when preload is none. An explicit seek, an HLS AirPlay request, an explicit preload/autoplay change or restoration of already-started media can also initialize the provider. Early seeks request metadata without autoplay, including a chapter at time zero; pending seeks stop on media errors or source changes. Once initialized, the native player keeps its buffering, retry and track behavior.

Vidstack retains its play-on-demand media loading and loads posters when visible. Enhanced attachment markup requests no media preload; XenForo default retains its original preload behavior. During YouTube enhancement, the original iframe is suspended while the custom player is prepared and restored if setup fails. With JavaScript disabled, XenForo's original embed remains available.

Local provider-definition modules may load before Play. Posters and companion caption/chapter files also follow their browser and player loading rules, so they can load before the main media. Caption styling and chapter menus stay available when their tracks are ready.

Video.js limits full YouTube SDK polling work while idle to a 250 ms cadence. Playback and seeking retain its native 50 ms polling path. Volume, mute and speed choices made before SDK readiness are applied when it becomes ready.

## Posters, Metadata And Loading

Native XenForo YouTube embeds retain responsive player sizing. Vidstack uses the forum wrapper's geometry rather than importing the native iframe's numeric dimensions as CSS. The original iframe retains its dimensions for fallback. Enhanced wrapper sizing does not depend on CSS `:has()`; Video.js retains the CSS requirements listed above for its own interface. Removing the last enhanced player releases the wrapper's custom sizing rules. Inline style changes during asynchronous preparation retain the original media with its current styling.

Native attachment fallback messages remain on the original media element. Vidstack's prepared copy excludes those elements so they cannot cover playable media or its controls.

Authored poster images remain available on direct media and HLS, including the Video.js poster layer. Their cross-origin setting is preserved. Vidstack can display a YouTube poster inferred by its provider; a playlist URL without an individual video ID has no inferred first-item image. Video.js uses an authored poster or YouTube's own embedded preview. The add-on does not generate thumbnails from media files or HLS manifests.

Authored titles and ARIA labels take precedence. Vidstack displays YouTube titles when its provider supplies them. Video.js keeps an authored title; otherwise its YouTube playlists identify the current item by its localized item number. It does not fetch YouTube titles separately.

Poster downloads and media loading have separate states. A missing or broken poster does not become a playback error or remove caption and chapter controls. Results from an older poster request are ignored after source changes or removal. Readiness and buffering follow the current source, including HLS and YouTube playlist transitions, and terminal errors clear the loading presentation.

## Source Changes And Playback State

Replacing a playing attachment retains its position, volume, mute setting, playback speed and selected external captions. If its source, tracks, poster or title changes while the custom library loads, the original media stays available. Changing the selected player library still requires a page reload.

Vidstack quality-source changes retain playback preferences and restore position within the available seekable window. A pause made while restoration is pending prevents automatic resumption. Source and provider changes invalidate older readiness callbacks. A different HLS manifest removes its old in-band tracks; external caption and chapter tracks stay attached and should be updated alongside the media when they describe different content.

Video.js YouTube changes to a different source cancel old play requests and queued seeks. Recreating its SDK for the same source retains position, playlist index and play/pause intent, subject to browser autoplay restrictions. Caption language preferences are restored when that language is available; Off remains Off. The available-language list follows each playlist item. Caption appearance controls and chapter menus continue to follow the current source's capabilities.

Video.js stops older YouTube progress, volume and speed updates when a callback changes the source, reloads or removes the player, or requests a newer seek. Only the latest queued seek issues a YouTube SDK command. HLS loading and early Play/seek actions also stop when a loading callback replaces the source, reloads it or removes the media.

Playlist changes refresh the playlist link and navigation visibility, and cancel delayed initial positioning from the original queue. Source changes do not save playback history between visits.

## Ended Playback, Replay And Looping

Finite media returns to its Play/Replay control when it ends. Replay uses the same player and retains its caption selection, caption appearance and chapter tracks. Seeking backward from the endpoint clears ended state. HLS replay remains within the stream's available seekable range; an ongoing live stream has no fixed end and expired live segments are unavailable.

Authored `loop` attributes are preserved when either library replaces the original media, including HLS and captioned audio. YouTube playlist looping repeats the queue through YouTube's playlist loop setting, allowing each item to advance normally. Other media loops its current source. Looping does not enable initial autoplay.

An explicit pause, hidden overlay or pause-others action cancels a pending loop restart. Removal and source changes cancel deferred end/loop callbacks, and a newer Play or seek prevents an older end notification from overwriting that action. Browser autoplay restrictions still apply to automatic restarts.

Vidstack also rechecks an end transition after its time, pause and seek notifications. Replay, seeking, source changes or disposal during those notifications stop the older transition. A Play call ignored because the player is already playing does not cancel a legitimate end notification.

## Multiple Players

With **Pause other players** enabled, a Play request pauses other add-on players on the page, including audio, video, HLS and YouTube playlists that are still loading. Previous/Next playlist requests also pause the other players. Dynamically inserted players join the same coordination when XenForo activates their content. Players removed from the page stop participating.

Pausing keeps each player's position, caption selection, caption appearance and chapter menus. Press Play or Previous/Next to resume an interrupted playlist. Delayed HTML media events and YouTube playback acknowledgements do not reclaim playback after cancellation. Disable **Pause other players** to play several custom players independently. XenForo default uses XenForo's original controls.

## Buffering And Error Recovery

If Video.js cannot start YouTube because its player script is temporarily unavailable, dismiss the error and press Play to try again. Startup retries retain the requested initial playlist item and start time. They do not automatically start another retry or reset caption and chapter settings. The site's CSP and network rules must still permit YouTube's required resources.

Both players show buffering while playback waits for data and stop presenting a terminal error as continued buffering. Video.js follows YouTube's buffering state even after a video has previously played or fully buffered. YouTube item errors leave Previous/Next available, including a failure before the first item is ready. Dismiss the Video.js error dialog before navigating. A playable next item clears the previous error; deleted, private, restricted, or otherwise unavailable videos still require another item or a page reload.

HLS retains the bundled engine's network retry and rendition fallback policies. Vidstack makes at most one additional media-error recovery attempt per source load, then reports a repeated fatal decode error instead of repeatedly detaching the media. A terminal HLS error pauses the media and releases pending play requests in both engines. Video.js applies its native external WebVTT cue-preservation helper during media recovery and restores the selected in-band caption track or Off setting when tracks return. Vidstack reuses its HLS text tracks during recovery, retaining their selection and avoiding duplicate menu entries. Caption styling and chapter menus remain available for their tracks. Unrecoverable stream, network, or provider failures may require reloading the page after the underlying problem is resolved.

## Seeking And Progress

The timeline, buffered-progress fill, and percentage seeking follow the available HLS seekable window in both custom libraries. Expired live history is excluded from the timeline. Video.js clamps seeks to a reported seekable range, including gaps, and treats a seek to the current position as complete. Chapter markers use the same timeline bounds; caption and chapter menus remain available for their tracks.

YouTube progress follows the current video. Playlist changes clear stale seek state, and Video.js refreshes duration and buffered progress even when successive items have equal durations. It also handles repeated video IDs at different playlist positions. YouTube can land on a nearby keyframe; Video.js follows the reported position when a seek settles instead of leaving the bar stuck at the requested time.

Native attachment position is transferred when the selected custom player replaces its media element, including HLS media slots. Available seek history is determined by the source and browser.

## Volume And Mute

Both custom libraries preserve the native attachment player's current volume and mute state during replacement, including HLS and audio presentations. An authored muted default is retained when recreating media elements.

The mute button and `m` shortcut use the selected library's normal behavior. In Vidstack, moving the volume slider above zero unmutes playback, including when returning to the previous volume. Setting its YouTube slider to zero sends an explicit zero-volume command. Video.js keeps YouTube volume and mute displays synchronized with the current video's actual state, including playlist changes.

Volume and mute controls remain available in fullscreen where the browser supports the custom player interface. Some devices reserve volume adjustment for hardware or system controls; the player follows that browser restriction. Caption styling and chapter menus remain independent of volume and mute.

## Playback Speed And Quality

Vidstack's speed slider offers 0.25× through 2× in 0.25 steps. Video.js uses its native speed menu and the range supported by the media component. YouTube decides which speeds a video accepts; Video.js displays the confirmed speed rather than assuming a request succeeded. Cueing or loading a YouTube video or playlist can reset speed to 1×, and the controls follow the current video's actual speed.

Multi-rendition HLS streams offer Auto and the quality choices exposed by the streaming engine. Auto remains the default. Vidstack refreshes its choices when HLS levels change and preserves the engine's Auto/manual mode. Video.js uses its native rendition updates. A fixed high quality can require more bandwidth; selecting Auto restores adaptive selection.

Manual quality selection is unavailable for a single progressive file, a single-rendition stream, or a native HLS path that does not expose rendition controls. YouTube controls its own playback quality for videos and playlists; neither custom player forces a YouTube resolution. Quality and speed controls stay in the existing Settings menus alongside captions and chapters when those tracks are available.

## Accessibility And Screen Readers

Player groups have accessible names; Video.js includes the media title so attachments on the same page can be distinguished. An explicitly supplied media ARIA label is retained by both custom players. The Video.js YouTube iframe is excluded from the accessibility tree and tab order because its custom player provides the controls.

Both libraries retain their native playback, volume, captions, presentation, and seeking announcements. Vidstack uses a visually hidden text live region, announces seeks starting at zero, and announces playback-speed changes. Its initial play-on-demand interface is not marked busy until loading starts, and playback errors are announced without moving focus. Playlist announcements start after interaction: Vidstack reports item titles, while Video.js reports the current playlist position. Playlist links and buttons keep visible keyboard focus. Video.js seek-slider announcements describe position within the available HLS DVR window; the actual seek coordinates still follow the stream.

Use Tab to enter controls, Enter or Space to activate buttons, and the menu's arrow keys, Home/End, and Escape to navigate and return. Caption styling menus and chapter groups have accessible names. Chapter choices include a spoken start time; track refreshes reuse unchanged chapter rows and restore focus when a focused row is replaced. If a caption-style or chapter trigger disappears, focus returns to Settings. Menus and announcements still depend on the tracks and capabilities supplied by HLS, direct media, or YouTube. Live screen reader behavior requires checks on a real forum with the visitor's browser and assistive technology.

## Mobile And Touch Controls

On touch screens, tap the video surface to show or hide controls, and use the Play/Pause button for playback. The native video gestures retain double-tap seeking at the sides and fullscreen in the center where the device supports it. Swipes, pinches, and cancelled touches do not count as taps. Sliders follow the finger that started the interaction; cancellation finishes at the last preview position and releases the controls. Vidstack's surface swipe waits for a deliberate horizontal movement and leaves vertical page scrolling available.

Video.js accepts the next surface click after a mouse press is released outside the player, clearing the abandoned gesture without carrying it into a later double-click.

Vidstack cancels queued taps and gesture animations when controls are disabled, removed or reconnected, or the source changes. A cancelled gesture cannot act on a later source or a newly connected player.

YouTube playlist buttons have larger touch targets and stay in a single horizontally scrollable row. Space is reserved above the player controls so Previous/Next does not cover caption, chapter, or Settings buttons. Small touch presentations allow extra height, capped to the visible viewport, and respect device safe-area insets. Long chapter titles wrap inside the Video.js chapter menu. Captions, caption styling, chapters, and HLS timeline controls retain their existing provider and browser capabilities; native media fullscreen uses the device's own interface.

## Fullscreen And Keyboard Controls

Use Tab to focus a player or its controls. Both video interfaces provide Space or `k` for play/pause, `m` for mute, `f` for fullscreen, `j`/`l` or Left/Right for seeking, Up/Down for volume, and `<`/`>` for playback speed when supported. The `c` shortcut toggles available captions; YouTube caption support follows the provider limits described above. The `i` shortcut requests PiP only where permitted; audio and explicitly restricted sources keep it disabled. The Vidstack keyboard option controls its player shortcuts; Video.js uses the shortcuts built into its skin.

Shortcuts stay scoped to the focused player. Tab to a playlist's Previous or Next button and press Enter or Space to navigate. Video.js YouTube iframes stay outside the tab order and have their separate YouTube shortcuts disabled, so keyboard focus and fullscreen requests remain with the custom player. Caption and chapter menus retain their native keyboard navigation.

Standard element fullscreen includes the player controls, playlist buttons, caption styling, and chapter menus for available tracks on direct media and HLS. YouTube playlist buttons also remain inside the fullscreen container. On devices that offer only native media fullscreen, the browser owns that view; custom menus remain available when returning to the inline player. Escape follows the browser's fullscreen and open-menu behavior.

Vidstack fullscreen requests run directly from the visitor's button press or shortcut, without waiting for play-on-demand media to load. Entering fullscreen does not start playback.

## Direct Media And Captions

Use these BB codes for a direct HTTPS file:

```text
[vidstack]https://media.example.com/movie.mp4[/vidstack]
[vidstackaudio]https://media.example.com/podcast.mp3[/vidstackaudio]
[vidstack]https://media.example.com/live.m3u8[/vidstack]
[vidstackaudio]https://media.example.com/radio.m3u8[/vidstackaudio]
```

To provide captions or chapters, put the media URL in the option and one track on each line inside the tag:

```text
[vidstack=https://media.example.com/movie.mp4]
subtitles|en|English|https://media.example.com/movie.en.vtt
subtitles|es|Español|https://media.example.com/movie.es.vtt
chapters|en|Chapters|https://media.example.com/movie.chapters.vtt
[/vidstack]
```

Each track uses `kind|language|label|HTTPS WebVTT URL`. Kinds are `captions`, `subtitles`, or `chapters`; a maximum of 16 tracks is supported. The same syntax works with `vidstackaudio`. Existing attachments do not automatically acquire captions: use a direct-media BB code with a companion WebVTT file when you need them. Use XenForo's normal media embedding feature for YouTube URLs.

Video file extensions: `mp4`, `m4v`, `webm`, `ogv`, `mov`, and `m3u8`. Audio file extensions: `mp3`, `m4a`, `aac`, `ogg`, `oga`, `wav`, `flac`, `opus`, and `m3u8`. Filename extensions, including `.M3U8` and `.VTT`, are matched without regard to case; the media and track URLs keep their original spelling and query strings. Browser codec support still applies. Email and simple-HTML renderers show direct media as links.

## Dynamically Loaded Content

Players initialize through XenForo's native content activation, including posts and overlays inserted after the page loads. Repeated activation uses XenForo's existing handler registration rather than creating another player. If custom-player setup cannot complete, the original media remains available.

Hiding an overlay pauses its player. Reopening the same overlay retains its caption preferences and chapter menus; playback resumes when the visitor presses Play. Permanently removing its content releases the custom player, HLS or YouTube provider, add-on listeners and pending callbacks. Content moved synchronously within the document follows the selected library's native reconnect behavior.

A Video.js player that has completed destruction stays disposed if its old element is reinserted. Freshly inserted media initializes normally; queued connection work does not restart a disposed player.

Video.js time and volume sliders release their resize observers, pointer capture and queued drag updates on disconnect. Reconnecting creates fresh slider controls without retaining callbacks from the previous connection; caption styling and chapter menus remain available.

Video.js state selectors reuse their native snapshot subscriptions across reconnects and track the current player when their context changes. This keeps caption, chapter and playback state current without accumulating subscriptions after repeated moves.

Vidstack HLS library completion and failure callbacks are ignored after their provider is disposed. Its asynchronous engine setup registers listeners in that provider's native scope, so a later source or provider change releases them with the old engine.

## Caption Styles And Chapters

With **Video.js 10** selected, open **Settings → Caption Styles** to change font family, font size, text color and opacity, background color and opacity, or text edge. The preview reflects the selected appearance. **Reset** restores the browser's defaults. Appearance choices apply to the current player and are not saved between visits.

These controls style browser-rendered WebVTT captions on direct media and HLS streams. YouTube renders its own captions and controls their appearance. Native fullscreen, picture-in-picture, and AirPlay may use the device's caption preferences instead.

Switching an active Video.js HLS subtitle track to **Off** also disables its hls.js rendition, stopping unused subtitle fragment loading. Turning captions back on uses the normal track-selection controls. Caption styling and chapter menus remain available.

External Video.js HLS caption tracks do not require an HTML track ID. Selecting an authored VTT track keeps its own source and cues, even when its language or label matches a manifest rendition. The HLS adapter honors an existing caption selection during initialization and inserts parsed HLS cues only into the tracks it owns.

Vidstack retains its built-in caption appearance menu and saves those appearance preferences in the browser. HLS subtitle cues are routed to their originating language, and embedded closed-caption channels remain separate from subtitle renditions.

Open **Settings → Chapters** to see chapter titles and start times, with the current chapter marked. Selecting a chapter seeks to its start. Add a companion WebVTT track with `kind="chapters"` using the BB-code syntax above. Caption Styles and Chapters appear when the corresponding tracks are available, including fullscreen use of the Video.js skin. Vidstack retains its existing caption styling and chapter menu.

Video.js publishes caption-style and chapter availability through its native menu groups, so opening or updating Settings preserves the appropriate triggers and closes a page when its tracks disappear. Vidstack enables companion chapter tracks on the detached copy used for enhancement, keeping the original media and its caption selection intact for fallback.

For chapter menus that work with either library on an HLS stream, supply a companion WebVTT chapter track. Video.js also reads Apple HLS JSON chapter documents referenced by a stream manifest.

## External Services And Licensing

Video.js 10.3.0 and Vidstack 1.15.7, their selected media engines, icons, and translation resources are bundled locally. Only the chosen library loads on the page. YouTube playback connects the visitor's browser to YouTube after XenForo's consent requirements are satisfied. Remote files, streams, and captions connect directly to their respective hosts. Vidstack Google Cast, when supported and invoked, loads Google's Cast SDK and requires a source accessible to the receiver. Video.js 10 retains the licenses of its official Apache 2.0 components; Vidstack retains its MIT license. See the [Video.js 10 announcement](https://videojs.org/blog/videojs-10) for the new player architecture. The add-on makes no license callbacks and adds no telemetry or playback-history storage.

Third-party components retain their original licenses; their notices are included with the player. The add-on's own terms are in LICENCE.md. Modified copies, including private modifications, may not be redistributed, resold, published, shared, provided, or made available without permission from the copyright holder. These restrictions do not replace the licenses of independently licensed third-party components.

## Important Note

This is a development release. Back up your forum and try it on a staging installation before production use. Playback capabilities vary by browser, source, codec, and device. Vidstack is in security-only maintenance until January 2028; see the [Vidstack project](https://vidstack.io/docs/player/) for its current status.

Copyright ©2026 TylerAustin. This item is not authorized for posting on xenforo.com and others web sites except under the XenForo account named TylerAustin, GameNet.
