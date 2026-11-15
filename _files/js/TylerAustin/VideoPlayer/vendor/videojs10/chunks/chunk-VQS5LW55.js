import {
  MediaError,
  MediaPlayedRangesMixin,
  NO_TIME_RANGES_YET,
  createTimeRange,
  deepEqual,
  isNumber,
  isObject,
  loadScript,
  noop,
  parseYouTubeSource,
  parseYouTubeVideoId,
  serializeEmbedParams
} from "./chunk-6EU4S5JI.min.js";

// node_modules/@videojs/youtube-video/dist/default/source.js
function buildYouTubeIframeSrc(src, props = {}) {
  const parsed = parseYouTubeSource(src);
  if (!parsed) return "";
  const embedBase = parsed.noCookie ? EMBED_BASE_NOCOOKIE : EMBED_BASE;
  const params = {
    controls: props.controls === true ? null : 0,
    autoplay: props.autoplay,
    loop: props.loop,
    mute: props.defaultMuted,
    playsinline: props.playsInline ?? true,
    preload: props.preload ?? "metadata",
    enablejsapi: 1,
    rel: 0,
    iv_load_policy: 3,
    start: parsed.startTime,
    ...props.source?.engine?.youtube ?? void 0
  };
  if (parsed.kind === "playlist" && parsed.listId) return `${embedBase}?${serializeEmbedParams({
    listType: "playlist",
    list: parsed.listId,
    ...params
  })}`;
  return `${embedBase}/${parsed.id}?${serializeEmbedParams(params)}`;
}
var EMBED_BASE = "https://www.youtube.com/embed";
var EMBED_BASE_NOCOOKIE = "https://www.youtube-nocookie.com/embed";

// node_modules/@videojs/youtube-video/dist/default/iframe-api.js
var API_URL = "https://www.youtube.com/iframe_api";
async function loadYouTubeApi() {
  const existing = globalThis.YT;
  if (existing?.Player) return existing;
  await loadScript(API_URL);
  const api = globalThis.YT;
  if (!api) throw new Error("YouTube iframe API failed to load");
  await new Promise((resolve) => api.ready(resolve));
  return api;
}
var youtubeErrorCodeToMediaErrorCode = {
  2: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED,
  5: MediaError.MEDIA_ERR_DECODE,
  100: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED,
  101: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED,
  150: MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
};

// node_modules/@videojs/youtube-video/dist/default/text-tracks.js
var TextTrackEvent = class extends Event {
  constructor(type, track) {
    super(type);
    this.track = track;
  }
};
var YouTubeTextTrack = class {
  #mode;
  #onModeChange;
  constructor(label, language, onModeChange) {
    this.id = "";
    this.kind = "subtitles";
    this.cues = null;
    this.#mode = "disabled";
    this.label = label;
    this.language = language;
    this.#onModeChange = onModeChange;
  }
  get mode() {
    return this.#mode;
  }
  set mode(value) {
    if (this.#mode === value) return;
    this.#mode = value;
    this.#onModeChange();
  }
};
var YouTubeTextTrackList = class extends EventTarget {
  #tracks = [];
  #changeQueued = false;
  get length() {
    return this.#tracks.length;
  }
  [Symbol.iterator]() {
    return this.#tracks[Symbol.iterator]();
  }
  getTrackByLanguage(language) {
    return this.#tracks.find((track) => track.language === language);
  }
  add(label, language) {
    const track = new YouTubeTextTrack(label, language, () => this.#queueChange());
    Object.defineProperty(this, this.#tracks.length, {
      value: track,
      configurable: true,
      enumerable: true
    });
    this.#tracks.push(track);
    queueMicrotask(() => this.dispatchEvent(new TextTrackEvent("addtrack", track)));
    return track;
  }
  clear() {
    const removed = this.#tracks;
    this.#tracks = [];
    for (const [index, track] of removed.entries()) {
      delete this[index];
      queueMicrotask(() => this.dispatchEvent(new TextTrackEvent("removetrack", track)));
    }
  }
  #queueChange() {
    if (this.#changeQueued) return;
    this.#changeQueued = true;
    queueMicrotask(() => {
      this.#changeQueued = false;
      this.dispatchEvent(new Event("change"));
    });
  }
};

// node_modules/@videojs/utils/dist/function/public-promise.js
function createPublicPromise() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
}

// node_modules/@videojs/utils/dist/function/throttle.js
function throttle(fn, ms, options) {
  const leading = options?.leading ?? false;
  let timerId = null;
  let latestArgs;
  let hasPending = false;
  function startCooldown() {
    timerId = setTimeout(() => {
      timerId = null;
      if (hasPending) {
        hasPending = false;
        fn(...latestArgs);
        startCooldown();
      }
    }, ms);
  }
  const throttled = (...args) => {
    latestArgs = args;
    if (leading) {
      if (timerId === null) {
        fn(...latestArgs);
        startCooldown();
      } else hasPending = true;
    } else {
      if (timerId !== null) return;
      timerId = setTimeout(() => {
        timerId = null;
        fn(...latestArgs);
      }, ms);
    }
  };
  throttled.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    hasPending = false;
  };
  return throttled;
}

// node_modules/@videojs/utils/dist/function/try-call.js
function tryCall(fn) {
  try {
    fn();
  } catch {
  }
}

// node_modules/@videojs/youtube-video/dist/default/adapter.js
var SEEK_TOLERANCE = 1;
var SEEK_SETTLE_TIMEOUT = 1e3;
var PLAYER_SETTINGS = [
  "volume",
  "muted",
  "playbackRate"
];
var YouTubeAdapter = class YouTubeAdapter2 extends MediaPlayedRangesMixin(EventTarget) {
  static {
    this.defaultProps = {
      src: "",
      autoplay: false,
      defaultMuted: false,
      muted: false,
      loop: false,
      controls: false,
      playsInline: true,
      preload: "metadata",
      poster: "",
      source: null
    };
  }
  #target = null;
  #player = null;
  #playerReady = false;
  #pendingLoad = false;
  #creatingPlayer = false;
  #pendingEmbedOptions = false;
  #restoreSettings = /* @__PURE__ */ new Set();
  #writtenSettings = /* @__PURE__ */ new Set();
  #playerSettingsRead = false;
  #recreations = 0;
  #pendingWrites = [];
  #playRequest = null;
  #loadComplete = createPublicPromise();
  #attachId = 0;
  #sourceRevision = 0;
  #seekRevision = 0;
  #pendingRestoration = null;
  #captionPreference;
  #captionSignature = "";
  #src = YouTubeAdapter2.defaultProps.src;
  #autoplay = YouTubeAdapter2.defaultProps.autoplay;
  #defaultMuted = YouTubeAdapter2.defaultProps.defaultMuted;
  #loop = YouTubeAdapter2.defaultProps.loop;
  #controls = YouTubeAdapter2.defaultProps.controls;
  #playsInline = YouTubeAdapter2.defaultProps.playsInline;
  #preload = YouTubeAdapter2.defaultProps.preload;
  #poster = YouTubeAdapter2.defaultProps.poster;
  #source = YouTubeAdapter2.defaultProps.source;
  #pauseRequested = false;
  #paused = true;
  #ended = false;
  #seeking = false;
  #seekTarget = null;
  #seekOrigin = null;
  #seekStartedAt = 0;
  #progressItem = "";
  #loaded = false;
  #playFired = false;
  #currentTime = 0;
  #duration = NaN;
  #volume = 1;
  #muted = false;
  #playbackRate = 1;
  #progress = 0;
  #readyState = READY_STATE_HAVE_NOTHING;
  #errorItem = "";
  #error = null;
  #isFullscreen = false;
  #pollInterval = null;
  #idlePollAfter = 0;
  #textTracks = new YouTubeTextTrackList();
  #captionLanguage = null;
  #captionSelected = false;
  static {
    this.engineName = "youtube";
  }
  constructor() {
    super();
    this.#textTracks.addEventListener("change", () => this.#onTextTracksChange());
    this.#textTracks.addEventListener("tyl-player-captions-off-request", () => {
      this.#captionPreference = null;
      this.#captionSelected = true;
      this.#captionSignature = "";
      if (this.#playerReady) tryCall(() => this.#player?.setOption("captions", "track", {}));
    });
  }
  /** Underlying YouTube iframe API player instance (null until the API loads). */
  get engine() {
    return this.#player;
  }
  get target() {
    return this.#target;
  }
  /**
  * Bind the iframe hosting the embed. The player follows once an embed URL can be resolved, which may not be now: an
  * iframe attached before `src` is set is picked up by the next `load()`.
  */
  attach(target) {
    if (!target || this.#target === target) return;
    if (this.#target) this.detach();
    this.#target = target;
    this.#beginLoad();
    this.#createPlayer();
  }
  detach() {
    this.#pendingRestoration = null;
    this.#cancelPlay(new DOMException("The player was detached.", "AbortError"));
    const target = this.#target;
    if (!target) return;
    const { parentNode, nextSibling } = target;
    this.#teardown();
    if (parentNode && !target.parentNode) parentNode.insertBefore(target, nextSibling?.parentNode === parentNode ? nextSibling : null);
  }
  #teardown() {
    this.#attachId++;
    this.#stopPolling();
    tryCall(() => this.#player?.destroy());
    this.#player = null;
    this.#playerReady = false;
    this.#pendingLoad = false;
    this.#creatingPlayer = false;
    this.#restoreSettings = /* @__PURE__ */ new Set();
    this.#writtenSettings = /* @__PURE__ */ new Set();
    this.#playerSettingsRead = false;
    this.#pendingWrites = [];
    this.#target = null;
    this.#loadComplete.resolve();
    this.#resetState();
    this.#volume = 1;
    this.#muted = false;
    this.#playbackRate = 1;
  }
  destroy() {
    this.detach();
    super.destroy();
  }
  get src() {
    return this.#src;
  }
  /** YouTube URL or id. Setting it re-derives `source`, carrying its player parameters over. */
  set src(value) {
    const { engine } = this.#source ?? {};
    const next = {
      ...engine && { engine },
      ...value && { src: value }
    };
    this.source = Object.keys(next).length > 0 ? next : null;
  }
  get currentSrc() {
    return this.#target?.getAttribute("src") ?? "";
  }
  get readyState() {
    return this.#readyState;
  }
  /** Reload the current source via the iframe API; deferred until the player is ready. */
  async load() {
    if (!this.#player || !this.#playerReady) {
      this.#pendingLoad = !!this.#target;
      if (this.#target && !this.#player && !this.#creatingPlayer) {
        const load2 = this.#beginLoad();
        await Promise.resolve();
        if (load2 !== this.#loadComplete) return;
        this.#createPlayer();
      }
      return;
    }
    const load = this.#beginLoad();
    this.#resetState();
    this.dispatchEvent(new Event("emptied"));
    if (load !== this.#loadComplete) return;
    if (!this.#src) {
      load.resolve();
      this.#stopPolling();
      tryCall(() => this.#player?.stopVideo());
      return;
    }
    this.dispatchEvent(new Event("loadstart"));
    if (load !== this.#loadComplete) return;
    const parsed = parseYouTubeSource(this.#src);
    if (!parsed) {
      this.#error = new MediaError(`Unrecognized YouTube source: ${this.#src}`, MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED);
      this.dispatchEvent(new Event("error"));
      load.resolve();
      return;
    }
    if (parsed.kind === "playlist" && parsed.listId) {
      this.#player.setLoop(this.#loop);
      const options = {
        list: parsed.listId,
        listType: "playlist"
      };
      if (this.#autoplay) this.#player.loadPlaylist(options);
      else this.#player.cuePlaylist(options);
    } else if (parsed.id) {
      this.#player.setLoop(false);
      const options = { videoId: parsed.id };
      if (parsed.startTime != null) options.startSeconds = parsed.startTime;
      if (this.#autoplay) this.#player.loadVideoById(options);
      else this.#player.cueVideoById(options);
    }
  }
  #beginLoad() {
    this.#loadComplete.resolve();
    this.#loadComplete = createPublicPromise();
    this.#flushAfterLoad();
    return this.#loadComplete;
  }
  get paused() {
    return this.#paused;
  }
  get ended() {
    return this.#ended;
  }
  get seeking() {
    return this.#seeking;
  }
  play() {
    if (this.#pendingRestoration) this.#pendingRestoration.paused = false;
    this.#pauseRequested = false;
    if (this.#playRequest) return this.#playRequest;
    if (!this.#src || !this.#target || !this.#paused && !this.#ended) return Promise.resolve();
    const request = createPublicPromise();
    this.#playRequest = request;
    this.#paused = false;
    this.#ended = false;
    this.#playFired = true;
    this.dispatchEvent(new Event("play"));
    if (this.#playRequest === request) this.#createPlayer();
    this.#playWhenReady(request);
    return request;
  }
  async #playWhenReady(request) {
    try {
      let load, recreations;
      do {
        load = this.#loadComplete;
        recreations = this.#recreations;
        await Promise.race([load, request]);
        if (this.#playRequest !== request) return;
      } while (load !== this.#loadComplete || recreations !== this.#recreations);
      if (this.#error) throw this.#error;
      if (!this.#target || !this.#player || !this.#src) throw new DOMException("The media was removed.", "AbortError");
      this.#player.playVideo();
      if (this.#player?.getPlayerState() === 1) this.#resolvePlay(request);
    } catch (error) {
      if (this.#playRequest === request) this.#cancelPlay(error);
    }
  }
  #resolvePlay(request) {
    if (!request || this.#playRequest !== request || this.#pauseRequested) return;
    this.#playRequest = null;
    request.resolve();
  }
  #cancelPlay(error) {
    const request = this.#playRequest;
    this.#playRequest = null;
    request?.reject(error);
    this.#playFired = false;
    const changed = !this.#paused;
    this.#paused = true;
    if (changed) this.dispatchEvent(new Event("pause"));
  }
  pause() {
    if (this.#pendingRestoration) this.#pendingRestoration.paused = true;
    this.#pauseRequested = true;
    this.#cancelPlay(new DOMException("Playback was paused.", "AbortError"));
    this.#player?.pauseVideo();
  }
  get currentTime() {
    return this.#currentTime;
  }
  set currentTime(value) {
    if (this.#pendingRestoration) this.#pendingRestoration.time = value;
    if (this.#currentTime === value) return;
    if (value < this.#duration) this.#ended = false;
    this.#currentTime = value;
    const revision = this.#sourceRevision, seekRevision = ++this.#seekRevision;
    this.#afterLoad((p) => {
      if (revision !== this.#sourceRevision || seekRevision !== this.#seekRevision || p !== this.#player) return;
      const load = this.#loadComplete;
      this.#seekTarget = value;
      this.#seekOrigin = p.getCurrentTime();
      this.#seekStartedAt = Date.now();
      if (!this.#seeking) {
        this.#seeking = true;
        this.dispatchEvent(new Event("seeking"));
      }
      if (load !== this.#loadComplete || revision !== this.#sourceRevision || seekRevision !== this.#seekRevision || p !== this.#player) return;
      p.seekTo(value, true);
    });
    if (value > 0) this.#createPlayer(true);
  }
  get duration() {
    return this.#duration;
  }
  get volume() {
    return this.#volume;
  }
  set volume(value) {
    if (this.#volume === value) return;
    this.#volume = value;
    this.#writtenSettings.add("volume");
    if (this.#playerReady) this.#player?.setVolume(value * 100);
  }
  get muted() {
    return this.#muted;
  }
  set muted(value) {
    if (this.#muted === value) return;
    this.#muted = value;
    this.#writtenSettings.add("muted");
    if (this.#playerReady) {
      if (value) this.#player?.mute();
      else this.#player?.unMute();
    }
  }
  get playbackRate() {
    return this.#playbackRate;
  }
  set playbackRate(value) {
    this.#writtenSettings.add("playbackRate");
    if (this.#playerReady) this.#player?.setPlaybackRate(value);
  }
  /**
  * YouTube plays any rate from 0.25 to 2, rounded down to a step of 0.05, though `getAvailablePlaybackRates` lists
  * only quarter steps.
  *
  * @internal
  */
  get playbackRateRange() {
    return PLAYBACK_RATE_RANGE;
  }
  get autoplay() {
    return this.#autoplay;
  }
  set autoplay(value) {
    this.#autoplay = value;
    if (value) this.#createPlayer();
  }
  get defaultMuted() {
    return this.#defaultMuted;
  }
  set defaultMuted(value) {
    this.#defaultMuted = value;
  }
  get loop() {
    return this.#loop;
  }
  set loop(value) {
    this.#loop = value;
    if (parseYouTubeSource(this.#src)?.kind === "playlist") this.#afterLoad((player) => player.setLoop(value));
  }
  get controls() {
    return this.#controls;
  }
  set controls(value) {
    this.#controls = value;
  }
  get playsInline() {
    return this.#playsInline;
  }
  set playsInline(value) {
    this.#playsInline = value;
  }
  get preload() {
    return this.#preload;
  }
  set preload(value) {
    this.#preload = value;
    if (value !== "none") this.#createPlayer();
  }
  get poster() {
    return this.#poster;
  }
  set poster(value) {
    this.#poster = value;
  }
  /** YouTube URL or id in `src`, plus player parameters under `engine.youtube`. Replacing it re-derives `src`. */
  get source() {
    return this.#source;
  }
  set source(value) {
    const source = value ?? null;
    if (source === this.#source) return;
    const src = source?.src ?? "";
    const srcChanged = this.#src !== src;
    if (this.#textTracks.length) {
      const language = Array.from(this.#textTracks).find((track) => track.mode === "showing")?.language ?? null;
      if (this.#captionPreference === void 0 || language !== this.#captionLanguage) this.#captionPreference = language;
    }
    const engineChanged = !deepEqual(this.#source?.engine?.youtube ?? null, source?.engine?.youtube ?? null);
    this.#pendingEmbedOptions ||= engineChanged;
    this.#source = source;
    this.#src = src;
    if (srcChanged) {
      const revision = ++this.#sourceRevision, attachId = this.#attachId;
      this.#pendingRestoration = null;
      if (!this.#autoplay) this.#pauseRequested = true;
      if (!this.#playerReady) this.#pendingLoad = !!this.#target;
      const load = this.#beginLoad();
      this.#cancelPlay(new DOMException("The YouTube source changed.", "AbortError"));
      if (revision !== this.#sourceRevision || attachId !== this.#attachId || load !== this.#loadComplete) {
        if (this.#target && this.#source === source) this.dispatchEvent(new Event("sourcechange"));
        return;
      }
    }
    const target = this.#target;
    const embedSrc = this.#pendingEmbedOptions && target?.getAttribute("src") ? buildYouTubeIframeSrc(src, this.#snapshotProps()) : "";
    if (target && embedSrc) {
      const parent = target.parentNode;
      if (!srcChanged && this.#loaded && this.#player && !this.#pendingRestoration) this.#pendingRestoration = {
        revision: this.#sourceRevision,
        time: this.#currentTime,
        paused: this.#paused,
        index: parseYouTubeSource(src)?.kind === "playlist" ? this.#player.getPlaylistIndex() : -1
      };
      const nextSibling = target.nextSibling;
      const volume = this.#volume;
      const muted = this.#muted;
      const playbackRate = this.#playbackRate;
      const pendingWrites = this.#pendingWrites;
      const playerSettingsRead = this.#playerSettingsRead;
      const writtenSettings = this.#writtenSettings;
      const restoreSettings = new Set(playerSettingsRead ? PLAYER_SETTINGS : writtenSettings);
      this.#teardown();
      target.src = embedSrc;
      this.#pendingEmbedOptions = false;
      parent?.insertBefore(target, nextSibling);
      this.#target = target;
      this.#volume = volume;
      this.#muted = muted;
      this.#playbackRate = playbackRate;
      this.#restoreSettings = restoreSettings;
      this.#writtenSettings = writtenSettings;
      this.#playerSettingsRead = playerSettingsRead;
      this.#pendingWrites = pendingWrites;
      this.#recreations++;
      const load = this.#beginLoad();
      this.dispatchEvent(new Event("emptied"));
      if (load !== this.#loadComplete || this.#source !== source || this.#target !== target) return;
      this.#createPlayer();
    } else if (srcChanged || engineChanged) this.load();
    if (this.#source !== source) return;
    this.dispatchEvent(new Event("sourcechange"));
  }
  get buffered() {
    return this.#progress > 0 ? createTimeRange(0, this.#progress) : NO_TIME_RANGES_YET;
  }
  get seekable() {
    return this.#duration > 0 && Number.isFinite(this.#duration) ? createTimeRange(0, this.#duration) : NO_TIME_RANGES_YET;
  }
  get error() {
    return this.#error;
  }
  get textTracks() {
    return this.#textTracks;
  }
  get isFullscreen() {
    return this.#isFullscreen;
  }
  async requestFullscreen() {
    if (!this.#target?.requestFullscreen) return;
    await this.#target.requestFullscreen();
    this.#isFullscreen = true;
  }
  async exitFullscreen() {
    const doc = globalThis.document;
    if (doc?.fullscreenElement && doc.fullscreenElement === this.#target) await doc.exitFullscreen();
    this.#isFullscreen = false;
  }
  #createPlayer(force = false) {
    if (!force && this.#preload === "none" && !this.#autoplay && !this.#playRequest) return false;
    const target = this.#target;
    if (!target || this.#player || this.#creatingPlayer) return false;
    if (!target.getAttribute("src") || this.#pendingEmbedOptions) {
      const initialSrc = buildYouTubeIframeSrc(this.#src, this.#snapshotProps());
      if (!initialSrc) {
        this.#loadComplete.resolve();
        return false;
      }
      target.src = initialSrc;
    }
    this.#pendingEmbedOptions = false;
    this.#creatingPlayer = true;
    if (this.#error) {
      this.#error = null;
      this.#errorItem = "";
      this.#readyState = READY_STATE_HAVE_NOTHING;
      this.#beginLoad();
    }
    const creationAttachId = this.#attachId;
    this.dispatchEvent(new Event("loadstart"));
    if (this.#isStale(creationAttachId) || this.#target !== target) return false;
    this.#createPlayerApi(target);
    return true;
  }
  async #createPlayerApi(target) {
    const attachId = this.#attachId;
    let api;
    try {
      api = await loadYouTubeApi();
    } catch {
      if (this.#isStale(attachId)) return;
      this.#creatingPlayer = false;
      const failedLoad = this.#loadComplete;
      this.#error = new MediaError("Failed to load the YouTube iframe API", MediaError.MEDIA_ERR_NETWORK, false);
      this.dispatchEvent(new Event("error"));
      failedLoad.resolve();
      return;
    }
    if (this.#isStale(attachId) || this.#target !== target) return;
    let player;
    try {
      player = new api.Player(target, { events: {
        onReady: () => {
          if (this.#isStale(attachId)) return;
          this.#onPlayerReady();
        },
        onAutoplayBlocked: () => {
          if (this.#isStale(attachId)) return;
          this.#pauseRequested = true;
          this.#cancelPlay(new DOMException("YouTube playback was blocked by the browser.", "NotAllowedError"));
        },
        onError: (event) => {
          if (this.#isStale(attachId)) return;
          this.#onError(event.data);
        }
      } });
    } catch (error) {
      if (this.#isStale(attachId) || this.#target !== target) return;
      this.#creatingPlayer = false;
      const failedLoad = this.#loadComplete;
      console.error("[TylerAustin/VideoPlayer] YouTube SDK initialization failed.", error);
      this.#error = new MediaError("", MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED, false);
      this.dispatchEvent(new Event("error"));
      failedLoad.resolve();
      return;
    }
    this.#player = player;
    this.#creatingPlayer = false;
    this.#bindPlayerEvents(player, attachId);
  }
  #isStale(attachId) {
    return attachId !== this.#attachId;
  }
  #afterLoad(fn) {
    this.#pendingWrites.push(fn);
    this.#flushAfterLoad();
  }
  #flushAfterLoad() {
    const load = this.#loadComplete;
    load.then(() => {
      if (load !== this.#loadComplete) return;
      const player = this.#player;
      if (!player) return;
      while (load === this.#loadComplete && player === this.#player) {
        const write = this.#pendingWrites.shift();
        if (!write) break;
        tryCall(() => write(player));
      }
    }, noop);
  }
  #snapshotProps() {
    return {
      autoplay: this.#autoplay,
      defaultMuted: this.#defaultMuted || this.#muted,
      loop: this.#loop,
      controls: this.#controls,
      playsInline: this.#playsInline,
      preload: this.#preload || YouTubeAdapter2.defaultProps.preload,
      source: this.#source
    };
  }
  #resetState() {
    this.#idlePollAfter = 0;
    this.#captionSignature = "";
    this.#progressItem = "";
    this.#currentTime = 0;
    this.#duration = NaN;
    this.#paused = this.#pauseRequested || !this.#autoplay && !this.#playRequest;
    this.#ended = false;
    this.#progress = 0;
    this.#readyState = READY_STATE_HAVE_NOTHING;
    this.#seeking = false;
    this.#seekTarget = null;
    this.#seekOrigin = null;
    this.#seekStartedAt = 0;
    this.#loaded = false;
    this.#playFired = false;
    this.#error = null;
    this.#isFullscreen = false;
    this.#captionLanguage = null;
    this.#captionSelected = false;
    this.#textTracks.clear();
  }
  #onPlayerReady() {
    this.#playerReady = true;
    const player = this.#player;
    if (player) player.setLoop(parseYouTubeSource(this.#src)?.kind === "playlist" && this.#loop);
    const restore = /* @__PURE__ */ new Set([...this.#restoreSettings, ...this.#writtenSettings]);
    if (restore.size && player) {
      const volume = this.#volume;
      const muted = this.#muted;
      const playbackRate = this.#playbackRate;
      this.#restoreSettings = /* @__PURE__ */ new Set();
      tryCall(() => {
        if (restore.has("volume")) player.setVolume(volume * 100);
        if (restore.has("muted")) {
          if (muted) player.mute();
          else player.unMute();
        }
        if (restore.has("playbackRate")) player.setPlaybackRate(playbackRate);
      });
    }
    if (this.#pendingLoad) {
      this.#pendingLoad = false;
      this.load();
      return;
    }
    this.#onLoaded();
  }
  #onLoaded() {
    if (this.#loaded) return;
    const load = this.#loadComplete, revision = this.#sourceRevision, instance = this.#player;
    this.#loaded = true;
    this.#readyState = READY_STATE_HAVE_METADATA;
    const player = this.#player;
    if (player) {
      this.#duration = player.getDuration() || NaN;
      this.#muted = player.isMuted();
      this.#volume = player.getVolume() / 100;
      this.#playbackRate = player.getPlaybackRate();
      this.#playerSettingsRead = true;
    }
    for (const type of [
      "loadedmetadata",
      "durationchange",
      "volumechange",
      "ratechange",
      "loadcomplete"
    ]) {
      if (load !== this.#loadComplete || revision !== this.#sourceRevision || instance !== this.#player) return;
      this.dispatchEvent(new Event(type));
    }
    if (load !== this.#loadComplete || revision !== this.#sourceRevision || instance !== this.#player) return;
    load.resolve();
    const restore = this.#pendingRestoration;
    this.#pendingRestoration = null;
    if (restore && restore.revision === revision && instance) {
      const parsed = parseYouTubeSource(this.#src);
      if (parsed?.kind === "playlist" && parsed.listId && restore.index >= 0) {
        instance.cuePlaylist({ list: parsed.listId, listType: "playlist", index: restore.index, startSeconds: restore.time });
      } else {
        this.#currentTime = instance.getCurrentTime();
        this.currentTime = restore.time;
      }
      if (!restore.paused && !this.#pauseRequested) this.play().catch((error) => {
        if (error?.name !== "AbortError") console.error("[TylerAustin/VideoPlayer] YouTube state restoration failed.", error);
      });
    }
    this.#startPolling();
  }
  #onError(code) {
    const failedLoad = this.#loadComplete, failedRevision = this.#sourceRevision, failedPlayer = this.#player;
    const error = new MediaError(`YouTube iframe player error #${code}; visit https://developers.google.com/youtube/iframe_api_reference#onError for the full error message.`, youtubeErrorCodeToMediaErrorCode[code] ?? MediaError.MEDIA_ERR_CUSTOM, true);
    error.data = { youtubeErrorCode: code };
    this.#errorItem = parseYouTubeVideoId(this.#player?.getVideoUrl() ?? "") + ":" + this.#player?.getPlaylistIndex();
    this.#error = error;
    this.#stopPolling();
    this.#readyState = this.#loaded ? READY_STATE_HAVE_CURRENT_DATA : READY_STATE_HAVE_NOTHING;
    const wasSeeking = this.#seeking;
    this.#seeking = false;
    this.#seekTarget = null;
    this.#seekOrigin = null;
    this.#seekStartedAt = 0;
    this.#cancelPlay(error);
    if (failedLoad !== this.#loadComplete || failedRevision !== this.#sourceRevision || failedPlayer !== this.#player) {
      failedLoad.resolve();
      return;
    }
    if (wasSeeking) this.dispatchEvent(new Event("seeked"));
    if (failedLoad !== this.#loadComplete || failedRevision !== this.#sourceRevision || failedPlayer !== this.#player) {
      failedLoad.resolve();
      return;
    }
    this.dispatchEvent(new Event("error"));
    failedLoad.resolve();
  }
  #bindPlayerEvents(player, attachId) {
    const emit = (type) => this.dispatchEvent(new Event(type));
    player.addEventListener("onStateChange", ({ data: state }) => {
      if (this.#isStale(attachId)) return;
      const playingRequest = this.#playRequest, stateRevision = this.#sourceRevision, stateSeekRevision = this.#seekRevision;
      if (this.#pauseRequested && (state === 1 || state === 3)) {
        player.pauseVideo();
        return;
      }
      if (this.#error && (state === 1 || state === 3 || state === 5)) {
        const item = parseYouTubeVideoId(player.getVideoUrl()) + ":" + player.getPlaylistIndex();
        if (state === 1 || item !== this.#errorItem) {
          this.#error = null;
          this.#errorItem = "";
          if (this.#loaded) this.dispatchEvent(new Event("loadedmetadata"));
          this.#startPolling();
        }
      }
      if (stateRevision !== this.#sourceRevision || player !== this.#player) return;
      if (this.#src && !this.#loaded && state !== -1) this.#onLoaded();
      if (stateRevision !== this.#sourceRevision || player !== this.#player) return;
      if (state === 1 || state === 3) {
        if (!this.#playFired) {
          this.#playFired = true;
          this.#paused = false;
          this.#ended = false;
          emit("play");
        }
        if (stateRevision !== this.#sourceRevision || player !== this.#player) return;
        if (this.#pauseRequested) {
          player.pauseVideo();
          return;
        }
        this.#syncTextTracks(player);
        if (stateRevision !== this.#sourceRevision || player !== this.#player) return;
      }
      if (state === 3) {
        this.#readyState = READY_STATE_HAVE_CURRENT_DATA;
        emit("waiting");
      } else if (state === 1) {
        if (this.#seeking && this.#seekTarget === null) {
          this.#seeking = false;
          emit("seeked");
          if (stateRevision !== this.#sourceRevision || player !== this.#player) return;
          if (this.#pauseRequested) {
            player.pauseVideo();
            return;
          }
        }
        this.#readyState = READY_STATE_HAVE_FUTURE_DATA;
        this.#paused = false;
        emit("playing");
        this.#resolvePlay(playingRequest);
      } else if (state === 2) {
        const diff = Math.abs(player.getCurrentTime() - this.#currentTime);
        if (!this.#seeking && diff > 0.1) {
          this.#seeking = true;
          emit("seeking");
          if (stateRevision !== this.#sourceRevision || stateSeekRevision !== this.#seekRevision || player !== this.#player || playingRequest !== this.#playRequest) return;
        }
        this.#playFired = false;
        this.#paused = true;
        emit("pause");
      } else if (state === 0) {
        const source = this.#source;
        const wasSeeking = this.#seeking;
        this.#seeking = false;
        this.#seekTarget = this.#seekOrigin = null;
        this.#seekStartedAt = 0;
        this.#playFired = false;
        this.#paused = true;
        this.#ended = true;
        if (wasSeeking) emit("seeked");
        if (!this.#ended || source !== this.#source) return;
        emit("pause");
        if (!this.#ended || source !== this.#source) return;
        emit("ended");
        if (this.#ended && source === this.#source && this.#loop && !this.#pauseRequested && !this.#error && parseYouTubeSource(this.#src)?.kind !== "playlist") {
          this.play().catch((error) => {
            if (error?.name !== "AbortError") console.error("[TylerAustin/VideoPlayer] YouTube loop playback failed.", error);
          });
        }
      }
    });
    player.addEventListener("onPlaybackRateChange", () => {
      if (this.#isStale(attachId)) return;
      this.#playbackRate = player.getPlaybackRate();
      emit("ratechange");
    });
    player.addEventListener("onVolumeChange", () => {
      if (this.#isStale(attachId)) return;
      this.#volume = player.getVolume() / 100;
      this.#muted = player.isMuted();
      emit("volumechange");
    });
    player.addEventListener("onApiChange", () => {
      if (this.#isStale(attachId)) return;
      this.#syncTextTracks(player);
    });
  }
  #startPolling() {
    this.#stopPolling();
    this.#pollInterval = setInterval(() => this.#poll(), 50);
  }
  #stopPolling() {
    if (this.#pollInterval !== null) {
      clearInterval(this.#pollInterval);
      this.#pollInterval = null;
    }
  }
  #hasAppliedSeek(time) {
    const target = this.#seekTarget;
    const origin = this.#seekOrigin;
    if (target === null || origin === null) return false;
    return Date.now() - this.#seekStartedAt >= SEEK_SETTLE_TIMEOUT || time !== origin && Math.abs(time - target) <= SEEK_TOLERANCE;
  }
  #poll() {
    const player = this.#player;
    if (!player) return;
    if (this.#paused && !this.#seeking && !this.#playRequest) {
      const now = performance.now();
      if (now < this.#idlePollAfter) return;
      this.#idlePollAfter = now + 250;
    } else this.#idlePollAfter = 0;
    const revision = this.#sourceRevision, seekRevision = this.#seekRevision, load = this.#loadComplete;
    const isCurrent = () => player === this.#player && revision === this.#sourceRevision && seekRevision === this.#seekRevision && load === this.#loadComplete;
    const emit = (type) => {
      this.dispatchEvent(new Event(type));
      return isCurrent();
    };
    const rate = player.getPlaybackRate();
    if (isNumber(rate) && rate > 0 && rate !== this.#playbackRate) {
      this.#playbackRate = rate;
      if (!emit("ratechange")) return;
    }
    const volume = player.getVolume() / 100, muted = player.isMuted();
    if (isNumber(volume) && volume >= 0 && volume <= 1 && typeof muted === "boolean" && (volume !== this.#volume || muted !== this.#muted)) {
      this.#volume = volume;
      this.#muted = muted;
      if (!emit("volumechange")) return;
    }
    const time = player.getCurrentTime();
    const duration = player.getDuration();
    const videoId = parseYouTubeVideoId(player.getVideoUrl());
    const item = videoId ? videoId + ":" + player.getPlaylistIndex() : "";
    if (item && item !== this.#progressItem) {
      const changed = this.#progressItem !== "";
      this.#progressItem = item;
      if (changed) {
        const wasSeeking2 = this.#seeking;
        this.#seekTarget = null;
        this.#seekOrigin = null;
        this.#seekStartedAt = 0;
        this.#seeking = false;
        this.#ended = false;
        this.#currentTime = time;
        this.#duration = duration > 0 ? duration : NaN;
        this.#progress = 0;
        if (!emit("durationchange")) return;
        if (!emit("timeupdate")) return;
        if (!emit("progress")) return;
        if (wasSeeking2) {
          if (!emit("seeked")) return;
        }
      }
    }
    const bufferedEnd = player.getVideoLoadedFraction() * duration;
    const wasSeeking = this.#seeking;
    const appliedSeek = this.#hasAppliedSeek(time);
    if (!wasSeeking && player.getPlayerState() !== 1 && Math.abs(time - this.#currentTime) > 0.1) {
      this.#seeking = true;
      if (!emit("seeking")) return;
    }
    if ((this.#seekTarget === null || appliedSeek) && time !== this.#currentTime) {
      this.#currentTime = time;
      if (!emit("timeupdate")) return;
    }
    if (wasSeeking && (appliedSeek || this.#seekTarget === null && bufferedEnd > 0.1)) {
      this.#seeking = false;
      this.#seekTarget = null;
      this.#seekOrigin = null;
      this.#seekStartedAt = 0;
      if (!emit("seeked")) return;
    }
    if (isNumber(duration) && duration > 0 && duration !== this.#duration) {
      this.#duration = duration;
      if (!emit("durationchange")) return;
    }
    if (bufferedEnd !== this.#progress) {
      this.#progress = bufferedEnd;
      if (player.getPlayerState() === 1 && duration > 0 && bufferedEnd >= duration) this.#readyState = READY_STATE_HAVE_ENOUGH_DATA;
      if (!emit("progress")) return;
    }
  }
  #syncTextTracks(player) {
    const tracklist = player.getOption("captions", "tracklist") ?? [];
    const current = player.getOption("captions", "track");
    const preference = this.#captionPreference;
    const available = preference === null || tracklist.some((track) => track.languageCode === preference);
    const language = preference !== void 0 && available ? preference : isObject(current) ? current.languageCode || null : null;
    const signature = JSON.stringify([player.getVideoUrl(), preference, language, tracklist.map((track) => [track.languageCode, track.displayName])]);
    if (signature === this.#captionSignature) return;
    this.#captionSignature = signature;
    this.#textTracks.clear();
    for (const track of tracklist) this.#addTextTrack(track);
    if (isObject(current)) this.#addTextTrack(current);
    this.#captionLanguage = language;
    for (const track of this.#textTracks) track.mode = track.language === language ? "showing" : "disabled";
    if (preference !== void 0 && available && tracklist.length) player.setOption("captions", "track", language ? { languageCode: language } : {});
  }
  #addTextTrack({ languageCode, displayName }) {
    if (!languageCode || this.#textTracks.getTrackByLanguage(languageCode)) return;
    this.#textTracks.add(displayName ?? "", languageCode);
  }
  #onTextTracksChange() {
    const player = this.#player;
    if (!player) return;
    const language = Array.from(this.#textTracks).find((track) => track.mode === "showing")?.language ?? null;
    if (language === this.#captionLanguage) return;
    this.#captionLanguage = language;
    this.#captionSelected = true;
    this.#captionPreference = language;
    tryCall(() => player.setOption("captions", "track", language ? { languageCode: language } : {}));
  }
};
var PLAYBACK_RATE_RANGE = {
  min: 0.25,
  max: 2
};
var READY_STATE_HAVE_NOTHING = 0;
var READY_STATE_HAVE_METADATA = 1;
var READY_STATE_HAVE_CURRENT_DATA = 2;
var READY_STATE_HAVE_FUTURE_DATA = 3;
var READY_STATE_HAVE_ENOUGH_DATA = 4;

export {
  throttle,
  buildYouTubeIframeSrc,
  YouTubeAdapter
};
