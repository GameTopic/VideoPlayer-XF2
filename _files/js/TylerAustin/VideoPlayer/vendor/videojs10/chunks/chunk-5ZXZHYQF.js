// node_modules/@videojs/html/dist/default/registration/safe-define.js
function safeDefine(element, tagName = element.tagName) {
  const registry = globalThis.customElements;
  if (!registry || registry.get(tagName)) return;
  registry.define(tagName, element);
}

// node_modules/@lit/context/lib/context-request-event.js
var s = class extends Event {
  constructor(s4, t2, e3, o) {
    super("context-request", { bubbles: true, composed: true }), this.context = s4, this.contextTarget = t2, this.callback = e3, this.subscribe = o ?? false;
  }
};

// node_modules/@lit/context/lib/create-context.js
function n(n2) {
  return n2;
}

// node_modules/@lit/context/lib/controllers/context-consumer.js
var s2 = class {
  constructor(t2, s4, i2, h) {
    if (this.subscribe = false, this.provided = false, this.value = void 0, this.t = (t3, s5) => {
      this.unsubscribe && (this.unsubscribe !== s5 && (this.provided = false, this.unsubscribe()), this.subscribe || this.unsubscribe()), this.value = t3, this.host.requestUpdate(), this.provided && !this.subscribe || (this.provided = true, this.callback && this.callback(t3, s5)), this.unsubscribe = s5;
    }, this.host = t2, void 0 !== s4.context) {
      const t3 = s4;
      this.context = t3.context, this.callback = t3.callback, this.subscribe = t3.subscribe ?? false;
    } else this.context = s4, this.callback = i2, this.subscribe = h ?? false;
    this.host.addController(this);
  }
  hostConnected() {
    this.dispatchRequest();
  }
  hostDisconnected() {
    this.unsubscribe && (this.unsubscribe(), this.unsubscribe = void 0);
  }
  dispatchRequest() {
    this.host.dispatchEvent(new s(this.context, this.host, this.t, this.subscribe));
  }
};

// node_modules/@lit/context/lib/value-notifier.js
var s3 = class {
  get value() {
    return this.o;
  }
  set value(s4) {
    this.setValue(s4);
  }
  setValue(s4, t2 = false) {
    const i2 = t2 || !Object.is(s4, this.o);
    this.o = s4, i2 && this.updateObservers();
  }
  constructor(s4) {
    this.subscriptions = /* @__PURE__ */ new Map(), this.updateObservers = () => {
      for (const [s5, { disposer: t2 }] of this.subscriptions) s5(this.o, t2);
    }, void 0 !== s4 && (this.value = s4);
  }
  addCallback(s4, t2, i2) {
    if (!i2) return void s4(this.value);
    this.subscriptions.has(s4) || this.subscriptions.set(s4, { disposer: () => {
      this.subscriptions.delete(s4);
    }, consumerHost: t2 });
    const { disposer: h } = this.subscriptions.get(s4);
    s4(this.value, h);
  }
  clearCallbacks() {
    this.subscriptions.clear();
  }
};

// node_modules/@lit/context/lib/controllers/context-provider.js
var e = class extends Event {
  constructor(t2, s4) {
    super("context-provider", { bubbles: true, composed: true }), this.context = t2, this.contextTarget = s4;
  }
};
var i = class extends s3 {
  constructor(s4, e3, i2) {
    super(void 0 !== e3.context ? e3.initialValue : i2), this.onContextRequest = (t2) => {
      if (t2.context !== this.context) return;
      const s5 = t2.contextTarget ?? t2.composedPath()[0];
      s5 !== this.host && (t2.stopPropagation(), this.addCallback(t2.callback, s5, t2.subscribe));
    }, this.onProviderRequest = (s5) => {
      if (s5.context !== this.context) return;
      if ((s5.contextTarget ?? s5.composedPath()[0]) === this.host) return;
      const e4 = /* @__PURE__ */ new Set();
      for (const [s6, { consumerHost: i3 }] of this.subscriptions) e4.has(s6) || (e4.add(s6), i3.dispatchEvent(new s(this.context, i3, s6, true)));
      s5.stopPropagation();
    }, this.host = s4, void 0 !== e3.context ? this.context = e3.context : this.context = e3, this.attachListeners(), this.host.addController?.(this);
  }
  attachListeners() {
    this.host.addEventListener("context-request", this.onContextRequest), this.host.addEventListener("context-provider", this.onProviderRequest);
  }
  hostConnected() {
    this.host.dispatchEvent(new e(this.context, this.host));
  }
};

// node_modules/@videojs/element/dist/default/context.js
var rootedDocuments = /* @__PURE__ */ new WeakSet();
var ContextConsumer = class extends s2 {
  hostConnected() {
    attachDocumentContextRoot(this.host.ownerDocument);
    super.hostConnected();
  }
};
function attachDocumentContextRoot(document) {
  if (rootedDocuments.has(document)) return;
  rootedDocuments.add(document);
  const pending = /* @__PURE__ */ new Map();
  document.addEventListener("context-request", (event) => {
    const request = event;
    if (request.subscribe !== true) return;
    const element = request.contextTarget ?? request.composedPath()[0];
    const requests = pending.get(request.context) ?? [];
    if (requests.some((entry) => entry.element.deref() === element && entry.callback.deref() === request.callback)) return;
    requests.push({
      element: new WeakRef(element),
      callback: new WeakRef(request.callback)
    });
    pending.set(request.context, requests);
  });
  document.addEventListener("context-provider", (event) => {
    const { context } = event;
    const requests = pending.get(context);
    if (!requests) return;
    pending.delete(context);
    for (const entry of requests) {
      const element = entry.element.deref();
      const callback = entry.callback.deref();
      if (element?.isConnected && callback) element.dispatchEvent(new s(context, element, callback, true));
    }
  });
}

// node_modules/@videojs/html/dist/default/player/context.js
var PLAYER_CONTEXT_KEY = Symbol.for("@videojs/player");
var playerContext = n(PLAYER_CONTEXT_KEY);
var MEDIA_CONTEXT_KEY = Symbol.for("@videojs/media");
var mediaContext = n(MEDIA_CONTEXT_KEY);
var CONTAINER_CONTEXT_KEY = Symbol.for("@videojs/container");
var containerContext = n(CONTAINER_CONTEXT_KEY);
var EXTENSION_CONTEXT_KEY = Symbol.for("@videojs/extension");
var extensionContext = n(EXTENSION_CONTEXT_KEY);

// node_modules/@videojs/html/dist/default/store/media-attach-mixin.js
function createMediaAttachMixin(context) {
  return (BaseClass) => {
    class MediaAttachElement extends BaseClass {
      #releaseMedia = null;
      #unsubscribe = null;
      getMediaTarget() {
        return this;
      }
      connectedCallback() {
        super.connectedCallback?.();
        this.dispatchEvent(new s(context, this, (value, unsubscribe) => {
          if (unsubscribe) this.#unsubscribe = unsubscribe;
          this.#releaseMedia?.();
          this.#releaseMedia = null;
          const target = this.getMediaTarget();
          if (this.isConnected && value && target) this.#releaseMedia = value.registerMedia(target);
        }, false));
      }
      disconnectedCallback() {
        this.#releaseMedia?.();
        this.#releaseMedia = null;
        this.#unsubscribe?.();
        this.#unsubscribe = null;
        super.disconnectedCallback?.();
      }
    }
    return MediaAttachElement;
  };
}
var MediaAttachMixin = createMediaAttachMixin(mediaContext);

export {
  safeDefine,
  n,
  i,
  ContextConsumer,
  playerContext,
  mediaContext,
  containerContext,
  extensionContext,
  MediaAttachMixin
};
/*! For license information please see chunk-5ZXZHYQF.min.js.LEGAL.txt */
