import {
  $ariaBool,
  autoPlacement,
  hasAnimation,
  isElementParent,
  isElementVisible,
  isEventInside,
  isHTMLElement,
  isTouchPinchEvent,
  observeVisibility,
  onPress,
  requestScopedAnimationFrame,
  setARIALabel,
  setAttributeIfEmpty
} from "./chunk-ZXMGYZS7.min.js";
import {
  useMediaContext
} from "./chunk-6ATT5ISY.min.js";
import {
  assert
} from "./chunk-75VQWXMD.min.js";
import {
  clampNumber,
  getNumberOfDecimalPlaces,
  round
} from "./chunk-4C7PIW7M.min.js";
import {
  isTrackCaptionKind
} from "./chunk-QKSJYQLF.min.js";
import {
  watchActiveTextTrack
} from "./chunk-OPFURCQW.min.js";
import {
  getRequestCredentials
} from "./chunk-3B4S3VWV.min.js";
import {
  Component,
  EventsController,
  State,
  ViewController,
  animationFrameThrottle,
  ariaBool,
  computed,
  createContext,
  effect,
  functionThrottle,
  hasProvidedContext,
  isArray,
  isKeyboardEvent,
  isNull,
  isNumber,
  isObject,
  isString,
  isWriteSignal,
  listenEvent,
  method,
  onDispose,
  peek,
  prop,
  provideContext,
  r,
  scoped,
  setAttribute,
  setStyle,
  signal,
  tick,
  useContext,
  useState,
  wasEnterKeyPressed
} from "./chunk-UMQWA6KQ.min.js";

// node_modules/vidstack/prod/chunks/vidstack-3f0FVrSp.js
var $keyboard = signal(false);
listenEvent(document, "pointerdown", () => {
  $keyboard.set(false);
});
listenEvent(document, "keydown", (e) => {
  if (e.metaKey || e.altKey || e.ctrlKey) return;
  $keyboard.set(true);
});
var FocusVisibleController = class extends ViewController {
  #focused = signal(false);
  onConnect(el) {
    effect(() => {
      const events = new EventsController(el);
      if (!$keyboard()) {
        this.#focused.set(false);
        updateFocusAttr(el, false);
        events.add("pointerenter", this.#onPointerEnter.bind(this)).add("pointerleave", this.#onPointerLeave.bind(this));
        return;
      }
      const active = document.activeElement === el;
      this.#focused.set(active);
      updateFocusAttr(el, active);
      events.add("focus", this.#onFocus.bind(this)).add("blur", this.#onBlur.bind(this));
    });
  }
  focused() {
    return this.#focused();
  }
  #onFocus() {
    this.#focused.set(true);
    updateFocusAttr(this.el, true);
  }
  #onBlur() {
    this.#focused.set(false);
    updateFocusAttr(this.el, false);
  }
  #onPointerEnter() {
    updateHoverAttr(this.el, true);
  }
  #onPointerLeave() {
    updateHoverAttr(this.el, false);
  }
};
function updateFocusAttr(el, isFocused) {
  setAttribute(el, "data-focus", isFocused);
  setAttribute(el, "data-hocus", isFocused);
}
function updateHoverAttr(el, isHovering) {
  setAttribute(el, "data-hocus", isHovering);
  setAttribute(el, "data-hover", isHovering);
}

// node_modules/vidstack/prod/chunks/vidstack-Co7OTSZg.js
function sortVideoQualities(qualities, desc) {
  return [...qualities].sort(desc ? compareVideoQualityDesc : compareVideoQualityAsc);
}
function compareVideoQualityAsc(a, b) {
  return a.height === b.height ? (a.bitrate ?? 0) - (b.bitrate ?? 0) : a.height - b.height;
}
function compareVideoQualityDesc(a, b) {
  return b.height === a.height ? (b.bitrate ?? 0) - (a.bitrate ?? 0) : b.height - a.height;
}
var ARIAKeyShortcuts = class extends ViewController {
  #shortcut;
  constructor(shortcut) {
    super();
    this.#shortcut = shortcut;
  }
  onAttach(el) {
    const { $props, ariaKeys } = useMediaContext(), keys = el.getAttribute("aria-keyshortcuts");
    if (keys) {
      ariaKeys[this.#shortcut] = keys;
      onDispose(() => {
        delete ariaKeys[this.#shortcut];
      });
      return;
    }
    const shortcuts = $props.keyShortcuts()[this.#shortcut];
    if (shortcuts) {
      const keys2 = isArray(shortcuts) ? shortcuts.join(" ") : isString(shortcuts) ? shortcuts : shortcuts?.keys;
      el.setAttribute("aria-keyshortcuts", isArray(keys2) ? keys2.join(" ") : keys2);
    }
  }
};
function padNumberWithZeroes(num, expectedLength) {
  const str = String(num);
  const actualLength = str.length;
  if (actualLength < expectedLength) {
    const padLength = expectedLength - actualLength;
    return `${`0`.repeat(padLength)}${num}`;
  }
  return str;
}
function parseTime(duration) {
  return {
    hours: Math.trunc(duration / 3600),
    minutes: Math.trunc(duration % 3600 / 60),
    seconds: Math.trunc(duration % 60),
    fraction: Number((duration - Math.trunc(duration)).toPrecision(3))
  };
}
function formatTime(duration, { padHrs = null, padMins = null, showHrs = false, showMs = false } = {}) {
  const { hours, minutes, seconds, fraction } = parseTime(duration), paddedHours = padHrs ? padNumberWithZeroes(hours, 2) : hours, time = `${padMins || isNull(padMins) && duration >= 3600 ? padNumberWithZeroes(minutes, 2) : minutes}:${padNumberWithZeroes(seconds, 2)}${showMs && fraction > 0 ? `.${String(fraction).replace(/^0?\./, "")}` : ""}`;
  return hours > 0 || showHrs ? `${paddedHours}:${time}` : time;
}
function formatSpokenTime(duration) {
  const spokenParts = [];
  const { hours, minutes, seconds } = parseTime(duration);
  if (hours > 0) spokenParts.push(`${hours} hour`);
  if (minutes > 0) spokenParts.push(`${minutes} min`);
  if (seconds > 0 || spokenParts.length === 0) spokenParts.push(`${seconds} sec`);
  return spokenParts.join(" ");
}
var Popper = class extends ViewController {
  #delegate;
  constructor(delegate) {
    super();
    this.#delegate = delegate;
    effect(this.#watchTrigger.bind(this));
  }
  onDestroy() {
    this.#stopAnimationEndListener?.();
    this.#stopAnimationEndListener = null;
  }
  #watchTrigger() {
    const trigger = this.#delegate.trigger();
    if (!trigger) {
      this.hide();
      return;
    }
    const show = this.show.bind(this), hide = this.hide.bind(this);
    this.#delegate.listen(trigger, show, hide);
  }
  #showTimerId = -1;
  #hideRafId = -1;
  #stopAnimationEndListener = null;
  show(trigger) {
    this.#cancelShowing();
    window.cancelAnimationFrame(this.#hideRafId);
    this.#hideRafId = -1;
    this.#stopAnimationEndListener?.();
    this.#stopAnimationEndListener = null;
    this.#showTimerId = window.setTimeout(() => {
      this.#showTimerId = -1;
      const content = this.#delegate.content();
      if (content) content.style.removeProperty("display");
      peek(() => this.#delegate.onChange(true, trigger));
    }, this.#delegate.showDelay?.() ?? 0);
  }
  hide(trigger) {
    this.#cancelShowing();
    peek(() => this.#delegate.onChange(false, trigger));
    this.#hideRafId = requestAnimationFrame(() => {
      this.#cancelShowing();
      this.#hideRafId = -1;
      const content = this.#delegate.content();
      if (content) {
        const onHide = () => {
          content.style.display = "none";
          this.#stopAnimationEndListener = null;
        };
        if (hasAnimation(content)) {
          this.#stopAnimationEndListener?.();
          const stop = listenEvent(content, "animationend", onHide, { once: true });
          this.#stopAnimationEndListener = stop;
        } else onHide();
      }
    });
  }
  #cancelShowing() {
    window.clearTimeout(this.#showTimerId);
    this.#showTimerId = -1;
  }
};
var ToggleButtonController = class extends ViewController {
  static props = { disabled: false };
  #delegate;
  constructor(delegate) {
    super();
    this.#delegate = delegate;
    new FocusVisibleController();
    if (delegate.keyShortcut) new ARIAKeyShortcuts(delegate.keyShortcut);
  }
  onSetup() {
    const { disabled } = this.$props;
    this.setAttributes({
      "data-pressed": this.#delegate.isPresssed,
      "aria-pressed": this.#isARIAPressed.bind(this),
      "aria-disabled": () => disabled() ? "true" : null
    });
  }
  onAttach(el) {
    setAttributeIfEmpty(el, "tabindex", "0");
    setAttributeIfEmpty(el, "role", "button");
    setAttributeIfEmpty(el, "type", "button");
  }
  onConnect(el) {
    const events = onPress(el, this.#onMaybePress.bind(this));
    for (const type of ["click", "touchstart"]) events.add(type, this.#onInteraction.bind(this), { passive: true });
  }
  #isARIAPressed() {
    return ariaBool(this.#delegate.isPresssed());
  }
  #onPressed(event) {
    if (isWriteSignal(this.#delegate.isPresssed)) this.#delegate.isPresssed.set((p) => !p);
  }
  #onMaybePress(event) {
    if (this.$props.disabled() || this.el.hasAttribute("data-disabled")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    event.preventDefault();
    (this.#delegate.onPress ?? this.#onPressed).call(this, event);
  }
  #onInteraction(event) {
    if (this.$props.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
};
var AirPlayButton = class extends Component {
  static props = ToggleButtonController.props;
  #media;
  constructor() {
    super();
    new ToggleButtonController({
      isPresssed: this.#isPressed.bind(this),
      onPress: this.#onPress.bind(this)
    });
  }
  onSetup() {
    this.#media = useMediaContext();
    const { canAirPlay, isAirPlayConnected } = this.#media.$state;
    this.setAttributes({
      "data-active": isAirPlayConnected,
      "data-supported": canAirPlay,
      "data-state": this.#getState.bind(this),
      "aria-hidden": $ariaBool(() => !canAirPlay())
    });
  }
  onAttach(el) {
    el.setAttribute("data-media-tooltip", "airplay");
    setARIALabel(el, this.#getDefaultLabel.bind(this));
  }
  #onPress(event) {
    this.#media.remote.requestAirPlay(event);
  }
  #isPressed() {
    const { remotePlaybackType, remotePlaybackState } = this.#media.$state;
    return remotePlaybackType() === "airplay" && remotePlaybackState() !== "disconnected";
  }
  #getState() {
    const { remotePlaybackType, remotePlaybackState } = this.#media.$state;
    return remotePlaybackType() === "airplay" && remotePlaybackState();
  }
  #getDefaultLabel() {
    const { remotePlaybackState } = this.#media.$state;
    return `AirPlay ${remotePlaybackState()}`;
  }
};
var PlayButton = class extends Component {
  static props = ToggleButtonController.props;
  #media;
  constructor() {
    super();
    new ToggleButtonController({
      isPresssed: this.#isPressed.bind(this),
      keyShortcut: "togglePaused",
      onPress: this.#onPress.bind(this)
    });
  }
  onSetup() {
    this.#media = useMediaContext();
    const { paused, ended } = this.#media.$state;
    this.setAttributes({
      "data-paused": paused,
      "data-ended": ended
    });
  }
  onAttach(el) {
    el.setAttribute("data-media-tooltip", "play");
    setARIALabel(el, "Play");
  }
  #onPress(event) {
    const remote = this.#media.remote;
    this.#isPressed() ? remote.pause(event) : remote.play(event);
  }
  #isPressed() {
    const { paused } = this.#media.$state;
    return !paused();
  }
};
var CaptionButton = class extends Component {
  static props = ToggleButtonController.props;
  #media;
  constructor() {
    super();
    new ToggleButtonController({
      isPresssed: this.#isPressed.bind(this),
      keyShortcut: "toggleCaptions",
      onPress: this.#onPress.bind(this)
    });
  }
  onSetup() {
    this.#media = useMediaContext();
    this.setAttributes({
      "data-active": this.#isPressed.bind(this),
      "data-supported": () => !this.#isHidden(),
      "aria-hidden": $ariaBool(this.#isHidden.bind(this))
    });
  }
  onAttach(el) {
    el.setAttribute("data-media-tooltip", "caption");
    setARIALabel(el, "Captions");
  }
  #onPress(event) {
    this.#media.remote.toggleCaptions(event);
  }
  #isPressed() {
    const { textTrack } = this.#media.$state, track = textTrack();
    return !!track && isTrackCaptionKind(track);
  }
  #isHidden() {
    const { hasCaptions } = this.#media.$state;
    return !hasCaptions();
  }
};
var FullscreenButton = class extends Component {
  static props = {
    ...ToggleButtonController.props,
    target: "prefer-media"
  };
  #media;
  constructor() {
    super();
    new ToggleButtonController({
      isPresssed: this.#isPressed.bind(this),
      keyShortcut: "toggleFullscreen",
      onPress: this.#onPress.bind(this)
    });
  }
  onSetup() {
    this.#media = useMediaContext();
    const { fullscreen } = this.#media.$state, isSupported = this.#isSupported.bind(this);
    this.setAttributes({
      "data-active": fullscreen,
      "data-supported": isSupported,
      "aria-hidden": $ariaBool(() => !isSupported())
    });
  }
  onAttach(el) {
    el.setAttribute("data-media-tooltip", "fullscreen");
    setARIALabel(el, "Fullscreen");
  }
  #onPress(event) {
    const remote = this.#media.remote, target = this.$props.target();
    this.#isPressed() ? remote.exitFullscreen(target, event) : remote.enterFullscreen(target, event);
  }
  #isPressed() {
    const { fullscreen } = this.#media.$state;
    return fullscreen();
  }
  #isSupported() {
    const { canFullscreen } = this.#media.$state;
    return canFullscreen();
  }
};
var MuteButton = class extends Component {
  static props = ToggleButtonController.props;
  #media;
  constructor() {
    super();
    new ToggleButtonController({
      isPresssed: this.#isPressed.bind(this),
      keyShortcut: "toggleMuted",
      onPress: this.#onPress.bind(this)
    });
  }
  onSetup() {
    this.#media = useMediaContext();
    this.setAttributes({
      "data-muted": this.#isPressed.bind(this),
      "data-state": this.#getState.bind(this)
    });
  }
  onAttach(el) {
    el.setAttribute("data-media-mute-button", "");
    el.setAttribute("data-media-tooltip", "mute");
    setARIALabel(el, "Mute");
  }
  #onPress(event) {
    const remote = this.#media.remote;
    this.#isPressed() ? remote.unmute(event) : remote.mute(event);
  }
  #isPressed() {
    const { muted, volume } = this.#media.$state;
    return muted() || volume() === 0;
  }
  #getState() {
    const { muted, volume } = this.#media.$state, $volume = volume();
    if (muted() || $volume === 0) return "muted";
    else if ($volume >= 0.5) return "high";
    else if ($volume < 0.5) return "low";
  }
};
var PIPButton = class extends Component {
  static props = ToggleButtonController.props;
  #media;
  constructor() {
    super();
    new ToggleButtonController({
      isPresssed: this.#isPressed.bind(this),
      keyShortcut: "togglePictureInPicture",
      onPress: this.#onPress.bind(this)
    });
  }
  onSetup() {
    this.#media = useMediaContext();
    const { pictureInPicture } = this.#media.$state, isSupported = this.#isSupported.bind(this);
    this.setAttributes({
      "data-active": pictureInPicture,
      "data-supported": isSupported,
      "aria-hidden": $ariaBool(() => !isSupported())
    });
  }
  onAttach(el) {
    el.setAttribute("data-media-tooltip", "pip");
    setARIALabel(el, "PiP");
  }
  #onPress(event) {
    const remote = this.#media.remote;
    this.#isPressed() ? remote.exitPictureInPicture(event) : remote.enterPictureInPicture(event);
  }
  #isPressed() {
    const { pictureInPicture } = this.#media.$state;
    return pictureInPicture();
  }
  #isSupported() {
    const { canPictureInPicture } = this.#media.$state;
    return canPictureInPicture();
  }
};
var SeekButton = class extends Component {
  static props = {
    disabled: false,
    seconds: 30
  };
  #media;
  constructor() {
    super();
    new FocusVisibleController();
  }
  onSetup() {
    this.#media = useMediaContext();
    const { seeking } = this.#media.$state, { seconds } = this.$props, isSupported = this.#isSupported.bind(this);
    this.setAttributes({
      seconds,
      "data-seeking": seeking,
      "data-supported": isSupported,
      "aria-hidden": $ariaBool(() => !isSupported())
    });
  }
  onAttach(el) {
    setAttributeIfEmpty(el, "tabindex", "0");
    setAttributeIfEmpty(el, "role", "button");
    setAttributeIfEmpty(el, "type", "button");
    el.setAttribute("data-media-tooltip", "seek");
    setARIALabel(el, this.#getDefaultLabel.bind(this));
  }
  onConnect(el) {
    onPress(el, this.#onPress.bind(this));
  }
  #isSupported() {
    const { canSeek } = this.#media.$state;
    return canSeek();
  }
  #getDefaultLabel() {
    const { seconds } = this.$props;
    return `Seek ${seconds() > 0 ? "forward" : "backward"} ${seconds()} seconds`;
  }
  #onPress(event) {
    const { seconds, disabled } = this.$props;
    if (disabled()) return;
    const { currentTime } = this.#media.$state, seekTo = currentTime() + seconds();
    this.#media.remote.seek(seekTo, event);
  }
};
var LiveButton = class extends Component {
  static props = { disabled: false };
  #media;
  constructor() {
    super();
    new FocusVisibleController();
  }
  onSetup() {
    this.#media = useMediaContext();
    const { disabled } = this.$props, { live, liveEdge } = this.#media.$state, isHidden = () => !live();
    this.setAttributes({
      "data-edge": liveEdge,
      "data-hidden": isHidden,
      "aria-disabled": $ariaBool(() => disabled() || liveEdge()),
      "aria-hidden": $ariaBool(isHidden)
    });
  }
  onAttach(el) {
    setAttributeIfEmpty(el, "tabindex", "0");
    setAttributeIfEmpty(el, "role", "button");
    setAttributeIfEmpty(el, "type", "button");
    el.setAttribute("data-media-tooltip", "live");
  }
  onConnect(el) {
    onPress(el, this.#onPress.bind(this));
  }
  #onPress(event) {
    const { disabled } = this.$props, { liveEdge } = this.#media.$state;
    if (disabled() || liveEdge()) return;
    this.#media.remote.seekToLiveEdge(event);
  }
};
var sliderState = new State({
  min: 0,
  max: 100,
  value: 0,
  step: 1,
  pointerValue: 0,
  focused: false,
  dragging: false,
  pointing: false,
  hidden: false,
  get active() {
    return this.dragging || this.focused || this.pointing;
  },
  get fillRate() {
    return calcRate(this.min, this.max, this.value);
  },
  get fillPercent() {
    return this.fillRate * 100;
  },
  get pointerRate() {
    return calcRate(this.min, this.max, this.pointerValue);
  },
  get pointerPercent() {
    return this.pointerRate * 100;
  }
});
function calcRate(min, max, value) {
  const range = max - min, offset = value - min;
  return range > 0 ? offset / range : 0;
}
var IntersectionObserverController = class extends ViewController {
  #init;
  #observer;
  constructor(init) {
    super();
    this.#init = init;
  }
  onConnect(el) {
    this.#observer = new IntersectionObserver((entries) => {
      this.#init.callback?.(entries, this.#observer);
    }, this.#init);
    this.#observer.observe(el);
    onDispose(this.#onDisconnect.bind(this));
  }
  /**
  * Disconnect any active intersection observers.
  */
  #onDisconnect() {
    this.#observer?.disconnect();
    this.#observer = void 0;
  }
};
var sliderContext = createContext();
var sliderObserverContext = createContext();
function getClampedValue(min, max, value, step) {
  return clampNumber(min, round(value, getNumberOfDecimalPlaces(step)), max);
}
function getValueFromRate(min, max, rate, step) {
  const boundRate = clampNumber(0, rate, 1), stepRatio = (max - min) * boundRate / step;
  return min + step * Math.round(stepRatio);
}
var SliderKeyDirection = {
  Left: -1,
  ArrowLeft: -1,
  Up: 1,
  ArrowUp: 1,
  Right: 1,
  ArrowRight: 1,
  Down: -1,
  ArrowDown: -1
};
var SliderEventsController = class extends ViewController {
  #delegate;
  #media;
  #observer;
  constructor(delegate, media) {
    super();
    this.#delegate = delegate;
    this.#media = media;
  }
  onSetup() {
    if (hasProvidedContext(sliderObserverContext)) this.#observer = useContext(sliderObserverContext);
  }
  onConnect(el) {
    onDispose(() => {
      this.#onDocumentPointerMove.cancel();
      if (this.$state.dragging()) {
        this.$state.dragging.set(false);
        if (this.#media.player) this.#media.remote.resumeControls();
      }
      this.#resetTouchState();
      this.#pointerId = null;
    });
    effect(this.#attachEventListeners.bind(this, el));
    effect(this.#attachPointerListeners.bind(this, el));
    if (this.#delegate.swipeGesture) effect(this.#watchSwipeGesture.bind(this));
  }
  #watchSwipeGesture() {
    const { pointer } = this.#media.$state;
    if (pointer() !== "coarse" || !this.#delegate.swipeGesture()) {
      this.#provider = null;
      this.#resetTouchState();
      return;
    }
    this.#provider = this.#media.player.el?.querySelector("media-provider,[data-media-provider]");
    if (!this.#provider) {
      this.#resetTouchState();
      return;
    }
    new EventsController(this.#provider).add("pointerdown", (event) => {
      if (event.button === 0 && event.isPrimary !== false && !this.$state.dragging()) this.#pointerId = event.pointerId;
    }, { passive: true }).add("touchstart", this.#onTouchStart.bind(this), { passive: true }).add("touchmove", this.#onTouchMove.bind(this), { passive: false }).add("touchend", () => {
      if (!this.$state.dragging()) {
        this.#resetTouchState();
        this.#pointerId = null;
      }
    }, { passive: true }).add("touchcancel", this.#onDocumentPointerCancel.bind(this), { passive: true });
  }
  #provider = null;
  #touch = null;
  #touchId = null;
  #pointerId = null;
  #touchStartValue = null;
  #resetTouchState() {
    this.#touch = null;
    this.#touchId = null;
    this.#touchStartValue = null;
  }
  #onTouchStart(event) {
    if (event.touches.length !== 1) {
      this.#onDocumentPointerCancel(event);
      return;
    }
    this.#touch = event.touches[0];
    this.#touchId = this.#touch.identifier;
  }
  #onTouchMove(event) {
    if (isNull(this.#touch) || isTouchPinchEvent(event)) return;
    const touch = Array.from(event.touches).find((touch2) => touch2.identifier === this.#touchId);
    if (!touch) return;
    const xDiff = touch.clientX - this.#touch.clientX, yDiff = touch.clientY - this.#touch.clientY, isDragging = this.$state.dragging();
    if (!isDragging && Math.abs(yDiff) > 5) {
      this.#resetTouchState();
      return;
    }
    if (isDragging) return;
    if (Math.abs(xDiff) > 20) {
      if (event.cancelable) event.preventDefault();
      this.#touch = touch;
      this.#touchStartValue = this.$state.value();
      this.#onStartDragging(this.#touchStartValue, event);
    }
  }
  #attachEventListeners(el) {
    const { hidden } = this.$props;
    listenEvent(el, "focus", this.#onFocus.bind(this));
    if (hidden() || this.#delegate.isDisabled()) return;
    new EventsController(el).add("keyup", this.#onKeyUp.bind(this)).add("keydown", this.#onKeyDown.bind(this)).add("pointerenter", this.#onPointerEnter.bind(this)).add("pointermove", this.#onPointerMove.bind(this)).add("pointerleave", this.#onPointerLeave.bind(this)).add("pointerdown", this.#onPointerDown.bind(this));
  }
  #attachPointerListeners(el) {
    if (this.#delegate.isDisabled() || !this.$state.dragging()) return;
    new EventsController(document).add("pointerup", this.#onDocumentPointerUp.bind(this), { capture: true }).add("pointercancel", this.#onDocumentPointerCancel.bind(this), { capture: true }).add("touchcancel", this.#onDocumentPointerCancel.bind(this), { capture: true, passive: true }).add("pointermove", this.#onDocumentPointerMove.bind(this)).add("touchmove", this.#onDocumentTouchMove.bind(this), { passive: false });
  }
  #onFocus() {
    this.#updatePointerValue(this.$state.value());
  }
  #updateValue(newValue, trigger) {
    const { value, min, max, dragging } = this.$state;
    const clampedValue = Math.max(min(), Math.min(newValue, max()));
    value.set(clampedValue);
    const event = this.createEvent("value-change", {
      detail: clampedValue,
      trigger
    });
    this.dispatch(event);
    this.#delegate.onValueChange?.(event);
    if (dragging()) {
      const event2 = this.createEvent("drag-value-change", {
        detail: clampedValue,
        trigger
      });
      this.dispatch(event2);
      this.#delegate.onDragValueChange?.(event2);
    }
  }
  #updatePointerValue(value, trigger) {
    const { pointerValue, dragging } = this.$state;
    pointerValue.set(value);
    this.dispatch("pointer-value-change", {
      detail: value,
      trigger
    });
    if (dragging()) this.#updateValue(value, trigger);
  }
  #getPointerValue(event) {
    let thumbPositionRate, rect = this.el.getBoundingClientRect(), { min, max } = this.$state;
    if (this.$props.orientation() === "vertical") {
      const { bottom: trackBottom, height: trackHeight } = rect;
      thumbPositionRate = (trackBottom - event.clientY) / trackHeight;
    } else if (this.#touch && isNumber(this.#touchStartValue) && this.#provider) {
      const { width } = this.#provider.getBoundingClientRect(), rate = (event.clientX - this.#touch.clientX) / width, range = max() - min(), diff = range * Math.abs(rate);
      thumbPositionRate = (rate < 0 ? this.#touchStartValue - diff : this.#touchStartValue + diff) / range;
    } else {
      if (this.#touch && isNumber(this.#touchStartValue)) this.#resetTouchState();
      const { left: trackLeft, width: trackWidth } = rect;
      thumbPositionRate = (event.clientX - trackLeft) / trackWidth;
    }
    return Math.max(min(), Math.min(max(), this.#delegate.roundValue(getValueFromRate(min(), max(), thumbPositionRate, this.#delegate.getStep()))));
  }
  #onPointerEnter(event) {
    this.$state.pointing.set(true);
  }
  #onPointerMove(event) {
    const { dragging } = this.$state;
    if (dragging()) return;
    this.#updatePointerValue(this.#getPointerValue(event), event);
  }
  #onPointerLeave(event) {
    this.$state.pointing.set(false);
  }
  #onPointerDown(event) {
    if (event.button !== 0 || event.isPrimary === false || this.$state.dragging()) return;
    this.#pointerId = event.pointerId;
    const value = this.#getPointerValue(event);
    this.#onStartDragging(value, event);
    this.#updatePointerValue(value, event);
  }
  #onStartDragging(value, trigger) {
    const { dragging } = this.$state;
    if (dragging()) return;
    dragging.set(true);
    this.#media.remote.pauseControls(trigger);
    const event = this.createEvent("drag-start", {
      detail: value,
      trigger
    });
    this.dispatch(event);
    this.#delegate.onDragStart?.(event);
    this.#observer?.onDragStart?.();
  }
  #onStopDragging(value, trigger) {
    const { dragging } = this.$state;
    if (!dragging()) return;
    dragging.set(false);
    this.#pointerId = null;
    this.#media.remote.resumeControls(trigger);
    const event = this.createEvent("drag-end", {
      detail: value,
      trigger
    });
    this.dispatch(event);
    this.#delegate.onDragEnd?.(event);
    this.#resetTouchState();
    this.#observer?.onDragEnd?.();
  }
  #lastDownKey;
  #repeatedKeys = false;
  #onKeyDown(event) {
    if (!Object.keys(SliderKeyDirection).includes(event.key)) return;
    const { key } = event, jumpValue = this.#calcJumpValue(event);
    if (!isNull(jumpValue)) {
      this.#updatePointerValue(jumpValue, event);
      this.#updateValue(jumpValue, event);
      return;
    }
    const newValue = this.#calcNewKeyValue(event);
    if (!this.#repeatedKeys) {
      this.#repeatedKeys = key === this.#lastDownKey;
      if (!this.$state.dragging() && this.#repeatedKeys) this.#onStartDragging(newValue, event);
    }
    this.#updatePointerValue(newValue, event);
    this.#lastDownKey = key;
  }
  #onKeyUp(event) {
    if (!Object.keys(SliderKeyDirection).includes(event.key) || !isNull(this.#calcJumpValue(event))) return;
    const newValue = this.#repeatedKeys ? this.$state.pointerValue() : this.#calcNewKeyValue(event);
    this.#updateValue(newValue, event);
    this.#onStopDragging(newValue, event);
    this.#lastDownKey = "";
    this.#repeatedKeys = false;
  }
  #calcJumpValue(event) {
    let key = event.key, { min, max } = this.$state;
    if (key === "Home" || key === "PageUp") return min();
    else if (key === "End" || key === "PageDown") return max();
    else if (!event.metaKey && /^[0-9]$/.test(key)) return (max() - min()) / 10 * Number(key);
    return null;
  }
  #calcNewKeyValue(event) {
    const { key, shiftKey } = event;
    event.preventDefault();
    event.stopPropagation();
    const { shiftKeyMultiplier } = this.$props;
    const { min, max, value, pointerValue } = this.$state, step = this.#delegate.getStep(), keyStep = this.#delegate.getKeyStep();
    const diff = (!shiftKey ? keyStep : keyStep * shiftKeyMultiplier()) * Number(SliderKeyDirection[key]), steps = ((this.#repeatedKeys ? pointerValue() : this.#delegate.getValue?.() ?? value()) + diff) / step;
    return Math.max(min(), Math.min(max(), Number((step * steps).toFixed(3))));
  }
  #onDocumentPointerUp(event) {
    if (event.button !== 0 || event.isPrimary === false || this.#pointerId !== null && event.pointerId !== this.#pointerId) return;
    this.#onDocumentPointerMove.cancel();
    event.preventDefault();
    event.stopImmediatePropagation();
    const value = this.#getPointerValue(event);
    this.#updatePointerValue(value, event);
    this.#onStopDragging(value, event);
  }
  #onDocumentPointerCancel(event) {
    if ("pointerId" in event && (event.isPrimary === false || this.#pointerId !== null && event.pointerId !== this.#pointerId)) return;
    this.#onDocumentPointerMove.cancel();
    this.#onStopDragging(this.$state.pointerValue(), event);
    this.#resetTouchState();
    this.#pointerId = null;
  }
  #onDocumentTouchMove(event) {
    if (event.touches.length !== 1) {
      this.#onDocumentPointerCancel(event);
      return;
    }
    if (event.cancelable) event.preventDefault();
  }
  #onDocumentPointerMove = functionThrottle((event) => {
    if (!this.$state.dragging() || event.isPrimary === false || this.#pointerId !== null && event.pointerId !== this.#pointerId) return;
    this.#updatePointerValue(this.#getPointerValue(event), event);
  }, 20, { leading: true });
};
var sliderValueFormatContext = createContext(() => ({}));
var SliderController = class extends ViewController {
  static props = {
    hidden: false,
    disabled: false,
    step: 1,
    keyStep: 1,
    orientation: "horizontal",
    shiftKeyMultiplier: 5
  };
  #media;
  #delegate;
  #isVisible = signal(true);
  #isIntersecting = signal(true);
  constructor(delegate) {
    super();
    this.#delegate = delegate;
  }
  onSetup() {
    this.#media = useMediaContext();
    const focus = new FocusVisibleController();
    focus.attach(this);
    this.$state.focused = focus.focused.bind(focus);
    if (!hasProvidedContext(sliderValueFormatContext)) provideContext(sliderValueFormatContext, { default: "value" });
    provideContext(sliderContext, {
      orientation: this.$props.orientation,
      disabled: this.#delegate.isDisabled,
      preview: signal(null)
    });
    effect(this.#watchValue.bind(this));
    effect(this.#watchStep.bind(this));
    effect(this.#watchDisabled.bind(this));
    this.#setupAttrs();
    new SliderEventsController(this.#delegate, this.#media).attach(this);
    new IntersectionObserverController({ callback: this.#onIntersectionChange.bind(this) }).attach(this);
  }
  onAttach(el) {
    setAttributeIfEmpty(el, "role", "slider");
    setAttributeIfEmpty(el, "tabindex", "0");
    setAttributeIfEmpty(el, "autocomplete", "off");
    effect(this.#watchCSSVars.bind(this));
  }
  onConnect(el) {
    onDispose(observeVisibility(el, this.#isVisible.set));
    effect(this.#watchHidden.bind(this));
  }
  #onIntersectionChange(entries) {
    this.#isIntersecting.set(entries[0].isIntersecting);
  }
  #watchHidden() {
    const { hidden } = this.$props;
    this.$state.hidden.set(hidden() || !this.#isVisible() || !this.#isIntersecting());
  }
  #watchValue() {
    const { dragging, value, min, max } = this.$state;
    if (peek(dragging)) return;
    value.set(getClampedValue(min(), max(), value(), this.#delegate.getStep()));
  }
  #watchStep() {
    this.$state.step.set(this.#delegate.getStep());
  }
  #watchDisabled() {
    if (!this.#delegate.isDisabled()) return;
    const { dragging, pointing } = this.$state;
    dragging.set(false);
    pointing.set(false);
  }
  #getARIADisabled() {
    return ariaBool(this.#delegate.isDisabled());
  }
  #setupAttrs() {
    const { orientation } = this.$props, { dragging, active, pointing } = this.$state;
    this.setAttributes({
      "data-dragging": dragging,
      "data-pointing": pointing,
      "data-active": active,
      "aria-disabled": this.#getARIADisabled.bind(this),
      "aria-valuemin": this.#delegate.aria.valueMin ?? this.$state.min,
      "aria-valuemax": this.#delegate.aria.valueMax ?? this.$state.max,
      "aria-valuenow": this.#delegate.aria.valueNow,
      "aria-valuetext": this.#delegate.aria.valueText,
      "aria-orientation": orientation
    });
  }
  #watchCSSVars() {
    const { fillPercent, pointerPercent } = this.$state;
    this.#updateSliderVars(round(fillPercent(), 3), round(pointerPercent(), 3));
  }
  #updateSliderVars = animationFrameThrottle((fillPercent, pointerPercent) => {
    this.el?.style.setProperty("--slider-fill", fillPercent + "%");
    this.el?.style.setProperty("--slider-pointer", pointerPercent + "%");
  });
};
var Slider = class extends Component {
  static props = {
    ...SliderController.props,
    min: 0,
    max: 100,
    value: 0
  };
  static state = sliderState;
  constructor() {
    super();
    new SliderController({
      getStep: this.$props.step,
      getKeyStep: this.$props.keyStep,
      roundValue: Math.round,
      isDisabled: this.$props.disabled,
      aria: {
        valueNow: this.#getARIAValueNow.bind(this),
        valueText: this.#getARIAValueText.bind(this)
      }
    });
  }
  onSetup() {
    effect(this.#watchValue.bind(this));
    effect(this.#watchMinMax.bind(this));
  }
  #getARIAValueNow() {
    const { value } = this.$state;
    return Math.round(value());
  }
  #getARIAValueText() {
    const { value, max } = this.$state;
    return round(value() / max() * 100, 2) + "%";
  }
  #watchValue() {
    const { value } = this.$props;
    this.$state.value.set(value());
  }
  #watchMinMax() {
    const { min, max } = this.$props;
    this.$state.min.set(min());
    this.$state.max.set(max());
  }
};
var cache = /* @__PURE__ */ new Map();
var pending = /* @__PURE__ */ new Map();
var ThumbnailsLoader = class ThumbnailsLoader2 {
  #media;
  #src;
  #crossOrigin;
  $images = signal([]);
  static create(src, crossOrigin) {
    return new ThumbnailsLoader2(src, crossOrigin, useMediaContext());
  }
  constructor(src, crossOrigin, media) {
    this.#src = src;
    this.#crossOrigin = crossOrigin;
    this.#media = media;
    effect(this.#onLoadCues.bind(this));
  }
  #onLoadCues() {
    const { canLoad } = this.#media.$state;
    if (!canLoad()) return;
    const src = this.#src();
    if (!src) return;
    if (isString(src) && cache.has(src)) {
      const cues = cache.get(src);
      cache.delete(src);
      cache.set(src, cues);
      if (cache.size > 99) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      this.$images.set(cache.get(src));
    } else if (isString(src)) {
      const crossOrigin = this.#crossOrigin(), currentKey = src + "::" + crossOrigin;
      if (!pending.has(currentKey)) {
        const promise = new Promise(async (resolve, reject) => {
          try {
            const response = await fetch(src, { credentials: getRequestCredentials(crossOrigin) });
            if (response.headers.get("content-type") === "application/json") {
              const json = await response.json();
              if (isArray(json)) if (json[0] && "text" in json[0]) resolve(this.#processVTTCues(json));
              else {
                for (let i = 0; i < json.length; i++) {
                  const image = json[i];
                  assert(isObject(image), false);
                  assert("url" in image && isString(image.url), false);
                  assert("startTime" in image && isNumber(image.startTime), false);
                }
                resolve(json);
              }
              else resolve(this.#processStoryboard(json));
              return;
            }
            import("./prod-JZZ7X767.min.js").then(async ({ parseResponse }) => {
              try {
                const { cues } = await parseResponse(response);
                resolve(this.#processVTTCues(cues));
              } catch (e) {
                reject(e);
              }
            });
          } catch (e) {
            reject(e);
          }
        }).then((images) => {
          cache.set(currentKey, images);
          return images;
        }).catch((error) => {
          this.#onError(src, error);
        }).finally(() => {
          if (isString(currentKey)) pending.delete(currentKey);
        });
        pending.set(currentKey, promise);
      }
      pending.get(currentKey)?.then((images) => {
        this.$images.set(images || []);
      });
    } else if (isArray(src)) try {
      this.$images.set(this.#processImages(src));
    } catch (error) {
      this.#onError(src, error);
    }
    else try {
      this.$images.set(this.#processStoryboard(src));
    } catch (error) {
      this.#onError(src, error);
    }
    return () => {
      this.$images.set([]);
    };
  }
  #processImages(images) {
    const baseURL = this.#resolveBaseUrl();
    return images.map((img, i) => {
      assert(img.url && isString(img.url), false);
      assert("startTime" in img && isNumber(img.startTime), false);
      return {
        ...img,
        url: isString(img.url) ? this.#resolveURL(img.url, baseURL) : img.url
      };
    });
  }
  #processStoryboard(board) {
    assert(isString(board.url), false);
    assert(isArray(board.tiles) && board.tiles?.length, false);
    const url = new URL(board.url), images = [];
    const tileWidth = "tile_width" in board ? board.tile_width : board.tileWidth, tileHeight = "tile_height" in board ? board.tile_height : board.tileHeight;
    for (const tile of board.tiles) images.push({
      url,
      startTime: "start" in tile ? tile.start : tile.startTime,
      width: tileWidth,
      height: tileHeight,
      coords: {
        x: tile.x,
        y: tile.y
      }
    });
    return images;
  }
  #processVTTCues(cues) {
    for (let i = 0; i < cues.length; i++) {
      const cue = cues[i];
      assert("startTime" in cue && isNumber(cue.startTime), false);
      assert("text" in cue && isString(cue.text), false);
    }
    const images = [], baseURL = this.#resolveBaseUrl();
    for (const cue of cues) {
      const [url, hash] = cue.text.split("#"), data = this.#resolveData(hash);
      images.push({
        url: this.#resolveURL(url, baseURL),
        startTime: cue.startTime,
        endTime: cue.endTime,
        width: data?.w,
        height: data?.h,
        coords: data && isNumber(data.x) && isNumber(data.y) ? {
          x: data.x,
          y: data.y
        } : void 0
      });
    }
    return images;
  }
  #resolveBaseUrl() {
    let baseURL = peek(this.#src);
    if (!isString(baseURL) || !/^https?:/.test(baseURL)) return location.href;
    return baseURL;
  }
  #resolveURL(src, baseURL) {
    return /^https?:/.test(src) ? new URL(src) : new URL(src, baseURL);
  }
  #resolveData(hash) {
    if (!hash) return {};
    const [hashProps, values] = hash.split("="), hashValues = values?.split(","), data = {};
    if (!hashProps || !hashValues) return null;
    for (let i = 0; i < hashProps.length; i++) {
      const value = +hashValues[i];
      if (!isNaN(value)) data[hashProps[i]] = value;
    }
    return data;
  }
  #onError(src, error) {
  }
};
var PRELOAD_SPRITE_BATCH_SIZE = 2;
var MAX_PRELOADED_SPRITES = 32;
var preloadedSprites = /* @__PURE__ */ new Map();
var Thumbnail = class extends Component {
  static props = {
    src: null,
    time: 0,
    crossOrigin: null
  };
  static state = new State({
    src: "",
    img: null,
    thumbnails: [],
    activeThumbnail: null,
    crossOrigin: null,
    loading: false,
    error: null,
    hidden: false
  });
  media;
  #loader;
  #styleResets = [];
  onSetup() {
    this.media = useMediaContext();
    this.#watchCrossOrigin();
    this.#loader = ThumbnailsLoader.create(this.$props.src, this.$state.crossOrigin);
    this.setAttributes({
      "data-loading": this.#isLoading.bind(this),
      "data-error": this.#hasError.bind(this),
      "data-hidden": this.$state.hidden,
      "aria-hidden": $ariaBool(this.$state.hidden)
    });
  }
  onConnect(el) {
    effect(this.#watchImg.bind(this));
    effect(this.#watchHidden.bind(this));
    effect(this.#watchCrossOrigin.bind(this));
    effect(this.#onLoadStart.bind(this));
    effect(this.#onFindActiveThumbnail.bind(this));
    effect(this.#onPreloadNextSprites.bind(this));
    effect(this.#resize.bind(this));
  }
  #watchImg() {
    const img = this.$state.img();
    if (!img) return;
    new EventsController(img).add("load", this.#onLoaded.bind(this)).add("error", this.#onError.bind(this));
  }
  #watchCrossOrigin() {
    const { crossOrigin: crossOriginProp } = this.$props, { crossOrigin: crossOriginState } = this.$state, { crossOrigin: mediaCrossOrigin } = this.media.$state, crossOrigin = crossOriginProp() !== null ? crossOriginProp() : mediaCrossOrigin();
    crossOriginState.set(crossOrigin === true ? "anonymous" : crossOrigin);
  }
  #onLoadStart() {
    const { src, loading, error } = this.$state;
    if (src()) {
      loading.set(true);
      error.set(null);
    }
    return () => {
      this.#resetStyles();
      loading.set(false);
      error.set(null);
    };
  }
  #onLoaded() {
    const { loading, error } = this.$state;
    this.#resize();
    loading.set(false);
    error.set(null);
  }
  #onError(event) {
    const { loading, error } = this.$state;
    loading.set(false);
    error.set(event);
  }
  #isLoading() {
    const { loading, hidden } = this.$state;
    return !hidden() && loading();
  }
  #hasError() {
    const { error } = this.$state;
    return !isNull(error());
  }
  #watchHidden() {
    const { hidden } = this.$state, { duration } = this.media.$state, images = this.#loader.$images();
    hidden.set(this.#hasError() || !Number.isFinite(duration()) || images.length === 0);
  }
  getTime() {
    return this.$props.time();
  }
  #onFindActiveThumbnail() {
    let images = this.#loader.$images();
    if (!images.length) return;
    let time = this.getTime(), { src, activeThumbnail } = this.$state, activeIndex = -1, activeImage = null;
    for (let i = images.length - 1; i >= 0; i--) {
      const image = images[i];
      if (time >= image.startTime && (!image.endTime || time < image.endTime)) {
        activeIndex = i;
        break;
      }
    }
    if (images[activeIndex]) activeImage = images[activeIndex];
    src.set(activeImage?.url.href || "");
    activeThumbnail.set(activeImage);
  }
  #onPreloadNextSprites() {
    const images = this.#loader.$images(), activeThumbnail = this.$state.activeThumbnail();
    if (!activeThumbnail) return;
    const activeIndex = images.indexOf(activeThumbnail);
    if (activeIndex < 0) return;
    const activeSrc = activeThumbnail.url.href, crossOrigin = this.$state.crossOrigin(), startIndex = activeIndex + 1, endIndex = Math.min(startIndex + PRELOAD_SPRITE_BATCH_SIZE, images.length);
    for (let i = startIndex; i < endIndex; i++) {
      const src = images[i].url.href;
      if (src !== activeSrc) preloadSprite(src, crossOrigin);
    }
  }
  #resize() {
    if (!this.scope || this.$state.hidden()) return;
    const rootEl = this.el, imgEl = this.$state.img(), thumbnail = this.$state.activeThumbnail();
    if (!imgEl || !thumbnail || !rootEl) return;
    let width = thumbnail.width ?? imgEl.naturalWidth, height = thumbnail?.height ?? imgEl.naturalHeight, { maxWidth, maxHeight, minWidth, minHeight, width: elWidth, height: elHeight } = getComputedStyle(this.el);
    if (minWidth === "100%") minWidth = parseFloat(elWidth) + "";
    if (minHeight === "100%") minHeight = parseFloat(elHeight) + "";
    let minRatio = Math.max(parseInt(minWidth) / width, parseInt(minHeight) / height), maxRatio = Math.min(Math.max(parseInt(minWidth), parseInt(maxWidth)) / width, Math.max(parseInt(minHeight), parseInt(maxHeight)) / height), scale = !isNaN(maxRatio) && maxRatio < 1 ? maxRatio : minRatio > 1 ? minRatio : 1;
    this.#style(rootEl, "--thumbnail-width", `${width * scale}px`);
    this.#style(rootEl, "--thumbnail-height", `${height * scale}px`);
    this.#style(rootEl, "--thumbnail-aspect-ratio", String(round(width / height, 5)));
    this.#style(imgEl, "width", `${imgEl.naturalWidth * scale}px`);
    this.#style(imgEl, "height", `${imgEl.naturalHeight * scale}px`);
    this.#style(imgEl, "transform", thumbnail.coords ? `translate(-${thumbnail.coords.x * scale}px, -${thumbnail.coords.y * scale}px)` : "");
    this.#style(imgEl, "max-width", "none");
  }
  #style(el, name, value) {
    el.style.setProperty(name, value);
    this.#styleResets.push(() => el.style.removeProperty(name));
  }
  #resetStyles() {
    for (const reset of this.#styleResets) reset();
    this.#styleResets = [];
  }
};
function preloadSprite(src, crossOrigin) {
  const key = `${src}::${crossOrigin}`;
  if (preloadedSprites.has(key)) {
    const image2 = preloadedSprites.get(key);
    preloadedSprites.delete(key);
    preloadedSprites.set(key, image2);
    return;
  }
  const image = new Image();
  image.decoding = "async";
  image.crossOrigin = crossOrigin;
  image.src = src;
  preloadedSprites.set(key, image);
  if (preloadedSprites.size > MAX_PRELOADED_SPRITES) {
    const firstKey = preloadedSprites.keys().next().value;
    preloadedSprites.delete(firstKey);
  }
}
var SliderValue = class extends Component {
  static props = {
    type: "pointer",
    format: null,
    showHours: false,
    showMs: false,
    padHours: null,
    padMinutes: null,
    decimalPlaces: 2
  };
  #format;
  #text;
  #slider;
  onSetup() {
    this.#slider = useState(Slider.state);
    this.#format = useContext(sliderValueFormatContext);
    this.#text = computed(this.getValueText.bind(this));
  }
  /**
  * Returns the current value formatted as text based on prop settings.
  */
  getValueText() {
    if (!this.scope || !this.#slider || !this.#format) return "";
    const { type, format: $format, decimalPlaces, padHours, padMinutes, showHours, showMs } = this.$props, { value: sliderValue, pointerValue, min, max } = this.#slider, format = $format?.() ?? this.#format.default;
    const value = type() === "current" ? sliderValue() : pointerValue();
    if (format === "percent") {
      const percent = value / (max() - min()) * 100;
      return (this.#format.percent ?? round)(percent, decimalPlaces()) + "%";
    } else if (format === "time") return (this.#format.time ?? formatTime)(value, {
      padHrs: padHours(),
      padMins: padMinutes(),
      showHrs: showHours(),
      showMs: showMs()
    });
    else return (this.#format.value?.(value) ?? value.toFixed(2)) + "";
  }
};
var slidervalue__proto = SliderValue.prototype;
method(slidervalue__proto, "getValueText");
var SliderPreview = class extends Component {
  static props = {
    offset: 0,
    noClamp: false
  };
  #slider;
  onSetup() {
    this.#slider = useContext(sliderContext);
    const { active } = useState(Slider.state);
    this.setAttributes({ "data-visible": active });
  }
  onAttach(el) {
    Object.assign(el.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "max-content"
    });
  }
  onConnect(el) {
    const { preview } = this.#slider;
    preview.set(el);
    onDispose(() => preview.set(null));
    effect(this.#updatePlacement.bind(this));
    const resize = new ResizeObserver(this.#updatePlacement.bind(this));
    resize.observe(el);
    onDispose(() => resize.disconnect());
  }
  #updatePlacement = animationFrameThrottle(() => {
    const { disabled, orientation } = this.#slider;
    if (disabled()) return;
    const el = this.el, { offset, noClamp } = this.$props;
    if (!el) return;
    updateSliderPreviewPlacement(el, {
      clamp: !noClamp(),
      offset: offset(),
      orientation: orientation()
    });
  });
};
function updateSliderPreviewPlacement(el, { clamp, offset, orientation }) {
  const computedStyle = getComputedStyle(el), width = parseFloat(computedStyle.width), height = parseFloat(computedStyle.height), styles = {
    top: null,
    right: null,
    bottom: null,
    left: null
  };
  styles[orientation === "horizontal" ? "bottom" : "left"] = `calc(100% + var(--media-slider-preview-offset, ${offset}px))`;
  if (orientation === "horizontal") {
    const widthHalf = width / 2;
    if (!clamp) styles.left = `calc(var(--slider-pointer) - ${widthHalf}px)`;
    else styles.left = `min(${`max(0px, calc(var(--slider-pointer) - ${widthHalf}px))`}, ${`calc(100% - ${width}px)`})`;
  } else {
    const heightHalf = height / 2;
    if (!clamp) styles.bottom = `calc(var(--slider-pointer) - ${heightHalf}px)`;
    else styles.bottom = `min(${`max(${heightHalf}px, calc(var(--slider-pointer) - ${heightHalf}px))`}, ${`calc(100% - ${height}px)`})`;
  }
  Object.assign(el.style, styles);
}
var VolumeSlider = class extends Component {
  static props = {
    ...SliderController.props,
    keyStep: 5,
    shiftKeyMultiplier: 2
  };
  static state = sliderState;
  #media;
  onSetup() {
    this.#media = useMediaContext();
    const { audioGain } = this.#media.$state;
    provideContext(sliderValueFormatContext, {
      default: "percent",
      value(value) {
        return (value * (audioGain() ?? 1)).toFixed(2);
      },
      percent(value) {
        return Math.round(value * (audioGain() ?? 1));
      }
    });
    new SliderController({
      getStep: this.$props.step,
      getKeyStep: this.$props.keyStep,
      roundValue: Math.round,
      isDisabled: this.#isDisabled.bind(this),
      aria: {
        valueMax: this.#getARIAValueMax.bind(this),
        valueNow: this.#getARIAValueNow.bind(this),
        valueText: this.#getARIAValueText.bind(this)
      },
      onDragValueChange: this.#onDragValueChange.bind(this),
      onValueChange: this.#onValueChange.bind(this)
    }).attach(this);
    effect(this.#watchVolume.bind(this));
  }
  onConnect() {
    onDispose(() => this.#throttleVolumeChange.cancel());
  }
  onAttach(el) {
    el.setAttribute("data-media-volume-slider", "");
    setAttributeIfEmpty(el, "aria-label", "Volume");
    const { canSetVolume } = this.#media.$state;
    this.setAttributes({
      "data-supported": canSetVolume,
      "aria-hidden": $ariaBool(() => !canSetVolume())
    });
  }
  #getARIAValueNow() {
    const { value } = this.$state, { audioGain } = this.#media.$state;
    return Math.round(value() * (audioGain() ?? 1));
  }
  #getARIAValueText() {
    const { value, max } = this.$state, { audioGain } = this.#media.$state;
    return round(value() / max() * (audioGain() ?? 1) * 100, 2) + "%";
  }
  #getARIAValueMax() {
    const { audioGain } = this.#media.$state;
    return this.$state.max() * (audioGain() ?? 1);
  }
  #isDisabled() {
    const { disabled } = this.$props, { canSetVolume } = this.#media.$state;
    return disabled() || !canSetVolume();
  }
  #watchVolume() {
    const { muted, volume } = this.#media.$state;
    const newValue = muted() ? 0 : volume() * 100;
    this.$state.value.set(newValue);
    this.dispatch("value-change", { detail: newValue });
  }
  #throttleVolumeChange = functionThrottle(this.#onVolumeChange.bind(this), 25);
  #onVolumeChange(event) {
    if (!event.trigger) return;
    const mediaVolume = round(event.detail / 100, 3);
    this.#media.remote.changeVolume(mediaVolume, event);
  }
  #onValueChange(event) {
    this.#throttleVolumeChange(event);
  }
  #onDragValueChange(event) {
    this.#throttleVolumeChange(event);
  }
};
var TimeSlider = class extends Component {
  static props = {
    ...SliderController.props,
    step: 0.1,
    keyStep: 5,
    shiftKeyMultiplier: 2,
    pauseWhileDragging: false,
    noSwipeGesture: false,
    seekingRequestThrottle: 100
  };
  static state = sliderState;
  #media;
  #dispatchSeeking;
  #chapter = signal(null);
  constructor() {
    super();
    const { noSwipeGesture } = this.$props;
    new SliderController({
      swipeGesture: () => !noSwipeGesture(),
      getValue: this.#getValue.bind(this),
      getStep: this.#getStep.bind(this),
      getKeyStep: this.#getKeyStep.bind(this),
      roundValue: this.#roundValue,
      isDisabled: this.#isDisabled.bind(this),
      aria: {
        valueNow: this.#getARIAValueNow.bind(this),
        valueText: this.#getARIAValueText.bind(this)
      },
      onDragStart: this.#onDragStart.bind(this),
      onDragValueChange: this.#onDragValueChange.bind(this),
      onDragEnd: this.#onDragEnd.bind(this),
      onValueChange: this.#onValueChange.bind(this)
    });
  }
  onSetup() {
    this.#media = useMediaContext();
    provideContext(sliderValueFormatContext, {
      default: "time",
      value: this.#formatValue.bind(this),
      time: this.#formatTime.bind(this)
    });
    this.setAttributes({ "data-chapters": this.#hasChapters.bind(this) });
    this.setStyles({ "--slider-progress": this.#calcBufferedPercent.bind(this) });
    effect(this.#watchCurrentTime.bind(this));
    effect(this.#watchSeekingThrottle.bind(this));
  }
  onConnect() {
    onDispose(() => {
      this.#dispatchSeeking?.cancel();
      this.#playingBeforeDragStart = false;
    });
  }
  onAttach(el) {
    el.setAttribute("data-media-time-slider", "");
    setAttributeIfEmpty(el, "aria-label", "Seek");
  }
  onConnect(el) {
    effect(this.#watchPreviewing.bind(this));
    watchActiveTextTrack(this.#media.textTracks, "chapters", this.#chapter.set);
  }
  #calcBufferedPercent() {
    const { bufferedEnd, duration, seekableStart, clipStartTime } = this.#media.$state;
    const start = Math.max(0, seekableStart() - clipStartTime());
    return round(Math.max(0, Math.min((bufferedEnd() - start) / Math.max(duration(), 1), 1)) * 100, 3) + "%";
  }
  #hasChapters() {
    const { duration } = this.#media.$state;
    return this.#chapter()?.cues.length && Number.isFinite(duration()) && duration() > 0;
  }
  #watchSeekingThrottle() {
    this.#dispatchSeeking?.cancel();
    this.#dispatchSeeking = functionThrottle(this.#seeking.bind(this), this.$props.seekingRequestThrottle());
  }
  #watchCurrentTime() {
    if (this.$state.hidden()) return;
    const { value, dragging } = this.$state, newValue = this.#getValue();
    if (!peek(dragging)) {
      value.set(newValue);
      this.dispatch("value-change", { detail: newValue });
    }
  }
  #watchPreviewing() {
    const player = this.#media.player.el, { preview } = useContext(sliderContext);
    player && preview() && setAttribute(player, "data-preview", this.$state.active());
  }
  #seeking(time, event) {
    this.#media.remote.seeking(time, event);
  }
  #seek(time, percent, event) {
    this.#dispatchSeeking.cancel();
    const { live } = this.#media.$state;
    if (live() && percent >= 99) {
      this.#media.remote.seekToLiveEdge(event);
      return;
    }
    this.#media.remote.seek(time, event);
  }
  #playingBeforeDragStart = false;
  #onDragStart(event) {
    const { pauseWhileDragging } = this.$props;
    if (pauseWhileDragging()) {
      const { paused } = this.#media.$state;
      this.#playingBeforeDragStart = !paused();
      this.#media.remote.pause(event);
    }
  }
  #onDragValueChange(event) {
    this.#dispatchSeeking(this.#percentToTime(event.detail), event);
  }
  #onDragEnd(event) {
    const { seeking } = this.#media.$state;
    if (!peek(seeking)) this.#seeking(this.#percentToTime(event.detail), event);
    const percent = event.detail;
    this.#seek(this.#percentToTime(percent), percent, event);
    const { pauseWhileDragging } = this.$props;
    if (pauseWhileDragging() && this.#playingBeforeDragStart) {
      this.#media.remote.play(event);
      this.#playingBeforeDragStart = false;
    }
  }
  #onValueChange(event) {
    const { dragging } = this.$state;
    if (dragging() || !event.trigger) return;
    this.#onDragEnd(event);
  }
  #getValue() {
    const { currentTime } = this.#media.$state;
    return this.#timeToPercent(currentTime());
  }
  #getStep() {
    const value = this.$props.step() / this.#media.$state.duration() * 100;
    return Number.isFinite(value) ? value : 1;
  }
  #getKeyStep() {
    const value = this.$props.keyStep() / this.#media.$state.duration() * 100;
    return Number.isFinite(value) ? value : 1;
  }
  #roundValue(value) {
    return round(value, 3);
  }
  #isDisabled() {
    const { disabled } = this.$props, { canSeek } = this.#media.$state;
    return disabled() || !canSeek();
  }
  #getARIAValueNow() {
    const { value } = this.$state;
    return Math.round(value());
  }
  #getARIAValueText() {
    const { duration, seekableStart, clipStartTime } = this.#media.$state, time = this.#percentToTime(this.$state.value()) - Math.max(0, seekableStart() - clipStartTime());
    return Number.isFinite(time) ? `${formatSpokenTime(time)} out of ${formatSpokenTime(duration())}` : "live";
  }
  #percentToTime(percent) {
    const { duration, seekableStart, clipStartTime } = this.#media.$state;
    return round(Math.max(0, seekableStart() - clipStartTime()) + percent / 100 * duration(), 5);
  }
  #timeToPercent(time) {
    const { liveEdge, duration, seekableStart, clipStartTime } = this.#media.$state, start = Math.max(0, seekableStart() - clipStartTime()), rate = Math.max(0, Math.min(1, liveEdge() ? 1 : (time - start) / duration()));
    return Number.isNaN(rate) ? 0 : Number.isFinite(rate) ? rate * 100 : 100;
  }
  #formatValue(percent) {
    const time = this.#percentToTime(percent), { live, duration, seekableStart, clipStartTime } = this.#media.$state;
    return Number.isFinite(time) ? (live() ? time - duration() - Math.max(0, seekableStart() - clipStartTime()) : time).toFixed(0) : "LIVE";
  }
  #formatTime(percent, options) {
    const time = this.#percentToTime(percent), { live, duration, seekableStart, clipStartTime } = this.#media.$state, value = live() ? time - duration() - Math.max(0, seekableStart() - clipStartTime()) : time;
    return Number.isFinite(time) ? `${value < 0 ? "-" : ""}${formatTime(Math.abs(value), options)}` : "LIVE";
  }
};
var menuContext = createContext();
function scrollIntoView(el, options) {
  const scrolls = r(el, options);
  for (const { el: el2, top, left } of scrolls) el2.scroll({
    top,
    left,
    behavior: options.behavior
  });
}
function scrollIntoCenter(el, options = {}) {
  scrollIntoView(el, {
    scrollMode: "if-needed",
    block: "center",
    inline: "center",
    ...options
  });
}
var FOCUSABLE_ELEMENTS_SELECTOR = /* @__PURE__ */ [
  "a[href]",
  "[tabindex]",
  "input",
  "select",
  "button"
].map((selector) => `${selector}:not([aria-hidden='true'])`).join(",");
var VALID_KEYS = /* @__PURE__ */ new Set([
  "Escape",
  "Tab",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "PageUp",
  "End",
  "PageDown",
  "Enter",
  " "
]);
var MenuFocusController = class {
  #index = -1;
  #el = null;
  #elements = [];
  #delegate;
  get items() {
    return this.#elements;
  }
  constructor(delegate) {
    this.#delegate = delegate;
  }
  attachMenu(el) {
    listenEvent(el, "focus", this.#onFocus.bind(this));
    this.#el = el;
    onDispose(() => {
      this.#el = null;
    });
  }
  listen() {
    if (!this.#el) return;
    this.update();
    new EventsController(this.#el).add("keyup", this.#onKeyUp.bind(this)).add("keydown", this.#onKeyDown.bind(this));
    onDispose(() => {
      this.#index = -1;
      this.#elements = [];
    });
  }
  update() {
    this.#index = 0;
    this.#elements = this.#getFocusableElements();
  }
  scroll(index = this.#findActiveIndex()) {
    const element = this.#elements[index];
    if (element) requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollIntoCenter(element, {
          behavior: "smooth",
          boundary: (el) => {
            return !el.hasAttribute("data-root");
          }
        });
      });
    });
  }
  focusActive(scroll = true) {
    const index = this.#findActiveIndex();
    this.#focusAt(index >= 0 ? index : 0, scroll);
  }
  #focusAt(index, scroll = true) {
    this.#index = index;
    if (this.#elements[index]) {
      this.#elements[index].focus({ preventScroll: true });
      if (scroll) this.scroll(index);
    } else this.#el?.focus({ preventScroll: true });
  }
  #findActiveIndex() {
    return this.#elements.findIndex((el) => document.activeElement === el || el.getAttribute("role") === "menuitemradio" && el.getAttribute("aria-checked") === "true");
  }
  #onFocus() {
    if (this.#index >= 0) return;
    this.update();
    this.focusActive();
  }
  #validateKeyEvent(event) {
    const el = event.target;
    if (wasEnterKeyPressed(event) && el instanceof Element) {
      const role = el.getAttribute("role");
      return !/a|input|select|button/.test(el.localName) && !role;
    }
    return VALID_KEYS.has(event.key);
  }
  #onKeyUp(event) {
    if (!this.#validateKeyEvent(event)) return;
    event.stopPropagation();
    event.preventDefault();
  }
  #onKeyDown(event) {
    if (!this.#validateKeyEvent(event)) return;
    event.stopPropagation();
    event.preventDefault();
    switch (event.key) {
      case "Escape":
        this.#delegate.closeMenu(event);
        break;
      case "Tab":
        this.#focusAt(this.#nextIndex(event.shiftKey ? -1 : 1));
        break;
      case "ArrowUp":
        this.#focusAt(this.#nextIndex(-1));
        break;
      case "ArrowDown":
        this.#focusAt(this.#nextIndex(1));
        break;
      case "Home":
      case "PageUp":
        this.#focusAt(0);
        break;
      case "End":
      case "PageDown":
        this.#focusAt(this.#elements.length - 1);
        break;
    }
  }
  #nextIndex(delta) {
    let index = this.#index;
    do
      index = (index + delta + this.#elements.length) % this.#elements.length;
    while (this.#elements[index]?.offsetParent === null);
    return index;
  }
  #getFocusableElements() {
    if (!this.#el) return [];
    const focusableElements = this.#el.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR), elements = [];
    const is = (node) => {
      return node.getAttribute("role") === "menu";
    };
    for (const el of focusableElements) if (isHTMLElement(el) && el.offsetParent !== null && isElementParent(this.#el, el, is)) elements.push(el);
    return elements;
  }
};
function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r2 = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r2 = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r2 = (c < 3 ? d(r2) : c > 3 ? d(target, key, r2) : d(target, key)) || r2;
  return c > 3 && r2 && Object.defineProperty(target, key, r2), r2;
}
var idCount = 0;
var Menu = class extends Component {
  static props = { showDelay: 0 };
  #media;
  #menuId;
  #menuButtonId;
  #expanded = signal(false);
  #disabled = signal(false);
  #trigger = signal(null);
  #content = signal(null);
  #parentMenu;
  #submenus = /* @__PURE__ */ new Set();
  #menuObserver = null;
  #popper;
  #focus;
  #isSliderActive = false;
  #isTriggerDisabled = signal(false);
  #transitionCallbacks = /* @__PURE__ */ new Set();
  /**
  * The menu trigger element.
  */
  get triggerElement() {
    return this.#trigger();
  }
  /**
  * The menu items element.
  */
  get contentElement() {
    return this.#content();
  }
  /**
  * Whether this menu is the child of another menu that contains it.
  */
  get isSubmenu() {
    return !!this.#parentMenu;
  }
  constructor() {
    super();
    const { showDelay } = this.$props;
    this.#popper = new Popper({
      trigger: this.#trigger,
      content: this.#content,
      showDelay,
      listen: (trigger, show, hide) => {
        onPress(trigger, (event) => {
          if (this.#expanded()) hide(event);
          else show(event);
        });
        const closeTarget = this.#getCloseTarget();
        if (closeTarget) onPress(closeTarget, (event) => {
          event.stopPropagation();
          hide(event);
        });
      },
      onChange: this.#onExpandedChange.bind(this)
    });
  }
  onSetup() {
    this.#media = useMediaContext();
    const currentIdCount = ++idCount;
    this.#menuId = `media-menu-${currentIdCount}`;
    this.#menuButtonId = `media-menu-button-${currentIdCount}`;
    this.#focus = new MenuFocusController({ closeMenu: this.close.bind(this) });
    if (hasProvidedContext(menuContext)) this.#parentMenu = useContext(menuContext);
    this.#observeSliders();
    this.setAttributes({
      "data-open": this.#expanded,
      "data-root": !this.isSubmenu,
      "data-submenu": this.isSubmenu,
      "data-disabled": this.#isDisabled.bind(this)
    });
    provideContext(menuContext, {
      button: this.#trigger,
      content: this.#content,
      expanded: this.#expanded,
      hint: signal(""),
      submenu: !!this.#parentMenu,
      disable: this.#disable.bind(this),
      attachMenuButton: this.#attachMenuButton.bind(this),
      attachMenuItems: this.#attachMenuItems.bind(this),
      attachObserver: this.#attachObserver.bind(this),
      disableMenuButton: this.#disableMenuButton.bind(this),
      addSubmenu: this.#addSubmenu.bind(this),
      onTransitionEvent: (callback) => {
        this.#transitionCallbacks.add(callback);
        onDispose(() => {
          this.#transitionCallbacks.delete(callback);
        });
      }
    });
  }
  onAttach(el) {
    el.style.setProperty("display", "contents");
  }
  onConnect(el) {
    effect(this.#watchExpanded.bind(this));
    if (this.isSubmenu) this.#parentMenu?.addSubmenu(this);
  }
  onDestroy() {
    this.#trigger.set(null);
    this.#content.set(null);
    this.#menuObserver = null;
    this.#transitionCallbacks.clear();
  }
  #observeSliders() {
    let sliderActiveTimer = -1, parentSliderObserver = hasProvidedContext(sliderObserverContext) ? useContext(sliderObserverContext) : null;
    provideContext(sliderObserverContext, {
      onDragStart: () => {
        parentSliderObserver?.onDragStart?.();
        window.clearTimeout(sliderActiveTimer);
        sliderActiveTimer = -1;
        this.#isSliderActive = true;
      },
      onDragEnd: () => {
        parentSliderObserver?.onDragEnd?.();
        sliderActiveTimer = window.setTimeout(() => {
          this.#isSliderActive = false;
          sliderActiveTimer = -1;
        }, 300);
      }
    });
  }
  #watchExpanded() {
    const expanded = this.#isExpanded();
    if (!this.isSubmenu) this.#onResize();
    this.#updateMenuItemsHidden(expanded);
    if (!expanded) return;
    effect(() => {
      const { height } = this.#media.$state, content = this.#content();
      content && setStyle(content, "--player-height", height() + "px");
    });
    this.#focus.listen();
    this.listen("pointerup", this.#onPointerUp.bind(this));
    listenEvent(window, "pointerup", this.#onWindowPointerUp.bind(this));
  }
  #attachMenuButton(button) {
    const el = button.el, isMenuItem = this.isSubmenu, isARIADisabled = $ariaBool(this.#isDisabled.bind(this));
    setAttributeIfEmpty(el, "tabindex", isMenuItem ? "-1" : "0");
    setAttributeIfEmpty(el, "role", isMenuItem ? "menuitem" : "button");
    setAttribute(el, "id", this.#menuButtonId);
    setAttribute(el, "aria-haspopup", "menu");
    setAttribute(el, "aria-expanded", "false");
    setAttribute(el, "data-root", !this.isSubmenu);
    setAttribute(el, "data-submenu", this.isSubmenu);
    const watchAttrs = () => {
      setAttribute(el, "data-open", this.#expanded());
      setAttribute(el, "aria-disabled", isARIADisabled());
    };
    effect(watchAttrs);
    this.#trigger.set(el);
    onDispose(() => {
      this.#trigger.set(null);
    });
  }
  #attachMenuItems(items) {
    const el = items.el;
    el.style.setProperty("display", "none");
    setAttribute(el, "id", this.#menuId);
    setAttributeIfEmpty(el, "role", "menu");
    setAttributeIfEmpty(el, "tabindex", "-1");
    setAttribute(el, "data-root", !this.isSubmenu);
    setAttribute(el, "data-submenu", this.isSubmenu);
    this.#content.set(el);
    onDispose(() => this.#content.set(null));
    const watchAttrs = () => setAttribute(el, "data-open", this.#expanded());
    effect(watchAttrs);
    this.#focus.attachMenu(el);
    this.#updateMenuItemsHidden(false);
    const onTransition = this.#onResizeTransition.bind(this);
    if (!this.isSubmenu) {
      items.listen("transitionstart", onTransition);
      items.listen("transitionend", onTransition);
      items.listen("animationend", this.#onResize);
      items.listen("vds-menu-resize", this.#onResize);
    } else this.#parentMenu?.onTransitionEvent(onTransition);
  }
  #attachObserver(observer) {
    this.#menuObserver = observer;
  }
  #updateMenuItemsHidden(expanded) {
    const content = peek(this.#content);
    if (content) setAttribute(content, "aria-hidden", ariaBool(!expanded));
  }
  #disableMenuButton(disabled) {
    this.#isTriggerDisabled.set(disabled);
  }
  #wasKeyboardExpand = false;
  #onExpandedChange(isExpanded, event) {
    this.#wasKeyboardExpand = isKeyboardEvent(event);
    event?.stopPropagation();
    if (this.#expanded() === isExpanded) return;
    if (this.#isDisabled()) {
      if (isExpanded) this.#popper.hide(event);
      return;
    }
    this.el?.dispatchEvent(new Event("vds-menu-resize", {
      bubbles: true,
      composed: true
    }));
    const trigger = this.#trigger(), content = this.#content();
    if (trigger) {
      setAttribute(trigger, "aria-controls", isExpanded && this.#menuId);
      setAttribute(trigger, "aria-expanded", ariaBool(isExpanded));
    }
    if (content) setAttribute(content, "aria-labelledby", isExpanded && this.#menuButtonId);
    this.#expanded.set(isExpanded);
    this.#toggleMediaControls(event);
    tick();
    if (this.#wasKeyboardExpand) {
      if (isExpanded) content?.focus();
      else trigger?.focus();
      for (const el of [this.el, content]) el && el.setAttribute("data-keyboard", "");
    } else for (const el of [this.el, content]) el && el.removeAttribute("data-keyboard");
    this.dispatch(isExpanded ? "open" : "close", { trigger: event });
    if (isExpanded) {
      if (!this.isSubmenu && this.#media.activeMenu !== this) {
        this.#media.activeMenu?.close(event);
        this.#media.activeMenu = this;
      }
      this.#menuObserver?.onOpen?.(event);
    } else {
      if (this.isSubmenu) for (const el of this.#submenus) el.close(event);
      else this.#media.activeMenu = null;
      this.#menuObserver?.onClose?.(event);
    }
    if (isExpanded) requestAnimationFrame(this.#updateFocus.bind(this));
  }
  #updateFocus() {
    if (this.#isTransitionActive || this.#isSubmenuOpen) return;
    this.#focus.update();
    requestAnimationFrame(() => {
      if (this.#wasKeyboardExpand) this.#focus.focusActive();
      else this.#focus.scroll();
    });
  }
  #isExpanded() {
    return !this.#isDisabled() && this.#expanded();
  }
  #isDisabled() {
    return this.#disabled() || this.#isTriggerDisabled();
  }
  #disable(disabled) {
    this.#disabled.set(disabled);
  }
  #onPointerUp(event) {
    const content = this.#content();
    if (this.#isSliderActive || content && isEventInside(content, event)) return;
    event.stopPropagation();
  }
  #onWindowPointerUp(event) {
    const content = this.#content();
    if (this.#isSliderActive || content && isEventInside(content, event)) return;
    this.close(event);
  }
  #getCloseTarget() {
    const target = this.el?.querySelector('[data-part="close-target"]');
    return this.el && target && isElementParent(this.el, target, (node) => node.getAttribute("role") === "menu") ? target : null;
  }
  #toggleMediaControls(trigger) {
    if (this.isSubmenu) return;
    if (this.#expanded()) this.#media.remote.pauseControls(trigger);
    else this.#media.remote.resumeControls(trigger);
  }
  #addSubmenu(menu) {
    this.#submenus.add(menu);
    new EventsController(menu).add("open", this.#onSubmenuOpenBind).add("close", this.#onSubmenuCloseBind);
    onDispose(this.#removeSubmenuBind);
  }
  #removeSubmenuBind = this.#removeSubmenu.bind(this);
  #removeSubmenu(menu) {
    this.#submenus.delete(menu);
  }
  #isSubmenuOpen = false;
  #onSubmenuOpenBind = this.#onSubmenuOpen.bind(this);
  #onSubmenuOpen(event) {
    this.#isSubmenuOpen = true;
    const content = this.#content();
    if (this.isSubmenu) this.triggerElement?.setAttribute("aria-hidden", "true");
    for (const target of this.#submenus) if (target !== event.target) for (const el of [target.el, target.triggerElement]) el?.setAttribute("aria-hidden", "true");
    if (content) {
      const el = event.target.el;
      for (const child of content.children) if (child.contains(el)) child.setAttribute("data-open", "");
      else if (child !== el) child.setAttribute("data-hidden", "");
    }
  }
  #onSubmenuCloseBind = this.#onSubmenuClose.bind(this);
  #onSubmenuClose(event) {
    this.#isSubmenuOpen = false;
    const content = this.#content();
    if (this.isSubmenu) this.triggerElement?.setAttribute("aria-hidden", "false");
    for (const target of this.#submenus) for (const el of [target.el, target.triggerElement]) el?.setAttribute("aria-hidden", "false");
    if (content) for (const child of content.children) {
      child.removeAttribute("data-open");
      child.removeAttribute("data-hidden");
    }
  }
  #onResize = animationFrameThrottle(() => {
    const content = peek(this.#content);
    if (!content || false) return;
    let height = 0, styles = getComputedStyle(content), children = [...content.children];
    for (const prop2 of [
      "paddingTop",
      "paddingBottom",
      "borderTopWidth",
      "borderBottomWidth"
    ]) height += parseFloat(styles[prop2]) || 0;
    for (const child of children) if (isHTMLElement(child) && child.style.display === "contents") children.push(...child.children);
    else if (child.nodeType === 3) height += parseFloat(getComputedStyle(child).fontSize);
    else if (isHTMLElement(child)) {
      if (!isElementVisible(child)) continue;
      const style = getComputedStyle(child);
      height += child.offsetHeight + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
    }
    setStyle(content, "--menu-height", height + "px");
  });
  #isTransitionActive = false;
  #onResizeTransition(event) {
    const content = this.#content();
    if (content && event.propertyName === "height") {
      this.#isTransitionActive = event.type === "transitionstart";
      setAttribute(content, "data-transition", this.#isTransitionActive ? "height" : null);
      if (this.#expanded()) this.#updateFocus();
    }
    for (const callback of this.#transitionCallbacks) callback(event);
  }
  /**
  * Open this menu. The first menu item will be focused if a `KeyboardEvent` trigger is provided
  */
  open(trigger) {
    if (peek(this.#expanded)) return;
    this.#popper.show(trigger);
    tick();
  }
  /**
  * Close this menu. The menu button that controls this menu will be focused if a `KeyboardEvent`
  * trigger is provided
  */
  close(trigger) {
    if (!peek(this.#expanded)) return;
    this.#popper.hide(trigger);
    tick();
  }
};
__decorate([prop], Menu.prototype, "triggerElement", null);
__decorate([prop], Menu.prototype, "contentElement", null);
__decorate([prop], Menu.prototype, "isSubmenu", null);
__decorate([method], Menu.prototype, "open", null);
__decorate([method], Menu.prototype, "close", null);
var MenuButton = class extends Component {
  static props = { disabled: false };
  #menu;
  #hintEl = signal(null);
  get expanded() {
    return this.#menu?.expanded() ?? false;
  }
  constructor() {
    super();
    new FocusVisibleController();
  }
  onSetup() {
    this.#menu = useContext(menuContext);
  }
  onAttach(el) {
    this.#menu.attachMenuButton(this);
    effect(this.#watchDisabled.bind(this));
    setAttributeIfEmpty(el, "type", "button");
  }
  onConnect(el) {
    effect(this.#watchHintEl.bind(this));
    this.#onMutation();
    const mutations = new MutationObserver(this.#onMutation.bind(this));
    mutations.observe(el, {
      attributeFilter: ["data-part"],
      childList: true,
      subtree: true
    });
    onDispose(() => mutations.disconnect());
    onPress(el, (trigger) => {
      this.dispatch("select", { trigger });
    });
  }
  #watchDisabled() {
    this.#menu.disableMenuButton(this.$props.disabled());
  }
  #watchHintEl() {
    const el = this.#hintEl();
    if (!el) return;
    effect(() => {
      const text = this.#menu.hint();
      if (text) el.textContent = text;
    });
  }
  #onMutation() {
    const hintEl = this.el?.querySelector('[data-part="hint"]');
    this.#hintEl.set(hintEl ?? null);
  }
};
var menubutton__proto = MenuButton.prototype;
prop(menubutton__proto, "expanded");
var MenuItem = class extends MenuButton {
};
var MenuPortal = class extends Component {
  static props = {
    container: null,
    disabled: false
  };
  #target = null;
  #media;
  onSetup() {
    this.#media = useMediaContext();
    provideContext(menuPortalContext, { attach: this.#attachElement.bind(this) });
  }
  onAttach(el) {
    el.style.setProperty("display", "contents");
  }
  onConnect(el) {
  }
  onDestroy() {
    this.#target?.remove();
    this.#target = null;
  }
  #attachElement(el) {
    this.#portal(false);
    this.#target = el;
    requestScopedAnimationFrame(() => {
      requestScopedAnimationFrame(() => {
        if (!this.connectScope) return;
        effect(this.#watchDisabled.bind(this));
      });
    });
  }
  #watchDisabled() {
    const { fullscreen } = this.#media.$state, { disabled } = this.$props;
    this.#portal(disabled() === "fullscreen" ? !fullscreen() : !disabled());
  }
  #portal(shouldPortal) {
    if (!this.#target) return;
    let container = this.#getContainer(this.$props.container());
    if (!container) return;
    const isPortalled = this.#target.parentElement === container;
    setAttribute(this.#target, "data-portal", shouldPortal);
    if (shouldPortal) {
      if (!isPortalled) {
        this.#target.remove();
        container.append(this.#target);
      }
    } else if (isPortalled && this.#target.parentElement === container) {
      this.#target.remove();
      this.el?.append(this.#target);
    }
  }
  #getContainer(selector) {
    if (isHTMLElement(selector)) return selector;
    return selector ? document.querySelector(selector) : document.body;
  }
};
var menuPortalContext = createContext();
var MenuItems = class extends Component {
  static props = {
    placement: null,
    offset: 0,
    alignOffset: 0
  };
  #menu;
  constructor() {
    super();
    new FocusVisibleController();
    const { placement } = this.$props;
    this.setAttributes({ "data-placement": placement });
  }
  onAttach(el) {
    this.#menu = useContext(menuContext);
    this.#menu.attachMenuItems(this);
    if (hasProvidedContext(menuPortalContext)) {
      const portal = useContext(menuPortalContext);
      if (portal) {
        provideContext(menuPortalContext, null);
        portal.attach(el);
        onDispose(() => portal.attach(null));
      }
    }
  }
  onConnect(el) {
    effect(this.#watchPlacement.bind(this));
  }
  #watchPlacement() {
    const { expanded } = this.#menu;
    if (!this.el || !expanded()) return;
    const placement = this.$props.placement();
    if (!placement) return;
    Object.assign(this.el.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "max-content"
    });
    const { offset: mainOffset, alignOffset } = this.$props;
    onDispose(autoPlacement(this.el, this.#getButton(), placement, {
      offsetVarName: "media-menu",
      xOffset: alignOffset(),
      yOffset: mainOffset()
    }));
    onDispose(this.#hide.bind(this));
  }
  #hide() {
    if (!this.el) return;
    this.el.removeAttribute("style");
    this.el.style.display = "none";
  }
  #getButton() {
    return this.#menu.button();
  }
};
var radioControllerContext = createContext();
var RadioGroupController = class extends ViewController {
  #group = /* @__PURE__ */ new Set();
  #value = signal("");
  #controller = null;
  onValueChange;
  get values() {
    return Array.from(this.#group).map((radio) => radio.value());
  }
  get value() {
    return this.#value();
  }
  set value(value) {
    this.#onChange(value);
  }
  onSetup() {
    provideContext(radioControllerContext, {
      add: this.#addRadio.bind(this),
      remove: this.#removeRadio.bind(this)
    });
  }
  onAttach(el) {
    if (!hasProvidedContext(menuContext)) setAttributeIfEmpty(el, "role", "radiogroup");
    this.setAttributes({ value: this.#value });
  }
  onDestroy() {
    this.#group.clear();
  }
  #addRadio(radio) {
    if (this.#group.has(radio)) return;
    this.#group.add(radio);
    radio.onCheck = this.#onChangeBind;
    radio.check(radio.value() === this.#value());
  }
  #removeRadio(radio) {
    radio.onCheck = null;
    this.#group.delete(radio);
  }
  #onChangeBind = this.#onChange.bind(this);
  #onChange(newValue, trigger) {
    const currentValue = peek(this.#value);
    if (!newValue || newValue === currentValue) return;
    const currentRadio = this.#findRadio(currentValue), newRadio = this.#findRadio(newValue);
    currentRadio?.check(false, trigger);
    newRadio?.check(true, trigger);
    this.#value.set(newValue);
    this.onValueChange?.(newValue, trigger);
  }
  #findRadio(newValue) {
    for (const radio of this.#group) if (newValue === peek(radio.value)) return radio;
    return null;
  }
};
var Radio = class extends Component {
  static props = { value: "" };
  #checked = signal(false);
  #controller = {
    value: this.$props.value,
    check: this.#check.bind(this),
    onCheck: null
  };
  /**
  * Whether this radio is currently checked.
  */
  get checked() {
    return this.#checked();
  }
  constructor() {
    super();
    new FocusVisibleController();
  }
  onSetup() {
    this.setAttributes({
      value: this.$props.value,
      "data-checked": this.#checked,
      "aria-checked": $ariaBool(this.#checked)
    });
  }
  onAttach(el) {
    const isMenuItem = hasProvidedContext(menuContext);
    setAttributeIfEmpty(el, "tabindex", isMenuItem ? "-1" : "0");
    setAttributeIfEmpty(el, "role", isMenuItem ? "menuitemradio" : "radio");
    effect(this.#watchValue.bind(this));
  }
  onConnect(el) {
    this.#addToGroup();
    onPress(el, this.#onPress.bind(this));
    onDispose(this.#onDisconnect.bind(this));
  }
  #onDisconnect() {
    scoped(() => {
      useContext(radioControllerContext).remove(this.#controller);
    }, this.connectScope);
  }
  #addToGroup() {
    useContext(radioControllerContext).add(this.#controller);
  }
  #watchValue() {
    const { value } = this.$props, newValue = value();
    if (peek(this.#checked)) this.#controller.onCheck?.(newValue);
  }
  #onPress(event) {
    if (peek(this.#checked)) return;
    this.#onChange(true, event);
    this.#onSelect(event);
    this.#controller.onCheck?.(peek(this.$props.value), event);
  }
  #check(value, trigger) {
    if (peek(this.#checked) === value) return;
    this.#onChange(value, trigger);
  }
  #onChange(value, trigger) {
    this.#checked.set(value);
    this.dispatch("change", {
      detail: value,
      trigger
    });
  }
  #onSelect(trigger) {
    this.dispatch("select", { trigger });
  }
};
var radio__proto = Radio.prototype;
prop(radio__proto, "checked");
var AudioRadioGroup = class extends Component {
  static props = { emptyLabel: "Default" };
  #menu;
  #media;
  #controller;
  get value() {
    return this.#controller.value;
  }
  get disabled() {
    const { audioTracks } = this.#media.$state;
    return audioTracks().length <= 1;
  }
  constructor() {
    super();
    this.#controller = new RadioGroupController();
    this.#controller.onValueChange = this.#onValueChange.bind(this);
  }
  onSetup() {
    this.#media = useMediaContext();
    if (hasProvidedContext(menuContext)) this.#menu = useContext(menuContext);
  }
  onConnect(el) {
    effect(this.#watchValue.bind(this));
    effect(this.#watchControllerDisabled.bind(this));
    effect(this.#watchHintText.bind(this));
  }
  getOptions() {
    const { audioTracks } = this.#media.$state;
    return audioTracks().map((track) => ({
      track,
      label: track.label,
      value: track.label.toLowerCase()
    }));
  }
  #watchValue() {
    this.#controller.value = this.#getValue();
  }
  #watchHintText() {
    const { emptyLabel } = this.$props, { audioTrack } = this.#media.$state, track = audioTrack();
    this.#menu?.hint.set(track?.label ?? emptyLabel());
  }
  #watchControllerDisabled() {
    this.#menu?.disable(this.disabled);
  }
  #getValue() {
    const { audioTrack } = this.#media.$state;
    const track = audioTrack();
    return track ? track.label.toLowerCase() : "";
  }
  #onValueChange(value, trigger) {
    if (this.disabled) return;
    const index = this.#media.audioTracks.toArray().findIndex((track) => track.label.toLowerCase() === value);
    if (index >= 0) {
      const track = this.#media.audioTracks[index];
      this.#media.remote.changeAudioTrack(index, trigger);
      this.dispatch("change", {
        detail: track,
        trigger
      });
    }
  }
};
var audioradiogroup__proto = AudioRadioGroup.prototype;
prop(audioradiogroup__proto, "value");
prop(audioradiogroup__proto, "disabled");
method(audioradiogroup__proto, "getOptions");
var CaptionsRadioGroup = class extends Component {
  static props = { offLabel: "Off" };
  #media;
  #menu;
  #controller;
  get value() {
    return this.#controller.value;
  }
  get disabled() {
    const { hasCaptions } = this.#media.$state;
    return !hasCaptions();
  }
  constructor() {
    super();
    this.#controller = new RadioGroupController();
    this.#controller.onValueChange = this.#onValueChange.bind(this);
  }
  onSetup() {
    this.#media = useMediaContext();
    if (hasProvidedContext(menuContext)) this.#menu = useContext(menuContext);
  }
  onConnect(el) {
    super.onConnect?.(el);
    effect(this.#watchValue.bind(this));
    effect(this.#watchControllerDisabled.bind(this));
    effect(this.#watchHintText.bind(this));
  }
  getOptions() {
    const { offLabel } = this.$props, { textTracks } = this.#media.$state;
    return [{
      value: "off",
      label: offLabel
    }, ...textTracks().filter(isTrackCaptionKind).map((track) => ({
      track,
      label: track.label,
      value: this.#getTrackValue(track)
    }))];
  }
  #watchValue() {
    this.#controller.value = this.#getValue();
  }
  #watchHintText() {
    const { offLabel } = this.$props, { textTrack } = this.#media.$state, track = textTrack();
    this.#menu?.hint.set(track && isTrackCaptionKind(track) && track.mode === "showing" ? track.label : offLabel());
  }
  #watchControllerDisabled() {
    this.#menu?.disable(this.disabled);
  }
  #getValue() {
    const { textTrack } = this.#media.$state, track = textTrack();
    return track && isTrackCaptionKind(track) && track.mode === "showing" ? this.#getTrackValue(track) : "off";
  }
  #onValueChange(value, trigger) {
    if (this.disabled) return;
    if (value === "off") {
      this.#media.textTracks.dispatchEvent(new Event("tyl-player-captions-off-request"));
      const track = this.#media.textTracks.selected;
      if (track) {
        const index2 = this.#media.textTracks.indexOf(track);
        this.#media.remote.changeTextTrackMode(index2, "disabled", trigger);
        this.dispatch("change", {
          detail: null,
          trigger
        });
      }
      return;
    }
    const index = this.#media.textTracks.toArray().findIndex((track) => this.#getTrackValue(track) === value);
    if (index >= 0) {
      const track = this.#media.textTracks[index];
      this.#media.remote.changeTextTrackMode(index, "showing", trigger);
      this.dispatch("change", {
        detail: track,
        trigger
      });
    }
  }
  #getTrackValue(track) {
    return track.id + ":" + track.kind + "-" + track.label.toLowerCase();
  }
};
var captionsradiogroup__proto = CaptionsRadioGroup.prototype;
prop(captionsradiogroup__proto, "value");
prop(captionsradiogroup__proto, "disabled");
method(captionsradiogroup__proto, "getOptions");
var DEFAULT_PLAYBACK_RATES = [
  0.25,
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  1.75,
  2
];
var SpeedRadioGroup = class extends Component {
  static props = {
    normalLabel: "Normal",
    rates: DEFAULT_PLAYBACK_RATES
  };
  #media;
  #menu;
  #controller;
  get value() {
    return this.#controller.value;
  }
  get disabled() {
    const { rates } = this.$props, { canSetPlaybackRate } = this.#media.$state;
    return !canSetPlaybackRate() || rates().length === 0;
  }
  constructor() {
    super();
    this.#controller = new RadioGroupController();
    this.#controller.onValueChange = this.#onValueChange.bind(this);
  }
  onSetup() {
    this.#media = useMediaContext();
    if (hasProvidedContext(menuContext)) this.#menu = useContext(menuContext);
  }
  onConnect(el) {
    effect(this.#watchValue.bind(this));
    effect(this.#watchHintText.bind(this));
    effect(this.#watchControllerDisabled.bind(this));
  }
  getOptions() {
    const { rates, normalLabel } = this.$props;
    return rates().map((rate) => ({
      label: rate === 1 ? normalLabel : rate + "\xD7",
      value: rate.toString()
    }));
  }
  #watchValue() {
    this.#controller.value = this.#getValue();
  }
  #watchHintText() {
    const { normalLabel } = this.$props, { playbackRate } = this.#media.$state, rate = playbackRate();
    this.#menu?.hint.set(rate === 1 ? normalLabel() : rate + "\xD7");
  }
  #watchControllerDisabled() {
    this.#menu?.disable(this.disabled);
  }
  #getValue() {
    const { playbackRate } = this.#media.$state;
    return playbackRate().toString();
  }
  #onValueChange(value, trigger) {
    if (this.disabled) return;
    const rate = +value;
    this.#media.remote.changePlaybackRate(rate, trigger);
    this.dispatch("change", {
      detail: rate,
      trigger
    });
  }
};
var speedradiogroup__proto = SpeedRadioGroup.prototype;
prop(speedradiogroup__proto, "value");
prop(speedradiogroup__proto, "disabled");
method(speedradiogroup__proto, "getOptions");
var QualityRadioGroup = class extends Component {
  static props = {
    autoLabel: "Auto",
    hideBitrate: false,
    sort: "descending"
  };
  #media;
  #menu;
  #controller;
  get value() {
    return this.#controller.value;
  }
  get disabled() {
    const { canSetQuality, qualities } = this.#media.$state;
    return !canSetQuality() || qualities().length <= 1;
  }
  #sortedQualities = computed(() => {
    const { sort } = this.$props, { qualities } = this.#media.$state;
    return sortVideoQualities(qualities(), sort() === "descending");
  });
  constructor() {
    super();
    this.#controller = new RadioGroupController();
    this.#controller.onValueChange = this.#onValueChange.bind(this);
  }
  onSetup() {
    this.#media = useMediaContext();
    if (hasProvidedContext(menuContext)) this.#menu = useContext(menuContext);
  }
  onConnect(el) {
    effect(this.#watchValue.bind(this));
    effect(this.#watchControllerDisabled.bind(this));
    effect(this.#watchHintText.bind(this));
  }
  getOptions() {
    const { autoLabel, hideBitrate } = this.$props;
    return [{
      value: "auto",
      label: autoLabel
    }, ...this.#sortedQualities().map((quality) => {
      const bitrate = quality.bitrate && quality.bitrate >= 0 ? `${round(quality.bitrate / 1e6, 2)} Mbps` : null;
      return {
        quality,
        label: quality.height + "p",
        value: this.#getQualityId(quality),
        bitrate: () => !hideBitrate() ? bitrate : null
      };
    })];
  }
  #watchValue() {
    this.#controller.value = this.#getValue();
  }
  #watchHintText() {
    const { autoLabel } = this.$props, { autoQuality, quality } = this.#media.$state, qualityText = quality() ? quality().height + "p" : "";
    this.#menu?.hint.set(!autoQuality() ? qualityText : autoLabel() + (qualityText ? ` (${qualityText})` : ""));
  }
  #watchControllerDisabled() {
    this.#menu?.disable(this.disabled);
  }
  #onValueChange(value, trigger) {
    if (this.disabled) return;
    if (value === "auto") {
      this.#media.remote.changeQuality(-1, trigger);
      this.dispatch("change", {
        detail: "auto",
        trigger
      });
      return;
    }
    const { qualities } = this.#media.$state, index = peek(qualities).findIndex((quality) => this.#getQualityId(quality) === value);
    if (index >= 0) {
      const quality = peek(qualities)[index];
      this.#media.remote.changeQuality(index, trigger);
      this.dispatch("change", {
        detail: quality,
        trigger
      });
    }
  }
  #getValue() {
    const { quality, autoQuality } = this.#media.$state;
    if (autoQuality()) return "auto";
    const currentQuality = quality();
    return currentQuality ? this.#getQualityId(currentQuality) : "auto";
  }
  #getQualityId(quality) {
    return quality.height + "_" + quality.bitrate;
  }
};
var qualityradiogroup__proto = QualityRadioGroup.prototype;
prop(qualityradiogroup__proto, "value");
prop(qualityradiogroup__proto, "disabled");
method(qualityradiogroup__proto, "getOptions");
var Time = class extends Component {
  static props = {
    type: "current",
    showHours: false,
    padHours: null,
    padMinutes: null,
    remainder: false,
    toggle: false,
    hidden: false
  };
  static state = new State({
    timeText: "",
    hidden: false
  });
  #media;
  #invert = signal(null);
  #isVisible = signal(true);
  #isIntersecting = signal(true);
  onSetup() {
    this.#media = useMediaContext();
    this.#watchTime();
    const { type } = this.$props;
    this.setAttributes({
      "data-type": type,
      "data-remainder": this.#shouldInvert.bind(this)
    });
    new IntersectionObserverController({ callback: this.#onIntersectionChange.bind(this) }).attach(this);
  }
  onAttach(el) {
    if (!el.hasAttribute("role")) effect(this.#watchRole.bind(this));
    effect(this.#watchTime.bind(this));
  }
  onConnect(el) {
    onDispose(observeVisibility(el, this.#isVisible.set));
    effect(this.#watchHidden.bind(this));
    effect(this.#watchToggle.bind(this));
  }
  #onIntersectionChange(entries) {
    this.#isIntersecting.set(entries[0].isIntersecting);
  }
  #watchHidden() {
    const { hidden } = this.$props;
    this.$state.hidden.set(hidden() || !this.#isVisible() || !this.#isIntersecting());
  }
  #watchToggle() {
    if (!this.$props.toggle()) {
      this.#invert.set(null);
      return;
    }
    if (this.el) onPress(this.el, this.#onToggle.bind(this));
  }
  #watchTime() {
    const { hidden, timeText } = this.$state, { duration } = this.#media.$state;
    if (hidden()) return;
    const { type, padHours, padMinutes, showHours } = this.$props, seconds = this.#getSeconds(type()), $duration = duration(), shouldInvert = this.#shouldInvert();
    if (!Number.isFinite(seconds + $duration)) {
      timeText.set("LIVE");
      return;
    }
    const formattedTime = formatTime(shouldInvert ? Math.max(0, $duration - seconds) : seconds, {
      padHrs: padHours(),
      padMins: padMinutes(),
      showHrs: showHours()
    });
    timeText.set((shouldInvert ? "-" : "") + formattedTime);
  }
  #watchRole() {
    if (!this.el) return;
    const { toggle } = this.$props;
    setAttribute(this.el, "role", toggle() ? "timer" : null);
    setAttribute(this.el, "tabindex", toggle() ? 0 : null);
  }
  #getSeconds(type) {
    const { bufferedEnd, duration, currentTime, live, seekableStart, clipStartTime } = this.#media.$state;
    const start = live() ? Math.max(0, seekableStart() - clipStartTime()) : 0;
    switch (type) {
      case "buffered":
        return Math.max(0, bufferedEnd() - start);
      case "duration":
        return duration();
      default:
        return Math.max(0, currentTime() - start);
    }
  }
  #shouldInvert() {
    return this.$props.remainder() && this.#invert() !== false;
  }
  #onToggle(event) {
    event.preventDefault();
    if (this.#invert() === null) {
      this.#invert.set(!this.$props.remainder());
      return;
    }
    this.#invert.set((v) => !v);
  }
};

export {
  $keyboard,
  FocusVisibleController,
  sortVideoQualities,
  formatTime,
  formatSpokenTime,
  Popper,
  ToggleButtonController,
  AirPlayButton,
  PlayButton,
  CaptionButton,
  FullscreenButton,
  MuteButton,
  PIPButton,
  SeekButton,
  LiveButton,
  sliderState,
  sliderValueFormatContext,
  SliderController,
  Slider,
  Thumbnail,
  SliderValue,
  SliderPreview,
  VolumeSlider,
  TimeSlider,
  menuContext,
  __decorate,
  Menu,
  MenuButton,
  MenuItem,
  MenuPortal,
  MenuItems,
  RadioGroupController,
  Radio,
  AudioRadioGroup,
  CaptionsRadioGroup,
  SpeedRadioGroup,
  QualityRadioGroup,
  Time
};
