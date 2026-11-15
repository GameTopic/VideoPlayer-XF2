// node_modules/@videojs/utils/dist/predicate/predicate.js
function isString(value) {
  return typeof value === "string";
}
function isNumber(value) {
  return typeof value === "number";
}
function isBoolean(value) {
  return typeof value === "boolean";
}
function isFunction(value) {
  return typeof value === "function";
}
function isNull(value) {
  return value === null;
}
function isUndefined(value) {
  return typeof value === "undefined";
}
function isNil(value) {
  return value == null;
}
function isPromise(value) {
  return value instanceof Promise;
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
function hasMethods(value, methods) {
  if (!isObject(value)) return false;
  return methods.every((method) => isFunction(value[method]));
}
function isPlainObject(value) {
  if (!isObject(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}
function isAbortError(value) {
  return value instanceof Error && value.name === "AbortError";
}

// node_modules/@videojs/utils/dist/dom/predicates.js
function isDocument(value) {
  return value instanceof Node && value.nodeType === 9;
}
function isShadowRoot(value) {
  return value instanceof Node && value.nodeType === 11 && "host" in value;
}
function isHTMLImageElement(value) {
  return value instanceof HTMLImageElement;
}

// node_modules/@videojs/utils/dist/dom/walk-ancestors.js
function walkAncestors(start2, callback, options = {}) {
  if (!start2 || typeof document === "undefined") return;
  let node = start2;
  while (node) {
    const value = callback(node);
    if (!isUndefined(value)) return value;
    node = options.composed ? getComposedParent(node) : node.parentElement;
  }
}
function getComposedParent(element) {
  if (element.assignedSlot) return element.assignedSlot;
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  return isShadowRoot(root) ? root.host : null;
}

// node_modules/@videojs/utils/dist/dom/focus.js
var TABBABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "audio[controls]",
  "video[controls]",
  "iframe",
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function getDeepActiveElement(root = document) {
  let active = root.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}
function getTabbableElements(root) {
  const tabbable = [];
  const visited = /* @__PURE__ */ new Set();
  visitChildren(root);
  return tabbable;
  function visitChildren(parent) {
    for (const child of parent.children) visitElement(child);
  }
  function visitElement(element) {
    if (visited.has(element)) return;
    visited.add(element);
    if (element instanceof HTMLElement && isTabbableElement(element)) tabbable.push(element);
    if (element instanceof HTMLSlotElement) {
      const assigned = element.assignedElements({ flatten: true });
      if (assigned.length > 0) for (const child of assigned) visitElement(child);
      else visitChildren(element);
      return;
    }
    if (element.shadowRoot) visitChildren(element.shadowRoot);
    else visitChildren(element);
  }
}
function isTabbableElement(element) {
  if (!element.matches(TABBABLE_SELECTOR) || element.tabIndex < 0 || element.matches(":disabled")) return false;
  return !walkAncestors(element, (ancestor) => {
    if (ancestor instanceof HTMLElement && (ancestor.hidden || ancestor.hasAttribute("inert") || ancestor.getAttribute("aria-hidden") === "true")) return true;
  }, { composed: true });
}

// tools/csp.js
var scriptNonce = "";
var styleNonce = "";
function configureCspNonce(nonce) {
  scriptNonce = nonce || document.querySelector("script[nonce]")?.nonce || "";
  styleNonce = document.querySelector("style[nonce]")?.nonce || scriptNonce;
}
function applyCspNonce(element) {
  const nonce = element.localName === "style" ? styleNonce : scriptNonce;
  if (nonce) element.nonce = nonce;
}

// node_modules/@videojs/utils/dist/dom/animation-frame.js
function animationFrame(callback) {
  const id = requestAnimationFrame(callback);
  return () => cancelAnimationFrame(id);
}

// node_modules/@videojs/utils/dist/string/escape-html.js
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/`/g, "&#96;");
}

// node_modules/@videojs/utils/dist/dom/attributes.js
function snapshotAttributes(element, names) {
  return [...names].map((name) => ({
    name,
    value: element.getAttribute(name)
  }));
}
function restoreAttributes(element, snapshot) {
  for (const { name, value } of snapshot) if (value === null) element.removeAttribute(name);
  else element.setAttribute(name, value);
}
function namedNodeMapToObject(namedNodeMap) {
  const obj = {};
  for (const attr of namedNodeMap) obj[attr.name] = attr.value;
  return obj;
}
function serializeAttributes(attrs) {
  let html = "";
  for (const key in attrs) {
    const value = attrs[key];
    if (value === "") html += ` ${key}`;
    else html += ` ${key}="${escapeHtml(value)}"`;
  }
  return html;
}

// node_modules/@videojs/utils/dist/dom/children.js
function getElementChildren(parent, predicate) {
  const children = [];
  for (let index = 0; index < parent.children.length; index++) {
    const child = parent.children.item(index);
    if (child && predicate(child, index)) children.push(child);
  }
  return children;
}
function findElementChild(parent, predicate) {
  for (let index = 0; index < parent.children.length; index++) {
    const child = parent.children.item(index);
    if (child && predicate(child, index)) return child;
  }
  return null;
}
function getComposedChildren(parent) {
  if (parent instanceof HTMLSlotElement) {
    const assigned = parent.assignedElements();
    if (assigned.length > 0) return assigned;
  }
  return [...parent.children];
}
function findComposedElement(root, predicate) {
  const children = getComposedChildren(root);
  for (const [index, child] of children.entries()) {
    if (predicate(child, index)) return child;
    const nested = findComposedElement(child, predicate);
    if (nested) return nested;
  }
  return null;
}

// node_modules/@videojs/utils/dist/dom/listen.js
function listen(target, type, listener, options) {
  target.addEventListener(type, listener, options);
  return () => target.removeEventListener(type, listener, options);
}

// node_modules/@videojs/utils/dist/function/noop.js
function noop(..._args) {
}

// node_modules/@videojs/utils/dist/dom/direction.js
function isRTL(element) {
  const dir = element.closest("[dir]")?.getAttribute("dir")?.toLowerCase();
  if (dir === "rtl" || dir === "ltr") return dir === "rtl";
  return getComputedStyle(element).direction === "rtl";
}

// node_modules/@videojs/utils/dist/dom/event.js
function resolveEventTarget(event) {
  const path = event.composedPath();
  return path.length > 0 ? path[0] : event.target;
}
function onEvent(target, type, options) {
  return new Promise((resolve, reject) => {
    const handleAbort = () => {
      reject(options?.signal?.reason ?? "Aborted");
    };
    if (options?.signal?.aborted) {
      handleAbort();
      return;
    }
    options?.signal?.addEventListener("abort", handleAbort, { once: true });
    target.addEventListener(type, (event) => {
      options?.signal?.removeEventListener("abort", handleAbort);
      resolve(event);
    }, {
      ...options,
      once: true
    });
  });
}

// node_modules/@videojs/utils/dist/dom/supports.js
function supportsAnchorPositioning() {
  return typeof CSS !== "undefined" && CSS.supports("anchor-name: --a");
}
function supportsPopoverAPI() {
  return typeof HTMLElement !== "undefined" && "popover" in HTMLElement.prototype;
}
function supportsConstructableStyleSheets() {
  if (typeof globalThis.CSSStyleSheet === "undefined") return false;
  try {
    new globalThis.CSSStyleSheet();
    return true;
  } catch {
    return false;
  }
}

// node_modules/@videojs/utils/dist/dom/interactive.js
var INTERACTIVE_SELECTOR = [
  "button",
  "input",
  "select",
  "textarea",
  "a[href]",
  '[role="button"]',
  '[role="menu"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="slider"]',
  "[data-interactive]"
].join(",");
var EDITABLE_SELECTOR = [
  "textarea",
  "select",
  "input:not([type])",
  ...[
    "text",
    "search",
    "url",
    "tel",
    "email",
    "password",
    "number"
  ].map((type) => `input[type="${type}"]`),
  '[contenteditable]:not([contenteditable="false"])'
].join(",");
function isEditableElement(el) {
  return el.matches(EDITABLE_SELECTOR);
}
function isEditableTarget(event) {
  const target = resolveEventTarget(event);
  return target instanceof Element && isEditableElement(target);
}
function isInteractiveTarget(event) {
  const target = resolveEventTarget(event);
  if (!(target instanceof Element)) return false;
  return target.closest(INTERACTIVE_SELECTOR) !== null;
}
var ACTIVATION_KEYS = /* @__PURE__ */ new Set([" ", "Enter"]);
var ACTIVATABLE_SELECTOR = 'button,a[href],[role="slider"],[role="button"]';
function isInteractiveActivation(event) {
  if (!ACTIVATION_KEYS.has(event.key)) return false;
  const target = resolveEventTarget(event);
  return target instanceof Element && target.matches(ACTIVATABLE_SELECTOR);
}

// node_modules/@videojs/utils/dist/dom/keep-alive.js
function isKeptAlive(element) {
  return walkAncestors(element, (node) => node.hasAttribute("keep-alive") ? true : void 0, { composed: true }) ?? false;
}

// node_modules/@videojs/utils/dist/string/casing.js
function pascalCase(str) {
  return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (_, c) => c.toUpperCase());
}
function camelCase(str) {
  return pascalCase(str).replace(/^(.)/, (_, c) => c.toLowerCase());
}
function kebabCase(str) {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

// node_modules/@videojs/utils/dist/dom/style.js
function normalizeStyleProperty(property) {
  return property.startsWith("--") ? property : kebabCase(property);
}
function getAnchorNames(element) {
  const value = element.style.getPropertyValue("anchor-name").trim();
  if (!value || value === "none") return [];
  return value.split(",").map((name) => name.trim()).filter(Boolean);
}
function applyStyles(element, styles) {
  for (const [prop, value] of Object.entries(styles)) if (typeof value === "string") element.style.setProperty(normalizeStyleProperty(prop), value);
}
function snapshotInlineStyles(element, properties) {
  return [...properties].map((property) => {
    const normalizedProperty = normalizeStyleProperty(property);
    return {
      property: normalizedProperty,
      value: element.style.getPropertyValue(normalizedProperty),
      priority: element.style.getPropertyPriority(normalizedProperty)
    };
  });
}
function restoreInlineStyles(element, snapshot) {
  for (const { property, value, priority } of snapshot) if (value) element.style.setProperty(property, value, priority);
  else element.style.removeProperty(property);
}
function withInlineStyles(element, styles, callback) {
  const snapshot = snapshotInlineStyles(element, Object.keys(styles));
  try {
    applyStyles(element, styles);
    return callback();
  } finally {
    restoreInlineStyles(element, snapshot);
  }
}
function readCSSLength(element, property, { source = "inline-or-computed" } = {}) {
  const normalizedProperty = normalizeStyleProperty(property);
  let value = source !== "computed" && element instanceof HTMLElement ? element.style.getPropertyValue(normalizedProperty) : "";
  if (!value && source !== "inline") value = getComputedStyle(element).getPropertyValue(normalizedProperty);
  return value.trim() ? resolveCSSLength(element, value) : null;
}
function resolveCSSLength(el, value) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isNaN(parsed) && (/^-?\d*\.?\d+$/.test(trimmed) || trimmed.endsWith("px"))) return parsed;
  const doc = el.ownerDocument;
  const root = doc?.documentElement;
  if (!Number.isNaN(parsed) && trimmed.endsWith("rem")) return parsed * (root ? Number.parseFloat(getComputedStyle(root).fontSize) || 16 : 16);
  if (!Number.isNaN(parsed) && trimmed.endsWith("em")) return parsed * (el instanceof HTMLElement ? Number.parseFloat(getComputedStyle(el).fontSize) || 16 : 16);
  if (!doc) return Number.isNaN(parsed) ? 0 : parsed;
  const measurementEl = doc.createElement("div");
  measurementEl.style.position = "absolute";
  measurementEl.style.visibility = "hidden";
  measurementEl.style.pointerEvents = "none";
  measurementEl.style.inlineSize = trimmed;
  if (!measurementEl.style.inlineSize) return 0;
  measurementEl.style.blockSize = "0";
  measurementEl.style.padding = "0";
  measurementEl.style.border = "0";
  measurementEl.style.inset = "0";
  const computed = getComputedStyle(el);
  measurementEl.style.fontSize = computed.fontSize;
  for (let i = 0; i < computed.length; i++) {
    const name = computed.item(i);
    if (name.startsWith("--")) measurementEl.style.setProperty(name, computed.getPropertyValue(name));
  }
  const parent = doc.body ?? doc.documentElement;
  if (!parent) return Number.isNaN(parsed) ? 0 : parsed;
  parent.appendChild(measurementEl);
  if (getComputedStyle(measurementEl).inlineSize === "auto") {
    measurementEl.remove();
    return 0;
  }
  const pixels = measurementEl.getBoundingClientRect().width;
  measurementEl.remove();
  if (Number.isFinite(pixels)) return pixels;
  return Number.isNaN(parsed) ? 0 : parsed;
}

// node_modules/@videojs/utils/dist/dom/layout.js
function getElementSize(element, { box = "bounding", overflow = "none" } = {}) {
  const rect = element.getBoundingClientRect();
  let width = box === "layout" ? element.offsetWidth || rect.width : rect.width;
  let height = box === "layout" ? element.offsetHeight || rect.height : rect.height;
  if (overflow === "width" || overflow === "both") width = Math.max(width, element.scrollWidth);
  if (overflow === "height" || overflow === "both") height = Math.max(height, element.scrollHeight);
  return {
    width,
    height
  };
}
function isPointInElement(element, point) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && point.clientX >= rect.left && point.clientX < rect.right && point.clientY >= rect.top && point.clientY < rect.bottom;
}
function measureElement(element, options = {}) {
  const { styles, ...sizeOptions } = options;
  const measure = () => getElementSize(element, sizeOptions);
  return styles ? withInlineStyles(element, styles, measure) : measure();
}
function getElementPadding(element) {
  const style = getComputedStyle(element);
  return {
    inlineStart: Number.parseFloat(style.paddingInlineStart) || 0,
    inlineEnd: Number.parseFloat(style.paddingInlineEnd) || 0,
    blockStart: Number.parseFloat(style.paddingBlockStart) || 0,
    blockEnd: Number.parseFloat(style.paddingBlockEnd) || 0
  };
}
function getInlineExtent(edges) {
  return edges.inlineStart + edges.inlineEnd;
}
function getBlockExtent(edges) {
  return edges.blockStart + edges.blockEnd;
}
function getPaddingOrigin(element) {
  const style = getComputedStyle(element);
  return {
    x: Number.parseFloat(style.paddingLeft) || 0,
    y: Number.parseFloat(style.paddingTop) || 0
  };
}
function defaultResolveChildrenSize(measurements) {
  if (measurements.length === 0) return {
    width: 0,
    height: 0
  };
  const width = Math.max(...measurements.map(({ offsetLeft, size }) => offsetLeft + size.width));
  const firstTop = measurements[0].offsetTop;
  return {
    width,
    height: measurements.some(({ offsetTop }) => offsetTop !== firstTop) ? Math.max(...measurements.map(({ offsetTop, size }) => offsetTop + size.height)) : measurements.reduce((total, { size }) => total + size.height, 0)
  };
}
function measureElementChildren(container, { children, includePadding = false, maxWidth = null, measure = (element, width) => measureElement(element, width === void 0 ? void 0 : { styles: { width: `${width}px` } }), resolveSize = defaultResolveChildrenSize } = {}) {
  const elements = [...children ?? Array.from(container.children).filter((child) => child instanceof HTMLElement)].filter((element) => !element.hidden);
  const padding = includePadding ? getElementPadding(container) : {
    inlineStart: 0,
    inlineEnd: 0,
    blockStart: 0,
    blockEnd: 0
  };
  const inlinePadding = getInlineExtent(padding);
  const blockPadding = getBlockExtent(padding);
  const paddingOrigin = includePadding ? getPaddingOrigin(container) : {
    x: 0,
    y: 0
  };
  if (elements.length === 0) return {
    width: inlinePadding,
    height: blockPadding
  };
  const collect = (width2) => elements.map((element) => ({
    element,
    size: measure(element, width2),
    offsetLeft: element.offsetLeft - paddingOrigin.x,
    offsetTop: element.offsetTop - paddingOrigin.y
  }));
  let measurements = collect();
  const naturalWidth = resolveSize(measurements).width + inlinePadding;
  const width = maxWidth === null ? naturalWidth : Math.min(naturalWidth, Math.max(0, maxWidth));
  if (width < naturalWidth) measurements = collect(Math.max(0, width - inlinePadding));
  return {
    width,
    height: resolveSize(measurements).height + blockPadding
  };
}

// node_modules/@videojs/utils/dist/i18n/direction.js
var RTL_SCRIPTS = /* @__PURE__ */ new Set([
  "Adlm",
  "Arab",
  "Hebr",
  "Mand",
  "Mend",
  "Nkoo",
  "Rohg",
  "Samr",
  "Syrc",
  "Thaa",
  "Yezi"
]);
function getTextDirection(locale) {
  try {
    const script = new Intl.Locale(locale).maximize().script;
    return script && RTL_SCRIPTS.has(script) ? "rtl" : "ltr";
  } catch {
    return "ltr";
  }
}

// node_modules/@videojs/utils/dist/i18n.js
var DEFAULT_LOCALE = "en";
function isDefaultLocale(locale) {
  const tag = Array.isArray(locale) ? locale[0] : locale;
  if (!tag) return true;
  return tag === "en" || tag.startsWith(`en-`);
}

// node_modules/@videojs/utils/dist/dom/locale/effective-locale.js
function effectiveLocale(explicitLocale, ambientLang, fallback = "en") {
  if (!isUndefined(explicitLocale) && explicitLocale.trim() !== "") return explicitLocale;
  if (!isUndefined(ambientLang) && ambientLang.trim() !== "") return ambientLang;
  return fallback;
}

// node_modules/@videojs/utils/dist/dom/locale/find-nearest-lang.js
function getElementLang(node) {
  const fromAttribute = node.getAttribute("lang")?.trim();
  if (fromAttribute) return fromAttribute;
  if ("lang" in node && typeof node.lang === "string") {
    const fromProperty = node.lang.trim();
    if (fromProperty) return fromProperty;
  }
}
function findNearestLang(start2) {
  return walkAncestors(start2, getElementLang);
}

// node_modules/@videojs/utils/dist/dom/locale/merge-locale-overlays.js
async function mergeLocaleOverlays(locale, load, findKeys) {
  const chain = findKeys(locale);
  const layers = await Promise.all(chain.map((tag) => load(tag)));
  const loadedTags = [];
  const merged = {};
  for (let i = 0; i < chain.length; i++) {
    const layer = layers[i];
    if (layer && Object.keys(layer).length > 0) loadedTags.push(chain[i]);
  }
  for (let i = chain.length - 1; i >= 0; i--) {
    const layer = layers[i];
    if (layer) Object.assign(merged, layer);
  }
  return {
    merged,
    loadedTags
  };
}

// node_modules/@videojs/utils/dist/dom/locale/resolve-lang-attr.js
function resolveLangAttr(raw) {
  if (isUndefined(raw) || raw.trim() === "") return;
  return raw.trim();
}

// node_modules/@videojs/utils/dist/dom/locale/subscribe-ambient-lang.js
var subscribers = /* @__PURE__ */ new Set();
var observer;
var queued = false;
var flush = () => {
  queued = false;
  for (const cb of subscribers) cb();
};
var schedule = () => {
  if (!queued) {
    queued = true;
    queueMicrotask(flush);
  }
};
function start() {
  if (observer || typeof document === "undefined") return;
  observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ["lang"],
    childList: true
  });
}
function stop() {
  if (subscribers.size || !observer) return;
  observer.disconnect();
  observer = void 0;
  queued = false;
}
function subscribeAmbientLang(onStoreChange) {
  if (typeof document === "undefined") return () => {
  };
  subscribers.add(onStoreChange);
  start();
  return () => {
    subscribers.delete(onStoreChange);
    stop();
  };
}

// node_modules/@videojs/utils/dist/dom/observe-elements.js
function observeResize(elements, callback) {
  if (typeof ResizeObserver === "undefined") return noop;
  const observer2 = new ResizeObserver(callback);
  const targets = Symbol.iterator in Object(elements) ? elements : [elements];
  for (const element of targets) observer2.observe(element);
  return () => observer2.disconnect();
}
function observeElements({ getElements, onChange, root, mutations }) {
  let stopObservingResize = noop;
  const observeCurrentElements = () => {
    stopObservingResize();
    stopObservingResize = observeResize(getElements(), onChange);
  };
  observeCurrentElements();
  let mutationObserver = null;
  if (root && mutations !== false && typeof MutationObserver !== "undefined") {
    mutationObserver = new MutationObserver(() => {
      observeCurrentElements();
      onChange();
    });
    mutationObserver.observe(root, mutations ?? { childList: true });
  }
  return () => {
    mutationObserver?.disconnect();
    stopObservingResize();
  };
}

// node_modules/@videojs/utils/dist/dom/platform.js
function isMacOS() {
  return typeof navigator !== "undefined" && /mac/i.test(navigator.userAgent);
}

// node_modules/@videojs/utils/dist/dom/popover.js
var ZERO_OFFSETS = {
  sideOffset: 0,
  boundaryOffset: 0
};
var OPPOSITE_SIDE = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
};
function getSideAvailable(triggerRect, boundaryRect, side, offsets) {
  const boundaryOffset = offsets.boundaryOffset ?? 0;
  switch (side) {
    case "top":
      return triggerRect.top - boundaryRect.top - boundaryOffset - offsets.sideOffset;
    case "bottom":
      return boundaryRect.bottom - triggerRect.bottom - boundaryOffset - offsets.sideOffset;
    case "left":
      return triggerRect.left - boundaryRect.left - boundaryOffset - offsets.sideOffset;
    case "right":
      return boundaryRect.right - triggerRect.right - boundaryOffset - offsets.sideOffset;
  }
}
function getPositionedSide(triggerRect, positionedRect, boundaryRect, opts, offsets = ZERO_OFFSETS) {
  const preferred = opts.side;
  const opposite = OPPOSITE_SIDE[preferred];
  const size = preferred === "top" || preferred === "bottom" ? positionedRect.height : positionedRect.width;
  const preferredSpace = getSideAvailable(triggerRect, boundaryRect, preferred, offsets);
  if (preferredSpace >= size) return preferred;
  return getSideAvailable(triggerRect, boundaryRect, opposite, offsets) > preferredSpace ? opposite : preferred;
}
function tryShowPopover(el) {
  try {
    el?.showPopover?.();
  } catch {
  }
}
function tryHidePopover(el) {
  try {
    el?.hidePopover?.();
  } catch {
  }
}
function hideOpenPopovers(root) {
  if (root instanceof Element && root.shadowRoot) hideOpenPopovers(root.shadowRoot);
  for (const el of root.querySelectorAll("*")) {
    if (isOpenPopover(el)) tryHidePopover(el);
    if (el.shadowRoot) hideOpenPopovers(el.shadowRoot);
  }
}
function isOpenPopover(el) {
  try {
    return el.matches(":popover-open");
  } catch {
    return false;
  }
}

// node_modules/@videojs/utils/dist/dom/raf-throttle.js
function rafThrottle(fn) {
  let rafId = null;
  let latestArgs;
  const throttled = (...args) => {
    latestArgs = args;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      fn(...latestArgs);
    });
  };
  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  return throttled;
}

// node_modules/@videojs/utils/dist/dom/script.js
var cache = /* @__PURE__ */ new Map();
function hasScript(src) {
  for (const script of document.scripts) if (script.getAttribute("src") === src) return true;
  return false;
}
function loadScript(src) {
  let promise = cache.get(src);
  if (promise) return promise;
  if (hasScript(src)) return Promise.resolve();
  promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    applyCspNonce(script);
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(/* @__PURE__ */ new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(script);
  });
  cache.set(src, promise);
  promise.catch(() => cache.delete(src));
  return promise;
}

// node_modules/@videojs/utils/dist/dom/shadow-styles.js
function ensureGlobalStyle(id, css) {
  const doc = globalThis.document;
  if (!doc || doc.getElementById(id)) return;
  const style = doc.createElement("style");
  applyCspNonce(style);
  style.id = id;
  style.textContent = css;
  doc.head.appendChild(style);
}
function isConstructableStyleSheet(value) {
  return typeof globalThis.CSSStyleSheet !== "undefined" && value instanceof globalThis.CSSStyleSheet;
}
function getStyleText(style) {
  if (typeof style === "string") return style;
  return Array.from(style.cssRules).map((rule) => rule.cssText).join("\n");
}
function createShadowStyle(css) {
  if (!supportsConstructableStyleSheets()) return css;
  const sheet = new globalThis.CSSStyleSheet();
  sheet.replaceSync(css);
  return sheet;
}
function applyShadowStyles(shadowRoot, styles) {
  if (styles.every(isConstructableStyleSheet) && "adoptedStyleSheets" in shadowRoot) {
    shadowRoot.adoptedStyleSheets = styles;
    return;
  }
  const doc = shadowRoot.ownerDocument;
  for (const styleText of styles.map(getStyleText)) {
    const style = doc.createElement("style");
    applyCspNonce(style);
    style.textContent = styleText;
    shadowRoot.appendChild(style);
  }
}

// node_modules/@videojs/utils/dist/dom/template.js
function createTemplate(html) {
  const doc = globalThis.document;
  if (!doc) return null;
  const template = doc.createElement("template");
  template.innerHTML = html;
  return template;
}
function getTemplateElement(container) {
  for (const child of container.children) if (child.localName === "template" && "content" in child) return child;
  return null;
}
function getTemplateRoot(template) {
  const root = template.content.firstElementChild;
  return root && !root.nextElementSibling ? root : null;
}
function cloneTemplateRoot(root, targetDocument = root.ownerDocument) {
  return targetDocument.importNode(root, true);
}
function renderTemplate(container, template) {
  container.appendChild(container.ownerDocument.importNode(template.content, true));
}

// node_modules/@videojs/utils/dist/dom/text-track.js
function isCaptionOrSubtitleTrack(track) {
  return track.kind === "captions" || track.kind === "subtitles";
}
function getCaptionOrSubtitleTracks(tracks) {
  return Array.from(tracks).filter(isCaptionOrSubtitleTrack).sort(sortByKind);
}
function findTrackElement(media, track) {
  if (!(media instanceof HTMLElement)) return null;
  for (const el of media.querySelectorAll("track")) if (el.track === track) return el;
  return null;
}
function sortByKind(a, b) {
  return a.kind > b.kind ? 1 : a.kind < b.kind ? -1 : 0;
}

// node_modules/@videojs/utils/dist/dom/time-ranges.js
function serializeTimeRanges(ranges) {
  const result = [];
  for (let i = 0; i < ranges.length; i++) result.push([ranges.start(i), ranges.end(i)]);
  return result;
}

// node_modules/@videojs/utils/dist/dom/tree.js
function containsComposed(root, element) {
  let current = element;
  while (current) {
    if (current === root || root.contains(current)) return true;
    const nodeRoot = current.getRootNode();
    current = current.assignedSlot ?? current.parentElement ?? (isShadowRoot(nodeRoot) ? nodeRoot.host : null);
  }
  return false;
}

// node_modules/@videojs/utils/dist/dom/webkit.js
function supportsWebKitAirPlay() {
  return "WebKitPlaybackTargetAvailabilityEvent" in globalThis;
}
function isWebKitAirPlayCapable(media) {
  return supportsWebKitAirPlay() && "webkitCurrentPlaybackTargetIsWireless" in media;
}

// node_modules/@videojs/media/dist/default/core/drm.js
var KeySystems = {
  FAIRPLAY: "com.apple.fps",
  WIDEVINE: "com.widevine.alpha",
  PLAYREADY: "com.microsoft.playready",
  CLEARKEY: "org.w3.clearkey"
};

// node_modules/@videojs/media/dist/default/core/source/youtube.js
function parseYouTubeVideoId(src) {
  return parseYouTubeSource(src)?.id ?? null;
}
function parseYouTubeSource(src) {
  if (!src) return null;
  if (/^[\w-]{11}$/.test(src)) return {
    id: src,
    kind: "video",
    listId: null,
    startTime: null,
    noCookie: false
  };
  const shorthandId = SHORTHAND_SRC.exec(src)?.[1];
  if (shorthandId) return {
    id: shorthandId,
    kind: "video",
    listId: null,
    startTime: null,
    noCookie: true
  };
  const noCookie = src.includes("-nocookie");
  const videoMatch = VIDEO_MATCH_SRC.exec(src);
  const listMatch = PLAYLIST_MATCH_SRC.exec(src);
  const videoId = videoMatch?.[1] ?? null;
  const id = videoId === "videoseries" ? null : videoId;
  if (!id && !listMatch) return null;
  return {
    id,
    kind: id ? "video" : "playlist",
    listId: listMatch?.[1] ?? null,
    startTime: parseStartTime(src),
    noCookie
  };
}
function parseStartTime(url) {
  const tValue = /[?&]t=([\dhms]+)/i.exec(url)?.[1]?.toLowerCase();
  if (!tValue) return null;
  let totalSeconds = 0;
  let hasValue = false;
  const hours = /(\d+)h/.exec(tValue)?.[1];
  if (hours) {
    totalSeconds += Number.parseInt(hours, 10) * 3600;
    hasValue = true;
  }
  const minutes = /(\d+)m/.exec(tValue)?.[1];
  if (minutes) {
    totalSeconds += Number.parseInt(minutes, 10) * 60;
    hasValue = true;
  }
  const seconds = /(\d+)s?$/.exec(tValue)?.[1];
  if (seconds) {
    totalSeconds += Number.parseInt(seconds, 10);
    hasValue = true;
  }
  return hasValue ? totalSeconds : null;
}
var SHORTHAND_SRC = /^youtube\/(?:shorts\/)?([\w-]{11})$/;
var VIDEO_MATCH_SRC = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))((?:\w|-){11})/;
var PLAYLIST_MATCH_SRC = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/.*?[?&]list=)([\w-]+)/;

// node_modules/@videojs/media/dist/default/core/source/cloudflare.js
function parseCloudflareSource(src) {
  if (!src) return null;
  const id = MATCH_SRC.exec(src)?.[1] ?? (MATCH_VIDEO_ID.test(src) || MATCH_SIGNED_TOKEN.test(src) ? src : null);
  if (!id) return null;
  return {
    id,
    signed: MATCH_SIGNED_TOKEN.test(id),
    origin: MATCH_CUSTOMER_ORIGIN.exec(src)?.[1] ?? null
  };
}
var MATCH_SRC = /(?:cloudflarestream\.com|videodelivery\.net)\/([\w-.]+)/i;
var MATCH_CUSTOMER_ORIGIN = /^(https?:\/\/customer-[\w-]+\.cloudflarestream\.com)/i;
var MATCH_VIDEO_ID = /^[a-z\d]{32}$/i;
var MATCH_SIGNED_TOKEN = /^[\w-]+\.[\w-]+\.[\w-]+$/;

// node_modules/@videojs/media/dist/default/core/source/dailymotion.js
function parseDailymotionSource(src) {
  if (!src) return null;
  const embed = MATCH_EMBED.exec(src);
  if (embed) return {
    id: embed[2],
    player: embed[1] ?? null
  };
  const id = MATCH_VIDEO.exec(src)?.[1] ?? MATCH_SHORT.exec(src)?.[1];
  return id ? {
    id,
    player: null
  } : null;
}
var MATCH_VIDEO = /(?:^|\/\/)(?:www\.)?dailymotion\.com\/(?:embed\/)?video\/(x[a-z0-9]+)(?:_[^/?#]*)?\/?(?:$|[?#])/i;
var MATCH_SHORT = /(?:^|\/\/)dai\.ly\/(x[a-z0-9]+)\/?(?:$|[?#])/i;
var MATCH_EMBED = /(?:^|\/\/)geo\.dailymotion\.com\/player(?:\/([a-z0-9]+))?\.html\?(?:[^#]*&)?video=(x[a-z0-9]+)(?:$|[&#])/i;

// node_modules/@videojs/media/dist/default/core/source/mixcloud.js
function parseMixcloudSource(src) {
  const url = parseUrl(src);
  if (!url) return null;
  if (!(url.hostname === WIDGET_HOST && WIDGET_HOST_PATH.test(url.pathname) || SITE_HOSTS.has(url.hostname) && SITE_WIDGET_PATH.test(url.pathname))) return SITE_HOSTS.has(url.hostname) ? showOf(url, {}) : null;
  const feed = parseUrl(url.searchParams.get("feed") ?? "", SITE_ORIGIN);
  if (!feed || !SITE_HOSTS.has(feed.hostname)) return null;
  return showOf(feed, Object.fromEntries([...url.searchParams].filter(([key]) => key !== "feed")));
}
function showOf(url, params) {
  const segments = url.pathname.split("/").filter(Boolean);
  const [user, show] = segments;
  if (segments.length !== 2 || !user || !show) return null;
  if (RESERVED_ROOTS.has(user.toLowerCase()) || USER_PAGES.has(show.toLowerCase())) return null;
  return {
    key: `/${user}/${show}/`,
    params
  };
}
function parseUrl(src, base) {
  const value = src.trim();
  if (!value) return null;
  try {
    const url = HAS_SCHEME.test(value) ? new URL(value) : base ? new URL(value, base) : new URL(`https://${value.replace(/^\/\//, "")}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.hostname = url.hostname.toLowerCase();
    return url;
  } catch {
    return null;
  }
}
var SITE_ORIGIN = "https://www.mixcloud.com";
var SITE_HOSTS = /* @__PURE__ */ new Set([
  "mixcloud.com",
  "www.mixcloud.com",
  "m.mixcloud.com"
]);
var SITE_WIDGET_PATH = /^\/widget\/iframe\/?$/;
var WIDGET_HOST = "player-widget.mixcloud.com";
var WIDGET_HOST_PATH = /^\/(?:widget\/iframe\/?)?$/;
var HAS_SCHEME = /^[a-z][a-z\d+.-]*:/i;
var RESERVED_ROOTS = /* @__PURE__ */ new Set([
  "about",
  "assets",
  "blog",
  "categories",
  "community",
  "dashboard",
  "developers",
  "discover",
  "genres",
  "jobs",
  "live",
  "login",
  "messages",
  "notifications",
  "oembed",
  "plans",
  "premium",
  "privacy",
  "pro",
  "search",
  "select",
  "settings",
  "signup",
  "tag",
  "terms",
  "trending",
  "upload",
  "widget"
]);
var USER_PAGES = /* @__PURE__ */ new Set([
  "activity",
  "cloudcasts",
  "favorites",
  "feed",
  "followers",
  "following",
  "hosts",
  "listens",
  "playlists",
  "posts",
  "reposts",
  "stream",
  "uploads"
]);

// node_modules/@videojs/media/dist/default/core/source/soundcloud.js
function parseSoundCloudSource(src) {
  const url = parseUrl2(src);
  if (!url) return null;
  if (url.hostname === WIDGET_HOST2) return parseWidgetUrl(url);
  return parseResourceUrl(url, {});
}
function parseWidgetUrl(url) {
  if (!WIDGET_PATH.test(url.pathname)) return null;
  const inner = parseUrl2(url.searchParams.get("url") ?? "");
  if (!inner || inner.hostname === WIDGET_HOST2) return null;
  const parsed = parseResourceUrl(inner, Object.fromEntries([...url.searchParams].filter(([key]) => key !== "url")));
  return parsed && {
    ...parsed,
    startTime: parsed.startTime ?? parseStartTime2(url.hash)
  };
}
function parseResourceUrl(url, params) {
  const host = url.hostname;
  const segments = url.pathname.split("/").filter(Boolean);
  const startTime = parseStartTime2(url.hash);
  if (host === API_HOST) {
    const [collection, resource] = segments;
    const kind2 = collection === "tracks" ? "track" : collection === "playlists" ? "playlist" : null;
    const id = apiIdOf(collection, resource);
    if (!kind2 || !id || segments.length !== 2) return null;
    const token = url.searchParams.get("secret_token");
    const query = token && SECRET_TOKEN.test(token) ? `?secret_token=${token}` : "";
    return {
      kind: kind2,
      url: `https://${API_HOST}/${collection}/${id}${query}`,
      startTime,
      params
    };
  }
  if (!PERMALINK_HOSTS.has(host)) return null;
  const kind = permalinkKind(segments);
  if (!kind) return null;
  return {
    kind,
    url: `https://soundcloud.com/${segments.join("/")}`,
    startTime,
    params
  };
}
function apiIdOf(collection, resource) {
  if (!resource) return null;
  let decoded;
  try {
    decoded = decodeURIComponent(resource);
  } catch {
    return null;
  }
  if (NUMERIC_ID.test(decoded)) return decoded;
  const [scheme, urnCollection, id] = decoded.split(":");
  return scheme === "soundcloud" && urnCollection === collection && id && NUMERIC_ID.test(id) ? id : null;
}
function permalinkKind(segments) {
  const [user, second, third, fourth] = segments;
  if (!user || !second || !SLUG.test(user) || RESERVED_ROOTS2.has(user.toLowerCase())) return null;
  if (second === "sets") {
    if (!third || !SLUG.test(third)) return null;
    return isOptionalSecret(fourth, segments.length, 3) ? "playlist" : null;
  }
  if (!SLUG.test(second) || USER_PAGES2.has(second.toLowerCase())) return null;
  return isOptionalSecret(third, segments.length, 2) ? "track" : null;
}
function isOptionalSecret(segment, length, required) {
  if (length === required) return true;
  return length === required + 1 && !!segment && SECRET_TOKEN.test(segment);
}
function parseStartTime2(hash) {
  const raw = /(?:^#|&)t=([^&]+)/.exec(hash)?.[1];
  if (!raw) return null;
  let value;
  try {
    value = decodeURIComponent(raw).toLowerCase();
  } catch {
    return null;
  }
  if (CLOCK_TIME.test(value)) return value.split(":").reduce((total, part) => total * 60 + Number.parseInt(part, 10), 0);
  const units = UNIT_TIME.exec(value);
  if (!units || !units.slice(1).some(Boolean)) return null;
  const [, hours = "0", minutes = "0", seconds = "0"] = units;
  return Number.parseInt(hours, 10) * 3600 + Number.parseInt(minutes, 10) * 60 + Number.parseInt(seconds, 10);
}
function parseUrl2(src) {
  const value = src.trim();
  if (!value) return null;
  try {
    const url = new URL(HAS_SCHEME2.test(value) ? value : `https://${value.replace(/^\/\//, "")}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.hostname = url.hostname.toLowerCase();
    return url;
  } catch {
    return null;
  }
}
var WIDGET_HOST2 = "w.soundcloud.com";
var WIDGET_PATH = /^\/player\/?$/;
var API_HOST = "api.soundcloud.com";
var PERMALINK_HOSTS = /* @__PURE__ */ new Set([
  "soundcloud.com",
  "www.soundcloud.com",
  "m.soundcloud.com"
]);
var HAS_SCHEME2 = /^[a-z][a-z\d+.-]*:/i;
var SLUG = /^[\w-]+$/;
var NUMERIC_ID = /^\d+$/;
var SECRET_TOKEN = /^s-\w+$/;
var CLOCK_TIME = /^\d+(?::\d{1,2}){1,2}$/;
var UNIT_TIME = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/;
var RESERVED_ROOTS2 = /* @__PURE__ */ new Set([
  "charts",
  "discover",
  "feed",
  "jobs",
  "messages",
  "mobile",
  "notifications",
  "pages",
  "people",
  "search",
  "settings",
  "stations",
  "stream",
  "tags",
  "upload",
  "you"
]);
var USER_PAGES2 = /* @__PURE__ */ new Set([
  "albums",
  "comments",
  "followers",
  "following",
  "likes",
  "popular-tracks",
  "reposts",
  "spotlight",
  "toptracks",
  "tracks"
]);

// node_modules/@videojs/media/dist/default/core/source/spotify.js
function parseSpotifySource(src) {
  if (!src) return null;
  const match = MATCH_URI.exec(src) ?? MATCH_SRC2.exec(src);
  const type = match?.[1]?.toLowerCase();
  const id = match?.[2];
  if (!type || !id) return null;
  return {
    type,
    id,
    startTime: parseStartTime3(src)
  };
}
function parseStartTime3(url) {
  const value = /[?&]t=(\d+)/.exec(url)?.[1];
  return value ? Number.parseInt(value, 10) : null;
}
var MATCH_SRC2 = /open\.spotify\.com\/(?:[\w-]+\/)*?(track|episode|album|playlist|show|artist)\/(\w+)/i;
var MATCH_URI = /^spotify:(track|episode|album|playlist|show|artist):(\w+)$/i;

// node_modules/@videojs/media/dist/default/core/source/tiktok.js
function parseTikTokSource(src) {
  if (!src) return null;
  if (MATCH_ID.test(src)) return { id: src };
  const id = MATCH_SRC3.exec(src)?.[1];
  return id ? { id } : null;
}
var MATCH_ID = /^\d+$/;
var MATCH_SRC3 = /tiktok\.com\/(?:player\/v1\/|share\/video\/|@[^/]+\/video\/)(\d+)/;

// node_modules/@videojs/media/dist/default/core/source/twitch.js
function parseTwitchSource(src) {
  if (!src) return null;
  const videoId = MATCH_VIDEO2.exec(src)?.[1];
  if (videoId) return {
    kind: "video",
    id: videoId,
    channel: null
  };
  const channel = MATCH_CHANNEL.exec(src)?.[1];
  if (channel) return {
    kind: "channel",
    id: null,
    channel
  };
  return null;
}
var MATCH_VIDEO2 = /(?:^|\/\/)(?:www\.|go\.)?twitch\.tv\/(?:videos?\/|\?video=)(\d+)\/?(?:$|\?)/;
var MATCH_CHANNEL = /(?:^|\/\/)(?:www\.|go\.)?twitch\.tv\/([a-zA-Z0-9_]+)\/?(?:$|\?)/;

// node_modules/@videojs/media/dist/default/core/source/vimeo.js
function parseVimeoSource(src) {
  if (!src) return null;
  if (/^\d+$/.test(src)) return {
    id: Number(src),
    kind: "video",
    hash: null
  };
  const shorthand = SHORTHAND_SRC2.exec(src);
  if (shorthand) return {
    id: Number(shorthand[1]),
    kind: "video",
    hash: shorthand[2] ?? null
  };
  const match = MATCH_SRC4.exec(src);
  if (!match) return null;
  const kind = match[1] === "event/" ? "event" : "video";
  let queryHash = null;
  try {
    queryHash = new URL(src).searchParams.get("h");
  } catch {
  }
  return {
    id: Number(match[2]),
    kind,
    hash: queryHash ?? match[3] ?? null
  };
}
var SHORTHAND_SRC2 = /^vimeo\/(?:video\/)?(\d+)(?:(?:\?hash=|\?h=|\/)([\w-]+))?$/;
var MATCH_SRC4 = /vimeo\.com\/(video\/|event\/)?(\d+)(?:\/([\w-]+))?/;

// node_modules/@videojs/media/dist/default/core/source/wistia.js
function parseWistiaMediaId(src) {
  if (!src) return null;
  if (MATCH_HASHED_ID.test(src)) return src;
  return MATCH_SRC5.exec(src)?.[1] ?? MATCH_WVIDEO.exec(src)?.[1] ?? null;
}
var MATCH_HASHED_ID = /^[a-z\d]{10}$/i;
var MATCH_SRC5 = /(?:wistia\.(?:com|net)|wi\.st)\/(?:medias|embed)\/(?:iframe\/|medias\/|playlists\/)?([a-z\d]{10})/i;
var MATCH_WVIDEO = /[?&]wvideo=([a-z\d]{10})/i;

// node_modules/@videojs/media/dist/default/core/source/adapter-type.js
function resolveAdapterType(src, type) {
  const source = src.trim();
  if (!source) return null;
  return fromService(source) ?? fromMimeType(type) ?? fromMimeType(resolveMimeType(source));
}
function resolveMimeType(src) {
  const extension = EXTENSION.exec(src.trim().split(/[?#]/, 1)[0])?.[1]?.toLowerCase();
  return extension && MIME_TYPES.get(extension) || null;
}
function fromService(src) {
  if (src.startsWith("youtube/")) return parseYouTubeSource(src) ? "youtube" : null;
  if (src.startsWith("vimeo/")) return parseVimeoSource(src) ? "vimeo" : null;
  if (SPOTIFY_URI.test(src)) return parseSpotifySource(src) ? "spotify" : null;
  const url = parseUrl3(src);
  if (!url) return null;
  const host = url.hostname.toLowerCase();
  if (YOUTUBE_HOSTS.has(host)) return parseYouTubeSource(src) ? "youtube" : null;
  if (VIMEO_HOSTS.has(host)) return parseVimeoSource(src) ? "vimeo" : null;
  if (isHost(host, "wistia.com") || isHost(host, "wistia.net") || isHost(host, "wi.st") || url.searchParams.has("wvideo")) return parseWistiaMediaId(src) ? "wistia" : null;
  if (host === "stream.mux.com") return MUX_STREAM_PATH.test(url.pathname) ? "mux" : null;
  if (isHost(host, "cloudflarestream.com") || isHost(host, "videodelivery.net")) return parseCloudflareSource(src) ? "cloudflare" : null;
  if (host === "open.spotify.com") return parseSpotifySource(src) ? "spotify" : null;
  if (isHost(host, "soundcloud.com")) return parseSoundCloudSource(src) ? "soundcloud" : null;
  if (isHost(host, "mixcloud.com")) return parseMixcloudSource(src) ? "mixcloud" : null;
  if (TIKTOK_HOSTS.has(host)) return parseTikTokSource(src) ? "tiktok" : null;
  if (TWITCH_HOSTS.has(host)) return parseTwitchSource(src) ? "twitch" : null;
  if (DAILYMOTION_HOSTS.has(host)) return parseDailymotionSource(src) ? "dailymotion" : null;
  return null;
}
function fromMimeType(type) {
  const mimeType = type?.split(";", 1)[0].trim().toLowerCase();
  if (!mimeType) return null;
  if (HLS_TYPES.has(mimeType)) return "hls";
  if (mimeType === DASH_TYPE) return "dash";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return null;
}
function isHost(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}
function parseUrl3(src) {
  if (URL_SCHEME.test(src)) return tryParseUrl(src);
  return HOST_FIRST.test(src) ? tryParseUrl(`https://${src}`) : null;
}
function tryParseUrl(src) {
  try {
    return new URL(src);
  } catch {
    return null;
  }
}
var SPOTIFY_URI = /^spotify:/i;
var URL_SCHEME = /^[a-z][a-z\d+.-]*:\/\//i;
var HOST_FIRST = /^[\w-]+(?:\.[\w-]+)+\//;
var EXTENSION = /\.([a-z\d]+)$/i;
var MUX_STREAM_PATH = /^\/[^/.]+(?:\.m3u8)?$/;
var YOUTUBE_HOSTS = /* @__PURE__ */ new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com"
]);
var VIMEO_HOSTS = /* @__PURE__ */ new Set([
  "vimeo.com",
  "www.vimeo.com",
  "player.vimeo.com"
]);
var TIKTOK_HOSTS = /* @__PURE__ */ new Set(["tiktok.com", "www.tiktok.com"]);
var TWITCH_HOSTS = /* @__PURE__ */ new Set([
  "twitch.tv",
  "www.twitch.tv",
  "go.twitch.tv"
]);
var DAILYMOTION_HOSTS = /* @__PURE__ */ new Set([
  "dailymotion.com",
  "www.dailymotion.com",
  "geo.dailymotion.com",
  "dai.ly"
]);
var HLS_TYPES = /* @__PURE__ */ new Set([
  "application/vnd.apple.mpegurl",
  "application/x-mpegurl",
  "application/mpegurl",
  "audio/mpegurl",
  "audio/x-mpegurl",
  "video/mpegurl",
  "video/x-mpegurl"
]);
var DASH_TYPE = "application/dash+xml";
var MIME_TYPES = /* @__PURE__ */ new Map([
  ["m3u8", "application/x-mpegurl"],
  ["mpd", DASH_TYPE],
  ["mp4", "video/mp4"],
  ["webm", "video/webm"],
  ["mov", "video/quicktime"],
  ["ogv", "video/ogg"],
  ["mp3", "audio/mpeg"],
  ["m4a", "audio/mp4"],
  ["wav", "audio/wav"],
  ["ogg", "audio/ogg"],
  ["flac", "audio/flac"],
  ["aac", "audio/aac"]
]);

// node_modules/@videojs/media/dist/default/core/constants.js
var EMPTY_TIME_RANGES = Object.freeze({
  length: 0,
  start: () => 0,
  end: () => 0
});
var NO_TIME_RANGES_YET = Object.freeze({
  length: 0,
  start: () => 0,
  end: () => 0
});
var EMPTY_TEXT_TRACKS = Object.assign(new EventTarget(), {
  length: 0,
  *[Symbol.iterator]() {
  },
  getTrackById: () => null
});
var EMPTY_REMOTE = new EventTarget();

// node_modules/@videojs/media/dist/default/core/bridge-events.js
function bridgeEvents(source, target) {
  if (!source.dispatchEvent) return;
  source.dispatchEvent = (event) => target.dispatchEvent(new event.constructor(event.type, event));
}

// node_modules/@videojs/media/dist/default/core/media-error.js
var MediaError = class MediaError2 extends Error {
  static MEDIA_ERR_ABORTED = 1;
  static MEDIA_ERR_NETWORK = 2;
  static MEDIA_ERR_DECODE = 3;
  static MEDIA_ERR_SRC_NOT_SUPPORTED = 4;
  static MEDIA_ERR_ENCRYPTED = 5;
  static MEDIA_ERR_CUSTOM = 100;
  static defaultMessages = {
    1: "You stopped media playback before it finished.",
    2: "This media could not be loaded due to a network or server issue.",
    3: "This media could not be played. It may be corrupted, or your browser may not support its format.",
    4: "This media could not be loaded. It may be unavailable, or your browser may not support its format.",
    5: "This media could not be played because it could not be decrypted."
  };
  name;
  code;
  context;
  fatal;
  data;
  constructor(message, code = MediaError2.MEDIA_ERR_CUSTOM, fatal, context) {
    super(message);
    this.name = "MediaError";
    this.code = code;
    this.context = context;
    this.fatal = fatal ?? (code >= MediaError2.MEDIA_ERR_NETWORK && code <= MediaError2.MEDIA_ERR_ENCRYPTED);
    if (!this.message) this.message = MediaError2.defaultMessages[this.code] ?? "";
  }
};

// node_modules/@videojs/media/dist/default/core/registered-media.js
var REGISTERED_MEDIA = Symbol.for("@videojs/media/registered");
function getRegisteredMedia(media) {
  return media?.[REGISTERED_MEDIA] ?? media;
}

// node_modules/@videojs/media/dist/default/core/types.js
function toMediaCrossOrigin(value) {
  if (isNil(value)) return null;
  return value.toLowerCase() === "use-credentials" ? "use-credentials" : "anonymous";
}
var MediaReadyState = {
  HAVE_NOTHING: 0,
  HAVE_METADATA: 1,
  HAVE_CURRENT_DATA: 2,
  HAVE_FUTURE_DATA: 3,
  HAVE_ENOUGH_DATA: 4
};
var MediaStreamTypes = {
  ON_DEMAND: "on-demand",
  LIVE: "live",
  UNKNOWN: "unknown"
};

// node_modules/@videojs/media/dist/default/core/predicate.js
function hasMetadata(media) {
  return media.readyState >= MediaReadyState.HAVE_METADATA;
}
function getTimeRangeEnd(media) {
  if (Number.isFinite(media.duration) && media.duration > 0) return media.duration;
  const end = media.seekable.at(-1)?.[1];
  if (end === void 0 || !Number.isFinite(end) || end <= 0) return 0;
  return end;
}
function hasTimeRange(media) {
  return getTimeRangeEnd(media) > 0;
}
function isMediaPlaying(media) {
  return !!media && !media.paused && !media.ended && !media.waiting;
}
function isMediaAutoplayCapable(value) {
  return isObject(value) && isBoolean(value.autoplay);
}
function isMediaPauseCapable(value) {
  if (!isObject(value)) return false;
  const media = value;
  return !isUndefined(media.paused) && !isUndefined(media.ended) && isFunction(media.pause);
}
function isMediaSeekCapable(value) {
  if (!isObject(value)) return false;
  const media = value;
  return !isUndefined(media.currentTime) && !isUndefined(media.duration) && !isUndefined(media.seeking);
}
function isMediaSourceCapable(value) {
  if (!isObject(value)) return false;
  const media = value;
  return !isUndefined(media.src) && !isUndefined(media.currentSrc) && !isUndefined(media.readyState) && isFunction(media.load);
}
function isMediaVolumeCapable(value) {
  if (!isObject(value)) return false;
  const media = value;
  return !isUndefined(media.volume) && !isUndefined(media.muted);
}
function isMediaMutedCapable(value) {
  if (!isObject(value)) return false;
  return !isUndefined(value.muted);
}
function isMediaPlaybackRateCapable(value) {
  if (!isObject(value)) return false;
  return !isUndefined(value.playbackRate);
}
function isMediaPictureInPictureCapable(value) {
  if (!isObject(value)) return false;
  return isFunction(value.requestPictureInPicture);
}
function isMediaBufferCapable(value) {
  if (!isObject(value)) return false;
  const media = value;
  return !isUndefined(media.buffered) && media.buffered !== EMPTY_TIME_RANGES && !isUndefined(media.seekable) && media.seekable !== EMPTY_TIME_RANGES;
}
function isMediaErrorCapable(value) {
  if (!isObject(value)) return false;
  return !isUndefined(value.error);
}
function isMediaTextTrackCapable(value) {
  if (!isObject(value)) return false;
  const media = value;
  return !isUndefined(media.textTracks) && media.textTracks !== EMPTY_TEXT_TRACKS;
}
function isMediaVideoRenditionCapable(value) {
  if (!isObject(value)) return false;
  return !isUndefined(value.videoRenditions);
}
function isMediaAudioTrackCapable(value) {
  if (!isObject(value)) return false;
  return !isUndefined(value.audioTracks);
}
function isMediaVideoDimensionsCapable(value) {
  if (!isObject(value)) return false;
  const media = value;
  return !isUndefined(media.videoWidth) && !isUndefined(media.videoHeight);
}
function isMediaRemotePlaybackCapable(value) {
  if (!isObject(value)) return false;
  const media = value;
  return isObject(media.remote) && media.remote !== EMPTY_REMOTE;
}
function isMediaStreamTypeCapable(value) {
  if (!isObject(value)) return false;
  return !isUndefined(value.streamType);
}
function isMediaContentDataCapable(value) {
  if (!isObject(value)) return false;
  return !isUndefined(value.contentData);
}
function isMediaLiveCapable(value) {
  if (!isObject(value)) return false;
  const media = value;
  return !isUndefined(media.liveEdgeStart) && !isUndefined(media.targetLiveWindow);
}
function isQuerySelectorAllCapable(value) {
  return isObject(value) && "querySelectorAll" in value && isFunction(value.querySelectorAll);
}

// node_modules/@videojs/utils/dist/object/deep-equal.js
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, i) => deepEqual(value, b[i]));
  if (!isPlainObject(a) || !isPlainObject(b)) return false;
  const keysA = Object.keys(a).filter((key) => !isUndefined(a[key]));
  const keysB = Object.keys(b).filter((key) => !isUndefined(b[key]));
  return keysA.length === keysB.length && keysA.every((key) => deepEqual(a[key], b[key]));
}

// node_modules/@videojs/utils/dist/object/shallow-equal.js
var hasOwn = Object.prototype.hasOwnProperty;
function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;
  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) if (!hasOwn.call(b, key) || !Object.is(a[key], b[key])) return false;
  return true;
}

// node_modules/@videojs/utils/dist/object/defaults.js
function defaults(object, defaultValues) {
  const result = { ...defaultValues };
  for (const key of Object.keys(defaultValues)) {
    const value = object[key];
    if (!isUndefined(value)) result[key] = value;
  }
  return result;
}

// node_modules/@videojs/utils/dist/object/flatten.js
function flatten(object, options = {}) {
  const { prefix = "" } = options;
  const result = {};
  for (const [key, value] of Object.entries(object)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) Object.assign(result, flatten(value, { prefix: fullKey }));
    else result[fullKey] = value;
  }
  return result;
}

// node_modules/@videojs/utils/dist/object/omit.js
function omit(obj, keys) {
  const result = {};
  for (const key in obj) if (!keys.includes(key)) result[key] = obj[key];
  return result;
}

// node_modules/@videojs/utils/dist/object/pick.js
function pick(obj, keys) {
  const result = {};
  for (const key of keys) if (Object.hasOwn(obj, key)) result[key] = obj[key];
  return result;
}

// node_modules/@videojs/media/dist/default/dom/html-media-adapter/html-media-adapter.js
var HTMLMediaAdapter = class extends EventTarget {
  #target = null;
  #eventTypes = /* @__PURE__ */ new Set();
  #streamType = MediaStreamTypes.UNKNOWN;
  get target() {
    return this.#target;
  }
  attach(target) {
    if (!target || this.#target === target) return;
    this.#target = target;
    for (const type of this.#eventTypes) target.addEventListener(type, this.#forwardEvent);
  }
  detach() {
    if (!this.#target) return;
    for (const type of this.#eventTypes) this.#target.removeEventListener(type, this.#forwardEvent);
    this.#target = null;
  }
  destroy() {
    this.detach();
    this.#eventTypes.clear();
  }
  querySelectorAll(selectors) {
    return this.target?.querySelectorAll(selectors) ?? [];
  }
  querySelector(selectors) {
    return this.target?.querySelector(selectors) ?? null;
  }
  addEventListener(type, listener, options) {
    if (!this.#eventTypes.has(type)) {
      this.#eventTypes.add(type);
      this.target?.addEventListener(type, this.#forwardEvent);
    }
    super.addEventListener(type, listener, options);
  }
  removeEventListener(type, listener, options) {
    super.removeEventListener(type, listener, options);
  }
  #forwardEvent = (event) => {
    this.dispatchEvent(new event.constructor(event.type, event));
  };
  /**
  * Current stream type (`'on-demand'`, `'live'`, or `'unknown'`). Defaults to `'unknown'`; detecting hosts update it
  * automatically, and consumers can set it to override detection.
  */
  get streamType() {
    return this.target?.streamType ?? this.#streamType;
  }
  set streamType(value) {
    if (this.streamType === value) return;
    this.#streamType = value;
    if (this.target) this.target.streamType = value;
    this.dispatchEvent(new Event("streamtypechange"));
  }
  get liveEdgeStart() {
    return this.target?.liveEdgeStart ?? NaN;
  }
  get targetLiveWindow() {
    return this.target?.targetLiveWindow ?? NaN;
  }
  get contentData() {
    return this.target?.contentData;
  }
  get title() {
    return this.target?.title ?? "";
  }
  set title(value) {
    if (this.target) this.target.title = value;
  }
  get controls() {
    return this.target?.controls ?? false;
  }
  set controls(value) {
    if (this.target) this.target.controls = value;
  }
  get paused() {
    return this.target?.paused ?? true;
  }
  get ended() {
    return this.target?.ended ?? false;
  }
  get loop() {
    return this.target?.loop ?? false;
  }
  set loop(value) {
    if (this.target) this.target.loop = value;
  }
  play() {
    return this.target?.play?.() ?? Promise.reject(new DOMException("No media is attached.", "NotSupportedError"));
  }
  pause() {
    this.target?.pause?.();
  }
  get autoplay() {
    return this.target?.autoplay ?? false;
  }
  set autoplay(value) {
    if (this.target) this.target.autoplay = value;
  }
  get currentTime() {
    return this.target?.currentTime ?? 0;
  }
  set currentTime(value) {
    if (this.target) this.target.currentTime = value;
  }
  get duration() {
    return this.target?.duration ?? NaN;
  }
  get seeking() {
    return this.target?.seeking ?? false;
  }
  get src() {
    return this.target?.src ?? "";
  }
  set src(value) {
    if (this.target) this.target.src = value;
  }
  get currentSrc() {
    return this.target?.currentSrc ?? "";
  }
  get readyState() {
    return this.target?.readyState ?? 0;
  }
  get preload() {
    return this.target?.preload ?? "metadata";
  }
  set preload(value) {
    if (this.target) this.target.preload = value;
  }
  get crossOrigin() {
    return this.target?.crossOrigin ?? null;
  }
  set crossOrigin(value) {
    if (this.target) this.target.crossOrigin = value;
  }
  load() {
    return this.target?.load?.();
  }
  canPlayType(type) {
    return this.target?.canPlayType?.(type) ?? "";
  }
  get volume() {
    return this.target?.volume ?? 1;
  }
  set volume(value) {
    if (this.target) this.target.volume = value;
  }
  get muted() {
    return this.target?.muted ?? false;
  }
  set muted(value) {
    if (this.target) this.target.muted = value;
  }
  get defaultMuted() {
    return this.target?.defaultMuted ?? false;
  }
  set defaultMuted(value) {
    if (this.target) this.target.defaultMuted = value;
  }
  get playbackRate() {
    return this.target?.playbackRate ?? 1;
  }
  set playbackRate(value) {
    if (this.target) this.target.playbackRate = value;
  }
  /**
  * The target's narrower rate range, when it reports one; native media accept the browser's range.
  *
  * @internal
  */
  get playbackRateRange() {
    return this.target?.playbackRateRange;
  }
  get defaultPlaybackRate() {
    return this.target?.defaultPlaybackRate ?? 1;
  }
  set defaultPlaybackRate(value) {
    if (this.target) this.target.defaultPlaybackRate = value;
  }
  get buffered() {
    return this.target?.buffered ?? EMPTY_TIME_RANGES;
  }
  get seekable() {
    return this.target?.seekable ?? EMPTY_TIME_RANGES;
  }
  get played() {
    return this.target?.played ?? EMPTY_TIME_RANGES;
  }
  get error() {
    return this.target?.error ?? null;
  }
  get textTracks() {
    return this.target?.textTracks ?? EMPTY_TEXT_TRACKS;
  }
  addTextTrack(kind, label, language) {
    return this.target?.addTextTrack?.(kind, label, language);
  }
  get remote() {
    return this.target?.remote ?? EMPTY_REMOTE;
  }
  get disableRemotePlayback() {
    return this.target?.disableRemotePlayback ?? false;
  }
  set disableRemotePlayback(value) {
    if (this.target) this.target.disableRemotePlayback = value;
  }
};

// node_modules/@videojs/media/dist/default/dom/custom-media-element/custom-media-element.js
var VideoCSSVars = {
  /** Border radius of the video element. */
  borderRadius: "--media-video-border-radius",
  /** Object fit for the video. */
  objectFit: "--media-object-fit",
  /** Object position for the video. */
  objectPosition: "--media-object-position",
  /** Duration of the caption track transition. */
  captionTrackDuration: "--media-caption-track-duration",
  /** Delay before the caption track transition. */
  captionTrackDelay: "--media-caption-track-delay",
  /** Vertical offset of the caption track. */
  captionTrackY: "--media-caption-track-y"
};
function getVideoTemplateHTML(attrs) {
  return `
    <style>
      :host {
        display: contents;
      }

      video {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: var(${VideoCSSVars.borderRadius});
        object-fit: var(${VideoCSSVars.objectFit}, contain);
        object-position: var(${VideoCSSVars.objectPosition}, center);
      }

      video::-webkit-media-text-track-container {
        transition: translate var(${VideoCSSVars.captionTrackDuration}, 0) ease-out;
        transition-delay: var(${VideoCSSVars.captionTrackDelay}, 0);
        translate: 0 var(${VideoCSSVars.captionTrackY}, 0);
        scale: 0.98;
        z-index: 1;
        font-family: inherit;
      }
    </style>
    <slot name="media">
      <video${serializeAttributes(attrs)}></video>
    </slot>
    <slot></slot>
  `;
}
function getCommonTemplateHTML(tag) {
  return (attrs) => {
    return `
      <style>
        :host {
          display: inline-flex;
          line-height: 0;
          flex-direction: column;
          justify-content: end;
        }

        ${tag} {
          width: 100%;
        }
      </style>
      <slot name="media">
        <${tag}${serializeAttributes(attrs)}></${tag}>
      </slot>
      <slot></slot>
    `;
  };
}
var excludedProperties = [
  "attach",
  "detach",
  "destroy"
];
function attributeName(prop, properties) {
  const config = properties[prop];
  return config ? config.attribute ?? prop.toLowerCase() : kebabCase(prop);
}
function isAttributeAlias(prop, properties, hostPrototype) {
  const { attribute } = properties[prop] ?? {};
  return !!attribute && attribute in hostPrototype;
}
function propertyValueFor(attrValue, current, config) {
  if (typeof current === "boolean") return attrValue !== null;
  if (typeof current === "number") return Number(attrValue);
  return attrValue ?? (config && "empty" in config ? config.empty : "");
}
function CustomMediaElement(tag, PlaybackAdapter) {
  const syncTargetAttributes = tag !== "iframe";
  const mediaHostAttrToProp = /* @__PURE__ */ new Map();
  let isDefined = false;
  class CustomMedia extends (globalThis.HTMLElement ?? class {
  }) {
    static getTemplateHTML = tag.endsWith("video") ? getVideoTemplateHTML : getCommonTemplateHTML(tag);
    static shadowRootOptions = { mode: "open" };
    static properties = {
      autoPictureInPicture: { type: Boolean },
      autoplay: { type: Boolean },
      controls: { type: Boolean },
      controlsList: { type: String },
      crossOrigin: {
        type: String,
        empty: null
      },
      defaultMuted: {
        type: Boolean,
        attribute: "muted"
      },
      disablePictureInPicture: { type: Boolean },
      disableRemotePlayback: { type: Boolean },
      loading: { type: String },
      loop: { type: Boolean },
      playsInline: { type: Boolean },
      poster: {
        type: String,
        empty: ""
      },
      preload: {
        type: String,
        empty: null
      },
      src: {
        type: String,
        empty: ""
      },
      streamType: {
        type: String,
        attribute: "stream-type",
        empty: "unknown"
      }
    };
    static get observedAttributes() {
      CustomMedia.#define(this);
      return [...getAttrsFromProps(this.properties)];
    }
    static #define(ctor) {
      if (isDefined) return;
      isDefined = true;
      const properties = ctor.properties;
      for (let proto = PlaybackAdapter.prototype; proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) for (const prop of Object.getOwnPropertyNames(proto)) {
        if (prop in CustomMedia.prototype || excludedProperties.includes(prop)) continue;
        if (isAttributeAlias(prop, properties, PlaybackAdapter.prototype)) continue;
        const descriptor = Object.getOwnPropertyDescriptor(proto, prop);
        if (!descriptor) continue;
        const config = {
          enumerable: true,
          configurable: true
        };
        if (typeof descriptor.value === "function") config.value = function(...args) {
          return this.#mediaHost[prop](...args);
        };
        else if (descriptor.get) {
          config.get = function() {
            return this.#mediaHost[prop];
          };
          if (descriptor.set) {
            const attr = attributeName(prop, properties);
            if (ctor.observedAttributes.includes(attr)) {
              mediaHostAttrToProp.set(attr, prop);
              config.set = function(val) {
                if (val === true || val === false || val == null) this.toggleAttribute(attr, Boolean(val));
                else this.setAttribute(attr, String(val));
              };
            } else config.set = function(val) {
              this.#mediaHost[prop] = val;
            };
          }
        }
        Object.defineProperty(CustomMedia.prototype, prop, config);
      }
      for (const [prop, { type, attribute }] of Object.entries(properties)) {
        if (prop in CustomMedia.prototype) continue;
        const attr = attribute ?? prop.toLowerCase();
        Object.defineProperty(CustomMedia.prototype, prop, {
          get: function() {
            return type === Boolean ? this.hasAttribute(attr) : this.getAttribute(attr);
          },
          set: function(val) {
            if (type === Boolean) this.toggleAttribute(attr, Boolean(val));
            else this.setAttribute(attr, val);
          },
          enumerable: true,
          configurable: true
        });
      }
    }
    #mediaDestroyed = false;
    #mediaHost;
    #bridgedEventTypes = /* @__PURE__ */ new Set();
    #childMap = /* @__PURE__ */ new Map();
    #childObserver;
    constructor() {
      super();
      if (!this.shadowRoot) {
        const ctor = this.constructor;
        this.attachShadow(ctor.shadowRootOptions);
        const allowedKeys = getAttrsFromProps(ctor.properties);
        const disallowedKeys = [...mediaHostAttrToProp.keys()];
        const pickedAttrs = pick(namedNodeMapToObject(this.attributes), allowedKeys);
        const attrs = syncTargetAttributes ? omit(pickedAttrs, disallowedKeys) : pickedAttrs;
        if (tag && !attrs.part) attrs.part = tag;
        this.shadowRoot.innerHTML = ctor.getTemplateHTML(attrs);
      }
      this.#mediaHost = new PlaybackAdapter();
      const destroyAdapter = this.#mediaHost.destroy.bind(this.#mediaHost);
      this.#mediaHost.destroy = () => {
        if (this.#mediaDestroyed) return;
        this.#mediaDestroyed = true;
        const target = this.target;
        this.dispatchEvent(new Event("tyl-player-media-dispose"));
        this.#childObserver?.disconnect();
        this.#childMap.clear();
        for (const type of this.#bridgedEventTypes) this.#mediaHost.removeEventListener(type, this.#bridgeEvent);
        this.#bridgedEventTypes.clear();
        try {
          destroyAdapter();
        } finally {
          if (target instanceof HTMLMediaElement) {
            target.pause();
            target.removeAttribute("src");
            for (const source of target.querySelectorAll("source")) source.removeAttribute("src");
            target.load();
          } else if (target instanceof HTMLIFrameElement) {
            target.removeAttribute("src");
          }
        }
      };
      this.#attachToTarget();
      this.#childObserver = new MutationObserver(this.#syncMediaChildAttribute.bind(this));
      this.shadowRoot.addEventListener("slotchange", () => {
        this.#attachToTarget();
        this.#syncMediaChildren();
      });
      this.#syncMediaChildren();
    }
    #attachToTarget() {
      if (this.#mediaDestroyed) return;
      const target = this.target;
      if (target === this.#mediaHost.target) return;
      if (this.#mediaHost.target) this.#mediaHost.detach();
      this.#mediaHost.attach(target);
    }
    get adapter() {
      return this.#mediaHost;
    }
    get target() {
      return this.querySelector(":scope > [slot=media]") ?? this.querySelector(tag) ?? this.shadowRoot?.querySelector(tag) ?? null;
    }
    connectedCallback() {
      if (tag !== "iframe") return;
      if (!this.hasAttribute("data-cross-origin-frame")) this.setAttribute("data-cross-origin-frame", "");
    }
    disconnectedCallback() {
      if (this.hasAttribute("keep-alive")) return;
      queueMicrotask(() => {
        if (!this.isConnected) this.#mediaHost.destroy();
      });
    }
    addEventListener(type, listener, options) {
      super.addEventListener(type, listener, options);
      if (!this.#bridgedEventTypes.has(type)) {
        this.#bridgedEventTypes.add(type);
        this.#mediaHost.addEventListener(type, this.#bridgeEvent);
      }
    }
    removeEventListener(type, listener, options) {
      super.removeEventListener(type, listener, options);
    }
    #bridgeEvent = (event) => {
      if (!event.composed) this.dispatchEvent(new event.constructor(event.type, event));
    };
    attributeChangedCallback(attrName, oldValue, newValue) {
      const prop = mediaHostAttrToProp.get(attrName);
      if (prop) {
        if (oldValue !== newValue) {
          const propConfig = this.constructor.properties[prop];
          this.#mediaHost[prop] = propertyValueFor(newValue, this.#mediaHost[prop], propConfig);
        }
        return;
      }
      if (!CustomMedia.observedAttributes.includes(attrName) && this.constructor.observedAttributes.includes(attrName)) return;
      if (!syncTargetAttributes) return;
      if (newValue === null) this.target?.removeAttribute(attrName);
      else if (this.target?.getAttribute(attrName) !== newValue) this.target?.setAttribute(attrName, newValue);
    }
    #syncMediaChildren() {
      if (this.#mediaDestroyed || tag === "iframe") return;
      const defaultSlot = this.shadowRoot?.querySelector("slot:not([name])");
      const mediaChildren = new Set(defaultSlot?.assignedElements({ flatten: true }).filter((el) => el.localName === "track" || el.localName === "source"));
      for (const [el, clone] of this.#childMap) if (!mediaChildren.has(el)) {
        clone.remove();
        this.#childMap.delete(el);
      }
      for (const el of mediaChildren) {
        let clone = this.#childMap.get(el);
        if (!clone) {
          clone = el.cloneNode();
          this.#childMap.set(el, clone);
          this.#childObserver?.observe(el, { attributes: true });
        }
        this.target?.append(clone);
        this.#enableDefaultTrack(clone);
      }
    }
    #syncMediaChildAttribute(mutations) {
      if (this.#mediaDestroyed) return;
      for (const mutation of mutations) if (mutation.type === "attributes") {
        const { target, attributeName: attributeName2 } = mutation;
        const clone = this.#childMap.get(target);
        if (clone && attributeName2) {
          clone.setAttribute(attributeName2, target.getAttribute(attributeName2) ?? "");
          this.#enableDefaultTrack(clone);
        }
      }
    }
    #enableDefaultTrack(trackEl) {
      if (trackEl && trackEl.localName === "track" && trackEl.default && (trackEl.kind === "chapters" || trackEl.kind === "metadata") && trackEl.track.mode === "disabled") trackEl.track.mode = "hidden";
    }
  }
  return CustomMedia;
}
function getAttrsFromProps(props) {
  return Object.keys(props).map((prop) => attributeName(prop, props));
}

// node_modules/@videojs/media/dist/default/dom/media-played-ranges/media-played-ranges.js
function MediaPlayedRangesMixin(BaseClass) {
  class MediaPlayedRanges extends BaseClass {
    #playedRanges = [];
    #currentPlayedRange = null;
    #rangeEpsilon = 0.5;
    #disconnect = new AbortController();
    constructor(...args) {
      super(...args);
      const options = { signal: this.#disconnect.signal };
      this.addEventListener("play", () => this.#onPlaybackStart(this.#currentTime), options);
      this.addEventListener("pause", () => this.#onPlaybackStop(this.#currentTime), options);
      this.addEventListener("ended", () => this.#onPlaybackStop(this.#currentTime), options);
      this.addEventListener("timeupdate", () => this.#onPlaybackProgress(this.#currentTime), options);
      this.addEventListener("seeking", () => this.#commitCurrentRange(), options);
      this.addEventListener("seeked", () => this.#onSeeked(this.#currentTime), options);
    }
    /** The host (subclass) supplies `currentTime` / `paused`. */
    get #host() {
      return this;
    }
    get #currentTime() {
      return this.#host.currentTime;
    }
    get played() {
      const time = this.#currentTime;
      if (!this.#host.paused && !this.#currentPlayedRange && isNumber(time)) this.#currentPlayedRange = {
        start: time,
        end: time
      };
      this.#onPlaybackProgress(time);
      if (this.#currentPlayedRange && isNumber(time)) this.#addPlayedRange(this.#currentPlayedRange.start, this.#currentPlayedRange.end);
      if (!this.#playedRanges.length) return createTimeRanges([[0, 0]]);
      return createTimeRanges(this.#playedRanges.map((r) => [r.start, r.end]));
    }
    destroy() {
      this.#disconnect.abort();
      super.destroy?.();
    }
    #onPlaybackStart(time) {
      const t = isNumber(time) ? time : this.#currentTime;
      if (!this.#currentPlayedRange) this.#currentPlayedRange = {
        start: t,
        end: t
      };
    }
    #onPlaybackProgress(time) {
      if (this.#currentPlayedRange && isNumber(time) && time > this.#currentPlayedRange.end) this.#currentPlayedRange.end = time;
    }
    #onSeeked(time) {
      const t = isNumber(time) ? time : this.#currentTime;
      this.#currentPlayedRange = {
        start: t,
        end: t
      };
    }
    #onPlaybackStop(time) {
      const t = isNumber(time) ? time : this.#currentTime;
      this.#commitCurrentRange(t);
    }
    #commitCurrentRange(time) {
      if (!this.#currentPlayedRange) return;
      if (isNumber(time)) this.#currentPlayedRange.end = time;
      const { start: start2, end } = this.#currentPlayedRange;
      this.#currentPlayedRange = null;
      this.#addPlayedRange(start2, end);
    }
    #addPlayedRange(start2, end) {
      if (start2 >= end) return;
      const allRanges = [...this.#playedRanges, {
        start: start2,
        end
      }];
      allRanges.sort((a, b) => a.start - b.start);
      const merged = [];
      for (const range of allRanges) {
        const last = merged.length ? merged[merged.length - 1] : null;
        if (!last) {
          merged.push({ ...range });
          continue;
        }
        if (range.start <= last.end + this.#rangeEpsilon) {
          last.start = Math.min(last.start, range.start);
          last.end = Math.max(last.end, range.end);
        } else merged.push({ ...range });
      }
      this.#playedRanges = merged;
    }
  }
  return MediaPlayedRanges;
}
function createTimeRanges(ranges) {
  Object.defineProperties(ranges, {
    start: { value: (i) => ranges[i]?.[0] ?? 0 },
    end: { value: (i) => ranges[i]?.[1] ?? 0 }
  });
  return ranges;
}

// node_modules/@videojs/media/dist/default/dom/utils/embed-params.js
function serializeEmbedParams(props) {
  const params = new URLSearchParams();
  for (const key in props) {
    const val = props[key];
    if (val === true || val === "") params.set(key, "1");
    else if (val === false) params.set(key, "0");
    else if (val != null) params.set(key, String(val));
  }
  return params.toString();
}

// node_modules/@videojs/media/dist/default/dom/utils/media-target.js
function getMediaEngineName(media) {
  media = getRegisteredMedia(media);
  if (media instanceof HTMLMediaElement) return "browser";
  if (!isObject(media)) return void 0;
  const adapter = "adapter" in media && isObject(media.adapter) ? media.adapter : media;
  const instanceName = adapter.engineName;
  if (isString(instanceName)) return instanceName;
  const staticName = adapter.constructor?.engineName;
  return isString(staticName) ? staticName : void 0;
}

// node_modules/@videojs/media/dist/default/dom/utils/time-ranges.js
function createTimeRange(start2, end) {
  return {
    length: 1,
    start: () => start2,
    end: () => end
  };
}

// node_modules/@videojs/media/dist/default/dom/html-video-adapter/html-video-adapter.js
var HTMLVideoAdapter = class extends HTMLMediaAdapter {
  get poster() {
    return this.target?.poster ?? "";
  }
  set poster(value) {
    if (this.target) this.target.poster = value;
  }
  get playsInline() {
    return this.target?.playsInline ?? false;
  }
  set playsInline(value) {
    if (this.target) this.target.playsInline = value;
  }
  get videoWidth() {
    return this.target?.videoWidth ?? 0;
  }
  get videoHeight() {
    return this.target?.videoHeight ?? 0;
  }
  get disablePictureInPicture() {
    return this.target?.disablePictureInPicture ?? false;
  }
  set disablePictureInPicture(value) {
    if (this.target) this.target.disablePictureInPicture = value;
  }
  get webkitCurrentPlaybackTargetIsWireless() {
    return this.target?.webkitCurrentPlaybackTargetIsWireless;
  }
  get webkitPresentationMode() {
    return this.target?.webkitPresentationMode;
  }
  get webkitSetPresentationMode() {
    const target = this.target;
    const fn = target?.webkitSetPresentationMode;
    return isFunction(fn) ? fn.bind(target) : void 0;
  }
  get isPictureInPicture() {
    const el = this.target;
    return !!el && globalThis.document?.pictureInPictureElement === el || this.webkitPresentationMode === "picture-in-picture";
  }
  get isFullscreen() {
    const el = this.target;
    if (!el) return false;
    if (this.webkitPresentationMode === "fullscreen") return true;
    const doc = globalThis.document;
    return doc?.fullscreenElement === el || doc?.webkitFullscreenElement === el;
  }
  async requestPictureInPicture() {
    if (!this.target) return Promise.reject();
    return this.target.requestPictureInPicture();
  }
  async exitPictureInPicture() {
    if (!this.target) return Promise.reject();
    return globalThis.document?.exitPictureInPicture();
  }
  requestFullscreen() {
    if (!this.target) return Promise.reject();
    return this.target.requestFullscreen();
  }
  exitFullscreen() {
    if (!this.target) return Promise.reject();
    return globalThis.document?.exitFullscreen();
  }
};

export {
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isNull,
  isUndefined,
  isNil,
  isPromise,
  isObject,
  hasMethods,
  isAbortError,
  deepEqual,
  defaults,
  flatten,
  pick,
  shallowEqual,
  noop,
  animationFrame,
  escapeHtml,
  snapshotAttributes,
  restoreAttributes,
  getElementChildren,
  findElementChild,
  findComposedElement,
  listen,
  isRTL,
  onEvent,
  isDocument,
  isHTMLImageElement,
  walkAncestors,
  getDeepActiveElement,
  getTabbableElements,
  supportsAnchorPositioning,
  supportsPopoverAPI,
  isEditableTarget,
  isInteractiveTarget,
  isInteractiveActivation,
  isKeptAlive,
  camelCase,
  kebabCase,
  getAnchorNames,
  applyStyles,
  snapshotInlineStyles,
  restoreInlineStyles,
  readCSSLength,
  resolveCSSLength,
  getElementSize,
  isPointInElement,
  measureElement,
  getElementPadding,
  getInlineExtent,
  getBlockExtent,
  measureElementChildren,
  getTextDirection,
  DEFAULT_LOCALE,
  isDefaultLocale,
  effectiveLocale,
  findNearestLang,
  mergeLocaleOverlays,
  resolveLangAttr,
  subscribeAmbientLang,
  observeResize,
  observeElements,
  isMacOS,
  getPositionedSide,
  tryShowPopover,
  tryHidePopover,
  hideOpenPopovers,
  rafThrottle,
  configureCspNonce,
  loadScript,
  ensureGlobalStyle,
  createShadowStyle,
  applyShadowStyles,
  createTemplate,
  getTemplateElement,
  getTemplateRoot,
  cloneTemplateRoot,
  renderTemplate,
  isCaptionOrSubtitleTrack,
  getCaptionOrSubtitleTracks,
  findTrackElement,
  serializeTimeRanges,
  containsComposed,
  supportsWebKitAirPlay,
  isWebKitAirPlayCapable,
  NO_TIME_RANGES_YET,
  bridgeEvents,
  KeySystems,
  MediaError,
  REGISTERED_MEDIA,
  getRegisteredMedia,
  toMediaCrossOrigin,
  MediaReadyState,
  MediaStreamTypes,
  hasMetadata,
  getTimeRangeEnd,
  hasTimeRange,
  isMediaPlaying,
  isMediaAutoplayCapable,
  isMediaPauseCapable,
  isMediaSeekCapable,
  isMediaSourceCapable,
  isMediaVolumeCapable,
  isMediaMutedCapable,
  isMediaPlaybackRateCapable,
  isMediaPictureInPictureCapable,
  isMediaBufferCapable,
  isMediaErrorCapable,
  isMediaTextTrackCapable,
  isMediaVideoRenditionCapable,
  isMediaAudioTrackCapable,
  isMediaVideoDimensionsCapable,
  isMediaRemotePlaybackCapable,
  isMediaStreamTypeCapable,
  isMediaContentDataCapable,
  isMediaLiveCapable,
  isQuerySelectorAllCapable,
  parseYouTubeVideoId,
  parseYouTubeSource,
  resolveAdapterType,
  CustomMediaElement,
  MediaPlayedRangesMixin,
  serializeEmbedParams,
  getMediaEngineName,
  createTimeRange,
  HTMLVideoAdapter
};
