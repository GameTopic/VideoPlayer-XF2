import {
  VideoProvider
} from "./chunk-TEQLIHLF.min.js";
import "./chunk-FUPFGJXT.min.js";
import {
  coerceToError
} from "./chunk-75VQWXMD.min.js";
import "./chunk-4C7PIW7M.min.js";
import {
  QualitySymbol
} from "./chunk-XNIC3KWX.min.js";
import {
  TextTrack,
  TextTrackSymbol
} from "./chunk-QKSJYQLF.min.js";
import "./chunk-OPFURCQW.min.js";
import {
  ListSymbol,
  RAFLoop
} from "./chunk-ZW4R63AC.min.js";
import {
  loadScript,
  preconnect
} from "./chunk-3B4S3VWV.min.js";
import {
  IS_CHROME,
  isHLSSupported
} from "./chunk-4MKIV6VZ.min.js";
import {
  DOMEvent,
  camelToKebabCase,
  effect,
  isFunction,
  isString,
  isUndefined,
  listenEvent,
  onDispose,
  peek,
  scoped
} from "./chunk-UMQWA6KQ.min.js";

// node_modules/vidstack/prod/providers/vidstack-hls.js
var toDOMEventType = (type) => camelToKebabCase(type);
var HLSController = class {
  #video;
  #ctx;
  #instance = null;
  #sourceUrl = "";
  #sourceRevision = 0;
  #textTrackEvent = null;
  #levelLoadedEvent = null;
  #ownedTracks = /* @__PURE__ */ new Set();
  #closedCaptionTracks = /* @__PURE__ */ new Set();
  #pendingCaption = null;
  #captionMutations = /* @__PURE__ */ new Set();
  #mediaRecoveryUsed = false;
  #errorEvent = null;
  #cueEvent = null;
  #stopLiveSync = null;
  #syncingQualities = false;
  #syncingAudioTracks = false;
  config = {};
  #callbacks = /* @__PURE__ */ new Set();
  get instance() {
    return this.#instance;
  }
  constructor(video, ctx) {
    this.#video = video;
    this.#ctx = ctx;
  }
  setup(ctor) {
    const { streamType } = this.#ctx.$state;
    const isLive = peek(streamType).includes("live"), isLiveLowLatency = peek(streamType).includes("ll-");
    const instance = this.#instance = new ctor({
      lowLatencyMode: isLiveLowLatency,
      backBufferLength: isLiveLowLatency ? 4 : isLive ? 8 : void 0,
      renderTextTracksNatively: false,
      ...this.config
    });
    const guard = (callback) => (eventType, data) => {
      if (this.#instance !== instance) return;
      callback(eventType, data);
    };
    const dispatcher = guard((eventType, data) => {
      const revision = this.#sourceRevision;
      const cueTrack = eventType === ctor.Events.CUES_PARSED ? Array.from(this.#ownedTracks).find((track) => track.id === "hls-" + data.type + "-" + data.track) : null;
      this.#dispatchHLSEvent(eventType, data);
      if (eventType === ctor.Events.NON_NATIVE_TEXT_TRACKS_FOUND || eventType === ctor.Events.SUBTITLE_TRACKS_UPDATED) {
        this.#textTrackEvent = { eventType, data, revision };
      }
      if (eventType === ctor.Events.LEVEL_LOADED) this.#levelLoadedEvent = { data, revision };
      if (eventType === ctor.Events.ERROR) this.#errorEvent = { data, revision };
      if (eventType === ctor.Events.CUES_PARSED) this.#cueEvent = this.#instance === instance && this.#sourceRevision === revision ? { data, revision, track: cueTrack } : null;
    });
    for (const event of Object.values(ctor.Events)) instance.on(event, dispatcher);
    instance.on(ctor.Events.ERROR, guard(this.#onError.bind(this)));
    for (const callback of this.#callbacks) {
      callback(instance);
      if (this.#instance !== instance) return;
    }
    this.#ctx.player.dispatch("hls-instance", { detail: instance });
    if (this.#instance !== instance) return;
    instance.attachMedia(this.#video);
    if (this.#instance !== instance) return;
    instance.on(ctor.Events.AUDIO_TRACK_SWITCHED, guard(this.#onAudioSwitch.bind(this)));
    instance.on(ctor.Events.AUDIO_TRACKS_UPDATED, guard(this.#onAudioTracksUpdated.bind(this, instance)));
    instance.on(ctor.Events.LEVEL_SWITCHED, guard(this.#onLevelSwitched.bind(this)));
    instance.on(ctor.Events.LEVEL_LOADED, guard(this.#onLevelLoaded.bind(this, instance)));
    instance.on(ctor.Events.LEVEL_UPDATED, guard(this.#onLevelUpdated.bind(this)));
    instance.on(ctor.Events.LEVELS_UPDATED, guard(this.#onLevelsUpdated.bind(this, instance)));
    instance.on(ctor.Events.NON_NATIVE_TEXT_TRACKS_FOUND, guard(this.#onTracksFound.bind(this, instance)));
    instance.on(ctor.Events.SUBTITLE_TRACKS_UPDATED, guard((eventType, data) => {
      if (!data.subtitleTracks.length) this.#onTracksFound(instance, eventType, { tracks: [] }, data);
    }));
    instance.on(ctor.Events.CUES_PARSED, guard(this.#onCuesParsed.bind(this, instance)));
    this.#ctx.qualities[QualitySymbol.enableAuto] = this.#enableAutoQuality.bind(this);
    listenEvent(this.#ctx.qualities, "change", this.#onUserQualityChange.bind(this));
    listenEvent(this.#ctx.audioTracks, "change", this.#onUserAudioChange.bind(this));
    listenEvent(this.#ctx.textTracks, "tyl-player-captions-off-request", () => {
      this.#pendingCaption = false;
    });
    this.#ctx.player.listen("media-text-track-change-request", (event) => {
      if (event.defaultPrevented) return;
      const track = this.#ctx.textTracks[event.detail.index];
      if (track && (track.kind === "captions" || track.kind === "subtitles")) {
        if (event.detail.mode === "showing") this.#pendingCaption = null;
        if (event.detail.mode === "disabled" && (!this.#ctx.textTracks.selected || this.#ctx.textTracks.selected === track)) {
          this.#ctx.textTracks.dispatchEvent(new Event("tyl-player-captions-off-request"));
        }
      }
    });
    listenEvent(this.#ctx.textTracks, "mode-change", (event) => {
      const track = event.detail;
      if (this.#captionMutations.has(track) || event.originEvent?.type === "tyl-player-caption-auto-select") return;
      if (track.kind === "captions" || track.kind === "subtitles") this.#pendingCaption = null;
    });
    this.#stopLiveSync = effect(this.#liveSync.bind(this));
  }
  #createDOMEvent(type, data) {
    return new DOMEvent(toDOMEventType(type), { detail: data });
  }
  #liveSync() {
    if (!this.#ctx.$state.live()) return;
    const raf = new RAFLoop(this.#liveSyncPosition.bind(this));
    raf.start();
    return raf.stop.bind(raf);
  }
  #liveSyncPosition() {
    this.#ctx.$state.liveSyncPosition.set(this.#instance?.liveSyncPosition ?? Infinity);
  }
  #dispatchHLSEvent(type, data) {
    this.#ctx.player?.dispatch(this.#createDOMEvent(type, data));
  }
  #onTracksFound(instance, eventType, data, original = data) {
    const event = this.#createDOMEvent(eventType, data);
    const captionBatch = data.tracks.length > 0 && data.tracks.every((track) => track._id != null);
    const incomingIds = new Set(data.tracks.map((track) => "hls-" + track.kind + "-" + track._id));
    const source = this.#sourceUrl;
    const ownership = this.#textTrackEvent, revision = this.#sourceRevision;
    const isSourceCurrent = () => this.#instance === instance && this.#sourceUrl === source && this.#sourceRevision === revision;
    const isCurrent = () => isSourceCurrent() && ownership?.revision === revision && (captionBatch || data.tracks.length === instance.subtitleTracks.length && data.tracks.every((track, index) => track.subtitleTrack === instance.subtitleTracks[index]));
    if (!isCurrent() || ownership.eventType !== eventType || ownership.data !== original) return;
    for (const track of Array.from(this.#ownedTracks)) {
      const caption = this.#closedCaptionTracks.has(track);
      if (captionBatch ? !caption || !incomingIds.has(track.id) : caption) continue;
      if (this.#pendingCaption == null && track === this.#ctx.textTracks.selected && track.mode === "showing") {
        this.#pendingCaption = { id: track.id, kind: track.kind, language: track.language, label: track.label, cc: caption };
      }
      track[TextTrackSymbol.onModeChange] = null;
      this.#ownedTracks.delete(track);
      this.#closedCaptionTracks.delete(track);
      this.#captionMutations.add(track);
      try {
        this.#ctx.textTracks.remove(track, event);
      } finally {
        this.#captionMutations.delete(track);
      }
      if (!isCurrent()) return;
    }
    let currentTrack = -1;
    for (let i = 0; i < data.tracks.length; i++) {
      const nonNativeTrack = data.tracks[i], init = nonNativeTrack.subtitleTrack ?? nonNativeTrack.closedCaptions, track = new TextTrack({
        id: `hls-${nonNativeTrack.kind}-${nonNativeTrack._id ?? (nonNativeTrack.default ? "default" : "subtitles" + i)}`,
        src: init?.url,
        label: nonNativeTrack.label,
        language: init?.lang,
        kind: nonNativeTrack.kind,
        default: nonNativeTrack.default
      });
      track[TextTrackSymbol.readyState] = 2;
      track[TextTrackSymbol.onModeChange] = () => {
        if (!isSourceCurrent() || nonNativeTrack._id != null) return;
        if (track.mode === "showing") {
          instance.subtitleTrack = i;
          currentTrack = i;
        } else if (currentTrack === i) {
          instance.subtitleTrack = -1;
          currentTrack = -1;
        }
      };
      this.#ownedTracks.add(track);
      if (nonNativeTrack._id != null) this.#closedCaptionTracks.add(track);
      this.#ctx.textTracks.add(track, event);
      if (!isCurrent()) return;
    }
    const restore = this.#pendingCaption, active = this.#ctx.textTracks.selected;
    if (restore && (!active || this.#ownedTracks.has(active))) {
      const track = Array.from(this.#ownedTracks).find((track2) => restore.cc ? this.#closedCaptionTracks.has(track2) && track2.id === restore.id : !this.#closedCaptionTracks.has(track2) && track2.kind === restore.kind && track2.language === restore.language && track2.label === restore.label);
      if (track) {
        this.#pendingCaption = null;
        this.#captionMutations.add(track);
        try {
          track.setMode("showing", event);
        } finally {
          this.#captionMutations.delete(track);
        }
      }
    }
  }
  #onCuesParsed(instance, eventType, data) {
    const ownership = this.#cueEvent, revision = this.#sourceRevision;
    this.#cueEvent = null;
    const track = ownership?.track;
    const isCurrent = () => this.#instance === instance && this.#sourceRevision === revision && this.#ownedTracks.has(track) && this.#ctx.textTracks.indexOf(track) >= 0;
    if (!ownership || ownership.data !== data || ownership.revision !== revision || !isCurrent()) return;
    const event = this.#createDOMEvent(eventType, data);
    for (const cue of data.cues) {
      if (!isCurrent()) return;
      cue.positionAlign = "auto";
      track.addCue(cue, event);
    }
  }
  #onAudioTracksUpdated(instance, eventType, data) {
    if (!this.#ctx.$state.canPlay()) return;
    const audioTracks = this.#ctx.audioTracks, remote = data.audioTracks;
    const source = this.#ctx.$state.source(), trigger = this.#createDOMEvent(eventType, data);
    const isCurrent = () => this.#instance === instance && instance.audioTracks === remote && this.#ctx.$state.source() === source;
    if (!isCurrent()) return;
    const previousSync = this.#syncingAudioTracks;
    this.#syncingAudioTracks = true;
    try {
      for (const track of audioTracks.toArray()) {
        if (track.selected) {
          audioTracks[ListSymbol.select](track, false, trigger);
          if (!isCurrent()) return;
        }
        audioTracks[ListSymbol.remove](track, trigger);
        if (!isCurrent()) return;
      }
      for (const track of remote) {
        audioTracks[ListSymbol.add]({
          id: track.id.toString(),
          label: track.name,
          language: track.lang || "",
          kind: "main"
        }, trigger);
        if (!isCurrent()) return;
      }
      const selected = audioTracks[instance.audioTrack];
      if (selected) audioTracks[ListSymbol.select](selected, true, trigger);
    } finally {
      this.#syncingAudioTracks = previousSync;
    }
  }
  #onAudioSwitch(eventType, data) {
    const track = this.#ctx.audioTracks[data.id];
    if (track) {
      const trigger = this.#createDOMEvent(eventType, data);
      this.#ctx.audioTracks[ListSymbol.select](track, true, trigger);
    }
  }
  #onLevelsUpdated(instance, eventType, data) {
    if (!this.#ctx.$state.canPlay()) return;
    const qualities = this.#ctx.qualities, levels = data.levels, trigger = this.#createDOMEvent(eventType, data);
    const source = this.#ctx.$state.source(), revision = this.#sourceRevision;
    const isCurrent = () => this.#instance === instance && instance.levels === levels && this.#ctx.$state.source() === source && this.#sourceRevision === revision;
    if (!isCurrent()) return;
    const auto = instance.autoLevelEnabled, manualLevel = instance.manualLevel;
    const previousSync = this.#syncingQualities;
    this.#syncingQualities = true;
    try {
      for (const quality of qualities.toArray()) {
        if (quality.selected) {
          qualities[ListSymbol.select](quality, false, trigger);
          if (!isCurrent()) return;
        }
        qualities[ListSymbol.remove](quality, trigger);
        if (!isCurrent()) return;
      }
      for (const level of levels) {
        qualities[ListSymbol.add]({
          id: level.id?.toString() ?? level.height + "p",
          width: level.width,
          height: level.height,
          codec: level.codecSet,
          bitrate: level.bitrate
        }, trigger);
        if (!isCurrent()) return;
      }
      qualities[QualitySymbol.setAuto](auto, trigger);
      if (!isCurrent()) return;
      const selected = qualities[auto ? instance.currentLevel : manualLevel];
      if (selected) qualities[ListSymbol.select](selected, true, trigger);
    } finally {
      this.#syncingQualities = previousSync;
    }
  }
  #onLevelSwitched(eventType, data) {
    const quality = this.#ctx.qualities[data.level];
    if (quality) {
      const trigger = this.#createDOMEvent(eventType, data);
      this.#ctx.qualities[ListSymbol.select](quality, true, trigger);
    }
  }
  #onLevelUpdated(eventType, data) {
    if (data.details.totalduration > 0) this.#ctx.$state.inferredLiveDVRWindow.set(data.details.totalduration);
  }
  #onLevelLoaded(instance, eventType, data) {
    if (this.#ctx.$state.canPlay()) return;
    const media = instance.media, source = this.#ctx.$state.source(), revision = this.#sourceRevision;
    const ownership = this.#levelLoadedEvent;
    const isCurrent = () => this.#instance === instance && this.#sourceRevision === revision && this.#ctx.$state.source() === source && instance.media === media && ownership?.data === data && ownership.revision === revision;
    if (!media || !isCurrent()) return;
    const { type, live, totalduration: duration, targetduration } = data.details, trigger = this.#createDOMEvent(eventType, data);
    this.#ctx.notify("stream-type-change", live ? type === "EVENT" && Number.isFinite(duration) && targetduration >= 10 ? "live:dvr" : "live" : "on-demand", trigger);
    if (!isCurrent()) return;
    this.#ctx.notify("duration-change", duration, trigger);
    if (!isCurrent()) return;
    if (instance.currentLevel === -1) this.#ctx.qualities[QualitySymbol.setAuto](true, trigger);
    if (!isCurrent()) return;
    for (const remoteTrack of instance.audioTracks) {
      const localTrack = {
        id: remoteTrack.id.toString(),
        label: remoteTrack.name,
        language: remoteTrack.lang || "",
        kind: "main"
      };
      this.#ctx.audioTracks[ListSymbol.add](localTrack, trigger);
      if (!isCurrent()) return;
    }
    for (const level of instance.levels) {
      const videoQuality = {
        id: level.id?.toString() ?? level.height + "p",
        width: level.width,
        height: level.height,
        codec: level.codecSet,
        bitrate: level.bitrate
      };
      this.#ctx.qualities[ListSymbol.add](videoQuality, trigger);
      if (!isCurrent()) return;
    }
    if (isCurrent()) media.dispatchEvent(new DOMEvent("canplay", { trigger }));
  }
  #onError(eventType, data) {
    const instance = this.#instance, revision = this.#sourceRevision, event = this.#errorEvent;
    if (!instance || event?.revision !== revision || event.data !== data) return;
    const isCurrent = () => this.#instance === instance && this.#sourceRevision === revision;
    if (!data.fatal) return;
    const code = data.type === "networkError" ? 2 : data.type === "mediaError" ? 3 : 4;
    if (data.type === "mediaError" && !this.#mediaRecoveryUsed && this.#instance) {
      this.#mediaRecoveryUsed = true;
      try {
        instance.recoverMediaError();
        return;
      } catch (error) {
        this.#onFatalError(error, code, isCurrent);
        return;
      }
    }
    this.#onFatalError(data.error ?? data.details ?? "HLS playback failed.", code, isCurrent);
  }
  #onFatalError(reason, code, isCurrent) {
    if (!isCurrent()) return;
    const error = coerceToError(reason);
    this.#video.pause();
    if (!isCurrent()) return;
    this.#ctx.notify("error", { message: error.message, code, error });
  }
  #enableAutoQuality() {
    if (this.#instance) this.#instance.currentLevel = -1;
  }
  #onUserQualityChange() {
    const { qualities } = this.#ctx;
    if (!this.#instance || this.#syncingQualities || qualities.auto) return;
    this.#instance[qualities.switch + "Level"] = qualities.selectedIndex;
    if (IS_CHROME) this.#video.currentTime = this.#video.currentTime;
  }
  #onUserAudioChange() {
    const { audioTracks } = this.#ctx;
    if (this.#instance && !this.#syncingAudioTracks && this.#instance.audioTrack !== audioTracks.selectedIndex) this.#instance.audioTrack = audioTracks.selectedIndex;
  }
  onInstance(callback) {
    this.#callbacks.add(callback);
    return () => this.#callbacks.delete(callback);
  }
  loadSource(src) {
    if (!isString(src.src)) return;
    this.#errorEvent = null;
    this.#cueEvent = null;
    this.#mediaRecoveryUsed = false;
    const selected = this.#ctx.textTracks.selected;
    if (src.src !== this.#sourceUrl || selected && !this.#ownedTracks.has(selected)) this.#pendingCaption = null;
    else if (this.#pendingCaption == null && selected && this.#ownedTracks.has(selected)) {
      this.#pendingCaption = { id: selected.id, kind: selected.kind, language: selected.language, label: selected.label, cc: this.#closedCaptionTracks.has(selected) };
    }
    const revision = ++this.#sourceRevision;
    this.#textTrackEvent = null;
    this.#levelLoadedEvent = null;
    for (const track of Array.from(this.#ownedTracks)) {
      track[TextTrackSymbol.onModeChange] = null;
      this.#ownedTracks.delete(track);
      this.#closedCaptionTracks.delete(track);
      this.#captionMutations.add(track);
      try {
        this.#ctx.textTracks.remove(track);
      } finally {
        this.#captionMutations.delete(track);
      }
      if (revision !== this.#sourceRevision) return;
    }
    this.#sourceUrl = src.src;
    this.#instance?.loadSource(src.src);
  }
  destroy() {
    this.#errorEvent = null;
    this.#cueEvent = null;
    this.#sourceRevision++;
    this.#textTrackEvent = null;
    this.#levelLoadedEvent = null;
    this.#pendingCaption = null;
    for (const track of this.#ownedTracks) this.#ctx.textTracks.remove(track);
    this.#ownedTracks.clear();
    this.#closedCaptionTracks.clear();
    this.#captionMutations.clear();
    this.#instance?.destroy();
    this.#instance = null;
    this.#stopLiveSync?.();
    this.#stopLiveSync = null;
  }
};
var HLSLibLoader = class {
  #lib;
  #ctx;
  #callback;
  #disposed = false;
  constructor(lib, ctx, callback) {
    this.#lib = lib;
    this.#ctx = ctx;
    this.#callback = callback;
    onDispose(() => {
      this.#disposed = true;
    });
    this.#startLoading();
  }
  async #startLoading() {
    const callbacks = {
      onLoadStart: this.#onLoadStart.bind(this),
      onLoaded: this.#onLoaded.bind(this),
      onLoadError: this.#onLoadError.bind(this)
    };
    let ctor = await loadHLSScript(this.#lib, callbacks);
    if (this.#disposed) return null;
    if (isUndefined(ctor) && !isString(this.#lib)) ctor = await importHLS(this.#lib, callbacks);
    if (this.#disposed || !ctor) return null;
    if (!ctor.isSupported()) {
      const message = "[vidstack] `hls.js` is not supported in this environment";
      this.#ctx.player.dispatch(new DOMEvent("hls-unsupported"));
      this.#ctx.notify("error", {
        message,
        code: 4
      });
      return null;
    }
    return ctor;
  }
  #onLoadStart() {
    if (this.#disposed) return;
    this.#ctx.player.dispatch(new DOMEvent("hls-lib-load-start"));
  }
  #onLoaded(ctor) {
    if (this.#disposed) return;
    this.#ctx.player.dispatch(new DOMEvent("hls-lib-loaded", { detail: ctor }));
    if (!this.#disposed) this.#callback(ctor);
  }
  #onLoadError(e) {
    if (this.#disposed) return;
    const error = coerceToError(e);
    this.#ctx.player.dispatch(new DOMEvent("hls-lib-load-error", { detail: error }));
    if (this.#disposed) return;
    this.#ctx.notify("error", {
      message: error.message,
      code: 4,
      error
    });
  }
};
async function importHLS(loader, callbacks = {}) {
  if (isUndefined(loader)) return void 0;
  callbacks.onLoadStart?.();
  if (loader.prototype && loader.prototype !== Function) {
    callbacks.onLoaded?.(loader);
    return loader;
  }
  try {
    const ctor = (await loader())?.default;
    if (ctor && !!ctor.isSupported) callbacks.onLoaded?.(ctor);
    else throw Error("");
    return ctor;
  } catch (err) {
    callbacks.onLoadError?.(err);
  }
}
async function loadHLSScript(src, callbacks = {}) {
  if (!isString(src)) return void 0;
  callbacks.onLoadStart?.();
  try {
    await loadScript(src);
    if (!isFunction(window.Hls)) throw Error("");
    const ctor = window.Hls;
    callbacks.onLoaded?.(ctor);
    return ctor;
  } catch (err) {
    callbacks.onLoadError?.(err);
  }
}
var JS_DELIVR_CDN = "https://cdn.jsdelivr.net";
var HLSProvider = class extends VideoProvider {
  $$PROVIDER_TYPE = "HLS";
  #ctor = null;
  #controller = new HLSController(this.video, this.ctx);
  /**
  * The `hls.js` constructor.
  */
  get ctor() {
    return this.#ctor;
  }
  /**
  * The current `hls.js` instance.
  */
  get instance() {
    return this.#controller.instance;
  }
  /**
  * Whether `hls.js` is supported in this environment.
  */
  static supported = isHLSSupported();
  get type() {
    return "hls";
  }
  get canLiveSync() {
    return true;
  }
  #library = `${JS_DELIVR_CDN}/npm/hls.js@^1.5.0/dist/hls.min.js`;
  /**
  * The `hls.js` configuration object.
  *
  * @see {@link https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning}
  */
  get config() {
    return this.#controller.config;
  }
  set config(config) {
    this.#controller.config = config;
  }
  /**
  * The `hls.js` constructor (supports dynamic imports) or a URL of where it can be found.
  *
  * @defaultValue `https://cdn.jsdelivr.net/npm/hls.js@^1.0.0/dist/hls.min.js`
  */
  get library() {
    return this.#library;
  }
  set library(library) {
    this.#library = library;
  }
  preconnect() {
    if (!isString(this.#library)) return;
    preconnect(this.#library);
  }
  setup() {
    super.setup();
    let disposed = false;
    onDispose(() => {
      disposed = true;
    });
    new HLSLibLoader(this.#library, this.ctx, (ctor) => {
      if (disposed) return;
      this.#ctor = ctor;
      scoped(() => this.#controller.setup(ctor), this.scope);
      if (disposed) return;
      this.ctx.notify("provider-setup", this);
      if (disposed) return;
      const src = peek(this.ctx.$state.source);
      if (src) this.loadSource(src);
    });
  }
  async loadSource(src, preload) {
    if (!isString(src.src)) {
      this.removeSource();
      return;
    }
    this.media.preload = preload || "";
    this.appendSource(src, "application/x-mpegurl");
    this.#controller.loadSource(src);
    this.currentSrc = src;
  }
  /**
  * The given callback is invoked when a new `hls.js` instance is created and right before it's
  * attached to media.
  */
  onInstance(callback) {
    const instance = this.#controller.instance;
    if (instance) callback(instance);
    return this.#controller.onInstance(callback);
  }
  destroy() {
    this.#controller.destroy();
  }
};
export {
  HLSProvider
};
