import {
  AirPlayButton,
  AudioRadioGroup,
  CaptionButton,
  CaptionsRadioGroup,
  FullscreenButton,
  LiveButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MuteButton,
  PIPButton,
  PlayButton,
  QualityRadioGroup,
  Radio,
  SeekButton,
  Slider,
  SliderPreview,
  SliderValue,
  SpeedRadioGroup,
  Thumbnail,
  Time,
  TimeSlider,
  VolumeSlider
} from "./chunk-NOQLW2UX.min.js";
import {
  cloneTemplate,
  cloneTemplateContent,
  createTemplate,
  requestScopedAnimationFrame
} from "./chunk-ZXMGYZS7.min.js";
import {
  useMediaContext
} from "./chunk-6ATT5ISY.min.js";
import {
  BOOLEAN,
  Host,
  effect,
  isString,
  setAttribute,
  useState
} from "./chunk-UMQWA6KQ.min.js";

// node_modules/vidstack/prod/chunks/vidstack-CPFrGAIO.js
var imgTemplate = /* @__PURE__ */ createTemplate('<img loading="eager" decoding="async" aria-hidden="true">');
var MediaThumbnailElement = class extends Host(HTMLElement, Thumbnail) {
  static tagName = "media-thumbnail";
  static attrs = { crossOrigin: "crossorigin" };
  #media;
  #img = this.#createImg();
  onSetup() {
    this.#media = useMediaContext();
    this.$state.img.set(this.#img);
  }
  onConnect() {
    const { src, crossOrigin } = this.$state;
    if (this.#img.parentNode !== this) this.prepend(this.#img);
    effect(() => {
      setAttribute(this.#img, "src", src());
      setAttribute(this.#img, "crossorigin", crossOrigin());
    });
  }
  #createImg() {
    return cloneTemplateContent(imgTemplate);
  }
};
var MediaTimeElement = class extends Host(HTMLElement, Time) {
  static tagName = "media-time";
  onConnect() {
    effect(() => {
      this.textContent = this.$state.timeText();
    });
  }
};
var MediaAirPlayButtonElement = class extends Host(HTMLElement, AirPlayButton) {
  static tagName = "media-airplay-button";
};
var MediaCaptionButtonElement = class extends Host(HTMLElement, CaptionButton) {
  static tagName = "media-caption-button";
};
var MediaFullscreenButtonElement = class extends Host(HTMLElement, FullscreenButton) {
  static tagName = "media-fullscreen-button";
};
var MediaLiveButtonElement = class extends Host(HTMLElement, LiveButton) {
  static tagName = "media-live-button";
};
var MediaMuteButtonElement = class extends Host(HTMLElement, MuteButton) {
  static tagName = "media-mute-button";
};
var MediaPIPButtonElement = class extends Host(HTMLElement, PIPButton) {
  static tagName = "media-pip-button";
};
var MediaPlayButtonElement = class extends Host(HTMLElement, PlayButton) {
  static tagName = "media-play-button";
};
var MediaSeekButtonElement = class extends Host(HTMLElement, SeekButton) {
  static tagName = "media-seek-button";
};
function renderMenuItemsTemplate(el, onCreate) {
  requestScopedAnimationFrame(() => {
    if (!el.connectScope) return;
    const template = el.querySelector("template");
    if (!template) return;
    effect(() => {
      const options = el.getOptions();
      cloneTemplate(template, options.length, (radio, i) => {
        const { label, value } = options[i], labelEl = radio.querySelector(`[data-part="label"]`);
        radio.setAttribute("value", value);
        if (labelEl) if (isString(label)) labelEl.textContent = label;
        else effect(() => {
          labelEl.textContent = label();
        });
        onCreate?.(radio, options[i], i);
      });
    });
  });
}
var MediaAudioRadioGroupElement = class extends Host(HTMLElement, AudioRadioGroup) {
  static tagName = "media-audio-radio-group";
  onConnect() {
    renderMenuItemsTemplate(this);
  }
};
var MediaCaptionsRadioGroupElement = class extends Host(HTMLElement, CaptionsRadioGroup) {
  static tagName = "media-captions-radio-group";
  onConnect() {
    renderMenuItemsTemplate(this);
  }
};
var MediaMenuElement = class extends Host(HTMLElement, Menu) {
  static tagName = "media-menu";
};
var MediaMenuButtonElement = class extends Host(HTMLElement, MenuButton) {
  static tagName = "media-menu-button";
};
var MediaMenuItemElement = class extends Host(HTMLElement, MenuItem) {
  static tagName = "media-menu-item";
};
var MediaMenuItemsElement = class extends Host(HTMLElement, MenuItems) {
  static tagName = "media-menu-items";
};
var MediaSpeedRadioGroupElement = class extends Host(HTMLElement, SpeedRadioGroup) {
  static tagName = "media-speed-radio-group";
  onConnect() {
    renderMenuItemsTemplate(this);
  }
};
var MediaQualityRadioGroupElement = class extends Host(HTMLElement, QualityRadioGroup) {
  static tagName = "media-quality-radio-group";
  onConnect() {
    renderMenuItemsTemplate(this, (el, option) => {
      const bitrate = option.bitrate, bitrateEl = el.querySelector('[data-part="bitrate"]');
      if (bitrate && bitrateEl) effect(() => {
        bitrateEl.textContent = bitrate() || "";
      });
    });
  }
};
var MediaRadioElement = class extends Host(HTMLElement, Radio) {
  static tagName = "media-radio";
};
var MediaSliderThumbnailElement = class extends MediaThumbnailElement {
  static tagName = "media-slider-thumbnail";
  #media;
  #slider;
  onSetup() {
    super.onSetup();
    this.#media = useMediaContext();
    this.#slider = useState(Slider.state);
  }
  onConnect() {
    super.onConnect();
    effect(this.#watchTime.bind(this));
  }
  #watchTime() {
    const { duration, clipStartTime } = this.#media.$state;
    this.time = clipStartTime() + this.#slider.pointerRate() * duration();
  }
};
var MediaSliderValueElement = class extends Host(HTMLElement, SliderValue) {
  static tagName = "media-slider-value";
  static attrs = { padMinutes: { converter: BOOLEAN } };
  onConnect() {
    effect(() => {
      this.textContent = this.getValueText();
    });
  }
};
var MediaTimeSliderElement = class extends Host(HTMLElement, TimeSlider) {
  static tagName = "media-time-slider";
};
var MediaSliderPreviewElement = class extends Host(HTMLElement, SliderPreview) {
  static tagName = "media-slider-preview";
};
var MediaVolumeSliderElement = class extends Host(HTMLElement, VolumeSlider) {
  static tagName = "media-volume-slider";
};

export {
  MediaThumbnailElement,
  MediaTimeElement,
  MediaAirPlayButtonElement,
  MediaCaptionButtonElement,
  MediaFullscreenButtonElement,
  MediaLiveButtonElement,
  MediaMuteButtonElement,
  MediaPIPButtonElement,
  MediaPlayButtonElement,
  MediaSeekButtonElement,
  renderMenuItemsTemplate,
  MediaAudioRadioGroupElement,
  MediaCaptionsRadioGroupElement,
  MediaMenuElement,
  MediaMenuButtonElement,
  MediaMenuItemElement,
  MediaMenuItemsElement,
  MediaSpeedRadioGroupElement,
  MediaQualityRadioGroupElement,
  MediaRadioElement,
  MediaSliderThumbnailElement,
  MediaSliderValueElement,
  MediaTimeSliderElement,
  MediaSliderPreviewElement,
  MediaVolumeSliderElement
};
