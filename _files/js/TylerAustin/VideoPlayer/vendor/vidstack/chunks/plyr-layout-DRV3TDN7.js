import {
  $signal,
  Icon,
  LayoutIconsLoader,
  SlotManager,
  o
} from "./chunk-PHDYV5JB.min.js";
import {
  MediaAirPlayButtonElement,
  MediaAudioRadioGroupElement,
  MediaCaptionButtonElement,
  MediaCaptionsRadioGroupElement,
  MediaFullscreenButtonElement,
  MediaLiveButtonElement,
  MediaMenuButtonElement,
  MediaMenuElement,
  MediaMenuItemElement,
  MediaMenuItemsElement,
  MediaMuteButtonElement,
  MediaPIPButtonElement,
  MediaPlayButtonElement,
  MediaQualityRadioGroupElement,
  MediaRadioElement,
  MediaSeekButtonElement,
  MediaSliderPreviewElement,
  MediaSliderThumbnailElement,
  MediaSliderValueElement,
  MediaSpeedRadioGroupElement,
  MediaThumbnailElement,
  MediaTimeElement,
  MediaTimeSliderElement,
  MediaVolumeSliderElement
} from "./chunk-JZPJZXYN.min.js";
import {
  LitElement,
  x
} from "./chunk-SLLBIDAD.min.js";
import {
  MediaPosterElement
} from "./chunk-KZ7QCNUH.min.js";
import {
  PlyrLayout,
  usePlyrLayoutClasses,
  usePlyrLayoutContext
} from "./chunk-35Y2LHKI.min.js";
import "./chunk-NOQLW2UX.min.js";
import "./chunk-ZXMGYZS7.min.js";
import "./chunk-TPDK2HQG.min.js";
import {
  useMediaContext
} from "./chunk-6ATT5ISY.min.js";
import "./chunk-75VQWXMD.min.js";
import "./chunk-4C7PIW7M.min.js";
import "./chunk-QKSJYQLF.min.js";
import "./chunk-OPFURCQW.min.js";
import {
  appendParamsToURL,
  getDownloadFile
} from "./chunk-3B4S3VWV.min.js";
import "./chunk-4MKIV6VZ.min.js";
import {
  Host,
  computed,
  defineCustomElement,
  effect,
  isKeyboardClick,
  isKeyboardEvent,
  isString,
  listenEvent,
  onDispose,
  peek,
  signal
} from "./chunk-UMQWA6KQ.min.js";
import "./chunk-3VL6JVTN.min.js";

// node_modules/vidstack/prod/chunks/vidstack-Otcg66CV.js
var PlyrLayoutIconsLoader = class extends LayoutIconsLoader {
  async loadIcons() {
    const paths = (await import("./vidstack-BILrshkt2-CSIKJZZM.min.js")).icons, icons = {};
    for (const iconName of Object.keys(paths)) icons[iconName] = Icon({
      name: iconName,
      paths: paths[iconName],
      viewBox: "0 0 18 18"
    });
    return icons;
  }
};
function i18n(translations, word) {
  return translations()?.[word] ?? word;
}
function PlyrAudioLayout() {
  return AudioControls();
}
function PlyrVideoLayout() {
  const media = useMediaContext(), { load } = media.$props, { canLoad } = media.$state;
  if (computed(() => load() === "play" && !canLoad())()) return [PlayLargeButton(), Poster()];
  return [
    OptionalPlayLarge(),
    PreviewScrubbing(),
    Poster(),
    VideoControls(),
    Gestures(),
    Captions()
  ];
}
function PlayLargeButton() {
  const media = useMediaContext(), { translations } = usePlyrLayoutContext(), { title } = media.$state;
  return x`
    <media-play-button
      class="plyr__control plyr__control--overlaid"
      aria-label=${$signal(() => `${i18n(translations, "Play")}, ${title()}`)}
      data-plyr="play"
    >
      <slot name="play-icon"></slot>
    </button>
  `;
}
function OptionalPlayLarge() {
  const { controls } = usePlyrLayoutContext();
  return $signal(() => controls().includes("play-large") ? PlayLargeButton() : null);
}
function PreviewScrubbing() {
  const { thumbnails, previewTime } = usePlyrLayoutContext();
  return x`
    <media-thumbnail
      .src=${$signal(thumbnails)}
      class="plyr__preview-scrubbing"
      time=${$signal(() => previewTime())}
    ></media-thumbnail>
  `;
}
function Poster() {
  const { poster } = useMediaContext().$state;
  return x`<div class="plyr__poster" style=${$signal(() => `background-image: url("${poster()}");`)}></div>`;
}
function AudioControls() {
  const ignore = /* @__PURE__ */ new Set([
    "captions",
    "pip",
    "airplay",
    "fullscreen"
  ]), { controls } = usePlyrLayoutContext();
  return x`<div class="plyr__controls">${$signal(() => controls().filter((type) => !ignore.has(type)).map(Control))}</div>`;
}
function VideoControls() {
  const { controls } = usePlyrLayoutContext();
  return x`<div class="plyr__controls">${$signal(() => controls().map(Control))}</div>`;
}
function Control(type) {
  switch (type) {
    case "airplay":
      return AirPlayButton();
    case "captions":
      return CaptionsButton();
    case "current-time":
      return CurrentTime();
    case "download":
      return DownloadButton();
    case "duration":
      return Duration();
    case "fast-forward":
      return FastForwardButton();
    case "fullscreen":
      return FullscreenButton();
    case "mute":
    case "volume":
    case "mute+volume":
      return Volume(type);
    case "pip":
      return PIPButton();
    case "play":
      return PlayButton();
    case "progress":
      return TimeSlider();
    case "restart":
      return RestartButton();
    case "rewind":
      return RewindButton();
    case "settings":
      return Settings();
    default:
      return null;
  }
}
function AirPlayButton() {
  const { translations } = usePlyrLayoutContext();
  return x`
    <media-airplay-button class="plyr__controls__item plyr__control" data-plyr="airplay">
      <slot name="airplay-icon"></slot>
      <span class="plyr__tooltip">${$i18n(translations, "AirPlay")}</span>
    </media-airplay-button>
  `;
}
function CaptionsButton() {
  const { translations } = usePlyrLayoutContext();
  return x`
    <media-caption-button
      class="plyr__controls__item plyr__control"
      data-no-label
      data-plyr="captions"
    >
      <slot name="captions-on-icon" data-class="icon--pressed"></slot>
      <slot name="captions-off-icon" data-class="icon--not-pressed"></slot>
      <span class="label--pressed plyr__tooltip">${$i18n(translations, "Disable captions")}</span>
      <span class="label--not-pressed plyr__tooltip">${$i18n(translations, "Enable captions")}</span>
    </media-caption-button>
  `;
}
function FullscreenButton() {
  const { translations } = usePlyrLayoutContext(), $enterText = $i18n(translations, "Enter Fullscreen");
  return x`
    <media-fullscreen-button
      class="plyr__controls__item plyr__control"
      data-no-label
      data-plyr="fullscreen"
    >
      <slot name="enter-fullscreen-icon" data-class="icon--pressed"></slot>
      <slot name="exit-fullscreen-icon" data-class="icon--not-pressed"></slot>
      <span class="label--pressed plyr__tooltip">${$i18n(translations, "Exit Fullscreen")}</span>
      <span class="label--not-pressed plyr__tooltip">${$enterText}</span>
    </media-fullscreen-button>
  `;
}
function MuteButton() {
  const { translations } = usePlyrLayoutContext(), $muteText = $i18n(translations, "Mute");
  return x`
    <media-mute-button class="plyr__control" data-no-label data-plyr="mute">
      <slot name="muted-icon" data-class="icon--pressed"></slot>
      <slot name="volume-icon" data-class="icon--not-pressed"></slot>
      <span class="label--pressed plyr__tooltip">${$i18n(translations, "Unmute")}</span>
      <span class="label--not-pressed plyr__tooltip">${$muteText}</span>
    </media-mute-button>
  `;
}
function PIPButton() {
  const { translations } = usePlyrLayoutContext(), $enterText = $i18n(translations, "Enter PiP");
  return x`
    <media-pip-button class="plyr__controls__item plyr__control" data-no-label data-plyr="pip">
      <slot name="pip-icon"></slot>
      <slot name="enter-pip-icon" data-class="icon--pressed"></slot>
      <slot name="exit-pip-icon" data-class="icon--not-pressed"></slot>
      <span class="label--pressed plyr__tooltip">${$i18n(translations, "Exit PiP")}</span>
      <span class="label--not-pressed plyr__tooltip">${$enterText}</span>
    </media-pip-button>
  `;
}
function PlayButton() {
  const { translations } = usePlyrLayoutContext(), $playText = $i18n(translations, "Play");
  return x`
    <media-play-button class="plyr__controls__item plyr__control" data-no-label data-plyr="play">
      <slot name="pause-icon" data-class="icon--pressed"></slot>
      <slot name="play-icon" data-class="icon--not-pressed"></slot>
      <span class="label--pressed plyr__tooltip">${$i18n(translations, "Pause")}</span>
      <span class="label--not-pressed plyr__tooltip">${$playText}</span>
    </media-play-button>
  `;
}
function RestartButton() {
  const { translations } = usePlyrLayoutContext(), { remote } = useMediaContext(), $restartText = $i18n(translations, "Restart");
  function onPress(event) {
    if (isKeyboardEvent(event) && !isKeyboardClick(event)) return;
    remote.seek(0, event);
  }
  return x`
    <button
      type="button"
      class="plyr__control"
      data-plyr="restart"
      @pointerup=${onPress}
      @keydown=${onPress}
    >
      <slot name="restart-icon"></slot>
      <span class="plyr__tooltip">${$restartText}</span>
    </button>
  `;
}
function RewindButton() {
  const { translations, seekTime } = usePlyrLayoutContext(), $label = $signal(() => `${i18n(translations, "Rewind")} ${seekTime()}s`);
  return x`
    <media-seek-button
      class="plyr__controls__item plyr__control"
      seconds=${$signal(() => -1 * seekTime())}
      data-no-label
      data-plyr="rewind"
    >
      <slot name="rewind-icon"></slot>
      <span class="plyr__tooltip">${$label}</span>
    </media-seek-button>
  `;
}
function FastForwardButton() {
  const { translations, seekTime } = usePlyrLayoutContext(), $label = $signal(() => `${i18n(translations, "Forward")} ${seekTime()}s`);
  return x`
    <media-seek-button
      class="plyr__controls__item plyr__control"
      seconds=${$signal(seekTime)}
      data-no-label
      data-plyr="fast-forward"
    >
      <slot name="fast-forward-icon"></slot>
      <span class="plyr__tooltip">${$label}</span>
    </media-seek-button>
  `;
}
function TimeSlider() {
  let { duration, viewType } = useMediaContext().$state, { translations, markers, thumbnails, seekTime, previewTime } = usePlyrLayoutContext(), $seekText = $i18n(translations, "Seek"), activeMarker = signal(null), $markerLabel = $signal(() => {
    const marker = activeMarker();
    return marker ? x`<span class="plyr__progress__marker-label">${o(marker.label)}<br /></span>` : null;
  });
  function onSeekingRequest(event) {
    previewTime.set(event.detail);
  }
  function onMarkerEnter() {
    activeMarker.set(this);
  }
  function onMarkerLeave() {
    activeMarker.set(null);
  }
  function Preview() {
    const src = thumbnails(), $noClamp = $signal(() => viewType() === "audio");
    return !src ? x`
          <span class="plyr__tooltip">
            ${$markerLabel}
            <media-slider-value></media-slider-value>
          </span>
        ` : x`
          <media-slider-preview class="plyr__slider__preview" ?no-clamp=${$noClamp}>
            <media-slider-thumbnail .src=${src} class="plyr__slider__preview__thumbnail">
              <span class="plyr__slider__preview__time-container">
                ${$markerLabel}
                <media-slider-value class="plyr__slider__preview__time"></media-slider-value>
              </span>
            </media-slider-thumbnail>
          </media-slider-preview>
        `;
  }
  function Markers() {
    const endTime = duration();
    if (!Number.isFinite(endTime)) return null;
    return markers()?.map((marker) => x`
        <span
          class="plyr__progress__marker"
          @mouseenter=${onMarkerEnter.bind(marker)}
          @mouseleave=${onMarkerLeave}
          style=${`left: ${marker.time / endTime * 100}%;`}
        ></span>
      `);
  }
  return x`
    <div class="plyr__controls__item plyr__progress__container">
      <div class="plyr__progress">
        <media-time-slider
          class="plyr__slider"
          data-plyr="seek"
          pause-while-dragging
          key-step=${$signal(seekTime)}
          aria-label=${$seekText}
          @media-seeking-request=${onSeekingRequest}
        >
          <div class="plyr__slider__track"></div>
          <div class="plyr__slider__thumb"></div>
          <div class="plyr__slider__buffer"></div>
          ${$signal(Preview)}${$signal(Markers)}
        </media-time-slider>
      </div>
    </div>
  `;
}
function Volume(type) {
  return $signal(() => {
    const hasMuteButton = type === "mute" || type === "mute+volume", hasVolumeSlider = type === "volume" || type === "mute+volume";
    return x`
      <div class="plyr__controls__item plyr__volume">
        ${[hasMuteButton ? MuteButton() : null, hasVolumeSlider ? VolumeSlider() : null]}
      </div>
    `;
  });
}
function VolumeSlider() {
  const { translations } = usePlyrLayoutContext();
  return x`
    <media-volume-slider class="plyr__slider" data-plyr="volume" aria-label=${$i18n(translations, "Volume")}>
      <div class="plyr__slider__track"></div>
      <div class="plyr__slider__thumb"></div>
    </media-volume-slider>
  `;
}
function CurrentTime() {
  const media = useMediaContext(), { translations, invertTime, toggleTime, displayDuration } = usePlyrLayoutContext(), invert = signal(peek(invertTime));
  function onPress(event) {
    if (!toggleTime() || displayDuration() || isKeyboardEvent(event) && !isKeyboardClick(event)) return;
    invert.set((n) => !n);
  }
  function MaybeDuration() {
    return $signal(() => displayDuration() ? Duration() : null);
  }
  return $signal(() => {
    const { streamType } = media.$state, $liveText = $i18n(translations, "LIVE"), $currentTimeText = $i18n(translations, "Current time"), $remainder = $signal(() => !displayDuration() && invert());
    return streamType() === "live" || streamType() === "ll-live" ? x`
          <media-live-button
            class="plyr__controls__item plyr__control plyr__live-button"
            data-plyr="live"
          >
            <span class="plyr__live-button__text">${$liveText}</span>
          </media-live-button>
        ` : x`
          <media-time
            type="current"
            class="plyr__controls__item plyr__time plyr__time--current"
            tabindex="0"
            role="timer"
            aria-label=${$currentTimeText}
            ?remainder=${$remainder}
            @pointerup=${onPress}
            @keydown=${onPress}
          ></media-time>
          ${MaybeDuration()}
        `;
  });
}
function Duration() {
  const { translations } = usePlyrLayoutContext();
  return x`
    <media-time
      type="duration"
      class="plyr__controls__item plyr__time plyr__time--duration"
      role="timer"
      tabindex="0"
      aria-label=${$i18n(translations, "Duration")}
    ></media-time>
  `;
}
function DownloadButton() {
  return $signal(() => {
    const media = useMediaContext(), { translations, download } = usePlyrLayoutContext(), { title, source } = media.$state, $src = source(), $download = download(), file = getDownloadFile({
      title: title(),
      src: $src,
      download: $download
    }), $downloadText = $i18n(translations, "Download");
    return isString(file?.url) ? x`
          <a
            class="plyr__controls__item plyr__control"
            href=${appendParamsToURL(file.url, { download: file.name })}
            download=${file.name}
            target="_blank"
          >
            <slot name="download-icon" />
            <span class="plyr__tooltip">${$downloadText}</span>
          </a>
        ` : null;
  });
}
function Gestures() {
  return $signal(() => {
    const { clickToPlay, clickToFullscreen } = usePlyrLayoutContext();
    return [clickToPlay() ? x`
            <media-gesture
              class="plyr__gesture"
              event="pointerup"
              action="toggle:paused"
            ></media-gesture>
          ` : null, clickToFullscreen() ? x`
            <media-gesture
              class="plyr__gesture"
              event="dblpointerup"
              action="toggle:fullscreen"
            ></media-gesture>
          ` : null];
  });
}
function Captions() {
  const media = useMediaContext(), activeCue = signal(void 0), $cueText = $signal(() => o(activeCue()?.text));
  effect(() => {
    const track = media.$state.textTrack();
    if (!track) return;
    function onCueChange() {
      activeCue.set(track?.activeCues[0]);
    }
    onCueChange();
    return listenEvent(track, "cue-change", onCueChange);
  });
  return x`
    <div class="plyr__captions" dir="auto">
      <span class="plyr__caption">${$cueText}</span>
    </div>
  `;
}
function Settings() {
  const { translations } = usePlyrLayoutContext();
  return x`
    <div class="plyr__controls__item plyr__menu">
      <media-menu>
        <media-menu-button class="plyr__control" data-plyr="settings">
          <slot name="settings-icon" />
          <span class="plyr__tooltip">${$i18n(translations, "Settings")}</span>
        </media-menu-button>
        <media-menu-items class="plyr__menu__container" placement="top end">
          <div><div>${[
    AudioMenu(),
    CaptionsMenu(),
    QualityMenu(),
    SpeedMenu()
  ]}</div></div>
        </media-menu-items>
      </media-menu>
    </div>
  `;
}
function Menu({ label, children }) {
  const open = signal(false), onOpen = () => open.set(true), onClose = () => open.set(false);
  return x`
    <media-menu @open=${onOpen} @close=${onClose}>
      ${MenuButton({
    label,
    open
  })}
      <media-menu-items>${children}</media-menu-items>
    </media-menu>
  `;
}
function MenuButton({ open, label }) {
  const { translations } = usePlyrLayoutContext(), $class = $signal(() => `plyr__control plyr__control--${open() ? "back" : "forward"}`);
  function GoBackText() {
    const $text = $i18n(translations, "Go back to previous menu");
    return $signal(() => open() ? x`<span class="plyr__sr-only">${$text}</span>` : null);
  }
  return x`
    <media-menu-button class=${$class} data-plyr="settings">
      <span class="plyr__menu__label" aria-hidden=${$aria(open)}>
        ${$i18n(translations, label)}
      </span>
      <span class="plyr__menu__value" data-part="hint"></span>
      ${GoBackText()}
    </media-menu-button>
  `;
}
function AudioMenu() {
  return Menu({
    label: "Audio",
    children: AudioRadioGroup()
  });
}
function AudioRadioGroup() {
  const { translations } = usePlyrLayoutContext();
  return x`
    <media-audio-radio-group empty-label=${$i18n(translations, "Default")}>
      <template>
        <media-radio class="plyr__control" data-plyr="audio">
          <span data-part="label"></span>
        </media-radio>
      </template>
    </media-audio-radio-group>
  `;
}
function SpeedMenu() {
  return Menu({
    label: "Speed",
    children: SpeedRadioGroup()
  });
}
function SpeedRadioGroup() {
  const { translations, speed } = usePlyrLayoutContext();
  return x`
    <media-speed-radio-group .rates=${speed} normal-label=${$i18n(translations, "Normal")}>
      <template>
        <media-radio class="plyr__control" data-plyr="speed">
          <span data-part="label"></span>
        </media-radio>
      </template>
    </media-speed-radio-group>
  `;
}
function CaptionsMenu() {
  return Menu({
    label: "Captions",
    children: CaptionsRadioGroup()
  });
}
function CaptionsRadioGroup() {
  const { translations } = usePlyrLayoutContext();
  return x`
    <media-captions-radio-group off-label=${$i18n(translations, "Disabled")}>
      <template>
        <media-radio class="plyr__control" data-plyr="captions">
          <span data-part="label"></span>
        </media-radio>
      </template>
    </media-captions-radio-group>
  `;
}
function QualityMenu() {
  return Menu({
    label: "Quality",
    children: QualityRadioGroup()
  });
}
function QualityRadioGroup() {
  const { translations } = usePlyrLayoutContext();
  return x`
    <media-quality-radio-group auto-label=${$i18n(translations, "Auto")}>
      <template>
        <media-radio class="plyr__control" data-plyr="quality">
          <span data-part="label"></span>
        </media-radio>
      </template>
    </media-quality-radio-group>
  `;
}
function $aria(signal2) {
  return $signal(() => signal2() ? "true" : "false");
}
function $i18n(translations, word) {
  return $signal(() => i18n(translations, word));
}
var MediaPlyrLayoutElement = class extends Host(LitElement, PlyrLayout) {
  static tagName = "media-plyr-layout";
  #media;
  onSetup() {
    this.forwardKeepAlive = false;
    this.#media = useMediaContext();
  }
  onConnect() {
    this.#media.player.el?.setAttribute("data-layout", "plyr");
    onDispose(() => this.#media.player.el?.removeAttribute("data-layout"));
    usePlyrLayoutClasses(this, this.#media);
    effect(() => {
      if (this.$props.customIcons()) new SlotManager([this]).connect();
      else new PlyrLayoutIconsLoader([this]).connect();
    });
  }
  render() {
    return $signal(this.#render.bind(this));
  }
  #render() {
    const { viewType } = this.#media.$state;
    return viewType() === "audio" ? PlyrAudioLayout() : viewType() === "video" ? PlyrVideoLayout() : null;
  }
};

// node_modules/vidstack/prod/define/plyr-layout.js
defineCustomElement(MediaPlyrLayoutElement);
defineCustomElement(MediaPosterElement);
defineCustomElement(MediaPlayButtonElement);
defineCustomElement(MediaMuteButtonElement);
defineCustomElement(MediaCaptionButtonElement);
defineCustomElement(MediaPIPButtonElement);
defineCustomElement(MediaFullscreenButtonElement);
defineCustomElement(MediaSeekButtonElement);
defineCustomElement(MediaAirPlayButtonElement);
defineCustomElement(MediaLiveButtonElement);
defineCustomElement(MediaVolumeSliderElement);
defineCustomElement(MediaTimeSliderElement);
defineCustomElement(MediaSliderPreviewElement);
defineCustomElement(MediaSliderThumbnailElement);
defineCustomElement(MediaSliderValueElement);
defineCustomElement(MediaMenuElement);
defineCustomElement(MediaMenuButtonElement);
defineCustomElement(MediaMenuItemsElement);
defineCustomElement(MediaMenuItemElement);
defineCustomElement(MediaAudioRadioGroupElement);
defineCustomElement(MediaCaptionsRadioGroupElement);
defineCustomElement(MediaSpeedRadioGroupElement);
defineCustomElement(MediaQualityRadioGroupElement);
defineCustomElement(MediaRadioElement);
defineCustomElement(MediaTimeElement);
defineCustomElement(MediaThumbnailElement);
