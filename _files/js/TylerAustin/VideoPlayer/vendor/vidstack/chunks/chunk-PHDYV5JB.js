import {
  A,
  D,
  T,
  j,
  x
} from "./chunk-SLLBIDAD.min.js";
import {
  useMediaContext
} from "./chunk-6ATT5ISY.min.js";
import {
  animationFrameThrottle,
  computed,
  effect,
  isDOMNode,
  isString,
  onDispose,
  peek
} from "./chunk-UMQWA6KQ.min.js";

// node_modules/lit-html/directive.js
var t = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var e = (t3) => (...e4) => ({ _$litDirective$: t3, values: e4 });
var i = class {
  constructor(t3) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t3, e4, i2) {
    this._$Ct = t3, this._$AM = e4, this._$Ci = i2;
  }
  _$AS(t3, e4) {
    return this.update(t3, e4);
  }
  update(t3, e4) {
    return this.render(...e4);
  }
};

// node_modules/lit-html/directives/unsafe-html.js
var e2 = class extends i {
  constructor(i2) {
    if (super(i2), this.et = A, i2.type !== t.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(r2) {
    if (r2 === A || null == r2) return this.ft = void 0, this.et = r2;
    if (r2 === T) return r2;
    if ("string" != typeof r2) throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (r2 === this.et) return this.ft;
    this.et = r2;
    const s3 = [r2];
    return s3.raw = s3, this.ft = { _$litType$: this.constructor.resultType, strings: s3, values: [] };
  }
};
e2.directiveName = "unsafeHTML", e2.resultType = 1;
var o = e(e2);

// node_modules/lit-html/directive-helpers.js
var { I: l } = j;
var e3 = (o4) => void 0 === o4.strings;
var s = {};
var a = (o4, l4 = s) => o4._$AH = l4;

// node_modules/lit-html/async-directive.js
var s2 = (i2, t3) => {
  var e4, o4;
  const r2 = i2._$AN;
  if (void 0 === r2) return false;
  for (const i3 of r2) null === (o4 = (e4 = i3)._$AO) || void 0 === o4 || o4.call(e4, t3, false), s2(i3, t3);
  return true;
};
var o2 = (i2) => {
  let t3, e4;
  do {
    if (void 0 === (t3 = i2._$AM)) break;
    e4 = t3._$AN, e4.delete(i2), i2 = t3;
  } while (0 === (null == e4 ? void 0 : e4.size));
};
var r = (i2) => {
  for (let t3; t3 = i2._$AM; i2 = t3) {
    let e4 = t3._$AN;
    if (void 0 === e4) t3._$AN = e4 = /* @__PURE__ */ new Set();
    else if (e4.has(i2)) break;
    e4.add(i2), l2(t3);
  }
};
function n(i2) {
  void 0 !== this._$AN ? (o2(this), this._$AM = i2, r(this)) : this._$AM = i2;
}
function h(i2, t3 = false, e4 = 0) {
  const r2 = this._$AH, n2 = this._$AN;
  if (void 0 !== n2 && 0 !== n2.size) if (t3) if (Array.isArray(r2)) for (let i3 = e4; i3 < r2.length; i3++) s2(r2[i3], false), o2(r2[i3]);
  else null != r2 && (s2(r2, false), o2(r2));
  else s2(this, i2);
}
var l2 = (i2) => {
  var t3, s3, o4, r2;
  i2.type == t.CHILD && (null !== (t3 = (o4 = i2)._$AP) && void 0 !== t3 || (o4._$AP = h), null !== (s3 = (r2 = i2)._$AQ) && void 0 !== s3 || (r2._$AQ = n));
};
var c = class extends i {
  constructor() {
    super(...arguments), this._$AN = void 0;
  }
  _$AT(i2, t3, e4) {
    super._$AT(i2, t3, e4), r(this), this.isConnected = i2._$AU;
  }
  _$AO(i2, t3 = true) {
    var e4, r2;
    i2 !== this.isConnected && (this.isConnected = i2, i2 ? null === (e4 = this.reconnected) || void 0 === e4 || e4.call(this) : null === (r2 = this.disconnected) || void 0 === r2 || r2.call(this)), t3 && (s2(this, i2), o2(this));
  }
  setValue(t3) {
    if (e3(this._$Ct)) this._$Ct._$AI(t3, this);
    else {
      const i2 = [...this._$Ct._$AH];
      i2[this._$Ci] = t3, this._$Ct._$AI(i2, this, 0);
    }
  }
  disconnected() {
  }
  reconnected() {
  }
};

// node_modules/lit-html/directives/if-defined.js
var l3 = (l4) => null != l4 ? l4 : A;

// node_modules/lit-html/directives/unsafe-svg.js
var t2 = class extends e2 {
};
t2.directiveName = "unsafeSVG", t2.resultType = 2;
var o3 = e(t2);

// node_modules/vidstack/prod/chunks/vidstack-B1rlsgcu.js
var SignalDirective = class extends c {
  #signal = null;
  #isAttr = false;
  #stop = null;
  constructor(part) {
    super(part);
    this.#isAttr = part.type === t.ATTRIBUTE || part.type === t.BOOLEAN_ATTRIBUTE;
  }
  render(signal) {
    if (signal !== this.#signal) {
      this.disconnected();
      this.#signal = signal;
      if (this.isConnected) this.#watch();
    }
    return this.#signal ? this.#resolveValue(peek(this.#signal)) : A;
  }
  reconnected() {
    this.#watch();
  }
  disconnected() {
    this.#stop?.();
    this.#stop = null;
  }
  #watch() {
    if (!this.#signal) return;
    this.#stop = effect(this.#onValueChange.bind(this));
  }
  #resolveValue(value) {
    return this.#isAttr ? l3(value) : value;
  }
  #setValue(value) {
    this.setValue(this.#resolveValue(value));
  }
  #onValueChange() {
    this.#setValue(this.#signal?.());
  }
};
function $signal(compute) {
  return e(SignalDirective)(computed(compute));
}
var SlotObserver = class {
  #roots;
  #callback;
  elements = /* @__PURE__ */ new Set();
  constructor(roots, callback) {
    this.#roots = roots;
    this.#callback = callback;
  }
  connect() {
    this.#update();
    const observer = new MutationObserver(this.#onMutation);
    for (const root of this.#roots) observer.observe(root, {
      childList: true,
      subtree: true
    });
    onDispose(() => observer.disconnect());
    onDispose(this.disconnect.bind(this));
  }
  disconnect() {
    this.elements.clear();
  }
  assign(template, slot) {
    if (isDOMNode(template)) {
      slot.textContent = "";
      slot.append(template);
    } else {
      D(null, slot);
      D(template, slot);
    }
    if (!slot.style.display) slot.style.display = "contents";
    const el = slot.firstElementChild;
    if (!el) return;
    const classList = slot.getAttribute("data-class");
    if (classList) el.classList.add(...classList.split(" "));
  }
  #onMutation = animationFrameThrottle(this.#update.bind(this));
  #update(entries) {
    if (entries && !entries.some((e4) => e4.addedNodes.length)) return;
    let changed = false, slots = this.#roots.flatMap((root) => [...root.querySelectorAll("slot")]);
    for (const slot of slots) {
      if (!slot.hasAttribute("name") || this.elements.has(slot)) continue;
      this.elements.add(slot);
      changed = true;
    }
    if (changed) this.#callback(this.elements);
  }
};
var id = 0;
var slotIdAttr = "data-slot-id";
var SlotManager = class {
  #roots;
  slots;
  constructor(roots) {
    this.#roots = roots;
    this.slots = new SlotObserver(roots, this.#update.bind(this));
  }
  connect() {
    this.slots.connect();
    this.#update();
    const mutations = new MutationObserver(this.#onMutation);
    for (const root of this.#roots) mutations.observe(root, { childList: true });
    onDispose(() => mutations.disconnect());
  }
  #onMutation = animationFrameThrottle(this.#update.bind(this));
  #update() {
    for (const root of this.#roots) for (const node of root.children) {
      if (node.nodeType !== 1) continue;
      const name = node.getAttribute("slot");
      if (!name) continue;
      node.style.display = "none";
      let slotId = node.getAttribute(slotIdAttr);
      if (!slotId) node.setAttribute(slotIdAttr, slotId = ++id + "");
      for (const slot of this.slots.elements) {
        if (slot.getAttribute("name") !== name || slot.getAttribute(slotIdAttr) === slotId) continue;
        const clone = document.importNode(node, true);
        if (name.includes("-icon")) clone.classList.add("vds-icon");
        clone.style.display = "";
        clone.removeAttribute("slot");
        this.slots.assign(clone, slot);
        slot.setAttribute(slotIdAttr, slotId);
      }
    }
  }
};
function Icon({ name, class: _class, state, paths, viewBox = "0 0 32 32" }) {
  return x`<svg
    class="${"vds-icon" + (_class ? ` ${_class}` : "")}"
    viewBox="${viewBox}"
    fill="none"
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    data-icon=${l3(name ?? state)}
  >
    ${!isString(paths) ? $signal(paths) : o3(paths)}
  </svg>`;
}
var IconsLoader = class {
  #icons = {};
  #loaded = false;
  slots;
  constructor(roots) {
    this.slots = new SlotObserver(roots, this.#insertIcons.bind(this));
  }
  connect() {
    this.slots.connect();
  }
  load() {
    this.loadIcons().then((icons) => {
      this.#icons = icons;
      this.#loaded = true;
      this.#insertIcons();
    });
  }
  *#iterate() {
    for (const iconName of Object.keys(this.#icons)) {
      const slotName = `${iconName}-icon`;
      for (const slot of this.slots.elements) {
        if (slot.name !== slotName) continue;
        yield {
          icon: this.#icons[iconName],
          slot
        };
      }
    }
  }
  #insertIcons() {
    if (!this.#loaded) return;
    for (const { icon, slot } of this.#iterate()) this.slots.assign(icon, slot);
  }
};
var LayoutIconsLoader = class extends IconsLoader {
  connect() {
    super.connect();
    const { player } = useMediaContext();
    if (!player.el) return;
    let dispose, observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      dispose?.();
      dispose = void 0;
      this.load();
    });
    observer.observe(player.el);
    dispose = onDispose(() => observer.disconnect());
  }
};

export {
  a,
  e,
  i,
  c,
  l3 as l,
  o,
  $signal,
  SlotManager,
  Icon,
  LayoutIconsLoader
};
/*! For license information please see chunk-PHDYV5JB.min.js.LEGAL.txt */
