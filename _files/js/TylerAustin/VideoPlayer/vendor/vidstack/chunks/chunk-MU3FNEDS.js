import {
  listenEvent
} from "./chunk-UMQWA6KQ.min.js";

// node_modules/vidstack/prod/chunks/vidstack-DATGlkSz2.js
function getCastFrameworkURL() {
  return "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
}
function hasLoadedCastFramework() {
  return !!window.cast?.framework;
}
function isCastAvailable() {
  return !!window.chrome?.cast?.isAvailable;
}
function isCastConnected() {
  return getCastContext().getCastState() === cast.framework.CastState.CONNECTED;
}
function getCastContext() {
  return window.cast.framework.CastContext.getInstance();
}
function getCastSession() {
  return getCastContext().getCurrentSession();
}
function getCastSessionMedia() {
  return getCastSession()?.getSessionObj().media[0];
}
function hasActiveCastSession(src) {
  return getCastSessionMedia()?.media.contentId === src?.src;
}
function getDefaultCastOptions() {
  return {
    language: "en-US",
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    resumeSavedSession: true,
    androidReceiverCompatible: true
  };
}
function getCastErrorMessage(code) {
  return `Google Cast Error Code: ${code}`;
}
function listenCastContextEvent(type, handler) {
  return listenEvent(getCastContext(), type, handler);
}

export {
  getCastFrameworkURL,
  hasLoadedCastFramework,
  isCastAvailable,
  isCastConnected,
  getCastContext,
  getCastSession,
  getCastSessionMedia,
  hasActiveCastSession,
  getDefaultCastOptions,
  getCastErrorMessage,
  listenCastContextEvent
};
