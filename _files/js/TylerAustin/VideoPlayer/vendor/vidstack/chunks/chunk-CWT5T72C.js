import {
  EmbedProvider
} from "./chunk-W24ZH6VD.min.js";
import {
  TimeRange
} from "./chunk-A24BZCXF.min.js";
import {
  preconnect
} from "./chunk-3B4S3VWV.min.js";
import {
  createScope,
  deferredPromise,
  effect,
  isBoolean,
  isNumber,
  isObject,
  isString,
  signal
} from "./chunk-UMQWA6KQ.min.js";
import {
  resolveYouTubeVideoId
} from "./chunk-6TS356ZP.min.js";

// node_modules/vidstack/prod/providers/vidstack-youtube.js
var YouTubePlayerState = {
  Unstarted: -1,
  Ended: 0,
  Playing: 1,
  Paused: 2,
  Buffering: 3,
  Cued: 5
};
var YouTubeProvider = class extends EmbedProvider {
  $$PROVIDER_TYPE = "YOUTUBE";
  scope = createScope();
  #ctx;
  #videoId = signal("");
  #sourceIdentity = signal("");
  #state = -1;
  #currentSrc = null;
  #listeningTimer = -1;
  #seekingTimer = -1;
  #seekRevision = 0;
  #progressVideoId = "";
  #pauseRequested = false;
  #failedVideoId = "";
  #invalidPlay = false;
  #promises = /* @__PURE__ */ new Map();
  constructor(iframe, ctx) {
    super(iframe);
    this.#ctx = ctx;
  }
  /**
  * Sets the player's interface language. The parameter value is an ISO 639-1 two-letter
  * language code or a fully specified locale. For example, fr and fr-ca are both valid values.
  * Other language input codes, such as IETF language tags (BCP 47) might also be handled properly.
  *
  * The interface language is used for tooltips in the player and also affects the default caption
  * track. Note that YouTube might select a different caption track language for a particular
  * user based on the user's individual language preferences and the availability of caption tracks.
  *
  * @defaultValue 'en'
  */
  language = "en";
  color = "red";
  /**
  * Whether cookies should be enabled on the embed. This is turned off by default to be
  * GDPR-compliant.
  *
  * @defaultValue `false`
  */
  cookies = false;
  get currentSrc() {
    return this.#currentSrc;
  }
  get type() {
    return "youtube";
  }
  get videoId() {
    return this.#videoId();
  }
  preconnect() {
    preconnect(this.getOrigin());
  }
  setup() {
    super.setup();
    effect(this.#watchVideoId.bind(this));
    this.#ctx.notify("provider-setup", this);
  }
  destroy() {
    this.#reset();
    const message = "provider destroyed";
    for (const promises of this.#promises.values()) for (const { reject } of promises) reject(message);
    this.#promises.clear();
  }
  async play() {
    this.#pauseRequested = false;
    return this.#promises.get("playVideo")?.[0]?.promise ?? this.#remote("playVideo");
  }
  #playFail(message) {
    this.#getPromise("playVideo")?.reject(message);
  }
  async pause() {
    this.#pauseRequested = true;
    this.#rejectPlay(new DOMException("Playback was paused.", "AbortError"));
    if (this.#state !== YouTubePlayerState.Playing && this.#state !== YouTubePlayerState.Buffering) {
      this.postMessage({ event: "command", func: "pauseVideo", args: [] });
      return;
    }
    return this.#promises.get("pauseVideo")?.[0]?.promise ?? this.#remote("pauseVideo");
  }
  #rejectPlay(error) {
    for (const request of this.#promises.get("playVideo")?.splice(0) ?? []) request.reject(error);
  }
  #pauseFail(message) {
    this.#getPromise("pauseVideo")?.reject(message);
  }
  setMuted(muted) {
    if (muted) this.postMessage({ event: "command", func: "mute", args: [] });
    else this.postMessage({ event: "command", func: "unMute", args: [] });
  }
  setCurrentTime(time) {
    this.#seekRevision++;
    window.clearTimeout(this.#seekingTimer);
    this.#seekingTimer = -1;
    this.postMessage({ event: "command", func: "seekTo", args: [time, true] });
    this.#ctx.notify("seeking", time);
  }
  setVolume(volume) {
    this.postMessage({ event: "command", func: "setVolume", args: [volume * 100] });
  }
  setPlaybackRate(rate) {
    this.postMessage({ event: "command", func: "setPlaybackRate", args: [rate] });
  }
  async loadSource(src) {
    if (!isString(src.src)) {
      this.#currentSrc = null;
      this.#sourceIdentity.set("");
      this.#videoId.set("");
      return;
    }
    const videoId = resolveYouTubeVideoId(src.src);
    this.#currentSrc = src;
    this.#sourceIdentity.set(src.src);
    this.#videoId.set(videoId ?? "");
  }
  getOrigin() {
    return !this.cookies ? "https://www.youtube-nocookie.com" : "https://www.youtube.com";
  }
  #watchVideoId() {
    this.#sourceIdentity();
    this.#reset();
    const videoId = this.#videoId();
    if (!videoId) {
      this.src.set("");
      return;
    }
    const url = new URL(this.getOrigin() + "/embed/" + videoId);
    const params = this.buildParams();
    if (params.list) {
      url.searchParams.set("list", params.list);
      url.searchParams.set("start", String(params.start ?? 0));
    }
    this.src.set(url.href);
    this.#ctx.notify("load-start");
  }
  buildParams() {
    const { keyDisabled } = this.#ctx.$props, { muted, playsInline, nativeControls } = this.#ctx.$state, showControls = nativeControls();
    return {
      rel: 0,
      autoplay: 0,
      cc_lang_pref: this.language,
      cc_load_policy: showControls ? 1 : void 0,
      color: this.color,
      controls: showControls ? 1 : 0,
      disablekb: !showControls || keyDisabled() ? 1 : 0,
      enablejsapi: 1,
      origin: window.location.origin,
      fs: 1,
      hl: this.language,
      iv_load_policy: showControls ? 1 : 3,
      mute: muted() ? 1 : 0,
      playsinline: playsInline() ? 1 : 0
    };
  }
  #remote(command, arg) {
    let promise = deferredPromise(), promises = this.#promises.get(command);
    if (!promises) this.#promises.set(command, promises = []);
    promises.push(promise);
    const args = Array.isArray(arg) ? arg : arg ? [arg] : void 0;
    this.postMessage({
      event: "command",
      func: command,
      args
    });
    return promise.promise;
  }
  onLoad() {
    window.clearTimeout(this.#listeningTimer);
    this.#listeningTimer = window.setTimeout(() => {
      this.#listeningTimer = -1;
      this.postMessage({ event: "listening" });
    }, 100);
  }
  #onReady(trigger, isCurrent) {
    if (!isCurrent()) return;
    this.#ctx.notify("loaded-metadata");
    if (!isCurrent()) return;
    this.#ctx.notify("loaded-data");
    if (!isCurrent()) return;
    this.#ctx.delegate.ready(void 0, trigger);
  }
  #onPause(trigger) {
    this.#getPromise("pauseVideo")?.resolve();
    this.#ctx.notify("pause", void 0, trigger);
  }
  #onTimeUpdate(time, trigger, isCurrent) {
    if (!isCurrent()) return;
    const { duration, realCurrentTime } = this.#ctx.$state, hasEnded = this.#state === YouTubePlayerState.Ended, boundTime = hasEnded ? duration() : time;
    this.#ctx.notify("time-change", boundTime, trigger);
    if (!isCurrent()) return;
    if (!hasEnded && Math.abs(boundTime - realCurrentTime()) > 1) this.#ctx.notify("seeking", boundTime, trigger);
  }
  #onProgress(buffered, seekable, trigger, isCurrent) {
    if (!isCurrent()) return;
    const detail = {
      buffered: new TimeRange(0, buffered),
      seekable
    };
    this.#ctx.notify("progress", detail, trigger);
    if (!isCurrent()) return;
    const { seeking, realCurrentTime } = this.#ctx.$state;
    if (seeking() && buffered >= realCurrentTime()) this.#onSeeked(trigger, isCurrent);
  }
  #onSeeked(trigger, isCurrent) {
    if (!isCurrent()) return;
    const { paused, realCurrentTime } = this.#ctx.$state;
    window.clearTimeout(this.#seekingTimer);
    const timer = window.setTimeout(() => {
      if (this.#seekingTimer !== timer) return;
      this.#seekingTimer = -1;
      if (!isCurrent()) return;
      this.#ctx.notify("seeked", realCurrentTime(), trigger);
    }, paused() ? 100 : 0);
    this.#seekingTimer = timer;
  }
  #onEnded(trigger, isCurrent) {
    if (!isCurrent()) return;
    const { seeking } = this.#ctx.$state;
    if (seeking()) this.#onSeeked(trigger, isCurrent);
    this.#ctx.notify("pause", void 0, trigger);
    if (!isCurrent()) return;
    this.#ctx.notify("end", void 0, trigger);
  }
  #onStateChange(state, trigger, isCurrent) {
    if (!isCurrent()) return;
    const nextItem = this.#failedVideoId && this.#progressVideoId && this.#progressVideoId !== this.#failedVideoId;
    if (state === YouTubePlayerState.Playing || nextItem && (state === YouTubePlayerState.Cued || state === YouTubePlayerState.Buffering)) {
      this.#ctx.$state.error.set(null);
      this.#failedVideoId = "";
    }
    const cancelled = () => {
      if (!isCurrent()) return true;
      if (this.#pauseRequested && (state === YouTubePlayerState.Playing || state === YouTubePlayerState.Buffering)) {
        this.postMessage({ event: "command", func: "pauseVideo", args: [] });
        return true;
      }
      return false;
    };
    if (cancelled()) return;
    const { paused, seeking } = this.#ctx.$state, isPlaying = state === YouTubePlayerState.Playing, isBuffering = state === YouTubePlayerState.Buffering, isPendingPlay = this.#isPending("playVideo"), isPlay = paused() && (isBuffering || isPlaying);
    if (isBuffering) this.#ctx.notify("waiting", void 0, trigger);
    if (cancelled()) return;
    if (seeking() && isPlaying) this.#onSeeked(trigger, isCurrent);
    if (this.#invalidPlay && isPlaying) {
      this.pause();
      this.#invalidPlay = false;
      this.setMuted(this.#ctx.$state.muted());
      return;
    }
    if (!isPendingPlay && isPlay) {
      this.#invalidPlay = true;
      this.setMuted(true);
      return;
    }
    if (isPlay) {
      this.#getPromise("playVideo")?.resolve();
      this.#ctx.notify("play", void 0, trigger);
      if (cancelled()) return;
    }
    switch (state) {
      case YouTubePlayerState.Cued:
        this.#onReady(trigger, isCurrent);
        break;
      case YouTubePlayerState.Playing:
        this.#ctx.notify("playing", void 0, trigger);
        break;
      case YouTubePlayerState.Paused:
        this.#onPause(trigger);
        break;
      case YouTubePlayerState.Ended:
        this.#onEnded(trigger, isCurrent);
        break;
    }
    if (cancelled()) return;
    this.#state = state;
  }
  onMessage({ info, event: messageEvent }, event) {
    const source = this.#currentSrc, stateSource = this.#ctx.$state.source(), providedSource = this.#ctx.$props.src(), provider = this.#ctx.$provider(), seekRevision = this.#seekRevision;
    const isCurrent = () => !!source && source === this.#currentSrc && stateSource === this.#ctx.$state.source() && providedSource === this.#ctx.$props.src() && provider === this && provider === this.#ctx.$provider() && seekRevision === this.#seekRevision;
    if (!isCurrent()) return;
    const emit = (...args) => {
      if (!isCurrent()) return false;
      this.#ctx.notify(...args);
      return isCurrent();
    };
    if (messageEvent === "initialDelivery") {
      this.postMessage({ event: "command", func: "addEventListener", args: ["onAutoplayBlocked"] });
      this.postMessage({ event: "command", func: "addEventListener", args: ["onError"] });
    }
    if (messageEvent === "onError" && isNumber(info)) {
      this.#failedVideoId = this.#progressVideoId || this.#videoId();
      const error = new Error("YouTube playback failed (" + info + ").");
      error.youtubeErrorCode = info;
      this.#rejectPlay(error);
      for (const request of this.#promises.get("pauseVideo")?.splice(0) ?? []) request.reject(error);
      window.clearTimeout(this.#seekingTimer);
      this.#seekingTimer = -1;
      if (this.#ctx.$state.seeking()) {
        if (!emit("seeked", this.#ctx.$state.realCurrentTime(), event)) return;
      }
      this.#invalidPlay = false;
      this.#state = YouTubePlayerState.Unstarted;
      if (!emit("pause", void 0, event)) return;
      if (!emit("error", { message: error.message, code: info === 5 ? 3 : 4, error }, event)) return;
      return;
    }
    if (messageEvent === "onAutoplayBlocked") {
      this.#pauseRequested = true;
      this.#rejectPlay(new DOMException("YouTube playback was blocked by the browser.", "NotAllowedError"));
      this.#invalidPlay = false;
      this.#state = YouTubePlayerState.Paused;
      if (!emit("pause", void 0, event)) return;
      return;
    }
    if (!info) return;
    const videoId = info.videoData?.video_id;
    if (isString(videoId) && videoId) {
      if (this.#progressVideoId && this.#progressVideoId !== videoId) {
        window.clearTimeout(this.#seekingTimer);
        this.#seekingTimer = -1;
        if (this.#ctx.$state.seeking()) {
          if (!emit("seeked", info.progressState?.current ?? info.currentTime ?? 0, event)) return;
        }
      }
      this.#progressVideoId = videoId;
    }
    const { title, intrinsicDuration, playbackRate } = this.#ctx.$state;
    if (isObject(info.videoData) && info.videoData.title !== title()) {
      if (!emit("title-change", info.videoData.title, event)) return;
    }
    if (isNumber(info.duration) && info.duration !== intrinsicDuration()) {
      if (isNumber(info.videoLoadedFraction)) {
        const buffered = info.progressState?.loaded ?? info.videoLoadedFraction * info.duration, seekable = new TimeRange(0, info.duration);
        this.#onProgress(buffered, seekable, event, isCurrent);
        if (!isCurrent()) return;
      }
      if (!emit("duration-change", info.duration, event)) return;
    }
    if (isNumber(info.playbackRate) && info.playbackRate !== playbackRate()) {
      if (!emit("rate-change", info.playbackRate, event)) return;
    }
    if (!info.progressState && isNumber(info.currentTime)) {
      this.#onTimeUpdate(info.currentTime, event, isCurrent);
      if (!isCurrent()) return;
    }
    if (info.progressState) {
      const { current, seekableStart, seekableEnd, loaded, duration } = info.progressState;
      this.#onTimeUpdate(current, event, isCurrent);
      if (!isCurrent()) return;
      this.#onProgress(loaded, new TimeRange(seekableStart, seekableEnd), event, isCurrent);
      if (!isCurrent()) return;
      if (duration !== intrinsicDuration()) {
        if (!emit("duration-change", duration, event)) return;
      }
    }
    if (isNumber(info.volume) && isBoolean(info.muted) && !this.#invalidPlay) {
      const detail = {
        muted: info.muted,
        volume: info.volume / 100
      };
      if (!emit("volume-change", detail, event)) return;
    }
    if (isNumber(info.playerState) && info.playerState !== this.#state) this.#onStateChange(info.playerState, event, isCurrent);
  }
  #reset() {
    this.#seekRevision++;
    window.clearTimeout(this.#listeningTimer);
    this.#listeningTimer = -1;
    this.#failedVideoId = "";
    const error = new DOMException("The YouTube source changed.", "AbortError");
    for (const requests of this.#promises.values()) for (const request of requests) request.reject(error);
    this.#promises.clear();
    this.#progressVideoId = "";
    window.clearTimeout(this.#seekingTimer);
    this.#state = -1;
    this.#seekingTimer = -1;
    this.#invalidPlay = false;
  }
  #getPromise(command) {
    return this.#promises.get(command)?.shift();
  }
  #isPending(command) {
    return Boolean(this.#promises.get(command)?.length);
  }
};

export {
  YouTubeProvider
};
