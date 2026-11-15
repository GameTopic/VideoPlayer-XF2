import {
  createContext,
  useContext
} from "./chunk-UMQWA6KQ.min.js";

// node_modules/vidstack/prod/chunks/vidstack-CYE89tBD.js
var mediaContext = createContext();
function useMediaContext() {
  return useContext(mediaContext);
}
function useMediaState() {
  return useMediaContext().$state;
}

export {
  mediaContext,
  useMediaContext,
  useMediaState
};
