import {
  HlsJsAdapter
} from "./chunk-LYTCFE3R.min.js";
import {
  MediaAttachMixin,
  safeDefine
} from "./chunk-5ZXZHYQF.min.js";
import {
  CustomMediaElement
} from "./chunk-6EU4S5JI.min.js";

// node_modules/@videojs/html/dist/default/media/hlsjs-video/adapter.js
var HlsJsVideo = class extends MediaAttachMixin(CustomMediaElement("video", HlsJsAdapter)) {
};

// node_modules/@videojs/html/dist/default/define/media/hlsjs-video.js
var HlsJsVideoElement = class extends HlsJsVideo {
  static {
    this.tagName = "hlsjs-video";
  }
};
safeDefine(HlsJsVideoElement);
export {
  HlsJsVideoElement
};
