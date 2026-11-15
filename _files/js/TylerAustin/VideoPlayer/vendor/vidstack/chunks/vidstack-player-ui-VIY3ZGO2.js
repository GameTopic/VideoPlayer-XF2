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
  MediaVolumeSliderElement,
  renderMenuItemsTemplate
} from "./chunk-JZPJZXYN.min.js";
import {
  LitElement,
  x
} from "./chunk-SLLBIDAD.min.js";
import {
  MediaPosterElement
} from "./chunk-KZ7QCNUH.min.js";
import {
  AudioGainRadioGroup,
  AudioGainSlider,
  Captions,
  ChaptersRadioGroup,
  Controls,
  ControlsGroup,
  Gesture,
  GoogleCastButton,
  MediaAnnouncer,
  QualitySlider,
  RadioGroup,
  SliderChapters,
  SliderVideo,
  SpeedSlider,
  ToggleButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "./chunk-HHTCPEV7.min.js";
import {
  MenuPortal,
  Slider,
  sliderState
} from "./chunk-NOQLW2UX.min.js";
import {
  cloneTemplate,
  cloneTemplateContent,
  createTemplate,
  isHTMLElement,
  requestScopedAnimationFrame
} from "./chunk-ZXMGYZS7.min.js";
import "./chunk-TPDK2HQG.min.js";
import {
  useMediaContext
} from "./chunk-6ATT5ISY.min.js";
import "./chunk-75VQWXMD.min.js";
import "./chunk-4C7PIW7M.min.js";
import "./chunk-QKSJYQLF.min.js";
import {
  watchCueTextChange
} from "./chunk-OPFURCQW.min.js";
import "./chunk-3B4S3VWV.min.js";
import "./chunk-4MKIV6VZ.min.js";
import {
  Component,
  Host,
  computed,
  defineCustomElement,
  effect,
  isBoolean,
  isString,
  setAttribute,
  signal,
  useState
} from "./chunk-UMQWA6KQ.min.js";
import "./chunk-3VL6JVTN.min.js";

// node_modules/vidstack/prod/chunks/vidstack-CYCXRhiV.js
var MediaCaptionsElement = class extends Host(HTMLElement, Captions) {
  static tagName = "media-captions";
};
var MediaGestureElement = class extends Host(HTMLElement, Gesture) {
  static tagName = "media-gesture";
};
var MediaAnnouncerElement = class extends Host(HTMLElement, MediaAnnouncer) {
  static tagName = "media-announcer";
};
var MediaControlsElement = class extends Host(HTMLElement, Controls) {
  static tagName = "media-controls";
};
var MediaControlsGroupElement = class extends Host(HTMLElement, ControlsGroup) {
  static tagName = "media-controls-group";
};
var Title = class extends Component {
};
var MediaTitleElement = class extends Host(HTMLElement, Title) {
  static tagName = "media-title";
  #media;
  onSetup() {
    this.#media = useMediaContext();
  }
  onConnect() {
    effect(this.#watchTitle.bind(this));
  }
  #watchTitle() {
    const { title } = this.#media.$state;
    this.textContent = title();
  }
};
var ChapterTitle = class extends Component {
  static props = { defaultText: "" };
};
var MediaChapterTitleElement = class extends Host(HTMLElement, ChapterTitle) {
  static tagName = "media-chapter-title";
  #media;
  #chapterTitle;
  onSetup() {
    this.#media = useMediaContext();
    this.#chapterTitle = signal("");
  }
  onConnect() {
    const tracks = this.#media.textTracks;
    watchCueTextChange(tracks, "chapters", this.#chapterTitle.set);
    effect(this.#watchChapterTitle.bind(this));
  }
  #watchChapterTitle() {
    const { defaultText } = this.$props;
    this.textContent = this.#chapterTitle() || defaultText();
  }
};
var Spinner = class extends Component {
  static props = {
    size: 96,
    trackWidth: 8,
    fillPercent: 50
  };
  onConnect(el) {
    requestScopedAnimationFrame(() => {
      if (!this.connectScope) return;
      const root = el.querySelector("svg"), track = root.firstElementChild, trackFill = track.nextElementSibling;
      effect(this.#update.bind(this, root, track, trackFill));
    });
  }
  #update(root, track, trackFill) {
    const { size, trackWidth, fillPercent } = this.$props;
    setAttribute(root, "width", size());
    setAttribute(root, "height", size());
    setAttribute(track, "stroke-width", trackWidth());
    setAttribute(trackFill, "stroke-width", trackWidth());
    setAttribute(trackFill, "stroke-dashoffset", 100 - fillPercent());
  }
};
var MediaSpinnerElement = class extends Host(LitElement, Spinner) {
  static tagName = "media-spinner";
  render() {
    return x`
      <svg fill="none" viewBox="0 0 120 120" aria-hidden="true" data-part="root">
        <circle cx="60" cy="60" r="54" stroke="currentColor" data-part="track"></circle>
        <circle
          cx="60"
          cy="60"
          r="54"
          stroke="currentColor"
          pathLength="100"
          stroke-dasharray="100"
          data-part="track-fill"
        ></circle>
      </svg>
    `;
  }
};
var MediaLayout = class extends Component {
  static props = { when: false };
};
var MediaLayoutElement = class extends Host(HTMLElement, MediaLayout) {
  static tagName = "media-layout";
  #media;
  onSetup() {
    this.#media = useMediaContext();
  }
  onConnect() {
    effect(this.#watchWhen.bind(this));
  }
  #watchWhen() {
    const root = this.firstElementChild, isTemplate = root?.localName === "template", when = this.$props.when();
    if (!(isBoolean(when) ? when : computed(() => when(this.#media.player.state))())) {
      if (isTemplate) {
        this.textContent = "";
        this.appendChild(root);
      } else if (isHTMLElement(root)) root.style.display = "none";
      return;
    }
    if (isTemplate) this.append(root.content.cloneNode(true));
    else if (isHTMLElement(root)) root.style.display = "";
  }
};
var MediaGoogleCastButtonElement = class extends Host(HTMLElement, GoogleCastButton) {
  static tagName = "media-google-cast-button";
};
var MediaToggleButtonElement = class extends Host(HTMLElement, ToggleButton) {
  static tagName = "media-toggle-button";
};
var MediaTooltipElement = class extends Host(HTMLElement, Tooltip) {
  static tagName = "media-tooltip";
};
var MediaTooltipTriggerElement = class extends Host(HTMLElement, TooltipTrigger) {
  static tagName = "media-tooltip-trigger";
  onConnect() {
    this.style.display = "contents";
  }
};
var MediaTooltipContentElement = class extends Host(HTMLElement, TooltipContent) {
  static tagName = "media-tooltip-content";
};
var MediaMenuPortalElement = class extends Host(HTMLElement, MenuPortal) {
  static tagName = "media-menu-portal";
  static attrs = { disabled: { converter(value) {
    if (isString(value)) return value;
    return value !== null;
  } } };
};
var MediaChaptersRadioGroupElement = class extends Host(HTMLElement, ChaptersRadioGroup) {
  static tagName = "media-chapters-radio-group";
  onConnect() {
    renderMenuItemsTemplate(this, (el, option) => {
      const { cue, startTime, duration } = option, thumbnailEl = el.querySelector(".vds-thumbnail,media-thumbnail"), startEl = el.querySelector('[data-part="start-time"]'), durationEl = el.querySelector('[data-part="duration"]');
      if (startEl) startEl.textContent = startTime;
      if (durationEl) durationEl.textContent = duration;
      if (thumbnailEl) {
        thumbnailEl.setAttribute("time", cue.startTime + "");
        effect(() => {
          const thumbnails = this.$props.thumbnails();
          if ("src" in thumbnailEl) thumbnailEl.src = thumbnails;
          else if (isString(thumbnails)) thumbnailEl.setAttribute("src", thumbnails);
        });
      }
    });
  }
};
var MediaAudioGainRadioGroupElement = class extends Host(HTMLElement, AudioGainRadioGroup) {
  static tagName = "media-audio-gain-radio-group";
  onConnect() {
    renderMenuItemsTemplate(this);
  }
};
var MediaRadioGroupElement = class extends Host(HTMLElement, RadioGroup) {
  static tagName = "media-radio-group";
};
var MediaSliderElement = class extends Host(HTMLElement, Slider) {
  static tagName = "media-slider";
};
var videoTemplate = /* @__PURE__ */ createTemplate(`<video muted playsinline preload="none" style="max-width: unset;"></video>`);
var MediaSliderVideoElement = class extends Host(HTMLElement, SliderVideo) {
  static tagName = "media-slider-video";
  #media;
  #video = this.#createVideo();
  onSetup() {
    this.#media = useMediaContext();
    this.$state.video.set(this.#video);
  }
  onConnect() {
    const { canLoad } = this.#media.$state, { src, crossOrigin } = this.$state;
    if (this.#video.parentNode !== this) this.prepend(this.#video);
    effect(() => {
      setAttribute(this.#video, "crossorigin", crossOrigin());
      setAttribute(this.#video, "preload", canLoad() ? "auto" : "none");
      setAttribute(this.#video, "src", src());
    });
  }
  #createVideo() {
    return cloneTemplateContent(videoTemplate);
  }
};
var MediaAudioGainSliderElement = class extends Host(HTMLElement, AudioGainSlider) {
  static tagName = "media-audio-gain-slider";
};
var MediaSpeedSliderElement = class extends Host(HTMLElement, SpeedSlider) {
  static tagName = "media-speed-slider";
};
var MediaQualitySliderElement = class extends Host(HTMLElement, QualitySlider) {
  static tagName = "media-quality-slider";
};
var MediaSliderChaptersElement = class extends Host(HTMLElement, SliderChapters) {
  static tagName = "media-slider-chapters";
  #template = null;
  onConnect() {
    requestScopedAnimationFrame(() => {
      if (!this.connectScope) return;
      const template = this.querySelector("template");
      if (template) {
        this.#template = template;
        effect(this.#renderTemplate.bind(this));
      }
    });
  }
  #renderTemplate() {
    if (!this.#template) return;
    const elements = cloneTemplate(this.#template, this.cues.length || 1);
    this.setRefs(elements);
  }
};
var SliderSteps = class extends Component {
};
var MediaSliderStepsElement = class extends Host(HTMLElement, SliderSteps) {
  static tagName = "media-slider-steps";
  #template = null;
  onConnect(el) {
    requestScopedAnimationFrame(() => {
      if (!this.connectScope) return;
      this.#template = el.querySelector("template");
      if (this.#template) effect(this.#render.bind(this));
    });
  }
  #render() {
    if (!this.#template) return;
    const { min, max, step } = useState(sliderState), steps = (max() - min()) / step();
    cloneTemplate(this.#template, Math.floor(steps) + 1);
  }
};

// node_modules/vidstack/prod/define/vidstack-player-ui.js
defineCustomElement(MediaLayoutElement);
defineCustomElement(MediaControlsElement);
defineCustomElement(MediaControlsGroupElement);
defineCustomElement(MediaPosterElement);
defineCustomElement(MediaAnnouncerElement);
defineCustomElement(MediaTooltipElement);
defineCustomElement(MediaTooltipTriggerElement);
defineCustomElement(MediaTooltipContentElement);
defineCustomElement(MediaPlayButtonElement);
defineCustomElement(MediaMuteButtonElement);
defineCustomElement(MediaCaptionButtonElement);
defineCustomElement(MediaFullscreenButtonElement);
defineCustomElement(MediaPIPButtonElement);
defineCustomElement(MediaSeekButtonElement);
defineCustomElement(MediaAirPlayButtonElement);
defineCustomElement(MediaGoogleCastButtonElement);
defineCustomElement(MediaToggleButtonElement);
defineCustomElement(MediaSliderElement);
defineCustomElement(MediaAudioGainSliderElement);
defineCustomElement(MediaVolumeSliderElement);
defineCustomElement(MediaTimeSliderElement);
defineCustomElement(MediaSpeedSliderElement);
defineCustomElement(MediaQualitySliderElement);
defineCustomElement(MediaSliderChaptersElement);
defineCustomElement(MediaSliderStepsElement);
defineCustomElement(MediaSliderPreviewElement);
defineCustomElement(MediaSliderValueElement);
defineCustomElement(MediaSliderThumbnailElement);
defineCustomElement(MediaSliderVideoElement);
defineCustomElement(MediaMenuElement);
defineCustomElement(MediaMenuButtonElement);
defineCustomElement(MediaMenuPortalElement);
defineCustomElement(MediaMenuItemsElement);
defineCustomElement(MediaMenuItemElement);
defineCustomElement(MediaAudioRadioGroupElement);
defineCustomElement(MediaCaptionsRadioGroupElement);
defineCustomElement(MediaSpeedRadioGroupElement);
defineCustomElement(MediaAudioGainRadioGroupElement);
defineCustomElement(MediaQualityRadioGroupElement);
defineCustomElement(MediaChaptersRadioGroupElement);
defineCustomElement(MediaRadioGroupElement);
defineCustomElement(MediaRadioElement);
defineCustomElement(MediaGestureElement);
defineCustomElement(MediaThumbnailElement);
defineCustomElement(MediaCaptionsElement);
defineCustomElement(MediaLiveButtonElement);
defineCustomElement(MediaTimeElement);
defineCustomElement(MediaTitleElement);
defineCustomElement(MediaChapterTitleElement);
defineCustomElement(MediaSpinnerElement);
