// Shared card frame: layouts, badges, tap targets, status header, and the
// explanation dialog. Each card adds its layouts, its explanation, and
// `_apply()`, which maps entity states onto the drawing.
import { assets } from "../assets";
import type { Layout } from "../draw/layout";
import { fill, T } from "../i18n";
import { type CardConfig, checkConfig, conditionEntity, type StateCondition } from "./config";
import { EDITOR_TAG, type ViCardEditor } from "./editor-element";
import type { Hass, HassEntity } from "./hass";
import type { InfoContent } from "./info";
import { isSettled, resolveEntities } from "./resolve";
import type { Slot } from "./slots";

interface Status {
  state?: string;
  detail?: string;
  info?: string;
  err?: boolean;
  items?: { id: string; text: string }[];
  stateId?: string;
}

interface StatusMessage {
  result?: unknown;
  error?: string;
  level?: string;
}

interface BadgeRef {
  el: HTMLElement;
  key: string;
  val: HTMLElement;
  big: boolean;
}

type CardClass = typeof ViCard;

const L = T.card;

// Viewers can pause the motion; the choice holds for all cards in this
// browser and reaches the other cards through a window event.
const PAUSE_KEY = "vi-climate-cards:paused";
const PAUSE_EVENT = "vi-climate-cards-paused";

function readPaused(): boolean {
  try {
    return localStorage.getItem(PAUSE_KEY) === "1";
  } catch {
    return false;
  }
}

function writePaused(paused: boolean): void {
  try {
    if (paused) localStorage.setItem(PAUSE_KEY, "1");
    else localStorage.removeItem(PAUSE_KEY);
  } catch {
    /* storage blocked: the choice lasts until the page reloads */
  }
  window.dispatchEvent(new CustomEvent(PAUSE_EVENT, { detail: paused }));
}

export abstract class ViCard extends HTMLElement {
  /** The entity keys the card draws; see slots.ts. */
  static slots: Slot[] = [];

  /** Drawing variants; the first is the default. */
  static presets: string[] = [];

  static get layouts(): Layout[] {
    return [];
  }

  static get info(): InfoContent | null {
    return null;
  }

  /** Both cards share one stylesheet. */
  static get css(): string {
    return assets().css;
  }

  /** Bundle version, e.g. in the browser console: customElements.get("vi-hydraulic-card").version */
  static readonly version = __VERSION__;

  /** The visual editor: HA's form, filled with what the card detects. */
  static getConfigElement(): HTMLElement {
    const editor = document.createElement(EDITOR_TAG) as ViCardEditor;
    // `this` is the card class HA calls this on, with its own keys.
    // biome-ignore lint/complexity/noThisInStatic: ViCard.slots would be empty
    editor.card = this;
    return editor;
  }

  /** A new card from the card picker needs no options: it finds the heat
   * pump and its entities itself. */
  static getStubConfig(): Partial<CardConfig> {
    return {};
  }

  protected _config?: CardConfig;
  protected _hass?: Hass;
  /** Entity per key: discovered on the device, overridden by `entities`. */
  protected _entities: Record<string, string> = {};
  private _registry?: Hass["entities"];
  private _settled = false;
  protected _root?: HTMLElement;
  protected _pipes: SVGElement[] = [];
  protected _ptrs: SVGElement[] = [];
  protected _fans: SVGElement[] = [];
  protected _pumps: SVGElement[] = [];
  protected _heaters: SVGElement[] = [];
  protected _badgeEls: BadgeRef[] = [];
  /** Every tappable part, for its spoken label. */
  private _buttons: (HTMLElement | SVGElement)[] = [];
  protected _dlg?: HTMLDialogElement | null;
  private _status?: Status;
  private _statusKey?: string;
  private _unsub?: Promise<(() => void) | undefined>;
  private _tick?: ReturnType<typeof setInterval>;
  private _paused = readPaused();
  private _onPaused = (ev: Event) => this._setPaused((ev as CustomEvent<boolean>).detail);

  private get cls(): CardClass {
    return this.constructor as CardClass;
  }

  /** Maps the entity states onto the drawing. */
  protected abstract _apply(): void;

  /** Whether the explanation shows live values: at rest the temperatures even
   * out and explain nothing. */
  protected abstract _infoLive(): boolean;

  setConfig(config: CardConfig): void {
    checkConfig(config, this.cls.presets);
    if (
      config.status !== this._config?.status ||
      config.status_entity !== this._config?.status_entity ||
      config.show_state !== this._config?.show_state ||
      JSON.stringify(config.status_items) !== JSON.stringify(this._config?.status_items)
    ) {
      this._unsubscribe();
      this._status = undefined;
      this._statusKey = undefined;
    }
    this._config = config;
    this._entities = {};
    this._registry = undefined;
    this._resolve();
    if (this._root) {
      this._build();
      this._update();
      this._entityStatus();
    }
    this._subscribe();
    this._syncTick();
  }

  // HA sets hass on every state change in the instance. The card redraws
  // only when something it shows changed: a state object of its entities
  // (HA replaces those only on change), the registry, the theme mode, or
  // the formatters (they change when language or translations load).
  set hass(hass: Hass) {
    const prev = this._hass;
    this._hass = hass;
    this._subscribe();
    const mapped = this._resolve();
    // The header state is found with the other entities.
    this._syncTick();
    if (mapped || !this._root) this._build();
    else if (prev && !this._changed(prev, hass)) return;
    this._update();
    this._entityStatus();
  }

  private _changed(prev: Hass, next: Hass): boolean {
    if (
      prev.entities !== next.entities ||
      prev.devices !== next.devices ||
      prev.themes?.darkMode !== next.themes?.darkMode ||
      prev.formatEntityState !== next.formatEntityState
    ) {
      return true;
    }
    return this._watched().some((id) => prev.states[id] !== next.states[id]);
  }

  /** Every entity the card reads: its parts and the header's entities. */
  private _watched(): string[] {
    const config = this._config;
    const ids = new Set(Object.values(this._entities));
    const head = this._headEntity();
    if (head) ids.add(head);
    for (const item of config?.status_items ?? []) {
      if (typeof item === "string") {
        ids.add(item);
        continue;
      }
      ids.add(item.entity);
      for (const c of item.visibility ?? []) ids.add(conditionEntity(c) as string);
    }
    return [...ids];
  }

  connectedCallback(): void {
    window.addEventListener(PAUSE_EVENT, this._onPaused);
    this._setPaused(readPaused());
    this._subscribe();
    this._syncTick();
  }

  disconnectedCallback(): void {
    window.removeEventListener(PAUSE_EVENT, this._onPaused);
    this._unsubscribe();
    this._syncTick();
  }

  /** The entity whose state heads the header: the detected heat pump state,
   * or `status_entity` from older configurations. */
  private _headEntity(): string | undefined {
    const config = this._config;
    if (!config || config.status) return undefined;
    if (config.status_entity) return config.status_entity;
    return config.show_state === false ? undefined : this._entities.state;
  }

  private _setPaused(paused: boolean): void {
    this._paused = paused;
    if (!this._root) return;
    this._root.classList.toggle("still", paused || this._config?.animations === false);
    for (const btn of this._root.querySelectorAll<HTMLElement>(".ipause")) {
      btn.setAttribute("aria-pressed", String(paused));
      btn.setAttribute("aria-label", paused ? L.play : L.pause);
      btn.querySelector("ha-icon")?.setAttribute("icon", paused ? "mdi:play" : "mdi:pause");
    }
  }

  // The "seit …" text of an entity status ages without a state change, so it
  // is refreshed every minute while the card shows one.
  private _syncTick(): void {
    const needed = this.isConnected && !!this._headEntity();
    if (needed && !this._tick) {
      this._tick = setInterval(() => this._entityStatus(), 60000);
    } else if (!needed && this._tick) {
      clearInterval(this._tick);
      this._tick = undefined;
    }
  }

  // Finds the entities on the first hass, after a registry change, and while
  // keys are still open: at startup the integration's entities can be
  // unavailable and carry no feature attribute yet. An entity once found is
  // kept until the registry or the configuration changes. Returns whether the
  // mapping changed.
  private _resolve(): boolean {
    const hass = this._hass;
    const config = this._config;
    if (!hass || !config) return false;
    const fresh = hass.entities !== this._registry;
    if (!fresh && this._settled) return false;
    this._registry = hass.entities;
    const found = resolveEntities(hass, config, this.cls.slots);
    const entities = fresh ? found : { ...this._entities, ...found };
    this._settled = this.cls.slots.every((slot) => isSettled(slot, entities, config));
    if (JSON.stringify(entities) === JSON.stringify(this._entities)) return false;
    this._entities = entities;
    return true;
  }

  getGridOptions() {
    return { columns: "full", min_columns: 6 };
  }

  // Alternative to `status`: the translated state of the header entity (see
  // _headEntity) is the big word, with "seit …" from its last change.
  // The line below lists the `status_items` entities that currently say
  // something: states that are not off and numbers above zero, as name and
  // state (or the state alone with `name: false`), and only while their
  // `visibility` conditions hold. Every part opens its more-info dialog; no
  // text is made up.
  private _entityStatus(): void {
    const id = this._headEntity();
    if (!id || !this._hass) return;
    const s = this._hass.states[id];
    const st: Status =
      !s || s.state === "unavailable" || s.state === "unknown"
        ? { state: L.noData, detail: "", items: [], stateId: id }
        : {
            state: this._hass.formatEntityState(s),
            detail: this._since(s.last_changed),
            items: this._statusItems(),
            stateId: id,
          };
    const key = JSON.stringify(st);
    if (key === this._statusKey) return;
    this._statusKey = key;
    this._status = st;
    this._renderStatus();
  }

  private _statusItems(): { id: string; text: string }[] {
    const hass = this._hass as Hass;
    const items = [];
    for (const item of this._config?.status_items || []) {
      const cfg = typeof item === "string" ? undefined : item;
      const id = typeof item === "string" ? item : item?.entity;
      const s = id ? hass.states[id] : undefined;
      if (!id || !s || ["off", "unavailable", "unknown", "none", ""].includes(s.state)) continue;
      if (!this._visible(cfg?.visibility)) continue;
      if (Number(s.state) <= 0) continue;
      // `name: false` shows the state alone.
      const name = cfg?.name === false ? "" : cfg?.name || this._entityName(s);
      items.push({ id, text: [name, hass.formatEntityState(s)].filter(Boolean).join(" ") });
    }
    return items;
  }

  // Item visibility in the shape of HA's visibility conditions; only the
  // `state` condition (with `state` or `state_not`, a value or a list), as
  // checked in setConfig.
  private _visible(conditions: StateCondition[] | undefined): boolean {
    return (conditions || []).every((c) => {
      const cur = this._hass?.states[conditionEntity(c) as string]?.state as string;
      const list = (v: string | string[]) => ([] as string[]).concat(v);
      if (c.state !== undefined && !list(c.state).includes(cur)) return false;
      if (c.state_not !== undefined && list(c.state_not).includes(cur)) return false;
      return true;
    });
  }

  // Entity name without the device name in front, as HA shows it on cards.
  // Before HA had formatEntityName, the device name was cut off here.
  private _entityName(s: HassEntity): string {
    const name = this._hass?.formatEntityName?.(s, { type: "entity" });
    if (name) return name;
    const full = s.attributes.friendly_name || s.entity_id;
    const ent = this._hass?.entities?.[s.entity_id];
    const dev = ent?.device_id && this._hass?.devices?.[ent.device_id];
    const prefix = dev && (dev.name_by_user || dev.name);
    return prefix && full.startsWith(`${prefix} `) ? full.slice(prefix.length + 1) : full;
  }

  private _since(iso: string): string {
    const m = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
    if (m < 1) return L.justNow;
    if (m < 60) return fill(L.minutes, { n: m });
    if (m < 1440) return fill(L.hours, { n: Math.round(m / 60) });
    const d = Math.round(m / 1440);
    return d === 1 ? L.day : fill(L.days, { n: d });
  }

  // Optional status header: `status` is a template that HA renders, like the
  // markdown card does. It returns an object with state (big word), detail
  // (small text after it), and info (line below); any other result is shown
  // as the state.
  private _subscribe(): void {
    const template = this._config?.status;
    if (!template || this._unsub || !this.isConnected || !this._hass?.connection) return;
    this._unsub = this._hass.connection
      .subscribeMessage<StatusMessage>((msg) => this._onStatus(msg), {
        type: "render_template",
        template,
        strict: true,
        report_errors: true,
      })
      .catch((err) => {
        this._unsub = undefined;
        this._onStatus({ error: err?.message || String(err), level: "ERROR" });
        return undefined;
      });
  }

  private _unsubscribe(): void {
    const unsub = this._unsub;
    this._unsub = undefined;
    unsub?.then((fn) => fn?.()).catch(() => {});
  }

  private _onStatus(msg: StatusMessage): void {
    if (msg.error) {
      console.warn("vi-climate-cards status:", msg.error);
      if (msg.level !== "ERROR") return;
      this._status = { info: msg.error, err: true };
    } else {
      let r = msg.result;
      if (typeof r === "string") {
        try {
          r = JSON.parse(r);
        } catch {
          /* plain text */
        }
      }
      this._status = r && typeof r === "object" ? (r as Status) : { state: r == null ? "" : String(r) };
    }
    this._renderStatus();
  }

  private _renderStatus(): void {
    if (!this._root) return;
    const st = this._status || {};
    for (const hd of this._root.querySelectorAll<HTMLElement>(".hd")) {
      const head = hd.querySelector(".st") as HTMLElement;
      head.textContent = st.state ?? "";
      head.classList.toggle("lnk", !!st.stateId);
      head.dataset.id = st.stateId || "";
      if (st.stateId) {
        head.role = "button";
        head.tabIndex = 0;
      } else {
        head.removeAttribute("role");
        head.removeAttribute("tabindex");
      }
      (hd.querySelector(".dt") as HTMLElement).textContent = st.detail ?? "";
      const info = hd.querySelector(".in") as HTMLElement;
      info.classList.toggle("err", !!st.err);
      if (st.items) {
        info.replaceChildren(
          ...st.items.flatMap((it, i) => {
            const el = document.createElement("span");
            el.className = "lnk";
            el.dataset.id = it.id;
            el.role = "button";
            el.tabIndex = 0;
            el.textContent = it.text;
            return i ? [document.createTextNode(" · "), el] : [el];
          }),
        );
      } else {
        info.textContent = st.info ?? "";
      }
    }
  }

  private _build(): void {
    const config = this._config as CardConfig;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const shadow = this.shadowRoot as ShadowRoot;
    // All layouts are rendered; a container query on the card width shows one.
    // The status header sits in each layout so it lines up with its scene.
    // A card with an explanation gets an info button in its header row; the
    // header is then always there, empty if there is no status.
    const info = this.cls.info && config.info !== false ? this.cls.info : null;
    // The pause button sits left of the info button; it is hidden when the
    // card or the system does not animate.
    const motion = config.animations !== false;
    const ibtn =
      (motion
        ? `<div class="ibtn ipause" role="button" tabindex="0" aria-pressed="false" aria-label="${L.pause}"><ha-icon icon="mdi:pause"></ha-icon></div>`
        : "") +
      (info
        ? `<div class="ibtn iopen" role="button" tabindex="0" aria-label="${info.title}"><ha-icon icon="mdi:information-outline"></ha-icon></div>`
        : "");
    const btns = (motion ? 1 : 0) + (info ? 1 : 0);
    const hd =
      config.status || this._headEntity() || btns
        ? `<div class="hd"><div class="l1"><span class="st"></span><span class="dt"></span></div><div class="in"></div></div>`
        : "";
    const layouts = this.cls.layouts
      .map((l) => {
        const badges = l.badges
          .map(
            (b) =>
              `<div class="o bd ${b.c}${b.i ? "" : " ni"}" data-k="${b.k}" style="left:${b.x}%;top:${b.y}%">` +
              (b.i ? `<ha-icon icon="${b.i}"></ha-icon>` : "") +
              `<span class="info"><span class="n">${b.n}</span>` +
              `<span class="s">—</span></span></div>`,
          )
          .join("");
        const values = (l.values || [])
          .map(
            (v) =>
              `<div class="o vv ${v.c}" data-k="${v.k}" style="left:${v.x}%;top:${v.y}%">` +
              `<span class="n">${v.n}</span><span class="s">—</span></div>`,
          )
          .join("");
        return (
          `<div class="lay ${l.c}${btns ? ` btns${btns}` : ""}">${ibtn}${hd}<div class="sc">${l.svg}` +
          `<div class="ov">${l.text}${badges}${values}</div></div></div>`
        );
      })
      .join("");
    shadow.innerHTML = `<style>${this.cls.css}</style><ha-card><div class="wrap">${this._missingNote()}${layouts}${this._infoDialog(info)}</div></ha-card>`;
    const root = shadow.querySelector(".wrap") as HTMLElement;
    this._root = root;
    this._pipes = [...root.querySelectorAll<SVGElement>(".lay .pipe, .lay .fl")];
    this._ptrs = [...root.querySelectorAll<SVGElement>(".p1")];
    this._fans = [...root.querySelectorAll<SVGElement>(".fanbox")];
    this._pumps = [...root.querySelectorAll<SVGElement>(".pump")];
    this._heaters = [...root.querySelectorAll<SVGElement>(".heater")];
    this._badgeEls = [...root.querySelectorAll<HTMLElement>(".bd, .vv")].map((el) => ({
      el,
      key: el.dataset.k as string,
      val: el.querySelector(".s") as HTMLElement,
      big: el.classList.contains("big"),
    }));
    // Drawn devices are tappable only when their entity is configured.
    for (const el of root.querySelectorAll<SVGElement>(".tap")) {
      if (!this._entities[el.dataset.k as string]) el.classList.remove("tap");
    }
    // The drawing is a group of controls, not one picture, so screen readers
    // reach the parts inside it.
    for (const svg of root.querySelectorAll(".lay > .sc > svg")) svg.setAttribute("role", "group");
    // Badges, small readings, and tappable devices are buttons: tap, hold,
    // Enter, and Space run the configured action with the part's entity.
    this._buttons = [...root.querySelectorAll<HTMLElement | SVGElement>(".bd, .vv.sm, .tap")];
    for (const el of this._buttons) {
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      const open = () => this._moreInfo(el.dataset.k as string);
      el.addEventListener("click", open);
      el.addEventListener("keydown", (ev) => {
        const key = (ev as KeyboardEvent).key;
        if (key !== "Enter" && key !== " ") return;
        ev.preventDefault();
        open();
      });
    }
    for (const el of root.querySelectorAll<HTMLElement>(".ipause")) {
      const toggle = () => writePaused(!this._paused);
      el.addEventListener("click", toggle);
      el.addEventListener("keydown", (ev) => {
        if (ev.key !== "Enter" && ev.key !== " ") return;
        ev.preventDefault();
        toggle();
      });
    }
    // Header parts of an entity status open the entity they show.
    for (const hd of root.querySelectorAll(".hd")) {
      const open = (ev: Event) => {
        const id = (ev.target as Element).closest?.<HTMLElement>(".lnk")?.dataset.id;
        if (id) this._fire("hass-more-info", { entityId: id });
        return !!id;
      };
      hd.addEventListener("click", open);
      hd.addEventListener("keydown", (ev) => {
        const key = (ev as KeyboardEvent).key;
        if ((key === "Enter" || key === " ") && open(ev)) ev.preventDefault();
      });
    }
    // The info button opens the explanation; Esc, the close button, and a tap
    // beside the dialog close it.
    this._dlg = root.querySelector<HTMLDialogElement>("dialog.inf");
    for (const el of root.querySelectorAll<HTMLElement>(".iopen")) {
      el.addEventListener("click", () => this._openInfo());
      el.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          this._openInfo();
        }
      });
    }
    const dlg = this._dlg;
    dlg?.querySelector(".iclose")?.addEventListener("click", () => dlg.close());
    dlg?.addEventListener("click", (ev) => {
      if (ev.target === dlg) dlg.close();
    });
    this._setPaused(this._paused);
    this._renderStatus();
  }

  // Names the parts the card cannot draw without, once it has looked for them.
  private _missingNote(): string {
    if (!this._hass) return "";
    const missing = this.cls.slots.filter((s) => s.required && !this._entities[s.key]).map((s) => s.label);
    if (!missing.length) return "";
    return `<div class="miss">${fill(L.missing, { parts: missing.join(", ") })}</div>`;
  }

  // Explanation dialog: a native <dialog> in the top layer, so no ancestor
  // (container queries, dashboard layout) can clip it. It sits inside .wrap
  // and inherits the light or dark device tokens.
  private _infoDialog(info: InfoContent | null): string {
    if (!info) return "";
    const steps = info.steps
      .map(
        (st, i) =>
          `<div class="step" data-i="${i}">${st.svg}<div><h3>${i + 1}. ${st.t}</h3><p>${st.p}</p>` +
          `<div class="now"></div></div></div>`,
      )
      .join("");
    const tips = info.tips.map((t) => `<div><h4>${t.t}</h4><p>${t.p}</p></div>`).join("");
    // The legend uses the card's own line patterns, so it moves like the pipes.
    // A pipe without color classes is neutral, so only the pattern differs.
    const legend = info.legend
      .map(
        ([pc, fc, t]) =>
          `<span><svg viewBox="0 0 56 8" aria-hidden="true"><path class="pipe ${pc}" d="M4 4 H52"/>` +
          `<path class="fl on ${fc}" d="M4 4 H52"/></svg>${t}</span>`,
      )
      .join("");
    return (
      `<dialog class="inf" aria-label="${info.title}"><div class="ih">` +
      `<div class="ibtn iclose" role="button" tabindex="0" aria-label="${L.close}"><ha-icon icon="mdi:close"></ha-icon></div>` +
      `<h2>${info.title}</h2></div><div class="ibd" tabindex="-1"><p>${info.intro}</p><div class="ist"></div>${steps}` +
      `<div class="leg"><h4>${L.lines}</h4><div>${legend}</div></div>` +
      `<div class="tips">${tips}</div></div></dialog>`
    );
  }

  _openInfo(): void {
    if (!this._dlg) return;
    this._renderInfo();
    this._dlg.showModal();
    // Focus the text, not the close button, so no focus ring shows on open.
    (this._dlg.querySelector(".ibd") as HTMLElement).focus();
  }

  // Live lines only while the circuit runs (see `_infoLive`): at rest the
  // temperatures even out and explain nothing.
  private _renderInfo(): void {
    const info = this.cls.info;
    const hass = this._hass;
    if (!this._dlg || !hass || !info) return;
    const defrost = this._state("defrost")?.state === "on";
    const live = this._infoLive();
    (this._dlg.querySelector(".ist") as HTMLElement).textContent = defrost ? info.defrost : live ? info.run : info.off;
    for (const el of this._dlg.querySelectorAll<HTMLElement>(".step")) {
      const step = info.steps[Number(el.dataset.i)];
      let missing = false;
      const text = step.now.replace(/\{(\w+)\}/g, (_m, k: string) => {
        const s = this._state(k);
        if (!s || s.state === "unavailable" || s.state === "unknown") missing = true;
        return s ? hass.formatEntityState(s) : "";
      });
      const show = live || step.always;
      (el.querySelector(".now") as HTMLElement).textContent = show && !missing ? fill(L.now, { text }) : "";
      el.querySelector("svg")?.classList.toggle("spin", live);
    }
  }

  private _moreInfo(key: string): void {
    const entityId = this._entities[key];
    if (entityId) this._fire("hass-more-info", { entityId });
  }

  private _fire(type: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  private _label(key: string): string {
    return this.cls.slots.find((s) => s.key === key)?.label ?? key;
  }

  protected _state(key: string): HassEntity | undefined {
    const id = this._entities[key];
    return id ? this._hass?.states[id] : undefined;
  }

  protected _num(key: string): number {
    const s = this._state(key);
    const v = s ? parseFloat(s.state) : Number.NaN;
    return Number.isFinite(v) ? v : 0;
  }

  // Big readings (tank content, device value) as whole numbers: "51 °C".
  // HA's parts give the unit and its spacing; only the number is rounded.
  private _whole(s: HassEntity): string {
    const hass = this._hass as Hass;
    const v = parseFloat(s.state);
    if (!Number.isFinite(v)) return hass.formatEntityState(s);
    const lang = hass.locale?.language || hass.language || "de";
    const whole = Math.round(v).toLocaleString(lang);
    const parts = hass.formatEntityStateToParts?.(s);
    if (parts?.some((p) => p.type === "value")) {
      return parts.map((p) => (p.type === "value" ? whole : p.value)).join("");
    }
    const unit = s.attributes?.unit_of_measurement;
    return whole + (unit ? ` ${unit}` : "");
  }

  protected _fanDur(speed: number): string {
    return `${(2.6 - (Math.min(Math.max(speed, 0), 100) / 100) * 1.8).toFixed(2)}s`;
  }

  private _update(): void {
    const hass = this._hass;
    const config = this._config;
    const root = this._root;
    if (!hass || !root || !config) return;

    for (const b of this._badgeEls) {
      const s = this._state(b.key);
      const na = !s || s.state === "unavailable" || s.state === "unknown";
      b.val.textContent = !s ? "—" : b.big && !na ? this._whole(s) : hass.formatEntityState(s);
      b.el.classList.toggle("na", na);
      b.el.style.display = this._entities[b.key] ? "" : "none";
    }
    // Screen readers hear the part's full name and its state; the drawing
    // shows a short name next to its pipe.
    for (const el of this._buttons) {
      const k = el.dataset.k as string;
      const s = this._state(k);
      const label = this._label(k);
      el.setAttribute("aria-label", s ? `${label}: ${hass.formatEntityState(s)}` : label);
    }
    // A heater coil turns warm while it runs (binary on, or a heating rod stage).
    for (const h of this._heaters) {
      const s = this._state(h.dataset.k as string)?.state;
      h.classList.toggle("on", !!s && !["off", "unavailable", "unknown"].includes(s));
    }

    this._apply();
    if (this._dlg?.open) this._renderInfo();
    root.classList.toggle("dark", !!hass.themes?.darkMode);
  }
}
