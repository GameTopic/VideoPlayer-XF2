import {
  isNumber,
  isUndefined
} from "./chunk-UMQWA6KQ.min.js";

// node_modules/vidstack/prod/chunks/vidstack-ijoHbXQB.js
var ListSymbol = {
  add: Symbol(0),
  remove: Symbol(0),
  reset: Symbol(0),
  select: Symbol(0),
  readonly: Symbol(0),
  setReadonly: Symbol(0),
  onReset: Symbol(0),
  onRemove: Symbol(0),
  onUserSelect: Symbol(0)
};
var RAFLoop = class {
  #id;
  #callback;
  constructor(callback) {
    this.#callback = callback;
  }
  start() {
    if (!isUndefined(this.#id)) return;
    this.#loop();
  }
  stop() {
    if (isNumber(this.#id)) window.cancelAnimationFrame(this.#id);
    this.#id = void 0;
  }
  #loop() {
    this.#id = window.requestAnimationFrame(() => {
      if (isUndefined(this.#id)) return;
      this.#callback();
      this.#loop();
    });
  }
};

export {
  ListSymbol,
  RAFLoop
};
