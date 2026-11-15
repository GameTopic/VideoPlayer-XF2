import {
  __exportAll
} from "./chunk-3VL6JVTN.min.js";

// tools/youtube-poster.js
async function lookupYouTubePoster(videoId, abort, posterCache2, pendingFetch2, resolveUrl) {
  const signal = abort.signal;
  if (signal.aborted) return "";
  if (posterCache2.has(videoId)) return posterCache2.get(videoId);
  let request = pendingFetch2.get(videoId);
  if (!request) {
    request = { controller: new AbortController(), consumers: 0, promise: null };
    const current = request;
    pendingFetch2.set(videoId, current);
    current.promise = (async () => {
      for (const size of ["maxresdefault", "sddefault", "hqdefault"]) {
        for (const webp of [true, false]) {
          if (current.controller.signal.aborted) return "";
          const url = resolveUrl(videoId, size, webp);
          if (await loadPosterImage(url, current.controller.signal)) {
            if (current.controller.signal.aborted) return "";
            posterCache2.set(videoId, url);
            return url;
          }
        }
      }
      return "";
    })().finally(() => {
      if (pendingFetch2.get(videoId) === current) pendingFetch2.delete(videoId);
    });
  }
  request.consumers++;
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    if (--request.consumers === 0) {
      if (pendingFetch2.get(videoId) === request) pendingFetch2.delete(videoId);
      request.controller.abort();
    }
  };
  let cancel;
  const canceled = new Promise((resolve) => {
    cancel = () => {
      release();
      resolve("");
    };
    signal.addEventListener("abort", cancel, { once: true });
  });
  try {
    return await Promise.race([request.promise, canceled]);
  } finally {
    signal.removeEventListener("abort", cancel);
    release();
  }
}
function loadPosterImage(url, signal) {
  if (signal.aborted) return Promise.resolve(false);
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (loaded) => {
      if (settled) return;
      settled = true;
      image.onload = image.onerror = null;
      signal.removeEventListener("abort", cancel);
      if (!loaded) image.removeAttribute("src");
      resolve(loaded);
    };
    const cancel = () => finish(false);
    image.onload = () => finish(image.naturalWidth > 0);
    image.onerror = () => finish(false);
    signal.addEventListener("abort", cancel, { once: true });
    image.src = url;
  });
}

// node_modules/vidstack/prod/chunks/vidstack-IMa-zkAV.js
var utils_exports = /* @__PURE__ */ __exportAll({
  findYouTubePoster: () => findYouTubePoster,
  resolveYouTubeVideoId: () => resolveYouTubeVideoId
});
var videoIdRE = /(?:youtu\.be|youtube|youtube\.com|youtube-nocookie\.com)(?:\/shorts)?\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|)((?:\w|-){11})/;
var posterCache = /* @__PURE__ */ new Map();
var pendingFetch = /* @__PURE__ */ new Map();
function resolveYouTubeVideoId(src) {
  return src.match(videoIdRE)?.[1];
}
async function findYouTubePoster(videoId, abort) {
  return lookupYouTubePoster(videoId, abort, posterCache, pendingFetch, resolveYouTubePosterURL);
}
function resolveYouTubePosterURL(videoId, size, webp) {
  return `https://i.ytimg.com/${webp ? "vi_webp" : "vi"}/${videoId}/${size}.${webp ? "webp" : "jpg"}`;
}

export {
  utils_exports,
  resolveYouTubeVideoId
};
