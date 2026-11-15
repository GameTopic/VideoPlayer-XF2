import {
  isAudioSrc,
  isVideoSrc
} from "./chunk-4MKIV6VZ.min.js";
import {
  deferredPromise,
  isBoolean,
  isNull,
  isString
} from "./chunk-UMQWA6KQ.min.js";

// node_modules/vidstack/prod/chunks/vidstack-DmKKlMSK.js
function appendParamsToURL(baseUrl, params) {
  const url = new URL(baseUrl);
  for (const key of Object.keys(params)) url.searchParams.set(key, params[key] + "");
  return url.toString();
}
function preconnect(url, rel = "preconnect") {
  if (!isNull(document.querySelector(`link[href="${url}"]`))) return true;
  const link = document.createElement("link");
  link.rel = rel;
  link.href = url;
  link.crossOrigin = "true";
  document.head.append(link);
  return true;
}
var pendingRequests = {};
function loadScript(src) {
  if (pendingRequests[src]) return pendingRequests[src].promise;
  const promise = deferredPromise();
  if (!isNull(document.querySelector(`script[src="${src}"]`))) {
    promise.resolve();
    return promise.promise;
  }
  pendingRequests[src] = promise;
  const script = document.createElement("script");
  script.src = src;
  script.onload = () => {
    promise.resolve();
    delete pendingRequests[src];
  };
  script.onerror = () => {
    promise.reject();
    delete pendingRequests[src];
  };
  setTimeout(() => document.head.append(script), 0);
  return promise.promise;
}
function getRequestCredentials(crossOrigin) {
  return crossOrigin === "use-credentials" ? "include" : isString(crossOrigin) ? "same-origin" : void 0;
}
function getDownloadFile({ title, src, download }) {
  const url = isBoolean(download) || download === "" ? src.src : isString(download) ? download : download?.url;
  if (!isValidFileDownload({
    url,
    src,
    download
  })) return null;
  return {
    url,
    name: !isBoolean(download) && !isString(download) && download?.filename || title.toLowerCase() || "media"
  };
}
function isValidFileDownload({ url, src, download }) {
  return isString(url) && (download && download !== true || isAudioSrc(src) || isVideoSrc(src));
}

export {
  appendParamsToURL,
  preconnect,
  loadScript,
  getRequestCredentials,
  getDownloadFile
};
