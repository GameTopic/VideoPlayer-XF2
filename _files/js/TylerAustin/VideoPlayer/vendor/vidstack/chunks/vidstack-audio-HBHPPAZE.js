import {
  HTMLAirPlayAdapter,
  HTMLMediaProvider
} from "./chunk-FUPFGJXT.min.js";
import "./chunk-4C7PIW7M.min.js";
import "./chunk-ZW4R63AC.min.js";
import "./chunk-4MKIV6VZ.min.js";
import {
  scoped
} from "./chunk-UMQWA6KQ.min.js";

// node_modules/vidstack/prod/providers/vidstack-audio.js
var AudioProvider = class extends HTMLMediaProvider {
  $$PROVIDER_TYPE = "AUDIO";
  get type() {
    return "audio";
  }
  airPlay;
  constructor(audio, ctx) {
    super(audio, ctx);
    scoped(() => {
      this.airPlay = new HTMLAirPlayAdapter(this.media, ctx);
    }, this.scope);
  }
  setup() {
    super.setup();
    if (this.type === "audio") this.ctx.notify("provider-setup", this);
  }
  /**
  * The native HTML `<audio>` element.
  *
  * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement}
  */
  get audio() {
    return this.media;
  }
};
export {
  AudioProvider
};
