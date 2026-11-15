import {
  throttle
} from "./chunks/chunk-VQS5LW55.min.js";
import {
  ContextConsumer,
  containerContext,
  extensionContext,
  i,
  mediaContext,
  n,
  playerContext,
  safeDefine
} from "./chunks/chunk-5ZXZHYQF.min.js";
import {
  DEFAULT_LOCALE,
  MediaError,
  MediaReadyState,
  MediaStreamTypes,
  REGISTERED_MEDIA,
  animationFrame,
  applyShadowStyles,
  applyStyles,
  camelCase,
  cloneTemplateRoot,
  configureCspNonce,
  containsComposed,
  createShadowStyle,
  createTemplate,
  defaults,
  effectiveLocale,
  ensureGlobalStyle,
  findComposedElement,
  findElementChild,
  findNearestLang,
  findTrackElement,
  flatten,
  getAnchorNames,
  getBlockExtent,
  getCaptionOrSubtitleTracks,
  getDeepActiveElement,
  getElementChildren,
  getElementPadding,
  getElementSize,
  getInlineExtent,
  getPositionedSide,
  getRegisteredMedia,
  getTabbableElements,
  getTemplateElement,
  getTemplateRoot,
  getTextDirection,
  getTimeRangeEnd,
  hasMetadata,
  hasTimeRange,
  hideOpenPopovers,
  isBoolean,
  isCaptionOrSubtitleTrack,
  isDefaultLocale,
  isDocument,
  isEditableTarget,
  isFunction,
  isHTMLImageElement,
  isInteractiveActivation,
  isInteractiveTarget,
  isKeptAlive,
  isMacOS,
  isMediaAudioTrackCapable,
  isMediaAutoplayCapable,
  isMediaBufferCapable,
  isMediaContentDataCapable,
  isMediaErrorCapable,
  isMediaLiveCapable,
  isMediaMutedCapable,
  isMediaPauseCapable,
  isMediaPictureInPictureCapable,
  isMediaPlaybackRateCapable,
  isMediaPlaying,
  isMediaRemotePlaybackCapable,
  isMediaSeekCapable,
  isMediaSourceCapable,
  isMediaStreamTypeCapable,
  isMediaTextTrackCapable,
  isMediaVideoDimensionsCapable,
  isMediaVideoRenditionCapable,
  isMediaVolumeCapable,
  isNil,
  isNull,
  isNumber,
  isObject,
  isPointInElement,
  isPromise,
  isQuerySelectorAllCapable,
  isRTL,
  isString,
  isUndefined,
  isWebKitAirPlayCapable,
  kebabCase,
  listen,
  measureElement,
  measureElementChildren,
  mergeLocaleOverlays,
  noop,
  observeElements,
  observeResize,
  onEvent,
  parseYouTubeVideoId,
  pick,
  rafThrottle,
  readCSSLength,
  renderTemplate,
  resolveAdapterType,
  resolveCSSLength,
  resolveLangAttr,
  restoreAttributes,
  restoreInlineStyles,
  serializeTimeRanges,
  shallowEqual,
  snapshotAttributes,
  snapshotInlineStyles,
  subscribeAmbientLang,
  supportsAnchorPositioning,
  supportsPopoverAPI,
  supportsWebKitAirPlay,
  toMediaCrossOrigin,
  tryHidePopover,
  tryShowPopover,
  walkAncestors
} from "./chunks/chunk-6EU4S5JI.min.js";

// node_modules/@videojs/store/dist/default/html/controllers/snapshot-controller.js
var SnapshotController = class {
  #host;
  #selector;
  #state;
  #cached;
  #unsubscribe = noop;
  constructor(host, state, selector) {
    this.#host = host;
    this.#state = state;
    this.#selector = selector;
    host.addController(this);
  }
  get value() {
    if (!this.#selector) return this.#state.current;
    this.#cached ??= this.#selector(this.#state.current);
    return this.#cached;
  }
  /** Switch to tracking a different state container. */
  track(state) {
    this.#state = state;
    this.#subscribe();
  }
  hostConnected() {
    this.#subscribe();
  }
  hostDisconnected() {
    this.#unsubscribe();
    this.#unsubscribe = noop;
    this.#cached = void 0;
  }
  #subscribe() {
    this.#unsubscribe();
    if (!this.#selector) {
      this.#unsubscribe = this.#state.subscribe(() => this.#host.requestUpdate());
      return;
    }
    const selector = this.#selector;
    this.#cached = selector(this.#state.current);
    this.#unsubscribe = this.#state.subscribe(() => {
      const next = selector(this.#state.current);
      if (!shallowEqual(this.#cached, next)) {
        this.#cached = next;
        this.#host.requestUpdate();
      }
    });
  }
};

// node_modules/@videojs/utils/dist/events/abort.js
function anyAbortSignal(signals) {
  if ("any" in AbortSignal) return AbortSignal.any(signals);
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), { signal: controller.signal });
  }
  return controller.signal;
}

// node_modules/@videojs/store/dist/default/core/abort-controller-registry.js
var AbortControllerRegistry = class {
  #base;
  #keys = /* @__PURE__ */ new Map();
  /** The attach-scoped signal. Aborts on detach or reattach. */
  get base() {
    return (this.#base ??= new AbortController()).signal;
  }
  /** Clears all keyed signals, leaving base intact. */
  clear() {
    for (const controller of this.#keys.values()) controller.abort();
    this.#keys.clear();
  }
  /** Resets base and clears all keyed signals. */
  reset() {
    this.clear();
    this.#base?.abort();
    this.#base = void 0;
  }
  /** Creates a new signal for the key, superseding any previous signal. */
  supersede(key) {
    this.#keys.get(key)?.abort();
    const controller = new AbortController();
    this.#keys.set(key, controller);
    return anyAbortSignal([this.base, controller.signal]);
  }
};

// node_modules/@videojs/store/dist/default/core/errors.js
var StoreError = class extends Error {
  code;
  cause;
  constructor(code, options) {
    super(options?.message ?? code);
    this.name = "StoreError";
    this.code = code;
    this.cause = options?.cause;
  }
};
function throwNoTargetError() {
  throw new StoreError("NO_TARGET");
}
function throwDestroyedError() {
  throw new StoreError("DESTROYED");
}

// node_modules/@videojs/store/dist/default/core/state.js
var isFlushScheduled = false;
function scheduleFlush() {
  if (isFlushScheduled) return;
  isFlushScheduled = true;
  queueMicrotask(flush);
}
var pendingContainers = /* @__PURE__ */ new Set();
function flush() {
  isFlushScheduled = false;
  for (const container of pendingContainers) container.flush();
  pendingContainers.clear();
}
var hasOwnProp = Object.prototype.hasOwnProperty;
var StateContainer = class {
  #current;
  #listeners = /* @__PURE__ */ new Set();
  #pending = false;
  constructor(initial) {
    this.#current = Object.freeze({ ...initial });
  }
  get current() {
    return this.#current;
  }
  patch(partial) {
    const next = { ...this.#current };
    let changed = false;
    for (const key of Reflect.ownKeys(partial)) {
      if (!hasOwnProp.call(partial, key)) continue;
      const value = partial[key];
      if (!Object.is(this.#current[key], value)) {
        next[key] = value;
        changed = true;
      }
    }
    if (changed) {
      this.#current = Object.freeze(next);
      this.#markPending();
    }
  }
  replace(next) {
    if (shallowEqual(this.#current, next)) return;
    this.#current = Object.freeze({ ...next });
    this.#markPending();
  }
  subscribe(callback, options) {
    const signal = options?.signal;
    if (signal?.aborted) return noop;
    this.#listeners.add(callback);
    if (!signal) return () => this.#listeners.delete(callback);
    const onAbort = () => this.#listeners.delete(callback);
    signal.addEventListener("abort", onAbort, { once: true });
    return () => {
      signal.removeEventListener("abort", onAbort);
      this.#listeners.delete(callback);
    };
  }
  flush() {
    if (!this.#pending) return;
    this.#pending = false;
    for (const fn of this.#listeners) fn();
  }
  #markPending() {
    this.#pending = true;
    pendingContainers.add(this);
    scheduleFlush();
  }
};
function createState(initial) {
  return new StateContainer(initial);
}

// node_modules/@videojs/store/dist/default/core/store.js
var STORE_SYMBOL = Symbol.for("@videojs/store");
var hasOwnProp2 = Object.prototype.hasOwnProperty;
function createStore() {
  return ((slice, options = {}) => {
    let target = null;
    let destroyed = false;
    const setupAbort = new AbortController();
    const signals = new AbortControllerRegistry();
    const actions = /* @__PURE__ */ new WeakMap();
    const reportedErrors = /* @__PURE__ */ new WeakSet();
    let sourceState;
    let state;
    function validate() {
      if (destroyed) throwDestroyedError();
      if (!target) throwNoTargetError();
    }
    const initialSourceState = freezeCopy(slice.state({
      target: () => {
        validate();
        return target;
      },
      signals,
      get: () => sourceState,
      set: (partial) => setSource(partial)
    }));
    sourceState = initialSourceState;
    const initialDerivedState = derive(sourceState);
    state = createState(publish(sourceState, initialDerivedState));
    const store = {
      [STORE_SYMBOL]: true,
      get $state() {
        return state;
      },
      get target() {
        return target;
      },
      get destroyed() {
        return destroyed;
      },
      get state() {
        return state.current;
      },
      attach,
      destroy,
      subscribe
    };
    for (const key of Object.keys(state.current)) Object.defineProperty(store, key, {
      get: () => state.current[key],
      enumerable: true
    });
    for (const key of Object.getOwnPropertySymbols(sourceState)) {
      if (typeof sourceState[key] !== "function") continue;
      Object.defineProperty(store, key, { get: () => sourceState[key] });
    }
    try {
      options.onSetup?.({
        store,
        signal: setupAbort.signal
      });
    } catch (error) {
      reportError(error);
    }
    return store;
    function derive(source) {
      const result = {};
      const definitions = slice.derived;
      if (!definitions) return result;
      const ctx = { get: () => source };
      for (const key of Object.keys(definitions)) result[key] = definitions[key](ctx);
      return result;
    }
    function publish(source, derived) {
      const result = {};
      for (const key of Object.keys(source)) result[key] = source[key];
      Object.assign(result, derived);
      for (const key of Object.keys(result)) {
        const value = result[key];
        if (isFunction(value)) result[key] = wrapAction(value);
      }
      return result;
    }
    function wrapAction(action) {
      const cached = actions.get(action);
      if (cached) return cached;
      const wrapped = function(...args) {
        try {
          const result = action.apply(this, args);
          if (options.onError && isPromise(result)) result.catch(reportError);
          return result;
        } catch (error) {
          if (options.onError) reportError(error);
          throw error;
        }
      };
      actions.set(action, wrapped);
      return wrapped;
    }
    function setSource(partial) {
      const patched = patchSource(sourceState, partial);
      if (!patched) return;
      const nextDerived = derive(patched.next);
      sourceState = patched.next;
      state.replace(publish(sourceState, nextDerived));
    }
    function attach(newTarget) {
      if (destroyed) throwDestroyedError();
      signals.reset();
      target = newTarget;
      const attachContext = {
        target: newTarget,
        signal: signals.base,
        get: () => sourceState,
        set: (partial) => {
          try {
            setSource(partial);
          } catch (error) {
            reportError(error);
          }
        },
        reportError,
        store: {
          get state() {
            return state.current;
          },
          subscribe
        }
      };
      try {
        slice.attach?.(attachContext);
      } catch (error) {
        reportError(error);
      }
      try {
        options.onAttach?.({
          store,
          target: newTarget,
          signal: signals.base
        });
      } catch (error) {
        reportError(error);
      }
      return detach;
    }
    function detach() {
      if (isNull(target)) return;
      signals.reset();
      target = null;
      const resetState = { ...initialSourceState };
      for (const key of slice.preserve ?? []) resetState[key] = sourceState[key];
      setSource(resetState);
    }
    function destroy() {
      if (destroyed) return;
      destroyed = true;
      detach();
      setupAbort.abort();
    }
    function subscribe(callback, options2) {
      return state.subscribe(callback, options2);
    }
    function reportError(error) {
      if (isObject(error)) {
        if (reportedErrors.has(error)) return;
        reportedErrors.add(error);
      }
      if (options.onError) options.onError({
        store,
        error
      });
      else console.error("[vjs-store]", error);
    }
  });
}
function freezeCopy(value) {
  return Object.freeze({ ...value });
}
function patchSource(current, partial) {
  const next = { ...current };
  let changed = false;
  for (const key of Reflect.ownKeys(partial)) {
    if (!hasOwnProp2.call(partial, key)) continue;
    const value = partial[key];
    if (Object.is(current[key], value)) continue;
    next[key] = value;
    changed = true;
  }
  return changed ? { next: Object.freeze(next) } : null;
}

// node_modules/@videojs/html/dist/default/player/controller.js
var PlayerController = class {
  #host;
  #selector;
  #consumer;
  #store = null;
  constructor(host, context, selector) {
    this.#host = host;
    this.#selector = selector;
    this.#consumer = new ContextConsumer(host, {
      context,
      callback: (ctx) => this.#connect(ctx),
      subscribe: true
    });
    host.addController(this);
  }
  get value() {
    const store = this.#consumer.value;
    if (!store) return void 0;
    if (!this.#selector) return store;
    return this.#store?.value;
  }
  get displayName() {
    return this.#selector?.displayName;
  }
  hostConnected() {
    const store = this.#consumer.value;
    if (store) this.#connect(store);
  }
  hostDisconnected() {
  }
  #connect(store) {
    if (!this.#selector) return;
    if (!this.#store) this.#store = new SnapshotController(this.#host, store.$state, this.#selector);
    else this.#store.track(store.$state);
  }
};
function createPlayerController(context) {
  class ConfiguredPlayerController extends PlayerController {
    constructor(host, selector) {
      if (selector) super(host, context, selector);
      else super(host, context);
    }
  }
  return ConfiguredPlayerController;
}

// node_modules/@videojs/element/dist/default/destroy-mixin.js
var destroyables = /* @__PURE__ */ new WeakSet();
function destroyContents(element) {
  if (element.shadowRoot) destroyChildren(element.shadowRoot);
  destroyChildren(element);
}
function destroyChildren(parent) {
  for (const child of Array.from(parent.children)) if (destroyables.has(child)) child.destroy();
  else destroyContents(child);
}
function DestroyMixin(SuperClass) {
  class DestroyableElement extends SuperClass {
    #destroyed = false;
    #trackedControllers = /* @__PURE__ */ new Set();
    constructor(...args) {
      super(...args);
      destroyables.add(this);
    }
    get destroyed() {
      return this.#destroyed;
    }
    destroy() {
      if (this.#destroyed) return;
      this.#destroyed = true;
      destroyContents(this);
      this.destroyCallback();
    }
    destroyCallback() {
      for (const c of this.#trackedControllers) c.hostDestroyed?.();
    }
    addController(controller) {
      super.addController(controller);
      this.#trackedControllers.add(controller);
    }
    removeController(controller) {
      super.removeController(controller);
      this.#trackedControllers.delete(controller);
    }
    connectedCallback() {
      if (this.#destroyed) return;
      super.connectedCallback();
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      if (!this.#destroyed && !isKeptAlive(this)) requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!this.isConnected) this.destroy();
        });
      });
    }
    performUpdate() {
      if (this.#destroyed) return;
      super.performUpdate();
    }
  }
  return DestroyableElement;
}

// node_modules/@videojs/element/dist/default/reactive-element.js
var cache = /* @__PURE__ */ new WeakMap();
var propertyKeys = /* @__PURE__ */ new Map();
var HTMLElementBase = globalThis.HTMLElement ?? class {
};
var ReactiveElement = class extends HTMLElementBase {
  static {
    this.properties = {};
  }
  /** Returns a list of attributes corresponding to the registered properties. */
  static get observedAttributes() {
    return [...resolve(this).attrToProp.keys()];
  }
  #controllers;
  #changedProperties;
  #instanceProperties;
  #propertiesUpgraded;
  /**
  * Promise that gates the first update until `connectedCallback`. Also used to serialize updates — each
  * `#enqueueUpdate` awaits the previous `#updatePromise`, so property changes are batched and updates never overlap.
  * Matches Lit's scheduling model.
  */
  #updatePromise;
  constructor() {
    super();
    this.#controllers = /* @__PURE__ */ new Set();
    this.#changedProperties = /* @__PURE__ */ new Map();
    this.#propertiesUpgraded = false;
    this.isUpdatePending = false;
    this.hasUpdated = false;
    this.#updatePromise = new Promise((res) => this.enableUpdating = res);
    const { props } = resolve(this.constructor);
    for (const name of props.keys()) if (Object.hasOwn(this, name)) {
      (this.#instanceProperties ??= /* @__PURE__ */ new Map()).set(name, this[name]);
      delete this[name];
    }
    this.requestUpdate();
  }
  /**
  * Note, this method should be considered final and not overridden. It is overridden on the element instance with a
  * function that triggers the first update.
  */
  enableUpdating(_requestedUpdate) {
  }
  /**
  * Registers a {@linkcode ReactiveController} to participate in the element's reactive update cycle. The element
  * automatically calls into any registered controllers during its lifecycle callbacks.
  *
  * If the element is connected when `addController()` is called, the controller's `hostConnected()` callback will be
  * immediately called.
  */
  addController(controller) {
    this.#controllers.add(controller);
    if (this.isConnected) controller.hostConnected?.();
  }
  /** Removes a {@linkcode ReactiveController} from the element. */
  removeController(controller) {
    this.#controllers.delete(controller);
  }
  /** On first connection, enables updating and notifies controllers. */
  connectedCallback() {
    this.#upgradeProperties();
    this.enableUpdating(true);
    for (const c of this.#controllers) c.hostConnected?.();
  }
  disconnectedCallback() {
    for (const c of this.#controllers) c.hostDisconnected?.();
  }
  /**
  * Synchronizes property values when attributes change.
  *
  * Specifically, when an attribute is set, the corresponding property is set. You should rarely need to implement this
  * callback. If this method is overridden, `super.attributeChangedCallback(name, _old, value)` must be called.
  */
  attributeChangedCallback(attr, oldValue, newValue) {
    if (oldValue === newValue) return;
    const { props, attrToProp } = resolve(this.constructor);
    const propName = attrToProp.get(attr);
    if (!propName) return;
    const decl = props.get(propName);
    if (!decl) return;
    let value = newValue;
    if (decl.type === Boolean) value = newValue !== null;
    else if (decl.type === Number) value = newValue === null ? null : Number(newValue);
    this[propName] = value;
  }
  /**
  * Requests an update which is processed asynchronously. This should be called when an element should update based on
  * some state not triggered by setting a reactive property. In this case, pass no arguments. It should also be called
  * when manually implementing a property setter. In this case, pass the property `name` and `oldValue` to ensure that
  * any configured property options are honored.
  */
  requestUpdate(name, oldValue) {
    if (name !== void 0 && !this.#changedProperties.has(name)) this.#changedProperties.set(name, oldValue);
    if (this.isUpdatePending) return;
    this.#updatePromise = this.#enqueueUpdate();
  }
  /**
  * Sets up the element to asynchronously update. Awaits the previous `#updatePromise` which both serializes updates
  * and (on first update) waits for `connectedCallback` to resolve the gate.
  */
  async #enqueueUpdate() {
    this.isUpdatePending = true;
    try {
      await this.#updatePromise;
    } catch (e) {
      Promise.reject(e);
    }
    const result = this.scheduleUpdate();
    if (result != null) await result;
    return !this.isUpdatePending;
  }
  /**
  * Schedules an element update. You can override this method to change the timing of updates by returning a Promise.
  * The update will await the returned Promise, and you should resolve the Promise to allow the update to proceed. If
  * this method is overridden, `super.scheduleUpdate()` must be called.
  *
  * For instance, to schedule updates to occur just before the next frame:
  *
  * ```ts
  * override protected async scheduleUpdate(): Promise<unknown> {
  *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  *   super.scheduleUpdate();
  * }
  * ```
  */
  scheduleUpdate() {
    this.performUpdate();
  }
  /**
  * Performs an element update. Note, if an exception is thrown during the update, `firstUpdated` and `updated` will
  * not be called.
  *
  * Call `performUpdate()` to immediately process a pending update. This should generally not be needed, but it can be
  * done in rare cases when you need to update synchronously.
  */
  performUpdate() {
    if (!this.isUpdatePending) return;
    const changed = this.#changedProperties;
    this.willUpdate(changed);
    for (const c of this.#controllers) c.hostUpdate?.();
    this.update(changed);
    this.#changedProperties = /* @__PURE__ */ new Map();
    this.isUpdatePending = false;
    for (const c of this.#controllers) c.hostUpdated?.();
    if (!this.hasUpdated) {
      this.hasUpdated = true;
      this.firstUpdated(changed);
    }
    this.updated(changed);
  }
  /**
  * Invoked before `update()` to compute values needed during the update.
  *
  * Implement `willUpdate` to compute property values that depend on other properties and are used in the rest of the
  * update process.
  *
  * ```ts
  * willUpdate(changed) {
  *   if (changed.has('firstName') || changed.has('lastName')) {
  *     this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
  *   }
  * }
  * ```
  */
  willUpdate(_changed) {
  }
  /**
  * Updates the element. Override it to render and keep the element's DOM up to date; properties are not reflected to
  * attributes. Setting properties inside this method will _not_ trigger another update.
  */
  update(_changed) {
  }
  /**
  * Invoked when the element is first updated. Implement to perform one time work on the element after update.
  *
  * Setting properties inside this method will trigger the element to update again after this update cycle completes.
  */
  firstUpdated(_changed) {
  }
  /**
  * Invoked whenever the element is updated. Implement to perform post-updating tasks via DOM APIs, for example,
  * focusing an element.
  *
  * Setting properties inside this method will trigger the element to update again after this update cycle completes.
  */
  updated(_changed) {
  }
  /**
  * Returns a Promise that resolves when the element has completed updating. The Promise value is a boolean that is
  * `true` if the element completed the update without triggering another update. The Promise result is `false` if a
  * property was set inside `updated()`.
  */
  get updateComplete() {
    return this.#updatePromise;
  }
  /**
  * Replays properties set before registration through their reactive accessors. This runs after subclass fields have
  * initialized but before connection lifecycle consumers, so user values win over defaults and are immediately
  * usable.
  */
  #upgradeProperties() {
    if (this.#propertiesUpgraded) return;
    this.#propertiesUpgraded = true;
    const { props } = resolve(this.constructor);
    for (const name of props.keys()) {
      const hasSavedValue = this.#instanceProperties?.has(name) ?? false;
      const hasOwnValue = Object.hasOwn(this, name);
      if (!hasSavedValue && !hasOwnValue) continue;
      const value = hasSavedValue ? this.#instanceProperties?.get(name) : Reflect.get(this, name);
      if (hasOwnValue) Reflect.deleteProperty(this, name);
      Reflect.set(this, name, value);
    }
    this.#instanceProperties = void 0;
  }
};
function resolve(ctor) {
  const existing = cache.get(ctor);
  if (existing) return existing;
  const props = /* @__PURE__ */ new Map();
  const attrToProp = /* @__PURE__ */ new Map();
  for (const [name, decl] of Object.entries(ctor.properties)) {
    props.set(name, decl);
    attrToProp.set(decl.attribute ?? name, name);
    if (!Object.getOwnPropertyDescriptor(ctor.prototype, name)?.get) {
      let key = propertyKeys.get(name);
      if (!key) {
        key = Symbol(name);
        propertyKeys.set(name, key);
      }
      Object.defineProperty(ctor.prototype, name, {
        get() {
          return this[key];
        },
        set(value) {
          const old = this[key];
          this[key] = value;
          if (!Object.is(old, value)) this.requestUpdate(name, old);
        },
        configurable: true,
        enumerable: true
      });
    }
  }
  const meta = {
    props,
    attrToProp
  };
  cache.set(ctor, meta);
  return meta;
}

// node_modules/@videojs/html/dist/default/ui/ui-element.js
var UIElement = class extends DestroyMixin(ReactiveElement) {
};

// node_modules/@videojs/core/dist/default/dom/extensions/media.js
function createMediaFacade(media, sources) {
  return new Proxy(media, {
    get(target, prop) {
      if (prop === REGISTERED_MEDIA) return target;
      const owner = findOverride(sources, prop) ?? target;
      const value = owner[prop];
      return isFunction(value) && prop !== "constructor" ? value.bind(owner) : value;
    },
    set(target, prop, value) {
      const owner = findOverride(sources, prop) ?? target;
      return Reflect.set(owner, prop, value);
    },
    has(target, prop) {
      return !isNil(findOverride(sources, prop)) || prop in target;
    }
  });
}
function findOverride(sources, prop) {
  if (Object.hasOwn(Object.prototype, prop)) return null;
  for (const { mediaOverride } of sources()) if (!isNil(mediaOverride) && !isUndefined(mediaOverride[prop])) return mediaOverride;
  return null;
}

// node_modules/@videojs/core/dist/default/dom/extensions/coordinator.js
function overridesMedia(extension) {
  return !!extension && "mediaOverride" in extension;
}
var PlayerExtensionCoordinator = class {
  #extensions = /* @__PURE__ */ new Map();
  #facades = /* @__PURE__ */ new WeakMap();
  #player = { initTime: Date.now() };
  #onChange;
  #target = null;
  /** @param onChange - Called after an extension that overrides media members is registered or released. */
  constructor(onChange) {
    this.#onChange = onChange;
  }
  get size() {
    return this.#extensions.size;
  }
  get(Extension) {
    return this.#extensions.get(Extension);
  }
  /**
  * Register `extension`, replacing any earlier instance of the same class: connect it to the player and attach it to
  * the current target. Returns a release callback that only removes this exact instance.
  */
  register(extension) {
    const Extension = extension.constructor;
    const previous = this.#extensions.get(Extension);
    if (previous !== extension) {
      if (previous) this.#leave(previous);
      this.#extensions.set(Extension, extension);
      extension.connect?.(this.#player);
      if (this.#target) extension.attach?.(this.#target);
      if (overridesMedia(previous) || overridesMedia(extension)) this.#onChange();
    }
    return () => this.#release(extension);
  }
  /**
  * Attach every extension to `target`. Extensions follow the media: a target with the same media is recorded without
  * re-attaching them, so a container change never restarts an extension's session.
  */
  attach(target) {
    if (this.#target?.media === target.media) {
      this.#target = target;
      return;
    }
    this.detach();
    this.#target = target;
    for (const extension of this.#extensions.values()) extension.attach?.(target);
  }
  detach() {
    if (!this.#target) return;
    for (const extension of this.#extensions.values()) extension.detach?.();
    this.#target = null;
  }
  /** Detach, disconnect, and drop every registration. Extensions are destroyed by their owners, not here. */
  destroy() {
    this.detach();
    for (const extension of this.#extensions.values()) extension.disconnect?.();
    this.#extensions.clear();
  }
  /**
  * The media as the store should see it: `media` itself unless a registered extension can override media members,
  * otherwise a facade that routes each member through the extensions' overrides first.
  */
  getStoreMedia(media) {
    if (!this.#hasMediaOverrides()) return media;
    let facade = this.#facades.get(media);
    if (!facade) {
      facade = createMediaFacade(media, () => this.#extensions.values());
      this.#facades.set(media, facade);
    }
    return facade;
  }
  #hasMediaOverrides() {
    for (const extension of this.#extensions.values()) if (overridesMedia(extension)) return true;
    return false;
  }
  #release(extension) {
    const Extension = extension.constructor;
    if (this.#extensions.get(Extension) !== extension) return;
    this.#extensions.delete(Extension);
    this.#leave(extension);
    if (overridesMedia(extension)) this.#onChange();
  }
  /** Undo `register` for an extension that is no longer registered: detach it from the media, then disconnect it. */
  #leave(extension) {
    if (this.#target) extension.detach?.();
    extension.disconnect?.();
  }
};

// node_modules/@videojs/core/dist/default/dom/feature.js
function definePlayerFeature(definition) {
  const preserved = Object.values(definition.config ?? {}).map((entry) => entry.state);
  return {
    ...definition,
    ...preserved.length > 0 ? { preserve: preserved } : {}
  };
}
function combinePlayerFeatureConfigs(features) {
  const definitions = features.map((feature) => feature.config ?? {});
  return Object.assign({}, ...definitions);
}
function setPlayerConfigValue(store, entry, value) {
  const action = store[entry.action];
  if (typeof action !== "function") throw new TypeError(`Missing config action "${String(entry.action)}"`);
  action(value);
}

// node_modules/@videojs/core/dist/default/dom/media-action-value.js
function getMediaInputActionValue(action, key, value) {
  if (!isUndefined(value)) return value;
  const normalizedKey = key?.toLowerCase();
  if (action === "seekStep") return normalizedKey === "arrowleft" || normalizedKey === "j" ? -10 : 10;
  if (action === "volumeStep") return normalizedKey === "arrowdown" ? -0.05 : 5 / 100;
}

// node_modules/@videojs/core/dist/default/dom/gesture/action-value.js
function getGestureActionValue(action, region, value) {
  if (action === "seekStep" && isUndefined(value) && region === "left") return -10;
  return getMediaInputActionValue(action, void 0, value);
}

// node_modules/@videojs/core/dist/default/dom/store/features/audio-track.js
function getTrackValue(track, index) {
  return track.id || String(index);
}
function toMediaTrack(track, index) {
  return {
    id: getTrackValue(track, index),
    ...track.kind !== void 0 && { kind: track.kind },
    label: track.label,
    language: track.language,
    enabled: track.enabled
  };
}
var audioTrackFeature = definePlayerFeature({
  name: "audioTrack",
  state: ({ target }) => ({
    audioTrackList: [],
    selectAudioTrack(value) {
      const { media } = target();
      if (!isMediaAudioTrackCapable(media)) return;
      const tracks = [...media.audioTracks];
      const track = tracks.find((candidate, index) => getTrackValue(candidate, index) === value);
      if (!track) return;
      for (const candidate of tracks) candidate.enabled = candidate === track;
    }
  }),
  attach({ target, signal, set }) {
    const { media } = target;
    let audioTracks = null;
    let cleanup = null;
    const getAudioTracks = () => isMediaAudioTrackCapable(media) ? media.audioTracks : null;
    const sync = (list = getAudioTracks()) => {
      set({ audioTrackList: list ? [...list].map(toMediaTrack) : [] });
    };
    const bind = () => {
      const nextAudioTracks = getAudioTracks();
      if (nextAudioTracks === audioTracks) {
        sync(nextAudioTracks);
        return;
      }
      cleanup?.abort();
      cleanup = new AbortController();
      audioTracks = nextAudioTracks;
      if (audioTracks) {
        listen(audioTracks, "addtrack", () => sync(audioTracks), { signal: cleanup.signal });
        listen(audioTracks, "removetrack", () => sync(audioTracks), { signal: cleanup.signal });
        listen(audioTracks, "change", () => sync(audioTracks), { signal: cleanup.signal });
      }
      sync(audioTracks);
    };
    bind();
    listen(media, "loadstart", bind, { signal });
    signal.addEventListener("abort", () => cleanup?.abort(), { once: true });
  }
});

// node_modules/@videojs/core/dist/default/dom/store/features/buffer.js
var bufferFeature = definePlayerFeature({
  name: "buffer",
  state: () => ({
    buffered: [],
    seekable: []
  }),
  attach({ target, signal, set }) {
    const { media } = target;
    if (!isMediaBufferCapable(media)) return;
    const sync = () => set({
      buffered: serializeTimeRanges(media.buffered),
      seekable: serializeTimeRanges(media.seekable)
    });
    sync();
    listen(media, "loadedmetadata", sync, { signal });
    listen(media, "durationchange", sync, { signal });
    listen(media, "progress", sync, { signal });
    listen(media, "emptied", sync, { signal });
  }
});

// node_modules/@videojs/core/dist/default/dom/ui/interaction-lock.js
var locks = /* @__PURE__ */ new WeakMap();
function lockInteractions(element) {
  locks.set(element, (locks.get(element) ?? 0) + 1);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const count = locks.get(element) ?? 0;
    if (count <= 1) locks.delete(element);
    else locks.set(element, count - 1);
  };
}
function isInteractionLocked(element) {
  return (locks.get(element) ?? 0) > 0;
}

// node_modules/@videojs/core/dist/default/dom/gesture/region.js
function resolveRegion(clientX, containerRect, activeRegions) {
  const relativeX = clientX - containerRect.left;
  const width = containerRect.width;
  if (width === 0) return null;
  const ratio = relativeX / width;
  if (activeRegions.size === 2 && activeRegions.has("left") && activeRegions.has("right")) return ratio < 0.5 ? "left" : "right";
  if (activeRegions.size === 3) {
    if (ratio < 1 / 3) return "left";
    if (ratio < 2 / 3) return "center";
    return "right";
  }
  if (activeRegions.has("left") && ratio < 0.5) return "left";
  if (activeRegions.has("right") && ratio >= 0.5) return "right";
  if (activeRegions.has("center")) {
    if (activeRegions.size === 1) return "center";
    if (ratio >= 1 / 3 && ratio < 2 / 3) return "center";
  }
  return null;
}

// node_modules/@videojs/core/dist/default/dom/gesture/coordinator.js
var TAP_THRESHOLD = 250;
var GestureCoordinator = class {
  #target;
  #bindings = [];
  #recognizers = /* @__PURE__ */ new Set();
  #disconnect = null;
  #subscribers = /* @__PURE__ */ new Set();
  constructor(target) {
    this.#target = target;
  }
  get bindings() {
    return this.#bindings;
  }
  subscribe(callback) {
    this.#subscribers.add(callback);
    return () => this.#subscribers.delete(callback);
  }
  /**
  * Whether a registered binding claims this tap for the given action. A claimed tap belongs to the gesture layer, so
  * callers should leave it alone. Taps on interactive targets (buttons, sliders) are never claimed — the same
  * filtering the pointerup listener applies. A disabled binding still claims: disabling a gesture opts out of the
  * action, it doesn't hand the tap back to a fallback handler.
  */
  claimsTap(event, action) {
    if (isInteractionLocked(this.#target)) return true;
    if (isInteractiveTarget(event)) return false;
    return this.#bindings.some((b) => b.type === "tap" && b.action === action && (!b.pointer || b.pointer === event.pointerType));
  }
  add(binding) {
    const value = getGestureActionValue(binding.action ?? "", binding.region, binding.value);
    const wrapped = {
      ...binding,
      value,
      onActivate: (event) => {
        if (this.#subscribers.size > 0) {
          const activateEvent = {
            type: binding.type,
            source: "gesture",
            action: binding.action,
            value,
            region: binding.region,
            pointer: binding.pointer,
            event
          };
          for (const cb of this.#subscribers) try {
            cb(activateEvent);
          } catch (error) {
          }
        }
        binding.onActivate(event);
      }
    };
    this.#bindings.push(wrapped);
    this.#recognizers.add(wrapped.recognizer);
    this.#connect();
    let removed = false;
    return () => {
      if (removed) return;
      removed = true;
      const idx = this.#bindings.indexOf(wrapped);
      if (idx !== -1) this.#bindings.splice(idx, 1);
      this.#maybeDisconnect();
    };
  }
  #connect() {
    if (this.#disconnect) return;
    this.#disconnect = new AbortController();
    const { signal } = this.#disconnect;
    let pointerDownTime = 0, pointerDown = null;
    const resetPointer = () => {
      pointerDownTime = 0;
      pointerDown = null;
      for (const recognizer of this.#recognizers) recognizer.reset();
    };
    listen(this.#target, "pointermove", (event) => {
      if (pointerDown && event.pointerId === pointerDown.id && Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 10) resetPointer();
    }, { signal });
    listen(this.#target, "pointercancel", resetPointer, { signal });
    listen(this.#target, "pointerdown", (event) => {
      if (isInteractionLocked(this.#target) || event.button !== 0 || event.isPrimary === false || isInteractiveTarget(event)) {
        resetPointer();
        return;
      }
      if (pointerDown) resetPointer();
      pointerDown = { id: event.pointerId, pointer: event.pointerType, x: event.clientX, y: event.clientY };
      pointerDownTime = Date.now();
      for (const binding of this.#bindings) binding.onPointerDown?.();
    }, { signal });
    listen(this.#target, "pointerup", (event) => {
      const down = pointerDown;
      pointerDown = null;
      if (!down) return;
      if (isInteractionLocked(this.#target) || event.button !== 0 || event.isPrimary === false || event.pointerId !== down.id || event.pointerType !== down.pointer || Date.now() - pointerDownTime > TAP_THRESHOLD || isInteractiveTarget(event) || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 10) {
        resetPointer();
        return;
      }
      pointerDownTime = 0;
      const pointerType = event.pointerType;
      const clientX = event.clientX;
      const target = this.#target;
      const bindings = this.#bindings;
      const matches = { resolve: (type) => matchBindings(bindings, type, pointerType, clientX, target) };
      for (const recognizer of this.#recognizers) recognizer.handleUp(matches, event);
    }, { signal });
  }
  #maybeDisconnect() {
    if (this.#bindings.length > 0) return;
    for (const recognizer of this.#recognizers) recognizer.reset();
    this.#recognizers.clear();
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
};
var coordinators = /* @__PURE__ */ new WeakMap();
function findGestureCoordinator(target) {
  return coordinators.get(target);
}
function getGestureCoordinator(target) {
  let coordinator = coordinators.get(target);
  if (!coordinator) {
    coordinator = new GestureCoordinator(target);
    coordinators.set(target, coordinator);
  }
  return coordinator;
}
function matchBindings(bindings, type, pointerType, clientX, target) {
  const rect = target.getBoundingClientRect();
  const activeRegions = getActiveRegions(bindings, type, pointerType);
  const region = activeRegions.size > 0 ? resolveRegion(clientX, rect, activeRegions) : null;
  const matches = [];
  for (const binding of bindings) {
    if (binding.disabled) continue;
    if (binding.type !== type) continue;
    if (binding.pointer && binding.pointer !== pointerType) continue;
    if (binding.region) {
      if (binding.region !== region) continue;
    } else if (region !== null) continue;
    matches.push(binding);
  }
  return matches;
}
function getActiveRegions(bindings, type, pointerType) {
  const regions = /* @__PURE__ */ new Set();
  for (const binding of bindings) {
    if (binding.disabled) continue;
    if (binding.type !== type) continue;
    if (binding.pointer && binding.pointer !== pointerType) continue;
    if (binding.region) regions.add(binding.region);
  }
  return regions;
}

// node_modules/@videojs/core/dist/default/dom/presentation/remote-playback.js
function resolveRemote(media) {
  const target = media;
  if (isObject(target.remote) && "state" in target.remote && "prompt" in target.remote) return target.remote;
}
function isRemotePlaybackConnected(media) {
  return resolveRemote(media)?.state === "connected";
}
function isRemotePlaybackConnecting(media) {
  return resolveRemote(media)?.state === "connecting";
}
async function requestRemotePlayback(media) {
  const remote = resolveRemote(media);
  if (!remote) throw new DOMException("Remote playback not supported", "NotSupportedError");
  return remote.prompt();
}

// node_modules/@videojs/core/dist/default/dom/store/features/controls.js
var IDLE_DELAY = 2e3;
var TAP_THRESHOLD2 = 250;
var TOUCH_SETTLE_DELAY = 500;
var CAPTURE_RELEASE_DELAY = 100;
var controlsActionsByRequest = /* @__PURE__ */ new WeakMap();
var controlsFeature = definePlayerFeature({
  name: "controls",
  state: ({ get, set }) => {
    const fallbackRequestControlsLock = () => {
      set({ controlsVisible: true });
      return () => {
      };
    };
    const fallbackToggleControls = (forceShow) => {
      const next = forceShow ?? !get().userActive;
      set({
        userActive: next,
        controlsVisible: next
      });
      return next;
    };
    const actions = createControlsActions(fallbackRequestControlsLock, fallbackToggleControls);
    controlsActionsByRequest.set(actions.requestControlsLock, actions);
    return {
      userActive: true,
      controlsVisible: true,
      requestControlsLock: actions.requestControlsLock,
      toggleControls: actions.toggleControls
    };
  },
  attach({ target, signal, get, set }) {
    const { media, container } = target;
    if (!isMediaPauseCapable(media) || isNull(container)) return;
    let idleTimer;
    let controlsLockCount = 0;
    const computeVisible = (userActive) => {
      return controlsLockCount > 0 || userActive || media.paused || isRemotePlaybackConnected(media) || isRemotePlaybackConnecting(media);
    };
    function clearIdle() {
      clearTimeout(idleTimer);
      idleTimer = void 0;
    }
    function scheduleIdle() {
      clearIdle();
      if (controlsLockCount > 0) return;
      idleTimer = setTimeout(setInactive, IDLE_DELAY);
    }
    function setActive() {
      if (!get().userActive) set({
        userActive: true,
        controlsVisible: true
      });
      scheduleIdle();
    }
    function setInactive() {
      clearIdle();
      set({
        userActive: false,
        controlsVisible: computeVisible(false)
      });
    }
    function requestControlsLock() {
      controlsLockCount++;
      clearIdle();
      if (!get().controlsVisible) set({ controlsVisible: true });
      let released = false;
      return () => {
        if (released || signal.aborted) return;
        released = true;
        controlsLockCount--;
        if (controlsLockCount === 0) setActive();
      };
    }
    function toggleControls(forceShow) {
      if (forceShow ?? !get().controlsVisible) setActive();
      else setInactive();
      return get().controlsVisible;
    }
    const actions = controlsActionsByRequest.get(get().requestControlsLock);
    actions.setDelegates(requestControlsLock, toggleControls);
    let pointerDownTime = 0;
    let lastTouchAt = 0;
    const isRecentTouch = () => lastTouchAt > 0 && Date.now() - lastTouchAt < TOUCH_SETTLE_DELAY;
    let lastCaptureReleaseAt = 0;
    const isRecentCaptureRelease = () => lastCaptureReleaseAt > 0 && Date.now() - lastCaptureReleaseAt < CAPTURE_RELEASE_DELAY;
    function onPointerDown(event) {
      pointerDownTime = Date.now();
      if (event.pointerType === "touch") lastTouchAt = pointerDownTime;
    }
    function onPointerUp(event) {
      if (event.pointerType === "touch") lastTouchAt = Date.now();
      if (event.pointerType === "touch" && Date.now() - pointerDownTime < TAP_THRESHOLD2) {
        if (findGestureCoordinator(container)?.claimsTap(event, "toggleControls")) return;
        const isMediaOrContainer = [getRegisteredMedia(media), container].includes(event.target);
        if (get().controlsVisible && isMediaOrContainer) setInactive();
        else setActive();
      } else setActive();
    }
    const onPlaybackChange = () => {
      const { userActive } = get();
      set({ controlsVisible: computeVisible(userActive) });
      if (!media.paused && userActive) scheduleIdle();
    };
    function onPointerMove(event) {
      if (event.pointerType === "touch") {
        if (get().userActive) scheduleIdle();
        return;
      }
      setActive();
    }
    listen(container, "pointermove", onPointerMove, { signal });
    listen(container, "pointerdown", onPointerDown, { signal });
    listen(container, "pointerup", onPointerUp, { signal });
    listen(container, "lostpointercapture", () => {
      lastCaptureReleaseAt = Date.now();
    }, { signal });
    listen(container, "keydown", setActive, { signal });
    listen(container, "keyup", setActive, { signal });
    listen(container, "focusin", () => {
      if (isRecentTouch()) return;
      setActive();
    }, { signal });
    listen(container, "mouseleave", (event) => {
      if (isRecentTouch()) return;
      if (isRecentCaptureRelease() && event instanceof MouseEvent && isPointInElement(container, event)) return;
      setInactive();
    }, { signal });
    listen(media, "play", onPlaybackChange, { signal });
    listen(media, "pause", onPlaybackChange, { signal });
    listen(media, "ended", onPlaybackChange, { signal });
    if (isMediaRemotePlaybackCapable(media)) {
      const onCastChange = () => {
        const { userActive } = get();
        set({ controlsVisible: computeVisible(userActive) });
      };
      listen(media.remote, "connect", onCastChange, { signal });
      listen(media.remote, "connecting", onCastChange, { signal });
      listen(media.remote, "disconnect", onCastChange, { signal });
    }
    signal.addEventListener("abort", () => {
      actions.reset();
      controlsLockCount = 0;
      clearIdle();
    }, { once: true });
    scheduleIdle();
  }
});
function createControlsActions(fallbackRequestControlsLock, fallbackToggleControls) {
  let requestControlsLockDelegate = fallbackRequestControlsLock;
  let toggleControlsDelegate = fallbackToggleControls;
  const locks2 = /* @__PURE__ */ new Set();
  const requestControlsLock = () => {
    const lock = { release: requestControlsLockDelegate() };
    let released = false;
    locks2.add(lock);
    return () => {
      if (released) return;
      released = true;
      locks2.delete(lock);
      lock.release();
    };
  };
  const toggleControls = (forceShow) => toggleControlsDelegate(forceShow);
  const actions = {
    requestControlsLock,
    toggleControls,
    setDelegates(nextRequestControlsLock, nextToggleControls) {
      if (nextRequestControlsLock !== requestControlsLockDelegate) {
        requestControlsLockDelegate = nextRequestControlsLock;
        for (const lock of locks2) {
          lock.release();
          lock.release = nextRequestControlsLock();
        }
      }
      toggleControlsDelegate = nextToggleControls;
    },
    reset() {
      actions.setDelegates(fallbackRequestControlsLock, fallbackToggleControls);
    }
  };
  return actions;
}

// node_modules/@videojs/core/dist/default/dom/store/features/error.js
var errorFeature = definePlayerFeature({
  name: "error",
  state: ({ set }) => ({
    error: null,
    dismissError() {
      set({ error: null });
    }
  }),
  attach({ target, signal, set }) {
    const { media } = target;
    if (!isMediaErrorCapable(media)) return;
    const syncError = () => set({ error: media.error });
    syncError();
    listen(media, "error", syncError, { signal });
    listen(media, "loadstart", syncError, { signal });
    listen(media, "loadedmetadata", syncError, { signal });
    listen(media, "canplay", syncError, { signal });
    listen(media, "playing", syncError, { signal });
    listen(media, "emptied", () => set({ error: null }), { signal });
  }
});

// node_modules/@videojs/core/dist/default/dom/presentation/fullscreen.js
function isFullscreenEnabled() {
  const doc = document;
  if (doc.fullscreenEnabled || doc.webkitFullscreenEnabled) return true;
  const video = document.createElement("video");
  return isFunction(video.webkitSetPresentationMode);
}
function getFullscreenElement() {
  const doc = document;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}
function matchesFullscreen(element) {
  if (!(element instanceof Element)) return false;
  try {
    return element.matches(":fullscreen");
  } catch {
    return false;
  }
}
function isFullscreen(container, media) {
  if (media.webkitPresentationMode === "fullscreen") return true;
  const fullscreenElement = getFullscreenElement();
  if (fullscreenElement && (fullscreenElement === container || fullscreenElement === getRegisteredMedia(media))) return true;
  if (matchesFullscreen(container) || matchesFullscreen(media)) return true;
  return media.isFullscreen ?? false;
}
async function requestFullscreen(container, media) {
  const doc = document;
  if (container && (doc.fullscreenEnabled || doc.webkitFullscreenEnabled)) {
    const el = container;
    hideOpenPopovers(container);
    if (isFunction(el.requestFullscreen)) return el.requestFullscreen();
    if (isFunction(el.webkitRequestFullscreen)) return el.webkitRequestFullscreen();
  }
  const webkitVideo = media;
  if (isFunction(webkitVideo.webkitSetPresentationMode)) {
    webkitVideo.webkitSetPresentationMode("fullscreen");
    return;
  }
  const video = media;
  if (isFunction(video.requestFullscreen)) return video.requestFullscreen();
}
async function exitFullscreen(media) {
  const doc = document;
  const webkitVideo = media;
  if (webkitVideo.webkitPresentationMode === "fullscreen" && isFunction(webkitVideo.webkitSetPresentationMode)) {
    webkitVideo.webkitSetPresentationMode("inline");
    return;
  }
  if (isFunction(doc.exitFullscreen)) return doc.exitFullscreen();
  if (isFunction(doc.webkitExitFullscreen)) return doc.webkitExitFullscreen();
  const video = media;
  if (isFunction(video.exitFullscreen)) return video.exitFullscreen();
}

// node_modules/@videojs/core/dist/default/dom/presentation/pip.js
function isPictureInPictureEnabled() {
  if (document.pictureInPictureEnabled) {
    const isSafari = /.*Version\/.*Safari\/.*/.test(navigator.userAgent);
    const isPWA = typeof matchMedia === "function" && matchMedia("(display-mode: standalone)").matches;
    return !isSafari || !isPWA;
  }
  const video = document.createElement("video");
  return isFunction(video.webkitSetPresentationMode);
}
function isPictureInPictureCapable(media) {
  if (isFunction(media.webkitSetPresentationMode)) return true;
  return isMediaPictureInPictureCapable(media);
}
function isPictureInPicture(media) {
  if (media.webkitPresentationMode === "picture-in-picture") return true;
  if (document.pictureInPictureElement === getRegisteredMedia(media)) return true;
  return media.isPictureInPicture ?? false;
}
async function requestPictureInPicture(media) {
  const webkitVideo = media;
  if (isFunction(webkitVideo.webkitSetPresentationMode)) {
    webkitVideo.webkitSetPresentationMode("picture-in-picture");
    return;
  }
  const video = media;
  if (isFunction(video.requestPictureInPicture)) return video.requestPictureInPicture();
}
async function exitPictureInPicture(media) {
  const webkitVideo = media;
  if (webkitVideo.webkitPresentationMode === "picture-in-picture" && isFunction(webkitVideo.webkitSetPresentationMode)) {
    webkitVideo.webkitSetPresentationMode("inline");
    return;
  }
  if (isFunction(document.exitPictureInPicture)) return document.exitPictureInPicture();
  const video = media;
  if (isFunction(video.exitPictureInPicture)) return video.exitPictureInPicture();
}

// node_modules/@videojs/core/dist/default/dom/store/features/fullscreen.js
var fullscreenFeature = definePlayerFeature({
  name: "fullscreen",
  state: ({ target }) => ({
    isFullscreen: false,
    fullscreenAvailability: "unavailable",
    async requestFullscreen() {
      const { media, container } = target();
      if (isPictureInPicture(media)) await exitPictureInPicture(media);
      return requestFullscreen(container, media);
    },
    async exitFullscreen() {
      const { media } = target();
      return exitFullscreen(media);
    }
  }),
  attach({ target, signal, set }) {
    const { media, container } = target;
    set({ fullscreenAvailability: isFullscreenEnabled() ? "available" : "unsupported" });
    const sync = () => set({ isFullscreen: isFullscreen(container, media) });
    sync();
    listen(document, "fullscreenchange", sync, { signal });
    listen(document, "webkitfullscreenchange", sync, { signal });
    if ("webkitPresentationMode" in media) listen(media, "webkitpresentationmodechanged", sync, { signal });
  }
});

// node_modules/@videojs/core/dist/default/dom/store/features/live.js
var liveFeature = definePlayerFeature({
  name: "live",
  state: () => ({
    liveEdgeStart: NaN,
    targetLiveWindow: NaN
  }),
  attach({ target, signal, set }) {
    const { media } = target;
    if (!isMediaLiveCapable(media)) return;
    const sync = () => set({
      liveEdgeStart: media.liveEdgeStart,
      targetLiveWindow: media.targetLiveWindow
    });
    sync();
    listen(media, "targetlivewindowchange", sync, { signal });
    listen(media, "streamtypechange", sync, { signal });
    listen(media, "loadedmetadata", sync, { signal });
    listen(media, "canplay", sync, { signal });
    listen(media, "progress", sync, { signal });
    listen(media, "durationchange", sync, { signal });
    listen(media, "timeupdate", sync, { signal });
    listen(media, "emptied", sync, { signal });
  }
});

// node_modules/@videojs/core/dist/default/dom/store/features/metadata.js
var MEDIA_TITLE = Symbol("@videojs/media-title");
var USER_TITLE = Symbol("@videojs/user-title");
var SET_USER_TITLE = Symbol("@videojs/set-user-title");
var DEFAULT_TITLE = "";
var MEDIA_POSTER = Symbol("@videojs/media-poster");
var USER_POSTER = Symbol("@videojs/user-poster");
var SET_USER_POSTER = Symbol("@videojs/set-user-poster");
var DEFAULT_POSTER = "";
var metadataFeature = definePlayerFeature({
  name: "metadata",
  config: {
    /** The title to display. Takes precedence over the title the media carries. */
    title: {
      action: SET_USER_TITLE,
      state: USER_TITLE,
      html: { attribute: "content-title" }
    },
    /** The poster to display. Takes precedence over the poster the media carries. */
    poster: {
      action: SET_USER_POSTER,
      state: USER_POSTER
    }
  },
  state: ({ set }) => ({
    [MEDIA_TITLE]: void 0,
    [USER_TITLE]: void 0,
    [SET_USER_TITLE]: (value) => set({ [USER_TITLE]: value }),
    [MEDIA_POSTER]: void 0,
    [USER_POSTER]: void 0,
    [SET_USER_POSTER]: (value) => set({ [USER_POSTER]: value })
  }),
  derived: {
    /** The resolved content title. Set it through the player, not through the store. */
    title: ({ get }) => get()[USER_TITLE] ?? get()[MEDIA_TITLE] ?? DEFAULT_TITLE,
    /**
    * The resolved poster URL, independent of the media component's own `poster`. Set it through the player, not
    * through the store.
    */
    poster: ({ get }) => get()[USER_POSTER] ?? get()[MEDIA_POSTER] ?? DEFAULT_POSTER
  },
  attach({ target, signal, set }) {
    const { media } = target;
    const sync = () => {
      const contentData = isMediaContentDataCapable(media) ? media.contentData : void 0;
      set({
        [MEDIA_TITLE]: contentData?.title,
        [MEDIA_POSTER]: contentData?.poster
      });
    };
    const bind = () => {
      sync();
      if (!isMediaContentDataCapable(media)) return;
      listen(media, "contentdatachange", sync, { signal });
    };
    bind();
    listen(media, "loadstart", bind, { signal });
  }
});

// node_modules/@videojs/core/dist/default/dom/store/features/pip.js
var pipFeature = definePlayerFeature({
  name: "pip",
  state: ({ target }) => ({
    isPictureInPicture: false,
    pictureInPictureAvailability: "unavailable",
    async requestPictureInPicture() {
      const { media, container } = target();
      if (!isPictureInPictureCapable(media)) return;
      if (!isMediaSourceCapable(media) || !hasMetadata(media)) throw new DOMException("The media has no video data yet.", "InvalidStateError");
      if (isFullscreen(container, media)) await exitFullscreen(media);
      return requestPictureInPicture(media);
    },
    async exitPictureInPicture() {
      const { media } = target();
      return exitPictureInPicture(media);
    }
  }),
  attach({ target, signal, set }) {
    const { media } = target;
    const supported = isPictureInPictureEnabled() && isPictureInPictureCapable(media);
    const sync = () => set({
      isPictureInPicture: isPictureInPicture(media),
      pictureInPictureAvailability: supported ? isMediaSourceCapable(media) && hasMetadata(media) ? "available" : "unavailable" : "unsupported"
    });
    sync();
    listen(media, "enterpictureinpicture", sync, { signal });
    listen(media, "leavepictureinpicture", sync, { signal });
    listen(media, "loadstart", sync, { signal });
    listen(media, "loadedmetadata", sync, { signal });
    listen(media, "emptied", sync, { signal });
    if ("webkitPresentationMode" in media) listen(media, "webkitpresentationmodechanged", sync, { signal });
  }
});

// node_modules/@videojs/core/dist/default/dom/store/features/playback.js
var playbackFeature = definePlayerFeature({
  name: "playback",
  state: ({ target, set }) => ({
    paused: true,
    ended: false,
    started: false,
    waiting: false,
    autoplay: false,
    autoplaying: false,
    play() {
      const { media } = target();
      if (!media.dispatchEvent(new Event("tyl-player-play-request", { cancelable: true }))) {
        return Promise.reject(new DOMException("Playback was cancelled.", "AbortError"));
      }
      const playing = media.play();
      if (isMediaPauseCapable(media) && !media.paused) set({
        paused: false,
        ended: false,
        started: true
      });
      return playing;
    },
    pause() {
      const { media } = target();
      if (isMediaPauseCapable(media)) {
        media.dispatchEvent(new Event("tyl-player-pause-request"));
        media.pause();
        set({
          paused: media.paused,
          autoplaying: false
        });
      }
    }
  }),
  attach({ target, signal, get, set }) {
    const { media } = target;
    if (!isMediaPauseCapable(media) || !isMediaSeekCapable(media) || !isMediaSourceCapable(media)) return;
    const autoplayEnabled = () => isMediaAutoplayCapable(media) && media.autoplay;
    let autoplayCheck;
    const cancelAutoplayCheck = () => {
      if (autoplayCheck !== void 0) cancelAnimationFrame(autoplayCheck);
      autoplayCheck = void 0;
    };
    const startAutoplay = () => {
      cancelAutoplayCheck();
      const autoplaying = autoplayEnabled() && !!(media.currentSrc || media.src) && media.paused && !media.ended && media.currentTime === 0 && media.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA;
      set({
        autoplay: autoplayEnabled(),
        autoplaying
      });
    };
    const refuseAutoplay = () => {
      if (get().autoplaying) set({ autoplaying: false });
    };
    const checkAutoplay = () => {
      if (!get().autoplaying) return;
      cancelAutoplayCheck();
      autoplayCheck = requestAnimationFrame(() => {
        autoplayCheck = requestAnimationFrame(() => {
          autoplayCheck = void 0;
          if (media.paused) refuseAutoplay();
        });
      });
    };
    signal.addEventListener("abort", cancelAutoplayCheck);
    let starvedAt = null;
    const sync = () => {
      const starved = (!isMediaErrorCapable(media) || !media.error) && media.readyState < HTMLMediaElement.HAVE_FUTURE_DATA && !media.paused;
      if (!starved) starvedAt = null;
      else starvedAt ??= media.currentTime;
      const started = !media.paused || media.currentTime > 0;
      set({
        paused: media.paused,
        ended: media.ended,
        started,
        waiting: starved && starvedAt === media.currentTime,
        autoplay: autoplayEnabled(),
        autoplaying: get().autoplaying && !started && !media.ended
      });
    };
    const starve = () => {
      starvedAt = media.currentTime;
      sync();
    };
    startAutoplay();
    sync();
    listen(media, "emptied", startAutoplay, { signal });
    listen(media, "loadstart", startAutoplay, { signal });
    listen(media, "canplaythrough", checkAutoplay, { signal });
    listen(media, "pause", refuseAutoplay, { signal });
    listen(media, "error", refuseAutoplay, { signal });
    listen(media, "emptied", starve, { signal });
    listen(media, "play", starve, { signal });
    listen(media, "pause", sync, { signal });
    listen(media, "error", sync, { signal });
    listen(media, "ended", sync, { signal });
    listen(media, "playing", sync, { signal });
    listen(media, "waiting", starve, { signal });
    listen(media, "seeking", starve, { signal });
    listen(media, "seeked", sync, { signal });
    listen(media, "canplay", sync, { signal });
    listen(media, "timeupdate", sync, { signal });
  }
});

// node_modules/@videojs/core/dist/default/core/ui/utils/playback-rates.js
var NATIVE_PLAYBACK_RATE_RANGE = {
  min: 0.0625,
  max: 16
};
function getPlaybackRateRange(media) {
  return media?.playbackRateRange ?? NATIVE_PLAYBACK_RATE_RANGE;
}
function parsePlaybackRates(value) {
  const candidates = isString(value) ? value.trim().split(/\s+/).map(Number) : value ?? [];
  const rates = [...new Set(candidates.filter((rate) => Number.isFinite(rate) && rate > 0))];
  return rates.length > 0 ? rates : void 0;
}
function insertPlaybackRate(rates, rate) {
  if (rates.includes(rate)) return rates;
  const index = rates.findIndex((candidate) => candidate > rate);
  if (index === -1) return [...rates, rate];
  return [
    ...rates.slice(0, index),
    rate,
    ...rates.slice(index)
  ];
}
function filterPlaybackRates(rates, { min, max }) {
  return rates.filter((rate) => rate >= min && rate <= max);
}
function roundPlaybackRate(rate) {
  return Math.round(rate * 1e5) / 1e5;
}

// node_modules/@videojs/utils/dist/number/number.js
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function toPercent(value, min, max) {
  const range = max - min;
  if (!Number.isFinite(range) || range <= 0) return 0;
  return clamp((value - min) / range * 100, 0, 100);
}
function roundToStep(value, step, min) {
  const nearest = Math.round((value - min) / step) * step + min;
  const dot = `${step}`.indexOf(".");
  return dot === -1 ? nearest : Number(nearest.toFixed(`${step}`.length - dot - 1));
}

// node_modules/@videojs/core/dist/default/dom/store/features/playback-rate.js
var DEFAULT_RATES = [
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  1.75,
  2
];
var DEFAULT_PLAYBACK_RATES = Symbol("@videojs/default-playback-rates");
var SET_DEFAULT_PLAYBACK_RATES = Symbol("@videojs/set-default-playback-rates");
var PLAYBACK_RATE_RANGE = Symbol("@videojs/playback-rate-range");
function fitPlaybackRates(rates, range) {
  const fitted = filterPlaybackRates(rates, range);
  if (fitted.length > 0) return fitted;
  const defaults2 = filterPlaybackRates(DEFAULT_RATES, range);
  if (defaults2.length > 0) return defaults2;
  return [clamp(1, range.min, range.max)];
}
var playbackRateFeature = definePlayerFeature({
  name: "playbackRate",
  config: {
    /**
    * Rates the player's controls offer, in the order they cycle through them, unless a control sets its own `rates`.
    * HTML takes a space-separated list, such as `default-playback-rates="0.5 1 1.5 2"`. Missing or empty input
    * restores the defaults. Rates outside the media's range are left out, so YouTube, which plays up to `2`, may offer
    * fewer.
    */
    defaultPlaybackRates: {
      action: SET_DEFAULT_PLAYBACK_RATES,
      state: DEFAULT_PLAYBACK_RATES
    }
  },
  state: ({ target, get, set }) => ({
    [DEFAULT_PLAYBACK_RATES]: DEFAULT_RATES,
    [SET_DEFAULT_PLAYBACK_RATES]: (value) => {
      const rates = parsePlaybackRates(value) ?? DEFAULT_RATES;
      set({ [DEFAULT_PLAYBACK_RATES]: rates });
    },
    [PLAYBACK_RATE_RANGE]: NATIVE_PLAYBACK_RATE_RANGE,
    playbackRate: 1,
    playbackRateAvailability: "unavailable",
    setPlaybackRate(rate) {
      const { media } = target();
      if (!isMediaPlaybackRateCapable(media)) return;
      const { min, max } = getPlaybackRateRange(media);
      media.playbackRate = clamp(rate, min, max);
    }
  }),
  derived: {
    /**
    * The default rates that fit the media's range. Set them through the player, not through the store. They are listed
    * even when the media cannot change its rate, so check `playbackRateAvailability` before offering them.
    */
    playbackRates: ({ get }) => fitPlaybackRates(get()[DEFAULT_PLAYBACK_RATES], get()[PLAYBACK_RATE_RANGE])
  },
  attach({ target, signal, get, set }) {
    const { media } = target;
    const syncRange = () => {
      const range = getPlaybackRateRange(media);
      const current = get()[PLAYBACK_RATE_RANGE];
      if (range.min === current.min && range.max === current.max) return;
      set({ [PLAYBACK_RATE_RANGE]: range });
    };
    syncRange();
    listen(media, "loadstart", syncRange, { signal });
    if (!isMediaPlaybackRateCapable(media)) {
      set({
        playbackRate: 1,
        playbackRateAvailability: "unsupported"
      });
      return;
    }
    const sync = () => set({ playbackRate: roundPlaybackRate(media.playbackRate) });
    set({ playbackRateAvailability: "available" });
    sync();
    listen(media, "ratechange", sync, { signal });
  }
});

// node_modules/@videojs/core/dist/default/dom/store/features/quality.js
var QUALITY_AUTO_VALUE = "auto";
function getRenditionValue(rendition, index) {
  return rendition.id || String(index);
}
function toMediaRendition(rendition, index) {
  return {
    id: getRenditionValue(rendition, index),
    ...rendition.width !== void 0 && { width: rendition.width },
    ...rendition.height !== void 0 && { height: rendition.height },
    ...rendition.bitrate !== void 0 && { bitrate: rendition.bitrate },
    ...rendition.frameRate !== void 0 && { frameRate: rendition.frameRate },
    ...rendition.codec !== void 0 && { codec: rendition.codec },
    selected: rendition.selected
  };
}
function getSize(rendition) {
  if (rendition.width && rendition.height) return Math.min(rendition.width, rendition.height);
  return rendition.height ?? rendition.width;
}
var qualityFeature = definePlayerFeature({
  name: "quality",
  state: ({ target }) => ({
    videoRenditionList: [],
    activeVideoRendition: null,
    selectVideoRendition(value) {
      const { media } = target();
      if (!isMediaVideoRenditionCapable(media)) return;
      if (value === QUALITY_AUTO_VALUE) {
        media.videoRenditions.selectedIndex = -1;
        return;
      }
      const index = [...media.videoRenditions].findIndex((rendition, renditionIndex) => getRenditionValue(rendition, renditionIndex) === value);
      if (index !== -1) media.videoRenditions.selectedIndex = index;
    }
  }),
  attach({ target, signal, set }) {
    const { media } = target;
    let videoRenditions = null;
    let cleanup = null;
    const getVideoRenditions = () => isMediaVideoRenditionCapable(media) ? media.videoRenditions : null;
    const getActiveRendition = (list) => {
      if (!list) return null;
      const renditions = [...list];
      const active = renditions.find((rendition) => rendition.active);
      if (active) return active;
      if (!isMediaVideoDimensionsCapable(media) || !media.videoWidth && !media.videoHeight) return null;
      const size = getSize({
        width: media.videoWidth || void 0,
        height: media.videoHeight || void 0
      });
      const matches = renditions.filter((rendition) => getSize(rendition) === size);
      return matches.length === 1 ? matches[0] : null;
    };
    const sync = (list = getVideoRenditions()) => {
      const renditions = list ? [...list] : [];
      const active = getActiveRendition(list);
      set({
        videoRenditionList: renditions.map(toMediaRendition),
        activeVideoRendition: active ? toMediaRendition(active, renditions.indexOf(active)) : null
      });
    };
    const bind = () => {
      const nextVideoRenditions = getVideoRenditions();
      if (nextVideoRenditions === videoRenditions) {
        sync(nextVideoRenditions);
        return;
      }
      cleanup?.abort();
      cleanup = new AbortController();
      videoRenditions = nextVideoRenditions;
      if (videoRenditions) {
        listen(videoRenditions, "addrendition", () => sync(videoRenditions), { signal: cleanup.signal });
        listen(videoRenditions, "removerendition", () => sync(videoRenditions), { signal: cleanup.signal });
        listen(videoRenditions, "change", () => sync(videoRenditions), { signal: cleanup.signal });
        listen(videoRenditions, "activechange", () => sync(videoRenditions), { signal: cleanup.signal });
      }
      sync(videoRenditions);
    };
    bind();
    listen(media, "loadstart", bind, { signal });
    listen(media, "resize", () => sync(videoRenditions), { signal });
    signal.addEventListener("abort", () => cleanup?.abort(), { once: true });
  }
});

// node_modules/@videojs/core/dist/default/dom/store/features/remote-playback.js
var remotePlaybackFeature = definePlayerFeature({
  name: "remotePlayback",
  state: ({ target }) => ({
    remotePlaybackState: "disconnected",
    remotePlaybackAvailability: "unsupported",
    async promptRemotePlayback() {
      const { media, container } = target();
      if (isRemotePlaybackConnected(media)) return requestRemotePlayback(media);
      if (isFullscreen(container, media)) await exitFullscreen(media);
      if (media instanceof HTMLElement && media.localName === "hlsjs-video") {
        const loading = media.adapter.prepareRemotePlayback();
        const prompt = requestRemotePlayback(media);
        return (await Promise.all([loading, prompt]))[1];
      }
      return await requestRemotePlayback(media);
    }
  }),
  attach({ target, signal, set }) {
    const { media } = target;
    if (!isMediaRemotePlaybackCapable(media)) return;
    if (isWebKitAirPlayCapable(media)) {
      const syncConnection = () => {
        set({ remotePlaybackState: media.webkitCurrentPlaybackTargetIsWireless ? "connected" : "disconnected" });
      };
      const syncAvailability = (event) => {
        const { availability } = event;
        set({ remotePlaybackAvailability: availability === "available" ? "available" : "unavailable" });
      };
      listen(media, "webkitplaybacktargetavailabilitychanged", syncAvailability, { signal });
      listen(media, "webkitcurrentplaybacktargetiswirelesschanged", syncConnection, { signal });
      syncConnection();
      return;
    }
    const syncState = () => set({ remotePlaybackState: media.remote.state });
    syncState();
    listen(media.remote, "connect", syncState, { signal });
    listen(media.remote, "connecting", syncState, { signal });
    listen(media.remote, "disconnect", syncState, { signal });
    media.remote.watchAvailability((available) => {
      set({ remotePlaybackAvailability: available ? "available" : "unavailable" });
    }).catch(() => {
      set({ remotePlaybackAvailability: "unsupported" });
    });
    signal.addEventListener("abort", () => {
      media.remote?.cancelWatchAvailability?.()?.catch(noop);
    });
  }
});

// node_modules/@videojs/core/dist/default/dom/store/features/source.js
var sourceFeature = definePlayerFeature({
  name: "source",
  state: () => ({
    currentSrc: "",
    canPlay: false
  }),
  attach({ target, signal, set }) {
    const { media } = target;
    if (!isMediaSourceCapable(media)) return;
    const sync = () => set({
      currentSrc: media.currentSrc,
      canPlay: (!isMediaErrorCapable(media) || !media.error) && media.readyState >= MediaReadyState.HAVE_FUTURE_DATA
    });
    sync();
    listen(media, "canplay", sync, { signal });
    listen(media, "canplaythrough", sync, { signal });
    listen(media, "loadstart", sync, { signal });
    listen(media, "emptied", sync, { signal });
    listen(media, "loadedmetadata", sync, { signal });
    listen(media, "waiting", sync, { signal });
    listen(media, "playing", sync, { signal });
    listen(media, "error", sync, { signal });
  }
});

// node_modules/@videojs/core/dist/default/dom/store/features/stream-type.js
var streamTypeFeature = definePlayerFeature({
  name: "streamType",
  state: () => ({ streamType: MediaStreamTypes.UNKNOWN }),
  attach({ target, signal, set }) {
    const { media } = target;
    if (isMediaStreamTypeCapable(media)) {
      const sync2 = () => set({ streamType: media.streamType });
      sync2();
      listen(media, "streamtypechange", sync2, { signal });
      return;
    }
    if (!isMediaSeekCapable(media)) return;
    const detect = () => {
      const { duration } = media;
      if (duration === Number.POSITIVE_INFINITY) return MediaStreamTypes.LIVE;
      if (Number.isFinite(duration) && duration > 0) return MediaStreamTypes.ON_DEMAND;
      return MediaStreamTypes.UNKNOWN;
    };
    const sync = () => set({ streamType: detect() });
    sync();
    listen(media, "durationchange", sync, { signal });
    listen(media, "loadedmetadata", sync, { signal });
    listen(media, "emptied", sync, { signal });
    if (isMediaBufferCapable(media)) listen(media, "progress", sync, { signal });
  }
});

// node_modules/@videojs/core/dist/default/core/i18n/utils/flatten.js
function flattenTranslations(locale, options = {}) {
  return flatten(locale, options);
}

// node_modules/@videojs/core/dist/default/core/i18n/registry.js
var I18N_REGISTRY_KEY = Symbol.for("@videojs/i18n-registry");
function getRegistry() {
  const host = globalThis;
  const existing = host[I18N_REGISTRY_KEY];
  if (existing) return existing;
  const registry = {
    layers: /* @__PURE__ */ new Map(),
    subscribers: /* @__PURE__ */ new Set()
  };
  host[I18N_REGISTRY_KEY] = registry;
  return registry;
}
function notify() {
  for (const cb of getRegistry().subscribers) cb();
}
function normalizeLocaleTag(tag) {
  return tag.trim().replaceAll("_", "-").toLowerCase();
}
function stripUnicodeExtensions(tag) {
  const xIdx = tag.indexOf("-x-");
  const uIdx = (xIdx === -1 ? tag : tag.slice(0, xIdx)).indexOf("-u-");
  if (uIdx === -1) return tag;
  return tag.slice(0, uIdx) + (xIdx === -1 ? "" : tag.slice(xIdx));
}
function chineseFallback(segments) {
  if (segments[0] !== "zh") return;
  const script = segments.find((segment) => segment === "hant" || segment === "hans");
  return script === "hant" ? "zh-tw" : script === "hans" ? "zh-cn" : void 0;
}
function getLocaleKey(locale) {
  return stripUnicodeExtensions(normalizeLocaleTag(locale));
}
function findLocaleKeys(locale) {
  const base = getLocaleKey(locale);
  if (!base) return [DEFAULT_LOCALE];
  const segments = base.split("-").filter(Boolean);
  const chain = [];
  for (let len = segments.length; len >= 1; len--) chain.push(segments.slice(0, len).join("-"));
  const zhFallback = chineseFallback(segments);
  const zhIndex = chain.indexOf("zh");
  if (zhFallback && zhIndex !== -1) chain.splice(zhIndex, 0, zhFallback);
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const tag of chain) if (!seen.has(tag)) {
    seen.add(tag);
    out.push(tag);
  }
  if (!seen.has(DEFAULT_LOCALE)) out.push(DEFAULT_LOCALE);
  return out;
}
function mergeI18nTranslations(chain) {
  const { layers } = getRegistry();
  const merged = {};
  for (let i2 = chain.length - 1; i2 >= 0; i2--) {
    const tag = chain[i2];
    const layer = layers.get(tag);
    if (layer) Object.assign(merged, layer);
  }
  return merged;
}
function registerI18n(locale, translations) {
  const { layers } = getRegistry();
  const tag = getLocaleKey(locale);
  const existing = layers.get(tag) ?? {};
  layers.set(tag, {
    ...existing,
    ...flattenTranslations(translations)
  });
  notify();
}
function getI18nTranslations(locale) {
  return mergeI18nTranslations(findLocaleKeys(locale));
}
function onI18nRegistryChange(callback) {
  const { subscribers } = getRegistry();
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}
function hasRegisteredLocale(locale) {
  return getRegistry().layers.has(getLocaleKey(locale));
}

// node_modules/@videojs/core/dist/default/i18n/locales/en.js
var en_default = {
  buttons: {
    play: "Play",
    pause: "Pause",
    replay: "Replay",
    mute: "Mute",
    unmute: "Unmute"
  },
  seek: {
    forward: "Seek forward {seconds} seconds",
    backward: "Seek backward {seconds} seconds"
  },
  fullscreen: {
    enter: "Enter fullscreen",
    exit: "Exit fullscreen"
  },
  captions: {
    enable: "Enable captions",
    disable: "Disable captions"
  },
  pip: {
    enter: "Enter picture-in-picture",
    exit: "Exit picture-in-picture"
  },
  live: {
    playing: "Playing live",
    seekToEdge: "Seek to live edge",
    badge: "Live"
  },
  cast: {
    start: "Start casting",
    stop: "Stop casting",
    connecting: "Connecting"
  },
  airplay: {
    start: "Start AirPlay",
    stop: "Stop AirPlay"
  },
  slider: { seek: "Seek" },
  time: {
    current: "Current time",
    duration: "Duration",
    remaining: "Remaining",
    elapsedSuffix: "{duration} elapsed",
    durationSuffix: "{duration} duration",
    remainingSuffix: "{duration} remaining",
    showElapsed: "Show elapsed time, {duration}.",
    showDuration: "Show duration, {duration}.",
    showRemaining: "Show remaining time, {duration}.",
    toggleElapsed: "Toggle between elapsed and remaining time.",
    toggleDuration: "Toggle between duration and remaining time.",
    position: "{current} of {duration}",
    unknown: "Media not loaded, unknown time."
  },
  playback: { rate: "Playback rate, {rate}" },
  volume: {
    mutedValue: "{percent}, muted",
    muted: "Muted",
    label: "Volume",
    value: "Volume {value}"
  },
  status: {
    captionsOn: "Captions on",
    captionsOff: "Captions off",
    paused: "Paused",
    playing: "Playing",
    fullscreen: "Fullscreen",
    pip: "Picture in picture",
    exitPip: "Exit picture in picture",
    seekedTo: "Seeked to {time}"
  },
  container: { label: "Media player" },
  errors: {
    aborted: "You stopped media playback before it finished.",
    network: "This media could not be loaded due to a network or server issue.",
    decode: "This media could not be played. It may be corrupted, or your browser may not support its format.",
    source: "This media could not be loaded. It may be unavailable, or your browser may not support its format.",
    encrypted: "This media could not be played because it could not be decrypted.",
    unplayable: "This media is unsupported by the player.",
    title: "Something went wrong.",
    unexpected: "An unexpected error occurred."
  },
  common: {
    empty: "",
    ok: "OK"
  },
  menu: {
    settings: "Settings",
    quality: "Quality",
    audio: "Audio",
    default: "Default",
    speed: "Speed",
    captions: "Captions",
    playbackRate: "Playback rate",
    customRate: "Custom, {rate}",
    back: "Back",
    off: "Off",
    auto: "Auto",
    autoWithLabel: "Auto ({label})",
    subtitles: "Subtitles"
  }
};

// node_modules/@videojs/core/dist/default/core/i18n/browser-translation.js
var NAMED_PLACEHOLDER = /\{([^{}]+)\}/g;
var INDEX_PLACEHOLDER = /\{\s*(\d+)\s*\}/g;
function maskNamedPlaceholders(source) {
  const slots = [];
  return {
    masked: source.replace(NAMED_PLACEHOLDER, (_, name) => {
      slots.push(name);
      return `{${slots.length - 1}}`;
    }),
    slots
  };
}
function restoreNamedPlaceholders(translated, slots) {
  return translated.replace(INDEX_PLACEHOLDER, (match, index) => {
    const name = slots[Number(index)];
    return name !== void 0 ? `{${name}}` : match;
  });
}
async function translateProtectingPlaceholders(translator, value) {
  const { masked, slots } = maskNamedPlaceholders(value);
  if (slots.length === 0) return translator.translate(value);
  return restoreNamedPlaceholders(await translator.translate(masked), slots);
}
var cache2 = /* @__PURE__ */ new Map();
function getBrowserTranslator() {
  if (!("Translator" in globalThis)) return void 0;
  return globalThis.Translator;
}
function resolveBrowserTranslationTarget(locale) {
  for (const tag of findLocaleKeys(locale)) if (!isDefaultLocale(tag)) return tag;
}
function shouldAttemptBrowserTranslation(locale, loadedLazyTags, translations) {
  if (!resolveBrowserTranslationTarget(locale)) return false;
  if (loadedLazyTags.some((tag) => !isDefaultLocale(tag))) return translations !== void 0 && hasMissingEnglishTranslations(translations);
  return !findLocaleKeys(locale).some((tag) => !isDefaultLocale(tag) && hasRegisteredLocale(tag));
}
function hasMissingEnglishTranslations(translations) {
  const english = flattenTranslations(en_default);
  return Object.keys(english).some((key) => translations[key] === void 0);
}
async function getBrowserTranslations(locale, options) {
  const target = resolveBrowserTranslationTarget(locale);
  if (!target) return {};
  const cached = cache2.get(target);
  if (cached) return cached;
  const Translator = getBrowserTranslator();
  if (!Translator) return {};
  const downloadIfNeeded = options?.downloadIfNeeded ?? false;
  const availability = await Translator.availability({
    sourceLanguage: DEFAULT_LOCALE,
    targetLanguage: target
  });
  if (availability === "unavailable") return {};
  if (!downloadIfNeeded && availability !== "available") return {};
  const needsDownload = downloadIfNeeded && (availability === "downloadable" || availability === "downloading");
  let downloadStarted = false;
  const notifyDownloadStart = () => {
    if (!needsDownload || downloadStarted) return;
    downloadStarted = true;
    options?.onModelDownload?.start?.(target);
  };
  notifyDownloadStart();
  const english = flattenTranslations(en_default);
  const keys = Object.keys(english);
  const translator = await Translator.create({
    sourceLanguage: DEFAULT_LOCALE,
    targetLanguage: target,
    ...downloadIfNeeded ? { monitor(monitor) {
      monitor.addEventListener("downloadprogress", notifyDownloadStart);
    } } : {}
  });
  if (downloadStarted) options?.onModelDownload?.finish?.(target);
  const entries = await Promise.all(keys.map(async (key) => {
    const value = english[key];
    if (!value) return [key, ""];
    return [key, await translateProtectingPlaceholders(translator, value)];
  }));
  const result = Object.fromEntries(entries);
  cache2.set(target, result);
  return result;
}

// node_modules/@videojs/core/dist/default/core/i18n/load-locale.js
var loaders = {
  ar: () => import("./chunks/ar-DG2AVKKI.min.js"),
  az: () => import("./chunks/az-S7CFOWDD.min.js"),
  bs: () => import("./chunks/bs-SS2WKRR6.min.js"),
  bg: () => import("./chunks/bg-ZOUBTJ5U.min.js"),
  bn: () => import("./chunks/bn-2RE7R7YD.min.js"),
  ca: () => import("./chunks/ca-ZYWJFGKA.min.js"),
  cs: () => import("./chunks/cs-JVG2QP5C.min.js"),
  cy: () => import("./chunks/cy-F6FAXP6W.min.js"),
  da: () => import("./chunks/da-HZDQXYHL.min.js"),
  de: () => import("./chunks/de-N6K2UZNU.min.js"),
  el: () => import("./chunks/el-EUB4KP4A.min.js"),
  es: () => import("./chunks/es-SVVPGWSO.min.js"),
  et: () => import("./chunks/et-6XTUOTOE.min.js"),
  eu: () => import("./chunks/eu-REJCV7D2.min.js"),
  fa: () => import("./chunks/fa-TKTY3RS7.min.js"),
  fi: () => import("./chunks/fi-KC4XLBQX.min.js"),
  fr: () => import("./chunks/fr-GHH7EVHS.min.js"),
  gd: () => import("./chunks/gd-CAZ7WW22.min.js"),
  gl: () => import("./chunks/gl-VPOXFO5F.min.js"),
  he: () => import("./chunks/he-5UOVB4S7.min.js"),
  hi: () => import("./chunks/hi-OILHXSOC.min.js"),
  hr: () => import("./chunks/hr-AZCSQONK.min.js"),
  hu: () => import("./chunks/hu-QPP5KQPF.min.js"),
  id: () => import("./chunks/id-PE5G6SOF.min.js"),
  it: () => import("./chunks/it-KE66Y665.min.js"),
  ja: () => import("./chunks/ja-PS4QJ5R6.min.js"),
  ko: () => import("./chunks/ko-Q5TKIV6Y.min.js"),
  lt: () => import("./chunks/lt-IWL3TMNT.min.js"),
  lv: () => import("./chunks/lv-E2VUPHGH.min.js"),
  mr: () => import("./chunks/mr-EQC3PTWI.min.js"),
  nb: () => import("./chunks/nb-BLV5EGSP.min.js"),
  nl: () => import("./chunks/nl-AIXUGKFL.min.js"),
  nn: () => import("./chunks/nn-SMEMDDX5.min.js"),
  ne: () => import("./chunks/ne-6UDUKDBT.min.js"),
  oc: () => import("./chunks/oc-VLFGN3H7.min.js"),
  pl: () => import("./chunks/pl-SRAGA75A.min.js"),
  "pt-br": () => import("./chunks/pt-BR-C2L3K3P5.min.js"),
  "pt-pt": () => import("./chunks/pt-PT-4CTNFHQY.min.js"),
  ro: () => import("./chunks/ro-P3OJ7NAD.min.js"),
  ru: () => import("./chunks/ru-6O2B3HGL.min.js"),
  sk: () => import("./chunks/sk-PKCFUQYX.min.js"),
  sl: () => import("./chunks/sl-AMJEH4AI.min.js"),
  sr: () => import("./chunks/sr-FNGDSOGT.min.js"),
  sv: () => import("./chunks/sv-UND63WK7.min.js"),
  te: () => import("./chunks/te-U6WFK55I.min.js"),
  th: () => import("./chunks/th-NCJ5CTRD.min.js"),
  tr: () => import("./chunks/tr-PPUHV5FY.min.js"),
  uk: () => import("./chunks/uk-G4XZ2FGJ.min.js"),
  vi: () => import("./chunks/vi-D5RJETA3.min.js"),
  "zh-cn": () => import("./chunks/zh-CN-EJG4YV7C.min.js"),
  "zh-tw": () => import("./chunks/zh-TW-LTOFMNEY.min.js"),
  pt: () => import("./chunks/pt-WCBNVT5W.min.js"),
  zh: () => import("./chunks/zh-TYT3YDJ5.min.js")
};
async function loadLocale(tag) {
  if (hasRegisteredLocale(tag)) return void 0;
  for (const chainTag of findLocaleKeys(tag)) {
    if (hasRegisteredLocale(chainTag)) return void 0;
    const load = loaders[getLocaleKey(chainTag)];
    if (load) return flattenTranslations((await load()).default);
  }
}

// node_modules/@videojs/core/dist/default/core/i18n/resolve-text.js
function resolveText(text) {
  return typeof text === "string" ? text : text.text;
}

// node_modules/@videojs/core/dist/default/core/i18n/text.js
function isText(value) {
  return isObject(value) && "key" in value && "text" in value;
}

// node_modules/@videojs/core/dist/default/core/i18n/utils/interpolate.js
var PLACEHOLDER = /\{([^{}]+)\}/g;
function interpolate(template3, params) {
  if (!params) return template3;
  return template3.replace(PLACEHOLDER, (match, name) => {
    return Object.hasOwn(params, name) ? String(params[name]) : match;
  });
}

// node_modules/@videojs/core/dist/default/core/i18n/translate-text.js
function translateText(text, translatorOrParams, params) {
  if (typeof text === "string") return text;
  if (typeof translatorOrParams === "function") return translatorOrParams(text, params);
  return interpolate(resolveText(text), translatorOrParams ?? params);
}

// node_modules/@videojs/core/dist/default/core/i18n/translator.js
function createTranslator(translations, locale) {
  const translate = (input, params) => {
    const options = params;
    const isDescriptor = typeof input !== "string";
    const key = isDescriptor ? input.key : input;
    const translation = translations[key];
    const fallback = options?.default;
    const values = options ? { ...options } : void 0;
    if (values) delete values.default;
    const raw = translation ?? (isDescriptor ? input.text : fallback) ?? String(key);
    return interpolate(raw, values);
  };
  return translate;
}

// node_modules/@videojs/core/dist/default/dom/store/text-cues.js
function clampCuesToDuration(cues, duration) {
  if (!cues) return [];
  const max = Number.isFinite(duration) && duration > 0 ? duration : Number.POSITIVE_INFINITY;
  return Array.from(cues, (cue) => ({
    startTime: cue.startTime,
    endTime: Math.min(cue.endTime, max),
    text: cue.text ?? ""
  }));
}

// node_modules/@videojs/core/dist/default/dom/store/features/text-track.js
function getTrackId(track, index) {
  return track.id || `track:${index}:${track.kind}:${track.language}:${track.label}`;
}
function getSubtitlesTracks(media) {
  return getCaptionOrSubtitleTracks(Array.from(media.textTracks, (track, index) => ({
    id: getTrackId(track, index),
    kind: track.kind,
    track
  })));
}
function showOnly(tracks, active) {
  for (const { track } of tracks) {
    const mode = track === active ? "showing" : "disabled";
    if (track.mode !== mode) track.mode = mode;
  }
}
function findLocaleTrack(tracks, locale) {
  const localeKey = getLocaleKey(locale);
  const keys = findLocaleKeys(locale);
  if (localeKey !== DEFAULT_LOCALE && !localeKey.startsWith(`${DEFAULT_LOCALE}-`)) keys.pop();
  for (const key of keys) {
    const exact = tracks.find(({ track }) => getLocaleKey(track.language) === key);
    if (exact) return exact;
    const regional = tracks.find(({ track }) => getLocaleKey(track.language).startsWith(`${key}-`));
    if (regional) return regional;
  }
}
var textTrackFeature = definePlayerFeature({
  name: "textTrack",
  state: ({ target }) => {
    let lastShownId = null;
    return {
      textTrackList: [],
      subtitlesShowing: false,
      toggleSubtitles(forceShow) {
        const { media } = target();
        if (!isMediaTextTrackCapable(media)) return false;
        const subtitlesTracks = getSubtitlesTracks(media);
        const showing = subtitlesTracks.find(({ track }) => track.mode === "showing");
        const nextShowing = forceShow ?? !showing;
        if (!nextShowing && media.textTracks instanceof EventTarget) media.textTracks.dispatchEvent(new Event("tyl-player-captions-off-request"));
        if (!subtitlesTracks.length) return false;
        if (showing) lastShownId = showing.id;
        if (!nextShowing) {
          showOnly(subtitlesTracks, null);
          return false;
        }
        const next = showing ?? subtitlesTracks.find(({ id }) => id === lastShownId) ?? findLocaleTrack(subtitlesTracks, globalThis.navigator?.language ?? "") ?? subtitlesTracks[0];
        lastShownId = next.id;
        showOnly(subtitlesTracks, next.track);
        return true;
      },
      selectSubtitlesTrack(id) {
        const { media } = target();
        if (!isMediaTextTrackCapable(media)) return;
        if (isNull(id) && media.textTracks instanceof EventTarget) media.textTracks.dispatchEvent(new Event("tyl-player-captions-off-request"));
        const subtitlesTracks = getSubtitlesTracks(media);
        if (!subtitlesTracks.length) return;
        if (isNull(id)) {
          const showing = subtitlesTracks.find(({ track }) => track.mode === "showing");
          if (showing) lastShownId = showing.id;
          showOnly(subtitlesTracks, null);
          return;
        }
        const active = subtitlesTracks.find((entry) => entry.id === id);
        if (!active) return;
        lastShownId = active.id;
        showOnly(subtitlesTracks, active.track);
      },
      chaptersCues: [],
      thumbnailsTrack: null
    };
  },
  attach({ target, signal, set }) {
    const { media } = target;
    if (!isMediaTextTrackCapable(media)) return;
    let trackCleanup = null;
    const sync = () => {
      trackCleanup?.abort();
      trackCleanup = new AbortController();
      let chaptersTrack = null;
      let thumbnailsTextTrack = null;
      const textTrackList = [];
      let subtitlesShowing = false;
      for (let i2 = 0; i2 < media.textTracks.length; i2++) {
        const track = media.textTracks[i2];
        if (!chaptersTrack && track.kind === "chapters") chaptersTrack = track;
        if (!thumbnailsTextTrack && track.kind === "metadata" && track.label === "thumbnails") thumbnailsTextTrack = track;
        textTrackList.push({
          id: getTrackId(track, i2),
          kind: track.kind,
          label: track.label,
          language: track.language,
          mode: track.mode
        });
        if (isCaptionOrSubtitleTrack(track) && track.mode === "showing") subtitlesShowing = true;
      }
      const chaptersCues = clampCuesToDuration(chaptersTrack?.cues, isMediaSeekCapable(media) ? media.duration : NaN);
      let thumbnailsTrack = null;
      if (thumbnailsTextTrack) thumbnailsTrack = {
        cues: thumbnailsTextTrack.cues ? Array.from(thumbnailsTextTrack.cues) : [],
        src: findTrackElement(media, thumbnailsTextTrack)?.src ?? null,
        crossOrigin: isMediaSourceCapable(media) ? toMediaCrossOrigin(media.crossOrigin) : null
      };
      const tracks = isQuerySelectorAllCapable(media) && media.querySelectorAll("track") || [];
      const shadowTracks = media instanceof HTMLElement && media.shadowRoot?.querySelectorAll("track") || [];
      for (const trackEl of [...tracks, ...shadowTracks]) if (!trackEl.track?.cues?.length) listen(trackEl, "load", sync, { signal: trackCleanup.signal });
      set({
        textTrackList,
        subtitlesShowing,
        chaptersCues,
        thumbnailsTrack
      });
    };
    sync();
    const textTracks = media.textTracks;
    if (textTracks instanceof EventTarget) {
      listen(textTracks, "addtrack", sync, { signal });
      listen(textTracks, "removetrack", sync, { signal });
      listen(textTracks, "change", sync, { signal });
    }
    listen(media, "loadstart", sync, { signal });
    listen(media, "durationchange", sync, { signal });
    signal.addEventListener("abort", () => trackCleanup?.abort(), { once: true });
  }
});

// node_modules/@videojs/core/dist/default/dom/store/signal-keys.js
var signalKeys = { seek: Symbol.for("@videojs/seek") };

// node_modules/@videojs/core/dist/default/dom/store/features/time.js
var timeFeature = definePlayerFeature({
  name: "time",
  state: ({ target, signals, set }) => ({
    currentTime: 0,
    duration: 0,
    seeking: false,
    async seek(time) {
      const { media } = target(), signal = signals.supersede(signalKeys.seek);
      if (!isMediaSeekCapable(media) || !isMediaSourceCapable(media)) return 0;
      if (!Number.isFinite(time) || isMediaErrorCapable(media) && media.error) return media.currentTime;
      listen(media, "error", () => signals.supersede(signalKeys.seek), { signal, once: true });
      const seekSource = media.src;
      let awaitingYouTubeMetadata = media instanceof HTMLElement && media.localName === "youtube-video" && !hasMetadata(media);
      listen(media, "emptied", () => {
        if (awaitingYouTubeMetadata && media.src === seekSource) return;
        signals.supersede(signalKeys.seek);
      }, { signal });
      if (!hasMetadata(media)) {
        const metadata = onEvent(media, "loadedmetadata", { signal }).catch(() => false);
        if ((media instanceof HTMLMediaElement || media instanceof HTMLElement && (media.localName === "hlsjs-video" || media.localName === "youtube-video")) && media.preload === "none") {
          media.preload = "metadata";
        }
        const ready = await metadata;
        awaitingYouTubeMetadata = false;
        if (!ready || signal.aborted) return media.currentTime;
      }
      if (signal.aborted || media.src !== seekSource || !hasMetadata(media)) return media.currentTime;
      const ranges = isMediaBufferCapable(media) ? media.seekable : null;
      if (media.duration === Infinity && !ranges?.length) return media.currentTime;
      let clampedTime = Math.max(0, Math.min(time, media.duration || Infinity));
      if (ranges?.length) {
        let closest = clampedTime, distance = Infinity;
        for (let i2 = 0; i2 < ranges.length; i2++) {
          const candidate = Math.max(ranges.start(i2), Math.min(clampedTime, ranges.end(i2)));
          const gap = Math.abs(candidate - clampedTime);
          if (gap < distance) {
            closest = candidate;
            distance = gap;
          }
        }
        clampedTime = closest;
      }
      if (clampedTime === media.currentTime && !media.seeking) {
        set({ currentTime: media.currentTime, seeking: false });
        return media.currentTime;
      }
      set({
        currentTime: clampedTime,
        seeking: true
      });
      if (signal.aborted || media.src !== seekSource || !hasMetadata(media)) return media.currentTime;
      media.currentTime = clampedTime;
      await onEvent(media, "seeked", { signal }).catch(noop);
      return media.currentTime;
    }
  }),
  attach({ target, signal, set, get }) {
    const { media } = target;
    if (!isMediaSeekCapable(media)) return;
    const resolveDuration = () => {
      const { duration } = media;
      if (duration === Number.POSITIVE_INFINITY && isMediaBufferCapable(media)) {
        const { seekable } = media;
        return seekable.length > 0 ? seekable.end(seekable.length - 1) : 0;
      }
      return Number.isFinite(duration) ? duration : 0;
    };
    const sync = () => set({
      currentTime: media.currentTime,
      duration: resolveDuration(),
      seeking: media.seeking
    });
    const syncUnlessSeeking = () => {
      if (get().seeking) return;
      sync();
    };
    let cancel;
    const stop = () => {
      cancel?.();
      cancel = void 0;
    };
    const frame = () => {
      if (!isMediaPauseCapable(media) || media.paused || media.ended) {
        stop();
        return;
      }
      const state = get();
      const currentTime = media.currentTime;
      if (!state.seeking && currentTime !== state.currentTime) set({ currentTime });
      cancel = animationFrame(frame);
    };
    const start = () => {
      if (!cancel && isMediaPauseCapable(media) && !media.paused && !media.ended) cancel = animationFrame(frame);
    };
    const finish = () => {
      stop();
      syncUnlessSeeking();
    };
    sync();
    start();
    signal.addEventListener("abort", stop, { once: true });
    listen(media, "play", start, { signal });
    listen(media, "playing", start, { signal });
    listen(media, "pause", finish, { signal });
    listen(media, "ended", finish, { signal });
    listen(media, "timeupdate", () => {
      if (!cancel || document.hidden) syncUnlessSeeking();
    }, { signal });
    listen(media, "durationchange", sync, { signal });
    listen(media, "seeking", sync, { signal });
    listen(media, "seeked", sync, { signal });
    listen(media, "loadedmetadata", sync, { signal });
    listen(media, "emptied", () => {
      stop();
      sync();
    }, { signal });
    listen(media, "progress", syncUnlessSeeking, { signal });
  }
});

// node_modules/@videojs/core/dist/default/dom/store/features/volume.js
var UNMUTE_VOLUME = 0.25;
var volumeFeature = definePlayerFeature({
  name: "volume",
  state: ({ target, get, set }) => {
    const isVolumeLocked = () => get().volumeAvailability === "unsupported";
    return {
      volume: 1,
      muted: false,
      volumeAvailability: "unavailable",
      mutedAvailability: "unavailable",
      setVolume(volume) {
        const { media } = target();
        if (!isMediaVolumeCapable(media)) return 0;
        const clamped = Math.max(0, Math.min(1, volume));
        if (clamped > 0 && media.muted) media.muted = false;
        if (!isVolumeLocked()) media.volume = clamped;
        set({
          volume: media.volume,
          muted: media.muted
        });
        return media.volume;
      },
      setMuted(muted) {
        const { media } = target();
        if (!isMediaMutedCapable(media)) return false;
        media.muted = muted;
        const volumeCapable = isMediaVolumeCapable(media);
        if (!muted && volumeCapable && !isVolumeLocked() && media.volume === 0) media.volume = UNMUTE_VOLUME;
        set({
          volume: volumeCapable ? media.volume : 1,
          muted: media.muted
        });
        return media.muted;
      }
    };
  },
  attach({ target, signal, set }) {
    const { media } = target;
    const volumeCapable = isMediaVolumeCapable(media);
    const mutedCapable = isMediaMutedCapable(media);
    if (!volumeCapable && !mutedCapable) return;
    set({
      volumeAvailability: volumeCapable ? canSetVolume() : "unavailable",
      mutedAvailability: mutedCapable ? "available" : "unavailable"
    });
    const sync = () => set({
      volume: volumeCapable ? media.volume : 1,
      muted: mutedCapable ? media.muted : false
    });
    sync();
    listen(media, "volumechange", sync, { signal });
  }
});
function canSetVolume() {
  const video = document.createElement("video");
  try {
    video.volume = 0.5;
    return video.volume === 0.5 ? "available" : "unsupported";
  } catch {
    return "unsupported";
  }
}

// node_modules/@videojs/store/dist/default/core/combine.js
function combine(...slices) {
  const derivedDefinitions = slices.map((slice) => slice.derived ?? {});
  return {
    state: (ctx) => {
      const states = slices.map((slice) => slice.state(ctx));
      return Object.assign({}, ...states);
    },
    preserve: Array.from(new Set(slices.flatMap((slice) => slice.preserve ?? []))),
    derived: Object.assign({}, ...derivedDefinitions),
    attach: (ctx) => {
      for (const slice of slices) try {
        slice.attach?.(ctx);
      } catch (err) {
        ctx.reportError(err);
      }
    }
  };
}

// node_modules/@videojs/store/dist/default/core/selector.js
var stateContext = {
  target: throwNoTargetError,
  signals: new AbortControllerRegistry(),
  get: throwNoTargetError,
  set: throwNoTargetError
};
function createSelector(slice) {
  const initialState = slice.state(stateContext);
  const keys = [...Object.keys(initialState), ...Object.keys(slice.derived ?? {})];
  const firstKey = keys[0];
  if (!firstKey) return Object.assign(() => void 0, { displayName: slice.name });
  return Object.assign((state) => {
    if (!(firstKey in state)) return void 0;
    return pick(state, keys);
  }, { displayName: slice.name });
}

// node_modules/@videojs/core/dist/default/dom/store/selectors.js
var selectAudioTrack = createSelector(audioTrackFeature);
var selectBuffer = createSelector(bufferFeature);
var selectControls = createSelector(controlsFeature);
var selectError = createSelector(errorFeature);
var selectFullscreen = createSelector(fullscreenFeature);
var selectLive = createSelector(liveFeature);
var selectMetadata = createSelector(metadataFeature);
var selectPiP = createSelector(pipFeature);
var selectPlayback = createSelector(playbackFeature);
var selectPlaybackRate = createSelector(playbackRateFeature);
var selectQuality = createSelector(qualityFeature);
var selectRemotePlayback = createSelector(remotePlaybackFeature);
var selectSource = createSelector(sourceFeature);
var selectStreamType = createSelector(streamTypeFeature);
var selectTextTrack = createSelector(textTrackFeature);
var selectTime = createSelector(timeFeature);
var selectVolume = createSelector(volumeFeature);

// node_modules/@videojs/core/dist/default/dom/media-actions.js
function ignoreRejection(result) {
  if (isPromise(result)) result.catch(noop);
}
var MEDIA_INPUT_ACTION_OVERRIDES = {
  togglePaused({ store, state = store.state }) {
    const playback = selectPlayback(state);
    if (!playback) return;
    ignoreRejection(playback.paused && !playback.autoplaying ? playback.play() : playback.pause());
  },
  toggleMuted({ store }) {
    const volume = selectVolume(store.state);
    if (!volume) return;
    volume.setMuted(!(volume.muted || volume.volume === 0));
  },
  toggleFullscreen({ store }) {
    const fullscreen = selectFullscreen(store.state);
    if (!fullscreen) return;
    ignoreRejection(fullscreen.isFullscreen ? fullscreen.exitFullscreen() : fullscreen.requestFullscreen());
  },
  togglePictureInPicture({ store }) {
    const pip = selectPiP(store.state);
    if (!pip) return;
    ignoreRejection(pip.isPictureInPicture ? pip.exitPictureInPicture() : pip.requestPictureInPicture());
  },
  seekStep({ store, value, key }) {
    const step = getMediaInputActionValue("seekStep", key, value);
    const time = selectTime(store.state);
    if (!time) return;
    time.seek(time.currentTime + step);
  },
  volumeStep({ store, value, key }) {
    const step = getMediaInputActionValue("volumeStep", key, value);
    const vol = selectVolume(store.state);
    if (!vol) return;
    vol.setVolume(vol.volume + step);
  },
  speedUp({ store, value }) {
    const rate = selectPlaybackRate(store.state);
    if (!rate) return;
    if (!isUndefined(value)) {
      rate.setPlaybackRate(roundPlaybackRate(rate.playbackRate + value));
      return;
    }
    const { playbackRates, playbackRate } = rate;
    const faster = playbackRates.filter((candidate) => candidate > playbackRate);
    if (faster.length === 0) return;
    rate.setPlaybackRate(Math.min(...faster));
  },
  speedDown({ store, value }) {
    const rate = selectPlaybackRate(store.state);
    if (!rate) return;
    if (!isUndefined(value)) {
      rate.setPlaybackRate(roundPlaybackRate(rate.playbackRate - value));
      return;
    }
    const { playbackRates, playbackRate } = rate;
    const slower = playbackRates.filter((candidate) => candidate < playbackRate);
    if (slower.length === 0) return;
    rate.setPlaybackRate(Math.max(...slower));
  }
};

// node_modules/@videojs/core/dist/default/dom/gesture/actions.js
var GESTURE_ACTION_OVERRIDES = {
  togglePaused: MEDIA_INPUT_ACTION_OVERRIDES.togglePaused,
  toggleMuted: MEDIA_INPUT_ACTION_OVERRIDES.toggleMuted,
  toggleFullscreen: MEDIA_INPUT_ACTION_OVERRIDES.toggleFullscreen,
  togglePictureInPicture: MEDIA_INPUT_ACTION_OVERRIDES.togglePictureInPicture,
  seekStep: MEDIA_INPUT_ACTION_OVERRIDES.seekStep,
  volumeStep: MEDIA_INPUT_ACTION_OVERRIDES.volumeStep,
  speedUp: MEDIA_INPUT_ACTION_OVERRIDES.speedUp,
  speedDown: MEDIA_INPUT_ACTION_OVERRIDES.speedDown
};
function resolveGestureAction(name) {
  const override = GESTURE_ACTION_OVERRIDES[name];
  if (override) return override;
  return ({ store }) => {
    const method = store.state[name];
    if (isFunction(method)) ignoreRejection(method());
  };
}

// node_modules/@videojs/core/dist/default/dom/gesture/tap.js
var DOUBLETAP_WINDOW = 200;
var TapRecognizer = class {
  #lastBinding = null;
  #lastPointerType = "";
  #lastTapTime = 0;
  #tapTimer = null;
  handleUp(matches, event) {
    if (matches.resolve("doubletap").length > 0) {
      const now = Date.now();
      const binding = matches.resolve("doubletap")[0];
      if (now - this.#lastTapTime < DOUBLETAP_WINDOW && this.#lastBinding === binding && this.#lastPointerType === event.pointerType) {
        this.#clearTimer();
        this.#lastTapTime = 0;
        matches.resolve("doubletap")[0]?.onActivate(event);
        return;
      }
      this.#lastTapTime = now;
      this.#lastBinding = binding;
      this.#lastPointerType = event.pointerType;
      this.#clearTimer();
      this.#tapTimer = setTimeout(() => {
        this.#tapTimer = null;
        this.#lastTapTime = 0;
        matches.resolve("tap")[0]?.onActivate(event);
      }, DOUBLETAP_WINDOW);
      return;
    }
    matches.resolve("tap")[0]?.onActivate(event);
  }
  #clearTimer() {
    if (this.#tapTimer !== null) {
      clearTimeout(this.#tapTimer);
      this.#tapTimer = null;
    }
  }
  reset() {
    this.#lastBinding = null;
    this.#lastPointerType = "";
    this.#clearTimer();
    this.#lastTapTime = 0;
  }
};

// node_modules/@videojs/core/dist/default/dom/gesture/create-tap-gesture.js
var recognizers = /* @__PURE__ */ new WeakMap();
function getRecognizer(target) {
  let recognizer = recognizers.get(target);
  if (recognizer) return recognizer;
  recognizer = new TapRecognizer();
  recognizers.set(target, recognizer);
  return recognizer;
}
function createTapGesture(target, onActivate, options) {
  return getGestureCoordinator(target).add({
    type: "tap",
    recognizer: getRecognizer(target),
    onActivate,
    onPointerDown: options?.onPointerDown,
    pointer: options?.pointer,
    region: options?.region,
    disabled: options?.disabled,
    action: options?.action,
    value: options?.value
  });
}
function createDoubleTapGesture(target, onActivate, options) {
  return getGestureCoordinator(target).add({
    type: "doubletap",
    recognizer: getRecognizer(target),
    onActivate,
    pointer: options?.pointer,
    region: options?.region,
    disabled: options?.disabled,
    action: options?.action,
    value: options?.value
  });
}

// node_modules/@videojs/core/dist/default/dom/hotkey/actions.js
function isHotkeyToggleAction(action) {
  return action.startsWith("toggle");
}
var HOTKEY_ACTIONS = {
  togglePaused: MEDIA_INPUT_ACTION_OVERRIDES.togglePaused,
  toggleMuted: MEDIA_INPUT_ACTION_OVERRIDES.toggleMuted,
  toggleFullscreen: MEDIA_INPUT_ACTION_OVERRIDES.toggleFullscreen,
  toggleSubtitles({ store }) {
    selectTextTrack(store.state)?.toggleSubtitles();
  },
  togglePictureInPicture: MEDIA_INPUT_ACTION_OVERRIDES.togglePictureInPicture,
  seekStep: MEDIA_INPUT_ACTION_OVERRIDES.seekStep,
  volumeStep: MEDIA_INPUT_ACTION_OVERRIDES.volumeStep,
  speedUp: MEDIA_INPUT_ACTION_OVERRIDES.speedUp,
  speedDown: MEDIA_INPUT_ACTION_OVERRIDES.speedDown,
  seekToPercent({ store, value, key }) {
    const time = selectTime(store.state);
    if (!time) return;
    const buffer = selectBuffer(store.state);
    const reportedEnd = buffer?.seekable?.at(-1)?.[1];
    const duration = Number.isFinite(reportedEnd) && reportedEnd > 0 ? reportedEnd : getTimeRangeEnd({ duration: time.duration, seekable: buffer?.seekable ?? [] });
    const start = Math.min(duration, Math.max(0, buffer?.seekable?.[0]?.[0] ?? 0));
    if (duration <= start) return;
    let percent;
    if (!isUndefined(value)) percent = value;
    else if (key >= "0" && key <= "9") percent = Number(key) * 10;
    else return;
    time.seek(start + percent / 100 * (duration - start));
  }
};
function resolveHotkeyAction(name) {
  return HOTKEY_ACTIONS[name];
}

// node_modules/@videojs/core/dist/default/dom/hotkey/aria.js
var ARIA_MODIFIER_MAP = {
  shift: "Shift",
  ctrl: "Control",
  alt: "Alt",
  meta: "Meta"
};
var DISPLAY_MODIFIER_MAP = {
  shift: "Shift",
  ctrl: "Ctrl",
  alt: "Alt",
  meta: "Meta"
};
var MODIFIER_ORDER = [
  "ctrl",
  "shift",
  "alt",
  "meta"
];
function toAriaKeyShortcut(bindings) {
  return bindings.map((b) => {
    const parts = [];
    for (const mod of MODIFIER_ORDER) if (b.modifiers.has(mod)) parts.push(ARIA_MODIFIER_MAP[mod]);
    parts.push(b.originalKey);
    return parts.join("+");
  }).join(" ");
}
function toDisplayKeyShortcut(binding) {
  const parts = [];
  for (const mod of MODIFIER_ORDER) if (binding.modifiers.has(mod)) parts.push(DISPLAY_MODIFIER_MAP[mod]);
  parts.push(toDisplayKey(binding.originalKey));
  return parts.join("+");
}
function toDisplayKey(key) {
  return key.length === 1 ? key.toUpperCase() : key;
}

// node_modules/@videojs/core/dist/default/dom/hotkey/coordinator.js
var HotkeyCoordinator = class {
  #target;
  #bindings = [];
  #nextId = 0;
  #disconnect = null;
  #docDisconnect = null;
  #activationSubscribers = /* @__PURE__ */ new Set();
  #shortcutSubscribers = /* @__PURE__ */ new Set();
  #destroyed = false;
  constructor(target) {
    this.#target = target;
  }
  subscribe(callback) {
    this.#activationSubscribers.add(callback);
    return () => this.#activationSubscribers.delete(callback);
  }
  subscribeShortcutChanges(callback) {
    this.#shortcutSubscribers.add(callback);
    return () => this.#shortcutSubscribers.delete(callback);
  }
  add(options) {
    const binding = {
      parsed: parseHotkeyPattern(options.keys),
      options,
      id: this.#nextId++
    };
    this.#bindings.push(binding);
    this.#sortBindings();
    if (options.target === "document") this.#connectDocument();
    else this.#connect();
    this.#notify();
    let removed = false;
    return () => {
      if (removed) return;
      removed = true;
      const idx = this.#bindings.indexOf(binding);
      if (idx !== -1) this.#bindings.splice(idx, 1);
      this.#maybeDisconnect();
      this.#notify();
    };
  }
  getAriaKeys(action) {
    return this.getShortcut(action).aria;
  }
  getShortcut(action, value) {
    const bindings = this.#getActionBindings(action, value);
    if (!bindings.length) return {};
    const parsed = bindings.flatMap((binding) => binding.parsed);
    const preferred = bindings[bindings.length - 1];
    return {
      aria: toAriaKeyShortcut(parsed),
      shortcut: this.#formatDisplayShortcut(preferred)
    };
  }
  destroy() {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#disconnect?.abort();
    this.#disconnect = null;
    this.#docDisconnect?.abort();
    this.#docDisconnect = null;
    this.#bindings = [];
    this.#notify();
    this.#activationSubscribers.clear();
    this.#shortcutSubscribers.clear();
  }
  #sortBindings() {
    this.#bindings.sort((a, b) => {
      const specDiff = b.parsed[0].modifiers.size - a.parsed[0].modifiers.size;
      if (specDiff !== 0) return specDiff;
      return a.id - b.id;
    });
  }
  #connect() {
    if (this.#disconnect) return;
    this.#disconnect = new AbortController();
    listen(this.#target, "keydown", this.#handleEvent, { signal: this.#disconnect.signal });
  }
  #connectDocument() {
    if (this.#docDisconnect) return;
    this.#docDisconnect = new AbortController();
    listen(document, "keydown", this.#handleEvent, { signal: this.#docDisconnect.signal });
  }
  #maybeDisconnect() {
    const hasPlayer = this.#bindings.some((b) => b.options.target !== "document");
    const hasDoc = this.#bindings.some((b) => b.options.target === "document");
    if (!hasPlayer) {
      this.#disconnect?.abort();
      this.#disconnect = null;
    }
    if (!hasDoc) {
      this.#docDisconnect?.abort();
      this.#docDisconnect = null;
    }
  }
  #handleEvent = (event) => {
    if (isInteractionLocked(this.#target)) return;
    if (event.key === "Unidentified") return;
    if (isInteractiveActivation(event)) return;
    if (event.defaultPrevented) return;
    const editable = isEditableTarget(event);
    for (const binding of this.#bindings) {
      const { options, parsed } = binding;
      if (options.disabled) continue;
      if (event.repeat && options.repeatable === false) continue;
      if (options.target === "document" !== (event.currentTarget === document)) continue;
      for (const p of parsed) {
        if (!matchesHotkeyEvent(p, event)) continue;
        if (editable && p.modifiers.size === 0) continue;
        if (this.#activationSubscribers.size > 0) {
          const activateEvent = {
            source: "hotkey",
            action: options.action,
            value: options.value,
            event
          };
          for (const cb of this.#activationSubscribers) try {
            cb(activateEvent);
          } catch (error) {
          }
        }
        event.preventDefault();
        options.onActivate(event, p.originalKey);
        return;
      }
    }
  };
  #getActionBindings(action, value) {
    return this.#bindings.filter((binding) => {
      if (binding.options.disabled) return false;
      if (binding.options.action !== action) return false;
      if (isUndefined(value)) return true;
      return binding.options.value === value;
    }).sort((a, b) => a.id - b.id);
  }
  #formatDisplayShortcut(binding) {
    if (binding.options.keys === "0-9") return binding.options.keys;
    return toDisplayKeyShortcut(binding.parsed[0]);
  }
  #notify() {
    for (const subscriber of this.#shortcutSubscribers) subscriber();
  }
};

// node_modules/@videojs/core/dist/default/dom/hotkey/hotkey.js
var MODIFIER_KEYS = /* @__PURE__ */ new Set([
  "shift",
  "ctrl",
  "alt",
  "meta"
]);
function parseHotkeyPattern(pattern) {
  if (pattern === "0-9") return Array.from({ length: 10 }, (_, i2) => ({
    modifiers: /* @__PURE__ */ new Set(),
    key: String(i2),
    originalKey: String(i2)
  }));
  const segments = pattern.split("+");
  const rawKey = segments.pop();
  const modifiers = /* @__PURE__ */ new Set();
  for (const seg of segments) {
    const lower = seg.toLowerCase();
    if (lower === "mod") modifiers.add(isMacOS() ? "meta" : "ctrl");
    else if (MODIFIER_KEYS.has(lower)) modifiers.add(lower);
  }
  return [{
    modifiers,
    key: rawKey === "Space" ? " " : rawKey.toLowerCase(),
    originalKey: rawKey
  }];
}
function isImplicitModifierKey(key) {
  return key.length === 1 && !/[a-z]/i.test(key);
}
function matchesHotkeyEvent(binding, event) {
  if (event.key === "Unidentified") return false;
  if (event.key.toLowerCase() !== binding.key) return false;
  const implicit = isImplicitModifierKey(event.key);
  const shiftKey = implicit ? event.shiftKey && binding.modifiers.has("shift") : event.shiftKey;
  const altKey = implicit ? event.altKey && binding.modifiers.has("alt") : event.altKey;
  if (shiftKey !== binding.modifiers.has("shift")) return false;
  if (event.ctrlKey !== binding.modifiers.has("ctrl")) return false;
  if (altKey !== binding.modifiers.has("alt")) return false;
  if (event.metaKey !== binding.modifiers.has("meta")) return false;
  return true;
}
var coordinators2 = /* @__PURE__ */ new WeakMap();
function getHotkeyCoordinator(target) {
  let coordinator = coordinators2.get(target);
  if (!coordinator) {
    coordinator = new HotkeyCoordinator(target);
    coordinators2.set(target, coordinator);
  }
  return coordinator;
}
function createHotkey(target, options) {
  const coordinator = getHotkeyCoordinator(target);
  const key = parseHotkeyPattern(options.keys)[0]?.originalKey;
  return coordinator.add({
    ...options,
    value: getMediaInputActionValue(options.action ?? "", key, options.value)
  });
}

// node_modules/@videojs/core/dist/default/dom/hotkey/hotkey-events.js
var HOTKEY_SHORTCUT_CHANGE_EVENT = "hotkey-shortcut-change";

// node_modules/@videojs/core/dist/default/dom/store/features/presets.js
var videoFeatures = [
  playbackFeature,
  playbackRateFeature,
  qualityFeature,
  audioTrackFeature,
  volumeFeature,
  timeFeature,
  sourceFeature,
  bufferFeature,
  fullscreenFeature,
  pipFeature,
  remotePlaybackFeature,
  controlsFeature,
  textTrackFeature,
  errorFeature,
  metadataFeature
];
var audioFeatures = [
  playbackFeature,
  playbackRateFeature,
  volumeFeature,
  timeFeature,
  sourceFeature,
  bufferFeature,
  errorFeature,
  metadataFeature
];

// node_modules/@videojs/core/dist/default/dom/ui/button.js
function createButton(options) {
  const { onActivate, isDisabled } = options;
  return {
    role: "button",
    tabIndex: 0,
    onClick(event) {
      if (isDisabled()) {
        event.preventDefault();
        return;
      }
      onActivate(event, (event.detail ?? 0) > 0 ? "pointer" : "virtual");
    },
    onPointerDown(event) {
      if (isDisabled()) event.preventDefault();
    },
    onMouseDown(event) {
      if (isDisabled()) event.preventDefault();
    },
    onKeyDown(event) {
      if (event.target !== event.currentTarget) return;
      if (isDisabled()) {
        if (event.key !== "Tab") event.preventDefault();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        onActivate(event, "keyboard");
      } else if (event.key === " ") event.preventDefault();
    },
    onKeyUp(event) {
      if (event.target !== event.currentTarget) return;
      if (isDisabled()) return;
      if (event.key === " ") onActivate(event, "keyboard");
    }
  };
}

// node_modules/@videojs/core/dist/default/dom/ui/container.js
var DEFAULT_CONTAINER_ROLE = "group";
function applyContainerAttrs(element) {
  if (!element.hasAttribute("role")) element.setAttribute("role", DEFAULT_CONTAINER_ROLE);
  if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", String(0));
}
function focusContainer(element) {
  const active = getDeepActiveElement(element.ownerDocument);
  if (!active || active === element.ownerDocument.body || !containsComposed(element, active)) element.focus({ preventScroll: true });
}

// node_modules/@videojs/core/dist/default/dom/ui/dismiss-layer.js
function createDismissLayer(options) {
  const { transition } = options;
  const state = transition.state;
  const abort = new AbortController();
  let docAbort = null;
  function open(element) {
    if (abort.signal.aborted) return null;
    const { active, status } = state.current;
    if (active && status !== "ending") return null;
    if (status === "ending") transition.cancel();
    return transition.open(element);
  }
  function close(element) {
    const { active, status } = state.current;
    if (abort.signal.aborted || !active || status === "ending") return null;
    return transition.close(element);
  }
  function setupDocumentListeners() {
    cleanupDocumentListeners();
    if (typeof document === "undefined") return;
    docAbort = new AbortController();
    const { signal } = docAbort;
    listen(document, "keydown", handleKeydown, { signal });
    options.onDocumentActive?.(signal);
  }
  function cleanupDocumentListeners() {
    docAbort?.abort();
    docAbort = null;
  }
  function handleKeydown(event) {
    if (event.key !== "Escape") return;
    if (event.defaultPrevented) return;
    if (!state.current.active) return;
    if (!(options.closeOnEscape?.() ?? true)) return;
    options.onEscapeDismiss(event);
  }
  const unsubscribe = state.subscribe(() => {
    if (state.current.active && state.current.status !== "ending") setupDocumentListeners();
    else cleanupDocumentListeners();
  });
  abort.signal.addEventListener("abort", () => {
    unsubscribe();
    transition.destroy();
    cleanupDocumentListeners();
  });
  function destroy() {
    if (abort.signal.aborted) return;
    abort.abort();
  }
  return {
    input: state,
    open,
    close,
    signal: abort.signal,
    destroy
  };
}

// node_modules/@videojs/core/dist/default/dom/ui/dialog.js
function createDialog(options) {
  let popupElement = null;
  let triggerElement = null;
  let previousFocus = null;
  let requestedInteractionRoot = null;
  let activeInteractionRoot = null;
  let releaseInteractionLock = null;
  let focusFrame = 0;
  const isolatedElements = /* @__PURE__ */ new Map();
  const modality = createState({ documentModal: true });
  const layer = createDismissLayer({
    transition: options.transition,
    closeOnEscape: options.closeOnEscape,
    onEscapeDismiss(event) {
      if (!shouldHandleScopedEvent(event)) return;
      event.preventDefault();
      event.stopPropagation();
      applyClose();
    },
    onDocumentActive(signal) {
      listen(document, "keydown", handleDocumentKeydown, {
        capture: true,
        signal
      });
      listen(document, "focusin", handleDocumentFocusin, { signal });
    }
  });
  const state = layer.input;
  function applyOpen() {
    previousFocus = getDeepActiveElement();
    const opening = layer.open(() => popupElement);
    if (!opening) return;
    resolveInteractionRoot();
    isolateBackground();
    options.onOpenChange(true);
    scheduleInitialFocus();
    opening.then(() => {
      if (layer.signal.aborted || !state.current.active || state.current.status !== "idle") return;
      options.onOpenChangeComplete?.(true);
    });
  }
  function applyClose() {
    const closing = layer.close(popupElement);
    if (!closing) return;
    cancelAnimationFrame(focusFrame);
    focusFrame = 0;
    options.onOpenChange(false);
    closing.then(() => {
      if (layer.signal.aborted || state.current.active) return;
      const active = getDeepActiveElement();
      const focusLeftScope = activeInteractionRoot && active instanceof Element && !containsComposed(activeInteractionRoot, active);
      restoreBackground();
      const restoreTarget = triggerElement?.isConnected ? triggerElement : previousFocus;
      if (!focusLeftScope && restoreTarget?.isConnected) restoreTarget.focus();
      previousFocus = null;
      options.onOpenChangeComplete?.(false);
    });
  }
  function scheduleInitialFocus() {
    cancelAnimationFrame(focusFrame);
    focusFrame = requestAnimationFrame(() => {
      focusFrame = 0;
      if (layer.signal.aborted || !state.current.active || !popupElement) return;
      (popupElement.querySelector("[autofocus]") ?? getTabbableElements(popupElement)[0] ?? popupElement).focus();
    });
  }
  function handleDocumentKeydown(event) {
    if (event.key !== "Tab" || !state.current.active || !popupElement || !modality.current.documentModal) return;
    const tabbable = getTabbableElements(popupElement);
    if (tabbable.length === 0) {
      event.preventDefault();
      popupElement.focus();
      return;
    }
    const active = getDeepActiveElement();
    const first = tabbable[0];
    const last = tabbable[tabbable.length - 1];
    if (event.shiftKey && (active === first || !active || !containsComposed(popupElement, active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !active || !containsComposed(popupElement, active))) {
      event.preventDefault();
      first.focus();
    }
  }
  function handleDocumentFocusin(event) {
    if (!state.current.active || !popupElement) return;
    if (event.target instanceof Element && containsComposed(popupElement, event.target)) return;
    if (activeInteractionRoot && event.target instanceof Element && !containsComposed(activeInteractionRoot, event.target)) return;
    (getTabbableElements(popupElement)[0] ?? popupElement).focus();
  }
  function setTriggerElement(el) {
    triggerElement = el;
  }
  function setPopupElement(el) {
    if (popupElement !== el) restoreBackground();
    popupElement = el;
    resolveInteractionRoot();
    if (el && state.current.active) isolateBackground();
    const active = getDeepActiveElement();
    if (el && state.current.active && (!active || !containsComposed(el, active))) scheduleInitialFocus();
  }
  function setInteractionRoot(el) {
    if (requestedInteractionRoot === el) return;
    restoreBackground();
    requestedInteractionRoot = el;
    resolveInteractionRoot();
    if (popupElement && state.current.active) isolateBackground();
  }
  layer.signal.addEventListener("abort", () => {
    cancelAnimationFrame(focusFrame);
    focusFrame = 0;
    restoreBackground();
    popupElement = null;
    triggerElement = null;
    previousFocus = null;
    requestedInteractionRoot = null;
    activeInteractionRoot = null;
  });
  return {
    input: state,
    modality,
    triggerProps: { onClick() {
      applyOpen();
    } },
    open: applyOpen,
    close: applyClose,
    setTriggerElement,
    setPopupElement,
    setInteractionRoot,
    destroy: layer.destroy
  };
  function isolateBackground() {
    if (!popupElement?.isConnected || isolatedElements.size > 0 || releaseInteractionLock) return;
    resolveInteractionRoot();
    walkAncestors(popupElement, (current) => {
      if (current === activeInteractionRoot || current === popupElement?.ownerDocument.body) return true;
      if (current.assignedSlot) {
        for (const sibling of current.assignedSlot.assignedElements({ flatten: true })) if (sibling !== current && sibling instanceof HTMLElement) makeInert(sibling);
        return;
      }
      const parent = current.parentElement;
      if (parent) {
        for (const sibling of parent.children) if (sibling !== current && sibling instanceof HTMLElement) makeInert(sibling);
        return;
      }
      const root = current.getRootNode();
      if (!(root instanceof ShadowRoot)) return void 0;
      for (const sibling of root.children) if (sibling !== current && sibling instanceof HTMLElement) makeInert(sibling);
    }, { composed: true });
    if (activeInteractionRoot) releaseInteractionLock = lockInteractions(activeInteractionRoot);
  }
  function makeInert(element) {
    isolatedElements.set(element, element.hasAttribute("inert"));
    element.setAttribute("inert", "");
  }
  function restoreBackground() {
    for (const [element, wasInert] of isolatedElements) if (!wasInert) element.removeAttribute("inert");
    isolatedElements.clear();
    releaseInteractionLock?.();
    releaseInteractionLock = null;
  }
  function resolveInteractionRoot() {
    activeInteractionRoot = requestedInteractionRoot && popupElement && containsComposed(requestedInteractionRoot, popupElement) ? requestedInteractionRoot : null;
    modality.patch({ documentModal: !activeInteractionRoot });
  }
  function shouldHandleScopedEvent(event) {
    if (!activeInteractionRoot) return true;
    const target = event.target instanceof Element ? event.target : getDeepActiveElement();
    return target instanceof Element && containsComposed(activeInteractionRoot, target);
  }
}

// node_modules/@videojs/core/dist/default/core/ui/transition.js
var TransitionDataAttrs = {
  /** Present during the open transition. */
  transitionStarting: "data-starting-style",
  /** Present during the close transition. */
  transitionEnding: "data-ending-style"
};
function getTransitionFlags(status) {
  return {
    transitionStarting: status === "starting",
    transitionEnding: status === "ending"
  };
}

// node_modules/@videojs/core/dist/default/core/ui/indicator/lifecycle.js
var IndicatorCloseController = class {
  #timer = null;
  #close;
  #getDelay;
  constructor(close, getDelay) {
    this.#close = close;
    this.#getDelay = getDelay;
  }
  arm() {
    this.clear();
    this.#timer = setTimeout(() => {
      this.#timer = null;
      this.#close();
    }, this.#getDelay());
  }
  clear() {
    if (this.#timer === null) return;
    clearTimeout(this.#timer);
    this.#timer = null;
  }
  close() {
    this.clear();
    this.#close();
  }
  destroy() {
    this.clear();
  }
};
var IndicatorVisibilityCoordinator = class {
  #handles = /* @__PURE__ */ new Set();
  register(handle) {
    this.#handles.add(handle);
    return () => this.#handles.delete(handle);
  }
  show(handle) {
    for (const nextHandle of this.#handles) if (nextHandle !== handle) nextHandle.close();
  }
};
function getIndicatorCloseDelay(props) {
  return props.closeDelay ?? 800;
}
function isIndicatorPresent(current, transition) {
  return current.open || transition.active;
}
function getRenderedIndicatorState(current, snapshot, transition) {
  const payload = current.open ? current : snapshot;
  return {
    ...payload,
    open: current.open && transition.active,
    generation: current.open ? current.generation : payload.generation,
    ...getTransitionFlags(transition.status)
  };
}

// node_modules/@videojs/core/dist/default/dom/ui/input-action.js
function toInputActionEvent(event) {
  return {
    action: event.action,
    value: event.value,
    source: event.source,
    key: "key" in event.event ? event.event.key : void 0,
    repeat: "repeat" in event.event ? event.event.repeat : void 0
  };
}
function getMediaSnapshot(store) {
  if (!store) return {};
  const state = store.state;
  const time = selectTime(state);
  const playback = selectPlayback(state);
  const textTrack = selectTextTrack(state);
  return {
    paused: playback && playback.paused && !playback.autoplaying,
    volume: selectVolume(state)?.volume,
    muted: selectVolume(state)?.muted,
    playbackRate: selectPlaybackRate(state)?.playbackRate,
    isFullscreen: selectFullscreen(state)?.isFullscreen,
    subtitlesShowing: textTrack?.subtitlesShowing,
    subtitlesAvailable: textTrack ? (textTrack.textTrackList ?? []).some(isCaptionOrSubtitleTrack) : void 0,
    isPictureInPicture: selectPiP(state)?.isPictureInPicture,
    currentTime: time?.currentTime,
    duration: time?.duration,
    seeking: time?.seeking
  };
}
function subscribeToInputActions(container, callback) {
  const handleEvent = (event) => callback(toInputActionEvent(event));
  const gestureUnsubscribe = getGestureCoordinator(container).subscribe(handleEvent);
  const hotkeyUnsubscribe = getHotkeyCoordinator(container).subscribe(handleEvent);
  return () => {
    gestureUnsubscribe();
    hotkeyUnsubscribe();
  };
}
var indicatorVisibilityCoordinators = /* @__PURE__ */ new WeakMap();
function getIndicatorVisibilityCoordinator(container) {
  let coordinator = indicatorVisibilityCoordinators.get(container);
  if (!coordinator) {
    coordinator = new IndicatorVisibilityCoordinator();
    indicatorVisibilityCoordinators.set(container, coordinator);
  }
  return coordinator;
}

// node_modules/@videojs/core/dist/default/dom/utils/layout.js
function forceLayout(element) {
  element?.getBoundingClientRect();
}
function createDOMRect(left, top, width, height) {
  const right = left + width;
  const bottom = top + height;
  return {
    x: left,
    y: top,
    width,
    height,
    top,
    right,
    bottom,
    left,
    toJSON() {
      return {
        x: left,
        y: top,
        width,
        height,
        top,
        right,
        bottom,
        left
      };
    }
  };
}
function intersectDOMRects(firstRect, secondRect) {
  const left = Math.max(firstRect.left, secondRect.left);
  const top = Math.max(firstRect.top, secondRect.top);
  const right = Math.min(firstRect.right, secondRect.right);
  const bottom = Math.min(firstRect.bottom, secondRect.bottom);
  return createDOMRect(left, top, Math.max(0, right - left), Math.max(0, bottom - top));
}
function getPositioningBoundaryRect(boundaryElement) {
  const viewportRect = document.documentElement.getBoundingClientRect();
  return boundaryElement ? intersectDOMRects(viewportRect, boundaryElement.getBoundingClientRect()) : viewportRect;
}
function resolvePositioningBoundary(boundary, options = {}) {
  if (!boundary) return null;
  if (!isString(boundary)) return boundary;
  if (boundary === "viewport") return null;
  if (boundary === "container") return options.container ?? null;
  try {
    return (options.root ?? document).querySelector(boundary);
  } catch {
    return null;
  }
}

// node_modules/@videojs/core/dist/default/dom/ui/popover/popover.js
function createPopover(options) {
  const { onOpenChange, closeOnOutsideClick } = options;
  let triggerEl = null;
  let popupEl = null;
  let popupAbort = null;
  let hoverTimeout = null;
  const capturedPointers = /* @__PURE__ */ new Set();
  let ignoreNextBlurClose = false;
  let blurGuardTimeout = null;
  const layer = createDismissLayer({
    transition: options.transition,
    closeOnEscape: options.closeOnEscape,
    onEscapeDismiss(event) {
      event.preventDefault();
      applyClose("escape", event);
    },
    onDocumentActive(signal) {
      listen(document, "pointerdown", handleDocumentPointerdown, {
        capture: true,
        signal
      });
    }
  });
  const state = layer.input;
  const groupMember = {
    close(reason) {
      applyClose(reason);
    },
    get triggerElement() {
      return triggerEl;
    }
  };
  function clearHoverTimeout() {
    if (hoverTimeout !== null) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
  }
  function canHover() {
    return globalThis.matchMedia?.("(hover: hover)")?.matches ?? false;
  }
  function canOpenOnFocus() {
    if (!canHover()) return false;
    return globalThis.matchMedia?.("(pointer: fine)")?.matches ?? false;
  }
  function canToggleOnClick() {
    if (!options.openOnHover?.()) return true;
    return canHover();
  }
  function clearBlurGuard() {
    ignoreNextBlurClose = false;
    if (blurGuardTimeout !== null) {
      clearTimeout(blurGuardTimeout);
      blurGuardTimeout = null;
    }
  }
  function armBlurGuard() {
    ignoreNextBlurClose = true;
    if (blurGuardTimeout !== null) clearTimeout(blurGuardTimeout);
    blurGuardTimeout = setTimeout(clearBlurGuard, 500);
  }
  function consumeBlurGuard() {
    if (!ignoreNextBlurClose) return false;
    clearBlurGuard();
    return true;
  }
  function isTriggerDisabled() {
    if (!triggerEl) return false;
    if (triggerEl.hasAttribute("disabled")) return true;
    return triggerEl.getAttribute("aria-disabled") === "true";
  }
  function commitOpen() {
    const opening = layer.open(() => popupEl);
    if (!opening) return;
    queueMicrotask(() => {
      if (layer.signal.aborted || !state.current.active || state.current.status === "ending") return;
      tryShowPopover(popupEl);
    });
    options.group?.()?.open(groupMember);
    opening.then(() => {
      if (layer.signal.aborted || !state.current.active || state.current.status !== "idle") return;
      options.onOpenChangeComplete?.(true);
    });
  }
  function commitClose() {
    const closing = layer.close(popupEl);
    if (!closing) return;
    options.group?.()?.close(groupMember);
    closing.then(() => {
      if (layer.signal.aborted || state.current.active) return;
      tryHidePopover(popupEl);
      options.onOpenChangeComplete?.(false);
    });
  }
  function applyOpen(reason, event) {
    if (layer.signal.aborted) return;
    const { active, status } = state.current;
    if (active && status !== "ending") return;
    onOpenChange(true, event ? {
      reason,
      event
    } : { reason });
    if (!options.deferOpenChanges) commitOpen();
  }
  function applyClose(reason, event) {
    if (layer.signal.aborted) return;
    const { active, status } = state.current;
    if (!active || status === "ending") return;
    onOpenChange(false, event ? {
      reason,
      event
    } : { reason });
    if (!options.deferOpenChanges) commitClose();
  }
  function open(reason = "click") {
    applyOpen(reason);
  }
  function close(reason = "click") {
    clearHoverTimeout();
    applyClose(reason);
  }
  function syncOpen(open2) {
    if (!options.deferOpenChanges) return;
    if (open2) commitOpen();
    else commitClose();
  }
  function handleDocumentPointerdown(event) {
    if (!closeOnOutsideClick() || !state.current.active) return;
    const path = event.composedPath();
    if (triggerEl && path.includes(triggerEl) || popupEl && path.includes(popupEl)) {
      armBlurGuard();
      return;
    }
    clearBlurGuard();
    applyClose("outside-click", event);
  }
  function handlePopupToggle(event) {
    if (event.newState !== "closed") return;
    applyClose("imperative-action", event);
  }
  layer.signal.addEventListener("abort", () => {
    popupAbort?.abort();
    popupAbort = null;
    options.group?.()?.close(groupMember);
    clearHoverTimeout();
    clearBlurGuard();
    capturedPointers.clear();
    triggerEl = null;
    popupEl = null;
  });
  const triggerProps = {
    onClick(event) {
      if (!canToggleOnClick()) return;
      if (isTriggerDisabled()) return;
      if (state.current.active && state.current.status !== "ending") applyClose("click", event);
      else applyOpen("click", event);
    },
    onPointerEnter(_event) {
      if (!options.openOnHover?.()) return;
      if (!canHover()) return;
      clearHoverTimeout();
      if (state.current.active) return;
      const delay = options.delay?.() ?? 300;
      hoverTimeout = setTimeout(() => applyOpen("hover"), delay);
    },
    onPointerLeave(_event) {
      if (!options.openOnHover?.()) return;
      if (!canHover()) return;
      clearHoverTimeout();
      if (!state.current.active) return;
      const closeDelay = options.closeDelay?.() ?? 0;
      hoverTimeout = setTimeout(() => applyClose("hover"), closeDelay);
    },
    onFocusIn(_event) {
      if (options.openOnHover?.()) {
        if (!canOpenOnFocus()) return;
        applyOpen("focus");
      }
    },
    onFocusOut(event) {
      const relatedTarget = event.relatedTarget;
      if (relatedTarget && (triggerEl?.contains(relatedTarget) || popupEl?.contains(relatedTarget))) return;
      if (options.openOnHover?.()) applyClose("blur");
    }
  };
  const popupProps = {
    onPointerEnter(_event) {
      if (!options.openOnHover?.()) return;
      clearHoverTimeout();
    },
    onPointerLeave(_event) {
      if (!options.openOnHover?.()) return;
      if (capturedPointers.size > 0) return;
      clearHoverTimeout();
      if (!state.current.active) return;
      const closeDelay = options.closeDelay?.() ?? 0;
      hoverTimeout = setTimeout(() => applyClose("hover"), closeDelay);
    },
    onGotPointerCapture(event) {
      capturedPointers.add(event.pointerId);
    },
    onLostPointerCapture(event) {
      capturedPointers.delete(event.pointerId);
    },
    onFocusOut(event) {
      const relatedTarget = event.relatedTarget;
      if (relatedTarget && (triggerEl?.contains(relatedTarget) || popupEl?.contains(relatedTarget))) return;
      if (consumeBlurGuard()) return;
      if (relatedTarget !== null) {
        applyClose("blur");
        return;
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!state.current.active || state.current.status === "ending" || state.current.status === "starting") return;
          const active = getDeepActiveElement(popupEl?.ownerDocument);
          if (active && (triggerEl?.contains(active) || popupEl?.contains(active))) return;
          applyClose("blur");
        });
      });
    }
  };
  function setTriggerElement(el) {
    triggerEl = el;
  }
  function setPopupElement(el) {
    if (!el && popupEl && state.current.active) tryHidePopover(popupEl);
    popupAbort?.abort();
    popupAbort = null;
    popupEl = el;
    if (el) {
      popupAbort = new AbortController();
      listen(el, "toggle", handlePopupToggle, { signal: popupAbort.signal });
      if (state.current.active) tryShowPopover(el);
    }
  }
  return {
    input: state,
    triggerProps,
    popupProps,
    get triggerElement() {
      return triggerEl;
    },
    setTriggerElement,
    setPopupElement,
    open,
    close,
    syncOpen,
    destroy: layer.destroy
  };
}

// node_modules/@videojs/core/dist/default/core/ui/menu/item.js
var MenuItemDataAttrs = {
  /**
  * Present on all navigable item types: Item, RadioItem, CheckboxItem, and the Trigger when acting as a submenu
  * trigger inside a parent menu. Use `[data-item]` as a shared selector to target all item types at once.
  */
  item: "data-item",
  /** Present when the item is highlighted. Set to `pointer` when pointer movement caused the highlight; otherwise empty. */
  highlighted: "data-highlighted"
};

// node_modules/@videojs/core/dist/default/core/ui/menu/vars.js
var MenuCSSVars = {
  /** Distance between the popup and the trigger along the side axis. */
  sideOffset: "--media-popover-side-offset",
  /** Distance between the popup and the trigger along the alignment axis. */
  alignOffset: "--media-popover-align-offset",
  /** Minimum distance between the popup and the positioning boundary. */
  boundaryOffset: "--media-popover-boundary-offset",
  /** Width of the trigger, set by popup positioning. */
  anchorWidth: "--media-popover-anchor-width",
  /** Height of the trigger, set by popup positioning. */
  anchorHeight: "--media-popover-anchor-height",
  /** Width of the active menu panel (px). */
  width: "--media-menu-width",
  /** Height of the active menu panel (px). */
  height: "--media-menu-height",
  /** Width available within the positioning boundary (px). */
  availableWidth: "--media-menu-available-width",
  /** Height available within the positioning boundary (px). */
  availableHeight: "--media-menu-available-height"
};

// node_modules/@videojs/core/dist/default/core/ui/popover/vars.js
var PopoverCSSVars = {
  /** Distance between the popup and the trigger along the side axis. */
  sideOffset: "--media-popover-side-offset",
  /** Distance between the popup and the trigger along the alignment axis. */
  alignOffset: "--media-popover-align-offset",
  /** Minimum distance between the popup and the positioning boundary. */
  boundaryOffset: "--media-popover-boundary-offset",
  /** The anchor element's width. */
  anchorWidth: "--media-popover-anchor-width",
  /** The anchor element's height. */
  anchorHeight: "--media-popover-anchor-height",
  /** Available width between the trigger and the boundary edge. */
  availableWidth: "--media-popover-available-width",
  /** Available height between the trigger and the boundary edge. */
  availableHeight: "--media-popover-available-height"
};

// node_modules/@videojs/core/dist/default/dom/ui/menu/menu.js
function isMenuNavigationKey(event) {
  const { key } = event;
  return key === "ArrowDown" || key === "ArrowUp" || key === "ArrowLeft" || key === "ArrowRight" || key === "Home" || key === "End" || key === "Enter" || key === " " || key === "Escape" || key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey;
}
function getRootPositionOptions(side, align) {
  if (!side || !align) return null;
  return {
    side,
    align
  };
}
var MenuPositioningCSSVars = {
  ...PopoverCSSVars,
  availableWidth: MenuCSSVars.availableWidth,
  availableHeight: MenuCSSVars.availableHeight
};
var parents = /* @__PURE__ */ new WeakMap();
function completeMenuItemSelection(menu) {
  menu.close();
}
function createMenu(options) {
  const items = [];
  let highlightedItem = null;
  let triggerElement = null;
  let contentElement = null;
  let popupElement = null;
  const submenus = /* @__PURE__ */ new Set();
  const submenuUnsubscribes = /* @__PURE__ */ new Map();
  let typeaheadBuffer = "";
  let typeaheadTimer = null;
  let pendingFocusOut = null;
  let openRafId = 0;
  let lastCloseReason = null;
  let api;
  function isItemHidden(item) {
    const availability = item.getAttribute("data-availability");
    return Boolean(item.hidden || item.hasAttribute("data-hidden") || item.getAttribute("aria-hidden") === "true" || availability === "unavailable" || availability === "unsupported");
  }
  function getNavigableItems() {
    return items.filter((item) => !isItemHidden(item));
  }
  function getAdjacentNavigableItem(direction) {
    if (items.length === 0) return null;
    const currentIndex = highlightedItem ? items.indexOf(highlightedItem) : direction === 1 ? -1 : 0;
    for (let offset = 1; offset <= items.length; offset++) {
      const index = (currentIndex + direction * offset + items.length) % items.length;
      const candidate = items[index];
      if (candidate && !isItemHidden(candidate)) return candidate;
    }
    return null;
  }
  function highlight(element, highlightOptions) {
    if (!element && openRafId) {
      cancelAnimationFrame(openRafId);
      openRafId = 0;
    }
    if (element && isItemHidden(element)) {
      if (element === highlightedItem) highlight(getAdjacentNavigableItem(1), highlightOptions);
      return;
    }
    if (highlightedItem === element) {
      element?.setAttribute(MenuItemDataAttrs.highlighted, highlightOptions?.pointer === true ? "pointer" : "");
      return;
    }
    const previousItem = highlightedItem;
    if (previousItem) previousItem.tabIndex = -1;
    highlightedItem = element;
    if (element) {
      element.tabIndex = 0;
      element.setAttribute(MenuItemDataAttrs.highlighted, highlightOptions?.pointer === true ? "pointer" : "");
      if (previousItem && compareItems(element, previousItem) < 0 && highlightOptions?.pointer) forceLayout(element.parentElement);
      previousItem?.removeAttribute(MenuItemDataAttrs.highlighted);
      if (highlightOptions?.focus !== false) {
        if (highlightOptions?.preventScroll) element.focus({ preventScroll: true });
        else element.focus();
      }
    } else previousItem?.removeAttribute(MenuItemDataAttrs.highlighted);
    options.onHighlightChange?.(element);
  }
  function clearHighlight() {
    if (highlightedItem) {
      highlightedItem.tabIndex = -1;
      highlightedItem.removeAttribute(MenuItemDataAttrs.highlighted);
      highlightedItem = null;
      options.onHighlightChange?.(null);
    }
  }
  function highlightFirstItem(options2) {
    highlight(getNavigableItems()[0] ?? null, options2);
  }
  function highlightInitialItem(options2) {
    highlight(getInitialHighlightItem(), options2);
  }
  function restoreFocus(focusOptions) {
    if (lastCloseReason === "imperative-action" || lastCloseReason === "group-open" || lastCloseReason === "blur" || lastCloseReason === "outside-click") return;
    if (focusOptions) triggerElement?.focus(focusOptions);
    else triggerElement?.focus();
  }
  function getInitialHighlightItem() {
    const navigableItems = getNavigableItems();
    return navigableItems.find((item) => item.matches('[role="menuitemradio"][aria-checked="true"], [aria-selected="true"]')) ?? navigableItems[0] ?? null;
  }
  function clearTypeahead() {
    if (typeaheadTimer !== null) {
      clearTimeout(typeaheadTimer);
      typeaheadTimer = null;
    }
    typeaheadBuffer = "";
  }
  function scheduleInitialHighlight() {
    cancelAnimationFrame(openRafId);
    openRafId = requestAnimationFrame(() => {
      openRafId = 0;
      if (!popover.input.current.active || popover.input.current.status === "ending" || highlightedItem) return;
      highlight(getInitialHighlightItem(), { preventScroll: true });
    });
  }
  function handleTypeahead(char) {
    typeaheadBuffer = typeaheadBuffer.length === 1 && typeaheadBuffer.toLowerCase() === char.toLowerCase() ? char : typeaheadBuffer + char;
    if (typeaheadTimer !== null) clearTimeout(typeaheadTimer);
    typeaheadTimer = setTimeout(clearTypeahead, 500);
    const navigableItems = getNavigableItems();
    const searchStart = (highlightedItem ? navigableItems.indexOf(highlightedItem) : -1) + 1;
    const candidates = [...navigableItems.slice(searchStart), ...navigableItems.slice(0, searchStart)];
    const needle = typeaheadBuffer.toLowerCase();
    const match = candidates.find((candidate) => {
      return (candidate.textContent?.trim().toLowerCase() ?? "").startsWith(needle);
    });
    if (match) highlight(match);
  }
  const popover = createPopover({
    transition: options.transition,
    deferOpenChanges: true,
    onOpenChange(open, details) {
      lastCloseReason = open ? null : details.reason;
      options.onOpenChange(open, details);
      if (open) scheduleInitialHighlight();
      else {
        clearHighlight();
        clearTypeahead();
      }
    },
    onOpenChangeComplete(open) {
      options.onOpenChangeComplete?.(open);
      if (!open && contentElement) {
        const active = getDeepActiveElement(contentElement.ownerDocument);
        if (!(active instanceof Element) || active === contentElement.ownerDocument.body || containsComposed(contentElement, active)) restoreFocus();
      }
    },
    closeOnEscape: options.closeOnEscape,
    closeOnOutsideClick: options.closeOnOutsideClick,
    ...options.group ? { group: options.group } : {}
  });
  const contentProps = {
    onFocusOut(event) {
      if (event.relatedTarget === null && hasClosingSubmenu()) {
        pendingFocusOut = event;
        return;
      }
      popover.popupProps.onFocusOut(event);
    },
    onKeyDown(event) {
      const { key } = event;
      const navigableItems = getNavigableItems();
      if (key !== "Escape" && isMenuNavigationKey(event) && !event.defaultPrevented) event.preventDefault();
      if (navigableItems.length === 0) return;
      switch (key) {
        case "ArrowDown":
          event.preventDefault();
          highlight(getAdjacentNavigableItem(1));
          break;
        case "ArrowUp":
          event.preventDefault();
          highlight(getAdjacentNavigableItem(-1));
          break;
        case "Home":
          event.preventDefault();
          highlight(navigableItems[0] ?? null);
          break;
        case "End":
          event.preventDefault();
          highlight(navigableItems[navigableItems.length - 1] ?? null);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (highlightedItem && navigableItems.includes(highlightedItem)) highlightedItem.click();
          break;
        default:
          if (key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) handleTypeahead(key);
      }
    }
  };
  function handleTriggerKeyDown(event) {
    const input = popover.input.current;
    if (!input.active || input.status === "ending") return;
    if (event.key === "Escape") return;
    if (!isMenuNavigationKey(event)) return;
    contentProps.onKeyDown(event);
    event.stopPropagation();
  }
  function setTriggerElement(element) {
    triggerElement = element;
    popover.setTriggerElement(element);
  }
  function setContentElement(element) {
    contentElement = element;
  }
  function setPopupElement(element) {
    popupElement = element;
    popover.setPopupElement(element);
  }
  function compareItems(a, b) {
    if (a === b) return 0;
    const position = a.compareDocumentPosition(b);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  }
  function registerItem(element) {
    const onFocus = () => highlight(element, { focus: false });
    element.tabIndex = -1;
    element.setAttribute(MenuItemDataAttrs.item, "");
    element.addEventListener("focus", onFocus);
    items.push(element);
    items.sort(compareItems);
    if (popover.input.current.active && popover.input.current.status !== "ending" && !highlightedItem) scheduleInitialHighlight();
    return () => {
      element.removeEventListener("focus", onFocus);
      const index = items.indexOf(element);
      if (index !== -1) items.splice(index, 1);
      if (highlightedItem === element) clearHighlight();
    };
  }
  function registerSubmenu(menu) {
    submenus.add(menu);
    parents.set(menu, api);
    const unsubscribe = menu.input.subscribe(handlePendingFocusOut);
    submenuUnsubscribes.set(menu, unsubscribe);
    return () => {
      submenus.delete(menu);
      if (parents.get(menu) === api) parents.delete(menu);
      submenuUnsubscribes.get(menu)?.();
      submenuUnsubscribes.delete(menu);
      handlePendingFocusOut();
    };
  }
  function hasClosingSubmenu() {
    return [...submenus].some(({ input }) => input.current.status === "ending");
  }
  function handlePendingFocusOut() {
    if (!pendingFocusOut || hasClosingSubmenu()) return;
    const event = pendingFocusOut;
    pendingFocusOut = null;
    popover.popupProps.onFocusOut(event);
  }
  function syncOpen(open) {
    if (open) parents.get(api)?.highlight(null);
    else for (const submenu of submenus) submenu.close("imperative-action");
    popover.syncOpen(open);
  }
  function destroy() {
    cancelAnimationFrame(openRafId);
    openRafId = 0;
    clearTypeahead();
    for (const unsubscribe of submenuUnsubscribes.values()) unsubscribe();
    for (const submenu of submenus) if (parents.get(submenu) === api) parents.delete(submenu);
    submenuUnsubscribes.clear();
    submenus.clear();
    parents.delete(api);
    pendingFocusOut = null;
    popover.destroy();
  }
  api = {
    input: popover.input,
    triggerProps: {
      onClick: popover.triggerProps.onClick,
      onKeyDown: handleTriggerKeyDown
    },
    contentProps,
    get triggerElement() {
      return triggerElement;
    },
    get contentElement() {
      return contentElement;
    },
    get popupElement() {
      return popupElement;
    },
    setTriggerElement,
    setContentElement,
    setPopupElement,
    registerItem,
    registerSubmenu,
    highlight,
    highlightFirstItem,
    highlightInitialItem,
    restoreFocus,
    open: popover.open,
    close: popover.close,
    syncOpen,
    destroy
  };
  return api;
}

// node_modules/@videojs/core/dist/default/core/ui/menu/data.js
var MenuPopupDataAttrs = {
  /** Present when the menu is open. */
  open: "data-open",
  /** Rendered positioning side after collision handling. Absent on submenus. */
  side: "data-side",
  /** Popover positioning alignment. Absent on submenus. */
  align: "data-align",
  ...TransitionDataAttrs
};
var MenuContentDataAttrs = {
  /** Present while this Content is active or transitioning out. */
  open: "data-open",
  /** Present on Content when this menu is nested inside a parent menu. */
  isSubmenu: "data-submenu",
  /** Present when this Content has an open logical child. */
  childOpen: "data-child-open",
  ...TransitionDataAttrs
};
var MenuDataAttrs = {
  ...MenuPopupDataAttrs,
  ...MenuContentDataAttrs
};

// node_modules/@videojs/core/dist/default/dom/ui/menu/popup.js
function createMenuPopup() {
  const contents = /* @__PURE__ */ new Set();
  const exitFrames = /* @__PURE__ */ new Map();
  let element = null;
  let frame = 0;
  function scheduleSync() {
    cancelAnimationFrame(frame);
    sync();
    frame = requestAnimationFrame(sync);
  }
  function getChildren(parent) {
    return [...contents].filter((content) => content.parent === parent);
  }
  function getActiveChild(parent) {
    return getChildren(parent).find(({ menu }) => {
      const input = menu.input.current;
      return input.active && input.status !== "ending";
    }) ?? null;
  }
  function getClosingChild(parent) {
    return getChildren(parent).find(({ menu }) => {
      const input = menu.input.current;
      return input.active && input.status === "ending";
    }) ?? null;
  }
  function cancelChildExit(content) {
    cancelAnimationFrame(exitFrames.get(content) ?? 0);
    exitFrames.delete(content);
  }
  function scheduleChildExit(content) {
    if (exitFrames.has(content)) return;
    const exitFrame = requestAnimationFrame(() => {
      exitFrames.set(content, requestAnimationFrame(() => {
        exitFrames.delete(content);
        if (!contents.has(content) || getActiveChild(content.menu)) return;
        content.element.removeAttribute(MenuContentDataAttrs.childOpen);
        sync();
      }));
    });
    exitFrames.set(content, exitFrame);
  }
  function getCurrentContent() {
    let current = [...contents].find((content) => content.parent === null) ?? null;
    while (current) {
      const child = getActiveChild(current.menu) ?? (exitFrames.has(current) ? getClosingChild(current.menu) : null);
      if (!child) return current;
      current = child;
    }
    return null;
  }
  function setInactive(content, inactive) {
    if (inactive) {
      content.element.setAttribute("aria-hidden", "true");
      content.element.setAttribute("inert", "");
    } else restoreAttributes(content.element, content.accessibility);
  }
  function restoreFocusBeforeHiding(content) {
    const hasFocus = () => {
      const active2 = getDeepActiveElement(content.element.ownerDocument);
      return active2 instanceof Element && containsComposed(content.element, active2);
    };
    if (!hasFocus()) return;
    content.menu.restoreFocus();
    const parentInput = content.parent?.input.current;
    if (hasFocus() && parentInput?.active && parentInput.status !== "ending") content.menu.triggerElement?.focus();
    const active = getDeepActiveElement(content.element.ownerDocument);
    if (hasFocus() && active instanceof HTMLElement) active.blur();
  }
  function getAvailableWidth(popup) {
    return walkAncestors(popup, (ancestor) => {
      const width = readCSSLength(ancestor, MenuCSSVars.availableWidth);
      return width !== null && width > 0 ? width : void 0;
    }) ?? null;
  }
  function getVerticalScrollbarWidth(content) {
    if (content.scrollHeight <= content.clientHeight) return 0;
    const style = getComputedStyle(content);
    const inlineBorder = (Number.parseFloat(style.borderInlineStartWidth) || 0) + (Number.parseFloat(style.borderInlineEndWidth) || 0);
    return Math.max(0, content.offsetWidth - content.clientWidth - inlineBorder);
  }
  function measureContent(content, availableWidth) {
    const children = getElementChildren(content, (child) => child instanceof HTMLElement && !child.hidden);
    if (children.length === 0) return measureElement(content, {
      overflow: "both",
      styles: {
        width: "max-content",
        height: "auto",
        minWidth: "0px",
        maxWidth: "none"
      }
    });
    return measureElementChildren(content, {
      children,
      includePadding: true,
      maxWidth: availableWidth,
      measure: (child, width) => measureElement(child, {
        overflow: "both",
        styles: {
          insetInlineStart: "0px",
          insetInlineEnd: "auto",
          width: width === void 0 ? "max-content" : `${width}px`,
          height: "auto",
          minWidth: "0px",
          maxWidth: "none"
        }
      })
    });
  }
  function sync() {
    if (!element) return;
    const inactiveContents = /* @__PURE__ */ new Map();
    for (const content of contents) {
      const activeChild = getActiveChild(content.menu);
      if (activeChild) {
        cancelChildExit(content);
        content.menu.highlight(null);
        content.element.setAttribute(MenuContentDataAttrs.childOpen, "");
      } else if (getClosingChild(content.menu) && content.element.hasAttribute(MenuContentDataAttrs.childOpen)) scheduleChildExit(content);
      else {
        cancelChildExit(content);
        content.element.removeAttribute(MenuContentDataAttrs.childOpen);
      }
      const input = content.menu.input.current;
      const isExitingPage = content.parent !== null && input.active && input.status === "ending";
      inactiveContents.set(content, activeChild !== null || isExitingPage);
      setInactive(content, false);
    }
    for (const [content, inactive] of inactiveContents) {
      const input = content.menu.input.current;
      if (content.parent !== null && input.active && input.status === "ending") restoreFocusBeforeHiding(content);
      setInactive(content, inactive);
    }
    const current = getCurrentContent();
    if (!current) return;
    const popupPadding = current.parent === null ? getElementPadding(element) : null;
    const inlinePadding = popupPadding ? getInlineExtent(popupPadding) : 0;
    const blockPadding = popupPadding ? getBlockExtent(popupPadding) : 0;
    const availableWidth = getAvailableWidth(element);
    const contentAvailableWidth = availableWidth === null ? null : Math.max(0, availableWidth - inlinePadding);
    const size = measureContent(current.element, contentAvailableWidth);
    const width = Math.ceil(size.width + inlinePadding);
    const height = Math.ceil(size.height + blockPadding);
    element.style.setProperty(MenuCSSVars.width, `${width}px`);
    element.style.setProperty(MenuCSSVars.height, `${height}px`);
    const scrollbarWidth = getVerticalScrollbarWidth(current.element);
    if (scrollbarWidth > 0) element.style.setProperty(MenuCSSVars.width, `${width + scrollbarWidth}px`);
  }
  function setElement(next) {
    element = next;
    scheduleSync();
  }
  function registerContent(registration) {
    const registered = {
      ...registration,
      accessibility: snapshotAttributes(registration.element, ["aria-hidden", "inert"]),
      stopObserving: () => {
      },
      unsubscribe: () => {
      }
    };
    registered.unsubscribe = registration.menu.input.subscribe(scheduleSync);
    registered.stopObserving = observeElements({
      root: registration.element,
      getElements: () => [registration.element],
      mutations: {
        childList: true,
        subtree: true,
        characterData: true
      },
      onChange: scheduleSync
    });
    contents.add(registered);
    registration.menu.setContentElement(registration.element);
    scheduleSync();
    return () => {
      cancelChildExit(registered);
      contents.delete(registered);
      registered.unsubscribe();
      registered.stopObserving();
      restoreAttributes(registration.element, registered.accessibility);
      registration.element.removeAttribute(MenuContentDataAttrs.childOpen);
      if (registration.menu.contentElement === registration.element) registration.menu.setContentElement(null);
      scheduleSync();
    };
  }
  function destroy() {
    cancelAnimationFrame(frame);
    for (const exitFrame of exitFrames.values()) cancelAnimationFrame(exitFrame);
    exitFrames.clear();
    for (const content of contents) {
      content.unsubscribe();
      content.stopObserving();
      restoreAttributes(content.element, content.accessibility);
      content.element.removeAttribute(MenuContentDataAttrs.childOpen);
      if (content.menu.contentElement === content.element) content.menu.setContentElement(null);
    }
    contents.clear();
    element = null;
  }
  return {
    get element() {
      return element;
    },
    setElement,
    registerContent,
    sync,
    destroy
  };
}

// node_modules/@videojs/core/dist/default/dom/ui/popover/group.js
function createPopupGroup() {
  let current = null;
  const listeners = /* @__PURE__ */ new Set();
  function notify2() {
    for (const listener of listeners) listener();
  }
  return {
    open(member) {
      if (current === member) return;
      const previous = current;
      current = member;
      previous?.close("group-open");
      notify2();
    },
    close(member) {
      if (current !== member) return;
      current = null;
      notify2();
    },
    isOpenFor(trigger) {
      return trigger !== null && current?.triggerElement === trigger;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

// node_modules/@videojs/core/dist/default/dom/utils/event.js
function isEventWithinElement(event, element) {
  if (!element) return false;
  if (isFunction(event.composedPath)) return event.composedPath().includes(element);
  const target = event.target;
  return target instanceof Node && element.contains(target);
}

// node_modules/@videojs/core/dist/default/dom/ui/popover/positioning.js
var ZERO_OFFSETS = {
  sideOffset: 0,
  alignOffset: 0,
  boundaryOffset: 0
};
var OPPOSITE_SIDE = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
};
function formatPixels(value) {
  return `${clamp(value, 0, Infinity)}px`;
}
function shiftCrossAxis(value, boundaryStart, boundaryEnd, size) {
  const max = boundaryEnd - size;
  return max < boundaryStart ? boundaryStart : clamp(value, boundaryStart, max);
}
function getHorizontalAlign({ align, direction = "ltr" }) {
  if (direction !== "rtl") return align;
  return align === "start" ? "end" : align === "end" ? "start" : align;
}
function getAnchorCrossAxisShift(start, end, size, boundaryStart, boundaryEnd, align, alignOffset, boundaryOffset, axis, alignOffsetVar) {
  const base = align === "start" ? start + alignOffset : align === "end" ? end + alignOffset : start + size / 2 + alignOffset;
  const startAnchor = axis === "horizontal" ? "left" : "top";
  const endAnchor = OPPOSITE_SIDE[startAnchor];
  const anchor = align === "start" ? startAnchor : align === "end" ? endAnchor : "center";
  const desiredTranslate = align === "start" ? "0px" : align === "end" ? "-100%" : "-50%";
  return {
    base: `calc(anchor(${anchor}) + ${alignOffsetVar})`,
    translate: `clamp(${boundaryStart + boundaryOffset - base}px, ${desiredTranslate}, calc(${boundaryEnd - boundaryOffset - base}px - 100%))`
  };
}
function getAnchorPositionStyle(anchorName, opts, triggerRect, popupRect, boundaryRect, offsets, cssVars = PopoverCSSVars) {
  if (supportsAnchorPositioning()) return {
    ...getAnchorPositionCSS(anchorName, opts, cssVars, triggerRect, boundaryRect, offsets),
    ...triggerRect && boundaryRect ? getPositioningCSSVars(triggerRect, boundaryRect, opts, offsets, cssVars) : {}
  };
  if (triggerRect && popupRect) {
    const resolved = offsets ?? ZERO_OFFSETS;
    return {
      position: "fixed",
      margin: "0",
      ...getManualPositionStyle(triggerRect, popupRect, opts, resolved, boundaryRect),
      ...boundaryRect ? getPositioningCSSVars(triggerRect, boundaryRect, opts, resolved, cssVars) : {}
    };
  }
  return {};
}
function getAnchorPositionCSS(anchorName, opts, cssVars = PopoverCSSVars, triggerRect, boundaryRect, offsets = ZERO_OFFSETS) {
  const SIDE_OFFSET_VAR = `var(${cssVars.sideOffset}, 0px)`;
  const ALIGN_OFFSET_VAR = `var(${cssVars.alignOffset}, 0px)`;
  const { side, align } = opts;
  const boundaryOffset = offsets.boundaryOffset ?? 0;
  const style = {
    positionAnchor: `--${anchorName}`,
    position: "fixed",
    inset: "auto",
    margin: "0",
    justifySelf: "normal",
    alignSelf: "normal",
    marginInlineStart: "0",
    marginBlockStart: "0",
    translate: "none"
  };
  const insetProp = OPPOSITE_SIDE[side];
  if (side === "top" || side === "bottom") {
    const horizontalAlign = getHorizontalAlign(opts);
    style[insetProp] = `calc(anchor(${side}) + ${SIDE_OFFSET_VAR})`;
    if (triggerRect && boundaryRect) {
      const { base, translate } = getAnchorCrossAxisShift(triggerRect.left, triggerRect.right, triggerRect.width, boundaryRect.left, boundaryRect.right, horizontalAlign, offsets.alignOffset, boundaryOffset, "horizontal", ALIGN_OFFSET_VAR);
      style.left = base;
      style.translate = `${translate} 0`;
      return style;
    }
    if (horizontalAlign === "start") style.left = `calc(anchor(left) + ${ALIGN_OFFSET_VAR})`;
    else if (horizontalAlign === "end") style.right = `calc(anchor(right) + ${ALIGN_OFFSET_VAR})`;
    else {
      style.justifySelf = "anchor-center";
      style.marginInlineStart = ALIGN_OFFSET_VAR;
    }
  } else {
    style[insetProp] = `calc(anchor(${side}) + ${SIDE_OFFSET_VAR})`;
    if (triggerRect && boundaryRect) {
      const { base, translate } = getAnchorCrossAxisShift(triggerRect.top, triggerRect.bottom, triggerRect.height, boundaryRect.top, boundaryRect.bottom, align, offsets.alignOffset, boundaryOffset, "vertical", ALIGN_OFFSET_VAR);
      style.top = base;
      style.translate = `0 ${translate}`;
      return style;
    }
    if (align === "start") style.top = `calc(anchor(top) + ${ALIGN_OFFSET_VAR})`;
    else if (align === "end") style.bottom = `calc(anchor(bottom) + ${ALIGN_OFFSET_VAR})`;
    else {
      style.alignSelf = "anchor-center";
      style.marginBlockStart = ALIGN_OFFSET_VAR;
    }
  }
  return style;
}
function getPositioningCSSVars(triggerRect, boundaryRect, opts, offsets = ZERO_OFFSETS, cssVars = PopoverCSSVars) {
  const vars = {};
  const { side } = opts;
  const boundaryOffset = offsets.boundaryOffset ?? 0;
  const boundaryStartX = boundaryRect.left + boundaryOffset;
  const boundaryEndX = boundaryRect.right - boundaryOffset;
  const boundaryStartY = boundaryRect.top + boundaryOffset;
  const boundaryEndY = boundaryRect.bottom - boundaryOffset;
  vars[cssVars.anchorWidth] = `${triggerRect.width}px`;
  vars[cssVars.anchorHeight] = `${triggerRect.height}px`;
  if (side === "top" || side === "bottom") {
    const sideSpace = side === "top" ? triggerRect.top - boundaryStartY : boundaryEndY - triggerRect.bottom;
    vars[cssVars.availableHeight] = formatPixels(sideSpace - offsets.sideOffset);
    vars[cssVars.availableWidth] = formatPixels(boundaryEndX - boundaryStartX);
  } else {
    const sideSpace = side === "left" ? triggerRect.left - boundaryStartX : boundaryEndX - triggerRect.right;
    vars[cssVars.availableWidth] = formatPixels(sideSpace - offsets.sideOffset);
    vars[cssVars.availableHeight] = formatPixels(boundaryEndY - boundaryStartY);
  }
  return vars;
}
function getManualPositionStyle(triggerRect, popupRect, opts, offsets = {
  sideOffset: 0,
  alignOffset: 0
}, boundaryRect) {
  const { side, align } = opts;
  const { sideOffset, alignOffset } = offsets;
  let top = 0;
  let bottom;
  let left = 0;
  let right;
  if (side === "top") bottom = `calc(100% - ${triggerRect.top}px + ${sideOffset}px)`;
  else if (side === "bottom") top = triggerRect.bottom + sideOffset;
  else if (side === "left") right = `calc(100% - ${triggerRect.left}px + ${sideOffset}px)`;
  else left = triggerRect.right + sideOffset;
  if (side === "top" || side === "bottom") {
    const horizontalAlign = getHorizontalAlign(opts);
    if (horizontalAlign === "start") left = triggerRect.left + alignOffset;
    else if (horizontalAlign === "end") left = triggerRect.right - popupRect.width + alignOffset;
    else left = triggerRect.left + (triggerRect.width - popupRect.width) / 2 + alignOffset;
  } else if (align === "start") top = triggerRect.top + alignOffset;
  else if (align === "end") top = triggerRect.bottom - popupRect.height + alignOffset;
  else top = triggerRect.top + (triggerRect.height - popupRect.height) / 2 + alignOffset;
  if (boundaryRect) {
    const boundaryOffset = offsets.boundaryOffset ?? 0;
    if (side === "top" || side === "bottom") left = shiftCrossAxis(left, boundaryRect.left + boundaryOffset, boundaryRect.right - boundaryOffset, popupRect.width);
    else top = shiftCrossAxis(top, boundaryRect.top + boundaryOffset, boundaryRect.bottom - boundaryOffset, popupRect.height);
  }
  return {
    top: side === "top" ? "auto" : `${top}px`,
    bottom: bottom ?? "auto",
    left: side === "left" ? "auto" : `${left}px`,
    right: right ?? "auto"
  };
}
function resolveOffsets(el, cssVars = PopoverCSSVars) {
  const computed = getComputedStyle(el);
  return {
    sideOffset: resolveCSSLength(el, computed.getPropertyValue(cssVars.sideOffset)),
    alignOffset: resolveCSSLength(el, computed.getPropertyValue(cssVars.alignOffset)),
    boundaryOffset: resolveCSSLength(el, computed.getPropertyValue(cssVars.boundaryOffset))
  };
}
function getPopupPositionRect(el, side) {
  const rect = el.getBoundingClientRect();
  const size = getElementSize(el, {
    box: "layout",
    overflow: side === "left" || side === "right" ? "width" : "height"
  });
  return createDOMRect(rect.left, rect.top, size.width, size.height);
}
function getFixedContainingBlockOrigin(popup) {
  const parent = popup.parentNode;
  if (opensInTopLayer(popup) || !parent) return {
    x: 0,
    y: 0
  };
  const probe = popup.ownerDocument.createElement("div");
  probe.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;margin:0;padding:0;border:0;visibility:hidden;pointer-events:none";
  parent.insertBefore(probe, popup);
  const rect = probe.getBoundingClientRect();
  probe.remove();
  return {
    x: rect.left,
    y: rect.top
  };
}
function offsetRect(rect, origin) {
  return createDOMRect(rect.left - origin.x, rect.top - origin.y, rect.width, rect.height);
}
function opensInTopLayer(popup) {
  return popup.hasAttribute("popover") && supportsPopoverAPI();
}

// node_modules/@videojs/core/dist/default/dom/ui/popover/positioner.js
var POPUP_STYLE_PROPS = [
  "position",
  "inset",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "justify-self",
  "align-self",
  "margin-inline-start",
  "margin-block-start",
  "translate",
  "top",
  "right",
  "bottom",
  "left"
];
var PopupPositioner = class {
  #options = null;
  #boundaryElement = null;
  #abort = null;
  #stopObservingResize = null;
  #triggerAnchorName = null;
  #triggerAnchorAdded = false;
  #popupAnchor = null;
  #popupStyles = null;
  #reposition = rafThrottle(() => this.#position());
  sync(options) {
    const { anchorName, position, trigger, popup, boundary, container, cssVars = PopoverCSSVars } = options;
    if (!position || !trigger || !popup) {
      this.cleanup();
      return;
    }
    const boundaryElement = resolvePositioningBoundary(boundary, {
      container: container ?? null,
      root: popup.getRootNode()
    });
    const previous = this.#options;
    if (!previous || previous.anchorName !== anchorName || previous.trigger !== trigger || previous.popup !== popup || (previous.cssVars ?? PopoverCSSVars) !== cssVars || previous.trackResize !== options.trackResize || this.#boundaryElement !== boundaryElement) {
      if (previous?.popup) this.#restorePopupStyles(previous.popup);
      this.#stopTracking();
      this.#options = {
        ...options,
        cssVars
      };
      this.#boundaryElement = boundaryElement;
      this.#startTracking();
    } else this.#options = {
      ...options,
      cssVars
    };
    this.#position();
  }
  cleanup() {
    if (!this.#options) return;
    if (this.#options.popup) this.#restorePopupStyles(this.#options.popup);
    this.#stopTracking();
    this.#options = null;
    this.#boundaryElement = null;
  }
  #startTracking() {
    const options = this.#options;
    if (!options?.trigger || !options.popup) return;
    this.#applyAnchorStyles(options.trigger, options.popup, options.anchorName);
    this.#abort = new AbortController();
    const { signal } = this.#abort;
    window.addEventListener("scroll", this.#schedule, {
      capture: true,
      passive: true,
      signal
    });
    window.addEventListener("resize", this.#schedule, { signal });
    const resizeTargets = [options.trigger];
    if (options.trackResize !== false) resizeTargets.push(options.popup);
    if (this.#boundaryElement) resizeTargets.push(this.#boundaryElement);
    this.#stopObservingResize = observeResize(resizeTargets, () => this.#schedule());
  }
  #stopTracking() {
    this.#abort?.abort();
    this.#abort = null;
    this.#stopObservingResize?.();
    this.#stopObservingResize = null;
    this.#reposition.cancel();
    this.#restoreAnchorStyles();
  }
  #schedule = (event) => {
    const popup = this.#options?.popup;
    if (!popup || event && isEventWithinElement(event, popup)) return;
    this.#reposition();
  };
  #position() {
    const options = this.#options;
    if (!options?.position || !options.trigger || !options.popup) return;
    const trigger = options.trigger;
    const anchorSupported = supportsAnchorPositioning();
    const origin = anchorSupported ? {
      x: 0,
      y: 0
    } : getFixedContainingBlockOrigin(options.popup);
    const triggerRect = offsetRect(trigger.getBoundingClientRect(), origin);
    const boundaryRect = offsetRect(getPositioningBoundaryRect(this.#boundaryElement), origin);
    const offsets = resolveOffsets(options.popup, options.cssVars);
    const preferredPosition = options.position;
    const measure = () => offsetRect(getPopupPositionRect(options.popup, preferredPosition.side), origin);
    const getPosition = (popupRect2) => {
      const side = getPositionedSide(triggerRect, popupRect2, boundaryRect, preferredPosition, offsets);
      const { positionAnchor: _, ...style } = getAnchorPositionStyle(options.anchorName, {
        ...preferredPosition,
        side,
        direction: isRTL(trigger) ? "rtl" : "ltr"
      }, triggerRect, anchorSupported ? void 0 : popupRect2, boundaryRect, offsets, options.cssVars);
      return {
        popupRect: popupRect2,
        side,
        style
      };
    };
    const position = getPosition(measure());
    this.#capturePopupStyles(options.popup, options.cssVars ?? PopoverCSSVars);
    applyStyles(options.popup, position.style);
    options.onSideChange?.(position.side);
    if (anchorSupported || !options.onSideChange) return;
    const popupRect = measure();
    if (popupRect.width === position.popupRect.width && popupRect.height === position.popupRect.height) return;
    const nextPosition = getPosition(popupRect);
    applyStyles(options.popup, nextPosition.style);
    if (nextPosition.side !== position.side) options.onSideChange(nextPosition.side);
  }
  #capturePopupStyles(popup, cssVars) {
    if (this.#popupStyles) return;
    const props = [
      ...POPUP_STYLE_PROPS,
      cssVars.anchorWidth,
      cssVars.anchorHeight,
      cssVars.availableWidth,
      cssVars.availableHeight
    ];
    this.#popupStyles = snapshotInlineStyles(popup, props);
  }
  #restorePopupStyles(popup) {
    if (!this.#popupStyles) return;
    restoreInlineStyles(popup, this.#popupStyles);
    this.#popupStyles = null;
  }
  #applyAnchorStyles(trigger, popup, anchorName) {
    if (!supportsAnchorPositioning()) return;
    const generatedName = `--${anchorName}`;
    const triggerAnchor = this.#readStyle(trigger, "anchor-name");
    this.#popupAnchor = this.#readStyle(popup, "position-anchor");
    const names = getAnchorNames(trigger);
    this.#triggerAnchorName = generatedName;
    this.#triggerAnchorAdded = !names.includes(generatedName);
    if (this.#triggerAnchorAdded) names.push(generatedName);
    trigger.style.setProperty("anchor-name", names.join(", "), triggerAnchor.priority);
    popup.style.setProperty("position-anchor", generatedName);
  }
  #restoreAnchorStyles() {
    const options = this.#options;
    if (!options?.trigger || !options.popup) return;
    if (this.#triggerAnchorName && this.#triggerAnchorAdded) {
      const current = this.#readStyle(options.trigger, "anchor-name");
      const names = getAnchorNames(options.trigger).filter((name) => name !== this.#triggerAnchorName);
      this.#writeStyle(options.trigger, "anchor-name", {
        value: names.join(", "),
        priority: current.priority
      });
    }
    if (this.#popupAnchor) this.#writeStyle(options.popup, "position-anchor", this.#popupAnchor);
    this.#triggerAnchorName = null;
    this.#triggerAnchorAdded = false;
    this.#popupAnchor = null;
  }
  #readStyle(element, prop) {
    const name = prop.startsWith("--") ? prop : kebabCase(prop);
    return {
      value: element.style.getPropertyValue(name),
      priority: element.style.getPropertyPriority(name)
    };
  }
  #writeStyle(element, prop, style) {
    const name = prop.startsWith("--") ? prop : kebabCase(prop);
    if (style.value) element.style.setProperty(name, style.value, style.priority);
    else element.style.removeProperty(name);
  }
};

// node_modules/@videojs/core/dist/default/dom/utils/pointer.js
function getPercentFromPointerEvent(event, rect, orientation) {
  let ratio;
  if (orientation === "vertical") ratio = 1 - (event.clientY - rect.top) / rect.height;
  else ratio = (event.clientX - rect.left) / rect.width;
  if (!Number.isFinite(ratio)) return 0;
  return clamp(ratio * 100, 0, 100);
}

// node_modules/@videojs/core/dist/default/dom/ui/slider/slider.js
var DRAG_THRESHOLD = 3;
function createSlider(options) {
  const input = createState({
    pointerPercent: 0,
    dragPercent: 0,
    dragging: false,
    pointing: false,
    focused: false
  });
  const abort = new AbortController();
  const changeThrottleMs = options.changeThrottle ?? 0;
  let isPointerDown = false, cachedRect = null, capturedPointerId = null, pointerDownX = 0, pointerDownY = 0, lastDragPercent = 0, lastKeyPercent = null, committedOnRelease = false, pointingOnRelease = false;
  const throttledChange = changeThrottleMs > 0 ? throttle((percent) => options.onValueChange?.(percent), changeThrottleMs, { leading: true }) : null;
  function fireChange(percent, duringDrag) {
    if (duringDrag && throttledChange) throttledChange(percent);
    else options.onValueChange?.(percent);
  }
  function releaseCapture() {
    if (isNull(capturedPointerId)) return;
    const id = capturedPointerId;
    capturedPointerId = null;
    try {
      options.getElement().releasePointerCapture(id);
    } catch {
    }
  }
  function endDrag() {
    if (!isPointerDown) return;
    const pointing = committedOnRelease && pointingOnRelease;
    const wasDragging = input.current.dragging;
    if (!committedOnRelease) options.onValueCommit?.(lastDragPercent);
    isPointerDown = false;
    input.patch({
      dragging: false,
      pointing
    });
    if (wasDragging) options.onDragEnd?.();
    options.onPressEnd?.();
    committedOnRelease = false;
    pointingOnRelease = false;
    cleanup();
  }
  function cleanup() {
    throttledChange?.cancel();
    capturedPointerId = null;
    cachedRect = null;
  }
  const rootProps = {
    onPointerDown(event) {
      if (options.isDisabled() || event.button !== 0 || event.isPrimary === false || isPointerDown) return;
      event.stopPropagation();
      event.preventDefault();
      const el = options.getElement();
      cachedRect = el.getBoundingClientRect();
      committedOnRelease = false;
      pointingOnRelease = false;
      releaseCapture();
      capturedPointerId = event.pointerId;
      el.setPointerCapture(event.pointerId);
      const percent = getPercentFromPointerEvent(event, cachedRect, options.getOrientation());
      isPointerDown = true;
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
      lastDragPercent = percent;
      lastKeyPercent = percent;
      input.patch({
        pointing: true,
        pointerPercent: percent,
        dragPercent: percent
      });
      options.onPressStart?.();
      options.onValueChange?.(percent);
      options.getThumbElement?.()?.focus({
        preventScroll: true,
        focusVisible: false
      });
    },
    onPointerMove(event) {
      if (options.isDisabled() || !isNull(capturedPointerId) && event.pointerId !== capturedPointerId) return;
      if (!isNull(capturedPointerId)) {
        if (event.pointerType !== "touch" && event.buttons === 0) {
          endDrag();
          return;
        }
        const percent2 = getPercentFromPointerEvent(event, cachedRect, options.getOrientation());
        const startingDrag = !input.current.dragging;
        if (startingDrag) {
          if (Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) < DRAG_THRESHOLD) return;
        }
        lastDragPercent = percent2;
        lastKeyPercent = percent2;
        input.patch({
          dragging: true,
          dragPercent: percent2,
          pointerPercent: percent2
        });
        if (startingDrag) options.onDragStart?.();
        fireChange(percent2, true);
        return;
      }
      const rect = options.getElement().getBoundingClientRect();
      const percent = getPercentFromPointerEvent(event, rect, options.getOrientation());
      input.patch({
        pointing: true,
        pointerPercent: percent
      });
    },
    onPointerUp(event) {
      if (options.isDisabled() || event.pointerId !== capturedPointerId) return;
      event.stopPropagation();
      if (isNull(capturedPointerId)) return;
      const percent = getPercentFromPointerEvent(event, cachedRect, options.getOrientation());
      pointingOnRelease = event.pointerType !== "touch" && isPointInElement(options.getElement(), event);
      throttledChange?.cancel();
      options.onValueChange?.(percent);
      options.onValueCommit?.(percent);
      committedOnRelease = true;
    },
    onPointerLeave() {
      if (!isNull(capturedPointerId)) return;
      input.patch({ pointing: false });
    },
    onPointerCancel(event) {
      if (event.pointerId !== capturedPointerId) return;
      throttledChange?.cancel();
      releaseCapture();
      endDrag();
    },
    onLostPointerCapture(event) {
      if (event.pointerId === capturedPointerId) endDrag();
    }
  };
  const thumbProps = {
    onKeyDownCapture(event) {
      if (options.isDisabled()) {
        if (event.key !== "Tab") event.preventDefault();
        return;
      }
      const stepPercent = options.getStepPercent();
      const largeStepPercent = options.getLargeStepPercent();
      const currentPercent = event.repeat && !isNull(lastKeyPercent) ? lastKeyPercent : options.getPercent();
      const rounded = roundToStep(currentPercent, stepPercent, 0);
      const step = event.shiftKey ? largeStepPercent : stepPercent;
      let newPercent = null;
      switch (event.key) {
        case "ArrowRight":
          newPercent = rounded + step;
          break;
        case "ArrowLeft":
          newPercent = rounded - step;
          break;
        case "ArrowUp":
          newPercent = rounded + step;
          break;
        case "ArrowDown":
          newPercent = rounded - step;
          break;
        case "PageUp":
          newPercent = rounded + largeStepPercent;
          break;
        case "PageDown":
          newPercent = rounded - largeStepPercent;
          break;
        case "Home":
          newPercent = 0;
          break;
        case "End":
          newPercent = 100;
      }
      if (newPercent !== null) {
        event.preventDefault();
        newPercent = clamp(newPercent, 0, 100);
        lastKeyPercent = newPercent;
        input.patch({
          pointerPercent: newPercent,
          dragPercent: newPercent,
          pointing: false
        });
        options.onValueChange?.(newPercent);
        options.onValueCommit?.(newPercent);
      }
    },
    onFocus() {
      input.patch({ focused: true });
    },
    onBlur() {
      input.patch({ focused: false });
    }
  };
  function adjustForAlignment(state) {
    if (!options.adjustPercent || state.thumbAlignment !== "edge") return state;
    const rootEl = options.getElement();
    const thumbEl = options.getThumbElement?.();
    if (!thumbEl) return state;
    const isHorizontal = state.orientation === "horizontal";
    const thumbSize = isHorizontal ? thumbEl.offsetWidth : thumbEl.offsetHeight;
    const trackSize = isHorizontal ? rootEl.offsetWidth : rootEl.offsetHeight;
    return {
      ...state,
      fillPercent: options.adjustPercent(state.fillPercent, thumbSize, trackSize),
      pointerPercent: options.adjustPercent(state.pointerPercent, thumbSize, trackSize)
    };
  }
  let stopObservingResize = null;
  if (options.onResize) stopObservingResize = observeResize(options.getElement(), () => options.onResize());
  return {
    input,
    rootProps,
    rootStyle: {
      touchAction: "none",
      userSelect: "none"
    },
    thumbProps,
    adjustForAlignment,
    destroy() {
      if (abort.signal.aborted) return;
      abort.abort();
      stopObservingResize?.();
      releaseCapture();
      cleanup();
    }
  };
}

// node_modules/@videojs/core/dist/default/core/ui/slider/vars.js
var SliderCSSVars = {
  /** Fill level percentage (0–100). */
  fill: "--media-slider-fill",
  /** Pointer position percentage (0–100). */
  pointer: "--media-slider-pointer",
  /** Buffer level percentage (0–100). */
  buffer: "--media-slider-buffer"
};

// node_modules/@videojs/core/dist/default/dom/ui/slider/css-vars.js
function getSliderCSSVars(state) {
  return {
    [SliderCSSVars.fill]: `${state.fillPercent.toFixed(3)}%`,
    [SliderCSSVars.pointer]: `${state.pointerPercent.toFixed(3)}%`
  };
}
function getTimeSliderCSSVars(state) {
  return {
    ...getSliderCSSVars(state),
    [SliderCSSVars.buffer]: `${state.bufferPercent.toFixed(3)}%`
  };
}
function getSliderPreviewStyle(width, overflow) {
  const halfWidth = width / 2;
  return {
    position: "absolute",
    left: overflow === "visible" ? `calc(var(${SliderCSSVars.pointer}) - ${halfWidth}px)` : `min(max(0px, calc(var(${SliderCSSVars.pointer}) - ${halfWidth}px)), calc(100% - ${width}px))`,
    width: "max-content",
    pointerEvents: "none"
  };
}

// node_modules/@videojs/core/dist/default/dom/ui/slider/focus.js
function isSliderFocused(root = document) {
  const doc = isDocument(root) ? root : root.ownerDocument;
  const active = getDeepActiveElement(doc);
  if (active?.getAttribute("role") !== "slider") return false;
  return isDocument(root) || containsComposed(root, active);
}

// node_modules/@videojs/core/dist/default/dom/ui/time-slider/seek.js
function createTimeSliderSeek(property) {
  const state = createState({ percent: void 0 });
  let cancel;
  let seeking = false;
  let element = null;
  function frame() {
    const transitioning = element?.getAnimations?.().some((animation) => "transitionProperty" in animation && animation.transitionProperty === property && animation.playState !== "finished");
    if (seeking || transitioning) {
      cancel = animationFrame(frame);
      return;
    }
    cancel = void 0;
    state.patch({ percent: void 0 });
  }
  function seek(percent) {
    cancel?.();
    state.patch({ percent });
    cancel = animationFrame(frame);
  }
  return {
    state,
    seek,
    update(next, percent, el) {
      element = el;
      if (next && !seeking && state.current.percent === void 0) seek(percent);
      seeking = next;
    },
    destroy() {
      cancel?.();
      cancel = void 0;
      seeking = false;
      element = null;
      state.patch({ percent: void 0 });
    }
  };
}

// node_modules/@videojs/core/dist/default/dom/ui/status-announcer.js
function subscribeToStatusAnnouncer(store, core) {
  let active = true;
  let pending = false;
  let target = store.target;
  let revision = 0;
  const baseline = () => {
    target = store.target;
    pending = true;
    const current = ++revision;
    core.resetSnapshot();
    queueMicrotask(() => {
      if (!active || current !== revision) return;
      pending = false;
      target = store.target;
      if (target) core.processSnapshot(getMediaSnapshot(store));
    });
  };
  const unsubscribe = store.subscribe(() => {
    const nextTarget = store.target;
    if (nextTarget !== target) {
      baseline();
      return;
    }
    if (!nextTarget || pending) return;
    core.processSnapshot(getMediaSnapshot(store));
  });
  baseline();
  return () => {
    active = false;
    unsubscribe();
  };
}
function shouldAnnounceStatusChange(container) {
  return !container || !isSliderFocused(container);
}

// node_modules/@videojs/utils/dist/array/find-last-at-or-before.js
function findLastIndexAtOrBefore(items, value, getValue) {
  let low = 0;
  let high = items.length - 1;
  let index = -1;
  while (low <= high) {
    const mid = low + high >>> 1;
    if (getValue(items[mid]) <= value) {
      index = mid;
      low = mid + 1;
    } else high = mid - 1;
  }
  return index;
}
function findLastAtOrBefore(items, value, getValue) {
  const index = findLastIndexAtOrBefore(items, value, getValue);
  return index < 0 ? void 0 : items[index];
}

// node_modules/@videojs/utils/dist/array/find-range-at.js
function findRangeAt(ranges, value, getStart, getEnd) {
  const index = findLastIndexAtOrBefore(ranges, value, getStart);
  if (index < 0) return void 0;
  const range = ranges[index];
  const end = getEnd(range);
  const last = index === ranges.length - 1;
  return value < end || last && value === end ? range : void 0;
}

// node_modules/@videojs/core/dist/default/core/ui/thumbnail/core.js
var ThumbnailCore = class {
  findActiveThumbnail(thumbnails, time) {
    return findLastAtOrBefore(thumbnails, time, (thumbnail) => thumbnail.startTime);
  }
  /**
  * Parse CSS constraint strings into numeric `ThumbnailConstraints`.
  *
  * Accepts any object with string `minWidth`/`maxWidth`/`minHeight`/`maxHeight` properties — `CSSStyleDeclaration`
  * satisfies this structurally.
  */
  parseConstraints(raw) {
    const minW = parseFloat(raw.minWidth);
    const maxW = parseFloat(raw.maxWidth);
    const minH = parseFloat(raw.minHeight);
    const maxH = parseFloat(raw.maxHeight);
    return {
      minWidth: Number.isFinite(minW) ? minW : 0,
      maxWidth: Number.isFinite(maxW) ? maxW : Infinity,
      minHeight: Number.isFinite(minH) ? minH : 0,
      maxHeight: Number.isFinite(maxH) ? maxH : Infinity
    };
  }
  /**
  * Calculate a uniform scale factor that sizes `tileWidth × tileHeight` to the given CSS min/max constraints while
  * preserving aspect ratio.
  *
  * - Fills the max constraints, scaling the tile up as readily as down. A box that grows — entering fullscreen widens it
  *   through a container query — has to take the tile with it rather than leave it at its native size.
  * - Raises that to meet min constraints, which win over max as they do in CSS.
  * - Returns `1` when unconstrained.
  */
  calculateScale(tileWidth, tileHeight, constraints) {
    const { minWidth, maxWidth, minHeight, maxHeight } = constraints;
    const maxRatio = Math.min(maxWidth / tileWidth, maxHeight / tileHeight);
    const minRatio = Math.max(minWidth / tileWidth, minHeight / tileHeight);
    const scale = Number.isFinite(maxRatio) ? maxRatio : 1;
    return Number.isFinite(minRatio) && minRatio > scale ? minRatio : scale;
  }
  /**
  * Compute container and image dimensions for the current thumbnail, scaled to the element's CSS min/max constraints.
  *
  * The container clips the sprite sheet via `overflow: hidden`, and the image is positioned with `transform:
  * translate()` to show the correct tile.
  */
  resize(thumbnail, imgNaturalWidth, imgNaturalHeight, constraints) {
    const tileWidth = thumbnail.width ?? imgNaturalWidth;
    const tileHeight = thumbnail.height ?? imgNaturalHeight;
    if (!tileWidth || !tileHeight) return void 0;
    const scale = this.calculateScale(tileWidth, tileHeight, constraints);
    const coordX = thumbnail.coords?.x ?? 0;
    const coordY = thumbnail.coords?.y ?? 0;
    const inset = scale !== 1 ? 1 : 0;
    return {
      scale,
      containerWidth: Math.max(0, Math.floor(tileWidth * scale) - inset * 2),
      containerHeight: Math.max(0, Math.floor(tileHeight * scale) - inset * 2),
      imageWidth: Math.ceil(imgNaturalWidth * scale),
      imageHeight: Math.ceil(imgNaturalHeight * scale),
      offsetX: Math.ceil(coordX * scale) + inset,
      offsetY: Math.ceil(coordY * scale) + inset
    };
  }
  /**
  * Resolve the CORS mode the image should request with.
  *
  * `null` opts out and drops the attribute. Any other explicit value wins, including `''`, which the CORS-settings
  * attribute reads as Anonymous. Otherwise the inherited mode applies, which renderers supply only for
  * `<track>`-sourced thumbnails since a list set directly may point at a host unrelated to the media component.
  */
  resolveCrossOrigin(explicit, inherited) {
    if (isNull(explicit)) return void 0;
    if (!isUndefined(explicit)) return explicit;
    return inherited ?? void 0;
  }
  getState(loading, error, thumbnail) {
    return {
      loading,
      error,
      hidden: !loading && !thumbnail
    };
  }
  getAttrs(_state) {
    return {
      dir: "ltr",
      role: "img",
      "aria-hidden": "true"
    };
  }
};

// node_modules/@videojs/core/dist/default/dom/ui/thumbnail.js
function createThumbnail(options) {
  const { getContainer, getImg, onStateChange } = options;
  const core = new ThumbnailCore();
  let loading = false;
  let error = false;
  let naturalWidth = 0;
  let naturalHeight = 0;
  let lastSrc = "";
  let boundImg = null;
  let checkedImg = null;
  let stopListeningToImg = null;
  let stopObservingResize = null;
  const failedSrcs = /* @__PURE__ */ new Set();
  function onImgLoad() {
    const img = getImg();
    if (img) {
      naturalWidth = img.naturalWidth;
      naturalHeight = img.naturalHeight;
    }
    failedSrcs.delete(lastSrc);
    loading = false;
    error = false;
    onStateChange();
  }
  function markFailed() {
    failedSrcs.add(lastSrc);
    loading = false;
    error = true;
  }
  function onImgError() {
    markFailed();
    onStateChange();
  }
  function bindImg(img) {
    stopListeningToImg = new AbortController();
    listen(img, "load", onImgLoad, { signal: stopListeningToImg.signal });
    listen(img, "error", onImgError, { signal: stopListeningToImg.signal });
  }
  function ensureBindings() {
    const img = getImg();
    if (img !== boundImg) {
      stopListeningToImg?.abort();
      stopListeningToImg = null;
      boundImg = img;
      checkedImg = null;
      if (img) bindImg(img);
    }
    if (!stopObservingResize) {
      const container = getContainer();
      if (container) stopObservingResize = observeResize(container, onStateChange);
    }
  }
  function updateSrc(url) {
    ensureBindings();
    const src = url ?? "";
    if (src === lastSrc) return;
    lastSrc = src;
    if (src) {
      const failed = failedSrcs.has(src);
      loading = !failed;
      error = failed;
    } else {
      loading = false;
      error = false;
      naturalWidth = 0;
      naturalHeight = 0;
    }
  }
  function connect() {
    ensureBindings();
    const img = getImg();
    if (!img || img === checkedImg) return;
    checkedImg = img;
    if (!img.complete || !lastSrc) return;
    const previous = {
      loading,
      error,
      naturalWidth,
      naturalHeight
    };
    if (img.naturalWidth > 0) {
      naturalWidth = img.naturalWidth;
      naturalHeight = img.naturalHeight;
      loading = false;
      error = false;
    } else markFailed();
    if (previous.loading !== loading || previous.error !== error || previous.naturalWidth !== naturalWidth || previous.naturalHeight !== naturalHeight) onStateChange();
  }
  function disconnectImg(img) {
    if (img !== boundImg) return;
    stopListeningToImg?.abort();
    stopListeningToImg = null;
    boundImg = null;
    checkedImg = null;
  }
  function destroy() {
    stopListeningToImg?.abort();
    stopListeningToImg = null;
    boundImg = null;
    checkedImg = null;
    stopObservingResize?.();
    stopObservingResize = null;
  }
  return {
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
    get naturalWidth() {
      return naturalWidth;
    },
    get naturalHeight() {
      return naturalHeight;
    },
    readConstraints() {
      const el = getContainer();
      if (!el) return {
        minWidth: 0,
        maxWidth: Infinity,
        minHeight: 0,
        maxHeight: Infinity
      };
      return core.parseConstraints(getComputedStyle(el));
    },
    updateSrc,
    connect,
    disconnectImg,
    destroy
  };
}

// node_modules/@videojs/core/dist/default/dom/ui/tooltip/tooltip.js
var REASON_MAP = {
  hover: "hover",
  focus: "focus",
  escape: "escape",
  blur: "blur",
  "imperative-action": "imperative-action"
};
function createTooltip(options) {
  const popoverOpts = {
    transition: options.transition,
    onOpenChange(open, details) {
      const reason = REASON_MAP[details.reason];
      if (!reason) return;
      const group = options.group?.();
      if (open) group?.notifyOpen();
      else group?.notifyClose();
      const tooltipDetails = details.event ? {
        reason,
        event: details.event
      } : { reason };
      options.onOpenChange(open, tooltipDetails);
    },
    closeOnEscape: () => true,
    closeOnOutsideClick: () => false,
    openOnHover: () => true,
    delay: () => {
      const group = options.group?.();
      if (group?.shouldSkipDelay()) return 0;
      return options.delay?.() ?? group?.delay ?? 600;
    },
    closeDelay: () => {
      const group = options.group?.();
      return options.closeDelay?.() ?? group?.closeDelay ?? 0;
    }
  };
  if (options.onOpenChangeComplete) popoverOpts.onOpenChangeComplete = options.onOpenChangeComplete;
  const popover = createPopover(popoverOpts);
  let isPointerDown = false;
  let popupGroup;
  let unsubscribe;
  function isTriggerPopupOpen() {
    return popupGroup?.isOpenFor(popover.triggerElement) ?? false;
  }
  function isSticky() {
    return options.sticky?.() ?? false;
  }
  function syncPopupGroup() {
    const next = options.popupGroup?.();
    if (next === popupGroup) return;
    unsubscribe?.();
    popupGroup = next;
    unsubscribe = popupGroup?.subscribe(() => {
      if (isTriggerPopupOpen() && !isSticky()) popover.close("imperative-action");
    });
  }
  function setTriggerElement(el) {
    popover.setTriggerElement(el);
    syncPopupGroup();
    if (isTriggerPopupOpen() && !isSticky()) popover.close("imperative-action");
  }
  const { onClick: _, ...baseTriggerProps } = popover.triggerProps;
  const triggerProps = {
    ...baseTriggerProps,
    onPointerDown() {
      syncPopupGroup();
      isPointerDown = true;
      if (!isSticky()) popover.close("imperative-action");
    },
    onPointerEnter(event) {
      syncPopupGroup();
      if (options.disabled?.()) return;
      if (isTriggerPopupOpen() && !isSticky()) return;
      if (event.pointerType === "touch") return;
      baseTriggerProps.onPointerEnter(event);
    },
    onFocusIn(event) {
      syncPopupGroup();
      if (options.disabled?.()) return;
      if (isTriggerPopupOpen() && !isSticky()) return;
      if (isPointerDown) {
        isPointerDown = false;
        return;
      }
      baseTriggerProps.onFocusIn(event);
    }
  };
  const popupProps = {
    ...popover.popupProps,
    onPointerEnter(event) {
      if (options.disableHoverablePopup?.()) return;
      popover.popupProps.onPointerEnter(event);
    }
  };
  return {
    ...popover,
    triggerProps,
    popupProps,
    get triggerElement() {
      return popover.triggerElement;
    },
    setTriggerElement,
    open: () => {
      syncPopupGroup();
      if (!isTriggerPopupOpen() || isSticky()) popover.open("hover");
    },
    close: (reason = "hover") => popover.close(reason),
    destroy() {
      unsubscribe?.();
      popover.destroy();
    }
  };
}

// node_modules/@videojs/core/dist/default/dom/ui/transition.js
function createTransition() {
  const state = createState({
    active: false,
    status: "idle"
  });
  let destroyed = false;
  let rafId1 = 0;
  let rafId2 = 0;
  let operationId = 0;
  let resolvePending = null;
  function cancelFrames() {
    cancelAnimationFrame(rafId1);
    cancelAnimationFrame(rafId2);
    rafId1 = 0;
    rafId2 = 0;
  }
  function beginOperation() {
    operationId++;
    cancelFrames();
    resolvePending?.();
    resolvePending = null;
    return operationId;
  }
  function finishOperation(id) {
    if (id !== operationId) return;
    const resolve2 = resolvePending;
    resolvePending = null;
    resolve2?.();
  }
  function open(el = null) {
    if (destroyed) return Promise.resolve();
    const id = beginOperation();
    const restarting = state.current.active;
    if (restarting) state.patch({ status: "idle" });
    state.patch({
      active: true,
      status: "starting"
    });
    return new Promise((resolve2) => {
      resolvePending = resolve2;
      rafId1 = requestAnimationFrame(() => {
        rafId1 = 0;
        if (restarting) {
          const element = resolveElement(el);
          cancelAnimations(element);
          flushStyles(element);
        }
        rafId2 = requestAnimationFrame(() => {
          rafId2 = 0;
          if (destroyed || id !== operationId || !state.current.active) return finishOperation(id);
          state.patch({ status: "idle" });
          rafId1 = requestAnimationFrame(() => {
            rafId1 = 0;
            if (destroyed || id !== operationId || !state.current.active) return finishOperation(id);
            waitForAnimations(resolveElement(el)).finally(() => finishOperation(id));
          });
        });
      });
    });
  }
  function close(el) {
    if (destroyed) return Promise.resolve();
    const id = beginOperation();
    state.patch({ status: "ending" });
    return new Promise((resolve2) => {
      resolvePending = resolve2;
      rafId1 = requestAnimationFrame(() => {
        rafId1 = 0;
        rafId2 = requestAnimationFrame(() => {
          rafId2 = 0;
          if (destroyed || id !== operationId) return finishOperation(id);
          waitForAnimations(el).finally(() => {
            if (destroyed || id !== operationId || state.current.status !== "ending") return finishOperation(id);
            state.patch({
              active: false,
              status: "idle"
            });
            finishOperation(id);
          });
        });
      });
    });
  }
  function cancel() {
    operationId++;
    cancelFrames();
    resolvePending?.();
    resolvePending = null;
    if (state.current.status !== "idle") state.patch({ status: "idle" });
  }
  return {
    state,
    open,
    close,
    cancel,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancel();
    }
  };
}
function resolveElement(element) {
  return typeof element === "function" ? element() : element;
}
function flushStyles(el) {
  if (!el) return;
  el.offsetHeight;
}
function cancelAnimations(el) {
  const animations = el?.getAnimations?.({ subtree: true }) ?? [];
  for (const animation of animations) animation.cancel();
}
function waitForAnimations(el) {
  if (!el) return Promise.resolve();
  const animations = el.getAnimations?.() ?? [];
  if (animations.length === 0) return Promise.resolve();
  return Promise.all(animations.map((a) => a.finished)).then(noop, noop);
}

// node_modules/@videojs/core/dist/default/dom/ui/wheel-step.js
function createWheelStep(options) {
  return { onWheel(event) {
    if (options.isDisabled()) return;
    const direction = Math.sign(event.deltaY);
    if (direction === 0) return;
    event.preventDefault();
    const stepPercent = options.getStepPercent();
    const currentPercent = options.getPercent();
    const newPercent = clamp(currentPercent - direction * stepPercent, 0, 100);
    options.onValueChange?.(newPercent);
  } };
}

// node_modules/@videojs/core/dist/default/dom/utils/element-props.js
function applyElementProps(element, props, options) {
  const signal = options?.signal;
  for (const [key, value] of Object.entries(props)) if (isFunction(value) && key.startsWith("on")) {
    const capture = key.endsWith("Capture") && !key.endsWith("PointerCapture");
    const event = key.slice(2, capture ? -7 : void 0).toLowerCase();
    listen(element, event, value, signal ? {
      capture,
      signal
    } : { capture });
  } else if (isUndefined(value) || value === false) element.removeAttribute(key);
  else if (value === true) element.setAttribute(key, "");
  else element.setAttribute(key, String(value));
}

// node_modules/@videojs/core/dist/default/dom/utils/state-data-attrs.js
function applyStateDataAttrs(element, state, map) {
  for (const key in state) {
    if (map && !(key in map)) continue;
    const name = map?.[key] ?? toDataAttrName(key), value = state[key];
    if (value === true) element.setAttribute(name, "");
    else if (value) element.setAttribute(name, String(value));
    else element.removeAttribute(name);
  }
}
function toDataAttrName(key) {
  return `data-${key.toLowerCase()}`;
}

// node_modules/@videojs/html/dist/default/player/element.js
function resolveInputs(config) {
  return Object.entries(config).map(([key, entry]) => {
    const attribute = entry.html?.attribute ?? kebabCase(key);
    return {
      property: camelCase(attribute),
      attribute,
      entry
    };
  });
}
function createPlayerElement(options) {
  const inputs = resolveInputs(options.config);
  class ConfiguredPlayerElement extends UIElement {
    static {
      this.properties = {
        ...UIElement.properties,
        ...Object.fromEntries(inputs.map(({ property, attribute }) => [property, {
          type: String,
          attribute
        }]))
      };
    }
    #store = options.factory();
    #configuredStore = null;
    #detach = null;
    #connected = false;
    #media = null;
    #nativeMedia = null;
    #container = null;
    #attached = null;
    #mediaRegistrations = [];
    #containerRegistrations = [];
    #observer = new MutationObserver(() => this.#syncNativeMedia());
    #extensions = new PlayerExtensionCoordinator(() => this.#syncExtensions());
    #registerExtension = (extension) => this.#extensions.register(extension);
    #registerMedia = (media) => {
      const registration = { value: media };
      this.#mediaRegistrations.push(registration);
      this.#syncMedia();
      return () => {
        const index = this.#mediaRegistrations.indexOf(registration);
        if (index < 0) return;
        this.#mediaRegistrations.splice(index, 1);
        this.#syncNativeMedia();
        this.#syncMedia();
      };
    };
    #registerContainer = (container) => {
      const registration = { value: container };
      this.#containerRegistrations.push(registration);
      this.#syncContainer();
      return () => {
        const index = this.#containerRegistrations.indexOf(registration);
        if (index < 0) return;
        this.#containerRegistrations.splice(index, 1);
        this.#syncContainer();
      };
    };
    #playerProvider = new i(this, {
      context: options.playerContext,
      initialValue: this.store
    });
    #mediaProvider = new i(this, {
      context: options.mediaContext,
      initialValue: {
        media: this.#media,
        registerMedia: this.#registerMedia
      }
    });
    #containerProvider = new i(this, {
      context: options.containerContext,
      initialValue: {
        container: this.#container,
        registerContainer: this.#registerContainer
      }
    });
    constructor() {
      super();
      new i(this, {
        context: options.extensionContext,
        initialValue: { registerExtension: this.#registerExtension }
      });
    }
    get store() {
      if (isNull(this.#store)) this.#store = options.factory();
      return this.#store;
    }
    connectedCallback() {
      if (this.destroyed) return;
      this.#connected = true;
      super.connectedCallback();
      this.#syncInitialConfig();
      this.#playerProvider.setValue(this.store);
      this.#publishMedia();
      this.#publishContainer();
      this.#observer.observe(this, {
        childList: true,
        subtree: true
      });
      queueMicrotask(() => {
        if (this.#connected) this.#syncNativeMedia();
      });
      this.#tryAttach();
    }
    disconnectedCallback() {
      this.#connected = false;
      this.#observer.disconnect();
      this.#detachStore();
      super.disconnectedCallback();
    }
    destroyCallback() {
      this.#connected = false;
      this.dispatchEvent(new Event("tyl-player-dispose"));
      this.#observer.disconnect();
      this.#detachStore();
      this.#extensions.destroy();
      this.#store?.destroy();
      this.#store = null;
      super.destroyCallback();
    }
    willUpdate(changed) {
      super.willUpdate(changed);
      for (const { property, entry } of inputs) {
        if (!changed.has(property)) continue;
        const configProperty = property;
        setPlayerConfigValue(this.store, entry, this[configProperty]);
      }
    }
    #syncMedia() {
      const media = this.#mediaRegistrations.at(-1)?.value ?? null ?? this.#nativeMedia;
      if (this.#media === media) return;
      this.#media = media;
      this.#publishMedia();
      this.#tryAttach();
    }
    #syncContainer() {
      const container = this.#containerRegistrations.at(-1)?.value ?? null;
      if (this.#container === container) return;
      this.#container = container;
      this.#publishContainer();
      this.#tryAttach();
    }
    #syncNativeMedia() {
      const media = this.querySelector("video, audio");
      if (this.#nativeMedia === media) return;
      this.#nativeMedia = media;
      this.#syncMedia();
    }
    #publishMedia() {
      this.#mediaProvider.setValue({
        media: this.#media,
        registerMedia: this.#registerMedia
      });
    }
    #publishContainer() {
      this.#containerProvider.setValue({
        container: this.#container,
        registerContainer: this.#registerContainer
      });
    }
    #tryAttach() {
      if (this.destroyed || !this.#connected || !this.#store) return;
      if (!this.#media) {
        this.#detachStore();
        return;
      }
      const target = {
        media: this.#media,
        container: this.#container
      };
      const hasMediaChanged = this.#attached?.media !== target.media;
      const hasContainerChanged = this.#attached?.container !== target.container;
      if (hasMediaChanged || hasContainerChanged) this.#attach(target);
    }
    /**
    * Extensions attach before the store so their overrides are in place when features first read the media; the store
    * then sees the media through the extensions' facade. Extensions follow the media only, so a container change
    * re-attaches the store but leaves them attached.
    */
    #attach(target) {
      const store = this.#store;
      if (!store) return;
      this.#detach?.();
      this.#attached = target;
      this.#extensions.attach(target);
      this.#detach = store.attach({
        media: this.#extensions.getStoreMedia(target.media),
        container: target.container
      });
    }
    /**
    * An extension that overrides media members was added or removed. Features hold members read at attach time (such
    * as `remote`), so the store re-attaches to the same target to pick up what the extensions now own. Observers such
    * as analytics never get here. Extensions themselves stay attached.
    */
    #syncExtensions() {
      if (this.#attached) this.#attach(this.#attached);
    }
    #detachStore() {
      this.#detach?.();
      this.#detach = null;
      this.#extensions.detach();
      this.#attached = null;
    }
    #syncInitialConfig() {
      const store = this.store;
      if (this.#configuredStore === store) return;
      for (const { property, entry } of inputs) {
        const configProperty = property;
        setPlayerConfigValue(store, entry, this[configProperty]);
      }
      this.#configuredStore = store;
    }
  }
  return ConfiguredPlayerElement;
}

// node_modules/@videojs/html/dist/default/player/create-player.js
function createPlayer(config) {
  const slice = combine(...config.features);
  const featureConfig = combinePlayerFeatureConfigs(config.features);
  return {
    PlayerElement: createPlayerElement({
      playerContext,
      mediaContext,
      containerContext,
      extensionContext,
      factory: () => createStore()(slice),
      config: featureConfig
    }),
    PlayerController: createPlayerController(playerContext),
    playerContext
  };
}

// node_modules/@videojs/html/dist/default/presets/video/player.js
var { PlayerElement, PlayerController: VideoPlayerController } = createPlayer({ features: videoFeatures });
var PlayerController2 = VideoPlayerController;
var VideoPlayerElement = class extends PlayerElement {
  static {
    this.tagName = "video-player";
  }
};

// node_modules/@videojs/html/dist/default/define/video/player.js
safeDefine(VideoPlayerElement);

// node_modules/@videojs/html/dist/default/define/global.js
var global_default = '@property --media-slider-fill{syntax:"<percentage>";inherits:true;initial-value:0%}@property --media-slider-buffer{syntax:"<percentage>";inherits:true;initial-value:0%}video-player,live-video-player,media-i18n,media-dialog,media-alert-dialog,media-error-dialog,media-controls{display:contents}media-container video,media-container [slot=poster]{width:100%;height:100%;display:block}media-container video::-webkit-media-text-track-container{z-index:1;scale:.98;translate:0 var(--media-caption-track-y,0);transition:translate var(--media-caption-track-duration,0) ease-out;transition-delay:var(--media-caption-track-delay,0);font-family:inherit}\n';

// node_modules/@videojs/html/dist/default/define/shadow.js
var shadow_default = ":host{width:100%;display:grid}:host(:focus){outline:none!important}::slotted(video),::slotted(audio){margin:0!important}\n";

// node_modules/@videojs/html/dist/default/presets/skin.js
var STYLES_ID = "__media-styles";
var shadowSheet = createShadowStyle(shadow_default);
var SkinElement = class extends UIElement {
  static {
    this.shadowRootOptions = { mode: "open" };
  }
  constructor() {
    super();
    ensureGlobalStyle(STYLES_ID, global_default);
    if (!this.shadowRoot) {
      const ctor = this.constructor;
      this.attachShadow(ctor.shadowRootOptions);
      if (ctor.template) renderTemplate(this.shadowRoot, ctor.template);
      const sheets = [shadowSheet];
      if (ctor.styles) sheets.push(ctor.styles);
      applyShadowStyles(this.shadowRoot, sheets);
    }
  }
};

// node_modules/@videojs/html/dist/default/internal/skins/default-video/template.js
var template = createTemplate(`<media-container class="media-skin media-container video-skin" data-theme="default" data-preset="video">
<slot>
</slot>
<media-poster class="media-poster">
<slot name="poster">
<img alt="" decoding="async" class="media-poster-image">
</slot>
</media-poster>
<media-buffering-indicator class="media-buffering-indicator">
<media-icon name="spinner" class="media-buffering-indicator-spinner-icon">
</media-icon>
</media-buffering-indicator>
<media-error-dialog class="media-dialog-root">
<media-dialog-backdrop class="media-dialog-backdrop">
</media-dialog-backdrop>
<media-dialog-popup class="media-dialog-popup">
<div class="media-dialog-content">
<media-dialog-title class="media-dialog-title">
</media-dialog-title>
<media-dialog-description class="media-dialog-description">
</media-dialog-description>
</div>
<div class="media-dialog-actions">
<media-dialog-close class="media-button media-dialog-close">
</media-dialog-close>
</div>
</media-dialog-popup>
</media-error-dialog>
<media-title class="media-title">
</media-title>
<media-controls>
<media-controls-backdrop class="video-controls-backdrop">
</media-controls-backdrop>
<media-controls-content class="video-controls video-controls-content">
<media-tooltip-group>
<media-controls-group class="video-controls-primary">
<media-play-button class="media-button media-play-button" id="vjs-iSAklLIk-0-trigger">
<media-icon name="restart" class="media-button-icon media-play-button-restart-icon">
</media-icon>
<media-icon name="play" class="media-button-icon media-play-button-play-icon">
</media-icon>
<media-icon name="pause" class="media-button-icon media-play-button-pause-icon">
</media-icon>
</media-play-button>
<media-tooltip trigger="vjs-iSAklLIk-0-trigger" side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-tooltip-label>
</media-tooltip-label>
<media-tooltip-shortcut class="media-tooltip-shortcut">
</media-tooltip-shortcut>
</media-tooltip>
<media-mute-button commandfor="vjs-F3QfBzzz-0-popup" class="media-button media-mute-button video-controls-volume-button" id="vjs-iSAklLIk-0-2-trigger">
<media-icon name="volume-off" class="media-button-icon media-mute-button-off-icon">
</media-icon>
<media-icon name="volume-low" class="media-button-icon media-mute-button-low-icon">
</media-icon>
<media-icon name="volume-high" class="media-button-icon media-mute-button-high-icon">
</media-icon>
</media-mute-button>
<media-tooltip trigger="vjs-iSAklLIk-0-2-trigger" delay="0" disabled sticky side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-tooltip-label>
</media-tooltip-label>
<media-tooltip-shortcut class="media-tooltip-shortcut">
</media-tooltip-shortcut>
</media-tooltip>
<media-volume-popover open-on-hover delay="200" close-delay="100" side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-volume-popover" id="vjs-F3QfBzzz-0-popup">
<media-volume-slider class="media-slider media-volume-slider" thumb-alignment="edge" orientation="vertical">
<media-slider-track class="media-slider-track">
<media-slider-fill class="media-slider-fill">
</media-slider-fill>
</media-slider-track>
<media-slider-thumb class="media-slider-thumb media-volume-slider-thumb">
</media-slider-thumb>
</media-volume-slider>
</media-volume-popover>
<media-controls-group class="video-time-slider-group">
<media-time class="media-time-value video-time-value" type="current">
</media-time>
<media-time-slider class="media-slider media-time-slider">
<media-time-slider-chapters class="media-time-slider-chapters">
<template>
<div class="media-time-slider-chapter">
<media-slider-track class="media-slider-track media-time-slider-chapter-track">
<media-slider-buffer class="media-slider-buffer media-time-slider-chapter-layer">
</media-slider-buffer>
<media-slider-fill class="media-slider-fill media-time-slider-chapter-layer">
</media-slider-fill>
</media-slider-track>
</div>
</template>
</media-time-slider-chapters>
<media-slider-thumb class="media-slider-thumb media-time-slider-thumb">
</media-slider-thumb>
<media-slider-preview class="media-slider-preview" overflow="visible">
<media-slider-thumbnail class="media-slider-preview-content media-popup-surface media-slider-thumbnail">
<slot name="thumbnail">
<img alt="" aria-hidden="true" decoding="async" class="media-slider-thumbnail-image">
</slot>
<media-icon name="spinner" class="media-slider-thumbnail-spinner-icon">
</media-icon>
</media-slider-thumbnail>
<div class="media-slider-preview-content media-time-slider-preview-content">
<media-time-slider-chapter-title class="media-time-slider-chapter-title">
</media-time-slider-chapter-title>
<media-slider-value class="media-time-slider-value" type="pointer">
</media-slider-value>
</div>
</media-slider-preview>
</media-time-slider>
<media-time class="media-time-toggle video-time-value" type="remaining" toggle>
</media-time>
</media-controls-group>
<media-captions-button class="media-button media-captions-button video-controls-captions-button" id="vjs-iSAklLIk-0-3-trigger">
<media-icon name="captions-off" class="media-button-icon media-captions-button-off-icon">
</media-icon>
<media-icon name="captions-on" class="media-button-icon media-captions-button-on-icon">
</media-icon>
</media-captions-button>
<media-tooltip trigger="vjs-iSAklLIk-0-3-trigger" side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-tooltip-label>
</media-tooltip-label>
<media-tooltip-shortcut class="media-tooltip-shortcut">
</media-tooltip-shortcut>
</media-tooltip>
<button commandfor="vjs-28BtKs3v-0-popup" class="media-button media-settings-menu-trigger video-controls-settings-button" id="vjs-iSAklLIk-0-4-trigger">
<media-icon name="gear" class="media-button-icon-base media-settings-menu-trigger-icon">
</media-icon>
<media-text class="media-settings-menu-trigger-label" token="menu.settings">Settings</media-text>
</button>
<media-tooltip trigger="vjs-iSAklLIk-0-4-trigger" side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-text token="menu.settings">Settings</media-text>
</media-tooltip>
<media-menu side="top" align="center" class="media-popup media-popup-surface media-menu-popup media-menu-resizable-popup" id="vjs-28BtKs3v-0-popup">
<media-menu-content class="media-menu-content">
<media-menu-item commandfor="vjs-ZGpCKm5h-0-content" class="media-menu-trigger-item">
<media-icon name="switches" class="media-menu-trigger-item-icon">
</media-icon>
<media-text token="menu.quality">Quality</media-text>
<span class="media-menu-hint">
<span data-part="value" class="media-menu-hint-label">
</span>
<media-icon name="chevron" class="media-menu-forward-chevron">
</media-icon>
</span>
</media-menu-item>
<media-menu-content class="media-menu-content" id="vjs-ZGpCKm5h-0-content">
<media-menu-item class="media-menu-back-item">
<media-icon name="chevron" class="media-menu-back-chevron">
</media-icon>
<media-text token="menu.quality">Quality</media-text>
</media-menu-item>
<media-menu-separator class="media-menu-separator">
</media-menu-separator>
<media-quality-radio-group class="media-menu-radio-group">
<template>
<media-menu-radio-item class="media-menu-radio-item">
<span>
<span data-part="label">
</span>
<sup data-part="tier" class="media-menu-tier">
</sup>
</span>
<span data-part="badge" class="media-menu-badge">
</span>
<media-menu-item-indicator force-mount class="media-menu-item-indicator">
<media-icon name="check" class="media-menu-radio-item-icon">
</media-icon>
</media-menu-item-indicator>
</media-menu-radio-item>
</template>
</media-quality-radio-group>
</media-menu-content>
<media-menu-item commandfor="vjs-rPcYSc7i-0-content" class="media-menu-trigger-item">
<media-icon name="speech" class="media-menu-trigger-item-icon">
</media-icon>
<media-text token="menu.audio">Audio</media-text>
<span class="media-menu-hint">
<span data-part="value" class="media-menu-hint-label">
</span>
<media-icon name="chevron" class="media-menu-forward-chevron">
</media-icon>
</span>
</media-menu-item>
<media-menu-content class="media-menu-content" id="vjs-rPcYSc7i-0-content">
<media-menu-item class="media-menu-back-item">
<media-icon name="chevron" class="media-menu-back-chevron">
</media-icon>
<media-text token="menu.audio">Audio</media-text>
</media-menu-item>
<media-menu-separator class="media-menu-separator">
</media-menu-separator>
<media-audio-track-radio-group class="media-menu-radio-group">
<template>
<media-menu-radio-item class="media-menu-radio-item">
<span data-part="label">
</span>
<media-menu-item-indicator force-mount class="media-menu-item-indicator">
<media-icon name="check" class="media-menu-radio-item-icon">
</media-icon>
</media-menu-item-indicator>
</media-menu-radio-item>
</template>
</media-audio-track-radio-group>
</media-menu-content>
<media-menu-item commandfor="vjs-8B_qQK6x-0-content" class="media-menu-trigger-item">
<media-icon name="speed" class="media-menu-trigger-item-icon">
</media-icon>
<media-text token="menu.speed">Speed</media-text>
<span class="media-menu-hint">
<span data-part="value" class="media-menu-hint-label">
</span>
<media-icon name="chevron" class="media-menu-forward-chevron">
</media-icon>
</span>
</media-menu-item>
<media-menu-content class="media-menu-content" id="vjs-8B_qQK6x-0-content">
<media-menu-item class="media-menu-back-item">
<media-icon name="chevron" class="media-menu-back-chevron">
</media-icon>
<media-text token="menu.speed">Speed</media-text>
</media-menu-item>
<media-menu-separator class="media-menu-separator">
</media-menu-separator>
<media-playback-rate-radio-group class="media-menu-radio-group">
<template>
<media-menu-radio-item class="media-menu-radio-item">
<span data-part="label">
</span>
<media-menu-item-indicator force-mount class="media-menu-item-indicator">
<media-icon name="check" class="media-menu-radio-item-icon">
</media-icon>
</media-menu-item-indicator>
</media-menu-radio-item>
</template>
</media-playback-rate-radio-group>
</media-menu-content>
<media-menu-item commandfor="vjs-fVL6fVBf-0-content" class="media-menu-trigger-item">
<media-icon name="captions-off" class="media-menu-trigger-item-icon">
</media-icon>
<media-text token="menu.captions">Captions</media-text>
<span class="media-menu-hint">
<span data-part="value" class="media-menu-hint-label">
</span>
<media-icon name="chevron" class="media-menu-forward-chevron">
</media-icon>
</span>
</media-menu-item>
<media-menu-content class="media-menu-content" id="vjs-fVL6fVBf-0-content">
<media-menu-item class="media-menu-back-item">
<media-icon name="chevron" class="media-menu-back-chevron">
</media-icon>
<media-text token="menu.captions">Captions</media-text>
</media-menu-item>
<media-menu-separator class="media-menu-separator">
</media-menu-separator>
<media-captions-radio-group class="media-menu-radio-group">
<template>
<media-menu-radio-item class="media-menu-radio-item">
<span data-part="label">
</span>
<media-menu-item-indicator force-mount class="media-menu-item-indicator">
<media-icon name="check" class="media-menu-radio-item-icon">
</media-icon>
</media-menu-item-indicator>
</media-menu-radio-item>
</template>
</media-captions-radio-group>
</media-menu-content>
</media-menu-content>
</media-menu>
</media-controls-group>
<media-controls-group class="video-controls-secondary">
<media-cast-button class="media-button media-cast-button" id="vjs-iSAklLIk-0-5-trigger">
<media-icon name="cast-enter" class="media-button-icon media-cast-button-enter-icon">
</media-icon>
<media-icon name="cast-exit" class="media-button-icon media-cast-button-exit-icon">
</media-icon>
</media-cast-button>
<media-tooltip trigger="vjs-iSAklLIk-0-5-trigger" side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-tooltip-label>
</media-tooltip-label>
<media-tooltip-shortcut class="media-tooltip-shortcut">
</media-tooltip-shortcut>
</media-tooltip>
<media-airplay-button class="media-button media-airplay-button" id="vjs-iSAklLIk-0-6-trigger">
<media-icon name="airplay-enter" class="media-button-icon media-airplay-button-enter-icon">
</media-icon>
<media-icon name="airplay-exit" class="media-button-icon media-airplay-button-exit-icon">
</media-icon>
</media-airplay-button>
<media-tooltip trigger="vjs-iSAklLIk-0-6-trigger" side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-tooltip-label>
</media-tooltip-label>
<media-tooltip-shortcut class="media-tooltip-shortcut">
</media-tooltip-shortcut>
</media-tooltip>
<media-pip-button class="media-button media-pip-button" id="vjs-iSAklLIk-0-7-trigger">
<media-icon name="pip-enter" class="media-button-icon media-pip-button-enter-icon">
</media-icon>
<media-icon name="pip-exit" class="media-button-icon media-pip-button-exit-icon">
</media-icon>
</media-pip-button>
<media-tooltip trigger="vjs-iSAklLIk-0-7-trigger" side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-tooltip-label>
</media-tooltip-label>
<media-tooltip-shortcut class="media-tooltip-shortcut">
</media-tooltip-shortcut>
</media-tooltip>
<media-fullscreen-button class="media-button media-fullscreen-button" id="vjs-iSAklLIk-0-8-trigger">
<media-icon name="fullscreen-enter" class="media-button-icon media-fullscreen-button-enter-icon">
</media-icon>
<media-icon name="fullscreen-exit" class="media-button-icon media-fullscreen-button-exit-icon">
</media-icon>
</media-fullscreen-button>
<media-tooltip trigger="vjs-iSAklLIk-0-8-trigger" side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-tooltip-label>
</media-tooltip-label>
<media-tooltip-shortcut class="media-tooltip-shortcut">
</media-tooltip-shortcut>
</media-tooltip>
</media-controls-group>
</media-tooltip-group>
</media-controls-content>
</media-controls>
<media-hotkey keys="Space" action="togglePaused">
</media-hotkey>
<media-hotkey keys="k" action="togglePaused">
</media-hotkey>
<media-hotkey keys="m" action="toggleMuted">
</media-hotkey>
<media-hotkey keys="ArrowRight" action="seekStep">
</media-hotkey>
<media-hotkey keys="ArrowLeft" action="seekStep">
</media-hotkey>
<media-hotkey keys="l" action="seekStep">
</media-hotkey>
<media-hotkey keys="j" action="seekStep">
</media-hotkey>
<media-hotkey keys="ArrowUp" action="volumeStep">
</media-hotkey>
<media-hotkey keys="ArrowDown" action="volumeStep">
</media-hotkey>
<media-hotkey keys="0-9" action="seekToPercent">
</media-hotkey>
<media-hotkey keys="Home" action="seekToPercent" value="0">
</media-hotkey>
<media-hotkey keys="End" action="seekToPercent" value="100">
</media-hotkey>
<media-hotkey keys="&gt;" action="speedUp">
</media-hotkey>
<media-hotkey keys="&lt;" action="speedDown">
</media-hotkey>
<media-hotkey keys="f" action="toggleFullscreen">
</media-hotkey>
<media-hotkey keys="c" action="toggleSubtitles">
</media-hotkey>
<media-hotkey keys="i" action="togglePictureInPicture">
</media-hotkey>
<media-gesture type="tap" action="togglePaused" pointer="mouse" region="center">
</media-gesture>
<media-gesture type="tap" action="toggleControls" pointer="touch">
</media-gesture>
<media-gesture type="doubletap" action="seekStep" region="left">
</media-gesture>
<media-gesture type="doubletap" action="toggleFullscreen" region="center">
</media-gesture>
<media-gesture type="doubletap" action="seekStep" region="right">
</media-gesture>
<media-status-announcer class="media-status-announcer">
</media-status-announcer>
<div class="video-status-indicators">
<media-volume-indicator class="media-indicator media-volume-indicator">
<media-volume-indicator-fill class="media-indicator-content media-volume-indicator-fill">
<media-icon name="volume-high" class="media-volume-indicator-high-icon">
</media-icon>
<media-icon name="volume-low" class="media-volume-indicator-low-icon">
</media-icon>
<media-icon name="volume-off" class="media-volume-indicator-off-icon">
</media-icon>
<media-volume-indicator-value class="media-volume-indicator-value">
</media-volume-indicator-value>
</media-volume-indicator-fill>
</media-volume-indicator>
<media-status-indicator actions="toggleSubtitles,toggleFullscreen,togglePictureInPicture" class="media-indicator media-status-indicator">
<div class="media-indicator-content media-status-indicator-content">
<media-icon name="captions-on" class="media-status-indicator-captions-on-icon">
</media-icon>
<media-icon name="captions-off" class="media-status-indicator-captions-off-icon">
</media-icon>
<media-icon name="fullscreen-enter" class="media-status-indicator-fullscreen-enter-icon">
</media-icon>
<media-icon name="fullscreen-exit" class="media-status-indicator-fullscreen-exit-icon">
</media-icon>
<media-icon name="pip-enter" class="media-status-indicator-pip-enter-icon">
</media-icon>
<media-icon name="pip-exit" class="media-status-indicator-pip-exit-icon">
</media-icon>
<media-status-indicator-value class="media-status-indicator-value">
</media-status-indicator-value>
</div>
</media-status-indicator>
<media-seek-indicator class="media-seek-indicator">
<media-icon name="chevron" class="media-seek-indicator-icon">
</media-icon>
<media-seek-indicator-value class="media-seek-indicator-value">
</media-seek-indicator-value>
</media-seek-indicator>
<media-status-indicator actions="togglePaused" class="media-playback-status-indicator">
<media-icon name="play" class="media-playback-status-indicator-play-icon">
</media-icon>
<media-icon name="pause" class="media-playback-status-indicator-pause-icon">
</media-icon>
</media-status-indicator>
</div>
</media-container>`);

// node_modules/@videojs/html/dist/default/define/video/skin2.js
var skin_default = '@property --media-slider-fill{syntax:"<percentage>";inherits:true;initial-value:0%}@property --media-slider-buffer{syntax:"<percentage>";inherits:true;initial-value:0%}video-player,live-video-player,media-i18n,media-dialog,media-alert-dialog,media-error-dialog,media-controls{display:contents}media-container video,media-container [slot=poster]{width:100%;height:100%;display:block}media-container video::-webkit-media-text-track-container{z-index:1;scale:.98;translate:0 var(--media-caption-track-y,0);transition:translate var(--media-caption-track-duration,0) ease-out;transition-delay:var(--media-caption-track-delay,0);font-family:inherit}:host{width:100%;display:grid}:host(:focus){outline:none!important}::slotted(video),::slotted(audio){margin:0!important}@layer base{:where(.media-skin){text-align:start;text-transform:none;letter-spacing:normal;font-style:normal;font-weight:400}:where(.media-skin),:where(.media-skin) *,:where(.media-skin) :before,:where(.media-skin) :after{box-sizing:border-box;border:0 solid;margin:0;padding:0}:where(.media-skin) button{font:inherit;color:inherit;text-transform:none;letter-spacing:inherit;appearance:none;background:0 0}:where(.media-skin) img,:where(.media-skin) svg,:where(.media-skin) media-icon{max-width:100%;display:block}:where(.media-skin) svg[fill=currentColor]{fill:currentColor}:where(.media-skin) svg[fill=none]{fill:none}:where(.media-skin) svg[stroke=currentColor]{stroke:currentColor}:where(.media-skin) video{border-radius:inherit;object-fit:var(--media-object-fit,contain);object-position:var(--media-object-position,center);width:100%;max-width:100%;height:100%;display:block}:where(.media-skin) media-icon>svg{width:100%;height:100%}:where(.media-skin) media-tooltip-group,:where(.media-skin) media-dialog,:where(.media-skin) media-alert-dialog,:where(.media-skin) media-error-dialog,:where(.media-skin) media-controls{display:contents}:where(.media-skin) [hidden][hidden]{display:none!important}@media (prefers-reduced-motion:no-preference){.media-skin{interpolate-size:allow-keywords}}@supports not selector(:popover-open){:where(.media-skin) [popover]:not([data-open],[data-ending-style]){display:none!important}.media-skin:is([data-preset=audio],[data-preset=live-audio]){overflow:visible!important}}}@layer components{:where(.media-skin){--media-caption-track-duration:var(--media-duration-controls);--media-caption-track-delay:25ms;--media-caption-track-y:calc(var(--media-spacing) * -3)}:where(.media-skin) video::-webkit-media-text-track-container{z-index:20;scale:.98;translate:0 var(--media-caption-track-y);transition:translate var(--media-caption-track-duration) ease-out;transition-delay:var(--media-caption-track-delay);font-family:inherit}:where(.media-skin)[data-controls-visible]{--media-caption-track-y:var(--media-caption-controls-y)}:where(.media-skin)[data-theme=compat] video::-webkit-media-text-track-container{translate:none;scale:none;transform:translateY(var(--media-caption-track-y,0px)) scale(.98);transition-property:transform}@container media-root (width<42rem){:where(.media-skin)[data-theme=default][data-controls-visible] video{--media-caption-track-y:calc(var(--media-spacing) * -14)}:where(.media-skin)[data-theme=neutral][data-controls-visible] video{--media-caption-track-y:calc(var(--media-spacing) * -17)}}:where(.media-skin[data-theme=default]) .media-button{width:var(--media-control-size);height:var(--media-control-size);cursor:pointer;touch-action:manipulation;border-radius:var(--media-control-radius);text-align:center;min-height:0;color:inherit;outline-offset:-2px;transition-property:background-color,color,outline-offset,scale;transition-duration:var(--media-duration);will-change:scale;-webkit-user-select:none;user-select:none;corner-shape:var(--media-control-corner-shape);background-color:#0000;border-style:solid;border-width:0;outline:2px solid #0000;flex-shrink:0;place-items:center;padding:0;transition-timing-function:cubic-bezier(0,0,.2,1);display:grid}@media (hover:hover){:where(.media-skin[data-theme=default]) .media-button:not([aria-disabled=true]):hover{background-color:var(--media-accent);color:var(--media-accent-foreground)}}:where(.media-skin[data-theme=default]) .media-button:focus-visible{outline-offset:2px;outline-color:var(--media-ring)}:where(.media-skin[data-theme=default]) .media-button:not([aria-disabled=true]):active{scale:.97}:where(.media-skin[data-theme=default]) .media-button[aria-disabled=true]{cursor:not-allowed;opacity:.5}@media (prefers-reduced-motion:reduce){:where(.media-skin[data-theme=default]) .media-button{will-change:auto;transition-property:background-color,color;scale:1}}:where(.media-skin[data-theme=default]) .media-button:where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])){background-color:var(--media-accent);color:var(--media-accent-foreground)}:where(.media-skin[data-theme=default]) .media-dialog-actions{gap:calc(var(--media-spacing) * 2);flex-shrink:0;display:flex}:where(.media-skin[data-theme=default]) .media-dialog-backdrop{z-index:40;border-radius:inherit;background-color:var(--media-backdrop);opacity:1;-webkit-backdrop-filter:var(--media-backdrop-filter-dialog);backdrop-filter:var(--media-backdrop-filter-dialog);transition-property:opacity;transition-duration:.15s;transition-delay:var(--media-delay-dialog);transition-duration:var(--media-duration-dialog);transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute;inset:0}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-dialog-backdrop{background-color:color-mix(in oklab, var(--media-backdrop) 20%, transparent)}}:where(.media-skin[data-theme=default]) .media-dialog-backdrop:not([data-open]){display:none}:where(.media-skin[data-theme=default]) .media-dialog-backdrop[data-ending-style]{transition-delay:0s;transition-duration:var(--media-duration-slower)}:where(.media-skin[data-theme=default]) .media-dialog-backdrop[data-scope=document]{border-radius:0;position:fixed}:where(.media-skin[data-theme=default]) .media-dialog-backdrop:is([data-starting-style],[data-ending-style]){opacity:0}:where(.media-skin[data-theme=default]) .media-dialog-close{height:var(--media-control-size);width:100%;padding-inline:calc(var(--media-spacing) * 4);padding-block:calc(var(--media-spacing) * 2);flex:1;font-weight:500;background-color:var(--media-primary)!important;color:var(--media-primary-foreground)!important}:where(.media-skin[data-theme=default]) .media-dialog-content{gap:calc(var(--media-spacing) * 2);min-height:0;padding-inline:calc(var(--media-spacing) * 2);padding-top:calc(var(--media-spacing) * 2);padding-bottom:calc(var(--media-spacing) * 1.5);flex-direction:column;display:flex;overflow-y:auto}:where(.media-skin[data-theme=default]) .media-dialog-description{overflow-wrap:anywhere;opacity:.7;margin:0}:where(.media-skin[data-theme=default]) .media-dialog-popup{z-index:50;max-height:calc(100% - .5rem);width:var(--media-dialog-width);max-width:var(--media-dialog-max-width);gap:calc(var(--media-spacing) * 3);border-radius:var(--media-dialog-radius);background-color:var(--media-popover);padding:calc(var(--media-spacing) * 3);color:var(--media-popover-foreground);box-shadow:0 0 0 1px var(--media-surface-border,var(--media-border)), var(--media-shadow-surface);-webkit-backdrop-filter:var(--media-backdrop-filter-surface);backdrop-filter:var(--media-backdrop-filter-surface);transition-property:opacity,scale;transition-duration:.15s;transition-delay:var(--media-delay-dialog);transition-duration:var(--media-duration-dialog);text-shadow:var(--media-text-shadow-dialog);outline-style:none;flex-direction:column;transition-timing-function:cubic-bezier(0,0,.2,1);display:flex;position:absolute;top:50%;left:50%;translate:-50% -50%}@media (forced-colors:active){:where(.media-skin[data-theme=default]) .media-dialog-popup{outline-offset:2px;outline:2px solid #0000}}:where(.media-skin[data-theme=default]) .media-dialog-popup:not([data-open]){display:none}:where(.media-skin[data-theme=default]) .media-dialog-popup:after{content:"";z-index:10;pointer-events:none;border-radius:inherit;box-shadow:var(--media-shadow-surface-inset);position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-dialog-popup[data-ending-style]{transition-delay:0s;transition-duration:var(--media-duration-slower)}:where(.media-skin[data-theme=default]) .media-dialog-popup[data-scope=document]{max-height:calc(100dvh - 1rem);position:fixed}:where(.media-skin[data-theme=default]) .media-dialog-popup:is([data-starting-style],[data-ending-style]){scale:var(--media-hidden-popup-scale) var(--media-hidden-popup-scale);opacity:0}:where(.media-skin[data-theme=default]) .media-dialog-title{font-size:calc(var(--media-spacing) * 3.75);margin:0;font-weight:600;line-height:1.25}:where(.media-skin[data-theme=default]) .media-buffering-indicator{pointer-events:none;color:var(--media-controls-foreground);place-content:center;display:none;position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-buffering-indicator:not([data-visible]){--media-spinner-animation:none}:where(.media-skin[data-theme=default]) .media-buffering-indicator:before{background-color:var(--media-backdrop);content:"";-webkit-backdrop-filter:var(--media-backdrop-filter-indicator);backdrop-filter:var(--media-backdrop-filter-indicator);position:absolute;inset:0}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-buffering-indicator:before{background-color:color-mix(in oklab, var(--media-backdrop) 35%, transparent)}}:where(.media-skin[data-theme=default]) .media-buffering-indicator[data-visible]{display:grid}:where(.media-skin[data-theme=default]) .media-buffering-indicator-spinner-icon{z-index:30;width:var(--media-icon-size,calc(var(--media-spacing) * 4.5));height:var(--media-icon-size,calc(var(--media-spacing) * 4.5));filter:drop-shadow(0 1px 0 var(--media-shadow-current-color));position:relative}.media-poster>slot::slotted(img){border-radius:inherit;object-fit:var(--media-object-fit,contain);object-position:var(--media-object-position,center);width:100%;height:100%;position:absolute;inset:0;height:100%!important}.media-poster>slot::slotted(img:not([src]):not([srcset])){visibility:hidden}:where(.media-skin[data-theme=default]) .media-poster{pointer-events:none;border-radius:inherit;width:100%;height:100%;transition-property:opacity;transition-duration:.15s;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:var(--media-duration-slower);position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-poster:not([data-visible]){opacity:0}:where(.media-skin[data-theme=default]) .media-poster-image{border-radius:inherit;object-fit:var(--media-object-fit,contain);object-position:var(--media-object-position,center);width:100%;height:100%;position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-poster-image:not([src]):not([srcset]){visibility:hidden}:where(.media-skin[data-theme=default]) .media-title{pointer-events:none;isolation:isolate;z-index:20;transform-origin:top;grid-template-rows:minmax(calc(var(--media-control-size) - (calc(var(--media-spacing) * .5))), auto);padding-inline:calc(var(--media-spacing) * 6);padding-top:calc(var(--media-spacing) * 2.5);font-size:calc(var(--media-spacing) * 4);letter-spacing:-.0125em;overflow-wrap:anywhere;color:var(--media-controls-foreground);transition-property:filter,opacity,scale,translate;transition-duration:.15s;transition-duration:calc(var(--media-duration-controls) / 2);text-shadow:0 1px 0 var(--media-shadow-current-color);align-content:flex-start;align-items:center;font-weight:500;transition-timing-function:cubic-bezier(0,0,.2,1);display:grid;position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-title:not([data-visible]){translate:0 calc(var(--media-hidden-offset) * -1);scale:var(--media-hidden-scale) var(--media-hidden-scale);opacity:0;transition-duration:var(--media-duration-controls)}@media (pointer:fine){:where(.media-skin[data-theme=default]) .media-title:not([data-visible]){filter:blur(var(--media-hidden-blur))}}@container media-root (width>=28rem){:where(.media-skin[data-theme=default]) .media-title{grid-template-rows:minmax(calc(var(--media-control-size) - (calc(var(--media-spacing) * 2))), auto);padding-inline:calc(var(--media-spacing) * 6);padding-top:calc(var(--media-spacing) * 4)}}@container media-root (width>=32rem){:where(.media-skin[data-theme=default]) .media-title:before{z-index:-1;height:var(--media-controls-gradient-height);content:"";background-image:var(--media-controls-top-gradient);inset-inline:0;position:absolute;top:0}}@container media-root (width<32rem){:where(.media-skin[data-theme=default]) .media-title{padding-right:calc(var(--media-spacing) * 36)}}:where(.media-skin[data-theme=default]) .media-container,:where(.media-skin[data-theme=default]).media-container{isolation:isolate;border-radius:var(--media-video-border-radius);background-color:var(--media-background);width:100%;min-width:0;height:100%;min-height:0;font-family:var(--media-font-family,"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif);font-size:calc(var(--media-spacing) * 3.25);-webkit-font-smoothing:auto;-moz-osx-font-smoothing:auto;outline-offset:-4px;transition-property:outline-offset,outline-color;transition-duration:.15s;transition-duration:var(--media-duration-fast);--spacing:var(--media-spacing);outline:2px solid #0000;line-height:1.5;transition-timing-function:cubic-bezier(0,0,.2,1);display:block;position:relative;overflow:clip;container:media-root/inline-size}:where(.media-skin[data-theme=default]) .media-container:after,:where(.media-skin[data-theme=default]).media-container:after{pointer-events:none;z-index:10;border-radius:inherit;content:"";border-style:solid;border-width:1px;border-color:var(--media-frame-border);position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-container:focus-visible,:where(.media-skin[data-theme=default]).media-container:focus-visible{outline-offset:2px;outline-color:var(--media-ring)}:where(.media-skin[data-theme=default]) .media-container:fullscreen:after,:where(.media-skin[data-theme=default]).media-container:fullscreen:after{content:"";display:none}.media-container>slot::slotted(video),:scope.media-container>slot::slotted(video){border-radius:inherit;object-fit:var(--media-object-fit,contain);object-position:var(--media-object-position,center);width:100%;max-width:100%;margin:0;display:block;height:100%!important}:where(.media-skin[data-theme=default]) .media-status-announcer{clip-path:inset(50%);white-space:nowrap;border-width:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}:where(.media-skin[data-theme=default]) .media-seek-indicator{place-content:center;gap:var(--media-spacing);padding:calc(var(--media-spacing) * 4);text-align:center;grid-row-start:1;grid-column-start:2;display:grid}:where(.media-skin[data-theme=default]) .media-seek-indicator[data-direction=backward]{grid-column-start:1;justify-self:flex-start}:where(.media-skin[data-theme=default]) .media-seek-indicator[data-direction=forward]{grid-column-start:3;justify-self:flex-end}@container media-root (width>=42rem){:where(.media-skin[data-theme=default]) .media-seek-indicator{padding:calc(var(--media-spacing) * 6)}}:where(.media-skin[data-theme=default]) .media-seek-indicator-icon{width:calc(var(--media-icon-size,calc(var(--media-spacing) * 4.5)) * 1.5);height:calc(var(--media-icon-size,calc(var(--media-spacing) * 4.5)) * 1.5);transition-property:translate,opacity;transition-duration:.15s;transition-duration:var(--media-duration-slow);transition-timing-function:cubic-bezier(.4,0,.2,1);display:none}:where(:where(.media-skin[data-theme=default]) .media-seek-indicator)[data-direction] .media-seek-indicator-icon{display:block}:where(:where(.media-skin[data-theme=default]) .media-seek-indicator)[data-direction=backward] .media-seek-indicator-icon{scale:-1 1}:where(:where(.media-skin[data-theme=default]) .media-seek-indicator)[data-direction=backward][data-starting-style] .media-seek-indicator-icon{translate:var(--media-hidden-seek-offset) 0}:where(:where(.media-skin[data-theme=default]) .media-seek-indicator)[data-direction=forward][data-starting-style] .media-seek-indicator-icon{translate:calc(var(--media-hidden-seek-offset) * -1) 0}:where(:where(.media-skin[data-theme=default]) .media-seek-indicator):is([data-starting-style],[data-ending-style]) .media-seek-indicator-icon{opacity:0}:where(.media-skin[data-theme=default]) .media-seek-indicator-value{font-variant-numeric:tabular-nums}:where(.media-skin[data-theme=default]) .media-indicator{pointer-events:none;top:calc(var(--media-spacing) * 3);transform-origin:top;border-radius:var(--media-control-radius);background-color:var(--media-backdrop);color:var(--media-popover-foreground);box-shadow:0 0 0 1px var(--media-surface-border,var(--media-border)), var(--media-shadow-surface);-webkit-backdrop-filter:var(--media-backdrop-filter-surface);backdrop-filter:var(--media-backdrop-filter-surface);transition-duration:var(--media-duration-fast);font-weight:500;transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-indicator{background-color:color-mix(in oklab, var(--media-backdrop) 25%, transparent)}}:where(.media-skin[data-theme=default]) .media-indicator:after{content:"";z-index:10;pointer-events:none;border-radius:inherit;box-shadow:var(--media-shadow-surface-inset);position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-indicator[data-ending-style]{translate:0 var(--media-hidden-indicator-offset)}@media (pointer:coarse){:where(.media-skin[data-theme=default]) .media-indicator{will-change:scale, translate, opacity;transition-property:scale,translate,opacity}}@media (pointer:fine){:where(.media-skin[data-theme=default]) .media-indicator{will-change:scale, translate, filter, opacity;transition-property:scale,translate,filter,opacity}}@media (prefers-reduced-transparency:reduce),(prefers-contrast:more){:where(.media-skin[data-theme=default]) .media-indicator{background-color:var(--media-background)}}:where(.media-skin[data-theme=default]) .media-indicator:is([data-starting-style],[data-ending-style]){opacity:0;transition-duration:var(--media-duration-indicator);transition-timing-function:cubic-bezier(.4,0,1,1)}@media (pointer:fine){:where(.media-skin[data-theme=default]) .media-indicator:is([data-starting-style],[data-ending-style]){scale:var(--media-hidden-indicator-scale) var(--media-hidden-indicator-scale);filter:blur(var(--media-hidden-blur))}}:where(.media-skin[data-theme=default]) .media-indicator-content{justify-content:space-between;align-items:center;gap:calc(var(--media-spacing) * 2);padding-inline:calc(var(--media-spacing) * 2.5);padding-block:var(--media-spacing)}:where(.media-skin[data-theme=default]) .media-playback-status-indicator{background-color:var(--media-backdrop);padding:calc(var(--media-spacing) * 4);text-align:center;-webkit-backdrop-filter:var(--media-backdrop-filter-indicator);backdrop-filter:var(--media-backdrop-filter-indicator);transition-property:opacity,scale;transition-duration:.15s;transition-duration:var(--media-duration-slow);border-radius:9999px;grid-row-start:1;grid-column-start:2;place-content:center;transition-timing-function:cubic-bezier(0,0,.2,1);display:grid}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-playback-status-indicator{background-color:color-mix(in oklab, var(--media-backdrop) 35%, transparent)}}:where(.media-skin[data-theme=default]) .media-playback-status-indicator[data-ending-style]{transition-duration:var(--media-duration-fast);transition-timing-function:cubic-bezier(.4,0,1,1)}:where(.media-skin[data-theme=default]) .media-playback-status-indicator:is([data-starting-style],[data-ending-style]){scale:var(--media-hidden-playback-scale) var(--media-hidden-playback-scale);opacity:0}:where(.media-skin[data-theme=default]) .media-playback-status-indicator-pause-icon{width:calc(var(--media-icon-size,calc(var(--media-spacing) * 4.5)) * 1.5);height:calc(var(--media-icon-size,calc(var(--media-spacing) * 4.5)) * 1.5);scale:var(--media-hidden-icon-scale) var(--media-hidden-icon-scale);opacity:0;transition-property:opacity,scale;transition-duration:.15s;transition-duration:var(--media-duration);grid-row-start:1;grid-column-start:1;transition-timing-function:cubic-bezier(0,0,.2,1)}:where(:where(.media-skin[data-theme=default]) .media-playback-status-indicator)[data-status=pause] .media-playback-status-indicator-pause-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-playback-status-indicator-play-icon{width:calc(var(--media-icon-size,calc(var(--media-spacing) * 4.5)) * 1.5);height:calc(var(--media-icon-size,calc(var(--media-spacing) * 4.5)) * 1.5);scale:var(--media-hidden-icon-scale) var(--media-hidden-icon-scale);opacity:0;transition-property:opacity,scale;transition-duration:.15s;transition-duration:var(--media-duration);grid-row-start:1;grid-column-start:1;transition-timing-function:cubic-bezier(0,0,.2,1)}:where(:where(.media-skin[data-theme=default]) .media-playback-status-indicator)[data-status=play] .media-playback-status-indicator-play-icon{opacity:1;translate:1px;scale:1}:where(.media-skin[data-theme=default]) .media-status-indicator-captions-off-icon{mix-blend-mode:difference;flex-shrink:0;display:none}:where(:where(.media-skin[data-theme=default]) .media-status-indicator)[data-status=captions-off] .media-status-indicator-captions-off-icon{display:block}:where(.media-skin[data-theme=default]) .media-status-indicator-captions-on-icon{mix-blend-mode:difference;flex-shrink:0;display:none}:where(:where(.media-skin[data-theme=default]) .media-status-indicator)[data-status=captions-on] .media-status-indicator-captions-on-icon{display:block}:where(.media-skin[data-theme=default]) .media-status-indicator-content{width:100%;display:flex}:where(.media-skin[data-theme=default]) .media-status-indicator-fullscreen-enter-icon{mix-blend-mode:difference;flex-shrink:0;display:none}:where(:where(.media-skin[data-theme=default]) .media-status-indicator)[data-status=fullscreen] .media-status-indicator-fullscreen-enter-icon{display:block}:where(.media-skin[data-theme=default]) .media-status-indicator-fullscreen-exit-icon{mix-blend-mode:difference;flex-shrink:0;display:none}:where(:where(.media-skin[data-theme=default]) .media-status-indicator)[data-status=exit-fullscreen] .media-status-indicator-fullscreen-exit-icon{display:block}:where(.media-skin[data-theme=default]) .media-status-indicator-pip-enter-icon{mix-blend-mode:difference;flex-shrink:0;display:none}:where(:where(.media-skin[data-theme=default]) .media-status-indicator)[data-status=pip] .media-status-indicator-pip-enter-icon{display:block}:where(.media-skin[data-theme=default]) .media-status-indicator-pip-exit-icon{mix-blend-mode:difference;flex-shrink:0;display:none}:where(:where(.media-skin[data-theme=default]) .media-status-indicator)[data-status=exit-pip] .media-status-indicator-pip-exit-icon{display:block}:where(.media-skin[data-theme=default]) .media-status-indicator-value{mix-blend-mode:difference;margin-left:auto}:where(.media-skin[data-theme=default]) .media-volume-indicator{width:min(80%,12rem);transform:translate(0)}@media (prefers-reduced-motion:no-preference){:where(.media-skin[data-theme=default]) .media-volume-indicator:is([data-min],[data-max]):not([data-starting-style],[data-ending-style]){transition:transform .3s linear(0, -24 20%, 16 40%, -8 60%, 4 80%, 1);transform:translate(.25px)}}:where(.media-skin[data-theme=default]) .media-volume-indicator-fill{border-radius:inherit;background-image:linear-gradient(currentColor,currentColor);background-size:var(--media-volume-fill,0%) 100%;width:100%;transition-property:background-size;transition-duration:.15s;transition-duration:var(--media-duration-slow);background-position:0;background-repeat:no-repeat;transition-timing-function:linear;display:flex}:where(.media-skin[data-theme=default]) .media-volume-indicator-high-icon{mix-blend-mode:difference;flex-shrink:0;display:none}:where(:where(.media-skin[data-theme=default]) .media-volume-indicator)[data-level=high] .media-volume-indicator-high-icon{display:block}:where(.media-skin[data-theme=default]) .media-volume-indicator-low-icon{mix-blend-mode:difference;flex-shrink:0;display:none}:where(:where(.media-skin[data-theme=default]) .media-volume-indicator)[data-level=low] .media-volume-indicator-low-icon{display:block}:where(.media-skin[data-theme=default]) .media-volume-indicator-off-icon{mix-blend-mode:difference;flex-shrink:0;display:none}:where(:where(.media-skin[data-theme=default]) .media-volume-indicator)[data-level=off] .media-volume-indicator-off-icon{display:block}:where(.media-skin[data-theme=default]) .media-volume-indicator-value{mix-blend-mode:difference;margin-left:auto}:where(.media-skin[data-theme=default][data-preset=video]) .video-status-indicators{pointer-events:none;z-index:20;color:var(--media-controls-foreground);grid-template-columns:repeat(3,minmax(0,1fr));place-items:center;display:grid;position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-airplay-button:not([data-airplay-state=connected]){--media-icon-airplay-fill-animation:none;--media-icon-airplay-triangle-animation:none}:where(.media-skin[data-theme=default]) .media-airplay-button-enter-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-airplay-button):not([data-airplay-state=connected]) .media-airplay-button-enter-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-airplay-button-exit-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-airplay-button)[data-airplay-state=connected] .media-airplay-button-exit-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-button-icon{width:var(--media-icon-size,calc(var(--media-spacing) * 4.5));height:var(--media-icon-size,calc(var(--media-spacing) * 4.5));filter:drop-shadow(0 1px 0 var(--media-shadow-current-color));transition-property:opacity,scale;transition-duration:.15s;transition-duration:var(--media-duration);text-shadow:inherit;grid-row-start:1;grid-column-start:1;transition-timing-function:cubic-bezier(0,0,.2,1)}:where(.media-skin[data-theme=default]) .media-popup{color:inherit;border-style:solid;border-width:0;margin:0;overflow:visible}:where(.media-skin[data-theme=default]) .media-popup[data-ending-style]{transform:none}:where(.media-skin[data-theme=default]) .media-popup[data-starting-style]{transform:translate(var(--media-popup-translate-x-distance,0), var(--media-popup-translate-y-distance,0))}:where(.media-skin[data-theme=default]) .media-popup[data-side=bottom]{transform-origin:top;--media-popup-translate-y-distance:calc(var(--media-popup-translate-distance) * -1)}:where(.media-skin[data-theme=default]) .media-popup[data-side=left]{transform-origin:100%;--media-popup-translate-x-distance:var(--media-popup-translate-distance)}:where(.media-skin[data-theme=default]) .media-popup[data-side=right]{transform-origin:0;--media-popup-translate-x-distance:calc(var(--media-popup-translate-distance) * -1)}:where(.media-skin[data-theme=default]) .media-popup[data-side=top]{transform-origin:bottom;--media-popup-translate-y-distance:var(--media-popup-translate-distance)}:where(.media-skin[data-theme=default]) .media-popup:is([data-starting-style],[data-ending-style]){scale:var(--media-hidden-popup-scale) var(--media-hidden-popup-scale);opacity:0;filter:blur(var(--media-hidden-popup-blur))}:where(.media-skin[data-theme=default]) .media-popup-safe-area:before{pointer-events:auto;content:"";position:absolute}:where(.media-skin[data-theme=default]) .media-popup-safe-area[data-side=bottom]:before{content:"";height:var(--media-popup-side-offset);inset-inline:0;bottom:100%}:where(.media-skin[data-theme=default]) .media-popup-safe-area[data-side=left]:before{content:"";width:var(--media-popup-side-offset);inset-block:0;left:100%}:where(.media-skin[data-theme=default]) .media-popup-safe-area[data-side=right]:before{content:"";width:var(--media-popup-side-offset);inset-block:0;right:100%}:where(.media-skin[data-theme=default]) .media-popup-safe-area[data-side=top]:before{content:"";height:var(--media-popup-side-offset);inset-inline:0;top:100%}:where(.media-skin[data-theme=default]) .media-popup-transition{transition-property:opacity,filter,transform,scale;transition-duration:var(--media-duration-fast);transition-timing-function:cubic-bezier(0,0,.2,1)}:where(.media-skin[data-theme=default]) .media-popup-transition[data-ending-style]{transition-duration:var(--media-duration-instant)}:where(.media-skin[data-theme=default]) .media-tooltip{border-radius:var(--media-control-radius);padding-inline:calc(var(--media-spacing) * 2.5);padding-block:var(--media-spacing);font-size:calc(var(--media-spacing) * 3.25);white-space:nowrap;--media-popup-side-offset:var(--media-tooltip-side-offset)}:where(.media-skin[data-theme=default]) .media-tooltip[data-open]{align-items:center;gap:var(--media-spacing);display:flex}:where(.media-skin[data-theme=default]) .media-tooltip-shortcut{border-radius:var(--media-spacing);background-color:var(--media-muted);text-align:center;min-width:1.5em;font-family:inherit;font-size:calc(var(--media-spacing) * 2.75);padding:.1em;font-weight:600;line-height:1.25}:where(.media-skin[data-theme=default]) .media-popup-surface{background-color:var(--media-popover);color:var(--media-popover-foreground);box-shadow:0 0 0 1px var(--media-surface-border,var(--media-border)), var(--media-shadow-surface);-webkit-backdrop-filter:var(--media-backdrop-filter-surface);backdrop-filter:var(--media-backdrop-filter-surface)}:where(.media-skin[data-theme=default]) .media-popup-surface:after{content:"";z-index:10;pointer-events:none;border-radius:inherit;box-shadow:var(--media-shadow-surface-inset);position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-captions-button-off-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-captions-button):not([data-active]) .media-captions-button-off-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-captions-button-on-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-captions-button)[data-active] .media-captions-button-on-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-cast-button-enter-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-cast-button):not([data-cast-state=connected]) .media-cast-button-enter-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-cast-button-exit-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-cast-button)[data-cast-state=connected] .media-cast-button-exit-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-fullscreen-button-enter-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-fullscreen-button):not([data-fullscreen]) .media-fullscreen-button-enter-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-fullscreen-button-exit-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-fullscreen-button)[data-fullscreen] .media-fullscreen-button-exit-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-pip-button-enter-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-pip-button):not([data-pip]) .media-pip-button-enter-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-pip-button-exit-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-pip-button)[data-pip] .media-pip-button-exit-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-play-button-pause-icon{scale:var(--media-hidden-icon-scale) var(--media-hidden-icon-scale);opacity:0}:where(:where(.media-skin[data-theme=default]) .media-play-button)[data-started]:not([data-paused]):not([data-ended]) .media-play-button-pause-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-play-button-play-icon{scale:var(--media-hidden-icon-scale) var(--media-hidden-icon-scale);opacity:0}:where(:where(.media-skin[data-theme=default]) .media-play-button):not([data-ended]):not([data-started]) .media-play-button-play-icon,:where(:where(.media-skin[data-theme=default]) .media-play-button):not([data-ended])[data-paused] .media-play-button-play-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-play-button-restart-icon{scale:var(--media-hidden-icon-scale) var(--media-hidden-icon-scale);opacity:0}:where(:where(.media-skin[data-theme=default]) .media-play-button)[data-ended] .media-play-button-restart-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-mute-button-high-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-mute-button):not([data-muted]):not([data-volume-level=low]) .media-mute-button-high-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-mute-button-low-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-mute-button):not([data-muted])[data-volume-level=low] .media-mute-button-low-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-mute-button-off-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-mute-button)[data-muted] .media-mute-button-off-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-slider-buffer{pointer-events:none;position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-slider-buffer:before{border-radius:var(--media-control-radius);content:"";background-color:currentColor;width:100%;height:100%;position:absolute}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-slider-buffer:before{background-color:color-mix(in oklab, currentcolor 20%, transparent)}}:where(.media-skin[data-theme=default]) .media-slider-buffer[data-orientation=horizontal]{left:calc(var(--media-slider-chapter-start,0%) + var(--media-spacing) * var(--media-chapter-inset-start,0));right:max(calc(100% - var(--media-slider-buffer,0%)), calc(100% - var(--media-slider-chapter-end,100%) + var(--media-spacing) * var(--media-chapter-inset-end,0)));clip-path:inset(-1px 0)}:where(.media-skin[data-theme=default]) .media-slider-buffer[data-orientation=horizontal]:before{content:"";min-width:var(--media-spacing);left:0}:where(.media-skin[data-theme=default]) .media-slider-buffer[data-orientation=vertical]{bottom:calc(var(--media-slider-chapter-start,0%) + var(--media-spacing) * var(--media-chapter-inset-start,0));top:max(calc(100% - var(--media-slider-buffer,0%)), calc(100% - var(--media-slider-chapter-end,100%) + var(--media-spacing) * var(--media-chapter-inset-end,0)));clip-path:inset(0 -1px)}:where(.media-skin[data-theme=default]) .media-slider-buffer[data-orientation=vertical]:before{content:"";min-height:var(--media-spacing);bottom:0}:where(.media-skin[data-theme=default]) .media-slider-fill{pointer-events:none;position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-slider-fill:before{border-radius:var(--media-control-radius);content:"";background-color:var(--media-primary);width:100%;height:100%;position:absolute}:where(.media-skin[data-theme=default]) .media-slider-fill[data-orientation=horizontal]{left:calc(var(--media-slider-chapter-start,0%) + var(--media-spacing) * var(--media-chapter-inset-start,0));right:max(calc(100% - var(--media-slider-fill,0%)), calc(100% - var(--media-slider-chapter-end,100%) + var(--media-spacing) * var(--media-chapter-inset-end,0)));clip-path:inset(-1px 0)}:where(:where(.media-skin[data-theme=default]) .media-slider)[data-dragging] .media-slider-fill[data-orientation=horizontal]{left:calc(var(--media-slider-chapter-start,0%) + var(--media-spacing) * var(--media-chapter-inset-start,0));right:max(calc(100% - var(--media-slider-pointer,0%)), calc(100% - var(--media-slider-chapter-end,100%) + var(--media-spacing) * var(--media-chapter-inset-end,0)));clip-path:inset(-1px 0)}:where(.media-skin[data-theme=default]) .media-slider-fill[data-orientation=horizontal]:before{content:"";min-width:var(--media-spacing);left:0}:where(.media-skin[data-theme=default]) .media-slider-fill[data-orientation=vertical]{bottom:calc(var(--media-slider-chapter-start,0%) + var(--media-spacing) * var(--media-chapter-inset-start,0));top:max(calc(100% - var(--media-slider-fill,0%)), calc(100% - var(--media-slider-chapter-end,100%) + var(--media-spacing) * var(--media-chapter-inset-end,0)));clip-path:inset(0 -1px)}:where(:where(.media-skin[data-theme=default]) .media-slider)[data-dragging] .media-slider-fill[data-orientation=vertical]{bottom:calc(var(--media-slider-chapter-start,0%) + var(--media-spacing) * var(--media-chapter-inset-start,0));top:max(calc(100% - var(--media-slider-pointer,0%)), calc(100% - var(--media-slider-chapter-end,100%) + var(--media-spacing) * var(--media-chapter-inset-end,0)));clip-path:inset(0 -1px)}:where(.media-skin[data-theme=default]) .media-slider-fill[data-orientation=vertical]:before{content:"";min-height:var(--media-spacing);bottom:0}:where(.media-skin[data-theme=default]) .media-slider-thumb{top:50%;left:var(--media-slider-fill,0%);z-index:10;width:calc(var(--media-spacing) * 3);height:calc(var(--media-spacing) * 3);border-radius:var(--media-control-radius);box-shadow:0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--media-shadow-thumb);outline-offset:-4px;transition-property:opacity,height,width,outline-offset,scale;transition-duration:.15s;transition-duration:var(--media-duration-slider);-webkit-user-select:none;user-select:none;background-color:#fff;outline:4px solid #0000;transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute;translate:-50% -50%}:where(:where(.media-skin[data-theme=default]) .media-slider)[data-dragging] .media-slider-thumb{scale:.9}:where(.media-skin[data-theme=default]) .media-slider-thumb:after{pointer-events:none;inset:calc(var(--media-spacing) * -1);border-radius:inherit;opacity:0;transition-property:opacity,scale;transition-duration:.15s;transition-duration:var(--media-duration);content:"";transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute;scale:.5;box-shadow:0 0 #0000,0 0 #0000,0 0 #0000,0 0 #0000,0 0 0 2px}@media (hover:hover){:where(.media-skin[data-theme=default]) .media-slider-thumb:hover{outline-offset:0px;outline-color:currentColor}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-slider-thumb:hover{outline-color:color-mix(in oklab, currentcolor 15%, transparent)}}}:where(.media-skin[data-theme=default]) .media-slider-thumb:focus-visible{outline-offset:0px;outline-color:currentColor}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-slider-thumb:focus-visible{outline-color:color-mix(in oklab, currentcolor 15%, transparent)}}:where(.media-skin[data-theme=default]) .media-slider-thumb:focus-visible:after{content:"";opacity:1;scale:1}:where(:where(.media-skin[data-theme=default]) .media-slider)[data-dragging] .media-slider-thumb[data-orientation=horizontal]{left:var(--media-slider-pointer)}:where(.media-skin[data-theme=default]) .media-slider-thumb[data-orientation=vertical]{top:calc(100% - var(--media-slider-fill,0%));left:50%}:where(:where(.media-skin[data-theme=default]) .media-slider)[data-dragging] .media-slider-thumb[data-orientation=vertical]{top:calc(100% - var(--media-slider-pointer))}:where(.media-skin[data-theme=default]) .media-slider-track{isolation:isolate;-webkit-user-select:none;user-select:none;border-radius:9999px;width:100%;position:relative}:where(.media-skin[data-theme=default]) .media-slider-track:before{pointer-events:none;border-radius:var(--media-control-radius);content:"";background-color:currentColor;position:absolute;inset:0}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-slider-track:before{background-color:color-mix(in oklab, currentcolor 20%, transparent)}}:where(.media-skin[data-theme=default]) .media-slider-track[data-orientation=horizontal]{height:var(--media-spacing)}:where(.media-skin[data-theme=default]) .media-slider-track[data-orientation=vertical]{height:100%;width:var(--media-spacing)}:where(.media-skin[data-theme=default]) .media-slider{cursor:pointer;transition-property:--media-slider-fill,--media-slider-buffer;transition-duration:.15s;transition-duration:var(--media-duration-slider);border-radius:9999px;outline-style:none;flex:1;justify-content:center;align-items:center;transition-timing-function:cubic-bezier(0,0,.2,1);display:flex;position:relative}@media (forced-colors:active){:where(.media-skin[data-theme=default]) .media-slider{outline-offset:2px;outline:2px solid #0000}}:where(.media-skin[data-theme=default]) .media-slider[data-disabled]{pointer-events:none}:where(.media-skin[data-theme=default]) .media-slider[data-dragging]{transition-duration:0s}:where(.media-skin[data-theme=default]) .media-slider[data-orientation=horizontal]{height:var(--media-slider-height,calc(var(--media-spacing) * 8));min-width:calc(var(--media-spacing) * 18)}:where(.media-skin[data-theme=default]) .media-slider[data-orientation=vertical]{height:calc(var(--media-spacing) * 18);width:calc(var(--media-spacing) * 8);min-width:0}:where(.media-skin[data-theme=default]) .media-volume-slider-thumb{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-volume-popover{border-radius:var(--media-control-radius);padding-inline:0;padding-block:calc(var(--media-spacing) * 3);--media-popup-side-offset:var(--media-popover-side-offset)}:where(.media-skin[data-theme=default]) .media-volume-popover[data-side=right]{padding:0;padding-inline:calc(var(--media-spacing) * 3);--media-popover-side-offset:0rem;border-radius:0;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;background-color:#0000!important}:where(.media-skin[data-theme=default]) .media-volume-popover[data-side=right]:after{content:"";display:none}:where(.media-skin[data-theme=default]) .media-slider-preview{height:var(--media-spacing);min-width:var(--media-slider-preview-max-width);--media-slider-preview-max-height:var(--media-slider-preview-max-width);--media-slider-preview-max-width:min(calc(var(--media-spacing) * 32), 100cqi);position:relative}:where(.media-skin[data-theme=default]) .media-slider-preview:before{pointer-events:none;z-index:1;width:var(--media-spacing);height:var(--media-spacing);border-radius:var(--media-control-radius);opacity:0;transition-property:opacity,scale;transition-duration:.15s;transition-duration:var(--media-duration-slow);content:"";background-color:currentColor;transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute;top:50%;left:50%;translate:-50% -50%;scale:.5}:where(.media-skin[data-theme=default]) .media-slider-preview[data-pointing]:not([data-dragging]):before{content:"";opacity:1;scale:1}@container media-root (width>=30rem){:where(.media-skin[data-theme=default]) .media-slider-preview{--media-slider-preview-max-width:min(calc(var(--media-spacing) * 40), 100cqi)}}@container media-root (width>=42rem){:where(.media-skin[data-theme=default]) .media-slider-preview{--media-slider-preview-max-width:min(calc(var(--media-spacing) * 48), 100cqi)}}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-slider-thumbnail{background-color:color-mix(in oklab, var(--media-backdrop) 90%, transparent)}}:where(:where(.media-skin[data-theme=default]) .media-slider-thumbnail)[data-loading] .media-slider-thumbnail-image{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-slider-thumbnail):not([data-loading]) .media-slider-thumbnail-spinner-icon{--media-spinner-animation:none}:where(:where(.media-skin[data-theme=default]) .media-slider-thumbnail)[data-loading] .media-slider-thumbnail-spinner-icon{opacity:1}:where(.media-skin[data-theme=default]) .media-time-slider[data-playing]{transition-property:--media-slider-buffer;transition-duration:.15s;transition-timing-function:cubic-bezier(.4,0,.2,1)}:where(.media-skin[data-theme=default]) .media-time-slider-chapter{--media-chapter-inset-end:.5;--media-chapter-inset-start:.5;justify-content:center;align-items:center;min-width:0;min-height:0;display:flex;position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-time-slider-chapter:first-of-type{--media-chapter-inset-start:0}:where(.media-skin[data-theme=default]) .media-time-slider-chapter:last-of-type{--media-chapter-inset-end:0}:where(.media-skin[data-theme=default]) .media-time-slider-chapter[data-orientation=horizontal]{clip-path:inset(0 calc(100% - var(--media-slider-chapter-end)) 0 var(--media-slider-chapter-start))}:where(.media-skin[data-theme=default]) .media-time-slider-chapter[data-orientation=vertical]{clip-path:inset(calc(100% - var(--media-slider-chapter-end)) 0 var(--media-slider-chapter-start) 0)}:where(:where(.media-skin[data-theme=default]) .media-time-slider-chapter)[data-highlighted] .media-time-slider-chapter-layer[data-orientation=horizontal]:before{content:"";min-width:calc(var(--media-spacing) * 1.75)}:where(:where(.media-skin[data-theme=default]) .media-time-slider-chapter)[data-highlighted] .media-time-slider-chapter-layer[data-orientation=vertical]:before{content:"";min-height:calc(var(--media-spacing) * 1.75)}:where(.media-skin[data-theme=default]) .media-time-slider-chapter-title{max-width:var(--media-slider-preview-max-width);text-overflow:ellipsis;white-space:nowrap;min-width:0;padding-inline:calc(var(--media-spacing) * 6);overflow:hidden}:where(.media-skin[data-theme=default]) .media-time-slider-chapter-title:empty{display:none}:where(.media-skin[data-theme=default]) .media-time-slider-chapter-track{transition-property:height,width;transition-duration:.15s;transition-duration:var(--media-duration-slow);transition-timing-function:cubic-bezier(0,0,.2,1)}:where(:where(.media-skin[data-theme=default]) .media-time-slider-chapter)[data-highlighted] .media-time-slider-chapter-track[data-orientation=horizontal]{height:calc(var(--media-spacing) * 1.75)}:where(.media-skin[data-theme=default]) .media-time-slider-chapter-track[data-orientation=horizontal]:before{content:"";left:calc(var(--media-slider-chapter-start) + var(--media-spacing) * var(--media-chapter-inset-start));right:calc(100% - var(--media-slider-chapter-end) + var(--media-spacing) * var(--media-chapter-inset-end));clip-path:inset(-1px)}:where(:where(.media-skin[data-theme=default]) .media-time-slider-chapter)[data-highlighted] .media-time-slider-chapter-track[data-orientation=vertical]{width:calc(var(--media-spacing) * 1.75)}:where(.media-skin[data-theme=default]) .media-time-slider-chapter-track[data-orientation=vertical]:before{content:"";top:calc(100% - var(--media-slider-chapter-end) + var(--media-spacing) * var(--media-chapter-inset-end));bottom:calc(var(--media-slider-chapter-start) + var(--media-spacing) * var(--media-chapter-inset-start));clip-path:inset(-1px)}:where(.media-skin[data-theme=default]) .media-time-slider-chapters{border-radius:inherit;flex:1;align-items:center;width:100%;min-width:0;height:100%;min-height:0;display:flex;position:relative}:where(.media-skin[data-theme=default]) .media-time-slider-preview-content{bottom:calc(100% + var(--media-slider-preview-label-offset));font-variant-numeric:tabular-nums;flex-direction:column;align-items:center;display:flex;left:50%}:where(.media-skin[data-theme=default]) .media-time-slider-thumb{opacity:0;scale:.8}:where(.media-skin[data-theme=default]) .media-time-slider-thumb:focus-visible,:where(.media-skin[data-theme=default]) .media-time-slider-thumb[data-interactive]{opacity:1}@media (pointer:fine){@media (hover:hover){:where(:where(.media-skin[data-theme=default]) .media-slider):hover .media-time-slider-thumb{opacity:1;scale:1}}}:where(.media-skin[data-theme=default]) .media-time-slider-value{font-variant-numeric:tabular-nums}.media-slider-thumbnail>slot::slotted(img){transition-property:opacity;transition-duration:.15s;transition-duration:var(--media-duration);transition-timing-function:cubic-bezier(0,0,.2,1);display:block}.media-slider-thumbnail[data-loading]>slot::slotted(img){opacity:0}:where(.media-skin[data-theme=default]) .media-slider-preview-content{max-width:var(--media-slider-preview-max-width);transform-origin:bottom;translate:-50% var(--media-hidden-preview-offset);scale:var(--media-hidden-preview-scale) var(--media-hidden-preview-scale);opacity:0;filter:blur(var(--media-hidden-blur));transition-property:filter,opacity,scale;transition-duration:.15s;transition-duration:var(--media-duration);transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute}:where(.media-skin[data-theme=default]) :where(.media-slider):has(:focus-visible) .media-slider-preview-content,:where(.media-skin[data-theme=default]) :where(.media-slider-preview)[data-pointing] .media-slider-preview-content{opacity:1;filter:none;scale:1}:where(.media-skin[data-theme=default]) .media-slider-thumbnail{pointer-events:none;bottom:calc(100% + var(--media-slider-preview-offset));max-height:var(--media-slider-preview-max-height);border-radius:var(--media-popup-radius);background-color:var(--media-backdrop);left:50%;overflow:hidden}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-slider-thumbnail{background-color:color-mix(in oklab, var(--media-backdrop) 90%, transparent)}}:where(.media-skin[data-theme=default]) .media-slider-thumbnail:after{pointer-events:none;border-radius:inherit;content:"";background-image:var(--media-thumbnail-gradient);position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-slider-thumbnail[data-loading]{aspect-ratio:16/9;width:var(--media-slider-preview-max-width)}:where(.media-skin[data-theme=default]) .media-slider-thumbnail-image{transition-property:opacity;transition-duration:.15s;transition-duration:var(--media-duration);transition-timing-function:cubic-bezier(0,0,.2,1);display:block}:where(.media-skin[data-theme=default]) :where(.media-slider-thumbnail)[data-loading] .media-slider-thumbnail-image{opacity:0}:where(.media-skin[data-theme=default]) .media-slider-thumbnail-spinner-icon{z-index:10;width:var(--media-icon-size,calc(var(--media-spacing) * 4.5));height:var(--media-icon-size,calc(var(--media-spacing) * 4.5));opacity:0;filter:drop-shadow(0 1px 0 var(--media-shadow-current-color));transition-property:opacity;transition-duration:.15s;transition-duration:var(--media-duration);transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute;top:50%;left:50%;translate:-50% -50%}:where(.media-skin[data-theme=default]) :where(.media-slider-thumbnail):not([data-loading]) .media-slider-thumbnail-spinner-icon{--media-spinner-animation:none}:where(.media-skin[data-theme=default]) :where(.media-slider-thumbnail)[data-loading] .media-slider-thumbnail-spinner-icon{opacity:1}:where(.media-skin[data-theme=default]) .media-menu-back-chevron{width:calc(var(--media-icon-size,calc(var(--media-spacing) * 4.5)) * 7 / 9);height:calc(var(--media-icon-size,calc(var(--media-spacing) * 4.5)) * 7 / 9);color:var(--media-muted-foreground);filter:drop-shadow(0 1px 0 var(--media-shadow-current-color));flex-shrink:0;rotate:180deg}:where(:where(.media-skin[data-theme=default]) .media-menu-back-item):where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])) .media-menu-back-chevron{color:inherit}:where(.media-skin[data-theme=default]) .media-menu-back-chevron:where(:dir(rtl),[dir=rtl],[dir=rtl] *){rotate:0deg;scale:1}:where(.media-skin[data-theme=default]) .media-menu-forward-chevron{width:calc(var(--media-icon-size,calc(var(--media-spacing) * 4.5)) * 7 / 9);height:calc(var(--media-icon-size,calc(var(--media-spacing) * 4.5)) * 7 / 9);color:var(--media-muted-foreground);filter:drop-shadow(0 1px 0 var(--media-shadow-current-color));flex-shrink:0}:where(:where(.media-skin[data-theme=default]) .media-menu-trigger-item):where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])) .media-menu-forward-chevron{color:inherit}:where(.media-skin[data-theme=default]) .media-menu-forward-chevron:where(:dir(rtl),[dir=rtl],[dir=rtl] *){scale:-1 1}:where(.media-skin[data-theme=default]) .media-menu-item-indicator{opacity:0;flex-shrink:0;margin-inline-start:auto;margin-inline-end:calc(var(--media-spacing) * -1)}:where(:where(.media-skin[data-theme=default]) .media-menu-radio-item)[aria-checked=true] .media-menu-item-indicator{opacity:1}:where(.media-skin[data-theme=default]) .media-menu-radio-item{cursor:pointer;justify-content:space-between;align-items:center;gap:calc(var(--media-spacing) * 1.5);border-radius:var(--media-menu-item-radius);padding-inline:calc(var(--media-spacing) * 2);padding-block:calc(var(--media-spacing) * 1.5);text-align:start;white-space:nowrap;color:inherit;font-variant-numeric:tabular-nums;outline-offset:-2px;transition-property:background-color,color;transition-duration:.15s;transition-duration:var(--media-duration-fast);-webkit-user-select:none;user-select:none;text-shadow:0 1px 0 var(--media-shadow-current-color);outline:2px solid #0000;transition-timing-function:cubic-bezier(.4,0,.2,1);display:flex;position:relative}:where(.media-skin[data-theme=default]) .media-menu-radio-item:focus-visible{outline-offset:2px;outline-color:var(--media-ring)}:where(.media-skin[data-theme=default]) .media-menu-radio-item[aria-disabled=true]{pointer-events:none;cursor:not-allowed;opacity:.5}:where(.media-skin[data-theme=default]) .media-menu-radio-item[data-custom]{font-style:italic}:where(.media-skin[data-theme=default]) .media-menu-radio-item[data-availability=unavailable],:where(.media-skin[data-theme=default]) .media-menu-radio-item[data-availability=unsupported]{display:none}:where(.media-skin[data-theme=default]) .media-menu-radio-item:where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])){background-color:var(--media-accent);color:var(--media-accent-foreground)}@supports (top:anchor(top)){:where(.media-skin[data-theme=default]) .media-menu-radio-item{transition-duration:var(--media-duration-instant)}:where(.media-skin[data-theme=default]) .media-menu-radio-item[data-highlighted]{anchor-name:--media-menu-item-highlight-anchor}:where(.media-skin[data-theme=default]) .media-menu-radio-item:where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])){transition-duration:var(--media-duration-slow);background-color:#0000}}:where(.media-skin[data-theme=default]) .media-menu-radio-item-icon{width:var(--media-icon-size,calc(var(--media-spacing) * 4.5));height:var(--media-icon-size,calc(var(--media-spacing) * 4.5));color:var(--media-muted-foreground);filter:drop-shadow(0 1px 0 var(--media-shadow-current-color));flex-shrink:0}:where(:where(.media-skin[data-theme=default]) .media-menu-radio-item):where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])) .media-menu-radio-item-icon{color:inherit}:where(.media-skin[data-theme=default]) .media-menu-back-item{margin-bottom:calc(var(--media-spacing) * .5);cursor:pointer;align-items:center;gap:calc(var(--media-spacing) * 1.5);border-radius:var(--media-menu-item-radius);width:100%;padding-inline:calc(var(--media-spacing) * 2);padding-block:calc(var(--media-spacing) * 1.5);text-align:start;white-space:nowrap;outline-offset:-2px;transition-property:background-color,color;transition-duration:.15s;transition-duration:var(--media-duration-fast);-webkit-user-select:none;user-select:none;text-shadow:0 1px 0 var(--media-shadow-current-color);outline:2px solid #0000;transition-timing-function:cubic-bezier(.4,0,.2,1);display:flex;position:relative}:where(.media-skin[data-theme=default]) .media-menu-back-item:focus-visible{outline-offset:2px;outline-color:var(--media-ring)}:where(.media-skin[data-theme=default]) .media-menu-back-item:where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])){background-color:var(--media-accent);color:var(--media-accent-foreground)}@supports (top:anchor(top)){:where(.media-skin[data-theme=default]) .media-menu-back-item{transition-duration:var(--media-duration-instant)}:where(.media-skin[data-theme=default]) .media-menu-back-item:where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])){transition-duration:var(--media-duration-slow)}}:where(.media-skin[data-theme=default]) .media-menu-content{max-height:inherit;overscroll-behavior:none;transition-property:translate,filter;transition-duration:.15s;transition-duration:var(--media-duration-menu);anchor-scope:--media-menu-item-highlight-anchor;outline-style:none;transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute;overflow:auto}@media (forced-colors:active){:where(.media-skin[data-theme=default]) .media-menu-content{outline-offset:2px;outline:2px solid #0000}}:where(.media-skin[data-theme=default]) .media-menu-content:not([data-submenu]){inset-inline:var(--media-spacing);top:var(--media-spacing);gap:calc(var(--media-spacing) * .5);flex-direction:column;display:flex}:where(.media-skin[data-theme=default]) .media-menu-content:not([data-submenu])[data-child-open]{filter:blur(var(--media-hidden-blur));translate:-100%}:where(.media-skin[data-theme=default]) .media-menu-content:not([data-submenu])[data-child-open]:before{content:"";display:none}:where(.media-skin[data-theme=default]) .media-menu-content[data-submenu]{z-index:10;max-height:inherit;padding:var(--media-spacing);inset-inline:0;top:0}:where(.media-skin[data-theme=default]) .media-menu-content:not([data-submenu])[data-child-open]:where(:dir(rtl),[dir=rtl],[dir=rtl] *){translate:100%}:where(.media-skin[data-theme=default]) .media-menu-content:is([data-starting-style],[data-ending-style]):before{content:"";display:none}:where(.media-skin[data-theme=default]) .media-menu-content[data-submenu]:is([data-starting-style],[data-ending-style]){pointer-events:none;filter:blur(var(--media-hidden-blur));overflow:hidden;translate:100%}:where(.media-skin[data-theme=default]) .media-menu-content[data-submenu]:is([data-starting-style],[data-ending-style]):where(:dir(rtl),[dir=rtl],[dir=rtl] *){translate:-100%}@supports (top:anchor(top)){:where(.media-skin[data-theme=default]) .media-menu-content:before{content:"";position-anchor:--media-menu-item-highlight-anchor;inset:anchor(inside);overflow-anchor:none;pointer-events:none;border-radius:var(--media-menu-item-radius);background-color:var(--media-accent);transition:inset var(--media-duration-fast) ease-in-out;position:absolute}:where(.media-skin[data-theme=default]) .media-menu-content:has([data-highlighted=""]):before{content:"";transition-duration:0s}}:where(.media-skin[data-theme=default]) .media-menu-content:is([data-starting-style],[data-ending-style]) :before{content:"";display:none}:where(.media-skin[data-theme=default]) .media-menu-hint{align-items:center;gap:var(--media-spacing);min-width:0;margin-inline-start:auto;padding-inline-start:calc(var(--media-spacing) * 2);display:inline-flex}:where(.media-skin[data-theme=default]) .media-menu-hint-label{max-width:calc(var(--media-spacing) * 24);text-overflow:ellipsis;white-space:nowrap;opacity:.65;overflow:hidden}:where(.media-skin[data-theme=default]) .media-menu-radio-group{max-height:inherit;gap:calc(var(--media-spacing) * .5);anchor-scope:--media-menu-item-highlight-anchor;flex-direction:column;display:flex}:where(.media-skin[data-theme=default]) .media-menu-radio-group:is([data-starting-style],[data-ending-style]):before{content:"";display:none}@supports (top:anchor(top)){:where(.media-skin[data-theme=default]) .media-menu-radio-group:before{content:"";position-anchor:--media-menu-item-highlight-anchor;inset:anchor(inside);overflow-anchor:none;pointer-events:none;border-radius:var(--media-menu-item-radius);background-color:var(--media-accent);transition:inset var(--media-duration-fast) ease-in-out;position:absolute}:where(.media-skin[data-theme=default]) .media-menu-radio-group:has([data-highlighted=""]):before{content:"";transition-duration:0s}}:where(.media-skin[data-theme=default]) .media-menu-radio-group:is([data-starting-style],[data-ending-style]) :before{content:"";display:none}:where(.media-skin[data-theme=default]) .media-menu-separator{margin-block:var(--media-spacing);border-bottom-style:solid;border-bottom-width:1px;border-color:var(--media-border);box-shadow:0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--media-shadow-separator);display:block}@media (prefers-reduced-transparency:reduce),(prefers-contrast:more){:where(.media-skin[data-theme=default]) .media-menu-separator{border-color:var(--media-foreground)}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-menu-separator{border-color:color-mix(in oklab, var(--media-foreground) 25%, transparent)}}}:where(.media-skin[data-theme=default]) .media-menu-trigger-item{cursor:pointer;justify-content:space-between;align-items:center;gap:calc(var(--media-spacing) * 1.5);border-radius:var(--media-menu-item-radius);padding-inline:calc(var(--media-spacing) * 2);padding-block:calc(var(--media-spacing) * 1.5);text-align:start;white-space:nowrap;color:inherit;font-variant-numeric:tabular-nums;outline-offset:-2px;transition-property:background-color,color;transition-duration:.15s;transition-duration:var(--media-duration-fast);-webkit-user-select:none;user-select:none;text-shadow:0 1px 0 var(--media-shadow-current-color);outline:2px solid #0000;transition-timing-function:cubic-bezier(.4,0,.2,1);display:flex;position:relative}:where(.media-skin[data-theme=default]) .media-menu-trigger-item:focus-visible{outline-offset:2px;outline-color:var(--media-ring)}:where(.media-skin[data-theme=default]) .media-menu-trigger-item[aria-disabled=true]{pointer-events:none;cursor:not-allowed;opacity:.5}:where(.media-skin[data-theme=default]) .media-menu-trigger-item[data-availability=unavailable],:where(.media-skin[data-theme=default]) .media-menu-trigger-item[data-availability=unsupported]{display:none}:where(.media-skin[data-theme=default]) .media-menu-trigger-item:where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])){background-color:var(--media-accent);color:var(--media-accent-foreground)}@supports (top:anchor(top)){:where(.media-skin[data-theme=default]) .media-menu-trigger-item{transition-duration:var(--media-duration-instant)}:where(.media-skin[data-theme=default]) .media-menu-trigger-item[data-highlighted]{anchor-name:--media-menu-item-highlight-anchor}:where(.media-skin[data-theme=default]) .media-menu-trigger-item:where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])){transition-duration:var(--media-duration-slow);background-color:#0000}}:where(.media-skin[data-theme=default]) .media-menu-trigger-item-icon{width:var(--media-icon-size,calc(var(--media-spacing) * 4.5));height:var(--media-icon-size,calc(var(--media-spacing) * 4.5));color:var(--media-muted-foreground);filter:drop-shadow(0 1px 0 var(--media-shadow-current-color));flex-shrink:0}:where(:where(.media-skin[data-theme=default]) .media-menu-trigger-item):where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])) .media-menu-trigger-item-icon{color:inherit}:where(.media-skin[data-theme=default]) .media-menu-badge{border-radius:var(--media-control-radius);background-color:var(--media-accent);padding-inline:calc(var(--media-spacing) * 1.5);font-size:.7em;font-weight:600}:where(.media-skin[data-theme=default]) .media-menu-tier{opacity:.7;padding-inline-start:calc(var(--media-spacing) * .5);padding-top:1px;font-size:.7em;font-weight:600;line-height:1}:where(.media-skin[data-theme=default]) .media-menu-popup{height:var(--media-menu-height);max-height:min(var(--media-menu-available-height,calc(var(--media-spacing) * 56)), calc(var(--media-spacing) * 56));width:var(--media-menu-width);max-width:var(--media-menu-available-width);min-width:calc(var(--media-spacing) * 44);overscroll-behavior:none;border-radius:var(--media-popup-radius);padding:var(--media-spacing);transition-property:opacity,filter,transform,scale;transition-duration:var(--media-duration-fast);--media-popup-side-offset:var(--media-popover-side-offset);border-style:solid;border-width:0;margin:0;transition-timing-function:cubic-bezier(0,0,.2,1);overflow:hidden!important}:where(.media-skin[data-theme=default]) .media-menu-popup:is([data-starting-style],[data-ending-style]){transition-property:opacity,filter,transform,scale;transition-duration:var(--media-duration-fast);transition-timing-function:cubic-bezier(0,0,.2,1)}:where(.media-skin[data-theme=default]) .media-menu-resizable-popup{transition-property:opacity,filter,transform,scale,width,height;transition-duration:var(--media-duration-fast), var(--media-duration-fast), var(--media-duration-fast), var(--media-duration-fast), var(--media-duration-menu), var(--media-duration-menu)}:where(.media-skin[data-theme=default]) .media-settings-menu-trigger-icon{transition-property:transform,translate,scale,rotate;transition-duration:.15s;transition-duration:var(--media-duration);transition-timing-function:cubic-bezier(.4,0,.2,1)}:where(:where(.media-skin[data-theme=default]) .media-settings-menu-trigger)[aria-expanded=true] .media-settings-menu-trigger-icon{rotate:90deg}@media (prefers-reduced-motion:reduce){:where(.media-skin[data-theme=default]) .media-settings-menu-trigger-icon{transition-property:none}}:where(.media-skin[data-theme=default]) .media-settings-menu-trigger-label{clip-path:inset(50%);white-space:nowrap;border-width:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}:where(.media-skin[data-theme=default]) .media-button-icon-base{width:var(--media-icon-size,calc(var(--media-spacing) * 4.5));height:var(--media-icon-size,calc(var(--media-spacing) * 4.5));filter:drop-shadow(0 1px 0 var(--media-shadow-current-color));text-shadow:inherit;grid-row-start:1;grid-column-start:1}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-backdrop{pointer-events:none;z-index:10;border-radius:inherit;background-image:var(--media-controls-gradient);background-size:100% var(--media-controls-bottom-gradient-height);transition-property:opacity;transition-duration:.15s;transition-duration:var(--media-duration-controls);background-position:bottom;background-repeat:no-repeat;transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute;inset:0}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-backdrop:not([data-visible]){opacity:0}@container media-root (width<32rem){:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-backdrop:before{height:var(--media-controls-gradient-height);content:"";background-image:var(--media-controls-top-gradient);inset-inline:0;position:absolute;top:0}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-captions-button{display:none}}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-content{padding:var(--media-spacing);color:var(--media-controls-foreground);transition-property:filter,opacity,scale,translate;transition-duration:.15s;transition-duration:calc(var(--media-duration-controls) / 2);text-shadow:0 1px 0 var(--media-shadow-current-color);transition-timing-function:cubic-bezier(0,0,.2,1);display:contents}@container media-root (width>=32rem){:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-content{inset-inline:calc(var(--media-spacing) * 2);bottom:calc(var(--media-spacing) * 2);z-index:30;border-radius:var(--media-controls-radius);background-color:var(--media-popover);color:var(--media-popover-foreground);box-shadow:0 0 0 1px var(--media-surface-border,var(--media-border)), var(--media-shadow-surface);-webkit-backdrop-filter:var(--media-backdrop-filter-surface);backdrop-filter:var(--media-backdrop-filter-surface);align-items:center;display:flex;position:absolute}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-content:not([data-visible]){pointer-events:none;translate:0 var(--media-hidden-offset);scale:var(--media-hidden-scale) var(--media-hidden-scale);opacity:0;transition-duration:var(--media-duration-controls)}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-content:after{content:"";z-index:10;pointer-events:none;border-radius:inherit;box-shadow:var(--media-shadow-surface-inset);position:absolute;inset:0}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-content:where(:dir(rtl),[dir=rtl],[dir=rtl] *){flex-direction:row-reverse}@media (pointer:fine){:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-content:not([data-visible]){filter:blur(var(--media-hidden-blur))}}}@container media-root (width>=42rem){:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-content{inset-inline:calc(var(--media-spacing) * 3);bottom:calc(var(--media-spacing) * 3)}}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-primary{inset-inline:calc(var(--media-spacing) * 2);bottom:calc(var(--media-spacing) * 2);z-index:30;transform-origin:bottom;border-radius:var(--media-controls-radius);padding:calc(var(--media-spacing) * .5);transition-property:filter,opacity,scale,translate;transition-duration:.15s;transition-duration:calc(var(--media-duration-controls) / 2);align-items:center;transition-timing-function:cubic-bezier(0,0,.2,1);display:flex;position:absolute}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-primary:where(:dir(rtl),[dir=rtl],[dir=rtl] *){flex-direction:row-reverse}@container media-root (width>=32rem){:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-primary{display:contents}}@container media-root (width<32rem){:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-primary{background-color:var(--media-popover);color:var(--media-popover-foreground);box-shadow:0 0 0 1px var(--media-surface-border,var(--media-border)), var(--media-shadow-surface);-webkit-backdrop-filter:var(--media-backdrop-filter-surface);backdrop-filter:var(--media-backdrop-filter-surface)}:where(:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-content):not([data-visible]) .video-controls-primary{pointer-events:none;translate:0 var(--media-hidden-offset);scale:var(--media-hidden-scale) var(--media-hidden-scale);opacity:0;transition-duration:var(--media-duration-controls)}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-primary:after{content:"";z-index:10;pointer-events:none;border-radius:inherit;box-shadow:var(--media-shadow-surface-inset);position:absolute;inset:0}@media (pointer:fine){:where(:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-content):not([data-visible]) .video-controls-primary{filter:blur(var(--media-hidden-blur))}}}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-secondary{top:calc(var(--media-spacing) * 2);right:calc(var(--media-spacing) * 2);z-index:30;transform-origin:top;border-radius:var(--media-controls-radius);padding:calc(var(--media-spacing) * .5);transition-property:filter,opacity,scale,translate;transition-duration:.15s;transition-duration:calc(var(--media-duration-controls) / 2);align-items:center;gap:1px;transition-timing-function:cubic-bezier(0,0,.2,1);display:flex;position:absolute}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-secondary:where(:dir(rtl),[dir=rtl],[dir=rtl] *){flex-direction:row-reverse}@container media-root (width>=32rem){:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-secondary{padding:0;position:static}}@container media-root (width<32rem){:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-secondary{background-color:var(--media-popover);color:var(--media-popover-foreground);box-shadow:0 0 0 1px var(--media-surface-border,var(--media-border)), var(--media-shadow-surface);-webkit-backdrop-filter:var(--media-backdrop-filter-surface);backdrop-filter:var(--media-backdrop-filter-surface)}:where(:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-content):not([data-visible]) .video-controls-secondary{pointer-events:none;translate:0 calc(var(--media-hidden-offset) * -1);scale:var(--media-hidden-scale) var(--media-hidden-scale);opacity:0;transition-duration:var(--media-duration-controls)}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-secondary:after{content:"";z-index:10;pointer-events:none;border-radius:inherit;box-shadow:var(--media-shadow-surface-inset);position:absolute;inset:0}@media (pointer:fine){:where(:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-content):not([data-visible]) .video-controls-secondary{filter:blur(var(--media-hidden-blur))}}}@container media-root (width>=32rem){:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-settings-button{margin-inline-start:1px}}:where(.media-skin[data-theme=default][data-preset=video]) .video-controls-volume-button{margin-inline-start:1px}:where(.media-skin[data-theme=default][data-preset=video]) .video-time-slider-group{align-items:center;gap:calc(var(--media-spacing) * 2.5);padding-inline:calc(var(--media-spacing) * 2);flex:1;display:flex;container:media-time/inline-size}:where(.media-skin[data-theme=default][data-preset=video]) .video-time-slider-group:where(:dir(rtl),[dir=rtl],[dir=rtl] *){flex-direction:row-reverse}@container media-root (width>=32rem){:where(.media-skin[data-theme=default][data-preset=video]) .video-time-slider-group{padding-inline:calc(var(--media-spacing) * 3)}}@container media-time (width<16rem){:where(.media-skin[data-theme=default][data-preset=video]) .video-time-value{display:none}}:where(.media-skin[data-theme=default][data-preset=video]) .media-time-toggle{cursor:pointer;font-variant-numeric:tabular-nums;outline-offset:-2px;transition-property:outline-color,outline-offset;transition-duration:.15s;transition-duration:var(--media-duration-fast);border-radius:.25rem;outline:2px solid #0000;transition-timing-function:cubic-bezier(0,0,.2,1)}:where(.media-skin[data-theme=default][data-preset=video]) .media-time-toggle:focus-visible{outline-offset:2px;outline-color:var(--media-ring)}:where(.media-skin[data-theme=default][data-preset=video]) .media-time-toggle[aria-disabled=true]{cursor:not-allowed;opacity:.5}:where(.media-skin[data-theme=default][data-preset=video]) .media-time-value{font-variant-numeric:tabular-nums;transition-property:opacity;transition-duration:.15s;transition-duration:var(--media-duration-slow);transition-timing-function:cubic-bezier(0,0,.2,1)}:where(.media-skin[data-theme=default][data-preset=video]) .media-time-value[data-unavailable]{opacity:.5}@media (pointer:fine){:where(.media-skin[data-theme=default][data-preset=video]) .video-skin:not([data-controls-visible]),:where(.media-skin[data-theme=default][data-preset=video]).video-skin:not([data-controls-visible]){cursor:none}}}@layer utilities;@layer base.theme{.media-skin{--media-background:oklch(0% 0 0);--media-foreground:oklch(100% 0 0);--media-controls:oklch(0% 0 0/.35);--media-controls-foreground:var(--media-foreground);--media-popover:oklch(100% 0 0/.1);--media-popover-foreground:var(--media-foreground);--media-primary:var(--media-accent-color,var(--media-default-accent-color));--media-primary-foreground:var(--media-accent-text-color,var(--media-default-accent-text-color));--media-accent:var(--media-accent-color,color-mix(in oklab, var(--media-default-accent-color) 10%, transparent));--media-accent-foreground:var(--media-accent-text-color,currentColor);--media-muted:oklch(100% 0 0/.15);--media-muted-foreground:color-mix(in oklab, var(--media-foreground) 65%, transparent);--media-border:oklch(0% 0 0/.1);--media-ring:oklch(100% 0 0);--media-backdrop:oklch(0% 0 0);--media-live-color:oklch(65% .22 27);--media-shadow-surface:0 1px 3px 0 oklch(0% 0 0/.15), 0 1px 2px -1px oklch(0% 0 0/.15);--media-shadow-surface-inset:inset 0 1px 0 0 #ffffff1a, inset 0 0 0 1px #ffffff0d;--media-shadow-thumb:0 0 0 1px #0000001a, 0 1px 3px 0 #00000059, 0 1px 2px -1px #00000059;--media-shadow-tooltip:0 0 0 1px var(--media-border), var(--media-shadow-surface);--media-shadow-separator:0 1px 0 0 oklch(100% 0 0/.075);--media-shadow-current-color:oklch(from currentColor 0 0 0 / clamp(0, calc((l - .5) * .5), .15));--media-shadow-subtle-current-color:color-mix(in oklab, var(--media-shadow-current-color) 40%, transparent);--media-text-shadow-dialog:0 1px 0 #00000040;--media-backdrop-filter-surface:blur(16px) saturate(125%);--media-backdrop-filter-indicator:blur(8px);--media-backdrop-filter-dialog:blur(16px) saturate(125%);--media-control-corner-shape:round;--media-control-radius:99px;--media-control-size:calc(var(--media-spacing) * 9);--media-controls-radius:var(--media-control-radius);--media-default-accent-color:oklch(100% 0 0);--media-default-accent-text-color:oklch(0% 0 0);--media-duration-instant:50ms;--media-duration-fast:.1s;--media-duration:.15s;--media-duration-slow:.2s;--media-duration-slower:.25s;--media-duration-controls:.1s;--media-duration-dialog:.35s;--media-duration-indicator:var(--media-duration-slower);--media-duration-menu:.25s;--media-duration-slider:var(--media-duration-fast);--media-delay-dialog:.1s;--media-hidden-scale:.95;--media-hidden-blur:8px;--media-hidden-offset:calc(var(--media-spacing) * 1);--media-hidden-icon-scale:0;--media-hidden-indicator-scale:.9;--media-hidden-indicator-offset:-25%;--media-hidden-playback-scale:.85;--media-hidden-popup-scale:.95;--media-hidden-popup-blur:4px;--media-hidden-preview-scale:.8;--media-hidden-preview-offset:calc(var(--media-spacing) * 2);--media-hidden-seek-offset:60%;--media-menu-item-radius:calc(var(--media-spacing) * 2);--media-popover-boundary-offset:calc(var(--media-spacing) * 3);--media-popover-side-offset:calc(var(--media-spacing) * 3);--media-popup-radius:calc(var(--media-spacing) * 3);--media-popup-translate-distance:calc(var(--media-spacing) * 2);--media-tooltip-boundary-offset:var(--media-popover-boundary-offset);--media-tooltip-side-offset:var(--media-popover-side-offset);--media-dialog-radius:calc(var(--media-spacing) * 7);--media-dialog-width:calc(100% - var(--media-spacing) * 6);--media-dialog-max-width:calc(var(--media-spacing) * 72);--media-slider-preview-label-offset:calc(var(--media-spacing) * 10.5);--media-video-border-radius:var(--media-border-radius,28px);--media-scale:1;--media-scrollbar-thumb-color:color-mix(in oklab, currentColor 30%, transparent);--media-spacing:calc(var(--media-scale-unit,16px) * var(--media-scale) / 4);scrollbar-color:var(--media-scrollbar-thumb-color) transparent;scrollbar-width:thin}@supports (color:contrast-color(red)){.media-skin{--media-primary-foreground:var(--media-accent-text-color,contrast-color(var(--media-primary)));--media-accent-foreground:var(--media-accent-text-color,contrast-color(var(--media-accent-color,var(--media-internal-accent-text-fallback,oklch(0% 0 0)))))}}@supports (color:oklch(from red l c h)){.media-skin{--media-shadow-subtle-current-color:oklch(from var(--media-shadow-current-color) l c h / calc(alpha * .4))}}@supports (color:oklch(from currentColor l c h)){.media-skin{--media-scrollbar-thumb-color:oklch(from currentColor l c h / .3)}}.media-skin::-webkit-scrollbar-thumb{background:var(--media-scrollbar-thumb-color);border-radius:9999px}.media-skin:fullscreen{--media-object-fit:contain;--media-video-border-radius:0}@media (width>=1280px){.media-skin:fullscreen{--media-scale:1.25}}@media (width>=1536px){.media-skin:fullscreen{--media-scale:1.5}}@media (width>=1920px){.media-skin:fullscreen{--media-scale:1.75}}}@layer base.preset{.media-skin:is([data-preset=video],[data-preset=live-video]){--media-frame-border:var(--media-border-color,#0000001a);--media-controls-gradient-height:max(40%, calc(var(--media-spacing) * 40));--media-controls-bottom-gradient-height:max(50%, calc(var(--media-spacing) * 60));--media-controls-gradient:linear-gradient(to top, color-mix(in oklab, var(--media-backdrop) 60%, transparent), color-mix(in oklab, var(--media-backdrop) 50.7%, transparent) 25%, color-mix(in oklab, var(--media-backdrop) 30%, transparent) 50%, color-mix(in oklab, var(--media-backdrop) 9.3%, transparent) 75%, transparent);--media-controls-top-gradient:linear-gradient(to bottom, color-mix(in oklab, var(--media-backdrop) 55%, transparent), color-mix(in oklab, var(--media-backdrop) 46.48%, transparent) 25%, color-mix(in oklab, var(--media-backdrop) 27.5%, transparent) 50%, color-mix(in oklab, var(--media-backdrop) 8.53%, transparent) 75%, transparent);--media-caption-controls-y:calc(var(--media-spacing) * -16);--media-slider-preview-offset:calc(var(--media-spacing) * 9);--media-thumbnail-gradient:linear-gradient(to top, color-mix(in oklab, var(--media-backdrop) 50%, transparent), color-mix(in oklab, var(--media-backdrop) 10%, transparent), transparent)}@supports (color:oklch(from red l c h)) and (background-image:linear-gradient(in oklab, red, red)){.media-skin:is([data-preset=video],[data-preset=live-video]){--media-controls-gradient:linear-gradient(to top in oklab, oklch(from var(--media-backdrop) l c h / .6), oklch(from var(--media-backdrop) l c h / .507) 25%, oklch(from var(--media-backdrop) l c h / .3) 50%, oklch(from var(--media-backdrop) l c h / .093) 75%, transparent);--media-controls-top-gradient:linear-gradient(to bottom in oklab, oklch(from var(--media-backdrop) l c h / .55), oklch(from var(--media-backdrop) l c h / .4647) 25%, oklch(from var(--media-backdrop) l c h / .275) 50%, oklch(from var(--media-backdrop) l c h / .0853) 75%, transparent)}}@supports (color:oklch(from red l c h)){.media-skin:is([data-preset=video],[data-preset=live-video]){--media-thumbnail-gradient:linear-gradient(to top, oklch(from var(--media-backdrop) l c h / .5), oklch(from var(--media-backdrop) l c h / .1), transparent)}}.media-skin:is([data-preset=video],[data-preset=live-video])[data-theme=neutral]{--media-frame-border:var(--media-border-color,#00000026);--media-controls-gradient-height:40%;--media-controls-bottom-gradient-height:40%;--media-controls-gradient:linear-gradient(to top, color-mix(in oklab, var(--media-backdrop) 50%, transparent), color-mix(in oklab, var(--media-backdrop) 42.2%, transparent) 25%, color-mix(in oklab, var(--media-backdrop) 25%, transparent) 50%, color-mix(in oklab, var(--media-backdrop) 7.8%, transparent) 75%, transparent);--media-controls-top-gradient:linear-gradient(to bottom, color-mix(in oklab, var(--media-backdrop) 50%, transparent), color-mix(in oklab, var(--media-backdrop) 42.2%, transparent) 25%, color-mix(in oklab, var(--media-backdrop) 25%, transparent) 50%, color-mix(in oklab, var(--media-backdrop) 7.8%, transparent) 75%, transparent);--media-indicator-gradient:linear-gradient(to bottom, color-mix(in oklab, var(--media-backdrop) 35%, transparent), color-mix(in oklab, var(--media-backdrop) 20%, transparent) calc(var(--media-spacing) * 12), transparent);--media-caption-controls-y:calc(var(--media-spacing) * -14);--media-slider-preview-offset:calc(var(--media-spacing) * 11)}.media-skin:is([data-preset=video],[data-preset=live-video])[data-theme=compat]{--media-controls-gradient:linear-gradient(to top, #00000080, transparent 40% 60%, #0006);--media-caption-controls-y:calc(var(--media-spacing) * -18)}.media-skin:is([data-preset=video],[data-preset=live-video])[data-theme=scaffold]{--media-caption-controls-y:calc(var(--media-spacing) * -20)}@supports (color:oklch(from red l c h)) and (background-image:linear-gradient(in oklab, red, red)){.media-skin:is([data-preset=video],[data-preset=live-video])[data-theme=neutral]{--media-controls-gradient:linear-gradient(to top in oklab, oklch(from var(--media-backdrop) l c h / .5), oklch(from var(--media-backdrop) l c h / .422) 25%, oklch(from var(--media-backdrop) l c h / .25) 50%, oklch(from var(--media-backdrop) l c h / .078) 75%, transparent);--media-controls-top-gradient:linear-gradient(to bottom in oklab, oklch(from var(--media-backdrop) l c h / .5), oklch(from var(--media-backdrop) l c h / .422) 25%, oklch(from var(--media-backdrop) l c h / .25) 50%, oklch(from var(--media-backdrop) l c h / .078) 75%, transparent)}}@supports (color:oklch(from red l c h)){.media-skin:is([data-preset=video],[data-preset=live-video])[data-theme=neutral]{--media-indicator-gradient:linear-gradient(to bottom, oklch(from var(--media-backdrop) l c h / .35), oklch(from var(--media-backdrop) l c h / .2) calc(var(--media-spacing) * 12), transparent)}}@supports (color:light-dark(red, red)){.media-skin:is([data-preset=video],[data-preset=live-video]){--media-frame-border:var(--media-border-color,light-dark(#0000001a,#ffffff26))}.media-skin:is([data-preset=video],[data-preset=live-video])[data-theme=neutral]{--media-frame-border:var(--media-border-color,light-dark(#00000026,#ffffff26))}}}@layer base.preferences{@media (pointer:fine) and (prefers-reduced-motion:no-preference){.media-skin:not([data-controls-visible]){--media-duration-controls:.3s}}@media (pointer:coarse) and (prefers-reduced-motion:no-preference){.media-skin:not([data-controls-visible]){--media-duration-controls:.15s}}@media (prefers-reduced-motion:reduce){.media-skin{--media-duration-fast:var(--media-duration-instant);--media-duration:var(--media-duration-instant);--media-duration-slow:var(--media-duration-instant);--media-duration-slower:var(--media-duration-instant);--media-duration-controls:var(--media-duration-instant);--media-duration-dialog:var(--media-duration-instant);--media-duration-indicator:var(--media-duration-instant);--media-duration-menu:0s;--media-duration-slider:0s;--media-delay-dialog:0s;--media-hidden-scale:1;--media-hidden-blur:0px;--media-hidden-offset:0px;--media-hidden-icon-scale:1;--media-hidden-indicator-scale:1;--media-hidden-indicator-offset:0px;--media-hidden-playback-scale:1;--media-hidden-popup-scale:1;--media-hidden-popup-blur:0px;--media-hidden-preview-scale:1;--media-hidden-preview-offset:0px;--media-hidden-seek-offset:0px;--media-popup-translate-distance:0px;--media-spinner-animation:none;--media-icon-airplay-fill-animation:none;--media-icon-airplay-triangle-animation:none}}@media (prefers-reduced-transparency:reduce),(prefers-contrast:more){.media-skin{--media-popover:var(--media-background);--media-scrollbar-thumb-color:color-mix(in oklab, currentColor 80%, transparent);--media-backdrop-filter-surface:none;--media-backdrop-filter-indicator:none;--media-backdrop-filter-dialog:none;--media-shadow-surface-inset:inset 0 1px 0 0 #ffffff40, inset 0 0 0 1px #ffffff20;scrollbar-width:auto}@supports (color:oklch(from currentColor l c h)){.media-skin{--media-scrollbar-thumb-color:oklch(from currentColor l c h / .8)}}}@media (forced-colors:active){.media-skin{--media-border:CanvasText;--media-frame-border:CanvasText;--media-popover:Canvas;--media-popover-foreground:CanvasText;--media-ring:CanvasText;--media-shadow-surface-inset:inset 0 1px 0 0 CanvasText, inset 0 0 0 1px CanvasText}}}\n';

// node_modules/@videojs/html/dist/default/presets/video/skin.js
var VideoSkinElement = class extends SkinElement {
  static {
    this.tagName = "video-skin";
  }
  static {
    this.styles = createShadowStyle(skin_default);
  }
  static {
    this.template = template;
  }
};

// node_modules/@videojs/html/dist/default/i18n/context.js
var I18N_CONTEXT_KEY = Symbol.for("@videojs/i18n");
var i18nContext = n(I18N_CONTEXT_KEY);

// node_modules/@videojs/html/dist/default/i18n/controller.js
var fallbackTranslator;
function getFallbackTranslator() {
  fallbackTranslator ??= createTranslator(getI18nTranslations(DEFAULT_LOCALE), DEFAULT_LOCALE);
  return fallbackTranslator;
}
var I18nController = class {
  #host;
  #consumer;
  #unsubscribeRegistry;
  /**
  * @param host - Reactive host updated when the i18n value changes.
  * @param context - I18n context to consume.
  */
  constructor(host, context) {
    this.#host = host;
    this.#consumer = new ContextConsumer(host, {
      context,
      callback: () => this.#host.requestUpdate(),
      subscribe: true
    });
    host.addController(this);
  }
  get value() {
    return this.#consumer.value?.translator ?? getFallbackTranslator();
  }
  get locale() {
    return this.#consumer.value?.locale ?? DEFAULT_LOCALE;
  }
  hostConnected() {
    fallbackTranslator = void 0;
    this.#unsubscribeRegistry = onI18nRegistryChange(() => {
      fallbackTranslator = void 0;
      if (!this.#consumer.value) this.#host.requestUpdate();
    });
  }
  hostDisconnected() {
    this.#unsubscribeRegistry?.();
    this.#unsubscribeRegistry = void 0;
  }
};

// node_modules/@videojs/html/dist/default/i18n/locale.js
function resolvePlayerLocale(explicit, inherited) {
  return effectiveLocale(explicit, inherited);
}
function resolveProviderLocale(host) {
  const explicit = resolveLangAttr(host.lang);
  const root = host.parentElement ?? (typeof document !== "undefined" ? document.documentElement : null);
  return resolvePlayerLocale(explicit, resolveLangAttr(findNearestLang(root)));
}

// node_modules/@videojs/html/dist/default/i18n/provider-mixin.js
function createI18nProviderMixin({ context, loader = loadLocale }) {
  return (Base) => {
    class I18nProviderElement2 extends Base {
      constructor(..._args) {
        super(..._args);
        this.lang = "";
        this.dir = "";
        this.#i18nProvider = new i(this, {
          context,
          initialValue: {
            translator: getFallbackTranslator(),
            locale: DEFAULT_LOCALE
          }
        });
        this.#registryEpoch = 0;
        this.#lazyLayer = {};
        this.#lazySeq = 0;
        this.#i18nValue = {
          translator: getFallbackTranslator(),
          locale: DEFAULT_LOCALE
        };
        this.#publishedRegistryEpoch = -1;
      }
      static {
        this.properties = {
          ...Base.properties,
          lang: {
            type: String,
            reflect: true
          },
          dir: {
            type: String,
            reflect: true
          }
        };
      }
      #i18nProvider;
      #registryUnsubscribe;
      #ambientUnsubscribe;
      #registryEpoch;
      #lazyLayer;
      #lazySeq;
      /** Tracks locale used for `#lazyLayer`; ambient `lang` can change without the `lang` property. */
      #resolvedLocaleForLazy;
      /** Locale snapshot when the current `#lazySeq` async load was started (see `willUpdate` drift guard). */
      #lazyResetStartedForLocale;
      #i18nValue;
      #publishedLocale;
      #publishedRegistryEpoch;
      #publishedLazyLayer;
      #derivedDirection;
      get i18nValue() {
        return this.#i18nValue;
      }
      connectedCallback() {
        super.connectedCallback();
        this.#registryUnsubscribe = onI18nRegistryChange(() => {
          this.#registryEpoch += 1;
          this.requestUpdate();
        });
        this.#ambientUnsubscribe = subscribeAmbientLang(() => this.requestUpdate());
        this.#resetLazyAndLoad();
        this.#publish();
        this.requestUpdate();
      }
      disconnectedCallback() {
        super.disconnectedCallback();
        this.#registryUnsubscribe?.();
        this.#registryUnsubscribe = void 0;
        this.#ambientUnsubscribe?.();
        this.#ambientUnsubscribe = void 0;
        this.#lazySeq += 1;
        this.#lazyLayer = {};
        this.#resolvedLocaleForLazy = void 0;
        this.#lazyResetStartedForLocale = void 0;
      }
      willUpdate(changed) {
        super.willUpdate(changed);
        const locale = resolveProviderLocale(this);
        if (this.#resolvedLocaleForLazy !== locale) {
          const hadLocale = this.#resolvedLocaleForLazy !== void 0;
          this.#resolvedLocaleForLazy = locale;
          const localeDriftedBeforeFirstPaint = !hadLocale && this.#lazyResetStartedForLocale !== void 0 && locale !== this.#lazyResetStartedForLocale;
          if (hadLocale || localeDriftedBeforeFirstPaint) this.#resetLazyAndLoad();
        }
        this.#syncDirection(locale);
        this.#publish();
      }
      #resetLazyAndLoad() {
        const localeSnapshot = resolveProviderLocale(this);
        this.#lazyResetStartedForLocale = localeSnapshot;
        this.#lazySeq += 1;
        const seq = this.#lazySeq;
        this.#lazyLayer = {};
        (async () => {
          try {
            const { merged, loadedTags } = await mergeLocaleOverlays(localeSnapshot, loader, findLocaleKeys);
            if (seq !== this.#lazySeq) return;
            if (shouldAttemptBrowserTranslation(localeSnapshot, loadedTags, merged)) {
              const browser = await getBrowserTranslations(localeSnapshot);
              if (seq !== this.#lazySeq) return;
              if (Object.keys(browser).length) registerI18n(localeSnapshot, browser);
            }
            if (seq !== this.#lazySeq) return;
            this.#lazyLayer = merged;
            this.requestUpdate();
          } catch {
          }
        })();
      }
      #resolvedLocale() {
        return resolveProviderLocale(this);
      }
      #syncDirection(locale) {
        const current = this.dir.trim().toLowerCase();
        const isDerived = this.#derivedDirection !== void 0 && current === this.#derivedDirection;
        if (!this.lang.trim()) {
          if (isDerived) this.dir = "";
          this.#derivedDirection = void 0;
          return;
        }
        if (current && !isDerived) {
          this.#derivedDirection = void 0;
          return;
        }
        const direction = getTextDirection(locale);
        this.#derivedDirection = direction;
        if (this.dir !== direction) this.dir = direction;
      }
      #publish() {
        const locale = this.#resolvedLocale();
        if (this.#publishedLocale === locale && this.#publishedRegistryEpoch === this.#registryEpoch && this.#publishedLazyLayer === this.#lazyLayer) return;
        const registryLayer = getI18nTranslations(locale);
        const translations = {
          ...this.#lazyLayer,
          ...registryLayer
        };
        const translator = createTranslator(translations, locale);
        this.#i18nValue = {
          translator,
          locale
        };
        this.#publishedLocale = locale;
        this.#publishedRegistryEpoch = this.#registryEpoch;
        this.#publishedLazyLayer = this.#lazyLayer;
        this.#i18nProvider.setValue(this.#i18nValue);
      }
    }
    return I18nProviderElement2;
  };
}

// node_modules/@videojs/html/dist/default/i18n/provider-element.js
var I18nProviderMixin = createI18nProviderMixin({ context: i18nContext });
var I18nProviderElement = class extends I18nProviderMixin(ReactiveElement) {
  static {
    this.tagName = "media-i18n";
  }
};

// node_modules/@videojs/html/dist/default/i18n/text-mixin.js
function createTextMixin({ context }) {
  return (Base) => {
    class MediaText extends Base {
      constructor(..._args) {
        super(..._args);
        this.#i18n = new I18nController(this, context);
        this.token = "";
      }
      static {
        this.properties = { token: { type: String } };
      }
      #i18n;
      #text;
      connectedCallback() {
        this.#text ??= this.textContent?.trim() ?? "";
        super.connectedCallback();
      }
      updated(changed) {
        super.updated(changed);
        if (!this.#text) {
          this.textContent = "";
          return;
        }
        const text = this.token ? {
          key: this.token,
          text: this.#text
        } : this.#text;
        this.textContent = typeof text === "string" ? text : translateText(text, this.#i18n.value);
      }
    }
    return MediaText;
  };
}

// node_modules/@videojs/html/dist/default/ui/text/element.js
var I18nTextMixin = createTextMixin({ context: i18nContext });
var TextElement = class extends I18nTextMixin(ReactiveElement) {
  static {
    this.tagName = "media-text";
  }
};

// node_modules/@videojs/html/dist/default/define/i18n.js
safeDefine(I18nProviderElement);
safeDefine(TextElement);

// node_modules/@videojs/html/dist/default/icons/dist/html/default/airplay-enter.js
var airPlayEnterIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M14.5 2A3.5 3.5 0 0 1 18 5.5v5l-.005.18a3.5 3.5 0 0 1-3.027 3.288L13 12h1.5a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 14.5 4h-11A1.5 1.5 0 0 0 2 5.5v5A1.5 1.5 0 0 0 3.5 12H5l-1.968 1.967A3.5 3.5 0 0 1 0 10.5v-5A3.5 3.5 0 0 1 3.5 2z"/><path d="M8.631 10.902a.5.5 0 0 1 .738 0l4.363 4.76a.5.5 0 0 1-.369.838H4.637a.5.5 0 0 1-.369-.838z"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/airplay-exit.js
var airPlayExitIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><style>@keyframes media-icon-airplay-triangle{0%{translate:0 0}to{translate:0-2px}}@keyframes media-icon-airplay-fill{0%{opacity:0}to{opacity:.2}}@media (prefers-reduced-motion:reduce){:root{--media-icon-airplay-fill-animation:none;--media-icon-airplay-triangle-animation:none}}</style><path d="M14.5 2A3.5 3.5 0 0 1 18 5.5v5a3.5 3.5 0 0 1-3.032 3.468L9.354 8.354a.5.5 0 0 0-.708 0l-5.615 5.614A3.5 3.5 0 0 1 0 10.5v-5A3.5 3.5 0 0 1 3.5 2z" style="animation:var(--media-icon-airplay-fill-animation, media-icon-airplay-fill 1s ease-in-out infinite alternate)"/><path d="M14.5 2A3.5 3.5 0 0 1 18 5.5v5l-.005.18a3.5 3.5 0 0 1-3.027 3.288L13 12h1.5a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 14.5 4h-11A1.5 1.5 0 0 0 2 5.5v5A1.5 1.5 0 0 0 3.5 12H5l-1.968 1.967A3.5 3.5 0 0 1 0 10.5v-5A3.5 3.5 0 0 1 3.5 2z"/><path d="M8.631 10.902a.5.5 0 0 1 .738 0l4.363 4.76a.5.5 0 0 1-.369.838H4.637a.5.5 0 0 1-.369-.838z" style="animation:var(--media-icon-airplay-triangle-animation, media-icon-airplay-triangle 1s ease-in-out infinite alternate)"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/captions-off.js
var captionsOffIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><rect width="16" height="12" x="1" y="3" stroke="currentColor" stroke-width="2" rx="3"/><rect width="3" height="2" x="3" y="8" fill="currentColor" fill-opacity=".5" rx="1"/><rect width="2" height="2" x="13" y="8" fill="currentColor" fill-opacity=".5" rx="1"/><rect width="4" height="2" x="11" y="11" fill="currentColor" fill-opacity=".5" rx="1"/><rect width="5" height="2" x="7" y="8" fill="currentColor" fill-opacity=".5" rx="1"/><rect width="7" height="2" x="3" y="11" fill="currentColor" fill-opacity=".5" rx="1"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/captions-on.js
var captionsOnIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M15 2a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zM4 11a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2zm8 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2zM4 8a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zm4 0a1 1 0 0 0 0 2h3a1 1 0 1 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/cast-enter.js
var castEnterIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M14.5 2A3.5 3.5 0 0 1 18 5.5v7l-.005.18a3.5 3.5 0 0 1-3.315 3.315L14.5 16h-7c0-.693-.096-1.363-.271-2H14.5a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 4h-11A1.5 1.5 0 0 0 2 5.5v3.271A7.5 7.5 0 0 0 0 8.5v-3A3.5 3.5 0 0 1 3.5 2zM0 12a4 4 0 0 1 4 4H2.5A2.5 2.5 0 0 0 0 13.5z"/><path d="M0 9.5A6.5 6.5 0 0 1 6.5 16H5a5 5 0 0 0-5-5zm0 5A1.5 1.5 0 0 1 1.5 16h-1a.5.5 0 0 1-.5-.5z"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/cast-exit.js
var castExitIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M14.5 2A3.5 3.5 0 0 1 18 5.5v7a3.5 3.5 0 0 1-3.5 3.5h-7c0-.693-.096-1.363-.271-2H14.5a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 4h-11A1.5 1.5 0 0 0 2 5.5v3.271A7.5 7.5 0 0 0 0 8.5v-3A3.5 3.5 0 0 1 3.5 2z"/><path d="M13.5 5.5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H6.634A7.53 7.53 0 0 0 3.5 9.366V6.5a1 1 0 0 1 1-1zM0 12a4 4 0 0 1 4 4H2.5A2.5 2.5 0 0 0 0 13.5z"/><path d="M0 9.5A6.5 6.5 0 0 1 6.5 16H5a5 5 0 0 0-5-5zm0 5A1.5 1.5 0 0 1 1.5 16h-1a.5.5 0 0 1-.5-.5z"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/check.js
var checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 10.455 6.5 13 14 5"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/chevron.js
var chevronIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m11.964 9.014-4.95-4.95m0 9.9 4.95-4.95"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/fullscreen-enter.js
var fullscreenEnterIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M9.57 3.617A1 1 0 0 0 8.646 3H4c-.552 0-1 .449-1 1v4.646a.996.996 0 0 0 1.001 1 1 1 0 0 0 .706-.293l4.647-4.647a1 1 0 0 0 .216-1.089m4.812 4.812a1 1 0 0 0-1.089.217l-4.647 4.647a.998.998 0 0 0 .708 1.706H14c.552 0 1-.449 1-1V9.353a1 1 0 0 0-.618-.924"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/fullscreen-exit.js
var fullscreenExitIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M7.883 1.93a.99.99 0 0 0-1.09.217L2.146 6.793A.998.998 0 0 0 2.853 8.5H7.5c.551 0 1-.449 1-1V2.854a1 1 0 0 0-.617-.924m7.263 7.57H10.5c-.551 0-1 .449-1 1v4.646a.996.996 0 0 0 1.001 1.001 1 1 0 0 0 .706-.293l4.646-4.646a.998.998 0 0 0-.707-1.707z"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/gear.js
var gearIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M7.519 2.184c.357-1.578 2.605-1.579 2.962 0a1.518 1.518 0 0 0 2.292.949c1.368-.864 2.957.727 2.094 2.096-.56.886-.074 2.06.949 2.292 1.579.356 1.578 2.606 0 2.962a1.52 1.52 0 0 0-.95 2.293c.864 1.369-.725 2.96-2.093 2.095a1.52 1.52 0 0 0-2.292.95c-.357 1.578-2.606 1.578-2.962 0a1.52 1.52 0 0 0-2.292-.95c-1.368.864-2.957-.726-2.094-2.095a1.52 1.52 0 0 0-.949-2.293c-1.579-.356-1.579-2.606 0-2.962a1.52 1.52 0 0 0 .95-2.292c-.864-1.369.725-2.96 2.093-2.096.887.56 2.061.074 2.292-.95m1.48 3.474a3.343 3.343 0 1 0 .002 6.687 3.343 3.343 0 0 0-.002-6.687"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/pause.js
var pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><rect width="5" height="14" x="2" y="2" rx="1.75"/><rect width="5" height="14" x="11" y="2" rx="1.75"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/pip-enter.js
var pipEnterIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M13 2a4 4 0 0 1 4 4v2.036A3.5 3.5 0 0 0 16.5 8H15V6.273C15 5.018 13.96 4 12.679 4H4.32C3.04 4 2 5.018 2 6.273v5.454C2 12.982 3.04 14 4.321 14H6v1.5q0 .255.036.5H4a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"/><rect width="10" height="7" x="8" y="10" rx="2"/><path d="M7.129 5.547a.6.6 0 0 0-.656.13L3.677 8.473A.6.6 0 0 0 4.102 9.5h2.796c.332 0 .602-.27.602-.602V6.103a.6.6 0 0 0-.371-.556"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/pip-exit.js
var pipExitIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M13 2a4 4 0 0 1 4 4v2.036A3.5 3.5 0 0 0 16.5 8H15V6.273C15 5.018 13.96 4 12.679 4H4.32C3.04 4 2 5.018 2 6.273v5.454C2 12.982 3.04 14 4.321 14H6v1.5q0 .255.036.5H4a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"/><rect width="10" height="7" x="8" y="10" rx="2"/><path d="M4.871 10.454a.6.6 0 0 0 .656-.131l2.796-2.796A.6.6 0 0 0 7.898 6.5H5.102a.603.603 0 0 0-.602.602v2.795a.6.6 0 0 0 .371.556"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/play.js
var playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="m14.051 10.723-7.985 4.964a1.98 1.98 0 0 1-2.758-.638A2.06 2.06 0 0 1 3 13.964V4.036C3 2.91 3.895 2 5 2c.377 0 .747.109 1.066.313l7.985 4.964a2.057 2.057 0 0 1 .627 2.808c-.16.257-.373.475-.627.637"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/restart.js
var restartIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M9 1a7.98 7.98 0 0 0-6.132 2.867l-1.441-1.44A.25.25 0 0 0 1 2.604V6.75c0 .138.112.25.25.25h4.146a.25.25 0 0 0 .177-.427L4.29 5.29A5.99 5.99 0 0 1 9 3a6 6 0 1 1-6 6H1a8 8 0 1 0 8-8"/><path d="m11.61 9.639-3.331 2.07a.826.826 0 0 1-1.15-.266.86.86 0 0 1-.129-.452V6.849C7 6.38 7.374 6 7.834 6c.158 0 .312.045.445.13l3.331 2.071a.858.858 0 0 1 0 1.438"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/speech.js
var speechIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M6 12a5 5 0 0 1 4.511 2.843c.273.57-.203 1.157-.835 1.157H2.325c-.633 0-1.109-.587-.836-1.157A5 5 0 0 1 6.001 12M8.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/><path fill-opacity=".5" d="M14.5 2A1.5 1.5 0 0 1 16 3.5v2A1.5 1.5 0 0 1 14.5 7H12l-1.146 1.146A.5.5 0 0 1 10 7.793v-.88A1.5 1.5 0 0 1 9 5.5v-2A1.5 1.5 0 0 1 10.5 2z"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/speed.js
var speedIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M9 18q-.213 0-.424-.012h.85Q9.214 18 9 18M9 2a8 8 0 0 1 8 8c0 1.975-.719 3.78-1.905 5.175a.75.75 0 0 1-1.204.018l-1.509-1.971a.75.75 0 0 1 .596-1.206h1.674a6 6 0 1 0-11.304 0h1.68a.75.75 0 0 1 .596 1.206l-1.507 1.971a.75.75 0 0 1-1.133.07l-.003.004A8 8 0 0 1 9 2"/><rect width="6" height="2" x="6" y="14" fill-opacity=".5" rx="1"/><path d="M8.3 6.318c.246-.64 1.154-.64 1.4 0L10.732 9h-.002a2 2 0 1 1-3.46 0h-.001z"/><g fill-opacity=".5"><circle cx="5" cy="10.25" r=".75"/><circle cx="13" cy="10.25" r=".75"/><circle cx="6" cy="7.25" r=".75"/><circle cx="12" cy="7.25" r=".75"/></g></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/spinner.js
var spinnerIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" aria-hidden="true" viewBox="0 0 18 18"><style>@keyframes media-spinner-fade{0%{opacity:1}to{opacity:0}}.media-spinner__segment{animation:var(--media-spinner-animation, media-spinner-fade 1s steps(8, end) infinite);animation-delay:var(--media-spinner-delay)}@media (prefers-reduced-motion:reduce){.media-spinner__segment{animation:none}}</style><path d="M9 1.5v3" class="media-spinner__segment" opacity=".5" style="--media-spinner-delay:0s"/><path d="m14.5 3.5-2 2" class="media-spinner__segment" opacity=".45" style="--media-spinner-delay:0.125s"/><path d="M16.5 9h-3" class="media-spinner__segment" opacity=".4" style="--media-spinner-delay:0.25s"/><path d="m14.5 14.5-2-2" class="media-spinner__segment" opacity=".35" style="--media-spinner-delay:0.375s"/><path d="M9 16.5v-3" class="media-spinner__segment" opacity=".3" style="--media-spinner-delay:0.5s"/><path d="m3.5 14.5 2-2" class="media-spinner__segment" opacity=".25" style="--media-spinner-delay:0.625s"/><path d="M1.5 9h3" class="media-spinner__segment" opacity=".15" style="--media-spinner-delay:0.75s"/><path d="m3.5 3.5 2 2" class="media-spinner__segment" opacity=".1" style="--media-spinner-delay:0.875s"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/switches.js
var switchesIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M12.5 9.5a3.5 3.5 0 1 1 0 7h-7a3.5 3.5 0 1 1 0-7zm-2 1.5a2 2 0 1 0 0 4h2a2 2 0 1 0 0-4z"/><path fill-opacity=".5" d="M12.5 1.5a3.5 3.5 0 1 1 0 7h-7a3.5 3.5 0 1 1 0-7zM5.5 3a2 2 0 1 0 0 4h2a2 2 0 1 0 0-4z"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/volume-high.js
var volumeHighIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M15.6 3.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4C15.4 5.9 16 7.4 16 9s-.6 3.1-1.8 4.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3C17.1 13.2 18 11.2 18 9s-.9-4.2-2.4-5.7"/><path d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/volume-low.js
var volumeLowIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/html/default/volume-off.js
var volumeOffIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752M14.5 7.586l-1.768-1.768a1 1 0 1 0-1.414 1.414L13.085 9l-1.767 1.768a1 1 0 0 0 1.414 1.414l1.768-1.768 1.768 1.768a1 1 0 0 0 1.414-1.414L15.914 9l1.768-1.768a1 1 0 0 0-1.414-1.414z"/></svg>';

// node_modules/@videojs/html/dist/default/icons/dist/element/base.js
var HTMLElementBase2 = globalThis.HTMLElement ?? class {
};
var MediaIconElement = class MediaIconElement2 extends HTMLElementBase2 {
  static #families = /* @__PURE__ */ new Map();
  static #loaders = /* @__PURE__ */ new Map();
  static #loading = /* @__PURE__ */ new Map();
  static #instances = /* @__PURE__ */ new Set();
  static register(family, icons) {
    const familyIcons = MediaIconElement2.#families.get(family) ?? /* @__PURE__ */ new Map();
    for (const [name, svg] of Object.entries(icons)) familyIcons.set(name, svg);
    MediaIconElement2.#families.set(family, familyIcons);
    for (const icon of MediaIconElement2.#instances) if (icon.#family === family) icon.#render();
  }
  static registerLoader(family, load) {
    MediaIconElement2.#loaders.set(family, load);
    for (const icon of MediaIconElement2.#instances) if (icon.#family === family) icon.#render();
  }
  static load(family) {
    if (MediaIconElement2.#families.has(family)) return Promise.resolve();
    const pending = MediaIconElement2.#loading.get(family);
    if (pending) return pending;
    const loader = MediaIconElement2.#loaders.get(family);
    if (!loader) return Promise.resolve();
    const loading = Promise.resolve().then(loader).then((icons) => MediaIconElement2.register(family, icons)).finally(() => MediaIconElement2.#loading.delete(family));
    MediaIconElement2.#loading.set(family, loading);
    return loading;
  }
  static get observedAttributes() {
    return ["name", "family"];
  }
  connectedCallback() {
    MediaIconElement2.#instances.add(this);
    this.#render();
  }
  disconnectedCallback() {
    MediaIconElement2.#instances.delete(this);
  }
  attributeChangedCallback() {
    this.#render();
  }
  get #family() {
    return this.getAttribute("family") || "default";
  }
  #render() {
    if (!this.isConnected) return;
    const name = this.getAttribute("name");
    const family = this.#family;
    const familyIcons = MediaIconElement2.#families.get(family);
    const svg = name ? familyIcons?.get(name) : void 0;
    if (svg !== void 0) {
      if (this.innerHTML !== svg) this.innerHTML = svg;
      return;
    }
    this.replaceChildren();
    if (familyIcons || !name || !MediaIconElement2.#loaders.has(family)) return;
    MediaIconElement2.load(family).then(() => {
      if (this.isConnected && this.getAttribute("name") === name && this.#family === family) this.#render();
    }, () => {
    });
  }
};

// node_modules/@videojs/html/dist/default/icons/element/register/index.js
function registerIcons(family, icons) {
  const customElementRegistry = globalThis.customElements;
  const registeredElement = customElementRegistry?.get("media-icon");
  if (registeredElement && !supportsIconRegistration(registeredElement)) throw new Error("The registered <media-icon> element does not support icon registration.");
  (registeredElement ?? MediaIconElement).register(family, icons);
  if (customElementRegistry && globalThis.HTMLElement && !registeredElement) customElementRegistry.define("media-icon", MediaIconElement);
}
function supportsIconRegistration(element) {
  return "register" in element && isFunction(element.register);
}

// node_modules/@videojs/html/dist/default/player/popup-group-context.js
var popupGroupContext = n(Symbol.for("@videojs/popup-group"));

// node_modules/@videojs/core/dist/default/i18n/text/airplay.js
var prefix = "airplay.";
var startText = {
  key: `${prefix}start`,
  text: "Start AirPlay"
};
var stopText = {
  key: `${prefix}stop`,
  text: "Stop AirPlay"
};

// node_modules/@videojs/core/dist/default/i18n/text/cast.js
var prefix2 = "cast.";
var startText2 = {
  key: `${prefix2}start`,
  text: "Start casting"
};
var stopText2 = {
  key: `${prefix2}stop`,
  text: "Stop casting"
};
var connectingText = {
  key: `${prefix2}connecting`,
  text: "Connecting"
};

// node_modules/@videojs/core/dist/default/core/ui/utils/resolve-label.js
function resolveLabel(label, state) {
  if (isFunction(label)) return label(state) || void 0;
  return label || void 0;
}

// node_modules/@videojs/core/dist/default/core/ui/airplay-button/core.js
var AirPlayButtonCore = class AirPlayButtonCore2 {
  static defaultProps = {
    label: "",
    disabled: false
  };
  state = createState({
    state: "disconnected",
    availability: "unsupported",
    disabled: true,
    hidden: true,
    label: ""
  });
  #props = { ...AirPlayButtonCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, AirPlayButtonCore2.defaultProps);
  }
  getLabel(state) {
    const label = resolveLabel(this.#props.label, state);
    if (label) return label;
    if (state.state === "connected") return stopText;
    if (state.state === "connecting") return connectingText;
    return startText;
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": state.disabled ? "true" : void 0,
      hidden: state.hidden ? "" : void 0
    };
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    const availability = supportsWebKitAirPlay() ? media.remotePlaybackAvailability : "unsupported";
    this.state.patch({
      state: media.remotePlaybackState,
      availability,
      disabled: this.#props.disabled || availability !== "available",
      hidden: availability !== "available"
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  async toggle(media) {
    this.setMedia(media);
    if (this.getState().disabled) return;
    try {
      await media.promptRemotePlayback();
    } catch {
    }
  }
};

// node_modules/@videojs/core/dist/default/core/ui/airplay-button/data.js
var AirPlayButtonDataAttrs = {
  /**
  * Current AirPlay connection state.
  *
  * @see https://developer.mozilla.org/en-US/docs/Web/API/RemotePlayback/state
  */
  state: "data-airplay-state",
  /**
  * Whether AirPlay is available on the active platform and media.
  *
  * @see https://developer.mozilla.org/en-US/docs/Web/API/RemotePlayback
  */
  availability: "data-availability",
  /** Present when the button is non-interactive (mirrors `aria-disabled`). */
  disabled: "data-disabled",
  /** Present when the button is hidden because AirPlay is unavailable. */
  hidden: "data-hidden"
};

// node_modules/@videojs/core/dist/default/core/ui/dialog/core.js
var DialogCore = class {
  static defaultProps = {
    open: false,
    defaultOpen: false,
    closeOnEscape: true
  };
  #role;
  #input = null;
  #titleId = void 0;
  #descriptionId = void 0;
  #documentModal = true;
  constructor(role = "dialog") {
    this.#role = role;
  }
  /** Accept props for API consistency. Props are consumed by platform layers. */
  setProps(_props) {
  }
  setInput(input) {
    this.#input = input;
  }
  setTitleId(id) {
    this.#titleId = id;
  }
  setDescriptionId(id) {
    this.#descriptionId = id;
  }
  setDocumentModal(documentModal) {
    this.#documentModal = documentModal;
  }
  getState() {
    const input = this.#input;
    return {
      open: input.active,
      status: input.status,
      titleId: this.#titleId,
      descriptionId: this.#descriptionId,
      scope: this.#documentModal ? "document" : "player",
      ...getTransitionFlags(input.status)
    };
  }
  getTriggerAttrs(state, popupId2) {
    return {
      "aria-expanded": state.open && state.status !== "ending" ? "true" : "false",
      "aria-haspopup": "dialog",
      "aria-controls": popupId2
    };
  }
  getPopupAttrs(state) {
    return {
      role: this.#role,
      "aria-modal": this.#documentModal ? "true" : void 0,
      "aria-labelledby": state.titleId,
      "aria-describedby": state.descriptionId
    };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/alert-dialog/core.js
var AlertDialogCore = class extends DialogCore {
  constructor() {
    super("alertdialog");
  }
};

// node_modules/@videojs/core/dist/default/core/ui/dialog/data.js
var DialogDataAttrs = {
  /** Present when the dialog is open. */
  open: "data-open",
  /** Present during the open transition. */
  transitionStarting: "data-starting-style",
  /** Present during the close transition. */
  transitionEnding: "data-ending-style",
  /** `player` when the dialog is confined to its player, otherwise `document`. */
  scope: "data-scope"
};

// node_modules/@videojs/core/dist/default/i18n/text/menu.js
var prefix3 = "menu.";
var settingsText = {
  key: `${prefix3}settings`,
  text: "Settings"
};
var qualityText = {
  key: `${prefix3}quality`,
  text: "Quality"
};
var audioText = {
  key: `${prefix3}audio`,
  text: "Audio"
};
var defaultText = {
  key: `${prefix3}default`,
  text: "Default"
};
var speedText = {
  key: `${prefix3}speed`,
  text: "Speed"
};
var captionsText = {
  key: `${prefix3}captions`,
  text: "Captions"
};
var playbackRateText = {
  key: `${prefix3}playbackRate`,
  text: "Playback rate"
};
var customRateText = {
  key: `${prefix3}customRate`,
  text: "Custom, {rate}"
};
var backText = {
  key: `${prefix3}back`,
  text: "Back"
};
var offText = {
  key: `${prefix3}off`,
  text: "Off"
};
var autoText = {
  key: `${prefix3}auto`,
  text: "Auto"
};
var autoWithLabelText = {
  key: `${prefix3}autoWithLabel`,
  text: "Auto ({label})"
};
var subtitlesText = {
  key: `${prefix3}subtitles`,
  text: "Subtitles"
};

// node_modules/@videojs/core/dist/default/core/ui/audio-track-radio-group/core.js
function formatTrackLabel(track) {
  if (track.label) return track.label;
  if (track.language) return track.language;
  if (track.kind) return track.kind;
  return audioText;
}
var AudioTrackRadioGroupCore = class AudioTrackRadioGroupCore2 {
  static defaultProps = {
    label: "",
    formatTrack: formatTrackLabel,
    disabled: false
  };
  state = createState({
    options: [],
    value: "",
    disabled: true,
    hidden: true,
    availability: "unavailable",
    label: ""
  });
  #props = { ...AudioTrackRadioGroupCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, AudioTrackRadioGroupCore2.defaultProps);
  }
  getLabel(state) {
    const label = resolveLabel(this.#props.label, state);
    if (label) return label;
    return audioText;
  }
  getTrackLabel(track) {
    return this.#props.formatTrack(track);
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": state.disabled ? "true" : void 0,
      hidden: state.hidden ? "" : void 0
    };
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    const enabledIndex = media.audioTrackList.findIndex((track) => track.enabled);
    const options = media.audioTrackList.map((track) => ({
      value: track.id,
      label: this.getTrackLabel(track),
      disabled: false
    }));
    const availability = options.length > 1 ? "available" : "unavailable";
    this.state.patch({
      options,
      value: enabledIndex === -1 ? "" : media.audioTrackList[enabledIndex].id,
      disabled: this.#props.disabled || availability === "unavailable",
      hidden: availability === "unavailable",
      availability
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  select(media, value) {
    if (this.#props.disabled) return;
    if (!media.audioTrackList.some((track) => track.id === value)) return;
    media.selectAudioTrack(value);
  }
  selectValue(media, value) {
    this.select(media, value);
  }
};

// node_modules/@videojs/core/dist/default/core/ui/audio-track-radio-group/data.js
var AudioTrackRadioGroupDataAttrs = {
  /** Current audio track value. */
  value: "data-audio-track",
  /** Present when audio track selection is disabled. */
  disabled: "data-disabled",
  /** Present when audio track selection is unavailable. */
  hidden: "data-hidden",
  /** Indicates audio track availability (`available` or `unavailable`). */
  availability: "data-availability"
};

// node_modules/@videojs/core/dist/default/core/ui/buffering-indicator/core.js
var BufferingIndicatorCore = class BufferingIndicatorCore2 {
  static defaultProps = { delay: 500 };
  state = createState({ visible: false });
  #props = { ...BufferingIndicatorCore2.defaultProps };
  #timer = null;
  setProps(props) {
    this.#props = defaults(props, BufferingIndicatorCore2.defaultProps);
  }
  destroy() {
    this.#clearTimer();
  }
  update(media) {
    const buffering = media.waiting && !media.paused || media.autoplaying;
    if (buffering && !this.state.current.visible && !this.#timer) this.#timer = setTimeout(() => {
      this.#timer = null;
      this.state.patch({ visible: true });
    }, this.#props.delay);
    else if (!buffering) {
      this.#clearTimer();
      this.state.patch({ visible: false });
    }
  }
  #clearTimer() {
    if (this.#timer !== null) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
  }
};

// node_modules/@videojs/core/dist/default/core/ui/buffering-indicator/data.js
var BufferingIndicatorDataAttrs = {
  /** Present when the buffering indicator is visible (after delay). */
  visible: "data-visible"
};

// node_modules/@videojs/core/dist/default/i18n/text/captions.js
var prefix4 = "captions.";
var enableText = {
  key: `${prefix4}enable`,
  text: "Enable captions"
};
var disableText = {
  key: `${prefix4}disable`,
  text: "Disable captions"
};

// node_modules/@videojs/core/dist/default/core/ui/captions-button/core.js
var CaptionsButtonCore = class CaptionsButtonCore2 {
  static defaultProps = {
    label: "",
    disabled: false,
    menuTrigger: false
  };
  state = createState({
    subtitlesShowing: false,
    availability: "unavailable",
    disabled: true,
    hidden: true,
    label: ""
  });
  #props = { ...CaptionsButtonCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, CaptionsButtonCore2.defaultProps);
  }
  getLabel(state) {
    const label = resolveLabel(this.#props.label, state);
    if (label) return label;
    return state.subtitlesShowing ? disableText : enableText;
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": state.disabled ? "true" : void 0,
      hidden: state.hidden ? "" : void 0
    };
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    const availability = media.textTrackList.some(isCaptionOrSubtitleTrack) ? "available" : "unavailable";
    this.state.patch({
      subtitlesShowing: media.subtitlesShowing,
      availability,
      disabled: this.#props.disabled || availability !== "available",
      hidden: availability === "unavailable"
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  toggle(media) {
    this.setMedia(media);
    if (this.getState().disabled) return;
    if (this.#props.menuTrigger && getCaptionTrackCount(media) > 1) return;
    media.toggleSubtitles();
  }
};
function getCaptionTrackCount(media) {
  return media.textTrackList.filter(isCaptionOrSubtitleTrack).length;
}

// node_modules/@videojs/core/dist/default/core/ui/captions-button/data.js
var CaptionsButtonDataAttrs = {
  /** Present when captions are enabled. */
  subtitlesShowing: "data-active",
  /** Indicates captions availability (`available` or `unavailable`). */
  availability: "data-availability",
  /** Present when the button is non-interactive (mirrors `aria-disabled`). */
  disabled: "data-disabled",
  /** Present when the button is hidden because no caption tracks are present. */
  hidden: "data-hidden"
};

// node_modules/@videojs/core/dist/default/core/ui/captions-radio-group/core.js
function formatTrackLabel2(track) {
  if (track.label) return track.label;
  if (track.language) return track.language;
  return track.kind === "captions" ? captionsText : subtitlesText;
}
var CaptionsRadioGroupCore = class CaptionsRadioGroupCore2 {
  static defaultProps = {
    label: "",
    formatTrack: formatTrackLabel2,
    disabled: false
  };
  state = createState({
    options: [{
      value: "off",
      label: offText,
      disabled: false
    }],
    value: "off",
    subtitlesShowing: false,
    disabled: true,
    hidden: true,
    availability: "unavailable",
    label: ""
  });
  #props = { ...CaptionsRadioGroupCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, CaptionsRadioGroupCore2.defaultProps);
  }
  getLabel(state) {
    const label = resolveLabel(this.#props.label, state);
    if (label) return label;
    return captionsText;
  }
  getTrackLabel(track) {
    return this.#props.formatTrack(track);
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": state.disabled ? "true" : void 0,
      hidden: state.hidden ? "" : void 0
    };
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    const captionTracks = getCaptionOrSubtitleTracks(media.textTrackList);
    const showingIndex = captionTracks.findIndex((track) => track.mode === "showing");
    const options = [{
      value: "off",
      label: offText,
      disabled: false
    }, ...captionTracks.map((track) => ({
      value: track.id,
      label: this.getTrackLabel(track),
      disabled: false
    }))];
    const availability = captionTracks.length > 0 ? "available" : "unavailable";
    this.state.patch({
      options,
      value: showingIndex === -1 ? "off" : captionTracks[showingIndex].id,
      subtitlesShowing: media.subtitlesShowing,
      disabled: this.#props.disabled || captionTracks.length === 0,
      hidden: availability === "unavailable",
      availability
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  select(media, value) {
    if (this.#props.disabled) return;
    const captionTracks = getCaptionOrSubtitleTracks(media.textTrackList);
    if (!captionTracks.length) return;
    if (value === "off") {
      media.selectSubtitlesTrack(null);
      return;
    }
    if (!captionTracks.some((track) => track.id === value)) return;
    media.selectSubtitlesTrack(value);
  }
  selectValue(media, value) {
    this.select(media, value);
  }
};

// node_modules/@videojs/core/dist/default/core/ui/captions-radio-group/data.js
var CaptionsRadioGroupDataAttrs = {
  /** Present when captions are enabled. */
  subtitlesShowing: "data-active",
  /** Present when track selection is disabled. */
  disabled: "data-disabled",
  /** Present when track selection is unavailable. */
  hidden: "data-hidden",
  /** Indicates captions availability (`available` or `unavailable`). */
  availability: "data-availability"
};

// node_modules/@videojs/core/dist/default/core/ui/cast-button/core.js
var CastButtonCore = class CastButtonCore2 {
  static defaultProps = {
    label: "",
    disabled: false
  };
  state = createState({
    connection: "disconnected",
    availability: "unsupported",
    disabled: true,
    hidden: true,
    label: ""
  });
  #props = { ...CastButtonCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, CastButtonCore2.defaultProps);
  }
  getLabel(state) {
    const label = resolveLabel(this.#props.label, state);
    if (label) return label;
    if (state.connection === "connected") return stopText2;
    if (state.connection === "connecting") return connectingText;
    return startText2;
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": state.disabled ? "true" : void 0,
      hidden: state.hidden ? "" : void 0
    };
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    const availability = !!globalThis.chrome ? media.remotePlaybackAvailability : "unsupported";
    this.state.patch({
      connection: media.remotePlaybackState,
      availability,
      disabled: this.#props.disabled || availability !== "available",
      hidden: availability === "unsupported"
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  async toggle(media) {
    this.setMedia(media);
    if (this.getState().disabled) return;
    return media.promptRemotePlayback();
  }
};

// node_modules/@videojs/core/dist/default/core/ui/cast-button/data.js
var CastButtonDataAttrs = {
  /**
  * Current remote playback connection state.
  *
  * @see https://developer.mozilla.org/en-US/docs/Web/API/RemotePlayback/state
  */
  connection: "data-cast-state",
  /**
  * Whether remote playback can be requested on this platform.
  *
  * @see https://developer.mozilla.org/en-US/docs/Web/API/RemotePlayback
  */
  availability: "data-availability",
  /** Present when the button is non-interactive (mirrors `aria-disabled`). */
  disabled: "data-disabled",
  /** Present when the button is hidden because the feature is unsupported. */
  hidden: "data-hidden"
};

// node_modules/@videojs/core/dist/default/core/ui/container/core.js
var ContainerCore = class {
  #media = null;
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    return { controlsVisible: this.#media.controlsVisible };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/container/data.js
var ContainerDataAttrs = {
  /** Present when player controls are visible. */
  controlsVisible: "data-controls-visible"
};

// node_modules/@videojs/core/dist/default/core/ui/controls/core.js
var ControlsCore = class ControlsCore2 {
  static defaultProps = { visibility: "auto" };
  #props = { ...ControlsCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, ControlsCore2.defaultProps);
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    if (!media) return this.#props.visibility === "always" ? {
      visible: true,
      userActive: true
    } : null;
    return {
      visible: this.#props.visibility === "always" || media.controlsVisible,
      userActive: media.userActive
    };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/controls/data.js
var ControlsDataAttrs = {
  /** Present when controls are visible. */
  visible: "data-visible",
  /** Present when the user has recently interacted. */
  userActive: "data-user-active"
};

// node_modules/@videojs/core/dist/default/core/ui/error-dialog/core.js
var ErrorDialogCore = class extends AlertDialogCore {
  setProps() {
  }
};

// node_modules/@videojs/core/dist/default/core/ui/error-dialog/data.js
var ErrorDialogDataAttrs = { ...DialogDataAttrs };

// node_modules/@videojs/core/dist/default/i18n/text/common.js
var prefix5 = "common.";
var emptyText = {
  key: `${prefix5}empty`,
  text: ""
};
var okText = {
  key: `${prefix5}ok`,
  text: "OK"
};

// node_modules/@videojs/core/dist/default/i18n/text/errors.js
var prefix6 = "errors.";
var abortedText = {
  key: `${prefix6}aborted`,
  text: "You stopped media playback before it finished."
};
var networkText = {
  key: `${prefix6}network`,
  text: "This media could not be loaded due to a network or server issue."
};
var decodeText = {
  key: `${prefix6}decode`,
  text: "This media could not be played. It may be corrupted, or your browser may not support its format."
};
var sourceText = {
  key: `${prefix6}source`,
  text: "This media could not be loaded. It may be unavailable, or your browser may not support its format."
};
var encryptedText = {
  key: `${prefix6}encrypted`,
  text: "This media could not be played because it could not be decrypted."
};
var unplayableText = {
  key: `${prefix6}unplayable`,
  text: "This media is unsupported by the player."
};
var titleText = {
  key: `${prefix6}title`,
  text: "Something went wrong."
};
var unexpectedText = {
  key: `${prefix6}unexpected`,
  text: "An unexpected error occurred."
};

// node_modules/@videojs/core/dist/default/core/ui/error-dialog/i18n.js
var SVTA_UNSUPPORTED_PLAYBACK_FEATURE = 99001;
var MEDIA_ERROR_TRANSLATIONS = {
  [MediaError.MEDIA_ERR_ABORTED]: abortedText,
  [MediaError.MEDIA_ERR_NETWORK]: networkText,
  [MediaError.MEDIA_ERR_DECODE]: decodeText,
  [MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED]: sourceText,
  [MediaError.MEDIA_ERR_ENCRYPTED]: encryptedText,
  [MediaError.MEDIA_ERR_CUSTOM]: emptyText,
  [SVTA_UNSUPPORTED_PLAYBACK_FEATURE]: unplayableText
};
var STANDARD_CODE_UA_MESSAGES = { [MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED]: ["Failed to open media"] };
function isStandardMediaErrorCode(code) {
  return code >= MediaError.MEDIA_ERR_ABORTED && code <= MediaError.MEDIA_ERR_ENCRYPTED;
}
function getErrorDialogTitleText() {
  return titleText;
}
function getErrorDialogDismissText() {
  return okText;
}
function getErrorDialogUnexpectedText() {
  return unexpectedText;
}
function resolveErrorDialogDescription(error, cachedMessage) {
  if (error) {
    const text = MEDIA_ERROR_TRANSLATIONS[error.code];
    const message = error.message?.trim();
    if (message) {
      const defaultForCode = MediaError.defaultMessages[error.code];
      if (text && defaultForCode && message === defaultForCode) return text;
      const uaVariants = STANDARD_CODE_UA_MESSAGES[error.code];
      if (text && isStandardMediaErrorCode(error.code) && !error.context && uaVariants?.includes(message)) return text;
      return message;
    }
    if (text) return text;
  }
  const cached = cachedMessage?.trim();
  if (cached) return cached;
  return unexpectedText;
}

// node_modules/@videojs/core/dist/default/i18n/text/fullscreen.js
var prefix7 = "fullscreen.";
var enterText = {
  key: `${prefix7}enter`,
  text: "Enter fullscreen"
};
var exitText = {
  key: `${prefix7}exit`,
  text: "Exit fullscreen"
};

// node_modules/@videojs/core/dist/default/core/ui/fullscreen-button/core.js
var FullscreenButtonCore = class FullscreenButtonCore2 {
  static defaultProps = {
    label: "",
    disabled: false
  };
  state = createState({
    fullscreen: false,
    availability: "unavailable",
    disabled: true,
    hidden: true,
    label: ""
  });
  #props = { ...FullscreenButtonCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, FullscreenButtonCore2.defaultProps);
  }
  getLabel(state) {
    const label = resolveLabel(this.#props.label, state);
    if (label) return label;
    return state.fullscreen ? exitText : enterText;
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": state.disabled ? "true" : void 0,
      hidden: state.hidden ? "" : void 0
    };
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    const availability = media.fullscreenAvailability;
    this.state.patch({
      fullscreen: media.isFullscreen,
      availability,
      disabled: this.#props.disabled || availability !== "available",
      hidden: availability !== "available"
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  async toggle(media) {
    this.setMedia(media);
    if (this.getState().disabled) return;
    return media.isFullscreen ? media.exitFullscreen() : media.requestFullscreen();
  }
};

// node_modules/@videojs/core/dist/default/core/ui/fullscreen-button/data.js
var FullscreenButtonDataAttrs = {
  /** Present when fullscreen mode is active. */
  fullscreen: "data-fullscreen",
  /** Indicates fullscreen availability (`available`, `unavailable`, `unsupported`). */
  availability: "data-availability",
  /** Present when the button is non-interactive (mirrors `aria-disabled`). */
  disabled: "data-disabled",
  /** Present when the button is hidden because fullscreen is not available. */
  hidden: "data-hidden"
};

// node_modules/@videojs/core/dist/default/i18n/text/status.js
var prefix8 = "status.";
var captionsOnText = {
  key: `${prefix8}captionsOn`,
  text: "Captions on"
};
var captionsOffText = {
  key: `${prefix8}captionsOff`,
  text: "Captions off"
};
var pausedText = {
  key: `${prefix8}paused`,
  text: "Paused"
};
var playingText = {
  key: `${prefix8}playing`,
  text: "Playing"
};
var fullscreenText = {
  key: `${prefix8}fullscreen`,
  text: "Fullscreen"
};
var pipText = {
  key: `${prefix8}pip`,
  text: "Picture in picture"
};
var exitPipText = {
  key: `${prefix8}exitPip`,
  text: "Exit picture in picture"
};
var seekedToText = {
  key: `${prefix8}seekedTo`,
  text: "Seeked to {time}"
};

// node_modules/@videojs/core/dist/default/i18n/text/volume.js
var prefix9 = "volume.";
var mutedValueText = {
  key: `${prefix9}mutedValue`,
  text: "{percent}, muted"
};
var mutedText = {
  key: `${prefix9}muted`,
  text: "Muted"
};
var labelText = {
  key: `${prefix9}label`,
  text: "Volume"
};
var valueText = {
  key: `${prefix9}value`,
  text: "Volume {value}"
};

// node_modules/@videojs/core/dist/default/core/ui/indicator/labels.js
var DEFAULT_INPUT_INDICATOR_LABELS = {
  muted: translateText(mutedText),
  volume: translateText(labelText),
  captionsOn: translateText(captionsOnText),
  captionsOff: translateText(captionsOffText),
  paused: translateText(pausedText),
  playing: translateText(playingText),
  fullscreen: translateText(fullscreenText),
  exitFullscreen: translateText(exitText),
  pictureInPicture: translateText(pipText),
  exitPictureInPicture: translateText(exitPipText)
};
function createInputIndicatorLabels(translator) {
  return {
    muted: translator(mutedText),
    volume: translator(labelText),
    captionsOn: translator(captionsOnText),
    captionsOff: translator(captionsOffText),
    paused: translator(pausedText),
    playing: translator(playingText),
    fullscreen: translator(fullscreenText),
    exitFullscreen: translator(exitText),
    pictureInPicture: translator(pipText),
    exitPictureInPicture: translator(exitPipText)
  };
}

// node_modules/@videojs/core/dist/default/core/ui/input-action.js
function isInputActionIncluded(action, actions) {
  if (!action) return false;
  return !actions || actions.includes(action);
}

// node_modules/@videojs/core/dist/default/core/ui/menu/core.js
function resolveMenuOptionState(states) {
  const options = [...states];
  if (options.length === 0) return null;
  const visible = options.filter((state) => !state.hidden);
  const availability = visible.filter((state) => state.availability === "available").length > 0 ? "available" : options.every((state) => state.availability === "unsupported") ? "unsupported" : "unavailable";
  return {
    value: options.length === 1 ? options[0].value : "",
    disabled: visible.length === 0 || visible.every((state) => state.disabled),
    hidden: visible.length === 0,
    availability
  };
}
var MenuCore = class MenuCore2 {
  static defaultProps = {
    side: "bottom",
    align: "start",
    open: false,
    defaultOpen: false,
    closeOnEscape: true,
    closeOnOutsideClick: true
  };
  #props = { ...MenuCore2.defaultProps };
  #input = null;
  get props() {
    return this.#props;
  }
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, MenuCore2.defaultProps);
  }
  setInput(input) {
    this.#input = input;
  }
  getState() {
    const input = this.#input;
    const isSubmenu = input.isSubmenu;
    return {
      open: input.active,
      status: input.status,
      side: isSubmenu ? void 0 : this.#props.side,
      align: isSubmenu ? void 0 : this.#props.align,
      isSubmenu,
      ...getTransitionFlags(input.status)
    };
  }
  getTriggerAttrs(state, contentId) {
    return {
      ...!state.isSubmenu && { tabIndex: 0 },
      "aria-haspopup": "menu",
      "aria-expanded": state.open && state.status !== "ending" ? "true" : "false",
      "aria-controls": contentId
    };
  }
  getContentAttrs() {
    return {
      role: "menu",
      tabIndex: -1
    };
  }
  getPopupAttrs() {
    return { popover: "manual" };
  }
};

// node_modules/@videojs/core/dist/default/i18n/text/buttons.js
var prefix10 = "buttons.";
var playText = {
  key: `${prefix10}play`,
  text: "Play"
};
var pauseText = {
  key: `${prefix10}pause`,
  text: "Pause"
};
var replayText = {
  key: `${prefix10}replay`,
  text: "Replay"
};
var muteText = {
  key: `${prefix10}mute`,
  text: "Mute"
};
var unmuteText = {
  key: `${prefix10}unmute`,
  text: "Unmute"
};

// node_modules/@videojs/core/dist/default/core/ui/mute-button/core.js
var MuteButtonCore = class MuteButtonCore2 {
  static defaultProps = {
    label: "",
    disabled: false
  };
  state = createState({
    muted: false,
    volumeLevel: "off",
    availability: "unavailable",
    hidden: true,
    label: ""
  });
  #props = { ...MuteButtonCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, MuteButtonCore2.defaultProps);
  }
  getLabel(state) {
    const label = resolveLabel(this.#props.label, state);
    if (label) return label;
    return state.muted ? unmuteText : muteText;
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": this.#props.disabled ? "true" : void 0
    };
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    const availability = media.mutedAvailability;
    this.state.patch({
      muted: media.muted || media.volume === 0,
      volumeLevel: getVolumeLevel(media),
      availability,
      hidden: availability !== "available"
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  toggle(media) {
    if (this.#props.disabled || media.mutedAvailability !== "available") return;
    media.setMuted(!(media.muted || media.volume === 0));
  }
};
function getVolumeLevel(media) {
  if (media.muted || media.volume === 0) return "off";
  if (media.volume < 0.5) return "low";
  if (media.volume < 0.75) return "medium";
  return "high";
}

// node_modules/@videojs/core/dist/default/core/ui/mute-button/data.js
var MuteButtonDataAttrs = {
  /** Present when the media is muted. */
  muted: "data-muted",
  /** Indicates the volume level. */
  volumeLevel: "data-volume-level",
  /** Indicates mute availability (`available`, `unavailable`, `unsupported`). */
  availability: "data-availability",
  /** Present when the button is hidden because the media has no mute to toggle. */
  hidden: "data-hidden"
};

// node_modules/@videojs/core/dist/default/i18n/text/pip.js
var prefix11 = "pip.";
var enterText2 = {
  key: `${prefix11}enter`,
  text: "Enter picture-in-picture"
};
var exitText2 = {
  key: `${prefix11}exit`,
  text: "Exit picture-in-picture"
};

// node_modules/@videojs/core/dist/default/core/ui/pip-button/core.js
var PiPButtonCore = class PiPButtonCore2 {
  static defaultProps = {
    label: "",
    disabled: false
  };
  state = createState({
    pip: false,
    availability: "unavailable",
    disabled: true,
    hidden: true,
    label: ""
  });
  #props = { ...PiPButtonCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, PiPButtonCore2.defaultProps);
  }
  getLabel(state) {
    const label = resolveLabel(this.#props.label, state);
    if (label) return label;
    return state.pip ? exitText2 : enterText2;
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": state.disabled ? "true" : void 0,
      hidden: state.hidden ? "" : void 0
    };
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    const availability = media.pictureInPictureAvailability;
    const actionable = media.isPictureInPicture || availability === "available";
    this.state.patch({
      pip: media.isPictureInPicture,
      availability,
      disabled: this.#props.disabled || !actionable,
      hidden: !actionable
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  async toggle(media) {
    this.setMedia(media);
    if (this.getState().disabled) return;
    return media.isPictureInPicture ? media.exitPictureInPicture() : media.requestPictureInPicture();
  }
};

// node_modules/@videojs/core/dist/default/core/ui/pip-button/data.js
var PiPButtonDataAttrs = {
  /** Present when picture-in-picture mode is active. */
  pip: "data-pip",
  /** Indicates picture-in-picture availability (`available`, `unavailable`, `unsupported`). */
  availability: "data-availability",
  /** Present when the button is non-interactive (mirrors `aria-disabled`). */
  disabled: "data-disabled",
  /** Present when the button is hidden because picture-in-picture is not available. */
  hidden: "data-hidden"
};

// node_modules/@videojs/core/dist/default/core/ui/play-button/core.js
var PlayButtonCore = class PlayButtonCore2 {
  static defaultProps = {
    label: "",
    disabled: false
  };
  state = createState({
    paused: true,
    ended: false,
    started: false,
    label: ""
  });
  #props = { ...PlayButtonCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, PlayButtonCore2.defaultProps);
  }
  getLabel(state) {
    const label = resolveLabel(this.#props.label, state);
    if (label) return label;
    if (state.ended) return replayText;
    return state.paused ? playText : pauseText;
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": this.#props.disabled ? "true" : void 0
    };
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    this.state.patch({
      paused: media.paused && !media.autoplaying,
      ended: media.ended,
      started: media.started || media.autoplaying
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  async toggle(media) {
    if (this.#props.disabled) return;
    if (media.paused && !media.autoplaying || media.ended) return media.play();
    media.pause();
  }
};

// node_modules/@videojs/core/dist/default/core/ui/play-button/data.js
var PlayButtonDataAttrs = {
  /** Present when the media is paused and not trying to autoplay. */
  paused: "data-paused",
  /** Present when the media has ended. */
  ended: "data-ended",
  /** Present when playback has started or the media is trying to autoplay. */
  started: "data-started"
};

// node_modules/@videojs/core/dist/default/core/ui/playback-rate-button/vars.js
var PlaybackRateButtonCSSVars = {
  /** Characters in the current rate as text, such as `4` for `1.75`. Lets a skin size the label to fit the button. */
  length: "--media-playback-rate-length"
};

// node_modules/@videojs/core/dist/default/i18n/text/playback.js
var rateText = {
  key: `playback.rate`,
  text: "Playback rate, {rate}"
};

// node_modules/@videojs/core/dist/default/core/ui/playback-rate-button/core.js
var PlaybackRateButtonCore = class PlaybackRateButtonCore2 {
  static defaultProps = {
    label: "",
    disabled: false,
    menuTrigger: false,
    rates: []
  };
  state = createState({
    rate: 1,
    availability: "unavailable",
    hidden: true,
    label: ""
  });
  #props = { ...PlaybackRateButtonCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, PlaybackRateButtonCore2.defaultProps);
  }
  getLabel(state) {
    const custom = resolveLabel(this.#props.label, state);
    if (custom !== void 0) return custom;
    return rateText;
  }
  /** Tooltip text: the control's name without the current rate, which the button already shows. */
  getTooltipLabel(state) {
    const custom = resolveLabel(this.#props.label, state);
    if (custom !== void 0) return custom;
    return playbackRateText;
  }
  getLabelParams(state) {
    if (resolveLabel(this.#props.label, state) !== void 0) return void 0;
    return { rate: state.rate };
  }
  /** CSS custom properties for the button, so a skin can fit the rate label without measuring it. */
  getCSSVars(state) {
    return { [PlaybackRateButtonCSSVars.length]: String(String(state.rate).length) };
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": this.#props.disabled ? "true" : void 0
    };
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    const availability = media.playbackRateAvailability;
    this.state.patch({
      rate: media.playbackRate,
      availability,
      hidden: availability !== "available"
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  /**
  * The rates the button cycles through: its own `rates`, or the player's when none of them is usable. Its own rates
  * are taken as given; `setPlaybackRate` clamps one the media does not accept.
  */
  getRates(media) {
    return parsePlaybackRates(this.#props.rates) ?? media.playbackRates;
  }
  cycle(media) {
    if (this.#props.disabled || media.playbackRateAvailability !== "available") return;
    if (this.#props.menuTrigger) return;
    const playbackRates = this.getRates(media);
    if (playbackRates.length === 0) return;
    const { playbackRate } = media;
    const idx = playbackRates.indexOf(playbackRate);
    const next = idx === -1 ? playbackRates.find((r) => r > playbackRate) ?? playbackRates[0] : playbackRates[(idx + 1) % playbackRates.length];
    media.setPlaybackRate(next);
  }
};

// node_modules/@videojs/core/dist/default/core/ui/playback-rate-button/data.js
var PlaybackRateButtonDataAttrs = {
  /** Current playback rate. */
  rate: "data-rate",
  /** Indicates playback rate availability (`available`, `unavailable`, `unsupported`). */
  availability: "data-availability",
  /** Present when the button is hidden because the media has no playback rate to change. */
  hidden: "data-hidden"
};

// node_modules/@videojs/core/dist/default/core/ui/playback-rate-radio-group/core.js
var NORMAL_RATE = 1;
function formatPlaybackRate(rate) {
  return `${rate}\xD7`;
}
var PlaybackRateRadioGroupCore = class PlaybackRateRadioGroupCore2 {
  static defaultProps = {
    label: "",
    formatRate: formatPlaybackRate,
    disabled: false,
    rates: []
  };
  state = createState({
    rate: 1,
    value: "1",
    options: [],
    disabled: true,
    hidden: true,
    availability: "unavailable",
    label: ""
  });
  #props = { ...PlaybackRateRadioGroupCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, PlaybackRateRadioGroupCore2.defaultProps);
  }
  getLabel(state) {
    const custom = resolveLabel(this.#props.label, state);
    if (custom !== void 0) return custom;
    return playbackRateText;
  }
  getLabelParams(_state) {
  }
  getRateLabel(rate) {
    return this.#props.formatRate(rate);
  }
  getRateValue(rate) {
    return String(rate);
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": state.disabled ? "true" : void 0,
      hidden: state.hidden ? "" : void 0
    };
  }
  /**
  * The rates the group offers: its own `rates`, or the player's when none of them is usable. Its own rates are taken
  * as given; `setPlaybackRate` clamps one the media does not accept.
  */
  getRates(media) {
    return parsePlaybackRates(this.#props.rates) ?? media.playbackRates;
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    const rates = this.getRates(media);
    const availability = media.playbackRateAvailability !== "available" ? media.playbackRateAvailability : rates.length > 0 ? "available" : "unavailable";
    const options = availability === "available" ? insertPlaybackRate(rates, media.playbackRate) : rates;
    this.state.patch({
      rate: media.playbackRate,
      value: this.getRateValue(media.playbackRate),
      options: options.map((rate) => {
        const label = this.getRateLabel(rate);
        const custom = rate !== NORMAL_RATE && !rates.includes(rate);
        return {
          rate,
          value: this.getRateValue(rate),
          label,
          ...custom && {
            ariaLabel: customRateText,
            ariaLabelParams: { rate: label }
          },
          disabled: false,
          custom
        };
      }),
      disabled: this.#props.disabled || availability !== "available",
      hidden: availability !== "available",
      availability
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  select(media, rate) {
    if (this.#props.disabled || media.playbackRateAvailability !== "available") return;
    if (!this.getRates(media).includes(rate) && rate !== media.playbackRate) return;
    media.setPlaybackRate(rate);
  }
  selectValue(media, value) {
    const rate = insertPlaybackRate(this.getRates(media), media.playbackRate).find((candidate) => this.getRateValue(candidate) === value);
    if (isUndefined(rate)) return;
    this.select(media, rate);
  }
};

// node_modules/@videojs/core/dist/default/core/ui/playback-rate-radio-group/data.js
var PlaybackRateRadioGroupDataAttrs = {
  /** Current playback rate. */
  rate: "data-rate",
  /** Present when playback rate selection is disabled. */
  disabled: "data-disabled",
  /** Present when playback rate selection is unavailable. */
  hidden: "data-hidden",
  /** Indicates playback rate availability (`available`, `unavailable`, `unsupported`). */
  availability: "data-availability"
};

// node_modules/@videojs/core/dist/default/core/ui/popover/core.js
var PopoverCore = class PopoverCore2 {
  static defaultProps = {
    side: "top",
    align: "center",
    modal: false,
    closeOnEscape: true,
    closeOnOutsideClick: true,
    open: false,
    defaultOpen: false,
    openOnHover: false,
    delay: 300,
    closeDelay: 0
  };
  #props = { ...PopoverCore2.defaultProps };
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, PopoverCore2.defaultProps);
  }
  #input = null;
  setInput(input) {
    this.#input = input;
  }
  getState() {
    const input = this.#input;
    return {
      open: input.active,
      status: input.status,
      side: this.#props.side,
      align: this.#props.align,
      modal: this.#props.modal,
      ...getTransitionFlags(input.status)
    };
  }
  getTriggerAttrs(state, popupId2) {
    return {
      "aria-expanded": state.open && state.status !== "ending" ? "true" : "false",
      "aria-haspopup": "dialog",
      "aria-controls": popupId2
    };
  }
  getPopupAttrs(state) {
    return {
      popover: "manual",
      role: "dialog",
      "aria-modal": state.modal === true ? "true" : void 0
    };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/popover/data.js
var PopoverDataAttrs = {
  /** Present when the popover is open. */
  open: "data-open",
  /** Indicates the rendered side of the popover after collision handling. */
  side: "data-side",
  /** Indicates how the popover is aligned relative to the specified side. */
  align: "data-align",
  ...TransitionDataAttrs
};

// node_modules/@videojs/core/dist/default/core/ui/popover/host.js
var POPUP_HOST_ATTR = "data-popup";
var POPUP_HOST_SELECTOR = `[${POPUP_HOST_ATTR}]`;

// node_modules/@videojs/core/dist/default/core/ui/poster/core.js
var PosterCore = class {
  #media = null;
  #loadState = "none";
  /** Supply the latest player state. Call before reading {@link PosterCore.getState}. */
  setMedia(media) {
    this.#media = media;
  }
  /** Supply how the binding's image is faring. */
  setImageLoadState(loadState) {
    this.#loadState = loadState;
  }
  /** Derive the presentation state to paint. */
  getState() {
    const media = this.#media;
    return {
      visible: !media.started,
      src: media.poster,
      loading: this.#loadState === "loading",
      loaded: this.#loadState === "loaded",
      error: this.#loadState === "error"
    };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/poster/data.js
var PosterDataAttrs = {
  /** Present until playback starts. */
  visible: "data-visible",
  /** Present while the poster image is fetching. */
  loading: "data-loading",
  /** Present once the poster image has decoded. */
  loaded: "data-loaded",
  /** Present when the poster image failed. */
  error: "data-error"
};

// node_modules/@videojs/core/dist/default/core/ui/quality-radio-group/core.js
var QUALITY_AUTO_VALUE2 = "auto";
var STANDARD_RENDITION_SIZES = [
  4320,
  2160,
  1440,
  1080,
  720,
  480,
  360,
  240
];
function formatBitrate(bitrate) {
  return bitrate >= 1e6 ? `${Math.round(bitrate / 1e5) / 10} Mbps` : `${Math.round(bitrate / 1e3)} kbps`;
}
function getWidescreenSize(width) {
  const size = Math.round(width * 9 / 16);
  return STANDARD_RENDITION_SIZES.includes(size) ? size : void 0;
}
function getRenditionSize(rendition) {
  const { width, height } = rendition;
  if (width && height) {
    if (width > height && width * 9 > height * 16) return getWidescreenSize(width) ?? height;
    return Math.min(width, height);
  }
  if (height) return height;
  if (width) return getWidescreenSize(width) ?? width;
}
function hasSameSize(rendition, renditions) {
  const size = getRenditionSize(rendition);
  return Boolean(size && renditions.some((other) => other !== rendition && getRenditionSize(other) === size));
}
function formatRenditionLabel(rendition) {
  const size = getRenditionSize(rendition);
  if (size) return `${size}p`;
  if (rendition.bitrate) return formatBitrate(rendition.bitrate);
  return qualityText;
}
function formatRenditionBadge(rendition, renditions = []) {
  if (!getRenditionSize(rendition) || !rendition.bitrate || !hasSameSize(rendition, renditions)) return void 0;
  return formatBitrate(rendition.bitrate);
}
function formatRenditionTier(rendition) {
  const size = getRenditionSize(rendition);
  if (!size) return void 0;
  if (size >= 4320) return "8K";
  if (size >= 2160) return "4K";
  if (size >= 1080) return "HD";
}
var QualityRadioGroupCore = class QualityRadioGroupCore2 {
  static defaultProps = {
    label: "",
    formatRendition: formatRenditionLabel,
    disabled: false
  };
  state = createState({
    options: [{
      value: QUALITY_AUTO_VALUE2,
      label: autoText,
      disabled: false
    }],
    value: QUALITY_AUTO_VALUE2,
    disabled: true,
    hidden: true,
    availability: "unavailable",
    label: ""
  });
  #props = { ...QualityRadioGroupCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, QualityRadioGroupCore2.defaultProps);
  }
  getLabel(state) {
    const label = resolveLabel(this.#props.label, state);
    if (label) return label;
    return qualityText;
  }
  getRenditionLabel(rendition) {
    if (this.#props.formatRendition !== QualityRadioGroupCore2.defaultProps.formatRendition) return this.#props.formatRendition(rendition);
    return formatRenditionLabel(rendition);
  }
  getRenditionBadge(rendition, renditions = []) {
    if (this.#props.formatRendition !== QualityRadioGroupCore2.defaultProps.formatRendition) return void 0;
    return formatRenditionBadge(rendition, renditions);
  }
  getRenditionTier(rendition) {
    if (this.#props.formatRendition !== QualityRadioGroupCore2.defaultProps.formatRendition) return void 0;
    return formatRenditionTier(rendition);
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": state.disabled ? "true" : void 0,
      hidden: state.hidden ? "" : void 0
    };
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    const selectedIndex = media.videoRenditionList.findIndex((rendition) => rendition.selected);
    const availability = media.videoRenditionList.length > 1 ? "available" : "unavailable";
    const toOption = (rendition) => {
      const tier = this.getRenditionTier(rendition);
      const badge = this.getRenditionBadge(rendition, media.videoRenditionList);
      return {
        value: rendition.id,
        label: this.getRenditionLabel(rendition),
        disabled: false,
        ...tier && { tier },
        ...badge && { badge }
      };
    };
    const { activeVideoRendition } = media;
    const active = activeVideoRendition && media.videoRenditionList.some((rendition) => rendition.id === activeVideoRendition.id) ? toOption(activeVideoRendition) : void 0;
    const autoOption = {
      value: QUALITY_AUTO_VALUE2,
      label: selectedIndex === -1 && active ? autoWithLabelText : autoText,
      disabled: false,
      ...selectedIndex === -1 && active && { labelParams: { label: resolveText(active.label) } }
    };
    this.state.patch({
      options: [autoOption, ...media.videoRenditionList.map(toOption)],
      value: selectedIndex === -1 ? QUALITY_AUTO_VALUE2 : media.videoRenditionList[selectedIndex].id,
      disabled: this.#props.disabled || availability === "unavailable",
      hidden: availability === "unavailable",
      availability
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  select(media, value) {
    if (this.#props.disabled) return;
    if (value === "auto") {
      media.selectVideoRendition(value);
      return;
    }
    if (!media.videoRenditionList.some((rendition) => rendition.id === value)) return;
    media.selectVideoRendition(value);
  }
  selectValue(media, value) {
    this.select(media, value);
  }
};

// node_modules/@videojs/core/dist/default/core/ui/quality-radio-group/data.js
var QualityRadioGroupDataAttrs = {
  /** Current quality value. */
  value: "data-quality",
  /** Present when quality selection is disabled. */
  disabled: "data-disabled",
  /** Present when quality selection is unavailable. */
  hidden: "data-hidden",
  /** Indicates quality availability (`available` or `unavailable`). */
  availability: "data-availability"
};

// node_modules/@videojs/core/dist/default/i18n/text/seek.js
var prefix12 = "seek.";
var forwardText = {
  key: `${prefix12}forward`,
  text: "Seek forward {seconds} seconds"
};
var backwardText = {
  key: `${prefix12}backward`,
  text: "Seek backward {seconds} seconds"
};

// node_modules/@videojs/core/dist/default/core/ui/seek-button/core.js
var SeekButtonCore = class SeekButtonCore2 {
  static defaultProps = {
    seconds: 30,
    label: "",
    disabled: false
  };
  state = createState({
    seeking: false,
    direction: "forward",
    label: ""
  });
  #props = { ...SeekButtonCore2.defaultProps };
  #media = null;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, SeekButtonCore2.defaultProps);
  }
  getLabel(state) {
    const custom = resolveLabel(this.#props.label, state);
    if (custom !== void 0) return custom;
    return state.direction === "backward" ? backwardText : forwardText;
  }
  getLabelParams(state) {
    if (resolveLabel(this.#props.label, state) !== void 0) return void 0;
    return { seconds: Math.abs(this.#props.seconds) };
  }
  getAttrs(state) {
    return {
      "aria-label": this.getLabel(state),
      "aria-disabled": this.#props.disabled ? "true" : void 0
    };
  }
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const media = this.#media;
    const direction = this.#props.seconds < 0 ? "backward" : "forward";
    this.state.patch({
      seeking: media.seeking,
      direction
    });
    this.state.patch({ label: resolveText(this.getLabel(this.state.current)) });
    return this.state.current;
  }
  async seek(media) {
    if (this.#props.disabled) return;
    await media.seek(media.currentTime + this.#props.seconds);
  }
};

// node_modules/@videojs/core/dist/default/core/ui/seek-button/data.js
var SeekButtonDataAttrs = {
  /** Present when a seek is in progress. */
  seeking: "data-seeking",
  /** Indicates the seek direction: `"forward"` or `"backward"`. */
  direction: "data-direction"
};

// node_modules/@videojs/utils/dist/time/format.js
var durationFormatters = /* @__PURE__ */ new Map();
function createDurationFormatter(style, hoursDisplay, locale) {
  if (style === "digital") {
    const number = new Intl.NumberFormat(locale, { useGrouping: false });
    const padded = new Intl.NumberFormat(locale, {
      minimumIntegerDigits: 2,
      useGrouping: false
    });
    return { format: (duration) => {
      const body = `${padded.format(duration.minutes ?? 0)}:${padded.format(duration.seconds ?? 0)}`;
      return hoursDisplay === "always" || duration.hours !== void 0 ? `${number.format(duration.hours ?? 0)}:${body}` : body;
    } };
  }
  const units = [
    ["hours", new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "hour",
      unitDisplay: style
    })],
    ["minutes", new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "minute",
      unitDisplay: style
    })],
    ["seconds", new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "second",
      unitDisplay: style
    })]
  ];
  const list = typeof Intl.ListFormat === "function" ? new Intl.ListFormat(locale, {
    type: "unit",
    style
  }) : { format: (parts) => [...parts].join(style === "narrow" ? " " : ", ") };
  return { format: (duration) => list.format(units.filter(([unit]) => duration[unit] !== void 0).map(([unit, formatter]) => formatter.format(duration[unit] ?? 0))) };
}
function localeCacheKey(locale) {
  if (locale === void 0) return "";
  return Array.isArray(locale) ? locale.join(":") : locale;
}
function getDurationFormatter(locale, style = "long", hoursDisplay) {
  const key = `${localeCacheKey(locale)}:${style}:${hoursDisplay ?? ""}`;
  let formatter = durationFormatters.get(key);
  if (!formatter) {
    formatter = createDurationFormatter(style, hoursDisplay, locale);
    durationFormatters.set(key, formatter);
  }
  return formatter;
}
function isValidTime(value) {
  return isNumber(value) && Number.isFinite(value);
}
function formatTime(seconds, guide, options) {
  if (!isValidTime(seconds)) return "0:00";
  const negative = seconds < 0;
  const totalSeconds = Math.floor(Math.abs(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const secondsPart = totalSeconds % 60;
  const guideSeconds = isValidTime(guide ?? 0) ? Math.abs(guide ?? 0) : 0;
  const guideHours = Math.floor(guideSeconds / 3600);
  const guideMinutes = Math.floor(guideSeconds / 60 % 60);
  const showHours = hours > 0 || guideHours > 0;
  const padMinutes = showHours || guideMinutes >= 10;
  const duration = showHours ? {
    hours,
    minutes,
    seconds: secondsPart
  } : {
    minutes,
    seconds: secondsPart
  };
  const { locale = "en" } = options ?? {};
  let body = getDurationFormatter(locale, "digital", showHours ? "always" : "auto").format(duration);
  if (!padMinutes) {
    const zero = new Intl.NumberFormat(locale, { useGrouping: false }).format(0);
    body = body.replace(new RegExp(`^${zero}(?=\\p{Nd}\\D)`, "u"), "");
  }
  return `${negative ? "-" : ""}${body}`;
}
function secondsToIsoDuration(seconds) {
  if (!isValidTime(seconds)) return "PT0S";
  const positiveSeconds = Math.abs(seconds);
  const h = Math.floor(positiveSeconds / 3600);
  const m = Math.floor(positiveSeconds / 60 % 60);
  const s = Math.floor(positiveSeconds % 60);
  let duration = "PT";
  if (h > 0) duration += `${h}H`;
  if (m > 0) duration += `${m}M`;
  if (s > 0 || duration === "PT") duration += `${s}S`;
  return duration;
}
function formatTimeAsPhrase(seconds, options) {
  if (!isValidTime(seconds)) return "";
  const { locale = "en", style = "long", formatRemaining } = options ?? {};
  const negative = seconds < 0;
  const totalSeconds = Math.floor(Math.abs(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const secondsPart = totalSeconds % 60;
  const record = {};
  if (hours > 0) record.hours = hours;
  if (minutes > 0) record.minutes = minutes;
  if (secondsPart > 0 || hours === 0 && minutes === 0) record.seconds = secondsPart;
  const body = getDurationFormatter(locale, style).format(record);
  if (negative) {
    if (formatRemaining) return formatRemaining(body);
    if (isDefaultLocale(locale)) return `${body} remaining`;
    return body;
  }
  return body;
}

// node_modules/@videojs/core/dist/default/core/ui/seek-indicator/status.js
function isSeekIndicatorAction(action) {
  return action === "seekStep" || action === "seekToPercent";
}
function formatCurrentTime(snapshot, locale) {
  const options = locale === void 0 ? void 0 : { locale };
  return formatTime(snapshot.currentTime ?? 0, snapshot.duration, options);
}
function getSeekIndicatorDisplayValue(state) {
  return state.value ?? state.currentTime;
}
function getSeekToPercent(event) {
  if (event.value !== void 0) return clamp(event.value, 0, 100);
  if (!event.key || event.key < "0" || event.key > "9") return null;
  return Number(event.key) * 10;
}
function getSeekDirection(event, snapshot) {
  if (event.action === "seekStep" && event.value !== void 0) {
    if (event.value > 0) return "forward";
    if (event.value < 0) return "backward";
  }
  if (event.action === "seekToPercent") {
    const percent = getSeekToPercent(event);
    if (percent === null || snapshot.duration === void 0 || snapshot.duration <= 0) return null;
    const targetTime = percent / 100 * snapshot.duration;
    const currentTime = snapshot.currentTime ?? 0;
    if (targetTime > currentTime) return "forward";
    if (targetTime < currentTime) return "backward";
  }
  return null;
}

// node_modules/@videojs/core/dist/default/core/ui/seek-indicator/core.js
var INITIAL_STATE = {
  open: false,
  generation: 0,
  direction: null,
  count: 0,
  seekTotal: 0,
  value: null,
  currentTime: "0:00",
  transitionStarting: false,
  transitionEnding: false
};
var SeekIndicatorCore = class {
  state = createState({ ...INITIAL_STATE });
  #props = {};
  #originTime = null;
  #close = new IndicatorCloseController(() => {
    this.#originTime = null;
    this.state.patch({
      open: false,
      direction: null,
      count: 0,
      seekTotal: 0,
      value: null
    });
  }, () => getIndicatorCloseDelay(this.#props));
  setProps(props) {
    this.#props = props;
  }
  destroy() {
    this.#close.destroy();
  }
  close() {
    this.#close.close();
  }
  processEvent(event, snapshot) {
    if (!isSeekIndicatorAction(event.action)) return false;
    const current = this.state.current;
    const direction = getSeekDirection(event, snapshot);
    const rapidRepeat = current.open && event.action === "seekStep" && current.direction === direction;
    if (!rapidRepeat) this.#originTime = snapshot.currentTime ?? null;
    const value = this.#getEffectiveSeekValue(event, snapshot, rapidRepeat);
    const seekTotal = rapidRepeat ? current.seekTotal + Math.abs(value) : Math.abs(value);
    const label = event.action === "seekStep" && seekTotal > 0 ? new Intl.NumberFormat(this.#props.locale ?? DEFAULT_LOCALE, {
      style: "unit",
      unit: "second",
      unitDisplay: isDefaultLocale(this.#props.locale) ? "narrow" : "short",
      useGrouping: false
    }).format(seekTotal) : null;
    this.state.patch({
      open: true,
      generation: current.generation + 1,
      direction,
      count: rapidRepeat ? current.count + 1 : 1,
      seekTotal,
      value: label,
      currentTime: formatCurrentTime(snapshot, this.#props.locale)
    });
    this.#close.arm();
    return true;
  }
  #getEffectiveSeekValue(event, snapshot, rapidRepeat) {
    if (event.action !== "seekStep" || event.value === void 0) return 0;
    if (!rapidRepeat || this.#originTime === null) return event.value;
    const originTime = this.#originTime;
    const duration = snapshot.duration ?? Infinity;
    const currentTotal = this.state.current.seekTotal;
    const step = Math.abs(event.value);
    return (event.value < 0 ? Math.max(0, originTime - currentTotal) : Math.max(0, duration - originTime - currentTotal)) >= step ? event.value : 0;
  }
};

// node_modules/@videojs/core/dist/default/core/ui/seek-indicator/data.js
var SeekIndicatorDataAttrs = {
  /** Present while the indicator is open. */
  open: "data-open",
  /** Direction of the seek as `"forward"` or `"backward"`. */
  direction: "data-direction",
  /** Present during the open transition. */
  transitionStarting: "data-starting-style",
  /** Present during the close transition. */
  transitionEnding: "data-ending-style"
};

// node_modules/@videojs/core/dist/default/core/ui/slider/core.js
var SliderCore = class SliderCore2 {
  static defaultProps = {
    label: "",
    step: 1,
    largeStep: 10,
    orientation: "horizontal",
    disabled: false,
    thumbAlignment: "center",
    value: 0,
    min: 0,
    max: 100
  };
  static defaultInput = {
    pointerPercent: 0,
    dragPercent: 0,
    dragging: false,
    pointing: false,
    focused: false
  };
  #props = { ...SliderCore2.defaultProps };
  #input = { ...SliderCore2.defaultInput };
  get props() {
    return this.#props;
  }
  get input() {
    return this.#input;
  }
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, SliderCore2.defaultProps);
  }
  setInput(input) {
    this.#input = input;
  }
  getSliderState(value) {
    const { orientation, disabled, thumbAlignment } = this.#props;
    const { pointerPercent, dragging, pointing, focused } = this.#input;
    return {
      value,
      fillPercent: this.percentFromValue(value),
      pointerPercent,
      dragging,
      pointing,
      interactive: dragging || pointing || focused,
      orientation,
      disabled,
      thumbAlignment
    };
  }
  getLabel(state) {
    return resolveLabel(this.#props.label, state) || "";
  }
  getAttrs(state) {
    return {
      role: "slider",
      tabIndex: state.disabled ? -1 : 0,
      autoComplete: "off",
      "aria-label": this.getLabel(state),
      "aria-valuemin": this.#props.min,
      "aria-valuemax": this.#props.max,
      "aria-valuenow": state.value,
      "aria-orientation": state.orientation,
      "aria-disabled": state.disabled ? "true" : void 0
    };
  }
  valueFromPercent(percent) {
    const { min, max, step } = this.#props;
    const raw = min + percent / 100 * (max - min);
    return roundToStep(clamp(raw, min, max), step, min);
  }
  /** Convert percent to a clamped value without applying step rounding. */
  rawValueFromPercent(percent) {
    const { min, max } = this.#props;
    return clamp(min + percent / 100 * (max - min), min, max);
  }
  percentFromValue(value) {
    const { min, max } = this.#props;
    return toPercent(value, min, max);
  }
  /** Step as a percentage of the slider range. */
  getStepPercent() {
    const { step, min, max } = this.#props;
    const range = max - min;
    return range > 0 ? step / range * 100 : 0;
  }
  /** Large step as a percentage of the slider range. */
  getLargeStepPercent() {
    const { largeStep, min, max } = this.#props;
    const range = max - min;
    return range > 0 ? largeStep / range * 100 : 0;
  }
  adjustPercentForAlignment(rawPercent, thumbSize, trackSize) {
    if (this.#props.thumbAlignment === "center" || trackSize === 0) return rawPercent;
    const thumbHalf = thumbSize / trackSize * 100 / 2;
    const minPercent = thumbHalf;
    const maxPercent = 100 - thumbHalf;
    return minPercent + rawPercent / 100 * (maxPercent - minPercent);
  }
};

// node_modules/@videojs/core/dist/default/core/ui/slider/data.js
var SliderDataAttrs = {
  /** Present when the user is actively dragging. */
  dragging: "data-dragging",
  /** Present when the pointer is over the slider. */
  pointing: "data-pointing",
  /** Present when dragging, pointing, or focus is active. */
  interactive: "data-interactive",
  /** Current axis of slider movement (`horizontal` or `vertical`). */
  orientation: "data-orientation",
  /** Present when the slider is non-interactive. */
  disabled: "data-disabled"
};

// node_modules/@videojs/core/dist/default/core/ui/slider/segments.js
var SliderSegmentsCore = class {
  getGeometry(input) {
    const { ranges, min, max, orientation } = input;
    const domain = max - min;
    if (!Number.isFinite(domain) || domain <= 0) return [];
    const valid = ranges.filter((segment) => {
      const size = (segment.end - segment.start) / domain;
      const offset = (segment.start - min) / domain;
      return Number.isFinite(size) && Number.isFinite(offset) && size > 0;
    });
    return valid.map((segment, index) => {
      const offset = (segment.start - min) / domain;
      const size = (segment.end - segment.start) / domain;
      const segmentSize = `${size * 100}%`;
      return {
        ...segment,
        index,
        last: index === valid.length - 1,
        orientation,
        width: orientation === "horizontal" ? segmentSize : void 0,
        height: orientation === "vertical" ? segmentSize : void 0,
        startPercent: `${offset * 100}%`,
        endPercent: `${(offset + size) * 100}%`
      };
    });
  }
  getState(segment, slider, pointerValue) {
    const { last, ...geometry } = segment;
    const contains = (value) => value >= segment.start && (value < segment.end || last && value === segment.end);
    const active = contains(slider.value);
    const pointing = slider.pointing && contains(pointerValue);
    const dragging = slider.dragging && contains(pointerValue);
    const focused = slider.interactive && !slider.pointing && !slider.dragging;
    return {
      ...geometry,
      fillPercent: toPercent(slider.value, segment.start, segment.end),
      active,
      pointing,
      dragging,
      highlighted: segment.highlight !== false && pointing,
      interactive: pointing || dragging || focused && active
    };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/status-announcer/labels.js
var DEFAULT_STATUS_ANNOUNCER_LABELS = {
  ...DEFAULT_INPUT_INDICATOR_LABELS,
  volumeWithValue: (value) => translateText(valueText, { value }),
  seekedTo: (time) => translateText(seekedToText, { time: formatTimeAsPhrase(time) }),
  playbackRate: (rate) => translateText(rateText, { rate })
};
function createStatusAnnouncerLabels(translator, locale = DEFAULT_LOCALE) {
  return {
    ...createInputIndicatorLabels(translator),
    volumeWithValue: (value) => translator(valueText, { value }),
    seekedTo: (time) => translator(seekedToText, { time: formatTimeAsPhrase(time, { locale }) }),
    playbackRate: (rate) => translator(rateText, { rate })
  };
}

// node_modules/@videojs/core/dist/default/core/ui/volume-indicator/status.js
function isVolumeIndicatorAction(action) {
  return action === "toggleMuted" || action === "volumeStep";
}
function getVolumeLevel2(volume) {
  if (volume <= 0) return "off";
  return volume <= 0.5 ? "low" : "high";
}
function formatVolumeValue(volume) {
  return `${Math.round(clamp(volume, 0, 1) * 100)}%`;
}
function getVolumeIndicatorDisplayValue(state) {
  return state.value ?? "";
}
function predictVolumeActionOutcome(event, snapshot) {
  const muted = snapshot.muted === true;
  const snapshotVolume = snapshot.volume ?? 0;
  if (event.action === "toggleMuted") return {
    snapshotVolume,
    nextMuted: !muted,
    nextVolume: snapshotVolume
  };
  if (event.action === "volumeStep") {
    const nextVolume = clamp(snapshotVolume + (event.value ?? 0), 0, 1);
    return {
      snapshotVolume,
      nextMuted: muted && nextVolume <= 0,
      nextVolume
    };
  }
  return {
    snapshotVolume,
    nextMuted: muted,
    nextVolume: snapshotVolume
  };
}
function deriveVolumeStatus(event, snapshot, labels = DEFAULT_INPUT_INDICATOR_LABELS, cachedPrediction) {
  const prediction = cachedPrediction ?? predictVolumeActionOutcome(event, snapshot);
  const level = prediction.nextMuted ? "off" : getVolumeLevel2(prediction.nextVolume);
  const value = prediction.nextMuted ? "0%" : formatVolumeValue(prediction.nextVolume);
  return {
    status: level === "off" ? "volume-off" : level === "low" ? "volume-low" : "volume-high",
    label: level === "off" ? labels.muted : labels.volume,
    value,
    volumeLevel: level
  };
}

// node_modules/@videojs/core/dist/default/core/ui/status-announcer/status.js
function deriveStatusAnnouncement(previous, snapshot, labels = DEFAULT_STATUS_ANNOUNCER_LABELS) {
  const announcements = [];
  if (hasChanged(previous.paused, snapshot.paused)) announcements.push(snapshot.paused ? labels.paused : labels.playing);
  if (hasChanged(previous.subtitlesShowing, snapshot.subtitlesShowing) && snapshot.subtitlesAvailable !== false) announcements.push(snapshot.subtitlesShowing ? labels.captionsOn : labels.captionsOff);
  if (hasChanged(previous.isFullscreen, snapshot.isFullscreen)) announcements.push(snapshot.isFullscreen ? labels.fullscreen : labels.exitFullscreen);
  if (hasChanged(previous.isPictureInPicture, snapshot.isPictureInPicture)) announcements.push(snapshot.isPictureInPicture ? labels.pictureInPicture : labels.exitPictureInPicture);
  if (hasChanged(previous.playbackRate, snapshot.playbackRate)) announcements.push(labels.playbackRate(`${snapshot.playbackRate}\xD7`));
  return announcements.length > 0 ? announcements.join(". ") : null;
}
function deriveVolumeAnnouncement(previous, snapshot, labels = DEFAULT_STATUS_ANNOUNCER_LABELS) {
  if (!hasChanged(previous.volume, snapshot.volume) && !hasChanged(previous.muted, snapshot.muted)) return null;
  const volume = snapshot.volume ?? previous.volume;
  const muted = snapshot.muted ?? previous.muted;
  if (volume === void 0 && muted === void 0) return null;
  return muted || (volume ?? 0) <= 0 ? labels.muted : labels.volumeWithValue(formatVolumeValue(volume ?? 0));
}
function hasChanged(previous, next) {
  return previous !== void 0 && next !== void 0 && !Object.is(previous, next);
}

// node_modules/@videojs/core/dist/default/core/ui/status-announcer/core.js
var ANNOUNCEMENT_DEBOUNCE = 200;
var StatusAnnouncerCore = class {
  state = createState({
    generation: 0,
    label: null
  });
  #props = {};
  #snapshot = null;
  #seekStartTime = null;
  #seekTargetTime = null;
  #timer = null;
  #close = new IndicatorCloseController(() => this.state.patch({ label: null }), () => getIndicatorCloseDelay(this.#props));
  setProps(props) {
    this.#props = props;
  }
  resetSnapshot() {
    this.#snapshot = null;
    this.#seekStartTime = null;
    this.#seekTargetTime = null;
    this.#clearTimer();
    this.#close.close();
  }
  destroy() {
    this.#clearTimer();
    this.#close.destroy();
  }
  processSnapshot(snapshot) {
    const previous = this.#snapshot;
    this.#snapshot = snapshot;
    if (!previous) return false;
    const labels = this.#getLabels();
    const statusLabel = deriveStatusAnnouncement(previous, snapshot, labels);
    const statusHandled = statusLabel !== null && this.#announce(statusLabel);
    const seekHandled = this.#processSeekSnapshot(previous, snapshot, labels, statusHandled);
    const volumeHandled = this.#processVolumeSnapshot(previous, snapshot, labels, statusHandled || seekHandled);
    return statusHandled || seekHandled || volumeHandled;
  }
  #getLabels() {
    return {
      ...DEFAULT_STATUS_ANNOUNCER_LABELS,
      ...this.#props.labels
    };
  }
  #announce(label) {
    this.#clearTimer();
    this.state.patch({
      generation: this.state.current.generation + 1,
      label
    });
    this.#close.arm();
    return true;
  }
  #processVolumeSnapshot(previous, snapshot, labels, alreadyHandled) {
    const label = deriveVolumeAnnouncement(previous, snapshot, labels);
    if (label === null || alreadyHandled || !this.#shouldAnnounce()) return false;
    this.#schedule(label);
    return true;
  }
  #processSeekSnapshot(previous, snapshot, labels, alreadyHandled) {
    if (previous.seeking !== true && snapshot.seeking === true) {
      this.#seekStartTime = previous.currentTime ?? null;
      this.#seekTargetTime = snapshot.currentTime ?? null;
      this.#clearTimer();
      return false;
    }
    if (snapshot.seeking === true) {
      this.#seekTargetTime = snapshot.currentTime ?? this.#seekTargetTime;
      return false;
    }
    if (previous.seeking !== true || snapshot.seeking !== false) return false;
    const targetTime = snapshot.currentTime ?? this.#seekTargetTime;
    const startTime = this.#seekStartTime;
    this.#seekStartTime = null;
    this.#seekTargetTime = null;
    if (targetTime === void 0 || targetTime === null || Object.is(targetTime, startTime)) return false;
    if (alreadyHandled || !this.#shouldAnnounce()) return false;
    this.#schedule(labels.seekedTo(targetTime));
    return true;
  }
  #schedule(label) {
    this.#clearTimer();
    this.#timer = setTimeout(() => {
      this.#timer = null;
      if (!this.#shouldAnnounce()) return;
      this.#announce(label);
    }, ANNOUNCEMENT_DEBOUNCE);
  }
  #shouldAnnounce() {
    return this.#props.shouldAnnounce?.() !== false;
  }
  #clearTimer() {
    if (this.#timer === null) return;
    clearTimeout(this.#timer);
    this.#timer = null;
  }
};

// node_modules/@videojs/core/dist/default/core/ui/status-indicator/status.js
function deriveStatus(event, snapshot, labels = DEFAULT_INPUT_INDICATOR_LABELS) {
  switch (event.action) {
    case "togglePaused": {
      const paused = snapshot.paused !== void 0 ? !snapshot.paused : true;
      return {
        status: paused ? "pause" : "play",
        label: paused ? labels.paused : labels.playing,
        value: null
      };
    }
    case "toggleMuted":
    case "volumeStep":
      return deriveVolumeStatus(event, snapshot, labels);
    case "toggleSubtitles": {
      if (snapshot.subtitlesAvailable === false) return null;
      const showing = snapshot.subtitlesShowing !== void 0 ? !snapshot.subtitlesShowing : true;
      return {
        status: showing ? "captions-on" : "captions-off",
        label: showing ? labels.captionsOn : labels.captionsOff,
        value: null
      };
    }
    case "toggleFullscreen": {
      const fullscreen = snapshot.isFullscreen !== void 0 ? !snapshot.isFullscreen : true;
      return {
        status: fullscreen ? "fullscreen" : "exit-fullscreen",
        label: fullscreen ? labels.fullscreen : labels.exitFullscreen,
        value: null
      };
    }
    case "togglePictureInPicture": {
      const pip = snapshot.isPictureInPicture !== void 0 ? !snapshot.isPictureInPicture : true;
      return {
        status: pip ? "pip" : "exit-pip",
        label: pip ? labels.pictureInPicture : labels.exitPictureInPicture,
        value: null
      };
    }
    default:
      return null;
  }
}
function getStatusIndicatorDisplayValue(state) {
  return state.value ?? state.label ?? "";
}

// node_modules/@videojs/core/dist/default/core/ui/status-indicator/core.js
var INITIAL_STATE2 = {
  open: false,
  generation: 0,
  status: null,
  label: null,
  value: null,
  transitionStarting: false,
  transitionEnding: false
};
var StatusIndicatorCore = class {
  state = createState({ ...INITIAL_STATE2 });
  #props = {};
  #close = new IndicatorCloseController(() => this.state.patch({
    open: false,
    status: null,
    label: null,
    value: null
  }), () => getIndicatorCloseDelay(this.#props));
  setProps(props) {
    this.#props = props;
  }
  destroy() {
    this.#close.destroy();
  }
  close() {
    this.#close.close();
  }
  processEvent(event, snapshot) {
    if (!isInputActionIncluded(event.action, this.#props.actions)) return false;
    const details = deriveStatus(event, snapshot, {
      ...DEFAULT_INPUT_INDICATOR_LABELS,
      ...this.#props.labels
    }) ?? this.#props.deriveCustomStatus?.(event, snapshot);
    if (!details) return false;
    this.state.patch({
      open: true,
      generation: this.state.current.generation + 1,
      status: details.status,
      label: details.label,
      value: details.value
    });
    this.#close.arm();
    return true;
  }
};

// node_modules/@videojs/core/dist/default/core/ui/status-indicator/data.js
var StatusIndicatorDataAttrs = {
  /** Present while the indicator is open. */
  open: "data-open",
  /** Predicted visual status for the handled input action. */
  status: "data-status",
  /** Present during the open transition. */
  transitionStarting: "data-starting-style",
  /** Present during the close transition. */
  transitionEnding: "data-ending-style"
};

// node_modules/@videojs/core/dist/default/core/ui/thumbnail/data.js
var ThumbnailDataAttrs = {
  loading: "data-loading",
  error: "data-error",
  hidden: "data-hidden"
};

// node_modules/@videojs/core/dist/default/core/ui/thumbnail/media-fragment.js
function parseMediaFragment(text, baseURL) {
  const parts = text.trim().split("#");
  const rawURL = parts[0] ?? "";
  const hash = parts[1];
  const url = baseURL ? new URL(rawURL, baseURL).href : rawURL;
  if (!hash) return { url };
  const eqIndex = hash.indexOf("=");
  if (eqIndex === -1) return { url };
  const keys = hash.slice(0, eqIndex);
  const values = hash.slice(eqIndex + 1).split(",").map(Number);
  const data = {};
  for (let i2 = 0; i2 < keys.length; i2++) {
    const key = keys[i2];
    const value = values[i2];
    if (key && isNumber(value) && !Number.isNaN(value)) data[key] = value;
  }
  const result = { url };
  if (isNumber(data.w)) result.width = data.w;
  if (isNumber(data.h)) result.height = data.h;
  if (isNumber(data.x) && isNumber(data.y)) result.coords = {
    x: data.x,
    y: data.y
  };
  return result;
}
function mapCuesToThumbnails(cues, baseURL) {
  const images = [];
  for (const cue of cues) {
    const fragment = parseMediaFragment(cue.text, baseURL);
    const image = {
      url: fragment.url,
      startTime: cue.startTime,
      endTime: cue.endTime
    };
    if (fragment.width) image.width = fragment.width;
    if (fragment.height) image.height = fragment.height;
    if (fragment.coords) image.coords = fragment.coords;
    images.push(image);
  }
  return images;
}

// node_modules/@videojs/core/dist/default/i18n/text/time.js
var prefix13 = "time.";
var currentText = {
  key: `${prefix13}current`,
  text: "Current time"
};
var durationText = {
  key: `${prefix13}duration`,
  text: "Duration"
};
var remainingText = {
  key: `${prefix13}remaining`,
  text: "Remaining"
};
var elapsedSuffixText = {
  key: `${prefix13}elapsedSuffix`,
  text: "{duration} elapsed"
};
var durationSuffixText = {
  key: `${prefix13}durationSuffix`,
  text: "{duration} duration"
};
var remainingSuffixText = {
  key: `${prefix13}remainingSuffix`,
  text: "{duration} remaining"
};
var showElapsedText = {
  key: `${prefix13}showElapsed`,
  text: "Show elapsed time, {duration}."
};
var showDurationText = {
  key: `${prefix13}showDuration`,
  text: "Show duration, {duration}."
};
var showRemainingText = {
  key: `${prefix13}showRemaining`,
  text: "Show remaining time, {duration}."
};
var toggleElapsedText = {
  key: `${prefix13}toggleElapsed`,
  text: "Toggle between elapsed and remaining time."
};
var toggleDurationText = {
  key: `${prefix13}toggleDuration`,
  text: "Toggle between duration and remaining time."
};
var positionText = {
  key: `${prefix13}position`,
  text: "{current} of {duration}"
};
var unknownText = {
  key: `${prefix13}unknown`,
  text: "Media not loaded, unknown time."
};

// node_modules/@videojs/core/dist/default/core/ui/time/core.js
var TOGGLE_LABELS = {
  current: showElapsedText,
  duration: showDurationText,
  remaining: showRemainingText
};
var DEFAULT_LABELS = {
  current: currentText,
  duration: durationText,
  remaining: remainingText
};
var TOGGLE_DESCRIPTIONS = {
  current: toggleElapsedText,
  duration: toggleDurationText,
  remaining: toggleDurationText
};
var TimeCore = class TimeCore2 {
  static defaultProps = {
    type: "current",
    negativeSign: "-",
    label: "",
    toggle: false
  };
  #props = { ...TimeCore2.defaultProps };
  #media = null;
  #formatLocale;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, TimeCore2.defaultProps);
  }
  setMedia(media) {
    this.#media = media;
  }
  /** @internal Platform adapters set the active i18n locale for digital time formatting. */
  setFormatLocale(locale) {
    this.#formatLocale = locale;
  }
  #getSeconds() {
    const media = this.#media;
    const duration = getTimeRangeEnd(media);
    const { type } = this.#props;
    switch (type) {
      case "current":
        return media.currentTime;
      case "duration":
        return duration;
      case "remaining":
        return media.currentTime - duration;
      default:
        return 0;
    }
  }
  #getText() {
    const media = this.#media;
    const seconds = this.#getSeconds();
    const duration = getTimeRangeEnd(media);
    const options = this.#formatLocale === void 0 ? void 0 : { locale: this.#formatLocale };
    return formatTime(Math.abs(seconds), duration, options);
  }
  #getPhrase() {
    const { type } = this.#props;
    const seconds = this.#getSeconds();
    if (type === "remaining") return formatTimeAsPhrase(seconds < 0 ? seconds : -Math.abs(seconds));
    return formatTimeAsPhrase(seconds);
  }
  #getDatetime() {
    const seconds = this.#getSeconds();
    return secondsToIsoDuration(Math.abs(seconds));
  }
  #getToggleType(type, currentType) {
    if (type === "current") return currentType === "remaining" ? "current" : "remaining";
    return currentType === "duration" ? "remaining" : "duration";
  }
  getLabel(state, type = this.#props.type) {
    const custom = resolveLabel(this.#props.label, state);
    if (custom !== void 0) return custom;
    if (state.disabled || state.unavailable) return unknownText;
    if (!this.#props.toggle) return DEFAULT_LABELS[this.#props.type];
    const toggleType = this.#getToggleType(type, state.type);
    return TOGGLE_LABELS[toggleType];
  }
  getLabelParams(state) {
    if (resolveLabel(this.#props.label, state) !== void 0 || state.disabled || !this.#props.toggle) return void 0;
    const options = this.#formatLocale === void 0 ? void 0 : { locale: this.#formatLocale };
    const duration = formatTimeAsPhrase(Math.abs(state.seconds), options);
    switch (state.type) {
      case "current":
        return { duration: `${duration} elapsed` };
      case "duration":
        return { duration: `${duration} duration` };
      case "remaining":
        return { duration: `${duration} remaining` };
    }
  }
  getDescription(state, type = this.#props.type) {
    return this.#props.toggle && !state.disabled ? TOGGLE_DESCRIPTIONS[type] : void 0;
  }
  getAttrs(state, type = this.#props.type) {
    return {
      "aria-label": this.getLabel(state, type),
      "aria-description": this.getDescription(state, type),
      "aria-disabled": this.#props.toggle && state.disabled ? "true" : void 0,
      role: this.#props.toggle ? "button" : void 0,
      tabIndex: this.#props.toggle ? state.disabled ? -1 : 0 : void 0
    };
  }
  getState() {
    const seconds = this.#getSeconds();
    const unavailable = !hasTimeRange(this.#media);
    return {
      type: this.#props.type,
      disabled: this.#props.toggle && unavailable,
      unavailable: !this.#props.toggle && unavailable,
      seconds,
      negative: this.#props.type === "remaining" && seconds < 0,
      text: this.#getText(),
      phrase: this.#getPhrase(),
      datetime: this.#getDatetime()
    };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/time/data.js
var TimeDataAttrs = {
  /** The type of time being displayed. */
  type: "data-type",
  /** Present when the time toggle is disabled. */
  disabled: "data-disabled",
  /** Present when the non-interactive time value is unavailable. */
  unavailable: "data-unavailable"
};

// node_modules/@videojs/core/dist/default/i18n/text/slider.js
var seekText = {
  key: `slider.seek`,
  text: "Seek"
};

// node_modules/@videojs/core/dist/default/core/ui/time-slider/core.js
var TimeSliderCore = class TimeSliderCore2 extends SliderCore {
  static defaultProps = {
    ...SliderCore.defaultProps,
    label: "",
    changeThrottle: 100,
    pauseOnDrag: false
  };
  #props = { ...TimeSliderCore2.defaultProps };
  #media = null;
  #formatLocale;
  #wasPlayingBeforeDrag = false;
  #text;
  constructor(props) {
    super();
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, TimeSliderCore2.defaultProps);
    super.setProps({
      ...props,
      min: 0
    });
  }
  setMedia(media) {
    this.#media = media;
  }
  /** @internal Platform adapters set the active i18n locale for `aria-valuetext` time formatting. */
  setFormatLocale(locale) {
    if (this.#formatLocale !== locale) this.#text = void 0;
    this.#formatLocale = locale;
  }
  getState() {
    const media = this.#media;
    const { currentTime, seeking, buffered } = media;
    const reportedEnd = media.seekable?.at(-1)?.[1];
    const duration = Number.isFinite(reportedEnd) && reportedEnd > 0 ? reportedEnd : getTimeRangeEnd(media), start = Math.min(duration, Math.max(0, media.seekable?.[0]?.[0] ?? 0));
    super.setProps({
      ...this.#props,
      disabled: this.#props.disabled || !hasTimeRange(media) || duration <= start,
      min: start,
      max: duration
    });
    const base = super.getSliderState(currentTime);
    const bufferedEnd = buffered.length > 0 ? buffered[buffered.length - 1][1] : 0;
    const bufferPercent = toPercent(bufferedEnd, start, duration);
    return {
      ...base,
      currentTime,
      duration,
      seeking,
      bufferPercent
    };
  }
  getLabel(state) {
    return super.getLabel(state) || seekText;
  }
  #announceValue(state) {
    return state.dragging ? this.rawValueFromPercent(state.pointerPercent) : state.value;
  }
  #formatTimeAsPhrase(seconds) {
    return this.#formatLocale === void 0 ? formatTimeAsPhrase(seconds) : formatTimeAsPhrase(seconds, { locale: this.#formatLocale });
  }
  getValueText(state) {
    if (state.duration <= state.min) return unknownText;
    return Number.isFinite(state.duration) ? positionText : this.getValueTextParams(state).current;
  }
  getValueTextParams(state) {
    const current = Math.max(0, Math.floor(this.#announceValue(state) - state.min));
    const duration = Math.max(0, Math.floor(state.duration - state.min));
    if (this.#text && this.#text.current === current && this.#text.duration === duration) return this.#text.params;
    const params = Number.isFinite(duration) ? {
      current: this.#formatTimeAsPhrase(current),
      duration: this.#formatTimeAsPhrase(duration)
    } : { current: this.#formatTimeAsPhrase(current) };
    this.#text = {
      current,
      duration,
      params
    };
    return params;
  }
  /**
  * Pause playback when a drag begins if `pauseOnDrag` is enabled, remembering whether media was playing so `endDrag`
  * can resume it.
  */
  startDrag(playback) {
    this.#wasPlayingBeforeDrag = false;
    if (this.#props.pauseOnDrag && playback && !playback.paused) {
      this.#wasPlayingBeforeDrag = true;
      playback.pause();
    }
  }
  /**
  * Resume playback if `startDrag` paused it. Resume depends only on the intent captured at drag start, so it survives
  * `pauseOnDrag` being toggled mid-drag. Safe to call on teardown — a no-op unless a drag paused playback.
  */
  endDrag(playback) {
    if (this.#wasPlayingBeforeDrag) playback?.play().catch(() => {
    });
    this.#wasPlayingBeforeDrag = false;
  }
  getAttrs(state) {
    const base = super.getAttrs(state);
    const announceValue = this.#announceValue(state);
    return {
      ...base,
      "aria-valuenow": announceValue,
      "aria-valuetext": this.getValueText(state)
    };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/time-slider/data.js
var TimeSliderDataAttrs = {
  ...SliderDataAttrs,
  /** Present when a seek operation is in progress. */
  seeking: "data-seeking"
};

// node_modules/@videojs/core/dist/default/core/ui/time-slider/chapters/core.js
function getCueKey(cue, seen) {
  const id = cue.id;
  const base = `cue-${typeof id === "string" && id ? `${id}-` : ""}${cue.startTime}-${cue.text}`;
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count ? `${base}-${count}` : base;
}
function normalizeChapterCues(cues, min, max) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [];
  const seen = /* @__PURE__ */ new Map();
  const sorted = cues.map((cue, index) => ({
    cue,
    index,
    key: getCueKey(cue, seen)
  })).filter(({ cue }) => Number.isFinite(cue.startTime) && Number.isFinite(cue.endTime)).sort((a, b) => a.cue.startTime - b.cue.startTime || a.index - b.index);
  const chapters = [];
  let end = min;
  let previousKey = "start";
  for (const { cue, key } of sorted) {
    const start = Math.max(min, cue.startTime);
    const cueEnd = Math.min(max, cue.endTime);
    if (cueEnd <= start) continue;
    if (start > end) chapters.push({
      key: `gap-${previousKey}-${key}`,
      start: end,
      end: start,
      cue: null
    });
    const segmentStart = Math.max(start, end);
    if (cueEnd <= segmentStart) continue;
    chapters.push({
      key,
      start: segmentStart,
      end: cueEnd,
      cue
    });
    end = cueEnd;
    previousKey = key;
  }
  if (chapters.length === 0) return [{
    key: "gap-start-end",
    start: min,
    end: max,
    cue: null
  }];
  if (end < max) chapters.push({
    key: `gap-${previousKey}-end`,
    start: end,
    end: max,
    cue: null
  });
  return chapters;
}
var TimeSliderChaptersCore = class {
  #cues = null;
  #min = 0;
  #max = 0;
  #result = null;
  getRanges(cues, min, max) {
    if (this.#result && (this.#cues === cues || this.#cues?.length === 0 && cues.length === 0) && this.#min === min && this.#max === max) return this.#result;
    const hasRange = max > min;
    const rangeMax = hasRange ? max : min + 1;
    const chapters = normalizeChapterCues(hasRange ? cues : [], min, rangeMax);
    const ranges = chapters.map(({ key, start, end, cue }) => ({
      key,
      start,
      end,
      highlight: cue !== null
    }));
    this.#cues = cues;
    this.#min = min;
    this.#max = max;
    this.#result = {
      chapters,
      ranges,
      max: rangeMax
    };
    return this.#result;
  }
  findChapter(chapters, value) {
    return findRangeAt(chapters, value, (chapter) => chapter.start, (chapter) => chapter.end);
  }
  getState(segment, chapters, bufferedEnd) {
    return {
      ...segment,
      cue: chapters[segment.index]?.cue ?? null,
      bufferPercent: toPercent(bufferedEnd, segment.start, segment.end)
    };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/time-slider/chapters/data.js
var TimeSliderChapterDataAttrs = {
  /** Present when playback is within the chapter. */
  active: "data-active",
  /** Present when pointer interaction highlights the chapter. */
  highlighted: "data-highlighted"
};

// node_modules/@videojs/core/dist/default/core/ui/time-slider/chapters/vars.js
var TimeSliderChapterCSSVars = {
  start: "--media-slider-chapter-start",
  end: "--media-slider-chapter-end",
  width: "--media-slider-chapter-width",
  fill: "--media-slider-chapter-fill",
  buffer: "--media-slider-chapter-buffer"
};

// node_modules/@videojs/core/dist/default/core/ui/title/core.js
var TitleCore = class {
  getState(media, controls) {
    const { title } = media;
    return {
      title,
      hidden: title.length === 0,
      visible: controls?.controlsVisible ?? false
    };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/title/data.js
var TitleDataAttrs = {
  /** Present when the element is hidden because no title is available. */
  hidden: "data-hidden",
  /** Present while the player controls are visible. */
  visible: "data-visible"
};

// node_modules/@videojs/core/dist/default/core/ui/tooltip/core.js
var TooltipCore = class TooltipCore2 {
  static defaultProps = {
    side: "top",
    align: "center",
    open: false,
    defaultOpen: false,
    delay: 600,
    closeDelay: 0,
    disableHoverablePopup: true,
    disabled: false,
    sticky: false
  };
  #props = { ...TooltipCore2.defaultProps };
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, TooltipCore2.defaultProps);
  }
  #input = null;
  setInput(input) {
    this.#input = input;
  }
  getState() {
    const input = this.#input;
    return {
      open: input.active,
      status: input.status,
      side: this.#props.side,
      align: this.#props.align,
      ...getTransitionFlags(input.status)
    };
  }
  getPopupAttrs(_state) {
    return {
      popover: "manual",
      role: "presentation"
    };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/tooltip/data.js
var TooltipDataAttrs = {
  /** Present when the tooltip is open. */
  open: "data-open",
  /** Indicates the rendered side of the tooltip after collision handling. */
  side: "data-side",
  /** Indicates how the tooltip is aligned relative to the specified side. */
  align: "data-align",
  ...TransitionDataAttrs
};

// node_modules/@videojs/core/dist/default/core/ui/tooltip/group.js
var TooltipGroupCore = class TooltipGroupCore2 {
  static defaultProps = {
    delay: 600,
    closeDelay: 0,
    timeout: 400
  };
  #props = { ...TooltipGroupCore2.defaultProps };
  #lastCloseTime = 0;
  #isOpen = false;
  constructor(props) {
    if (props) this.setProps(props);
  }
  setProps(props) {
    this.#props = defaults(props, TooltipGroupCore2.defaultProps);
  }
  get delay() {
    return this.#props.delay;
  }
  get closeDelay() {
    return this.#props.closeDelay;
  }
  shouldSkipDelay() {
    if (this.#isOpen) return true;
    return Date.now() - this.#lastCloseTime < this.#props.timeout;
  }
  notifyOpen() {
    this.#isOpen = true;
  }
  notifyClose() {
    this.#isOpen = false;
    this.#lastCloseTime = Date.now();
  }
};

// node_modules/@videojs/core/dist/default/core/ui/tooltip/vars.js
var TooltipCSSVars = {
  /** Distance between the popup and the trigger along the side axis. */
  sideOffset: "--media-tooltip-side-offset",
  /** Distance between the popup and the trigger along the alignment axis. */
  alignOffset: "--media-tooltip-align-offset",
  /** Minimum distance between the popup and the positioning boundary. */
  boundaryOffset: "--media-tooltip-boundary-offset",
  /** The anchor element's width. */
  anchorWidth: "--media-tooltip-anchor-width",
  /** The anchor element's height. */
  anchorHeight: "--media-tooltip-anchor-height",
  /** Available width between the trigger and the boundary edge. */
  availableWidth: "--media-tooltip-available-width",
  /** Available height between the trigger and the boundary edge. */
  availableHeight: "--media-tooltip-available-height"
};

// node_modules/@videojs/core/dist/default/core/ui/volume-indicator/core.js
var BOUNDARY_CLEAR_DELAY = 300;
var INITIAL_STATE3 = {
  open: false,
  generation: 0,
  level: null,
  value: null,
  fill: null,
  min: false,
  max: false,
  transitionStarting: false,
  transitionEnding: false
};
var VolumeIndicatorCore = class {
  state = createState({ ...INITIAL_STATE3 });
  #props = {};
  #boundaryTimer = null;
  #close = new IndicatorCloseController(() => this.state.patch({
    open: false,
    level: null,
    value: null,
    fill: null,
    min: false,
    max: false
  }), () => getIndicatorCloseDelay(this.#props));
  setProps(props) {
    this.#props = props;
  }
  destroy() {
    this.#close.destroy();
    this.#clearBoundaryTimers();
  }
  close() {
    this.#clearBoundaryTimers();
    this.#close.close();
  }
  processEvent(event, snapshot) {
    if (!isVolumeIndicatorAction(event.action)) return false;
    const current = this.state.current;
    const prediction = predictVolumeActionOutcome(event, snapshot);
    const details = deriveVolumeStatus(event, snapshot, {
      ...DEFAULT_INPUT_INDICATOR_LABELS,
      ...this.#props.labels
    }, prediction);
    const boundary = getVolumeBoundary(event, prediction.snapshotVolume, prediction.nextVolume);
    const showBoundary = boundary !== null && !event.repeat;
    if (!boundary) this.#clearBoundaryTimers();
    this.state.patch({
      open: true,
      generation: current.generation + 1,
      level: details.volumeLevel,
      value: details.value,
      fill: details.value,
      min: boundary && event.repeat ? current.min : showBoundary && boundary === "min",
      max: boundary && event.repeat ? current.max : showBoundary && boundary === "max"
    });
    if (showBoundary) this.#scheduleBoundaryClear();
    this.#close.arm();
    return true;
  }
  #scheduleBoundaryClear() {
    this.#clearBoundaryTimer();
    this.#boundaryTimer = setTimeout(() => {
      this.#boundaryTimer = null;
      this.state.patch({
        min: false,
        max: false
      });
    }, BOUNDARY_CLEAR_DELAY);
  }
  #clearBoundaryTimer() {
    if (this.#boundaryTimer === null) return;
    clearTimeout(this.#boundaryTimer);
    this.#boundaryTimer = null;
  }
  #clearBoundaryTimers() {
    this.#clearBoundaryTimer();
  }
};
function getVolumeBoundary(event, currentVolume, nextVolume) {
  if (event.action !== "volumeStep" || event.value === void 0 || event.value === 0) return null;
  if (nextVolume !== currentVolume) return null;
  return event.value < 0 ? "min" : "max";
}

// node_modules/@videojs/core/dist/default/core/ui/volume-indicator/data.js
var VolumeIndicatorDataAttrs = {
  /** Present while the indicator is open. */
  open: "data-open",
  /** Predicted volume level as `"off"`, `"low"`, or `"high"`. */
  level: "data-level",
  /** Present briefly when a downward step cannot lower the volume further. */
  min: "data-min",
  /** Present briefly when an upward step cannot raise the volume further. */
  max: "data-max",
  /** Present during the open transition. */
  transitionStarting: "data-starting-style",
  /** Present during the close transition. */
  transitionEnding: "data-ending-style"
};

// node_modules/@videojs/core/dist/default/core/ui/volume-indicator/vars.js
var VolumeIndicatorCSSVars = {
  /** Current predicted volume percentage, set on the Fill part. */
  fill: "--media-volume-fill"
};

// node_modules/@videojs/core/dist/default/core/ui/volume-popover/core.js
var VolumePopoverCore = class extends PopoverCore {
  static defaultProps = PopoverCore.defaultProps;
  #media = null;
  setMedia(media) {
    this.#media = media;
  }
  getState() {
    const availability = this.#media.volumeAvailability;
    return {
      ...super.getState(),
      availability,
      hidden: availability !== "available"
    };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/volume-popover/data.js
var VolumePopoverDataAttrs = {
  /** Present when the popover is open. */
  open: "data-open",
  /** Indicates the rendered side after collision handling. */
  side: "data-side",
  /** Indicates how the popup is aligned relative to its side. */
  align: "data-align",
  /** Present during the open transition. */
  transitionStarting: "data-starting-style",
  /** Present during the close transition. */
  transitionEnding: "data-ending-style",
  /** Indicates volume control availability (`available`, `unavailable`, or `unsupported`). */
  availability: "data-availability",
  /** Present when volume level controls are unavailable. */
  hidden: "data-hidden"
};

// node_modules/@videojs/utils/dist/percent/percent.js
var formatters = /* @__PURE__ */ new Map();
function localeCacheKey2(locale) {
  if (locale === void 0) return "";
  return Array.isArray(locale) ? locale.join(":") : locale;
}
function getFormatter(locale) {
  const key = localeCacheKey2(locale);
  let formatter = formatters.get(key);
  if (!formatter) try {
    formatter = new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 0
    });
    formatters.set(key, formatter);
  } catch {
    return;
  }
  return formatter;
}
function formatFallback(fraction) {
  return `${Math.round(Math.min(1, Math.max(0, fraction)) * 100)}%`;
}
function formatPercent(fraction, locale) {
  const value = !isNumber(fraction) || !Number.isFinite(fraction) ? 0 : Math.min(1, Math.max(0, fraction));
  try {
    const formatter = getFormatter(locale) ?? getFormatter(void 0);
    if (formatter) return formatter.format(value);
  } catch {
  }
  return formatFallback(value);
}

// node_modules/@videojs/core/dist/default/core/ui/volume-slider/core.js
var VolumeSliderCore = class VolumeSliderCore2 extends SliderCore {
  static defaultProps = {
    ...SliderCore.defaultProps,
    label: "",
    step: 5,
    wheelStep: 5
  };
  #wheelStep = VolumeSliderCore2.defaultProps.wheelStep;
  #media = null;
  #formatLocale;
  constructor(props) {
    super();
    if (props) this.setProps(props);
  }
  setProps(props) {
    const resolvedProps = defaults(props, VolumeSliderCore2.defaultProps);
    this.#wheelStep = resolvedProps.wheelStep;
    super.setProps(resolvedProps);
  }
  setMedia(media) {
    this.#media = media;
  }
  /** @internal Platform adapters set the active i18n locale for `aria-valuetext` percent formatting. */
  setFormatLocale(locale) {
    this.#formatLocale = locale;
  }
  getState() {
    const media = this.#media;
    const { volume, muted } = media;
    const effectivelyMuted = muted || volume === 0;
    const { dragging, dragPercent } = this.input;
    const volumePercent = volume * 100;
    const value = dragging ? this.valueFromPercent(dragPercent) : volumePercent;
    const base = super.getSliderState(value);
    const availability = media.volumeAvailability;
    return {
      ...base,
      disabled: base.disabled || availability !== "available",
      fillPercent: effectivelyMuted ? 0 : base.fillPercent,
      volume,
      muted: effectivelyMuted,
      availability,
      hidden: availability !== "available"
    };
  }
  /** Wheel step as a percentage of the slider range. */
  getWheelStepPercent() {
    const { min, max } = this.props;
    const range = max - min;
    return range > 0 ? this.#wheelStep / range * 100 : 0;
  }
  getLabel(state) {
    return super.getLabel(state) || labelText;
  }
  getValueText(state) {
    return state.muted ? mutedValueText : this.getValueTextParams(state).percent;
  }
  getValueTextParams(state) {
    return { percent: formatPercent(state.value / 100, this.#formatLocale) };
  }
  getAttrs(state) {
    return {
      ...super.getAttrs(state),
      "aria-valuetext": this.getValueText(state)
    };
  }
};

// node_modules/@videojs/core/dist/default/core/ui/volume-slider/data.js
var VolumeSliderDataAttrs = {
  ...SliderDataAttrs,
  availability: "data-availability",
  hidden: "data-hidden"
};

// node_modules/@videojs/core/dist/default/i18n/text/container.js
var labelText2 = {
  key: `container.label`,
  text: "Media player"
};

// node_modules/@videojs/html/dist/default/ui/container/element.js
var ContainerElement = class extends UIElement {
  static {
    this.tagName = "media-container";
  }
  #releaseContainer = null;
  #disconnect = null;
  #label = null;
  #title = new PlayerController(this, playerContext, (state) => state.title);
  #core = new ContainerCore();
  #controls = new PlayerController(this, playerContext, selectControls);
  #i18n = new I18nController(this, i18nContext);
  #popupGroup = createPopupGroup();
  #popupGroupProvider = new i(this, {
    context: popupGroupContext,
    initialValue: this.#popupGroup
  });
  #container = new ContextConsumer(this, {
    context: containerContext,
    callback: (value) => this.#register(value)
  });
  connectedCallback() {
    super.connectedCallback();
    this.#popupGroupProvider.setValue(this.#popupGroup);
    this.#register(this.#container.value);
    applyContainerAttrs(this);
    this.#applyLabel();
    this.#disconnect = new AbortController();
    listen(this, "pointerup", this.#onPointerUp, { signal: this.#disconnect.signal });
  }
  disconnectedCallback() {
    this.#releaseContainer?.();
    this.#releaseContainer = null;
    this.#disconnect?.abort();
    this.#disconnect = null;
    super.disconnectedCallback();
  }
  update(changed) {
    super.update(changed);
    this.#applyLabel();
    const controls = this.#controls.value;
    if (controls) {
      this.#core.setMedia(controls);
      applyStateDataAttrs(this, this.#core.getState(), ContainerDataAttrs);
    } else this.removeAttribute(ContainerDataAttrs.controlsVisible);
  }
  #register(value) {
    this.#releaseContainer?.();
    this.#releaseContainer = null;
    if (this.isConnected && value) this.#releaseContainer = value.registerContainer(this);
  }
  #applyLabel() {
    const current = this.getAttribute("aria-label");
    if (current && current !== this.#label) return;
    if (this.hasAttribute("aria-labelledby")) {
      if (current === this.#label) {
        this.removeAttribute("aria-label");
        this.#label = null;
      }
      return;
    }
    const title = this.#title.value;
    const label = this.#i18n.value(labelText2) + (title ? ": " + title : "");
    this.setAttribute("aria-label", label);
    this.#label = label;
  }
  #onPointerUp = () => {
    focusContainer(this);
  };
};

// node_modules/@videojs/html/dist/default/define/ui/container.js
safeDefine(ContainerElement);

// node_modules/@videojs/html/dist/default/ui/poster/element.js
var SHADOW_CSS = `:host {
  display: block;
}
img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: var(--media-object-fit, contain);
  object-position: var(--media-object-position, center);
}
img:not([src]) {
  visibility: hidden;
}`;
function hasSource(img) {
  if (img.hasAttribute("src") || img.hasAttribute("srcset")) return true;
  const parent = img.parentElement;
  return parent?.localName === "picture" && parent.querySelector("source") !== null;
}
function hasOwnSource(img) {
  return !!img.getAttribute("src") || img.hasAttribute("srcset");
}
function createFallbackImage() {
  const img = document.createElement("img");
  img.alt = "";
  img.setAttribute("part", "image");
  img.setAttribute("decoding", "async");
  return img;
}
var PosterElement = class extends UIElement {
  static {
    this.tagName = "media-poster";
  }
  #core = new PosterCore();
  #shadow = this.attachShadow({ mode: "open" });
  #fallback = createFallbackImage();
  #children = new MutationObserver(() => this.requestUpdate());
  #playback = new PlayerController(this, playerContext, selectPlayback);
  #metadata = new PlayerController(this, playerContext, selectMetadata);
  #image = null;
  /** Whether `#image` had no source of its own when it became active. */
  #owned = false;
  #imageLoadState = "pending";
  #imageEvents = null;
  #disconnect = null;
  constructor() {
    super();
    const style = document.createElement("style");
    style.textContent = SHADOW_CSS;
    this.#shadow.append(style, document.createElement("slot"), this.#fallback);
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
    this.#disconnect = new AbortController();
    const { signal } = this.#disconnect;
    this.addEventListener("slotchange", () => this.requestUpdate(), { signal });
    this.#children.observe(this, {
      childList: true,
      subtree: true
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#adopt(null);
    this.#children.disconnect();
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
  get #loadState() {
    if (!this.#image || !hasSource(this.#image)) return "none";
    return this.#imageLoadState === "pending" ? "loading" : this.#imageLoadState;
  }
  update(changed) {
    super.update(changed);
    const playback = this.#playback.value;
    if (!playback) return;
    this.#core.setMedia({
      started: playback.started,
      poster: this.#metadata.value?.poster ?? ""
    });
    const { src } = this.#core.getState();
    this.#adopt(findComposedElement(this, isHTMLImageElement) ?? this.#fallback);
    this.#applySource(src);
    this.#core.setImageLoadState(this.#loadState);
    applyStateDataAttrs(this, this.#core.getState(), PosterDataAttrs);
  }
  /**
  * Ownership is settled once, when an image becomes active: after the first fill the `src` we set would itself look
  * authored. Re-slot an image with a source to hand it back, the way React decides a field is controlled at mount.
  */
  #adopt(next) {
    if (next === this.#image) return;
    if (this.#owned) this.#image?.removeAttribute("src");
    this.#imageEvents?.abort();
    this.#imageEvents = null;
    this.#image = next;
    this.#owned = next !== null && !hasSource(next);
    this.#imageLoadState = "pending";
    if (next === this.#fallback) this.#shadow.append(this.#fallback);
    else if (next) this.#fallback.remove();
    if (!next) return;
    if (next.naturalWidth > 0) this.#imageLoadState = "loaded";
    else if (next.complete && hasOwnSource(next)) this.#imageLoadState = "error";
    this.#imageEvents = new AbortController();
    const { signal } = this.#imageEvents;
    const settle = (loadState) => () => {
      this.#imageLoadState = loadState;
      this.requestUpdate();
    };
    next.addEventListener("load", settle("loaded"), { signal });
    next.addEventListener("error", settle("error"), { signal });
  }
  #applySource(src) {
    const img = this.#image;
    if (!img || !this.#owned) return;
    if (!src) {
      this.#imageLoadState = "pending";
      img.removeAttribute("src");
    } else if (img.getAttribute("src") !== src) {
      this.#imageLoadState = "pending";
      img.setAttribute("src", src);
    }
  }
};

// node_modules/@videojs/html/dist/default/define/ui/poster.js
safeDefine(PosterElement);

// node_modules/@videojs/html/dist/default/ui/buffering-indicator/element.js
var BufferingIndicatorElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.delay = BufferingIndicatorCore.defaultProps.delay;
    this.#core = new BufferingIndicatorCore();
    this.#state = new PlayerController(this, playerContext, selectPlayback);
    this.#disconnect = null;
  }
  static {
    this.tagName = "media-buffering-indicator";
  }
  static {
    this.properties = { delay: { type: Number } };
  }
  #core;
  #state;
  #disconnect;
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
    this.#disconnect = new AbortController();
    this.#core.state.subscribe(() => this.requestUpdate(), { signal: this.#disconnect.signal });
  }
  disconnectedCallback() {
    this.#core.destroy();
    super.disconnectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
  destroyCallback() {
    this.#core.destroy();
    super.destroyCallback();
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    this.#core.setProps(this);
  }
  update(changed) {
    super.update(changed);
    const media = this.#state.value;
    if (!media) return;
    this.#core.update(media);
    applyStateDataAttrs(this, this.#core.state.current, BufferingIndicatorDataAttrs);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/buffering-indicator.js
safeDefine(BufferingIndicatorElement);

// node_modules/@videojs/html/dist/default/ui/dialog/context.js
var dialogContext = n(Symbol("@videojs/dialog"));

// node_modules/@videojs/html/dist/default/ui/error-dialog/element.js
var idCounter = 0;
function hasAuthoredContent(host) {
  return Array.from(host.childNodes).some((node) => !!node.textContent?.trim());
}
var ErrorDialogElement = class extends UIElement {
  static {
    this.tagName = "media-error-dialog";
  }
  #core = new ErrorDialogCore();
  #provider = new i(this, { context: dialogContext });
  #popupId = `vjs-error-dialog-popup-${idCounter++}`;
  #titleId = `vjs-error-dialog-title-${idCounter++}`;
  #descriptionId = `vjs-error-dialog-desc-${idCounter++}`;
  #errorState = new PlayerController(this, playerContext, selectError);
  #i18n = new I18nController(this, i18nContext);
  #container = new ContextConsumer(this, {
    context: containerContext,
    subscribe: true
  });
  #dialog = null;
  #snapshot = null;
  #modalitySnapshot = null;
  #lastError = null;
  #lastDescription = null;
  #seenCopyParts = /* @__PURE__ */ new WeakSet();
  #authoredCopyParts = /* @__PURE__ */ new WeakSet();
  constructor() {
    super();
    this.#core.setTitleId(this.#titleId);
    this.#core.setDescriptionId(this.#descriptionId);
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
    this.#dialog = createDialog({
      transition: createTransition(),
      onOpenChange: (nextOpen) => {
        if (!nextOpen) this.#errorState.value?.dismissError();
      }
    });
    if (this.#snapshot) this.#snapshot.track(this.#dialog.input);
    else this.#snapshot = new SnapshotController(this, this.#dialog.input);
    if (this.#modalitySnapshot) this.#modalitySnapshot.track(this.#dialog.modality);
    else this.#modalitySnapshot = new SnapshotController(this, this.#dialog.modality);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#dialog?.destroy();
    this.#dialog = null;
  }
  willUpdate(_changed) {
    super.willUpdate(_changed);
    if (!this.#dialog) return;
    this.#dialog.setInteractionRoot(this.#container.value?.container ?? null);
    const errorState = this.#errorState.value;
    const hasError = Boolean(errorState?.error);
    const { active: isOpen } = this.#dialog.input.current;
    if (errorState?.error) this.#lastError = errorState.error;
    const errorForCopy = errorState?.error ?? (isOpen ? this.#lastError : null);
    this.#syncDialogCopy(errorForCopy);
    if (!hasError && !isOpen) {
      this.#lastError = null;
      this.#lastDescription = null;
    }
    if (hasError && !isOpen) this.#dialog.open();
    else if (!hasError && isOpen) this.#dialog.close();
  }
  update(_changed) {
    super.update(_changed);
    if (!this.#dialog) return;
    const input = this.#dialog.input.current;
    this.#core.setInput(input);
    this.#core.setDocumentModal(this.#dialog.modality.current.documentModal);
    const state = this.#core.getState();
    applyStateDataAttrs(this, state, ErrorDialogDataAttrs);
    this.#provider.setValue({
      state,
      stateAttrMap: ErrorDialogDataAttrs,
      dialog: this.#dialog,
      popupId: this.#popupId,
      popupAttrs: this.#core.getPopupAttrs(state),
      close: () => this.#dialog?.close()
    });
  }
  #syncDialogCopy(error) {
    const t = this.#i18n.value;
    const title = this.querySelector("media-dialog-title");
    if (title && !this.#hasAuthoredCopy(title)) title.textContent = translateText(getErrorDialogTitleText(), t);
    const desc = this.querySelector("media-dialog-description");
    if (desc && !this.#hasAuthoredCopy(desc)) {
      const description = error ? resolveErrorDialogDescription(error) : null;
      if (description) this.#lastDescription = description;
      const copy = description ?? this.#lastDescription;
      desc.textContent = copy ? translateText(copy, t) : translateText(getErrorDialogUnexpectedText(), t);
    }
    const close = this.querySelector("media-dialog-close");
    if (close && !this.#hasAuthoredCopy(close)) close.textContent = translateText(getErrorDialogDismissText(), t);
  }
  #hasAuthoredCopy(el) {
    if (!this.#seenCopyParts.has(el)) {
      this.#seenCopyParts.add(el);
      if (hasAuthoredContent(el)) this.#authoredCopyParts.add(el);
    }
    return this.#authoredCopyParts.has(el);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/error-dialog.js
safeDefine(ErrorDialogElement);

// node_modules/@videojs/html/dist/default/ui/context-part-element.js
var ContextPartElement = class extends UIElement {
  connectedCallback() {
    super.connectedCallback();
    this.#applyState();
  }
  update(_changed) {
    super.update(_changed);
    this.#applyState();
  }
  #applyState() {
    const ctx = this.consumer.value;
    if (ctx) applyStateDataAttrs(this, ctx.state, ctx.stateAttrMap);
  }
};

// node_modules/@videojs/html/dist/default/ui/dialog/backdrop.js
var DialogBackdropElement = class extends ContextPartElement {
  constructor(..._args) {
    super(..._args);
    this.consumer = new ContextConsumer(this, {
      context: dialogContext,
      subscribe: true
    });
  }
  static {
    this.tagName = "media-dialog-backdrop";
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "presentation");
    this.setAttribute("aria-hidden", "true");
  }
};

// node_modules/@videojs/html/dist/default/define/ui/dialog-backdrop.js
safeDefine(DialogBackdropElement);

// node_modules/@videojs/html/dist/default/ui/dialog/popup.js
var DialogPopupElement = class extends ContextPartElement {
  constructor(..._args) {
    super(..._args);
    this.consumer = new ContextConsumer(this, {
      context: dialogContext,
      subscribe: true
    });
    this.#dialog = null;
  }
  static {
    this.tagName = "media-dialog-popup";
  }
  #dialog;
  disconnectedCallback() {
    this.#dialog?.setPopupElement(null);
    this.#dialog = null;
    super.disconnectedCallback();
  }
  update(changed) {
    super.update(changed);
    const ctx = this.consumer.value;
    if (!ctx) return;
    if (this.#dialog !== ctx.dialog) {
      this.#dialog?.setPopupElement(null);
      this.#dialog = ctx.dialog;
      this.#dialog.setPopupElement(this);
    }
    applyElementProps(this, {
      id: ctx.popupId,
      tabIndex: -1,
      ...ctx.popupAttrs
    });
  }
};

// node_modules/@videojs/html/dist/default/define/ui/dialog-popup.js
safeDefine(DialogPopupElement);

// node_modules/@videojs/html/dist/default/ui/dialog/title.js
var DialogTitleElement = class extends ContextPartElement {
  constructor(..._args) {
    super(..._args);
    this.consumer = new ContextConsumer(this, {
      context: dialogContext,
      subscribe: true
    });
  }
  static {
    this.tagName = "media-dialog-title";
  }
  update(changed) {
    super.update(changed);
    const titleId = this.consumer.value?.state.titleId;
    if (titleId) this.id = titleId;
  }
};

// node_modules/@videojs/html/dist/default/define/ui/dialog-title.js
safeDefine(DialogTitleElement);

// node_modules/@videojs/html/dist/default/ui/dialog/description.js
var DialogDescriptionElement = class extends ContextPartElement {
  constructor(..._args) {
    super(..._args);
    this.consumer = new ContextConsumer(this, {
      context: dialogContext,
      subscribe: true
    });
  }
  static {
    this.tagName = "media-dialog-description";
  }
  update(changed) {
    super.update(changed);
    const descriptionId = this.consumer.value?.state.descriptionId;
    if (descriptionId) this.id = descriptionId;
  }
};

// node_modules/@videojs/html/dist/default/define/ui/dialog-description.js
safeDefine(DialogDescriptionElement);

// node_modules/@videojs/html/dist/default/ui/dialog/close.js
var DialogCloseElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.disabled = false;
    this.#ctx = new ContextConsumer(this, {
      context: dialogContext,
      subscribe: true
    });
    this.#disconnect = null;
  }
  static {
    this.tagName = "media-dialog-close";
  }
  static {
    this.properties = { disabled: { type: Boolean } };
  }
  #ctx;
  #disconnect;
  connectedCallback() {
    super.connectedCallback();
    this.#disconnect = new AbortController();
    const buttonProps = createButton({
      onActivate: () => this.#ctx.value?.close(),
      isDisabled: () => this.disabled
    });
    applyElementProps(this, buttonProps, { signal: this.#disconnect.signal });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
  update(_changed) {
    super.update(_changed);
    const ctx = this.#ctx.value;
    if (ctx) applyStateDataAttrs(this, ctx.state, ctx.stateAttrMap);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/dialog-close.js
safeDefine(DialogCloseElement);

// node_modules/@videojs/html/dist/default/ui/title/element.js
var TitleElement = class extends UIElement {
  static {
    this.tagName = "media-title";
  }
  #core = new TitleCore();
  #metadataState = new PlayerController(this, playerContext, selectMetadata);
  #controlsState = new PlayerController(this, playerContext, selectControls);
  connectedCallback() {
    super.connectedCallback();
  }
  update(changed) {
    super.update(changed);
    const metadata = this.#metadataState.value;
    if (!metadata) return;
    const state = this.#core.getState(metadata, this.#controlsState.value);
    if (this.textContent !== state.title) this.textContent = state.title;
    this.hidden = state.hidden;
    applyStateDataAttrs(this, state, TitleDataAttrs);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/title.js
safeDefine(TitleElement);

// node_modules/@videojs/html/dist/default/ui/controls/context.js
var controlsContext = n(Symbol("@videojs/controls"));

// node_modules/@videojs/html/dist/default/ui/controls/element.js
var ControlsElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.visibility = ControlsCore.defaultProps.visibility;
    this.#core = new ControlsCore();
    this.#mediaState = new PlayerController(this, playerContext, selectControls);
    this.#provider = new i(this, { context: controlsContext });
    this.#visible = true;
  }
  static {
    this.tagName = "media-controls";
  }
  static {
    this.properties = { visibility: { type: String } };
  }
  #core;
  #mediaState;
  #provider;
  #visible;
  connectedCallback() {
    super.connectedCallback();
  }
  update(_changed) {
    super.update(_changed);
    this.#core.setProps({ visibility: this.visibility });
    this.#core.setMedia(this.#mediaState.value ?? null);
    const state = this.#core.getState();
    if (!state) return;
    applyStateDataAttrs(this, state, ControlsDataAttrs);
    this.#provider.setValue({
      state,
      stateAttrMap: ControlsDataAttrs
    });
    const wasVisible = this.#visible;
    this.#visible = state.visible;
    if (wasVisible && !state.visible) this.#closeOwnedOverlays();
  }
  #closeOwnedOverlays() {
    for (const element of this.querySelectorAll(POPUP_HOST_SELECTOR)) {
      const host = element;
      if (!isFunction(host.close)) continue;
      host.close("imperative-action");
    }
  }
};

// node_modules/@videojs/html/dist/default/define/ui/controls.js
safeDefine(ControlsElement);

// node_modules/@videojs/html/dist/default/ui/controls/backdrop.js
var ControlsBackdropElement = class extends ContextPartElement {
  constructor(..._args) {
    super(..._args);
    this.consumer = new ContextConsumer(this, {
      context: controlsContext,
      subscribe: true
    });
  }
  static {
    this.tagName = "media-controls-backdrop";
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "presentation");
    this.setAttribute("aria-hidden", "true");
  }
};

// node_modules/@videojs/html/dist/default/define/ui/controls-backdrop.js
safeDefine(ControlsBackdropElement);

// node_modules/@videojs/html/dist/default/ui/controls/content.js
var ControlsContentElement = class extends ContextPartElement {
  constructor(..._args) {
    super(..._args);
    this.consumer = new ContextConsumer(this, {
      context: controlsContext,
      subscribe: true
    });
  }
  static {
    this.tagName = "media-controls-content";
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("data-interactive", "");
  }
};

// node_modules/@videojs/html/dist/default/define/ui/controls-content.js
safeDefine(ControlsContentElement);

// node_modules/@videojs/html/dist/default/ui/tooltip/context.js
var tooltipGroupContext = n(Symbol("@videojs/tooltip-group"));

// node_modules/@videojs/html/dist/default/ui/tooltip/group.js
var TooltipGroupElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.delay = TooltipGroupCore.defaultProps.delay;
    this.closeDelay = TooltipGroupCore.defaultProps.closeDelay;
    this.timeout = TooltipGroupCore.defaultProps.timeout;
    this.#core = new TooltipGroupCore();
    this.#provider = new i(this, {
      context: tooltipGroupContext,
      initialValue: this.#core
    });
  }
  static {
    this.tagName = "media-tooltip-group";
  }
  static {
    this.properties = {
      delay: { type: Number },
      closeDelay: {
        type: Number,
        attribute: "close-delay"
      },
      timeout: { type: Number }
    };
  }
  #core;
  #provider;
  update(_changed) {
    super.update(_changed);
    this.#core.setProps(this);
    this.#provider.setValue(this.#core);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/tooltip-group.js
safeDefine(TooltipGroupElement);

// node_modules/@videojs/html/dist/default/ui/controls/group.js
var ControlsGroupElement = class extends ContextPartElement {
  constructor(..._args) {
    super(..._args);
    this.consumer = new ContextConsumer(this, {
      context: controlsContext,
      subscribe: true
    });
  }
  static {
    this.tagName = "media-controls-group";
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.hasAttribute("aria-label") || this.hasAttribute("aria-labelledby")) this.setAttribute("role", "group");
  }
};

// node_modules/@videojs/html/dist/default/define/ui/controls-group.js
safeDefine(ControlsGroupElement);

// node_modules/@videojs/html/dist/default/ui/hotkey/aria-key-shortcuts-controller.js
var AriaKeyShortcutsController = class {
  #host;
  #action;
  #getValue;
  #container;
  #unsubscribe = null;
  /**
  * @param host - Host element whose nearest player container supplies hotkey registrations.
  * @param action - Registered hotkey action to look up.
  * @param options - Optional value resolver for value-dependent shortcuts.
  */
  constructor(host, action, options = {}) {
    this.#host = host;
    this.#action = action;
    this.#getValue = options.value;
    this.#container = new ContextConsumer(host, {
      context: containerContext,
      callback: (ctx) => this.#connect(ctx?.container),
      subscribe: true
    });
    host.addController(this);
  }
  get value() {
    return this.aria;
  }
  get aria() {
    return this.details.aria;
  }
  get shortcut() {
    return this.details.shortcut;
  }
  get details() {
    const container = this.#container.value?.container;
    if (!container) return {};
    return getHotkeyCoordinator(container).getShortcut(this.#action, this.#getValue?.());
  }
  hostConnected() {
    this.#connect(this.#container.value?.container);
  }
  hostDisconnected() {
    this.#disconnect();
  }
  #connect(container) {
    this.#disconnect();
    if (!container) return;
    const coordinator = getHotkeyCoordinator(container);
    const notify2 = () => {
      this.#host.requestUpdate();
    };
    this.#unsubscribe = coordinator.subscribeShortcutChanges(notify2);
    notify2();
  }
  #disconnect() {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
  }
};

// node_modules/@videojs/html/dist/default/ui/media-button-element.js
var MediaButtonElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.disabled = false;
    this.label = "";
    this.hotkeyAction = void 0;
    this.#disconnect = null;
    this.#hotkeyRegistry = null;
    this.#i18n = new I18nController(this, i18nContext);
  }
  static {
    this.properties = {
      label: { type: String },
      disabled: { type: Boolean }
    };
  }
  getIsButtonDisabled() {
    return this.disabled || !this.mediaState.value;
  }
  handleActivate(event, source) {
    Promise.resolve(this.activate(this.mediaState.value, event, source)).catch((error) => {
    });
  }
  /** Override to match hotkeys that use action values, such as seek steps. */
  get hotkeyValue() {
  }
  get $state() {
    return this.core.state;
  }
  #disconnect;
  #hotkeyRegistry;
  #lastHotkeyShortcut;
  #i18n;
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
    if (this.hotkeyAction && !this.#hotkeyRegistry) this.#hotkeyRegistry = new AriaKeyShortcutsController(this, this.hotkeyAction, { value: () => this.hotkeyValue });
    this.#disconnect = new AbortController();
    const buttonProps = createButton({
      onActivate: (event, source) => this.handleActivate(event, source),
      isDisabled: () => this.getIsButtonDisabled()
    });
    applyElementProps(this, buttonProps, { signal: this.#disconnect.signal });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
  /** Returns the button's current label derived from media state. */
  getLabel() {
    return this.core.state.current.label ? resolveText(this.core.state.current.label) : void 0;
  }
  getShortcut() {
    return this.#hotkeyRegistry?.shortcut;
  }
  /** Resolved label for tooltips and other display surfaces. */
  getResolvedLabel() {
    const media = this.mediaState.value;
    if (!media) return void 0;
    this.core.setMedia(media);
    const state = this.core.getState();
    if (this.core.getTooltipLabel) return translateText(this.core.getTooltipLabel(state), this.#i18n.value);
    return translateText(this.core.getLabel(state), this.#i18n.value, this.core.getLabelParams?.(state));
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    this.core.setProps?.(this);
  }
  update(changed) {
    super.update(changed);
    const media = this.mediaState.value;
    this.#syncHotkeyShortcut();
    if (!media) return;
    this.core.setMedia(media);
    const state = this.core.getState();
    const attrs = this.core.getAttrs?.(state) ?? {};
    if (isText(attrs["aria-label"])) attrs["aria-label"] = translateText(attrs["aria-label"], this.#i18n.value, this.core.getLabelParams?.(state));
    applyElementProps(this, {
      ...attrs,
      "aria-keyshortcuts": this.#hotkeyRegistry?.aria,
      ...isHideable(state) && this.reflectsHidden() && { hidden: state.hidden ? "" : void 0 }
    });
    applyStateDataAttrs(this, state, this.stateAttrMap);
    for (const [name, value] of Object.entries(this.core.getCSSVars?.(state) ?? {})) this.style.setProperty(name, value);
  }
  /**
  * Whether this button writes its core's `hidden` state to the `hidden` attribute. A subclass returns `false` while
  * another owner, such as a linked menu, manages its visibility.
  */
  reflectsHidden() {
    return true;
  }
  #syncHotkeyShortcut() {
    const shortcut = this.getShortcut();
    if (shortcut === this.#lastHotkeyShortcut) return;
    this.#lastHotkeyShortcut = shortcut;
    this.dispatchEvent(new CustomEvent(HOTKEY_SHORTCUT_CHANGE_EVENT));
  }
};
function isHideable(state) {
  return isObject(state) && isBoolean(state.hidden);
}

// node_modules/@videojs/html/dist/default/ui/airplay-button/element.js
var AirPlayButtonElement = class extends MediaButtonElement {
  constructor(..._args) {
    super(..._args);
    this.core = new AirPlayButtonCore();
    this.stateAttrMap = AirPlayButtonDataAttrs;
    this.mediaState = new PlayerController(this, playerContext, selectRemotePlayback);
  }
  static {
    this.tagName = "media-airplay-button";
  }
  activate(state) {
    return this.core.toggle(state);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/airplay-button.js
safeDefine(AirPlayButtonElement);

// node_modules/@videojs/html/dist/default/ui/position-controller.js
var popupId = 0;
var PositionController = class {
  #host;
  #positioner = new PopupPositioner();
  #implicitBinding = null;
  constructor(host) {
    this.#host = host;
    host.addController(this);
  }
  /** Discover an explicit trigger by ID or one linked via `commandfor`. */
  findTrigger(trigger) {
    const root = this.#host.getRootNode();
    if (root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      this.#releaseImplicitBinding();
      return null;
    }
    const scopedRoot = root;
    if (trigger) {
      this.#releaseImplicitBinding();
      return scopedRoot.getElementById(trigger);
    }
    if (this.#implicitBinding) {
      const { id: id2, trigger: boundTrigger } = this.#implicitBinding;
      if (this.#host.id === id2 && boundTrigger.getAttribute("commandfor") === id2 && this.#host.previousElementSibling === boundTrigger) return boundTrigger;
      this.#releaseImplicitBinding();
    }
    if (this.#host.id) return scopedRoot.querySelector(`[commandfor="${this.#host.id}"]`);
    const adjacent = this.#host.previousElementSibling;
    if (!(adjacent instanceof HTMLElement)) return null;
    if (adjacent.getAttribute("commandfor")) return null;
    const id = nextPopupId(scopedRoot);
    this.#host.id = id;
    adjacent.setAttribute("commandfor", id);
    this.#implicitBinding = {
      id,
      trigger: adjacent
    };
    return adjacent;
  }
  sync(options) {
    this.#positioner.sync({
      ...options,
      popup: this.#host
    });
  }
  cleanup() {
    this.#positioner.cleanup();
  }
  hostDisconnected() {
    this.cleanup();
    this.#releaseImplicitBinding();
  }
  hostDestroyed() {
    this.cleanup();
    this.#releaseImplicitBinding();
  }
  #releaseImplicitBinding() {
    const binding = this.#implicitBinding;
    if (!binding) return;
    if (binding.trigger.getAttribute("commandfor") === binding.id) binding.trigger.removeAttribute("commandfor");
    if (this.#host.id === binding.id) this.#host.removeAttribute("id");
    this.#implicitBinding = null;
  }
};
function nextPopupId(root) {
  let id;
  do
    id = `vjs-popup-${++popupId}`;
  while (root.getElementById(id));
  return id;
}

// node_modules/@videojs/html/dist/default/ui/tooltip/label.js
function hasAuthoredContent2(host) {
  return Array.from(host.childNodes).some((node) => !!node.textContent?.trim());
}
var TooltipLabelElement = class TooltipLabelElement2 extends UIElement {
  static {
    this.tagName = "media-tooltip-label";
  }
  #hasAuthoredContent = false;
  static findIn(host) {
    return host.querySelector(TooltipLabelElement2.tagName);
  }
  static create() {
    return document.createElement(TooltipLabelElement2.tagName);
  }
  connectedCallback() {
    this.#hasAuthoredContent ||= hasAuthoredContent2(this);
    super.connectedCallback();
  }
  setSyncedText(text) {
    if (this.#hasAuthoredContent) return;
    this.textContent = text;
  }
};

// node_modules/@videojs/html/dist/default/ui/tooltip/shortcut.js
var TooltipShortcutElement = class TooltipShortcutElement2 extends UIElement {
  static {
    this.tagName = "media-tooltip-shortcut";
  }
  static findIn(host) {
    return host.querySelector(TooltipShortcutElement2.tagName);
  }
  static create() {
    return document.createElement(TooltipShortcutElement2.tagName);
  }
  setSyncedShortcut(shortcut) {
    if (shortcut) {
      this.textContent = shortcut;
      this.hidden = false;
    } else {
      this.textContent = "";
      this.hidden = true;
    }
  }
};

// node_modules/@videojs/html/dist/default/ui/tooltip/element.js
function isLabelTrigger(el) {
  return "$state" in el;
}
var TooltipElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.open = TooltipCore.defaultProps.open;
    this.defaultOpen = TooltipCore.defaultProps.defaultOpen;
    this.side = TooltipCore.defaultProps.side;
    this.align = TooltipCore.defaultProps.align;
    this.delay = TooltipCore.defaultProps.delay;
    this.closeDelay = TooltipCore.defaultProps.closeDelay;
    this.disableHoverablePopup = TooltipCore.defaultProps.disableHoverablePopup;
    this.disabled = TooltipCore.defaultProps.disabled;
    this.sticky = TooltipCore.defaultProps.sticky;
    this.boundary = "container";
    this.trigger = "";
    this.#core = new TooltipCore();
    this.#i18n = new I18nController(this, i18nContext);
    this.#groupConsumer = new ContextConsumer(this, { context: tooltipGroupContext });
    this.#containerCtx = new ContextConsumer(this, {
      context: containerContext,
      subscribe: true
    });
    this.#popupGroupCtx = new ContextConsumer(this, { context: popupGroupContext });
    this.#position = new PositionController(this);
    this.#tooltip = null;
    this.#snapshot = null;
    this.#disconnect = null;
    this.#triggerAbort = null;
    this.#currentTrigger = null;
  }
  static {
    this.tagName = "media-tooltip";
  }
  static {
    this.properties = {
      open: { type: Boolean },
      defaultOpen: {
        type: Boolean,
        attribute: "default-open"
      },
      side: { type: String },
      align: { type: String },
      delay: { type: Number },
      closeDelay: {
        type: Number,
        attribute: "close-delay"
      },
      disableHoverablePopup: {
        type: Boolean,
        attribute: "disable-hoverable-popup"
      },
      disabled: { type: Boolean },
      sticky: { type: Boolean },
      boundary: { type: String },
      trigger: { type: String }
    };
  }
  #core;
  #i18n;
  #groupConsumer;
  #containerCtx;
  #popupGroupCtx;
  #position;
  #tooltip;
  #snapshot;
  #disconnect;
  #triggerAbort;
  #currentTrigger;
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
    this.setAttribute(POPUP_HOST_ATTR, "");
    this.#disconnect = new AbortController();
    this.#tooltip = createTooltip({
      transition: createTransition(),
      onOpenChange: (nextOpen, details) => {
        this.open = nextOpen;
        this.dispatchEvent(new CustomEvent("open-change", { detail: {
          open: nextOpen,
          ...details
        } }));
      },
      delay: () => this.delay,
      closeDelay: () => this.closeDelay,
      disableHoverablePopup: () => this.disableHoverablePopup,
      disabled: () => this.disabled,
      sticky: () => this.sticky,
      group: () => this.#groupConsumer.value,
      popupGroup: () => this.#popupGroupCtx.value
    });
    this.#tooltip.setPopupElement(this);
    applyElementProps(this, this.#tooltip.popupProps, { signal: this.#disconnect.signal });
    if (this.#snapshot) this.#snapshot.track(this.#tooltip.input);
    else this.#snapshot = new SnapshotController(this, this.#tooltip.input);
  }
  firstUpdated(changed) {
    super.firstUpdated(changed);
    if (this.defaultOpen && !this.open) this.#tooltip?.open();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#cleanupTrigger();
    this.#tooltip?.destroy();
    this.#tooltip = null;
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
  close(reason = "imperative-action") {
    this.#tooltip?.close(reason);
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    this.#core.setProps(this);
    if (this.#tooltip && changed.has("open")) {
      const { active: interactionOpen } = this.#tooltip.input.current;
      if (this.open !== interactionOpen) {
        if (this.open) this.#tooltip.open();
        else this.#tooltip.close();
      }
    }
  }
  update(_changed) {
    super.update(_changed);
    if (!this.#tooltip) return;
    const triggerEl = this.#position.findTrigger(this.trigger);
    this.#syncTrigger(triggerEl);
    if (this.#currentTrigger && isLabelTrigger(this.#currentTrigger)) this.#syncContent(this.#currentTrigger);
    const input = this.#tooltip.input.current;
    this.#core.setInput(input);
    const state = this.#core.getState();
    applyElementProps(this, this.#core.getPopupAttrs(state));
    applyStateDataAttrs(this, state, TooltipDataAttrs);
    if (state.open) tryShowPopover(this);
    else tryHidePopover(this);
    if (!state.open) {
      this.#position.cleanup();
      return;
    }
    this.#position.sync({
      anchorName: this.id,
      position: {
        side: state.side,
        align: state.align
      },
      trigger: this.#currentTrigger,
      boundary: this.boundary,
      container: this.#containerCtx.value?.container ?? null,
      cssVars: TooltipCSSVars,
      onSideChange: (side) => this.setAttribute(TooltipDataAttrs.side, side)
    });
  }
  #syncTrigger(triggerEl) {
    if (triggerEl === this.#currentTrigger) return;
    this.#position.cleanup();
    this.#cleanupTrigger();
    this.#currentTrigger = triggerEl;
    this.#tooltip?.setTriggerElement(triggerEl);
    if (triggerEl && this.#tooltip) {
      this.#triggerAbort = new AbortController();
      applyElementProps(triggerEl, this.#tooltip.triggerProps, { signal: this.#triggerAbort.signal });
      if (isLabelTrigger(triggerEl)) {
        this.#syncContent(triggerEl);
        triggerEl.$state.subscribe(() => this.#syncContent(triggerEl), { signal: this.#triggerAbort.signal });
        listen(triggerEl, HOTKEY_SHORTCUT_CHANGE_EVENT, () => this.#syncContent(triggerEl), { signal: this.#triggerAbort.signal });
      }
    }
  }
  #syncContent(triggerEl) {
    const label = triggerEl.getLabel();
    let resolved = isFunction(triggerEl.getResolvedLabel) ? triggerEl.getResolvedLabel() : void 0;
    if (resolved === void 0 && label) resolved = translateText(label, this.#i18n.value);
    const shortcut = triggerEl.getShortcut?.();
    let labelEl = TooltipLabelElement.findIn(this);
    let shortcutEl = TooltipShortcutElement.findIn(this);
    if (!labelEl && !shortcutEl) {
      if (this.#hostHasAuthoredTooltipContent()) return;
      labelEl = TooltipLabelElement.create();
      shortcutEl = TooltipShortcutElement.create();
      this.replaceChildren(labelEl, shortcutEl);
    }
    labelEl?.setSyncedText(resolved ?? "");
    shortcutEl?.setSyncedShortcut(shortcut);
  }
  #hostHasAuthoredTooltipContent() {
    return Array.from(this.childNodes).some((node) => !!node.textContent?.trim());
  }
  #cleanupTrigger() {
    this.#triggerAbort?.abort();
    this.#triggerAbort = null;
    this.#currentTrigger = null;
  }
};

// node_modules/@videojs/html/dist/default/define/ui/tooltip.js
safeDefine(TooltipElement);

// node_modules/@videojs/html/dist/default/define/ui/tooltip-label.js
safeDefine(TooltipLabelElement);

// node_modules/@videojs/html/dist/default/define/ui/tooltip-shortcut.js
safeDefine(TooltipShortcutElement);

// node_modules/@videojs/html/dist/default/ui/cast-button/element.js
var CastButtonElement = class extends MediaButtonElement {
  constructor(..._args) {
    super(..._args);
    this.core = new CastButtonCore();
    this.stateAttrMap = CastButtonDataAttrs;
    this.mediaState = new PlayerController(this, playerContext, selectRemotePlayback);
  }
  static {
    this.tagName = "media-cast-button";
  }
  activate(state) {
    return this.core.toggle(state);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/cast-button.js
safeDefine(CastButtonElement);

// node_modules/@videojs/html/dist/default/ui/pip-button/element.js
var PiPButtonElement = class extends MediaButtonElement {
  constructor(..._args) {
    super(..._args);
    this.core = new PiPButtonCore();
    this.stateAttrMap = PiPButtonDataAttrs;
    this.mediaState = new PlayerController(this, playerContext, selectPiP);
    this.hotkeyAction = "togglePictureInPicture";
  }
  static {
    this.tagName = "media-pip-button";
  }
  activate(state) {
    return this.core.toggle(state);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/pip-button.js
safeDefine(PiPButtonElement);

// node_modules/@videojs/html/dist/default/ui/fullscreen-button/element.js
var FullscreenButtonElement = class extends MediaButtonElement {
  constructor(..._args) {
    super(..._args);
    this.core = new FullscreenButtonCore();
    this.stateAttrMap = FullscreenButtonDataAttrs;
    this.mediaState = new PlayerController(this, playerContext, selectFullscreen);
    this.hotkeyAction = "toggleFullscreen";
    this.#container = new ContextConsumer(this, {
      context: containerContext,
      subscribe: true
    });
  }
  static {
    this.tagName = "media-fullscreen-button";
  }
  #container;
  activate(state, _event, source) {
    if (source === "pointer") this.#container.value?.container?.focus({ preventScroll: true });
    return this.core.toggle(state);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/fullscreen-button.js
safeDefine(FullscreenButtonElement);

// node_modules/@videojs/html/dist/default/ui/play-button/element.js
var PlayButtonElement = class extends MediaButtonElement {
  constructor(..._args) {
    super(..._args);
    this.core = new PlayButtonCore();
    this.stateAttrMap = PlayButtonDataAttrs;
    this.mediaState = new PlayerController(this, playerContext, selectPlayback);
    this.hotkeyAction = "togglePaused";
  }
  static {
    this.tagName = "media-play-button";
  }
  activate(state) {
    return this.core.toggle(state);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/play-button.js
safeDefine(PlayButtonElement);

// node_modules/@videojs/html/dist/default/ui/slider/context.js
var sliderContext = n(Symbol("@videojs/slider"));

// node_modules/@videojs/html/dist/default/ui/time-slider/element.js
var TimeSliderElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.label = "";
    this.changeThrottle = TimeSliderCore.defaultProps.changeThrottle;
    this.step = TimeSliderCore.defaultProps.step;
    this.largeStep = TimeSliderCore.defaultProps.largeStep;
    this.orientation = TimeSliderCore.defaultProps.orientation;
    this.disabled = TimeSliderCore.defaultProps.disabled;
    this.thumbAlignment = TimeSliderCore.defaultProps.thumbAlignment;
    this.pauseOnDrag = TimeSliderCore.defaultProps.pauseOnDrag;
    this.#core = new TimeSliderCore();
    this.#controlsState = new PlayerController(this, playerContext, selectControls);
    this.#provider = new i(this, { context: sliderContext });
    this.#timeState = new PlayerController(this, playerContext, selectTime);
    this.#bufferState = new PlayerController(this, playerContext, selectBuffer);
    this.#playbackState = new PlayerController(this, playerContext, selectPlayback);
    this.#seek = createTimeSliderSeek(SliderCSSVars.fill);
    this.#i18n = new I18nController(this, i18nContext);
    this.#cssVars = {};
    this.#slider = null;
    this.#disconnect = null;
    this.#releaseControlsLock = null;
  }
  static {
    this.tagName = "media-time-slider";
  }
  static {
    this.properties = {
      label: { type: String },
      changeThrottle: {
        type: Number,
        attribute: "change-throttle"
      },
      step: { type: Number },
      largeStep: {
        type: Number,
        attribute: "large-step"
      },
      orientation: { type: String },
      disabled: { type: Boolean },
      thumbAlignment: {
        type: String,
        attribute: "thumb-alignment"
      },
      pauseOnDrag: {
        type: Boolean,
        attribute: "pause-on-drag"
      }
    };
  }
  #core;
  #controlsState;
  #provider;
  #timeState;
  #bufferState;
  #playbackState;
  #seek;
  #i18n;
  #cssVars;
  #slider;
  #disconnect;
  #releaseControlsLock;
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
    this.#disconnect = new AbortController();
    const signal = this.#disconnect.signal;
    let dragSeekPercent;
    const seek = (percent) => {
      const media = this.#timeState.value;
      if (media) {
        const time = this.#core.rawValueFromPercent(percent);
        this.#seek.seek(percent);
        media.seek(time);
      }
    };
    this.#slider = createSlider({
      getElement: () => this,
      getThumbElement: () => this.querySelector("media-slider-thumb"),
      getOrientation: () => this.orientation,
      isDisabled: () => {
        const time = this.#timeState.value;
        const buffer = this.#bufferState.value;
        return this.disabled || !time || !hasTimeRange({
          ...time,
          ...buffer ?? {
            buffered: [],
            seekable: []
          }
        });
      },
      getPercent: () => {
        const media = this.#timeState.value;
        if (!media) return 0;
        return this.#core.percentFromValue(media.currentTime);
      },
      getStepPercent: () => this.#core.getStepPercent(),
      getLargeStepPercent: () => this.#core.getLargeStepPercent(),
      onValueChange: (percent) => {
        if (!this.#slider?.input.current.dragging || percent === dragSeekPercent) return;
        dragSeekPercent = percent;
        seek(percent);
      },
      onValueCommit: (percent) => {
        if (percent !== dragSeekPercent) seek(percent);
        dragSeekPercent = void 0;
      },
      changeThrottle: this.changeThrottle,
      onPressStart: () => {
        this.#releaseControlsLock ??= this.#controlsState.value?.requestControlsLock() ?? null;
      },
      onPressEnd: () => this.#releaseControlsVisibilityLock(),
      onDragStart: () => {
        this.#core.startDrag(this.#playbackState.value);
        this.dispatchEvent(new CustomEvent("drag-start", { bubbles: true }));
      },
      onDragEnd: () => {
        this.#core.endDrag(this.#playbackState.value);
        this.dispatchEvent(new CustomEvent("drag-end", { bubbles: true }));
      },
      adjustPercent: (raw, thumbSize, trackSize) => this.#core.adjustPercentForAlignment(raw, thumbSize, trackSize),
      onResize: () => {
        if (this.thumbAlignment === "edge") this.requestUpdate();
      }
    });
    applyElementProps(this, this.#slider.rootProps, { signal });
    applyStyles(this, this.#slider.rootStyle);
    this.#slider.input.subscribe(() => this.requestUpdate(), { signal });
    this.#seek.state.subscribe(() => this.requestUpdate(), { signal });
  }
  disconnectedCallback() {
    this.#disconnect?.abort();
    this.#disconnect = null;
    const slider = this.#slider;
    this.#slider = null;
    slider?.destroy();
    this.#releaseControlsVisibilityLock();
    this.#resumeIfDragPaused();
    this.#seek.destroy();
    super.disconnectedCallback();
  }
  destroyCallback() {
    this.#releaseControlsVisibilityLock();
    this.#resumeIfDragPaused();
    this.#seek.destroy();
    this.#slider?.destroy();
    super.destroyCallback();
  }
  #resumeIfDragPaused() {
    this.#core.endDrag(this.#playbackState.value);
  }
  #releaseControlsVisibilityLock() {
    this.#releaseControlsLock?.();
    this.#releaseControlsLock = null;
  }
  willUpdate(_changed) {
    super.willUpdate(_changed);
    this.#core.setProps({
      label: this.label,
      changeThrottle: this.changeThrottle,
      step: this.step,
      largeStep: this.largeStep,
      orientation: this.orientation,
      disabled: this.disabled,
      thumbAlignment: this.thumbAlignment,
      pauseOnDrag: this.pauseOnDrag
    });
    this.#core.setFormatLocale(this.#i18n.locale);
  }
  update(_changed) {
    super.update(_changed);
    if (!this.#slider) return;
    const time = this.#timeState.value;
    const buffer = this.#bufferState.value;
    if (!time) {
      this.#seek.destroy();
      this.removeAttribute("data-playing");
      return;
    }
    this.#core.setInput(this.#slider.input.current);
    const media = {
      ...time,
      ...buffer ?? {
        buffered: [],
        seekable: []
      }
    };
    this.#core.setMedia(media);
    const state = this.#core.getState();
    this.#seek.update(state.seeking, state.fillPercent, this);
    const percent = this.#seek.state.current.percent;
    this.toggleAttribute("data-playing", isMediaPlaying(this.#playbackState.value) && !state.disabled && !state.dragging && !state.seeking && percent === void 0);
    const fill = percent === void 0 || state.dragging || state.disabled ? state : {
      ...state,
      fillPercent: percent
    };
    const cssVars = getTimeSliderCSSVars(this.#slider.adjustForAlignment(fill));
    const styles = Object.fromEntries(Object.entries(cssVars).filter(([name, value]) => this.#cssVars[name] !== value));
    applyStyles(this, styles);
    this.#cssVars = cssVars;
    const thumbAttrs = this.#core.getAttrs(state);
    applyStateDataAttrs(this, state, TimeSliderDataAttrs);
    this.#provider.setValue({
      state,
      stateAttrMap: TimeSliderDataAttrs,
      pointerValue: this.#core.rawValueFromPercent(state.pointerPercent),
      thumbAttrs: {
        ...thumbAttrs,
        "aria-label": translateText(thumbAttrs["aria-label"], this.#i18n.value),
        "aria-valuetext": translateText(thumbAttrs["aria-valuetext"], this.#i18n.value, this.#core.getValueTextParams(state))
      },
      thumbProps: this.#slider.thumbProps,
      formatValue: (value) => formatTime(value, state.duration, { locale: this.#i18n.locale })
    });
  }
};

// node_modules/@videojs/html/dist/default/define/ui/time-slider.js
safeDefine(TimeSliderElement);

// node_modules/@videojs/html/dist/default/ui/time-slider/chapters.js
var TimeSliderChaptersElement = class extends UIElement {
  static {
    this.tagName = "media-time-slider-chapters";
  }
  #segments = new SliderSegmentsCore();
  #core = new TimeSliderChaptersCore();
  #slider = new ContextConsumer(this, {
    context: sliderContext,
    subscribe: true
  });
  #textTrack = new PlayerController(this, playerContext, selectTextTrack);
  #buffer = new PlayerController(this, playerContext, selectBuffer);
  #time = new PlayerController(this, playerContext, selectTime);
  #rendered = /* @__PURE__ */ new Map();
  #templateRoot = null;
  #templateChecked = false;
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("aria-hidden", "true");
  }
  update(_changed) {
    super.update(_changed);
    const slider = this.#slider.value;
    const duration = slider?.state.max ?? 0, min = slider?.state.min ?? 0;
    const templateRoot = this.#getTemplateRoot();
    if (!slider) return;
    applyStateDataAttrs(this, slider.state, slider.stateAttrMap);
    if (!templateRoot) return;
    const { chapters, ranges, max } = this.#core.getRanges(this.#textTrack.value?.chaptersCues ?? [], min, duration);
    const geometry = this.#segments.getGeometry({
      ranges,
      min,
      max,
      orientation: slider.state.orientation
    });
    const buffered = this.#buffer.value?.buffered ?? [];
    const bufferedEnd = buffered.length ? buffered[buffered.length - 1][1] : 0;
    const next = /* @__PURE__ */ new Map();
    for (const segment of geometry) {
      const state = this.#core.getState(this.#segments.getState(segment, slider.state, slider.pointerValue), chapters, bufferedEnd);
      let root = this.#rendered.get(state.key);
      if (!root) root = cloneTemplateRoot(templateRoot, this.ownerDocument);
      this.#setStyle(root, "pointer-events", state.cue ? void 0 : "none");
      this.#setStyle(root, TimeSliderChapterCSSVars.start, state.startPercent);
      this.#setStyle(root, TimeSliderChapterCSSVars.end, state.endPercent);
      this.#setStyle(root, TimeSliderChapterCSSVars.width, state.width ?? state.height);
      this.#setStyle(root, TimeSliderChapterCSSVars.fill, `${state.fillPercent}%`);
      this.#setStyle(root, TimeSliderChapterCSSVars.buffer, `${state.bufferPercent}%`);
      applyStateDataAttrs(root, slider.state, slider.stateAttrMap);
      applyStateDataAttrs(root, state, TimeSliderChapterDataAttrs);
      next.set(state.key, root);
    }
    for (const [key, root] of this.#rendered) if (!next.has(key)) root.remove();
    let before = null;
    for (const root of [...next.values()].reverse()) {
      if (root.parentNode !== this || root.nextSibling !== before) this.insertBefore(root, before);
      before = root;
    }
    this.#rendered.clear();
    for (const [key, rendered] of next) this.#rendered.set(key, rendered);
  }
  #getTemplateRoot() {
    if (this.#templateChecked) return this.#templateRoot;
    const template3 = getTemplateElement(this);
    if (!template3) {
      for (const node of [...this.childNodes]) node.remove();
      return null;
    }
    this.#templateChecked = true;
    const root = getTemplateRoot(template3);
    for (const node of [...this.childNodes]) if (node !== template3) node.remove();
    if (root?.namespaceURI !== "http://www.w3.org/1999/xhtml") return null;
    this.#templateRoot = root;
    return this.#templateRoot;
  }
  #setStyle(element, name, value) {
    if (value === void 0) element.style.removeProperty(name);
    else element.style.setProperty(name, value);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/time-slider-chapters.js
safeDefine(TimeSliderChaptersElement);

// node_modules/@videojs/html/dist/default/ui/slider/track.js
var SliderTrackElement = class extends ContextPartElement {
  constructor(..._args) {
    super(..._args);
    this.consumer = new ContextConsumer(this, {
      context: sliderContext,
      subscribe: true
    });
  }
  static {
    this.tagName = "media-slider-track";
  }
};

// node_modules/@videojs/html/dist/default/define/ui/slider-track.js
safeDefine(SliderTrackElement);

// node_modules/@videojs/html/dist/default/ui/slider/buffer.js
var SliderBufferElement = class extends ContextPartElement {
  constructor(..._args) {
    super(..._args);
    this.consumer = new ContextConsumer(this, {
      context: sliderContext,
      subscribe: true
    });
  }
  static {
    this.tagName = "media-slider-buffer";
  }
};

// node_modules/@videojs/html/dist/default/define/ui/slider-buffer.js
safeDefine(SliderBufferElement);

// node_modules/@videojs/html/dist/default/ui/slider/fill.js
var SliderFillElement = class extends ContextPartElement {
  constructor(..._args) {
    super(..._args);
    this.consumer = new ContextConsumer(this, {
      context: sliderContext,
      subscribe: true
    });
  }
  static {
    this.tagName = "media-slider-fill";
  }
};

// node_modules/@videojs/html/dist/default/define/ui/slider-fill.js
safeDefine(SliderFillElement);

// node_modules/@videojs/html/dist/default/ui/slider/thumb.js
var SliderThumbElement = class extends UIElement {
  static {
    this.tagName = "media-slider-thumb";
  }
  #ctx = new ContextConsumer(this, {
    context: sliderContext,
    subscribe: true
  });
  #disconnect = null;
  #thumbPropsApplied = false;
  connectedCallback() {
    super.connectedCallback();
    this.#disconnect = new AbortController();
    this.#thumbPropsApplied = false;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = null;
    this.#thumbPropsApplied = false;
  }
  update(_changed) {
    super.update(_changed);
    const ctx = this.#ctx.value;
    if (!ctx) return;
    if (!this.#thumbPropsApplied && this.#disconnect) {
      applyElementProps(this, ctx.thumbProps, { signal: this.#disconnect.signal });
      this.#thumbPropsApplied = true;
    }
    applyElementProps(this, ctx.thumbAttrs);
    applyStateDataAttrs(this, ctx.state, ctx.stateAttrMap);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/slider-thumb.js
safeDefine(SliderThumbElement);

// node_modules/@videojs/html/dist/default/ui/slider/preview.js
var SliderPreviewElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.overflow = "clamp";
    this.#ctx = new ContextConsumer(this, {
      context: sliderContext,
      subscribe: true
    });
    this.#stopObservingResize = null;
    this.#width = 0;
  }
  static {
    this.tagName = "media-slider-preview";
  }
  static {
    this.properties = { overflow: { type: String } };
  }
  #ctx;
  #stopObservingResize;
  #width;
  connectedCallback() {
    super.connectedCallback();
    this.#stopObservingResize = observeResize(this, ([entry]) => {
      this.#width = entry.contentRect.width;
      this.#applyPosition();
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#stopObservingResize?.();
    this.#stopObservingResize = null;
  }
  #applyPosition() {
    applyStyles(this, getSliderPreviewStyle(this.#width, this.overflow));
  }
  update(_changed) {
    super.update(_changed);
    const ctx = this.#ctx.value;
    if (ctx) applyStateDataAttrs(this, ctx.state, ctx.stateAttrMap);
    this.#applyPosition();
  }
};

// node_modules/@videojs/html/dist/default/define/ui/slider-preview.js
safeDefine(SliderPreviewElement);

// node_modules/@videojs/html/dist/default/ui/thumbnail/element.js
var SHADOW_CSS2 = `:host {
  display: inline-block;
  overflow: hidden;
}
img,
::slotted(img) {
  display: block;
}`;
var IMAGE_ATTRIBUTES = [
  "crossorigin",
  "loading",
  "fetchpriority"
];
function createFallbackImage2() {
  const img = document.createElement("img");
  img.alt = "";
  img.setAttribute("part", "image");
  img.setAttribute("aria-hidden", "true");
  img.setAttribute("decoding", "async");
  return img;
}
var ThumbnailElement = class extends UIElement {
  static {
    this.tagName = "media-thumbnail";
  }
  static {
    this.properties = {
      time: { type: Number },
      crossOrigin: {
        type: String,
        attribute: "crossorigin"
      },
      loading: { type: String },
      fetchPriority: {
        type: String,
        attribute: "fetchpriority"
      }
    };
  }
  #core;
  #shadow;
  #fallback;
  #children;
  #imageAttributes;
  #textTracks;
  #slots;
  #img;
  /** Attributes `#img` already carried when adopted, which the author owns. */
  #authored;
  #thumbnails;
  #externalThumbnails;
  #lastTextTrack;
  #api;
  constructor() {
    super();
    this.time = 0;
    this.#core = new ThumbnailCore();
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#fallback = createFallbackImage2();
    this.#children = new MutationObserver(() => this.requestUpdate());
    this.#imageAttributes = new MutationObserver(() => this.requestUpdate());
    this.#textTracks = new PlayerController(this, playerContext, selectTextTrack);
    this.#slots = null;
    this.#img = null;
    this.#authored = /* @__PURE__ */ new Set();
    this.#thumbnails = [];
    this.#api = null;
    const style = document.createElement("style");
    style.textContent = SHADOW_CSS2;
    this.#shadow.append(style, document.createElement("slot"), this.#fallback);
  }
  /**
  * Set thumbnail images directly, bypassing the automatic `<track>` detection. When set, this takes priority over the
  * text track path.
  */
  get thumbnails() {
    return this.#externalThumbnails;
  }
  set thumbnails(value) {
    this.#externalThumbnails = value;
    this.requestUpdate();
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
    this.#api = createThumbnail({
      getContainer: () => this,
      getImg: () => this.#img,
      onStateChange: () => this.requestUpdate()
    });
    this.#children.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "srcset"]
    });
    this.#slots = new AbortController();
    listen(this, "slotchange", () => this.requestUpdate(), { signal: this.#slots.signal });
    this.requestUpdate();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#adopt(null);
    this.#children.disconnect();
    this.#slots?.abort();
    this.#slots = null;
    this.#api?.destroy();
    this.#api = null;
  }
  destroyCallback() {
    this.#api?.destroy();
    super.destroyCallback();
  }
  update(changed) {
    super.update(changed);
    const textTrack = this.#textTracks.value;
    if (this.#externalThumbnails) this.#thumbnails = this.#externalThumbnails;
    else if (textTrack !== this.#lastTextTrack) {
      this.#lastTextTrack = textTrack;
      const thumbnailsTrack = textTrack?.thumbnailsTrack;
      this.#thumbnails = thumbnailsTrack && thumbnailsTrack.cues.length > 0 ? mapCuesToThumbnails(thumbnailsTrack.cues, thumbnailsTrack.src ?? void 0) : [];
    }
    const thumbnail = this.#core.findActiveThumbnail(this.#thumbnails, this.time);
    const img = findComposedElement(this, isHTMLImageElement) ?? this.#fallback;
    this.#adopt(img);
    this.#applyImageAttributes(img, textTrack);
    this.#api?.updateSrc(thumbnail?.url);
    this.#applySource(thumbnail?.url);
    this.#api?.connect();
    if (!thumbnail) {
      this.#resetStyles();
      const state2 = this.#core.getState(false, false, void 0);
      applyElementProps(this, this.#core.getAttrs(state2));
      applyStateDataAttrs(this, state2, ThumbnailDataAttrs);
      return;
    }
    const api = this.#api;
    const state = this.#core.getState(api?.loading ?? false, api?.error ?? false, thumbnail);
    applyElementProps(this, this.#core.getAttrs(state));
    applyStateDataAttrs(this, state, ThumbnailDataAttrs);
    if (api?.naturalWidth && api.naturalHeight) {
      const constraints = api.readConstraints();
      const result = this.#core.resize(thumbnail, api.naturalWidth, api.naturalHeight, constraints);
      if (result) this.#applyResize(result);
    }
  }
  /**
  * Leaving `crossOrigin` unset means "follow the media component", so thumbnails keep working on a CORS-enabled player
  * without a skin having to thread an attribute through. Only the `<track>` path inherits: `thumbnails` set directly
  * may point at a host that has nothing to do with the media component.
  */
  #inheritedCrossOrigin(textTrack) {
    return this.#externalThumbnails ? void 0 : textTrack?.thumbnailsTrack?.crossOrigin;
  }
  /** Sync image attributes from element properties, leaving the ones the author put on the image alone. */
  #applyImageAttributes(img, textTrack) {
    const props = {
      crossorigin: this.#core.resolveCrossOrigin(this.crossOrigin, this.#inheritedCrossOrigin(textTrack)),
      loading: this.loading,
      fetchpriority: this.fetchPriority
    };
    for (const name of this.#authored) delete props[name];
    applyElementProps(img, props);
  }
  #applyResize(result) {
    this.style.width = `${result.containerWidth}px`;
    this.style.height = `${result.containerHeight}px`;
    const imgStyle = this.#img?.style;
    if (!imgStyle) return;
    imgStyle.width = `${result.imageWidth}px`;
    imgStyle.height = `${result.imageHeight}px`;
    imgStyle.maxWidth = "none";
    imgStyle.transform = result.offsetX || result.offsetY ? `translate(-${result.offsetX}px, -${result.offsetY}px)` : "";
  }
  #resetStyles() {
    this.style.width = "";
    this.style.height = "";
    const imgStyle = this.#img?.style;
    if (!imgStyle) return;
    imgStyle.width = "";
    imgStyle.height = "";
    imgStyle.maxWidth = "";
    imgStyle.transform = "";
  }
  #adopt(next) {
    if (next === this.#img) return;
    const previous = this.#img;
    if (previous) {
      this.#api?.disconnectImg(previous);
      this.#resetStyles();
      previous.removeAttribute("src");
      previous.removeAttribute("srcset");
      for (const name of IMAGE_ATTRIBUTES) if (!this.#authored.has(name)) previous.removeAttribute(name);
    }
    this.#img = next;
    this.#authored = new Set(next ? IMAGE_ATTRIBUTES.filter((name) => next.hasAttribute(name)) : []);
    this.#imageAttributes.disconnect();
    if (next && next !== this.#fallback) this.#imageAttributes.observe(next, {
      attributes: true,
      attributeFilter: ["src", "srcset"]
    });
    if (next === this.#fallback) this.#shadow.append(this.#fallback);
    else if (next) this.#fallback.remove();
    this.#api?.updateSrc(void 0);
  }
  #applySource(src) {
    const img = this.#img;
    if (!img) return;
    img.removeAttribute("srcset");
    if (!src) img.removeAttribute("src");
    else if (img.getAttribute("src") !== src) img.setAttribute("src", src);
  }
};

// node_modules/@videojs/html/dist/default/ui/slider/thumbnail.js
var SliderThumbnailElement = class extends ThumbnailElement {
  static {
    this.tagName = "media-slider-thumbnail";
  }
  #ctx = new ContextConsumer(this, {
    context: sliderContext,
    subscribe: true
  });
  update(changed) {
    const ctx = this.#ctx.value;
    if (ctx) this.time = ctx.pointerValue;
    super.update(changed);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/slider-thumbnail.js
safeDefine(SliderThumbnailElement);

// node_modules/@videojs/html/dist/default/ui/slider/value.js
var SliderValueElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.type = "current";
    this.#ctx = new ContextConsumer(this, {
      context: sliderContext,
      subscribe: true
    });
  }
  static {
    this.tagName = "media-slider-value";
  }
  static {
    this.properties = { type: { type: String } };
  }
  #ctx;
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("aria-live", "off");
  }
  update(_changed) {
    super.update(_changed);
    const ctx = this.#ctx.value;
    if (!ctx) return;
    const value = this.type === "pointer" ? ctx.pointerValue : ctx.state.value;
    this.textContent = ctx.formatValue ? ctx.formatValue(value, this.type) : String(Math.round(value));
    applyStateDataAttrs(this, ctx.state, ctx.stateAttrMap);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/slider-value.js
safeDefine(SliderValueElement);

// node_modules/@videojs/html/dist/default/ui/time-slider/chapter-title.js
var TimeSliderChapterTitleElement = class extends UIElement {
  static {
    this.tagName = "media-time-slider-chapter-title";
  }
  #core = new TimeSliderChaptersCore();
  #slider = new ContextConsumer(this, {
    context: sliderContext,
    subscribe: true
  });
  #textTrack = new PlayerController(this, playerContext, selectTextTrack);
  #time = new PlayerController(this, playerContext, selectTime);
  update(_changed) {
    super.update(_changed);
    const slider = this.#slider.value;
    if (!slider) return;
    const duration = this.#time.value?.duration ?? 0;
    const { chapters } = this.#core.getRanges(this.#textTrack.value?.chaptersCues ?? [], 0, duration);
    const keyboard = slider.state.interactive && !slider.state.pointing && !slider.state.dragging;
    const value = slider.state.pointing || slider.state.dragging ? slider.pointerValue : slider.state.value;
    const chapter = this.#core.findChapter(chapters, value);
    this.textContent = chapter?.cue?.text ?? "";
    if (keyboard) {
      this.removeAttribute("aria-hidden");
      this.setAttribute("aria-live", "polite");
    } else {
      this.setAttribute("aria-hidden", "true");
      this.removeAttribute("aria-live");
    }
  }
};

// node_modules/@videojs/html/dist/default/define/ui/time-slider-chapter-title.js
safeDefine(TimeSliderChapterTitleElement);

// node_modules/@videojs/html/dist/default/ui/mute-button/element.js
var MuteButtonElement = class extends MediaButtonElement {
  constructor(..._args) {
    super(..._args);
    this.core = new MuteButtonCore();
    this.stateAttrMap = MuteButtonDataAttrs;
    this.mediaState = new PlayerController(this, playerContext, selectVolume);
    this.hotkeyAction = "toggleMuted";
  }
  static {
    this.tagName = "media-mute-button";
  }
  activate(state) {
    this.core.toggle(state);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/mute-button.js
safeDefine(MuteButtonElement);

// node_modules/@videojs/html/dist/default/ui/popover/element.js
var PopoverElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.open = PopoverCore.defaultProps.open;
    this.defaultOpen = PopoverCore.defaultProps.defaultOpen;
    this.side = PopoverCore.defaultProps.side;
    this.align = PopoverCore.defaultProps.align;
    this.modal = PopoverCore.defaultProps.modal;
    this.closeOnEscape = PopoverCore.defaultProps.closeOnEscape;
    this.closeOnOutsideClick = PopoverCore.defaultProps.closeOnOutsideClick;
    this.openOnHover = PopoverCore.defaultProps.openOnHover;
    this.delay = PopoverCore.defaultProps.delay;
    this.closeDelay = PopoverCore.defaultProps.closeDelay;
    this.boundary = "container";
    this.#core = new PopoverCore();
    this.#containerCtx = new ContextConsumer(this, {
      context: containerContext,
      subscribe: true
    });
    this.#popupGroupCtx = new ContextConsumer(this, { context: popupGroupContext });
    this.#position = new PositionController(this);
    this.#popover = null;
    this.#snapshot = null;
    this.#disconnect = null;
    this.#triggerAbort = null;
    this.#currentTrigger = null;
  }
  static {
    this.tagName = "media-popover";
  }
  static {
    this.properties = {
      open: { type: Boolean },
      defaultOpen: {
        type: Boolean,
        attribute: "default-open"
      },
      side: { type: String },
      align: { type: String },
      modal: { type: Boolean },
      closeOnEscape: {
        type: Boolean,
        attribute: "close-on-escape"
      },
      closeOnOutsideClick: {
        type: Boolean,
        attribute: "close-on-outside-click"
      },
      openOnHover: {
        type: Boolean,
        attribute: "open-on-hover"
      },
      delay: { type: Number },
      closeDelay: {
        type: Number,
        attribute: "close-delay"
      },
      boundary: { type: String }
    };
  }
  #core;
  #containerCtx;
  #popupGroupCtx;
  #position;
  #popover;
  #snapshot;
  #disconnect;
  #triggerAbort;
  #currentTrigger;
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
    this.setAttribute(POPUP_HOST_ATTR, "");
    this.#disconnect = new AbortController();
    this.#popover = createPopover({
      transition: createTransition(),
      onOpenChange: (nextOpen, details) => {
        this.open = nextOpen;
        this.dispatchEvent(new CustomEvent("open-change", { detail: {
          open: nextOpen,
          ...details
        } }));
      },
      closeOnEscape: () => this.closeOnEscape,
      closeOnOutsideClick: () => this.closeOnOutsideClick,
      openOnHover: () => this.openOnHover,
      delay: () => this.delay,
      closeDelay: () => this.closeDelay,
      group: () => this.#popupGroupCtx.value
    });
    this.#popover.setPopupElement(this);
    applyElementProps(this, this.#popover.popupProps, { signal: this.#disconnect.signal });
    if (this.#snapshot) this.#snapshot.track(this.#popover.input);
    else this.#snapshot = new SnapshotController(this, this.#popover.input);
  }
  firstUpdated(changed) {
    super.firstUpdated(changed);
    if (this.defaultOpen && !this.open) this.#popover?.open();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
  destroyCallback() {
    this.#cleanupTrigger();
    this.#popover?.destroy();
    super.destroyCallback();
  }
  close(reason = "imperative-action") {
    this.#popover?.close(reason);
  }
  get triggerElement() {
    return this.#currentTrigger;
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    this.#core.setProps(this);
    if (this.#popover && changed.has("open")) {
      const { active: interactionOpen } = this.#popover.input.current;
      if (this.open !== interactionOpen) {
        if (this.open) this.#popover.open();
        else this.#popover.close();
      }
    }
  }
  update(_changed) {
    super.update(_changed);
    if (!this.#popover) return;
    const triggerEl = this.#position.findTrigger();
    this.#syncTrigger(triggerEl);
    const input = this.#popover.input.current;
    this.#core.setInput(input);
    const state = this.#core.getState();
    applyElementProps(this, this.#core.getPopupAttrs(state));
    applyStateDataAttrs(this, state, PopoverDataAttrs);
    if (state.open) tryShowPopover(this);
    else tryHidePopover(this);
    if (this.#currentTrigger) applyElementProps(this.#currentTrigger, this.#core.getTriggerAttrs(state, this.id));
    if (!state.open) {
      this.#position.cleanup();
      return;
    }
    this.#position.sync({
      anchorName: this.id,
      position: {
        side: state.side,
        align: state.align
      },
      trigger: this.#currentTrigger,
      boundary: this.boundary,
      container: this.#containerCtx.value?.container ?? null,
      onSideChange: (side) => this.setAttribute(PopoverDataAttrs.side, side)
    });
  }
  #syncTrigger(triggerEl) {
    if (triggerEl === this.#currentTrigger) return;
    this.#position.cleanup();
    this.#cleanupTrigger();
    this.#currentTrigger = triggerEl;
    this.#popover?.setTriggerElement(triggerEl);
    if (triggerEl && this.#popover) {
      this.#triggerAbort = new AbortController();
      applyElementProps(triggerEl, this.#popover.triggerProps, { signal: this.#triggerAbort.signal });
    }
  }
  #cleanupTrigger() {
    if (this.#currentTrigger) applyElementProps(this.#currentTrigger, {
      "aria-expanded": void 0,
      "aria-haspopup": void 0,
      "aria-controls": void 0
    });
    this.#triggerAbort?.abort();
    this.#triggerAbort = null;
    this.#currentTrigger = null;
  }
};

// node_modules/@videojs/html/dist/default/ui/volume-popover/element.js
var unavailableVolume = {
  volume: 0,
  muted: false,
  volumeAvailability: "unsupported",
  mutedAvailability: "unsupported",
  setVolume: () => 0,
  setMuted: () => false
};
var VolumePopoverElement = class extends PopoverElement {
  static {
    this.tagName = "media-volume-popover";
  }
  #core = new VolumePopoverCore();
  #volume = new PlayerController(this, playerContext, selectVolume);
  update(changed) {
    super.update(changed);
    this.#core.setProps(this);
    this.#core.setInput({
      active: this.hasAttribute("data-open"),
      status: this.hasAttribute("data-starting-style") ? "starting" : this.hasAttribute("data-ending-style") ? "ending" : "idle"
    });
    this.#core.setMedia(this.#volume.value ?? unavailableVolume);
    const state = this.#core.getState();
    applyStateDataAttrs(this, state, VolumePopoverDataAttrs);
    this.hidden = state.hidden;
    if (state.hidden) {
      this.close();
      if (this.triggerElement) applyElementProps(this.triggerElement, {
        "aria-expanded": void 0,
        "aria-haspopup": void 0,
        "aria-controls": void 0
      });
    }
  }
};

// node_modules/@videojs/html/dist/default/define/ui/volume-popover.js
safeDefine(VolumePopoverElement);

// node_modules/@videojs/html/dist/default/ui/volume-slider/element.js
var VolumeSliderElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.label = "";
    this.step = VolumeSliderCore.defaultProps.step;
    this.largeStep = VolumeSliderCore.defaultProps.largeStep;
    this.wheelStep = VolumeSliderCore.defaultProps.wheelStep;
    this.orientation = VolumeSliderCore.defaultProps.orientation;
    this.disabled = VolumeSliderCore.defaultProps.disabled;
    this.thumbAlignment = VolumeSliderCore.defaultProps.thumbAlignment;
    this.#core = new VolumeSliderCore();
    this.#controlsState = new PlayerController(this, playerContext, selectControls);
    this.#provider = new i(this, { context: sliderContext });
    this.#volumeState = new PlayerController(this, playerContext, selectVolume);
    this.#i18n = new I18nController(this, i18nContext);
    this.#slider = null;
    this.#disconnect = null;
    this.#releaseControlsLock = null;
  }
  static {
    this.tagName = "media-volume-slider";
  }
  static {
    this.properties = {
      label: { type: String },
      step: { type: Number },
      largeStep: {
        type: Number,
        attribute: "large-step"
      },
      wheelStep: {
        type: Number,
        attribute: "wheel-step"
      },
      orientation: { type: String },
      disabled: { type: Boolean },
      thumbAlignment: {
        type: String,
        attribute: "thumb-alignment"
      }
    };
  }
  #core;
  #controlsState;
  #provider;
  #volumeState;
  #i18n;
  #slider;
  #disconnect;
  #releaseControlsLock;
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
    this.#disconnect = new AbortController();
    const signal = this.#disconnect.signal;
    const isDisabled = () => {
      const volume = this.#volumeState.value;
      return this.disabled || !volume || volume.volumeAvailability !== "available";
    };
    const getPercent = () => (this.#volumeState.value?.volume ?? 0) * 100;
    const getStepPercent = () => this.#core.getStepPercent();
    const setVolume = (percent) => this.#setVolume(percent);
    this.#slider = createSlider({
      getElement: () => this,
      getThumbElement: () => this.querySelector("media-slider-thumb"),
      getOrientation: () => this.orientation,
      isDisabled,
      getPercent,
      getStepPercent,
      getLargeStepPercent: () => this.#core.getLargeStepPercent(),
      onValueChange: setVolume,
      onValueCommit: setVolume,
      onPressStart: () => {
        this.#releaseControlsLock ??= this.#controlsState.value?.requestControlsLock() ?? null;
      },
      onPressEnd: () => this.#releaseControlsVisibilityLock(),
      onDragStart: () => {
        this.dispatchEvent(new CustomEvent("drag-start", { bubbles: true }));
      },
      onDragEnd: () => {
        this.dispatchEvent(new CustomEvent("drag-end", { bubbles: true }));
      },
      adjustPercent: (raw, thumbSize, trackSize) => this.#core.adjustPercentForAlignment(raw, thumbSize, trackSize),
      onResize: () => {
        if (this.thumbAlignment === "edge") this.requestUpdate();
      }
    });
    const wheelProps = createWheelStep({
      isDisabled,
      getPercent,
      getStepPercent: () => this.#core.getWheelStepPercent(),
      onValueChange: (percent) => this.#volumeState.value?.setVolume(this.#core.rawValueFromPercent(percent) / 100)
    });
    applyElementProps(this, this.#slider.rootProps, { signal });
    applyElementProps(this, wheelProps, { signal });
    applyStyles(this, this.#slider.rootStyle);
    this.#slider.input.subscribe(() => this.requestUpdate(), { signal });
  }
  disconnectedCallback() {
    this.#disconnect?.abort();
    this.#disconnect = null;
    const slider = this.#slider;
    this.#slider = null;
    slider?.destroy();
    this.#releaseControlsVisibilityLock();
    super.disconnectedCallback();
  }
  destroyCallback() {
    this.#releaseControlsVisibilityLock();
    this.#slider?.destroy();
    super.destroyCallback();
  }
  #releaseControlsVisibilityLock() {
    this.#releaseControlsLock?.();
    this.#releaseControlsLock = null;
  }
  willUpdate(_changed) {
    super.willUpdate(_changed);
    this.#core.setProps(this);
    this.#core.setFormatLocale(this.#i18n.locale);
  }
  update(_changed) {
    super.update(_changed);
    if (!this.#slider) return;
    const media = this.#volumeState.value;
    if (!media) return;
    this.#core.setInput(this.#slider.input.current);
    this.#core.setMedia(media);
    const state = this.#core.getState();
    const cssVars = getSliderCSSVars(this.#slider.adjustForAlignment(state));
    const thumbAttrs = this.#core.getAttrs(state);
    applyStyles(this, cssVars);
    applyStateDataAttrs(this, state, VolumeSliderDataAttrs);
    applyElementProps(this, { hidden: state.hidden ? "" : void 0 });
    this.#provider.setValue({
      state,
      stateAttrMap: VolumeSliderDataAttrs,
      pointerValue: this.#core.valueFromPercent(state.pointerPercent),
      thumbAttrs: {
        ...thumbAttrs,
        "aria-label": translateText(thumbAttrs["aria-label"], this.#i18n.value),
        "aria-valuetext": translateText(thumbAttrs["aria-valuetext"], this.#i18n.value, this.#core.getValueTextParams(state))
      },
      thumbProps: this.#slider.thumbProps,
      formatValue: (value) => `${Math.round(value)}%`
    });
  }
  #setVolume(percent) {
    this.#volumeState.value?.setVolume(this.#core.valueFromPercent(percent) / 100);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/volume-slider.js
safeDefine(VolumeSliderElement);

// node_modules/@videojs/html/dist/default/ui/time/element.js
var TimeElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.type = TimeCore.defaultProps.type;
    this.negativeSign = TimeCore.defaultProps.negativeSign;
    this.label = "";
    this.toggle = TimeCore.defaultProps.toggle;
    this.#core = new TimeCore();
    this.#state = new PlayerController(this, playerContext, selectTime);
    this.#buffer = new PlayerController(this, playerContext, selectBuffer);
    this.#i18n = new I18nController(this, i18nContext);
    this.#signSpan = document.createElement("span");
    this.#textNode = new Text();
    this.#disconnect = null;
    this.#listening = false;
    this.#activeType = TimeCore.defaultProps.type;
    this.#handleClick = (event) => {
      if (event.defaultPrevented || !this.toggle || !this.#state.value || !this.#hasTimeRange()) return;
      this.#toggleType();
    };
    this.#handleKeyDown = (event) => {
      if (event.defaultPrevented || !isInteractiveActivation(event)) return;
      if (!this.toggle || !this.#state.value || !this.#hasTimeRange()) return;
      event.preventDefault();
      if (event.repeat) return;
      this.#toggleType();
    };
  }
  static {
    this.tagName = "media-time";
  }
  static {
    this.properties = {
      type: { type: String },
      negativeSign: {
        type: String,
        attribute: "negative-sign"
      },
      label: { type: String },
      toggle: { type: Boolean }
    };
  }
  #core;
  #state;
  #buffer;
  #i18n;
  #signSpan;
  #textNode;
  #disconnect;
  #listening;
  #activeType;
  connectedCallback() {
    super.connectedCallback();
    this.#disconnect = new AbortController();
    this.#syncListeners();
    if (!this.#signSpan.parentNode) {
      this.#signSpan.setAttribute("aria-hidden", "true");
      this.#signSpan.hidden = true;
      this.append(this.#signSpan, this.#textNode);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#disconnect?.abort();
    this.#disconnect = null;
    this.#listening = false;
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    if (changed.has("type") || changed.has("toggle")) this.#activeType = this.type;
  }
  update(changed) {
    super.update(changed);
    if (changed.has("toggle")) this.#syncListeners();
    const media = this.#state.value;
    if (!media) {
      this.#clearAttrs();
      return;
    }
    this.#core.setProps({
      type: this.toggle ? this.#activeType : this.type,
      negativeSign: this.negativeSign,
      label: this.label,
      toggle: this.toggle
    });
    this.#core.setMedia({
      ...media,
      seekable: this.#buffer.value?.seekable ?? []
    });
    this.#core.setFormatLocale(this.#i18n.locale);
    const state = this.#core.getState();
    this.#signSpan.hidden = !state.negative;
    this.#signSpan.textContent = state.negative ? this.negativeSign : "";
    this.#textNode.textContent = state.text;
    const attrs = this.#core.getAttrs(state, this.type);
    const label = translateText(attrs["aria-label"], this.#i18n.value, this.#getLabelParams(state));
    const description = attrs["aria-description"] ? translateText(attrs["aria-description"], this.#i18n.value) : void 0;
    applyElementProps(this, {
      "aria-label": label,
      "aria-description": description,
      "aria-disabled": attrs["aria-disabled"],
      role: this.toggle ? attrs.role : "time",
      tabIndex: attrs.tabIndex,
      datetime: this.toggle || state.unavailable ? void 0 : state.datetime
    });
    applyStateDataAttrs(this, state, TimeDataAttrs);
  }
  #getLabelParams(state) {
    if (!this.#core.getLabelParams(state)) return void 0;
    const duration = formatTimeAsPhrase(Math.abs(state.seconds), { locale: this.#i18n.locale });
    const text = {
      current: elapsedSuffixText,
      duration: durationSuffixText,
      remaining: remainingSuffixText
    }[state.type];
    return { duration: translateText(text, this.#i18n.value, { duration }) };
  }
  #handleClick;
  #handleKeyDown;
  #toggleType() {
    if (this.type === "current") this.#activeType = this.#activeType === "remaining" ? "current" : "remaining";
    else this.#activeType = this.#activeType === "duration" ? "remaining" : "duration";
    this.requestUpdate();
  }
  #hasTimeRange() {
    const media = this.#state.value;
    if (!media) return false;
    return hasTimeRange({
      ...media,
      seekable: this.#buffer.value?.seekable ?? []
    });
  }
  #syncListeners() {
    if (!this.toggle || !this.#disconnect || this.#listening) return;
    this.#listening = true;
    applyElementProps(this, {
      onClick: this.#handleClick,
      onKeyDown: this.#handleKeyDown
    }, { signal: this.#disconnect.signal });
  }
  #clearAttrs() {
    applyElementProps(this, {
      "aria-label": void 0,
      "aria-description": void 0,
      "aria-disabled": void 0,
      role: void 0,
      tabIndex: void 0,
      datetime: void 0,
      "data-type": void 0,
      "data-disabled": void 0,
      "data-unavailable": void 0
    });
  }
};

// node_modules/@videojs/html/dist/default/define/ui/time.js
safeDefine(TimeElement);

// node_modules/@videojs/html/dist/default/ui/command-for.js
function toggleCommandTarget(host, commandfor) {
  const root = host.getRootNode();
  const target = ("getElementById" in root ? root.getElementById(commandfor) : null) ?? root.querySelector(`#${CSS.escape(commandfor)}`);
  if (!target || !("open" in target)) return;
  const popup = target;
  popup.open = !popup.open;
}

// node_modules/@videojs/html/dist/default/ui/captions-button/element.js
function getCaptionTrackCount2(state) {
  return state.textTrackList.filter(isCaptionOrSubtitleTrack).length;
}
var CaptionsButtonElement = class extends MediaButtonElement {
  constructor(..._args) {
    super(..._args);
    this.commandfor = void 0;
    this.menuFor = void 0;
    this.#defaultCommandfor = void 0;
    this.core = new CaptionsButtonCore();
    this.stateAttrMap = CaptionsButtonDataAttrs;
    this.mediaState = new PlayerController(this, playerContext, selectTextTrack);
    this.hotkeyAction = "toggleSubtitles";
  }
  static {
    this.tagName = "media-captions-button";
  }
  static {
    this.properties = {
      label: { type: String },
      disabled: { type: Boolean },
      commandfor: { type: String },
      menuFor: {
        type: String,
        attribute: "menu-for"
      }
    };
  }
  #defaultCommandfor;
  connectedCallback() {
    super.connectedCallback();
    if (this.commandfor && this.commandfor !== this.menuFor) this.#defaultCommandfor = this.commandfor;
  }
  activate(state, event) {
    if (this.menuFor && getCaptionTrackCount2(state) > 1) {
      if (event instanceof KeyboardEvent) toggleCommandTarget(this, this.menuFor);
      return;
    }
    this.core.toggle(state);
  }
  getIsButtonDisabled() {
    const media = this.mediaState.value;
    if (super.getIsButtonDisabled()) return true;
    if (media && getCaptionTrackCount2(media) === 0) return true;
    return false;
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    if (changed.has("commandfor") && this.commandfor !== this.menuFor) this.#defaultCommandfor = this.commandfor;
    if (changed.has("commandfor") || changed.has("menuFor")) this.#syncCommandFor();
  }
  update(changed) {
    super.update(changed);
    const media = this.mediaState.value;
    if (!media) return;
    this.#syncCommandFor(media);
    if (this.menuFor && getCaptionTrackCount2(media) > 1) applyElementProps(this, { "aria-disabled": this.getIsButtonDisabled() ? "true" : void 0 });
  }
  #syncCommandFor(media) {
    const state = media ?? this.mediaState.value;
    const target = state && this.menuFor && getCaptionTrackCount2(state) > 1 ? this.menuFor : this.#defaultCommandfor;
    if (target) this.setAttribute("commandfor", target);
    else this.removeAttribute("commandfor");
  }
};

// node_modules/@videojs/html/dist/default/define/ui/captions-button.js
safeDefine(CaptionsButtonElement);

// node_modules/@videojs/html/dist/default/ui/radio-group/context.js
var radioGroupContext = n(Symbol("@videojs/radio-group"));

// node_modules/@videojs/html/dist/default/ui/menu/context.js
var MENU_CONTEXT_KEY = Symbol("@videojs/menu");
var MENU_GROUP_CONTEXT_KEY = Symbol("@videojs/menu-group");
var menuContext = n(MENU_CONTEXT_KEY);
var menuGroupContext = n(MENU_GROUP_CONTEXT_KEY);

// node_modules/@videojs/html/dist/default/ui/menu/element.js
var MenuElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.open = MenuCore.defaultProps.open;
    this.defaultOpen = MenuCore.defaultProps.defaultOpen;
    this.side = MenuCore.defaultProps.side;
    this.align = MenuCore.defaultProps.align;
    this.closeOnEscape = MenuCore.defaultProps.closeOnEscape;
    this.closeOnOutsideClick = MenuCore.defaultProps.closeOnOutsideClick;
    this.boundary = "container";
    this.#core = new MenuCore();
    this.#provider = new i(this, { context: menuContext });
    this.#position = new PositionController(this);
    this.#controlsState = new PlayerController(this, playerContext, selectControls);
    this.#containerCtx = new ContextConsumer(this, {
      context: containerContext,
      subscribe: true
    });
    this.#popupGroupCtx = new ContextConsumer(this, { context: popupGroupContext });
    this.#menu = null;
    this.#popup = null;
    this.#snapshot = null;
    this.#disconnect = null;
    this.#triggerAbort = null;
    this.#currentTrigger = null;
    this.#triggerWasDisabled = false;
    this.#triggerWasHidden = false;
    this.#releaseControlsLock = null;
    this.#optionStates = /* @__PURE__ */ new Map();
    this.#optionState = null;
    this.#handleFocusOut = (event) => {
      this.#menu?.contentProps.onFocusOut(event);
    };
    this.#setOptionState = (source, optionState) => {
      const previous = this.#optionStates.get(source);
      if (optionState && isSameOptionState(previous, optionState)) return;
      if (!optionState && !previous) return;
      if (optionState) this.#optionStates.set(source, optionState);
      else this.#optionStates.delete(source);
      this.#optionState = resolveMenuOptionState(this.#optionStates.values());
      if ((this.#optionState?.disabled || this.#optionState?.hidden) && this.open) this.close("imperative-action");
      this.#syncOptionState(this.#currentTrigger);
    };
  }
  static {
    this.tagName = "media-menu";
  }
  static {
    this.properties = {
      open: { type: Boolean },
      defaultOpen: {
        type: Boolean,
        attribute: "default-open"
      },
      side: { type: String },
      align: { type: String },
      closeOnEscape: {
        type: Boolean,
        attribute: "close-on-escape"
      },
      closeOnOutsideClick: {
        type: Boolean,
        attribute: "close-on-outside-click"
      },
      boundary: { type: String }
    };
  }
  #core;
  #provider;
  #position;
  #controlsState;
  #containerCtx;
  #popupGroupCtx;
  #menu;
  #popup;
  #snapshot;
  #disconnect;
  #triggerAbort;
  #currentTrigger;
  #triggerWasDisabled;
  #triggerWasHidden;
  #releaseControlsLock;
  #optionStates;
  #optionState;
  get menu() {
    return this.#menu;
  }
  get popup() {
    return this.#popup;
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
    this.setAttribute(POPUP_HOST_ATTR, "");
    this.#disconnect = new AbortController();
    this.#popup = createMenuPopup();
    this.#popup.setElement(this);
    this.#menu = createMenu({
      transition: createTransition(),
      onOpenChange: (nextOpen, details) => {
        if (this.dispatchEvent(new CustomEvent("open-change", {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: {
            open: nextOpen,
            ...details
          }
        }))) this.open = nextOpen;
      },
      closeOnEscape: () => this.closeOnEscape,
      closeOnOutsideClick: () => this.closeOnOutsideClick,
      group: () => this.#popupGroupCtx.value
    });
    this.#menu.setPopupElement(this);
    applyElementProps(this, { onFocusOut: this.#handleFocusOut }, { signal: this.#disconnect.signal });
    if (this.#snapshot) this.#snapshot.track(this.#menu.input);
    else this.#snapshot = new SnapshotController(this, this.#menu.input);
  }
  disconnectedCallback() {
    this.#releaseControlsVisibilityLock();
    super.disconnectedCallback();
    this.#position.cleanup();
    this.#cleanupTrigger();
    this.#popup?.destroy();
    this.#popup = null;
    this.#menu?.destroy();
    this.#menu = null;
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
  close(reason = "imperative-action") {
    this.#menu?.close(reason);
  }
  openMenu(reason = "imperative-action") {
    this.#menu?.open(reason);
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    if (!this.hasUpdated && this.defaultOpen && !this.open) this.open = true;
    this.#core.setProps({
      open: this.open,
      defaultOpen: this.defaultOpen,
      side: this.side,
      align: this.align,
      closeOnEscape: this.closeOnEscape,
      closeOnOutsideClick: this.closeOnOutsideClick
    });
    if (this.#menu && changed.has("open")) this.#menu.syncOpen(this.open);
  }
  update(changed) {
    super.update(changed);
    if (!this.#menu || !this.#popup) return;
    const input = this.#menu.input.current;
    this.#core.setInput({
      ...input,
      isSubmenu: false
    });
    const state = this.#core.getState();
    if (state.open) this.#releaseControlsLock ??= this.#controlsState.value?.requestControlsLock() ?? null;
    else this.#releaseControlsVisibilityLock();
    const triggerElement = this.#position.findTrigger();
    this.#syncTrigger(triggerElement);
    applyElementProps(this, this.#core.getPopupAttrs());
    applyStateDataAttrs(this, state, MenuPopupDataAttrs);
    if (state.open) tryShowPopover(this);
    else tryHidePopover(this);
    if (this.#currentTrigger) {
      applyElementProps(this.#currentTrigger, this.#core.getTriggerAttrs(state, this.#menu.contentElement?.id));
      this.#syncOptionState(this.#currentTrigger);
    }
    if (!state.open) this.#position.cleanup();
    else {
      this.#popup.sync();
      const positionOptions = getRootPositionOptions(state.side, state.align);
      if (positionOptions && this.#currentTrigger) this.#position.sync({
        anchorName: this.id,
        position: positionOptions,
        trigger: this.#currentTrigger,
        boundary: this.boundary,
        container: this.#containerCtx.value?.container ?? null,
        cssVars: MenuPositioningCSSVars,
        trackResize: false,
        onSideChange: (side) => this.setAttribute(MenuPopupDataAttrs.side, side)
      });
    }
    this.#provider.setValue({
      core: this.#core,
      menu: this.#menu,
      popup: this.#popup,
      state,
      setOptionState: this.#setOptionState
    });
  }
  #releaseControlsVisibilityLock() {
    this.#releaseControlsLock?.();
    this.#releaseControlsLock = null;
  }
  #handleFocusOut;
  #syncTrigger(triggerElement) {
    if (triggerElement === this.#currentTrigger) return;
    this.#position.cleanup();
    this.#cleanupTrigger();
    this.#currentTrigger = triggerElement;
    this.#triggerWasDisabled = triggerElement ? isTriggerExplicitlyDisabled(triggerElement) : false;
    this.#triggerWasHidden = triggerElement?.hidden === true;
    this.#menu?.setTriggerElement(triggerElement);
    if (triggerElement && this.#menu) {
      this.#triggerAbort = new AbortController();
      applyElementProps(triggerElement, this.#menu.triggerProps, { signal: this.#triggerAbort.signal });
      this.#syncOptionState(triggerElement);
    }
  }
  #setOptionState;
  #syncOptionState(trigger) {
    if (!trigger) return;
    applyElementProps(trigger, {
      disabled: this.#triggerWasDisabled || this.#optionState?.disabled || void 0,
      "aria-disabled": this.#triggerWasDisabled || this.#optionState?.disabled ? "true" : void 0,
      "data-availability": this.#optionState?.availability,
      hidden: this.#triggerWasHidden || this.#optionState?.hidden || void 0
    });
    const value = trigger.querySelector('[data-part~="value"], [data-part~="hint"]');
    if (value && value.textContent !== this.#optionState?.value) value.textContent = this.#optionState?.value ?? "";
  }
  #cleanupTrigger() {
    if (this.#currentTrigger) {
      applyElementProps(this.#currentTrigger, {
        "aria-expanded": void 0,
        "aria-haspopup": void 0,
        "aria-controls": void 0,
        disabled: this.#triggerWasDisabled || void 0,
        "aria-disabled": this.#triggerWasDisabled ? "true" : void 0,
        "data-availability": void 0,
        hidden: this.#triggerWasHidden || void 0
      });
      const value = this.#currentTrigger.querySelector('[data-part~="value"], [data-part~="hint"]');
      if (value?.textContent) value.textContent = "";
    }
    this.#triggerAbort?.abort();
    this.#triggerAbort = null;
    this.#currentTrigger = null;
    this.#triggerWasDisabled = false;
    this.#triggerWasHidden = false;
  }
};
function isSameOptionState(a, b) {
  return a?.value === b.value && a.disabled === b.disabled && a.hidden === b.hidden && a.availability === b.availability;
}
function isTriggerExplicitlyDisabled(trigger) {
  return trigger.hasAttribute("disabled") || "disabled" in trigger && trigger.disabled === true;
}

// node_modules/@videojs/html/dist/default/define/ui/menu.js
safeDefine(MenuElement);

// node_modules/@videojs/html/dist/default/ui/menu/content.js
var idCounter2 = 0;
var MenuContentElement = class MenuContentElement2 extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.open = false;
    this.defaultOpen = false;
    this.#root = new ContextConsumer(this, {
      context: menuContext,
      subscribe: true
    });
    this.#provider = new i(this, { context: menuContext });
    this.#core = new MenuCore();
    this.#generatedId = `vjs-menu-content-${idCounter2++}`;
    this.#context = null;
    this.#menu = null;
    this.#parentMenu = null;
    this.#rootMenu = null;
    this.#ownsMenu = false;
    this.#disconnect = null;
    this.#cleanupRegistration = null;
    this.#cleanupParentRegistration = null;
    this.#optionStates = /* @__PURE__ */ new Map();
    this.#optionSource = Symbol("menu");
    this.#optionState = null;
    this.#optionParent = null;
    this.#stateTrigger = null;
    this.#triggerWasDisabled = false;
    this.#triggerWasHidden = false;
    this.#wasActive = false;
    this.#normalizing = false;
    this.#handleKeyDown = (event) => {
      const isNavigationKey = isMenuNavigationKey(event);
      const defaultPrevented = event.defaultPrevented;
      this.#menu?.contentProps.onKeyDown(event);
      if (this.#parentMenu && (event.key === "ArrowLeft" || event.key === "Escape") && !defaultPrevented) {
        event.preventDefault();
        this.#menu?.close("escape");
      }
      if (event.key !== "Escape" && isNavigationKey) event.stopPropagation();
    };
    this.#handleFocusOut = (event) => {
      this.#menu?.contentProps.onFocusOut(event);
    };
    this.#setOptionState = (source, optionState) => {
      const previous = this.#optionStates.get(source);
      if (optionState && isSameOptionState2(previous, optionState)) return;
      if (!optionState && !previous) return;
      if (optionState) this.#optionStates.set(source, optionState);
      else this.#optionStates.delete(source);
      this.#optionState = resolveMenuOptionState(this.#optionStates.values());
      if ((this.#optionState?.disabled || this.#optionState?.hidden) && this.open && this.#parentMenu) this.close("imperative-action");
      this.#syncOptionState(this.#findTrigger());
      this.#optionParent?.setOptionState(this.#optionSource, this.#optionState);
    };
  }
  static {
    this.tagName = "media-menu-content";
  }
  static {
    this.properties = {
      open: { type: Boolean },
      defaultOpen: {
        type: Boolean,
        attribute: "default-open"
      }
    };
  }
  #root;
  #provider;
  #core;
  #generatedId;
  #context;
  #menu;
  #parentMenu;
  #rootMenu;
  #ownsMenu;
  #disconnect;
  #cleanupRegistration;
  #cleanupParentRegistration;
  #optionStates;
  #optionSource;
  #optionState;
  #optionParent;
  #stateTrigger;
  #triggerWasDisabled;
  #triggerWasHidden;
  #wasActive;
  #normalizing;
  get context() {
    return this.#context;
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.#normalizing) return;
    this.#disconnect = new AbortController();
    applyElementProps(this, {
      onKeyDown: this.#handleKeyDown,
      onFocusOut: this.#handleFocusOut
    }, { signal: this.#disconnect.signal });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#normalizing) return;
    this.#cleanupMenu();
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
  openMenu(reason = "imperative-action") {
    this.#menu?.open(reason);
  }
  close(reason = "imperative-action") {
    this.#menu?.close(reason);
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    if (!this.hasUpdated && this.defaultOpen && !this.open) this.open = true;
    if (this.#ownsMenu && this.#menu && changed.has("open")) this.#menu.syncOpen(this.open);
  }
  update(changed) {
    super.update(changed);
    const root = this.#root.value ?? null;
    if (!root) return;
    if (!this.id) this.id = this.#generatedId;
    const trigger = this.#findTrigger();
    const parentContent = trigger?.closest(MenuContentElement2.tagName) ?? null;
    if (parentContent && !parentContent.context) {
      this.hidden = true;
      requestAnimationFrame(() => this.requestUpdate());
      return;
    }
    const parentMenu = parentContent?.context?.menu ?? null;
    const isSubmenu = parentMenu !== null;
    if (root.menu !== this.#rootMenu || parentMenu !== this.#parentMenu) {
      this.#cleanupMenu();
      this.#rootMenu = root.menu;
      this.#parentMenu = parentMenu;
      this.#setupMenu(root, parentMenu);
    }
    this.#setOptionParent(parentContent?.context ?? root);
    const menu = this.#menu;
    if (!menu) return;
    const input = menu.input.current;
    this.#core.setInput({
      ...input,
      isSubmenu
    });
    const state = this.#core.getState();
    const active = !isSubmenu || state.open || state.status === "ending";
    applyElementProps(this, {
      ...this.#core.getContentAttrs(),
      hidden: !active
    });
    applyStateDataAttrs(this, state, MenuContentDataAttrs);
    if (trigger) {
      menu.setTriggerElement(trigger);
      applyElementProps(trigger, this.#core.getTriggerAttrs(state, active ? this.id : void 0));
      this.#syncOptionState(trigger);
    }
    if (isSubmenu && active && !this.#wasActive) menu.highlightInitialItem({ preventScroll: true });
    this.#wasActive = active;
    this.#context = {
      core: this.#core,
      menu,
      popup: root.popup,
      state,
      setOptionState: this.#setOptionState
    };
    this.#provider.setValue(this.#context);
    root.popup.sync();
    this.#normalize();
  }
  #setupMenu(root, parentMenu) {
    if (parentMenu !== null) {
      this.#ownsMenu = true;
      this.#menu = createMenu({
        transition: createTransition(),
        onOpenChange: (nextOpen, details) => {
          if (this.dispatchEvent(new CustomEvent("open-change", {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: {
              open: nextOpen,
              ...details
            }
          }))) this.open = nextOpen;
        },
        closeOnEscape: () => true,
        closeOnOutsideClick: () => false
      });
      this.#menu.setPopupElement(this);
      this.#cleanupParentRegistration = parentMenu.registerSubmenu(this.#menu);
      const signal = this.#disconnect?.signal;
      if (signal) this.#menu.input.subscribe(() => this.requestUpdate(), { signal });
      this.#menu.syncOpen(this.open);
    } else {
      this.#ownsMenu = false;
      this.#menu = root.menu;
    }
    this.#cleanupRegistration = root.popup.registerContent({
      menu: this.#menu,
      parent: parentMenu,
      element: this
    });
  }
  #cleanupMenu() {
    this.#cleanupRegistration?.();
    this.#cleanupRegistration = null;
    this.#cleanupParentRegistration?.();
    this.#cleanupParentRegistration = null;
    this.#setOptionParent(null);
    this.#clearOptionState();
    this.#optionStates.clear();
    this.#optionState = null;
    if (this.#ownsMenu) this.#menu?.destroy();
    this.#menu = null;
    this.#context = null;
    this.#rootMenu = null;
    this.#parentMenu = null;
    this.#ownsMenu = false;
    this.#wasActive = false;
  }
  #findTrigger() {
    if (!this.id) return null;
    return [...this.getRootNode().querySelectorAll("[commandfor], media-menu-item")].find((element) => element.getAttribute("commandfor") === this.id || element.commandfor === this.id) ?? null;
  }
  /** Keep every page as a direct popup child, including authored nested pages. */
  #normalize() {
    const popup = this.closest("media-menu");
    if (!popup || this.parentElement === popup) return;
    this.#normalizing = true;
    popup.append(this);
    this.#normalizing = false;
  }
  #handleKeyDown;
  #handleFocusOut;
  #setOptionState;
  #setOptionParent(parent) {
    if (parent?.menu === this.#optionParent?.menu) {
      this.#optionParent = parent;
      return;
    }
    this.#optionParent?.setOptionState(this.#optionSource, null);
    this.#optionParent = parent;
    this.#optionParent?.setOptionState(this.#optionSource, this.#optionState);
  }
  #syncOptionState(trigger) {
    if (trigger !== this.#stateTrigger) {
      this.#clearOptionState();
      this.#stateTrigger = trigger;
      this.#triggerWasDisabled = trigger ? isTriggerExplicitlyDisabled2(trigger) : false;
      this.#triggerWasHidden = trigger?.hidden === true;
    }
    if (!trigger) return;
    const disabled = this.#optionState?.disabled || this.#triggerWasDisabled;
    applyElementProps(trigger, {
      disabled: disabled || void 0,
      "aria-disabled": disabled ? "true" : void 0,
      "data-availability": this.#optionState?.availability,
      hidden: this.#triggerWasHidden || this.#optionState?.hidden || void 0
    });
    const value = trigger.querySelector('[data-part~="value"], [data-part~="hint"]');
    if (value && value.textContent !== this.#optionState?.value) value.textContent = this.#optionState?.value ?? "";
  }
  #clearOptionState() {
    const trigger = this.#stateTrigger;
    if (!trigger) return;
    applyElementProps(trigger, {
      disabled: this.#triggerWasDisabled || void 0,
      "aria-disabled": this.#triggerWasDisabled ? "true" : void 0,
      "data-availability": void 0,
      hidden: this.#triggerWasHidden || void 0
    });
    const value = trigger.querySelector('[data-part~="value"], [data-part~="hint"]');
    if (value?.textContent) value.textContent = "";
    this.#stateTrigger = null;
    this.#triggerWasDisabled = false;
    this.#triggerWasHidden = false;
  }
};
function isSameOptionState2(a, b) {
  return a?.value === b.value && a.disabled === b.disabled && a.hidden === b.hidden && a.availability === b.availability;
}
function isTriggerExplicitlyDisabled2(trigger) {
  return trigger.hasAttribute("disabled") || "disabled" in trigger && trigger.disabled === true;
}

// node_modules/@videojs/html/dist/default/define/ui/menu-content.js
safeDefine(MenuContentElement);

// node_modules/@videojs/html/dist/default/ui/menu/item.js
var MenuItemElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.disabled = false;
    this.commandfor = void 0;
    this.#ctx = new ContextConsumer(this, {
      context: menuContext,
      subscribe: true
    });
    this.#disconnect = null;
    this.#registeredMenu = null;
    this.#cleanupRegistration = null;
  }
  static {
    this.tagName = "media-menu-item";
  }
  static {
    this.properties = {
      disabled: { type: Boolean },
      commandfor: { type: String }
    };
  }
  #ctx;
  #disconnect;
  #registeredMenu;
  #cleanupRegistration;
  connectedCallback() {
    super.connectedCallback();
    this.#disconnect = new AbortController();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#cleanupRegistration?.();
    this.#cleanupRegistration = null;
    this.#registeredMenu = null;
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
  update(_changed) {
    super.update(_changed);
    const ctx = this.#ctx.value;
    if (!ctx || !this.#disconnect) return;
    if (this.#registeredMenu !== ctx.menu) {
      this.#cleanupRegistration?.();
      this.#registeredMenu = ctx.menu;
      this.#cleanupRegistration = ctx.menu.registerItem(this);
      applyElementProps(this, {
        onClick: (event) => {
          const currentCtx = this.#ctx.value;
          if (!currentCtx || this.#isDisabled()) return;
          const target = this.commandfor;
          if (target) this.#openSubmenu(target);
          else {
            const select = new CustomEvent("select", {
              bubbles: true,
              cancelable: true
            });
            if (!this.dispatchEvent(select)) {
              event.preventDefault();
              return;
            }
            completeMenuItemSelection(currentCtx.menu);
          }
          event.preventDefault();
        },
        onKeyDown: (event) => {
          if (!this.#ctx.value || this.#isDisabled() || event.key !== "ArrowRight") return;
          const target = this.commandfor;
          if (!target) return;
          this.#openSubmenu(target);
          event.preventDefault();
        },
        onPointerenter: () => {
          const currentCtx = this.#ctx.value;
          if (!this.#isDisabled()) currentCtx?.menu.highlight(this, {
            focus: false,
            pointer: true
          });
        }
      }, { signal: this.#disconnect.signal });
    }
    const hasSubmenu = Boolean(this.commandfor);
    applyElementProps(this, {
      role: "menuitem",
      "aria-disabled": this.#isDisabled() ? "true" : void 0,
      ...hasSubmenu && {
        "aria-haspopup": "menu",
        "aria-expanded": "false",
        "data-has-submenu": ""
      }
    });
  }
  #openSubmenu(id) {
    this.getRootNode().querySelector(`#${CSS.escape(id)}`)?.openMenu?.("click");
  }
  #isDisabled() {
    return this.disabled || this.getAttribute("aria-disabled") === "true";
  }
};

// node_modules/@videojs/html/dist/default/define/ui/menu-item.js
safeDefine(MenuItemElement);

// node_modules/@videojs/html/dist/default/ui/menu/separator.js
var MenuSeparatorElement = class extends UIElement {
  static {
    this.tagName = "media-menu-separator";
  }
  update(_changed) {
    super.update(_changed);
    applyElementProps(this, { role: "separator" });
  }
};

// node_modules/@videojs/html/dist/default/define/ui/menu-separator.js
safeDefine(MenuSeparatorElement);

// node_modules/@videojs/html/dist/default/ui/radio-group/element.js
var RadioGroupElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.value = "";
    this.#provider = new i(this, { context: radioGroupContext });
  }
  static {
    this.properties = { value: { type: String } };
  }
  #provider;
  update(changed) {
    super.update(changed);
    this.#provider.setValue({
      value: this.value,
      onValueChange: (next) => {
        this.value = next;
        this.dispatchEvent(new CustomEvent("value-change", {
          detail: { value: next },
          bubbles: true
        }));
      }
    });
  }
};

// node_modules/@videojs/html/dist/default/ui/menu/group-controller.js
var MenuGroupController = class {
  #host;
  #provider;
  #contextValue = { registerLabel: (id) => this.#registerLabel(id) };
  #labelId;
  #appliedLabelId;
  constructor(host) {
    this.#host = host;
    this.#provider = new i(host, {
      context: menuGroupContext,
      initialValue: this.#contextValue
    });
  }
  applyProps() {
    const currentLabelledBy = this.#host.getAttribute("aria-labelledby") ?? void 0;
    const hasExplicitLabelledBy = currentLabelledBy !== void 0 && currentLabelledBy !== this.#appliedLabelId;
    if (this.#host.hasAttribute("aria-label") || hasExplicitLabelledBy) {
      if (this.#appliedLabelId && currentLabelledBy === this.#appliedLabelId) this.#host.removeAttribute("aria-labelledby");
      this.#appliedLabelId = void 0;
      applyElementProps(this.#host, { role: "group" });
      return;
    }
    this.#appliedLabelId = this.#labelId;
    applyElementProps(this.#host, {
      role: "group",
      "aria-labelledby": this.#labelId
    });
  }
  #registerLabel(id) {
    this.#labelId = id;
    this.#provider.setValue(this.#contextValue);
    this.#host.requestUpdate();
    return () => {
      if (this.#labelId !== id) return;
      this.#labelId = void 0;
      this.#host.requestUpdate();
    };
  }
};

// node_modules/@videojs/html/dist/default/ui/menu/radio-item.js
var MenuRadioItemElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.value = "";
    this.disabled = false;
    this.#menuCtx = new ContextConsumer(this, {
      context: menuContext,
      subscribe: true
    });
    this.#groupCtx = new ContextConsumer(this, {
      context: radioGroupContext,
      subscribe: true
    });
    this.#disconnect = null;
    this.#registered = false;
    this.#cleanupRegistration = null;
  }
  static {
    this.tagName = "media-menu-radio-item";
  }
  static {
    this.properties = {
      value: { type: String },
      disabled: { type: Boolean }
    };
  }
  #menuCtx;
  #groupCtx;
  #disconnect;
  #registered;
  #cleanupRegistration;
  connectedCallback() {
    super.connectedCallback();
    this.#disconnect = new AbortController();
    this.#registered = false;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#cleanupRegistration?.();
    this.#cleanupRegistration = null;
    this.#disconnect?.abort();
    this.#disconnect = null;
    this.#registered = false;
  }
  update(_changed) {
    super.update(_changed);
    const menuCtx = this.#menuCtx.value;
    const groupCtx = this.#groupCtx.value;
    if (!menuCtx || !groupCtx || !this.#disconnect) return;
    if (!this.#registered) {
      this.#registered = true;
      this.#cleanupRegistration = menuCtx.menu.registerItem(this);
      applyElementProps(this, {
        onClick: () => {
          const currentMenuCtx = this.#menuCtx.value;
          const currentGroupCtx = this.#groupCtx.value;
          if (!currentMenuCtx || !currentGroupCtx || this.disabled) return;
          currentGroupCtx.onValueChange(this.value);
          completeMenuItemSelection(currentMenuCtx.menu);
        },
        onPointerenter: () => {
          const currentMenuCtx = this.#menuCtx.value;
          if (!this.disabled) currentMenuCtx?.menu.highlight(this, {
            focus: false,
            pointer: true
          });
        }
      }, { signal: this.#disconnect.signal });
    }
    const checked = groupCtx.value === this.value;
    applyElementProps(this, {
      role: "menuitemradio",
      "aria-checked": String(checked),
      "aria-disabled": this.disabled ? "true" : void 0
    });
  }
};

// node_modules/@videojs/html/dist/default/ui/menu/radio-group.js
var MenuRadioGroupElement = class extends RadioGroupElement {
  static {
    this.tagName = "media-menu-radio-group";
  }
  #group = new MenuGroupController(this);
  #menu = new ContextConsumer(this, {
    context: menuContext,
    subscribe: true
  });
  #optionSource = Symbol("menu-option");
  #ariaLabel = null;
  #optionMenu = null;
  #setOptionState = null;
  disconnectedCallback() {
    this.#clearMenuOptionState();
    super.disconnectedCallback();
  }
  update(changed) {
    super.update(changed);
    this.#group.applyProps();
  }
  setItemLabel(item, label) {
    const labelPart = item.querySelector('[data-part~="label"]');
    if (labelPart) labelPart.textContent = label;
    else item.textContent = label;
  }
  /** Applies a generated fallback without replacing an author-provided accessible name. */
  applyDefaultAriaLabel(label) {
    if (this.hasAttribute("aria-labelledby")) return;
    const current = this.getAttribute("aria-label");
    if (current !== null && current !== this.#ariaLabel) return;
    this.#ariaLabel = label;
    this.setAttribute("aria-label", label);
  }
  publishMenuOptionState(disabled, hidden, availability) {
    const context = this.#menu.value ?? null;
    if (context?.menu !== this.#optionMenu) {
      this.#clearMenuOptionState();
      this.#optionMenu = context?.menu ?? null;
      this.#setOptionState = context?.setOptionState ?? null;
    }
    if (!this.#setOptionState) return;
    const selectedItem = findElementChild(this, (item) => item instanceof MenuRadioItemElement && item.value === this.value);
    const value = selectedItem?.querySelector('[data-part~="label"]')?.textContent ?? selectedItem?.textContent?.trim() ?? "";
    this.#setOptionState(this.#optionSource, {
      value,
      disabled,
      hidden,
      availability
    });
  }
  #clearMenuOptionState() {
    this.#setOptionState?.(this.#optionSource, null);
    this.#optionMenu = null;
    this.#setOptionState = null;
  }
};

// node_modules/@videojs/html/dist/default/i18n/cache-key.js
function cacheKey(text, params) {
  return JSON.stringify([text, params]);
}

// node_modules/@videojs/html/dist/default/ui/menu/item-indicator.js
var MenuItemIndicatorElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.checked = false;
    this.forceMount = false;
  }
  static {
    this.tagName = "media-menu-item-indicator";
  }
  static {
    this.properties = {
      checked: { type: Boolean },
      forceMount: {
        type: Boolean,
        attribute: "force-mount"
      }
    };
  }
  update(_changed) {
    super.update(_changed);
    const hidden = !this.checked && !this.forceMount;
    applyElementProps(this, {
      "aria-hidden": "true",
      hidden
    });
  }
};

// node_modules/@videojs/html/dist/default/ui/radio-options/controller.js
var RadioOptionsController = class {
  #host;
  #config;
  #contentKey = "";
  #translator = null;
  #disconnect = null;
  constructor(host, config) {
    this.#host = host;
    this.#config = config;
    host.addController(this);
  }
  hostConnected() {
    this.#disconnect = new AbortController();
    this.#host.addEventListener("value-change", this.#handleValueChange, { signal: this.#disconnect.signal });
  }
  hostDisconnected() {
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
  hostDestroyed() {
    this.hostDisconnected();
  }
  sync(state, translator, locale) {
    this.#host.value = state.value;
    applyElementProps(this.#host, {
      "aria-disabled": state.disabled ? "true" : void 0,
      hidden: state.hidden ? "" : void 0
    });
    const template3 = getTemplateElement(this.#host);
    const templateRoot = template3 ? getTemplateRoot(template3) : null;
    const itemRoot = templateRoot?.localName === MenuRadioItemElement.tagName ? templateRoot : null;
    const contentKey = `${state.options.map((option) => `${option.value}:${cacheKey(option.label, option.labelParams)}:${cacheKey(option.ariaLabel ?? "", option.ariaLabelParams)}:${this.#config.getOptionCacheKey?.(option) ?? ""}`).join("|")}::${locale}::${template3?.innerHTML ?? ""}`;
    if (contentKey !== this.#contentKey || translator !== this.#translator) {
      this.#contentKey = contentKey;
      this.#translator = translator;
      const staleChildren = [...this.#host.children].filter((child) => child !== template3);
      const focusedValue = this.#getFocusedItem()?.value;
      const items = state.options.map((option) => {
        const item = itemRoot ? cloneTemplateRoot(itemRoot, this.#host.ownerDocument) : this.#host.ownerDocument.createElement(MenuRadioItemElement.tagName);
        item.value = option.value;
        this.#config.setItemAttributes?.(item, option);
        const label = translateText(option.label, translator, option.labelParams);
        if (this.#config.renderItem) this.#config.renderItem(item, label, option);
        else this.#setItemLabel(item, label);
        if (!isUndefined(option.ariaLabel)) item.setAttribute("aria-label", translateText(option.ariaLabel, translator, option.ariaLabelParams));
        return item;
      });
      this.#host.append(...items);
      const removeStale = () => {
        for (const child of staleChildren) child.remove();
      };
      const replacement = isUndefined(focusedValue) ? void 0 : items.find((item) => item.value === focusedValue) ?? items.find((item) => item.value === state.value);
      if (replacement) replacement.updateComplete.then(() => {
        replacement.focus();
        removeStale();
      });
      else removeStale();
    }
    const optionsByValue = new Map(state.options.map((option) => [option.value, option]));
    for (const item of this.#host.querySelectorAll(MenuRadioItemElement.tagName)) {
      const checked = item.value === state.value;
      const option = optionsByValue.get(item.value);
      item.disabled = state.disabled || option?.disabled === true;
      for (const indicator of item.querySelectorAll(MenuItemIndicatorElement.tagName)) indicator.checked = checked;
    }
  }
  #handleValueChange = (event) => {
    if (event.target !== this.#host) return;
    const { value } = event.detail;
    this.#config.onValueChange(value);
  };
  #getFocusedItem() {
    const active = this.#host.getRootNode().activeElement;
    return active instanceof MenuRadioItemElement && active.parentElement === this.#host ? active : null;
  }
  #setItemLabel(item, label) {
    const labelPart = item.querySelector('[data-part~="label"]');
    if (labelPart) labelPart.textContent = label;
    else item.textContent = label;
  }
};

// node_modules/@videojs/html/dist/default/ui/quality-radio-group/element.js
var QualityRadioGroupElement = class extends MenuRadioGroupElement {
  constructor(..._args) {
    super(..._args);
    this.disabled = false;
    this.label = "";
    this.formatRendition = QualityRadioGroupCore.defaultProps.formatRendition;
    this.#core = new QualityRadioGroupCore();
    this.#i18n = new I18nController(this, i18nContext);
    this.#mediaState = new PlayerController(this, playerContext, selectQuality);
    this.#options = new RadioOptionsController(this, {
      renderItem: (item, label, option) => this.#setContent(item, label, option.tier, option.badge),
      setItemAttributes: (item, option) => item.setAttribute("data-rendition", option.value),
      getOptionCacheKey: (option) => `${option.tier ?? ""}:${option.badge ?? ""}`,
      onValueChange: (value) => {
        const media = this.#mediaState.value;
        if (media) this.#core.selectValue(media, value);
      }
    });
  }
  static {
    this.tagName = "media-quality-radio-group";
  }
  static {
    this.properties = {
      ...MenuRadioGroupElement.properties,
      disabled: { type: Boolean },
      label: { type: String }
    };
  }
  #core;
  #i18n;
  #mediaState;
  #options;
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
  }
  update(changed) {
    const media = this.#mediaState.value;
    let state = null;
    if (media) {
      this.#core.setProps({
        formatRendition: this.formatRendition,
        disabled: this.disabled,
        label: this.label
      });
      this.#core.setMedia(media);
      state = this.#core.getState();
      this.applyDefaultAriaLabel(translateText(this.#core.getLabel(state), this.#i18n.value));
      this.#options.sync(state, this.#i18n.value, this.#i18n.locale);
      this.publishMenuOptionState(state.disabled, state.hidden, state.availability);
    } else this.publishMenuOptionState(true, true, "unsupported");
    super.update(changed);
    if (state) applyStateDataAttrs(this, state, QualityRadioGroupDataAttrs);
  }
  #setContent(item, label, tier, badge) {
    const labelPart = item.querySelector('[data-part~="label"]');
    const tierPart = item.querySelector('[data-part~="tier"]');
    const badgePart = item.querySelector('[data-part~="badge"]');
    if (labelPart) labelPart.textContent = label;
    if (tierPart) {
      tierPart.textContent = tier ?? "";
      tierPart.hidden = !tier;
    }
    if (badgePart) {
      badgePart.textContent = badge ?? "";
      badgePart.hidden = !badge;
    }
    if (!labelPart && !tierPart && !badgePart) item.textContent = [
      label,
      tier,
      badge
    ].filter(Boolean).join(" ");
  }
};

// node_modules/@videojs/html/dist/default/define/ui/quality-radio-group.js
safeDefine(QualityRadioGroupElement);

// node_modules/@videojs/html/dist/default/define/ui/menu-radio-item.js
safeDefine(MenuRadioItemElement);

// node_modules/@videojs/html/dist/default/define/ui/menu-item-indicator.js
safeDefine(MenuItemIndicatorElement);

// node_modules/@videojs/html/dist/default/ui/audio-track-radio-group/element.js
var AudioTrackRadioGroupElement = class extends MenuRadioGroupElement {
  constructor(..._args) {
    super(..._args);
    this.disabled = false;
    this.label = "";
    this.formatTrack = AudioTrackRadioGroupCore.defaultProps.formatTrack;
    this.#core = new AudioTrackRadioGroupCore();
    this.#i18n = new I18nController(this, i18nContext);
    this.#mediaState = new PlayerController(this, playerContext, selectAudioTrack);
    this.#options = new RadioOptionsController(this, {
      setItemAttributes: (item, option) => item.setAttribute("data-track", option.value),
      onValueChange: (value) => {
        const media = this.#mediaState.value;
        if (media) this.#core.selectValue(media, value);
      }
    });
  }
  static {
    this.tagName = "media-audio-track-radio-group";
  }
  static {
    this.properties = {
      ...MenuRadioGroupElement.properties,
      disabled: { type: Boolean },
      label: { type: String }
    };
  }
  #core;
  #i18n;
  #mediaState;
  #options;
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
  }
  update(changed) {
    const media = this.#mediaState.value;
    let state = null;
    if (media) {
      this.#core.setProps({
        formatTrack: this.formatTrack,
        disabled: this.disabled,
        label: this.label
      });
      this.#core.setMedia(media);
      state = this.#core.getState();
      this.applyDefaultAriaLabel(translateText(this.#core.getLabel(state), this.#i18n.value));
      this.#options.sync(state, this.#i18n.value, this.#i18n.locale);
      this.publishMenuOptionState(state.disabled, state.hidden, state.availability);
    } else this.publishMenuOptionState(true, true, "unsupported");
    super.update(changed);
    if (state) applyStateDataAttrs(this, state, AudioTrackRadioGroupDataAttrs);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/audio-track-radio-group.js
safeDefine(AudioTrackRadioGroupElement);

// node_modules/@videojs/html/dist/default/ui/playback-rate-radio-group/element.js
var PlaybackRateRadioGroupElement = class extends MenuRadioGroupElement {
  constructor(..._args) {
    super(..._args);
    this.disabled = false;
    this.rates = void 0;
    this.formatRate = PlaybackRateRadioGroupCore.defaultProps.formatRate;
    this.#core = new PlaybackRateRadioGroupCore();
    this.#i18n = new I18nController(this, i18nContext);
    this.#mediaState = new PlayerController(this, playerContext, selectPlaybackRate);
    this.#options = new RadioOptionsController(this, {
      setItemAttributes: (item, option) => {
        item.setAttribute("data-rate", option.value);
        item.toggleAttribute("data-custom", option.custom);
      },
      getOptionCacheKey: (option) => option.custom ? "custom" : "",
      onValueChange: (value) => {
        const media = this.#mediaState.value;
        if (media) this.#core.selectValue(media, value);
      }
    });
  }
  static {
    this.tagName = "media-playback-rate-radio-group";
  }
  static {
    this.properties = {
      ...MenuRadioGroupElement.properties,
      disabled: { type: Boolean },
      rates: { type: String }
    };
  }
  #core;
  #i18n;
  #mediaState;
  #options;
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
  }
  update(changed) {
    const media = this.#mediaState.value;
    let state = null;
    if (media) {
      this.#core.setProps({
        formatRate: this.formatRate,
        disabled: this.disabled,
        rates: this.rates
      });
      this.#core.setMedia(media);
      state = this.#core.getState();
      this.applyDefaultAriaLabel(translateText(this.#core.getLabel(state), this.#i18n.value, this.#core.getLabelParams(state)));
      this.#options.sync(state, this.#i18n.value, this.#i18n.locale);
      this.publishMenuOptionState(state.disabled, state.hidden, state.availability);
    } else this.publishMenuOptionState(true, true, "unsupported");
    super.update(changed);
    if (state) applyStateDataAttrs(this, state, PlaybackRateRadioGroupDataAttrs);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/playback-rate-radio-group.js
safeDefine(PlaybackRateRadioGroupElement);

// node_modules/@videojs/html/dist/default/ui/captions-radio-group/element.js
var CaptionsRadioGroupElement = class extends MenuRadioGroupElement {
  constructor(..._args) {
    super(..._args);
    this.disabled = false;
    this.label = "";
    this.formatTrack = CaptionsRadioGroupCore.defaultProps.formatTrack;
    this.#core = new CaptionsRadioGroupCore();
    this.#i18n = new I18nController(this, i18nContext);
    this.#mediaState = new PlayerController(this, playerContext, selectTextTrack);
    this.#options = new RadioOptionsController(this, {
      setItemAttributes: (item, option) => item.setAttribute("data-track", option.value),
      onValueChange: (value) => {
        const media = this.#mediaState.value;
        if (media) this.#core.selectValue(media, value);
      }
    });
  }
  static {
    this.tagName = "media-captions-radio-group";
  }
  static {
    this.properties = {
      ...MenuRadioGroupElement.properties,
      disabled: { type: Boolean },
      label: { type: String }
    };
  }
  #core;
  #i18n;
  #mediaState;
  #options;
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
  }
  update(changed) {
    const media = this.#mediaState.value;
    let state = null;
    if (media) {
      this.#core.setProps({
        formatTrack: this.formatTrack,
        disabled: this.disabled,
        label: this.label
      });
      this.#core.setMedia(media);
      state = this.#core.getState();
      this.applyDefaultAriaLabel(translateText(this.#core.getLabel(state), this.#i18n.value));
      this.#options.sync(state, this.#i18n.value, this.#i18n.locale);
      this.publishMenuOptionState(state.disabled, state.hidden, state.availability);
    } else this.publishMenuOptionState(true, true, "unsupported");
    super.update(changed);
    if (state) applyStateDataAttrs(this, state, CaptionsRadioGroupDataAttrs);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/captions-radio-group.js
safeDefine(CaptionsRadioGroupElement);

// node_modules/@videojs/html/dist/default/ui/hotkey/element.js
var HotkeyElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.keys = "";
    this.action = "";
    this.value = void 0;
    this.disabled = false;
    this.target = "player";
    this.#player = new PlayerController(this, playerContext);
    this.#container = new ContextConsumer(this, {
      context: containerContext,
      callback: () => this.requestUpdate(),
      subscribe: true
    });
    this.#cleanup = null;
  }
  static {
    this.tagName = "media-hotkey";
  }
  static {
    this.properties = {
      keys: { type: String },
      action: { type: String },
      value: { type: Number },
      disabled: { type: Boolean },
      target: { type: String }
    };
  }
  #player;
  #container;
  #cleanup;
  connectedCallback() {
    super.connectedCallback();
    this.style.display = "none";
    this.#register();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unregister();
  }
  update(changed) {
    super.update(changed);
    if (this.isConnected) {
      this.#unregister();
      this.#register();
    }
  }
  #register() {
    const store = this.#player.value;
    const container = this.#container.value?.container;
    if (!this.keys || !this.action || !store || !container) return;
    const resolver = resolveHotkeyAction(this.action);
    if (!resolver) return;
    const { value, action } = this;
    this.#cleanup = createHotkey(container, {
      keys: this.keys,
      action,
      value,
      target: this.target,
      disabled: this.disabled,
      repeatable: !isHotkeyToggleAction(action),
      onActivate: (_event, key) => {
        resolver({
          store,
          key,
          value
        });
      }
    });
  }
  #unregister() {
    this.#cleanup?.();
    this.#cleanup = null;
  }
};

// node_modules/@videojs/html/dist/default/define/ui/hotkey.js
safeDefine(HotkeyElement);

// node_modules/@videojs/html/dist/default/ui/gesture/element.js
var GestureElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.type = "";
    this.action = "";
    this.value = void 0;
    this.pointer = void 0;
    this.region = void 0;
    this.disabled = false;
    this.#player = new PlayerController(this, playerContext);
    this.#container = new ContextConsumer(this, {
      context: containerContext,
      callback: () => this.requestUpdate(),
      subscribe: true
    });
    this.#cleanup = null;
  }
  static {
    this.tagName = "media-gesture";
  }
  static {
    this.properties = {
      type: { type: String },
      action: { type: String },
      value: { type: Number },
      pointer: { type: String },
      region: { type: String },
      disabled: { type: Boolean }
    };
  }
  #player;
  #container;
  #cleanup;
  connectedCallback() {
    super.connectedCallback();
    this.style.display = "none";
    this.#register();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unregister();
  }
  update(changed) {
    super.update(changed);
    if (this.isConnected) {
      this.#unregister();
      this.#register();
    }
  }
  #register() {
    const store = this.#player.value;
    const container = this.#container.value?.container;
    if (!this.type || !this.action || !store || !container) return;
    const resolver = resolveGestureAction(this.action);
    if (!resolver) return;
    const { value, region } = this;
    const actionValue = getGestureActionValue(this.action, region, value);
    let state;
    const onActivate = (event) => {
      resolver({
        store,
        state,
        value: actionValue,
        event
      });
    };
    const options = {
      onPointerDown: () => state = store.state,
      pointer: this.pointer,
      region,
      disabled: this.disabled,
      action: this.action,
      value: actionValue
    };
    if (this.type === "doubletap") this.#cleanup = createDoubleTapGesture(container, onActivate, options);
    else if (this.type === "tap") this.#cleanup = createTapGesture(container, onActivate, options);
  }
  #unregister() {
    this.#cleanup?.();
    this.#cleanup = null;
  }
};

// node_modules/@videojs/html/dist/default/define/ui/gesture.js
safeDefine(GestureElement);

// node_modules/@videojs/html/dist/default/ui/status-announcer/element.js
var StatusAnnouncerElement = class extends UIElement {
  static {
    this.tagName = "media-status-announcer";
  }
  static {
    this.properties = { closeDelay: {
      type: Number,
      attribute: "close-delay"
    } };
  }
  #i18n = new I18nController(this, i18nContext);
  #core = new StatusAnnouncerCore();
  #storeUnsubscribe = null;
  #player = new ContextConsumer(this, {
    context: playerContext,
    callback: (store) => this.#reconnect(store),
    subscribe: true
  });
  #container = new ContextConsumer(this, {
    context: containerContext,
    subscribe: true
  });
  #disconnect = null;
  #liveText = null;
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
    this.setAttribute("role", "status");
    this.#ensureLiveText();
    this.#disconnect = new AbortController();
    this.#core.state.subscribe(() => this.requestUpdate(), { signal: this.#disconnect.signal });
    this.#reconnect();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#storeUnsubscribe?.();
    this.#storeUnsubscribe = null;
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
  destroyCallback() {
    this.#storeUnsubscribe?.();
    this.#core.destroy();
    super.destroyCallback();
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    this.#core.setProps({
      closeDelay: this.closeDelay,
      labels: createStatusAnnouncerLabels(this.#i18n.value, this.#i18n.locale),
      shouldAnnounce: () => shouldAnnounceStatusChange(this.#container.value?.container)
    });
  }
  update(changed) {
    super.update(changed);
    const label = this.#core.state.current.label;
    const liveText = this.#ensureLiveText();
    if (label === null) liveText.replaceChildren();
    else liveText.replaceChildren(document.createTextNode(label));
  }
  #reconnect(store = this.#player.value) {
    this.#storeUnsubscribe?.();
    this.#storeUnsubscribe = null;
    if (!store) {
      this.#core.resetSnapshot();
      return;
    }
    this.#storeUnsubscribe = subscribeToStatusAnnouncer(store, this.#core);
  }
  #ensureLiveText() {
    if (this.#liveText?.isConnected) return this.#liveText;
    const existing = this.querySelector("[data-status-announcer-content]");
    this.#liveText = existing ?? document.createElement("span");
    this.#liveText.setAttribute("data-status-announcer-content", "");
    if (!existing) this.append(this.#liveText);
    return this.#liveText;
  }
};

// node_modules/@videojs/html/dist/default/define/ui/status-announcer.js
safeDefine(StatusAnnouncerElement);

// node_modules/@videojs/html/dist/default/ui/input-indicator/element.js
var InputIndicatorElement = class extends UIElement {
  constructor(..._args) {
    super(..._args);
    this.player = new PlayerController(this, playerContext);
    this.container = new ContextConsumer(this, {
      context: containerContext,
      callback: () => this.#reconnect(),
      subscribe: true
    });
    this.#disconnect = null;
    this.#inputActionUnsubscribe = null;
    this.#visibilityUnsubscribe = null;
    this.#visibilityHandle = null;
    this.#lastGeneration = 0;
    this.#snapshot = null;
  }
  get options() {
    return {};
  }
  #disconnect;
  #inputActionUnsubscribe;
  #visibilityUnsubscribe;
  #visibilityHandle;
  #lastGeneration;
  #snapshot;
  #getVisibilityHandle() {
    return this.#visibilityHandle ??= { close: () => this.core.close() };
  }
  #payloadSnapshot() {
    return this.#snapshot ?? this.core.state.current;
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.destroyed) return;
    this.#snapshot = this.core.state.current;
    this.#disconnect = new AbortController();
    this.core.state.subscribe(() => this.requestUpdate(), { signal: this.#disconnect.signal });
    this.transition.state.subscribe(() => this.requestUpdate(), { signal: this.#disconnect.signal });
    this.hidden = true;
    this.#reconnect();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#inputActionUnsubscribe?.();
    this.#visibilityUnsubscribe?.();
    this.#inputActionUnsubscribe = null;
    this.#visibilityUnsubscribe = null;
    this.#disconnect?.abort();
    this.#disconnect = null;
  }
  destroyCallback() {
    this.#inputActionUnsubscribe?.();
    this.#visibilityUnsubscribe?.();
    this.core.destroy();
    this.transition.destroy();
    this.liveIndicator.remove();
    super.destroyCallback();
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    this.syncCoreProps();
  }
  update(changed) {
    super.update(changed);
    this.#syncTransition();
    const currentState = this.core.state.current;
    const transitionState = this.transition.state.current;
    if (!isIndicatorPresent(currentState, transitionState)) {
      this.liveIndicator.remove();
      return;
    }
    const state = getRenderedIndicatorState(currentState, this.#payloadSnapshot(), transitionState);
    this.liveIndicator.render(state);
  }
  #syncTransition() {
    const currentState = this.core.state.current;
    if (currentState.open) {
      this.#snapshot = currentState;
      if (this.#lastGeneration !== currentState.generation) {
        this.#lastGeneration = currentState.generation;
        const transitionState = this.transition.state.current;
        if (!transitionState.active || this.options.replayOnUpdate !== false) this.transition.open(this.liveIndicator.element);
        else if (transitionState.status === "ending") this.transition.cancel();
      }
      return;
    }
    const { active, status } = this.transition.state.current;
    if (active && status !== "ending") this.transition.close(this.liveIndicator.element);
  }
  #reconnect() {
    if (!this.container) return;
    this.#inputActionUnsubscribe?.();
    this.#visibilityUnsubscribe?.();
    this.#inputActionUnsubscribe = null;
    this.#visibilityUnsubscribe = null;
    const container = this.container.value?.container;
    if (!container) return;
    const visibility = getIndicatorVisibilityCoordinator(container);
    const visibilityHandle = this.#getVisibilityHandle();
    this.#visibilityUnsubscribe = visibility.register(visibilityHandle);
    this.#inputActionUnsubscribe = subscribeToInputActions(container, (event) => {
      if (this.core.processEvent(event, getMediaSnapshot(this.player.value))) visibility.show(visibilityHandle);
    });
  }
};

// node_modules/@videojs/html/dist/default/ui/input-indicator/live-indicator.js
var LiveIndicator = class {
  #host;
  #dataAttrs;
  #render;
  constructor(options) {
    this.#host = options.host;
    this.#dataAttrs = options.dataAttrs;
    this.#render = options.render;
  }
  get element() {
    return this.#host;
  }
  render(state) {
    this.#host.hidden = false;
    applyStateDataAttrs(this.#host, state, this.#dataAttrs);
    this.#render(this.#host, state);
    return this.#host;
  }
  remove() {
    this.#host.hidden = true;
    for (const key in this.#dataAttrs) {
      const name = this.#dataAttrs[key];
      if (name) this.#host.removeAttribute(name);
    }
  }
};

// node_modules/@videojs/html/dist/default/ui/volume-indicator/element.js
var VolumeIndicatorElement = class extends InputIndicatorElement {
  static {
    this.tagName = "media-volume-indicator";
  }
  static {
    this.properties = { closeDelay: {
      type: Number,
      attribute: "close-delay"
    } };
  }
  #i18n = new I18nController(this, i18nContext);
  #core = new VolumeIndicatorCore();
  #transition = createTransition();
  #liveIndicator = new LiveIndicator({
    host: this,
    dataAttrs: VolumeIndicatorDataAttrs,
    render: renderVolumeIndicator
  });
  #options = { replayOnUpdate: false };
  get core() {
    return this.#core;
  }
  get transition() {
    return this.#transition;
  }
  get liveIndicator() {
    return this.#liveIndicator;
  }
  get options() {
    return this.#options;
  }
  syncCoreProps() {
    this.#core.setProps({
      closeDelay: this.closeDelay,
      labels: createInputIndicatorLabels(this.#i18n.value)
    });
  }
};
function renderVolumeIndicator(element, state) {
  const fill = element.querySelector("media-volume-indicator-fill");
  const value = element.querySelector("media-volume-indicator-value");
  if (state.fill) fill?.style.setProperty(VolumeIndicatorCSSVars.fill, state.fill);
  else fill?.style.removeProperty(VolumeIndicatorCSSVars.fill);
  if (value) value.textContent = getVolumeIndicatorDisplayValue(state);
}

// node_modules/@videojs/html/dist/default/define/ui/volume-indicator.js
safeDefine(VolumeIndicatorElement);

// node_modules/@videojs/html/dist/default/ui/volume-indicator/fill.js
var VolumeIndicatorFillElement = class extends UIElement {
  static {
    this.tagName = "media-volume-indicator-fill";
  }
};

// node_modules/@videojs/html/dist/default/define/ui/volume-indicator-fill.js
safeDefine(VolumeIndicatorFillElement);

// node_modules/@videojs/html/dist/default/ui/volume-indicator/value.js
var VolumeIndicatorValueElement = class extends UIElement {
  static {
    this.tagName = "media-volume-indicator-value";
  }
};

// node_modules/@videojs/html/dist/default/define/ui/volume-indicator-value.js
safeDefine(VolumeIndicatorValueElement);

// node_modules/@videojs/html/dist/default/ui/status-indicator/element.js
var StatusIndicatorElement = class extends InputIndicatorElement {
  static {
    this.tagName = "media-status-indicator";
  }
  static {
    this.properties = {
      actions: { type: String },
      closeDelay: {
        type: Number,
        attribute: "close-delay"
      }
    };
  }
  #i18n = new I18nController(this, i18nContext);
  #core = new StatusIndicatorCore();
  #transition = createTransition();
  #liveIndicator = new LiveIndicator({
    host: this,
    dataAttrs: StatusIndicatorDataAttrs,
    render: renderStatusIndicator
  });
  #options = { replayOnUpdate: false };
  #deriveCustomStatus;
  /**
  * Derives display details for actions without built-in feedback, such as custom hotkey actions. Called only when the
  * built-in derivation returns `null`. Set as a JavaScript property; it has no attribute.
  */
  get deriveCustomStatus() {
    return this.#deriveCustomStatus;
  }
  set deriveCustomStatus(value) {
    this.#deriveCustomStatus = value;
    this.requestUpdate();
  }
  get core() {
    return this.#core;
  }
  get transition() {
    return this.#transition;
  }
  get liveIndicator() {
    return this.#liveIndicator;
  }
  get options() {
    return this.#options;
  }
  syncCoreProps() {
    this.#core.setProps({
      actions: parseActions(this.actions),
      closeDelay: this.closeDelay,
      labels: createInputIndicatorLabels(this.#i18n.value),
      deriveCustomStatus: this.#deriveCustomStatus
    });
  }
};
function parseActions(actions) {
  return actions?.split(/[\s,]+/).filter(Boolean);
}
function renderStatusIndicator(element, state) {
  const value = element.querySelector("media-status-indicator-value");
  if (!value) return;
  value.textContent = getStatusIndicatorDisplayValue(state);
}

// node_modules/@videojs/html/dist/default/define/ui/status-indicator.js
safeDefine(StatusIndicatorElement);

// node_modules/@videojs/html/dist/default/ui/status-indicator/value.js
var StatusIndicatorValueElement = class extends UIElement {
  static {
    this.tagName = "media-status-indicator-value";
  }
};

// node_modules/@videojs/html/dist/default/define/ui/status-indicator-value.js
safeDefine(StatusIndicatorValueElement);

// node_modules/@videojs/html/dist/default/ui/seek-indicator/element.js
var SeekIndicatorElement = class extends InputIndicatorElement {
  static {
    this.tagName = "media-seek-indicator";
  }
  static {
    this.properties = { closeDelay: {
      type: Number,
      attribute: "close-delay"
    } };
  }
  #i18n = new I18nController(this, i18nContext);
  #core = new SeekIndicatorCore();
  #transition = createTransition();
  #liveIndicator = new LiveIndicator({
    host: this,
    dataAttrs: SeekIndicatorDataAttrs,
    render: renderSeekIndicator
  });
  get core() {
    return this.#core;
  }
  get transition() {
    return this.#transition;
  }
  get liveIndicator() {
    return this.#liveIndicator;
  }
  syncCoreProps() {
    this.#core.setProps({
      closeDelay: this.closeDelay,
      locale: this.#i18n.locale
    });
  }
};
function renderSeekIndicator(element, state) {
  const value = element.querySelector("media-seek-indicator-value");
  if (!value) return;
  value.textContent = getSeekIndicatorDisplayValue(state);
}

// node_modules/@videojs/html/dist/default/define/ui/seek-indicator.js
safeDefine(SeekIndicatorElement);

// node_modules/@videojs/html/dist/default/ui/seek-indicator/value.js
var SeekIndicatorValueElement = class extends UIElement {
  static {
    this.tagName = "media-seek-indicator-value";
  }
};

// node_modules/@videojs/html/dist/default/define/ui/seek-indicator-value.js
safeDefine(SeekIndicatorValueElement);

// node_modules/@videojs/html/dist/default/internal/skins/default-video/register.js
registerIcons("default", {
  "airplay-enter": airPlayEnterIcon,
  "airplay-exit": airPlayExitIcon,
  "captions-off": captionsOffIcon,
  "captions-on": captionsOnIcon,
  "cast-enter": castEnterIcon,
  "cast-exit": castExitIcon,
  check: checkIcon,
  chevron: chevronIcon,
  "fullscreen-enter": fullscreenEnterIcon,
  "fullscreen-exit": fullscreenExitIcon,
  gear: gearIcon,
  pause: pauseIcon,
  "pip-enter": pipEnterIcon,
  "pip-exit": pipExitIcon,
  play: playIcon,
  restart: restartIcon,
  speech: speechIcon,
  speed: speedIcon,
  spinner: spinnerIcon,
  switches: switchesIcon,
  "volume-high": volumeHighIcon,
  "volume-low": volumeLowIcon,
  "volume-off": volumeOffIcon
});

// node_modules/@videojs/html/dist/default/define/video/skin.js
safeDefine(VideoSkinElement);

// node_modules/@videojs/html/dist/default/internal/skins/default-audio/template.js
var template2 = createTemplate(`<media-container class="media-skin media-container audio-skin" data-theme="default" data-preset="audio">
<slot>
</slot>
<media-error-dialog class="audio-dialog-root">
<media-dialog-backdrop class="audio-dialog-backdrop">
</media-dialog-backdrop>
<media-dialog-popup class="audio-dialog-popup">
<div class="audio-dialog-content">
<media-dialog-title class="audio-dialog-title">
</media-dialog-title>
<media-dialog-description class="audio-dialog-description">
</media-dialog-description>
</div>
<div class="audio-dialog-actions">
<media-dialog-close class="media-button audio-dialog-close">
</media-dialog-close>
</div>
</media-dialog-popup>
</media-error-dialog>
<media-controls visibility="always">
<media-controls-content class="audio-controls audio-controls-content">
<media-tooltip-group>
<media-controls-group class="audio-controls-start">
<div class="audio-play-button">
<media-buffering-indicator class="media-buffering-indicator audio-play-button-buffering-indicator">
<media-icon name="spinner" class="media-buffering-indicator-spinner-icon">
</media-icon>
</media-buffering-indicator>
<media-play-button class="media-button media-play-button" id="vjs-YCBr5ls1-0-trigger">
<media-icon name="restart" class="media-button-icon media-play-button-restart-icon">
</media-icon>
<media-icon name="play" class="media-button-icon media-play-button-play-icon">
</media-icon>
<media-icon name="pause" class="media-button-icon media-play-button-pause-icon">
</media-icon>
</media-play-button>
<media-tooltip trigger="vjs-YCBr5ls1-0-trigger" boundary="viewport" side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-tooltip-label>
</media-tooltip-label>
<media-tooltip-shortcut class="media-tooltip-shortcut">
</media-tooltip-shortcut>
</media-tooltip>
</div>
<media-seek-button seconds="-10" class="media-button media-seek-button audio-seek-button" id="vjs-YCBr5ls1-0-2-trigger">
<div class="media-seek-button-content">
<media-icon name="seek" class="media-button-icon media-seek-button-backward-icon">
</media-icon>
<span class="media-seek-button-label media-seek-button-backward-label">10</span>
</div>
</media-seek-button>
<media-tooltip trigger="vjs-YCBr5ls1-0-2-trigger" boundary="viewport" side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-tooltip-label>
</media-tooltip-label>
<media-tooltip-shortcut class="media-tooltip-shortcut">
</media-tooltip-shortcut>
</media-tooltip>
<media-seek-button seconds="10" class="media-button media-seek-button audio-seek-button" id="vjs-YCBr5ls1-0-3-trigger">
<div class="media-seek-button-content">
<media-icon name="seek" class="media-button-icon">
</media-icon>
<span class="media-seek-button-label media-seek-button-forward-label">10</span>
</div>
</media-seek-button>
<media-tooltip trigger="vjs-YCBr5ls1-0-3-trigger" boundary="viewport" side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-tooltip-label>
</media-tooltip-label>
<media-tooltip-shortcut class="media-tooltip-shortcut">
</media-tooltip-shortcut>
</media-tooltip>
</media-controls-group>
<media-controls-group class="audio-time-slider-group">
<media-time class="media-time-value" type="current">
</media-time>
<media-time-slider class="media-slider audio-time-slider">
<media-slider-track class="media-slider-track">
<media-slider-buffer class="media-slider-buffer">
</media-slider-buffer>
<media-slider-fill class="media-slider-fill">
</media-slider-fill>
</media-slider-track>
<media-slider-thumb class="media-slider-thumb audio-time-slider-thumb">
</media-slider-thumb>
<media-slider-preview class="media-slider-preview" overflow="visible">
<div class="media-slider-preview-content media-popup-surface media-tooltip audio-time-slider-preview-content">
<media-slider-value class="audio-time-slider-value" type="pointer">
</media-slider-value>
</div>
</media-slider-preview>
</media-time-slider>
<media-time class="media-time-toggle audio-time-remaining-value" type="remaining" toggle>
</media-time>
</media-controls-group>
<media-controls-group class="audio-controls-end">
<media-playback-rate-button commandfor="vjs-IYqgEwNi-0-popup" class="media-button media-playback-rate-button" id="vjs-YCBr5ls1-0-4-trigger">
</media-playback-rate-button>
<media-tooltip trigger="vjs-YCBr5ls1-0-4-trigger" boundary="viewport" side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-tooltip-label>
</media-tooltip-label>
<media-tooltip-shortcut class="media-tooltip-shortcut">
</media-tooltip-shortcut>
</media-tooltip>
<media-menu side="top" align="center" boundary="viewport" class="media-popup media-popup-surface media-menu-popup audio-settings-menu-popup" id="vjs-IYqgEwNi-0-popup">
<media-menu-content class="media-menu-content">
<media-playback-rate-radio-group class="media-menu-radio-group">
<template>
<media-menu-radio-item class="media-menu-radio-item">
<span data-part="label">
</span>
<media-menu-item-indicator force-mount class="media-menu-item-indicator">
<media-icon name="check" class="media-menu-radio-item-icon">
</media-icon>
</media-menu-item-indicator>
</media-menu-radio-item>
</template>
</media-playback-rate-radio-group>
</media-menu-content>
</media-menu>
<media-mute-button commandfor="vjs-vz1xrwnK-0-popup" class="media-button media-mute-button" id="vjs-YCBr5ls1-0-5-trigger">
<media-icon name="volume-off" class="media-button-icon media-mute-button-off-icon">
</media-icon>
<media-icon name="volume-low" class="media-button-icon media-mute-button-low-icon">
</media-icon>
<media-icon name="volume-high" class="media-button-icon media-mute-button-high-icon">
</media-icon>
</media-mute-button>
<media-tooltip trigger="vjs-YCBr5ls1-0-5-trigger" delay="0" disabled sticky side="top" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-tooltip">
<media-tooltip-label>
</media-tooltip-label>
<media-tooltip-shortcut class="media-tooltip-shortcut">
</media-tooltip-shortcut>
</media-tooltip>
<media-volume-popover open-on-hover delay="200" close-delay="100" side="top" boundary="viewport" class="media-popup media-popup-safe-area media-popup-transition media-popup-surface media-volume-popover" id="vjs-vz1xrwnK-0-popup">
<media-volume-slider class="media-slider media-volume-slider" thumb-alignment="edge" orientation="vertical">
<media-slider-track class="media-slider-track">
<media-slider-fill class="media-slider-fill">
</media-slider-fill>
</media-slider-track>
<media-slider-thumb class="media-slider-thumb media-volume-slider-thumb">
</media-slider-thumb>
</media-volume-slider>
</media-volume-popover>
</media-controls-group>
</media-tooltip-group>
</media-controls-content>
</media-controls>
<media-hotkey keys="Space" action="togglePaused">
</media-hotkey>
<media-hotkey keys="k" action="togglePaused">
</media-hotkey>
<media-hotkey keys="m" action="toggleMuted">
</media-hotkey>
<media-hotkey keys="ArrowRight" action="seekStep">
</media-hotkey>
<media-hotkey keys="ArrowLeft" action="seekStep">
</media-hotkey>
<media-hotkey keys="l" action="seekStep">
</media-hotkey>
<media-hotkey keys="j" action="seekStep">
</media-hotkey>
<media-hotkey keys="ArrowUp" action="volumeStep">
</media-hotkey>
<media-hotkey keys="ArrowDown" action="volumeStep">
</media-hotkey>
<media-hotkey keys="0-9" action="seekToPercent">
</media-hotkey>
<media-hotkey keys="Home" action="seekToPercent" value="0">
</media-hotkey>
<media-hotkey keys="End" action="seekToPercent" value="100">
</media-hotkey>
<media-hotkey keys="&gt;" action="speedUp">
</media-hotkey>
<media-hotkey keys="&lt;" action="speedDown">
</media-hotkey>
<media-status-announcer class="media-status-announcer">
</media-status-announcer>
</media-container>`);

// node_modules/@videojs/html/dist/default/define/audio/skin2.js
var skin_default2 = '@property --media-slider-fill{syntax:"<percentage>";inherits:true;initial-value:0%}@property --media-slider-buffer{syntax:"<percentage>";inherits:true;initial-value:0%}video-player,live-video-player,media-i18n,media-dialog,media-alert-dialog,media-error-dialog,media-controls{display:contents}media-container video,media-container [slot=poster]{width:100%;height:100%;display:block}media-container video::-webkit-media-text-track-container{z-index:1;scale:.98;translate:0 var(--media-caption-track-y,0);transition:translate var(--media-caption-track-duration,0) ease-out;transition-delay:var(--media-caption-track-delay,0);font-family:inherit}:host{width:100%;display:grid}:host(:focus){outline:none!important}::slotted(video),::slotted(audio){margin:0!important}@layer base{:where(.media-skin){text-align:start;text-transform:none;letter-spacing:normal;font-style:normal;font-weight:400}:where(.media-skin),:where(.media-skin) *,:where(.media-skin) :before,:where(.media-skin) :after{box-sizing:border-box;border:0 solid;margin:0;padding:0}:where(.media-skin) button{font:inherit;color:inherit;text-transform:none;letter-spacing:inherit;appearance:none;background:0 0}:where(.media-skin) img,:where(.media-skin) svg,:where(.media-skin) media-icon{max-width:100%;display:block}:where(.media-skin) svg[fill=currentColor]{fill:currentColor}:where(.media-skin) svg[fill=none]{fill:none}:where(.media-skin) svg[stroke=currentColor]{stroke:currentColor}:where(.media-skin) video{border-radius:inherit;object-fit:var(--media-object-fit,contain);object-position:var(--media-object-position,center);width:100%;max-width:100%;height:100%;display:block}:where(.media-skin) media-icon>svg{width:100%;height:100%}:where(.media-skin) media-tooltip-group,:where(.media-skin) media-dialog,:where(.media-skin) media-alert-dialog,:where(.media-skin) media-error-dialog,:where(.media-skin) media-controls{display:contents}:where(.media-skin) [hidden][hidden]{display:none!important}@media (prefers-reduced-motion:no-preference){.media-skin{interpolate-size:allow-keywords}}@supports not selector(:popover-open){:where(.media-skin) [popover]:not([data-open],[data-ending-style]){display:none!important}.media-skin:is([data-preset=audio],[data-preset=live-audio]){overflow:visible!important}}}@layer components{:where(.media-skin[data-theme=default]) .media-status-announcer{clip-path:inset(50%);white-space:nowrap;border-width:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}:where(.media-skin[data-theme=default]) .media-container,:where(.media-skin[data-theme=default]).media-container{isolation:isolate;border-radius:var(--media-video-border-radius);background-color:var(--media-background);width:100%;min-width:0;height:100%;min-height:0;font-family:var(--media-font-family,"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif);font-size:calc(var(--media-spacing) * 3.25);-webkit-font-smoothing:auto;-moz-osx-font-smoothing:auto;outline-offset:-4px;transition-property:outline-offset,outline-color;transition-duration:.15s;transition-duration:var(--media-duration-fast);--spacing:var(--media-spacing);outline:2px solid #0000;line-height:1.5;transition-timing-function:cubic-bezier(0,0,.2,1);display:block;position:relative;overflow:clip;container:media-root/inline-size}:where(.media-skin[data-theme=default]) .media-container:after,:where(.media-skin[data-theme=default]).media-container:after{pointer-events:none;z-index:10;border-radius:inherit;content:"";border-style:solid;border-width:1px;border-color:var(--media-frame-border);position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-container:focus-visible,:where(.media-skin[data-theme=default]).media-container:focus-visible{outline-offset:2px;outline-color:var(--media-ring)}:where(.media-skin[data-theme=default]) .media-container:fullscreen:after,:where(.media-skin[data-theme=default]).media-container:fullscreen:after{content:"";display:none}.media-container>slot::slotted(video),:scope.media-container>slot::slotted(video){border-radius:inherit;object-fit:var(--media-object-fit,contain);object-position:var(--media-object-position,center);width:100%;max-width:100%;margin:0;display:block;height:100%!important}:where(.media-skin[data-theme=default]) .media-button{width:var(--media-control-size);height:var(--media-control-size);cursor:pointer;touch-action:manipulation;border-radius:var(--media-control-radius);text-align:center;min-height:0;color:inherit;outline-offset:-2px;transition-property:background-color,color,outline-offset,scale;transition-duration:var(--media-duration);will-change:scale;-webkit-user-select:none;user-select:none;corner-shape:var(--media-control-corner-shape);background-color:#0000;border-style:solid;border-width:0;outline:2px solid #0000;flex-shrink:0;place-items:center;padding:0;transition-timing-function:cubic-bezier(0,0,.2,1);display:grid}@media (hover:hover){:where(.media-skin[data-theme=default]) .media-button:not([aria-disabled=true]):hover{background-color:var(--media-accent);color:var(--media-accent-foreground)}}:where(.media-skin[data-theme=default]) .media-button:focus-visible{outline-offset:2px;outline-color:var(--media-ring)}:where(.media-skin[data-theme=default]) .media-button:not([aria-disabled=true]):active{scale:.97}:where(.media-skin[data-theme=default]) .media-button[aria-disabled=true]{cursor:not-allowed;opacity:.5}@media (prefers-reduced-motion:reduce){:where(.media-skin[data-theme=default]) .media-button{will-change:auto;transition-property:background-color,color;scale:1}}:where(.media-skin[data-theme=default]) .media-button:where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])){background-color:var(--media-accent);color:var(--media-accent-foreground)}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-dialog-actions{gap:calc(var(--media-spacing) * 2);flex-shrink:0;display:flex}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-dialog-backdrop{display:none}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-dialog-close{height:var(--media-control-size);width:auto;padding-inline:calc(var(--media-spacing) * 3);flex:none;font-weight:500;background-color:var(--media-primary)!important;color:var(--media-primary-foreground)!important}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-dialog-content{align-items:center;gap:calc(var(--media-spacing) * 2);flex-direction:row;flex:1;min-height:0;display:flex;overflow:visible}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-dialog-description{overflow-wrap:anywhere;opacity:.7;margin:0}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-dialog-popup{z-index:50;align-items:center;gap:calc(var(--media-spacing) * 3);background-color:var(--media-background);width:100%;height:100%;max-height:none;padding-inline:calc(var(--media-spacing) * 5);color:var(--media-controls-foreground);-webkit-backdrop-filter:var(--media-backdrop-filter-dialog);backdrop-filter:var(--media-backdrop-filter-dialog);transition-property:opacity,filter;transition-duration:.15s;transition-duration:var(--media-duration-slower);border-radius:9999px;outline-style:none;flex-direction:row;padding-block:0;transition-timing-function:cubic-bezier(0,0,.2,1);display:flex;position:absolute;inset:0;translate:none}@media (forced-colors:active){:where(.media-skin[data-theme=default][data-preset=audio]) .audio-dialog-popup{outline-offset:2px;outline:2px solid #0000}}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-dialog-popup:not([data-open]){display:none}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-dialog-popup:is([data-starting-style],[data-ending-style]){opacity:0;filter:blur(var(--media-hidden-popup-blur))}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-dialog-title{font-size:calc(var(--media-spacing) * 3.25);margin:0;font-weight:600;line-height:1.25}:where(.media-skin[data-theme=default]) .media-popup{color:inherit;border-style:solid;border-width:0;margin:0;overflow:visible}:where(.media-skin[data-theme=default]) .media-popup[data-ending-style]{transform:none}:where(.media-skin[data-theme=default]) .media-popup[data-starting-style]{transform:translate(var(--media-popup-translate-x-distance,0), var(--media-popup-translate-y-distance,0))}:where(.media-skin[data-theme=default]) .media-popup[data-side=bottom]{transform-origin:top;--media-popup-translate-y-distance:calc(var(--media-popup-translate-distance) * -1)}:where(.media-skin[data-theme=default]) .media-popup[data-side=left]{transform-origin:100%;--media-popup-translate-x-distance:var(--media-popup-translate-distance)}:where(.media-skin[data-theme=default]) .media-popup[data-side=right]{transform-origin:0;--media-popup-translate-x-distance:calc(var(--media-popup-translate-distance) * -1)}:where(.media-skin[data-theme=default]) .media-popup[data-side=top]{transform-origin:bottom;--media-popup-translate-y-distance:var(--media-popup-translate-distance)}:where(.media-skin[data-theme=default]) .media-popup:is([data-starting-style],[data-ending-style]){scale:var(--media-hidden-popup-scale) var(--media-hidden-popup-scale);opacity:0;filter:blur(var(--media-hidden-popup-blur))}:where(.media-skin[data-theme=default]) .media-popup-safe-area:before{pointer-events:auto;content:"";position:absolute}:where(.media-skin[data-theme=default]) .media-popup-safe-area[data-side=bottom]:before{content:"";height:var(--media-popup-side-offset);inset-inline:0;bottom:100%}:where(.media-skin[data-theme=default]) .media-popup-safe-area[data-side=left]:before{content:"";width:var(--media-popup-side-offset);inset-block:0;left:100%}:where(.media-skin[data-theme=default]) .media-popup-safe-area[data-side=right]:before{content:"";width:var(--media-popup-side-offset);inset-block:0;right:100%}:where(.media-skin[data-theme=default]) .media-popup-safe-area[data-side=top]:before{content:"";height:var(--media-popup-side-offset);inset-inline:0;top:100%}:where(.media-skin[data-theme=default]) .media-popup-transition{transition-property:opacity,filter,transform,scale;transition-duration:var(--media-duration-fast);transition-timing-function:cubic-bezier(0,0,.2,1)}:where(.media-skin[data-theme=default]) .media-popup-transition[data-ending-style]{transition-duration:var(--media-duration-instant)}:where(.media-skin[data-theme=default]) .media-tooltip{border-radius:var(--media-control-radius);padding-inline:calc(var(--media-spacing) * 2.5);padding-block:var(--media-spacing);font-size:calc(var(--media-spacing) * 3.25);white-space:nowrap;--media-popup-side-offset:var(--media-tooltip-side-offset)}:where(.media-skin[data-theme=default]) .media-tooltip[data-open]{align-items:center;gap:var(--media-spacing);display:flex}:where(.media-skin[data-theme=default]) .media-tooltip-shortcut{border-radius:var(--media-spacing);background-color:var(--media-muted);text-align:center;min-width:1.5em;font-family:inherit;font-size:calc(var(--media-spacing) * 2.75);padding:.1em;font-weight:600;line-height:1.25}:where(.media-skin[data-theme=default]) .media-popup-surface{background-color:var(--media-popover);color:var(--media-popover-foreground);box-shadow:0 0 0 1px var(--media-surface-border,var(--media-border)), var(--media-shadow-surface);-webkit-backdrop-filter:var(--media-backdrop-filter-surface);backdrop-filter:var(--media-backdrop-filter-surface)}:where(.media-skin[data-theme=default]) .media-popup-surface:after{content:"";z-index:10;pointer-events:none;border-radius:inherit;box-shadow:var(--media-shadow-surface-inset);position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-button-icon{width:var(--media-icon-size,calc(var(--media-spacing) * 4.5));height:var(--media-icon-size,calc(var(--media-spacing) * 4.5));filter:drop-shadow(0 1px 0 var(--media-shadow-current-color));transition-property:opacity,scale;transition-duration:.15s;transition-duration:var(--media-duration);text-shadow:inherit;grid-row-start:1;grid-column-start:1;transition-timing-function:cubic-bezier(0,0,.2,1)}:where(.media-skin[data-theme=default]) .media-seek-button-backward-icon{scale:-1 1}:where(.media-skin[data-theme=default]) .media-seek-button-backward-label{left:-1px}:where(.media-skin[data-theme=default]) .media-seek-button-content{display:grid;position:relative}:where(.media-skin[data-theme=default]) .media-seek-button-forward-label{right:-1px}:where(.media-skin[data-theme=default]) .media-seek-button-label{letter-spacing:-.05em;font-variant-numeric:tabular-nums;font-size:.7em;font-weight:500;position:absolute;bottom:-3px}:where(.media-skin[data-theme=default]) .media-mute-button-high-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-mute-button):not([data-muted]):not([data-volume-level=low]) .media-mute-button-high-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-mute-button-low-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-mute-button):not([data-muted])[data-volume-level=low] .media-mute-button-low-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-mute-button-off-icon{opacity:0}:where(:where(.media-skin[data-theme=default]) .media-mute-button)[data-muted] .media-mute-button-off-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-slider-buffer{pointer-events:none;position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-slider-buffer:before{border-radius:var(--media-control-radius);content:"";background-color:currentColor;width:100%;height:100%;position:absolute}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-slider-buffer:before{background-color:color-mix(in oklab, currentcolor 20%, transparent)}}:where(.media-skin[data-theme=default]) .media-slider-buffer[data-orientation=horizontal]{left:calc(var(--media-slider-chapter-start,0%) + var(--media-spacing) * var(--media-chapter-inset-start,0));right:max(calc(100% - var(--media-slider-buffer,0%)), calc(100% - var(--media-slider-chapter-end,100%) + var(--media-spacing) * var(--media-chapter-inset-end,0)));clip-path:inset(-1px 0)}:where(.media-skin[data-theme=default]) .media-slider-buffer[data-orientation=horizontal]:before{content:"";min-width:var(--media-spacing);left:0}:where(.media-skin[data-theme=default]) .media-slider-buffer[data-orientation=vertical]{bottom:calc(var(--media-slider-chapter-start,0%) + var(--media-spacing) * var(--media-chapter-inset-start,0));top:max(calc(100% - var(--media-slider-buffer,0%)), calc(100% - var(--media-slider-chapter-end,100%) + var(--media-spacing) * var(--media-chapter-inset-end,0)));clip-path:inset(0 -1px)}:where(.media-skin[data-theme=default]) .media-slider-buffer[data-orientation=vertical]:before{content:"";min-height:var(--media-spacing);bottom:0}:where(.media-skin[data-theme=default]) .media-slider-fill{pointer-events:none;position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-slider-fill:before{border-radius:var(--media-control-radius);content:"";background-color:var(--media-primary);width:100%;height:100%;position:absolute}:where(.media-skin[data-theme=default]) .media-slider-fill[data-orientation=horizontal]{left:calc(var(--media-slider-chapter-start,0%) + var(--media-spacing) * var(--media-chapter-inset-start,0));right:max(calc(100% - var(--media-slider-fill,0%)), calc(100% - var(--media-slider-chapter-end,100%) + var(--media-spacing) * var(--media-chapter-inset-end,0)));clip-path:inset(-1px 0)}:where(:where(.media-skin[data-theme=default]) .media-slider)[data-dragging] .media-slider-fill[data-orientation=horizontal]{left:calc(var(--media-slider-chapter-start,0%) + var(--media-spacing) * var(--media-chapter-inset-start,0));right:max(calc(100% - var(--media-slider-pointer,0%)), calc(100% - var(--media-slider-chapter-end,100%) + var(--media-spacing) * var(--media-chapter-inset-end,0)));clip-path:inset(-1px 0)}:where(.media-skin[data-theme=default]) .media-slider-fill[data-orientation=horizontal]:before{content:"";min-width:var(--media-spacing);left:0}:where(.media-skin[data-theme=default]) .media-slider-fill[data-orientation=vertical]{bottom:calc(var(--media-slider-chapter-start,0%) + var(--media-spacing) * var(--media-chapter-inset-start,0));top:max(calc(100% - var(--media-slider-fill,0%)), calc(100% - var(--media-slider-chapter-end,100%) + var(--media-spacing) * var(--media-chapter-inset-end,0)));clip-path:inset(0 -1px)}:where(:where(.media-skin[data-theme=default]) .media-slider)[data-dragging] .media-slider-fill[data-orientation=vertical]{bottom:calc(var(--media-slider-chapter-start,0%) + var(--media-spacing) * var(--media-chapter-inset-start,0));top:max(calc(100% - var(--media-slider-pointer,0%)), calc(100% - var(--media-slider-chapter-end,100%) + var(--media-spacing) * var(--media-chapter-inset-end,0)));clip-path:inset(0 -1px)}:where(.media-skin[data-theme=default]) .media-slider-fill[data-orientation=vertical]:before{content:"";min-height:var(--media-spacing);bottom:0}:where(.media-skin[data-theme=default]) .media-slider-thumb{top:50%;left:var(--media-slider-fill,0%);z-index:10;width:calc(var(--media-spacing) * 3);height:calc(var(--media-spacing) * 3);border-radius:var(--media-control-radius);box-shadow:0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--media-shadow-thumb);outline-offset:-4px;transition-property:opacity,height,width,outline-offset,scale;transition-duration:.15s;transition-duration:var(--media-duration-slider);-webkit-user-select:none;user-select:none;background-color:#fff;outline:4px solid #0000;transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute;translate:-50% -50%}:where(:where(.media-skin[data-theme=default]) .media-slider)[data-dragging] .media-slider-thumb{scale:.9}:where(.media-skin[data-theme=default]) .media-slider-thumb:after{pointer-events:none;inset:calc(var(--media-spacing) * -1);border-radius:inherit;opacity:0;transition-property:opacity,scale;transition-duration:.15s;transition-duration:var(--media-duration);content:"";transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute;scale:.5;box-shadow:0 0 #0000,0 0 #0000,0 0 #0000,0 0 #0000,0 0 0 2px}@media (hover:hover){:where(.media-skin[data-theme=default]) .media-slider-thumb:hover{outline-offset:0px;outline-color:currentColor}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-slider-thumb:hover{outline-color:color-mix(in oklab, currentcolor 15%, transparent)}}}:where(.media-skin[data-theme=default]) .media-slider-thumb:focus-visible{outline-offset:0px;outline-color:currentColor}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-slider-thumb:focus-visible{outline-color:color-mix(in oklab, currentcolor 15%, transparent)}}:where(.media-skin[data-theme=default]) .media-slider-thumb:focus-visible:after{content:"";opacity:1;scale:1}:where(:where(.media-skin[data-theme=default]) .media-slider)[data-dragging] .media-slider-thumb[data-orientation=horizontal]{left:var(--media-slider-pointer)}:where(.media-skin[data-theme=default]) .media-slider-thumb[data-orientation=vertical]{top:calc(100% - var(--media-slider-fill,0%));left:50%}:where(:where(.media-skin[data-theme=default]) .media-slider)[data-dragging] .media-slider-thumb[data-orientation=vertical]{top:calc(100% - var(--media-slider-pointer))}:where(.media-skin[data-theme=default]) .media-slider-track{isolation:isolate;-webkit-user-select:none;user-select:none;border-radius:9999px;width:100%;position:relative}:where(.media-skin[data-theme=default]) .media-slider-track:before{pointer-events:none;border-radius:var(--media-control-radius);content:"";background-color:currentColor;position:absolute;inset:0}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-slider-track:before{background-color:color-mix(in oklab, currentcolor 20%, transparent)}}:where(.media-skin[data-theme=default]) .media-slider-track[data-orientation=horizontal]{height:var(--media-spacing)}:where(.media-skin[data-theme=default]) .media-slider-track[data-orientation=vertical]{height:100%;width:var(--media-spacing)}:where(.media-skin[data-theme=default]) .media-slider{cursor:pointer;transition-property:--media-slider-fill,--media-slider-buffer;transition-duration:.15s;transition-duration:var(--media-duration-slider);border-radius:9999px;outline-style:none;flex:1;justify-content:center;align-items:center;transition-timing-function:cubic-bezier(0,0,.2,1);display:flex;position:relative}@media (forced-colors:active){:where(.media-skin[data-theme=default]) .media-slider{outline-offset:2px;outline:2px solid #0000}}:where(.media-skin[data-theme=default]) .media-slider[data-disabled]{pointer-events:none}:where(.media-skin[data-theme=default]) .media-slider[data-dragging]{transition-duration:0s}:where(.media-skin[data-theme=default]) .media-slider[data-orientation=horizontal]{height:var(--media-slider-height,calc(var(--media-spacing) * 8));min-width:calc(var(--media-spacing) * 18)}:where(.media-skin[data-theme=default]) .media-slider[data-orientation=vertical]{height:calc(var(--media-spacing) * 18);width:calc(var(--media-spacing) * 8);min-width:0}:where(.media-skin[data-theme=default]) .media-volume-slider-thumb{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-volume-popover{border-radius:var(--media-control-radius);padding-inline:0;padding-block:calc(var(--media-spacing) * 3);--media-popup-side-offset:var(--media-popover-side-offset)}:where(.media-skin[data-theme=default]) .media-volume-popover[data-side=right]{padding:0;padding-inline:calc(var(--media-spacing) * 3);--media-popover-side-offset:0rem;border-radius:0;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;background-color:#0000!important}:where(.media-skin[data-theme=default]) .media-volume-popover[data-side=right]:after{content:"";display:none}:where(.media-skin[data-theme=default]) .media-play-button-pause-icon{scale:var(--media-hidden-icon-scale) var(--media-hidden-icon-scale);opacity:0}:where(:where(.media-skin[data-theme=default]) .media-play-button)[data-started]:not([data-paused]):not([data-ended]) .media-play-button-pause-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-play-button-play-icon{scale:var(--media-hidden-icon-scale) var(--media-hidden-icon-scale);opacity:0}:where(:where(.media-skin[data-theme=default]) .media-play-button):not([data-ended]):not([data-started]) .media-play-button-play-icon,:where(:where(.media-skin[data-theme=default]) .media-play-button):not([data-ended])[data-paused] .media-play-button-play-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-play-button-restart-icon{scale:var(--media-hidden-icon-scale) var(--media-hidden-icon-scale);opacity:0}:where(:where(.media-skin[data-theme=default]) .media-play-button)[data-ended] .media-play-button-restart-icon{opacity:1;scale:1}:where(.media-skin[data-theme=default]) .media-buffering-indicator{pointer-events:none;color:var(--media-controls-foreground);place-content:center;display:none;position:absolute;inset:0}:where(.media-skin[data-theme=default]) .media-buffering-indicator:not([data-visible]){--media-spinner-animation:none}:where(.media-skin[data-theme=default]) .media-buffering-indicator:before{background-color:var(--media-backdrop);content:"";-webkit-backdrop-filter:var(--media-backdrop-filter-indicator);backdrop-filter:var(--media-backdrop-filter-indicator);position:absolute;inset:0}@supports (color:color-mix(in lab, red, red)){:where(.media-skin[data-theme=default]) .media-buffering-indicator:before{background-color:color-mix(in oklab, var(--media-backdrop) 35%, transparent)}}:where(.media-skin[data-theme=default]) .media-buffering-indicator[data-visible]{display:grid}:where(.media-skin[data-theme=default]) .media-buffering-indicator-spinner-icon{z-index:30;width:var(--media-icon-size,calc(var(--media-spacing) * 4.5));height:var(--media-icon-size,calc(var(--media-spacing) * 4.5));filter:drop-shadow(0 1px 0 var(--media-shadow-current-color));position:relative}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-play-button{display:inline-flex;position:relative}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-play-button-buffering-indicator{z-index:20;border-radius:var(--media-control-radius);color:inherit!important}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-play-button-buffering-indicator:before{content:"";display:none}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-play-button-buffering-indicator[data-visible]{background-color:var(--media-controls)}:where(.media-skin[data-theme=default]) .media-playback-rate-button{font-variant-numeric:tabular-nums}@supports not (text-fit:shrink){:where(.media-skin[data-theme=default]) .media-playback-rate-button{font-size:min(1em, calc(4em / (var(--media-playback-rate-length,3) + 1)))}}:where(.media-skin[data-theme=default]) .media-playback-rate-button:after{text-align:center;white-space:nowrap;content:attr(data-rate) "\xD7";text-fit:shrink;width:80%;min-width:0}:where(.media-skin[data-theme=default]) .media-menu-item-indicator{opacity:0;flex-shrink:0;margin-inline-start:auto;margin-inline-end:calc(var(--media-spacing) * -1)}:where(:where(.media-skin[data-theme=default]) .media-menu-radio-item)[aria-checked=true] .media-menu-item-indicator{opacity:1}:where(.media-skin[data-theme=default]) .media-menu-radio-item{cursor:pointer;justify-content:space-between;align-items:center;gap:calc(var(--media-spacing) * 1.5);border-radius:var(--media-menu-item-radius);padding-inline:calc(var(--media-spacing) * 2);padding-block:calc(var(--media-spacing) * 1.5);text-align:start;white-space:nowrap;color:inherit;font-variant-numeric:tabular-nums;outline-offset:-2px;transition-property:background-color,color;transition-duration:.15s;transition-duration:var(--media-duration-fast);-webkit-user-select:none;user-select:none;text-shadow:0 1px 0 var(--media-shadow-current-color);outline:2px solid #0000;transition-timing-function:cubic-bezier(.4,0,.2,1);display:flex;position:relative}:where(.media-skin[data-theme=default]) .media-menu-radio-item:focus-visible{outline-offset:2px;outline-color:var(--media-ring)}:where(.media-skin[data-theme=default]) .media-menu-radio-item[aria-disabled=true]{pointer-events:none;cursor:not-allowed;opacity:.5}:where(.media-skin[data-theme=default]) .media-menu-radio-item[data-custom]{font-style:italic}:where(.media-skin[data-theme=default]) .media-menu-radio-item[data-availability=unavailable],:where(.media-skin[data-theme=default]) .media-menu-radio-item[data-availability=unsupported]{display:none}:where(.media-skin[data-theme=default]) .media-menu-radio-item:where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])){background-color:var(--media-accent);color:var(--media-accent-foreground)}@supports (top:anchor(top)){:where(.media-skin[data-theme=default]) .media-menu-radio-item{transition-duration:var(--media-duration-instant)}:where(.media-skin[data-theme=default]) .media-menu-radio-item[data-highlighted]{anchor-name:--media-menu-item-highlight-anchor}:where(.media-skin[data-theme=default]) .media-menu-radio-item:where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])){transition-duration:var(--media-duration-slow);background-color:#0000}}:where(.media-skin[data-theme=default]) .media-menu-radio-item-icon{width:var(--media-icon-size,calc(var(--media-spacing) * 4.5));height:var(--media-icon-size,calc(var(--media-spacing) * 4.5));color:var(--media-muted-foreground);filter:drop-shadow(0 1px 0 var(--media-shadow-current-color));flex-shrink:0}:where(:where(.media-skin[data-theme=default]) .media-menu-radio-item):where(:focus-visible,[aria-expanded=true],[data-highlighted]):where(:not([aria-disabled=true])) .media-menu-radio-item-icon{color:inherit}:where(.media-skin[data-theme=default][data-preset=audio]) .media-popup{color:inherit;border-style:solid;border-width:0;margin:0;overflow:visible}:where(.media-skin[data-theme=default][data-preset=audio]) .media-popup[data-ending-style]{transform:none}:where(.media-skin[data-theme=default][data-preset=audio]) .media-popup[data-starting-style]{transform:translate(var(--media-popup-translate-x-distance,0), var(--media-popup-translate-y-distance,0))}:where(.media-skin[data-theme=default][data-preset=audio]) .media-popup[data-side=bottom]{transform-origin:top;--media-popup-translate-y-distance:calc(var(--media-popup-translate-distance) * -1)}:where(.media-skin[data-theme=default][data-preset=audio]) .media-popup[data-side=left]{transform-origin:100%;--media-popup-translate-x-distance:var(--media-popup-translate-distance)}:where(.media-skin[data-theme=default][data-preset=audio]) .media-popup[data-side=right]{transform-origin:0;--media-popup-translate-x-distance:calc(var(--media-popup-translate-distance) * -1)}:where(.media-skin[data-theme=default][data-preset=audio]) .media-popup[data-side=top]{transform-origin:bottom;--media-popup-translate-y-distance:var(--media-popup-translate-distance)}:where(.media-skin[data-theme=default][data-preset=audio]) .media-popup:is([data-starting-style],[data-ending-style]){scale:var(--media-hidden-popup-scale) var(--media-hidden-popup-scale);opacity:0;filter:blur(var(--media-hidden-popup-blur))}:where(.media-skin[data-theme=default][data-preset=audio]) .media-popup-surface{background-color:var(--media-popover);color:var(--media-popover-foreground);box-shadow:0 0 0 1px var(--media-surface-border,var(--media-border)), var(--media-shadow-surface);-webkit-backdrop-filter:var(--media-backdrop-filter-surface);backdrop-filter:var(--media-backdrop-filter-surface)}:where(.media-skin[data-theme=default][data-preset=audio]) .media-popup-surface:after{content:"";z-index:10;pointer-events:none;border-radius:inherit;box-shadow:var(--media-shadow-surface-inset);position:absolute;inset:0}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content{max-height:inherit;overscroll-behavior:none;transition-property:translate,filter;transition-duration:.15s;transition-duration:var(--media-duration-menu);anchor-scope:--media-menu-item-highlight-anchor;outline-style:none;transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute;overflow:auto}@media (forced-colors:active){:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content{outline-offset:2px;outline:2px solid #0000}}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content:not([data-submenu]){inset-inline:var(--media-spacing);top:var(--media-spacing);gap:calc(var(--media-spacing) * .5);flex-direction:column;display:flex}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content:not([data-submenu])[data-child-open]{filter:blur(var(--media-hidden-blur));translate:-100%}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content:not([data-submenu])[data-child-open]:before{content:"";display:none}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content[data-submenu]{z-index:10;max-height:inherit;padding:var(--media-spacing);inset-inline:0;top:0}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content:not([data-submenu])[data-child-open]:where(:dir(rtl),[dir=rtl],[dir=rtl] *){translate:100%}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content:is([data-starting-style],[data-ending-style]):before{content:"";display:none}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content[data-submenu]:is([data-starting-style],[data-ending-style]){pointer-events:none;filter:blur(var(--media-hidden-blur));overflow:hidden;translate:100%}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content[data-submenu]:is([data-starting-style],[data-ending-style]):where(:dir(rtl),[dir=rtl],[dir=rtl] *){translate:-100%}@supports (top:anchor(top)){:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content:before{content:"";position-anchor:--media-menu-item-highlight-anchor;inset:anchor(inside);overflow-anchor:none;pointer-events:none;border-radius:var(--media-menu-item-radius);background-color:var(--media-accent);transition:inset var(--media-duration-fast) ease-in-out;position:absolute}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content:has([data-highlighted=""]):before{content:"";transition-duration:0s}}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-content:is([data-starting-style],[data-ending-style]) :before{content:"";display:none}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-popup{height:var(--media-menu-height);max-height:min(var(--media-menu-available-height,calc(var(--media-spacing) * 56)), calc(var(--media-spacing) * 56));width:var(--media-menu-width);max-width:var(--media-menu-available-width);min-width:calc(var(--media-spacing) * 44);overscroll-behavior:none;border-radius:var(--media-popup-radius);padding:var(--media-spacing);transition-property:opacity,filter,transform,scale;transition-duration:var(--media-duration-fast);--media-popup-side-offset:var(--media-popover-side-offset);border-style:solid;border-width:0;margin:0;transition-timing-function:cubic-bezier(0,0,.2,1);overflow:hidden!important}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-popup:is([data-starting-style],[data-ending-style]){transition-property:opacity,filter,transform,scale;transition-duration:var(--media-duration-fast);transition-timing-function:cubic-bezier(0,0,.2,1)}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-radio-group{max-height:inherit;gap:calc(var(--media-spacing) * .5);anchor-scope:--media-menu-item-highlight-anchor;flex-direction:column;display:flex}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-radio-group:is([data-starting-style],[data-ending-style]):before{content:"";display:none}@supports (top:anchor(top)){:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-radio-group:before{content:"";position-anchor:--media-menu-item-highlight-anchor;inset:anchor(inside);overflow-anchor:none;pointer-events:none;border-radius:var(--media-menu-item-radius);background-color:var(--media-accent);transition:inset var(--media-duration-fast) ease-in-out;position:absolute}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-radio-group:has([data-highlighted=""]):before{content:"";transition-duration:0s}}:where(.media-skin[data-theme=default][data-preset=audio]) .media-menu-radio-group:is([data-starting-style],[data-ending-style]) :before{content:"";display:none}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-settings-menu-popup{min-width:0!important}:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider{cursor:pointer;transition-property:--media-slider-fill,--media-slider-buffer;transition-duration:.15s;transition-duration:var(--media-duration-slider);border-radius:9999px;outline-style:none;flex:1;justify-content:center;align-items:center;transition-timing-function:cubic-bezier(0,0,.2,1);display:flex;position:relative}@media (forced-colors:active){:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider{outline-offset:2px;outline:2px solid #0000}}:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider[data-disabled]{pointer-events:none}:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider[data-dragging]{transition-duration:0s}:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider[data-orientation=horizontal]{height:var(--media-slider-height,calc(var(--media-spacing) * 8));min-width:calc(var(--media-spacing) * 18)}:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider[data-orientation=vertical]{height:calc(var(--media-spacing) * 18);width:calc(var(--media-spacing) * 8);min-width:0}:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider-preview{height:var(--media-spacing);min-width:var(--media-slider-preview-max-width);--media-slider-preview-max-height:var(--media-slider-preview-max-width);--media-slider-preview-max-width:min(calc(var(--media-spacing) * 32), 100cqi);position:relative}:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider-preview:before{pointer-events:none;z-index:1;width:var(--media-spacing);height:var(--media-spacing);border-radius:var(--media-control-radius);opacity:0;transition-property:opacity,scale;transition-duration:.15s;transition-duration:var(--media-duration-slow);content:"";background-color:currentColor;transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute;top:50%;left:50%;translate:-50% -50%;scale:.5}:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider-preview[data-pointing]:not([data-dragging]):before{content:"";opacity:1;scale:1}@container media-root (width>=30rem){:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider-preview{--media-slider-preview-max-width:min(calc(var(--media-spacing) * 40), 100cqi)}}@container media-root (width>=42rem){:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider-preview{--media-slider-preview-max-width:min(calc(var(--media-spacing) * 48), 100cqi)}}:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider-preview-content{max-width:var(--media-slider-preview-max-width);transform-origin:bottom;translate:-50% var(--media-hidden-preview-offset);scale:var(--media-hidden-preview-scale) var(--media-hidden-preview-scale);opacity:0;filter:blur(var(--media-hidden-blur));transition-property:filter,opacity,scale;transition-duration:.15s;transition-duration:var(--media-duration);transition-timing-function:cubic-bezier(0,0,.2,1);position:absolute}:where(.media-skin[data-theme=default][data-preset=audio]) :where(.media-slider):has(:focus-visible) .media-slider-preview-content,:where(.media-skin[data-theme=default][data-preset=audio]) :where(.media-slider-preview)[data-pointing] .media-slider-preview-content{opacity:1;filter:none;scale:1}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-time-slider-preview-content{bottom:calc(100% + var(--media-slider-preview-label-offset));font-variant-numeric:tabular-nums;left:50%}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-time-slider-thumb{opacity:0}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-time-slider-thumb[data-interactive]{opacity:1}@media (pointer:fine){@media (hover:hover){:where(:where(.media-skin[data-theme=default][data-preset=audio]) .media-slider):hover .audio-time-slider-thumb{opacity:1;scale:1}}}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-time-slider-value{font-variant-numeric:tabular-nums}:where(.media-skin[data-theme=default][data-preset=audio]) .media-tooltip{border-radius:var(--media-control-radius);padding-inline:calc(var(--media-spacing) * 2.5);padding-block:var(--media-spacing);font-size:calc(var(--media-spacing) * 3.25);white-space:nowrap;--media-popup-side-offset:var(--media-tooltip-side-offset)}:where(.media-skin[data-theme=default][data-preset=audio]) .media-tooltip[data-open]{align-items:center;gap:var(--media-spacing);display:flex}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-controls-content{z-index:20;border-radius:var(--media-controls-radius);background-color:var(--media-controls);padding:calc(var(--media-spacing) * .5);color:var(--media-controls-foreground);box-shadow:0 0 0 1px var(--media-surface-border,var(--media-border)), var(--media-shadow-surface);-webkit-backdrop-filter:var(--media-backdrop-filter-surface);backdrop-filter:var(--media-backdrop-filter-surface);text-shadow:0 1px 0 var(--media-shadow-current-color);align-items:center;display:flex;position:relative}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-controls-content:after{content:"";z-index:10;pointer-events:none;border-radius:inherit;box-shadow:var(--media-shadow-surface-inset);position:absolute;inset:0}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-controls-content:where(:dir(rtl),[dir=rtl],[dir=rtl] *){flex-direction:row-reverse}@container media-root (width>=32rem){:where(.media-skin[data-theme=default][data-preset=audio]) .audio-controls-content{padding:var(--media-spacing)}}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-controls-end{align-items:center;gap:1px;display:flex}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-controls-end:where(:dir(rtl),[dir=rtl],[dir=rtl] *){flex-direction:row-reverse}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-controls-start{align-items:center;gap:1px;display:flex}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-controls-start:where(:dir(rtl),[dir=rtl],[dir=rtl] *){flex-direction:row-reverse}@container media-root (width<32rem){:where(.media-skin[data-theme=default][data-preset=audio]) .audio-seek-button{display:none}}@container audio-time-controls (width<16rem){:where(.media-skin[data-theme=default][data-preset=audio]) .audio-time-remaining-value{display:none}}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-time-slider-group{align-items:center;gap:calc(var(--media-spacing) * 2.5);min-width:0;padding-inline:calc(var(--media-spacing) * 3);flex:1;display:flex;container:audio-time-controls/inline-size}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-time-slider-group:where(:dir(rtl),[dir=rtl],[dir=rtl] *){flex-direction:row-reverse}:where(.media-skin[data-theme=default][data-preset=audio]) .media-time-toggle{cursor:pointer;font-variant-numeric:tabular-nums;outline-offset:-2px;transition-property:outline-color,outline-offset;transition-duration:.15s;transition-duration:var(--media-duration-fast);border-radius:.25rem;outline:2px solid #0000;transition-timing-function:cubic-bezier(0,0,.2,1)}:where(.media-skin[data-theme=default][data-preset=audio]) .media-time-toggle:focus-visible{outline-offset:2px;outline-color:var(--media-ring)}:where(.media-skin[data-theme=default][data-preset=audio]) .media-time-toggle[aria-disabled=true]{cursor:not-allowed;opacity:.5}:where(.media-skin[data-theme=default][data-preset=audio]) .media-time-value{font-variant-numeric:tabular-nums;transition-property:opacity;transition-duration:.15s;transition-duration:var(--media-duration-slow);transition-timing-function:cubic-bezier(0,0,.2,1)}:where(.media-skin[data-theme=default][data-preset=audio]) .media-time-value[data-unavailable]{opacity:.5}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-skin,:where(.media-skin[data-theme=default][data-preset=audio]).audio-skin{background-color:#0000!important;height:auto!important;overflow:visible!important}:where(.media-skin[data-theme=default][data-preset=audio]) .audio-skin:after,:where(.media-skin[data-theme=default][data-preset=audio]).audio-skin:after{content:"";display:none}}@layer utilities;@layer base.theme{.media-skin{--media-background:oklch(0% 0 0);--media-foreground:oklch(100% 0 0);--media-controls:oklch(0% 0 0/.35);--media-controls-foreground:var(--media-foreground);--media-popover:oklch(100% 0 0/.1);--media-popover-foreground:var(--media-foreground);--media-primary:var(--media-accent-color,var(--media-default-accent-color));--media-primary-foreground:var(--media-accent-text-color,var(--media-default-accent-text-color));--media-accent:var(--media-accent-color,color-mix(in oklab, var(--media-default-accent-color) 10%, transparent));--media-accent-foreground:var(--media-accent-text-color,currentColor);--media-muted:oklch(100% 0 0/.15);--media-muted-foreground:color-mix(in oklab, var(--media-foreground) 65%, transparent);--media-border:oklch(0% 0 0/.1);--media-ring:oklch(100% 0 0);--media-backdrop:oklch(0% 0 0);--media-live-color:oklch(65% .22 27);--media-shadow-surface:0 1px 3px 0 oklch(0% 0 0/.15), 0 1px 2px -1px oklch(0% 0 0/.15);--media-shadow-surface-inset:inset 0 1px 0 0 #ffffff1a, inset 0 0 0 1px #ffffff0d;--media-shadow-thumb:0 0 0 1px #0000001a, 0 1px 3px 0 #00000059, 0 1px 2px -1px #00000059;--media-shadow-tooltip:0 0 0 1px var(--media-border), var(--media-shadow-surface);--media-shadow-separator:0 1px 0 0 oklch(100% 0 0/.075);--media-shadow-current-color:oklch(from currentColor 0 0 0 / clamp(0, calc((l - .5) * .5), .15));--media-shadow-subtle-current-color:color-mix(in oklab, var(--media-shadow-current-color) 40%, transparent);--media-text-shadow-dialog:0 1px 0 #00000040;--media-backdrop-filter-surface:blur(16px) saturate(125%);--media-backdrop-filter-indicator:blur(8px);--media-backdrop-filter-dialog:blur(16px) saturate(125%);--media-control-corner-shape:round;--media-control-radius:99px;--media-control-size:calc(var(--media-spacing) * 9);--media-controls-radius:var(--media-control-radius);--media-default-accent-color:oklch(100% 0 0);--media-default-accent-text-color:oklch(0% 0 0);--media-duration-instant:50ms;--media-duration-fast:.1s;--media-duration:.15s;--media-duration-slow:.2s;--media-duration-slower:.25s;--media-duration-controls:.1s;--media-duration-dialog:.35s;--media-duration-indicator:var(--media-duration-slower);--media-duration-menu:.25s;--media-duration-slider:var(--media-duration-fast);--media-delay-dialog:.1s;--media-hidden-scale:.95;--media-hidden-blur:8px;--media-hidden-offset:calc(var(--media-spacing) * 1);--media-hidden-icon-scale:0;--media-hidden-indicator-scale:.9;--media-hidden-indicator-offset:-25%;--media-hidden-playback-scale:.85;--media-hidden-popup-scale:.95;--media-hidden-popup-blur:4px;--media-hidden-preview-scale:.8;--media-hidden-preview-offset:calc(var(--media-spacing) * 2);--media-hidden-seek-offset:60%;--media-menu-item-radius:calc(var(--media-spacing) * 2);--media-popover-boundary-offset:calc(var(--media-spacing) * 3);--media-popover-side-offset:calc(var(--media-spacing) * 3);--media-popup-radius:calc(var(--media-spacing) * 3);--media-popup-translate-distance:calc(var(--media-spacing) * 2);--media-tooltip-boundary-offset:var(--media-popover-boundary-offset);--media-tooltip-side-offset:var(--media-popover-side-offset);--media-dialog-radius:calc(var(--media-spacing) * 7);--media-dialog-width:calc(100% - var(--media-spacing) * 6);--media-dialog-max-width:calc(var(--media-spacing) * 72);--media-slider-preview-label-offset:calc(var(--media-spacing) * 10.5);--media-video-border-radius:var(--media-border-radius,28px);--media-scale:1;--media-scrollbar-thumb-color:color-mix(in oklab, currentColor 30%, transparent);--media-spacing:calc(var(--media-scale-unit,16px) * var(--media-scale) / 4);scrollbar-color:var(--media-scrollbar-thumb-color) transparent;scrollbar-width:thin}@supports (color:contrast-color(red)){.media-skin{--media-primary-foreground:var(--media-accent-text-color,contrast-color(var(--media-primary)));--media-accent-foreground:var(--media-accent-text-color,contrast-color(var(--media-accent-color,var(--media-internal-accent-text-fallback,oklch(0% 0 0)))))}}@supports (color:oklch(from red l c h)){.media-skin{--media-shadow-subtle-current-color:oklch(from var(--media-shadow-current-color) l c h / calc(alpha * .4))}}@supports (color:oklch(from currentColor l c h)){.media-skin{--media-scrollbar-thumb-color:oklch(from currentColor l c h / .3)}}.media-skin::-webkit-scrollbar-thumb{background:var(--media-scrollbar-thumb-color);border-radius:9999px}.media-skin:fullscreen{--media-object-fit:contain;--media-video-border-radius:0}@media (width>=1280px){.media-skin:fullscreen{--media-scale:1.25}}@media (width>=1536px){.media-skin:fullscreen{--media-scale:1.5}}@media (width>=1920px){.media-skin:fullscreen{--media-scale:1.75}}}@layer base.preset{.media-skin:is([data-preset=audio],[data-preset=live-audio]){--media-background:oklch(100% 0 0);--media-foreground:oklch(0% 0 0);--media-controls:oklch(100% 0 0/.5);--media-controls-foreground:var(--media-foreground);--media-popover:var(--media-controls);--media-popover-foreground:var(--media-foreground);--media-muted:oklch(0% 0 0/.1);--media-surface-border:oklch(0% 0 0/.05);--media-primary:var(--media-accent-color,var(--media-foreground));--media-border:oklch(0% 0 0/.1);--media-ring:var(--media-foreground);--media-default-accent-color:oklch(0% 0 0);--media-default-accent-text-color:oklch(100% 0 0);--media-internal-accent-text-fallback:oklch(100% 0 0);--media-popover-boundary-offset:calc(var(--media-spacing) * 2);--media-popover-side-offset:calc(var(--media-spacing) * 3);--media-slider-preview-label-offset:calc(var(--media-spacing) * 10)}@supports (color:light-dark(red, red)){.media-skin:is([data-preset=audio],[data-preset=live-audio]){--media-background:light-dark(oklch(100% 0 0),oklch(0% 0 0));--media-foreground:light-dark(oklch(0% 0 0),oklch(100% 0 0));--media-controls:light-dark(oklch(100% 0 0/.5),oklch(0% 0 0/.4));--media-border:light-dark(oklch(0% 0 0/.1),oklch(100% 0 0/.1));--media-muted:light-dark(oklch(0% 0 0/.1),oklch(100% 0 0/.1));--media-default-accent-color:light-dark(oklch(0% 0 0),oklch(100% 0 0));--media-default-accent-text-color:light-dark(oklch(100% 0 0),oklch(0% 0 0));--media-internal-accent-text-fallback:light-dark(oklch(100% 0 0),oklch(0% 0 0))}}.media-skin:is([data-preset=audio],[data-preset=live-audio])[data-theme=neutral]{--media-controls:var(--media-background);--media-popover:var(--media-background);--media-controls-radius:calc(var(--media-spacing) * 3.5);--media-popover-boundary-offset:calc(var(--media-spacing) * 3)}@media (prefers-reduced-transparency:reduce),(prefers-contrast:more){.media-skin:is([data-preset=audio],[data-preset=live-audio]){--media-controls:var(--media-background);--media-surface-border:oklch(0% 0 0/.05)}@supports (color:light-dark(red, red)){.media-skin:is([data-preset=audio],[data-preset=live-audio]){--media-surface-border:light-dark(oklch(0% 0 0/.05),#0000)}}}}@layer base.preferences{@media (pointer:fine) and (prefers-reduced-motion:no-preference){.media-skin:not([data-controls-visible]){--media-duration-controls:.3s}}@media (pointer:coarse) and (prefers-reduced-motion:no-preference){.media-skin:not([data-controls-visible]){--media-duration-controls:.15s}}@media (prefers-reduced-motion:reduce){.media-skin{--media-duration-fast:var(--media-duration-instant);--media-duration:var(--media-duration-instant);--media-duration-slow:var(--media-duration-instant);--media-duration-slower:var(--media-duration-instant);--media-duration-controls:var(--media-duration-instant);--media-duration-dialog:var(--media-duration-instant);--media-duration-indicator:var(--media-duration-instant);--media-duration-menu:0s;--media-duration-slider:0s;--media-delay-dialog:0s;--media-hidden-scale:1;--media-hidden-blur:0px;--media-hidden-offset:0px;--media-hidden-icon-scale:1;--media-hidden-indicator-scale:1;--media-hidden-indicator-offset:0px;--media-hidden-playback-scale:1;--media-hidden-popup-scale:1;--media-hidden-popup-blur:0px;--media-hidden-preview-scale:1;--media-hidden-preview-offset:0px;--media-hidden-seek-offset:0px;--media-popup-translate-distance:0px;--media-spinner-animation:none;--media-icon-airplay-fill-animation:none;--media-icon-airplay-triangle-animation:none}}@media (prefers-reduced-transparency:reduce),(prefers-contrast:more){.media-skin{--media-popover:var(--media-background);--media-scrollbar-thumb-color:color-mix(in oklab, currentColor 80%, transparent);--media-backdrop-filter-surface:none;--media-backdrop-filter-indicator:none;--media-backdrop-filter-dialog:none;--media-shadow-surface-inset:inset 0 1px 0 0 #ffffff40, inset 0 0 0 1px #ffffff20;scrollbar-width:auto}@supports (color:oklch(from currentColor l c h)){.media-skin{--media-scrollbar-thumb-color:oklch(from currentColor l c h / .8)}}}@media (forced-colors:active){.media-skin{--media-border:CanvasText;--media-frame-border:CanvasText;--media-popover:Canvas;--media-popover-foreground:CanvasText;--media-ring:CanvasText;--media-shadow-surface-inset:inset 0 1px 0 0 CanvasText, inset 0 0 0 1px CanvasText}}}\n';

// node_modules/@videojs/html/dist/default/presets/audio/skin.js
var AudioSkinElement = class extends SkinElement {
  static {
    this.tagName = "audio-skin";
  }
  static {
    this.styles = createShadowStyle(skin_default2);
  }
  static {
    this.template = template2;
  }
};

// node_modules/@videojs/html/dist/default/icons/dist/html/default/seek.js
var seekIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><path d="M9 1a7.98 7.98 0 0 1 6.132 2.867l1.441-1.44a.25.25 0 0 1 .427.177V6.75a.25.25 0 0 1-.25.25h-4.146a.25.25 0 0 1-.177-.427L13.71 5.29A5.99 5.99 0 0 0 9 3a6 6 0 0 0-4.242 10.242l-1.415 1.415A8 8 0 0 1 9 1"/></svg>';

// node_modules/@videojs/html/dist/default/ui/seek-button/element.js
var SeekButtonElement = class extends MediaButtonElement {
  constructor(..._args) {
    super(..._args);
    this.seconds = SeekButtonCore.defaultProps.seconds;
    this.core = new SeekButtonCore();
    this.stateAttrMap = SeekButtonDataAttrs;
    this.mediaState = new PlayerController(this, playerContext, selectTime);
    this.hotkeyAction = "seekStep";
  }
  static {
    this.tagName = "media-seek-button";
  }
  static {
    this.properties = {
      ...MediaButtonElement.properties,
      seconds: { type: Number }
    };
  }
  get hotkeyValue() {
    return this.seconds;
  }
  activate(state) {
    this.core.seek(state);
  }
};

// node_modules/@videojs/html/dist/default/define/ui/seek-button.js
safeDefine(SeekButtonElement);

// node_modules/@videojs/html/dist/default/ui/playback-rate-button/element.js
var PlaybackRateButtonElement = class extends MediaButtonElement {
  constructor(..._args) {
    super(..._args);
    this.commandfor = void 0;
    this.rates = void 0;
    this.core = new PlaybackRateButtonCore();
    this.stateAttrMap = PlaybackRateButtonDataAttrs;
    this.mediaState = new PlayerController(this, playerContext, selectPlaybackRate);
    this.hotkeyAction = "speedUp";
  }
  static {
    this.tagName = "media-playback-rate-button";
  }
  static {
    this.properties = {
      label: { type: String },
      disabled: { type: Boolean },
      commandfor: { type: String },
      rates: { type: String }
    };
  }
  activate(state, event) {
    if (this.commandfor) {
      if (event instanceof KeyboardEvent) this.click();
      return;
    }
    this.core.cycle(state);
  }
  getIsButtonDisabled() {
    const media = this.mediaState.value;
    if (super.getIsButtonDisabled()) return true;
    if (this.commandfor && media && this.core.getRates(media).length === 0) return true;
    return false;
  }
  reflectsHidden() {
    return !this.commandfor;
  }
  willUpdate(changed) {
    super.willUpdate(changed);
    if (changed.has("commandfor")) {
      if (this.commandfor) this.setAttribute("commandfor", this.commandfor);
      else this.removeAttribute("commandfor");
    }
  }
  update(changed) {
    super.update(changed);
    if (!this.mediaState.value || !this.commandfor) return;
    applyElementProps(this, { "aria-disabled": this.getIsButtonDisabled() ? "true" : void 0 });
  }
};

// node_modules/@videojs/html/dist/default/define/ui/playback-rate-button.js
safeDefine(PlaybackRateButtonElement);

// node_modules/@videojs/html/dist/default/internal/skins/default-audio/register.js
registerIcons("default", {
  check: checkIcon,
  pause: pauseIcon,
  play: playIcon,
  restart: restartIcon,
  seek: seekIcon,
  spinner: spinnerIcon,
  "volume-high": volumeHighIcon,
  "volume-low": volumeLowIcon,
  "volume-off": volumeOffIcon
});

// node_modules/@videojs/html/dist/default/define/audio/skin.js
safeDefine(AudioSkinElement);

// node_modules/@videojs/html/dist/default/define/ui/menu-radio-group.js
safeDefine(MenuRadioGroupElement);

// tools/videojs10.js
var { PlayerElement: AudioPlayer } = createPlayer({ features: [...audioFeatures, remotePlaybackFeature] });
var TylAudioPlayer = class extends AudioPlayer {
  static tagName = "tyl-audio-player";
};
customElements.define(TylAudioPlayer.tagName, TylAudioPlayer);
var loadHLS = async () => {
  const [, { Hls }] = await Promise.all([
    import("./chunks/hlsjs-video-T676KNUB.min.js"),
    import("./chunks/default-QSL32MI7.min.js")
  ]);
  return Hls;
};
var loadYouTube = () => import("./chunks/youtube-video-5IDC4ZO2.min.js");
export {
  MenuRadioGroupElement,
  PlayerController2 as PlayerController,
  VideoSkinElement,
  configureCspNonce,
  formatTime,
  formatTimeAsPhrase,
  getDeepActiveElement,
  loadHLS,
  loadYouTube,
  parseYouTubeVideoId,
  resolveAdapterType
};
