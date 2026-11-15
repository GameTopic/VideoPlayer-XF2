import {
  Poster
} from "./chunk-TPDK2HQG.min.js";
import {
  Host,
  effect,
  setAttribute
} from "./chunk-UMQWA6KQ.min.js";
import {
  __exportAll
} from "./chunk-3VL6JVTN.min.js";

// node_modules/vidstack/prod/chunks/vidstack-CpxQ0R9F.js
var poster_element_exports = /* @__PURE__ */ __exportAll({ MediaPosterElement: () => MediaPosterElement });
var MediaPosterElement = class extends Host(HTMLElement, Poster) {
  static tagName = "media-poster";
  static attrs = { crossOrigin: "crossorigin" };
  #img = document.createElement("img");
  onSetup() {
    this.$state.img.set(this.#img);
  }
  onConnect() {
    const { src, alt, crossOrigin } = this.$state;
    effect(() => {
      const { loading, hidden } = this.$state;
      this.#img.style.display = loading() || hidden() ? "none" : "";
    });
    effect(() => {
      setAttribute(this.#img, "alt", alt());
      setAttribute(this.#img, "crossorigin", crossOrigin());
      setAttribute(this.#img, "src", src());
    });
    if (this.#img.parentNode !== this) this.prepend(this.#img);
  }
};

export {
  poster_element_exports,
  MediaPosterElement
};
