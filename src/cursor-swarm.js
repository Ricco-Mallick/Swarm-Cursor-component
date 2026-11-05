/*!
 * cursor-swarm — a crowd of multiplayer cursors builds your UI, live.
 * MIT License. https://github.com/Ricco-Mallick/Swarm-Cursor-component
 */

const TAG = 'cursor-swarm';

const DEFAULT_NAMES = ['Ava', 'Kai', 'Mia', 'Leo', 'Zoe', 'Ivy', 'Max', 'Noa', 'Eli', 'Rae', 'Sam', 'Uma'];
const DEFAULT_COLORS = ['#7C5CFF', '#FF4F8B', '#14B8A6', '#F59E0B', '#3B82F6', '#F97316', '#84CC16', '#D946EF'];

const MEDIA_TAGS = new Set(['IMG', 'SVG', 'VIDEO', 'CANVAS', 'PICTURE', 'IFRAME', 'OBJECT', 'EMBED']);
const CONTROL_TAGS = new Set(['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'PROGRESS', 'METER']);
const TEXT_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'BLOCKQUOTE', 'PRE', 'FIGCAPTION', 'LABEL', 'DT', 'DD', 'TD', 'TH', 'CAPTION', 'SUMMARY', 'LEGEND']);
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'LINK', 'META', 'BR', 'WBR', 'SLOT']);
// A text element containing any of these is treated as a container, not typed as one block.
const BLOCK_SELECTOR = 'address,article,aside,blockquote,details,dialog,dd,div,dl,dt,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,hr,li,main,nav,ol,p,pre,section,table,ul,video,canvas,iframe';

const CANCEL = Symbol('cancel');

const ICONS = {
  arrow: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M3.5 2.5 L3.5 19.2 L8.1 15.1 L11.2 21.8 L14.3 20.4 L11.3 13.8 L17.6 13.8 Z" fill="currentColor" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  cross: '<svg viewBox="0 0 24 24" width="22" height="22"><g stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M12 3v7M12 14v7M3 12h7M14 12h7"/></g><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v7M12 14v7M3 12h7M14 12h7"/></g></svg>',
  text: '<svg viewBox="0 0 24 24" width="22" height="22"><g fill="none" stroke-linecap="round"><path d="M8.5 3.5c2 0 3.5.6 3.5 2.5v12c0 1.9-1.5 2.5-3.5 2.5M15.5 3.5c-2 0-3.5.6-3.5 2.5v12c0 1.9 1.5 2.5 3.5 2.5M9.5 12h5" stroke="#fff" stroke-width="4"/><path d="M8.5 3.5c2 0 3.5.6 3.5 2.5v12c0 1.9-1.5 2.5-3.5 2.5M15.5 3.5c-2 0-3.5.6-3.5 2.5v12c0 1.9 1.5 2.5 3.5 2.5M9.5 12h5" stroke="currentColor" stroke-width="1.8"/></g></svg>',
};
// Hotspot offsets so the logical point sits at the tip / centre of each icon.
const HOTSPOT = { arrow: [3.5, 2.5], cross: [11, 11], text: [11, 11] };

const STYLE = `
:host { display: block; position: relative; }
:host([hidden]) { display: none; }
.layer { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 2147483000; contain: layout style; }
.agent { position: absolute; left: 0; top: 0; will-change: transform; transition: opacity .35s ease; }
.agent .icon { position: absolute; left: 0; top: 0; line-height: 0; transform-origin: 4px 3px; transition: transform .12s ease; filter: drop-shadow(0 1px 1.5px rgba(0,0,0,.28)); }
.agent .icon > span { display: none; }
.agent[data-mode="arrow"] .i-arrow, .agent[data-mode="cross"] .i-cross, .agent[data-mode="text"] .i-text { display: block; }
.agent.pressed .icon { transform: scale(.82); }
.agent .tag { position: absolute; left: 18px; top: 20px; padding: 2px 7px 3px; border-radius: 6px 9px 9px 9px; font: 600 11px/1.35 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; color: #fff; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,.18); letter-spacing: .01em; }
:host([hide-labels]) .tag { display: none; }
.sel { position: absolute; left: 0; top: 0; border: 1.5px solid currentColor; border-radius: 2px; box-sizing: border-box; transition: opacity .3s ease; }
.sel::before { content: ""; position: absolute; inset: 0; background: currentColor; opacity: .07; }
.sel.media::before { opacity: .14; background: repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 9px); }
.sel .h { position: absolute; width: 7px; height: 7px; background: #fff; border: 1.5px solid currentColor; box-sizing: border-box; opacity: 0; transition: opacity .15s ease; }
.sel.done .h { opacity: 1; }
.sel .h:nth-child(1) { left: -4px; top: -4px; } .sel .h:nth-child(2) { right: -4px; top: -4px; }
.sel .h:nth-child(3) { left: -4px; bottom: -4px; } .sel .h:nth-child(4) { right: -4px; bottom: -4px; }
.badge { position: absolute; left: 50%; top: 100%; margin-top: 6px; transform: translateX(-50%); padding: 1px 6px 2px; border-radius: 4px; background: currentColor; white-space: nowrap; font: 600 10px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; }
.badge > b { color: #fff; font-weight: inherit; }
.caret { position: absolute; left: 0; top: 0; width: 2px; border-radius: 1px; background: currentColor; }
.caret.blink { animation: blink .9s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
.fade { opacity: 0 !important; }
`;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const easeMove = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) * 0.55 + (1 - Math.pow(1 - t, 3)) * 0.45;
const easeDrag = (t) => 1 - Math.pow(1 - t, 2.2);
const listAttr = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : null);
const isCancel = (e) => e === CANCEL;

/* ---------------------------------------------------------------- sound */

class Sound {
  constructor() { this.ctx = null; this.volume = 0.4; this.lastKey = 0; }
  ensure() {
    if (this.ctx) return this.ctx;
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    const len = Math.floor(this.ctx.sampleRate * 0.25);
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return this.ctx;
  }
  setVolume(v) { this.volume = v; if (this.master) this.master.gain.value = v; }
  ready() { return this.ctx && this.ctx.state === 'running'; }
  burst(freq, q, dur, gain, pan = 0) {
    if (!this.ready()) return;
    const c = this.ctx, t = c.currentTime;
    const src = c.createBufferSource(); src.buffer = this.noise;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = g;
    if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); node = p; }
    src.connect(bp).connect(g); node.connect(this.master);
    src.start(t, Math.random() * 0.2); src.stop(t + dur + 0.02);
  }
  tone(freq, dur, gain, type = 'sine', pan = 0, glide = 1) {
    if (!this.ready()) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * glide, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = g;
    if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); node = p; }
    o.connect(g); node.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  press(pan) { this.burst(3200, 1.2, 0.035, 0.5, pan); this.tone(180, 0.05, 0.12, 'triangle', pan, 0.6); }
  release(pan) { this.burst(4200, 1.5, 0.025, 0.3, pan); }
  key(pan) {
    const now = performance.now();
    if (now - this.lastKey < 28) return; // keep dense typing from turning into noise
    this.lastKey = now;
    this.burst(rand(2400, 3600), 2, 0.03, 0.32, pan);
  }
  pop(pan, size = 0.5) {
    const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const f = notes[Math.floor(clamp(1 - size, 0, 0.999) * notes.length)];
    this.tone(f, 0.35, 0.07, 'sine', pan);
  }
  chord() { [392, 493.88, 587.33, 783.99].forEach((f, i) => setTimeout(() => this.tone(f, 1.1, 0.05, 'sine', (i - 1.5) / 3), i * 60)); }
}

/* ------------------------------------------------------------ component */

const Base = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class CursorSwarm extends Base {
  static get observedAttributes() { return ['cursors', 'speed', 'volume', 'names', 'colors']; }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${STYLE}</style><slot></slot><div class="layer" part="layer"></div>`;
    this._layer = root.querySelector('.layer');
    this._tasks = [];
    this._agents = [];
    this._anims = new Set();
    this._run = null;
    this._raf = 0;
    this._state = 'idle'; // idle | armed | building | finale | done
    this._pointer = null;
    this._sound = new Sound();
    this._frame = this._frame.bind(this);
    this._onPointer = (e) => { this._pointer = { x: e.clientX, y: e.clientY }; };
    this._onPointerLeave = () => { this._pointer = null; };
    this._unlock = () => {
      if (!this.hasAttribute('sound')) return;
      const ctx = this._sound.ensure();
      if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
    };
  }

  /* --- options ------------------------------------------------------ */

  get cursors() { return clamp(parseInt(this.getAttribute('cursors'), 10) || 5, 1, 24); }
  set cursors(v) { this.setAttribute('cursors', String(v)); }
  get speed() { const s = parseFloat(this.getAttribute('speed')); return clamp(Number.isFinite(s) && s > 0 ? s : 1, 0.1, 10); }
  set speed(v) { this.setAttribute('speed', String(v)); }
  get trigger() { const t = this.getAttribute('trigger'); return t === 'load' || t === 'manual' ? t : 'visible'; }
  set trigger(v) { this.setAttribute('trigger', v); }
  get scope() { return this.getAttribute('scope') === 'all' ? 'all' : 'viewport'; }
  set scope(v) { this.setAttribute('scope', v); }
  get linger() {
    const v = this.getAttribute('linger');
    if (v === 'infinite') return Infinity;
    const n = parseFloat(v);
    return Number.isFinite(n) && n >= 0 ? n : 2500;
  }
  set linger(v) { this.setAttribute('linger', v === Infinity ? 'infinite' : String(v)); }
  get sound() { return this.hasAttribute('sound'); }
  set sound(v) { this.toggleAttribute('sound', v !== false && v != null); }
  get volume() { const v = parseFloat(this.getAttribute('volume')); return clamp(Number.isFinite(v) ? v : 0.4, 0, 1); }
  set volume(v) { this.setAttribute('volume', String(v)); }
  get hideLabels() { return this.hasAttribute('hide-labels'); }
  set hideLabels(v) { this.toggleAttribute('hide-labels', v !== false && v != null); }
  get names() { return listAttr(this.getAttribute('names')) || DEFAULT_NAMES; }
  set names(v) { this.setAttribute('names', Array.isArray(v) ? v.join(',') : String(v)); }
  get colors() { return listAttr(this.getAttribute('colors')) || DEFAULT_COLORS; }
  set colors(v) { this.setAttribute('colors', Array.isArray(v) ? v.join(',') : String(v)); }
  /** 'idle' | 'armed' | 'building' | 'finale' | 'done' */
  get state() { return this._state; }

  attributeChangedCallback(name) {
    if (name === 'volume') this._sound.setVolume(this.volume);
    if ((name === 'names' || name === 'colors') && this._agents.length) this._agents.forEach((a, i) => this._styleAgent(a, i));
  }

  /* --- lifecycle ---------------------------------------------------- */

  connectedCallback() {
    this._sound.setVolume(this.volume);
    window.addEventListener('pointermove', this._onPointer, { passive: true });
    document.addEventListener('pointerleave', this._onPointerLeave);
    window.addEventListener('pointerdown', this._unlock, true);
    window.addEventListener('keydown', this._unlock, true);
    if (this._state !== 'idle') return;
    // Children may not be parsed yet when the element upgrades during parsing.
    const boot = () => requestAnimationFrame(() => { if (this.isConnected && this._state === 'idle') this._arm(); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
  }

  disconnectedCallback() {
    window.removeEventListener('pointermove', this._onPointer);
    document.removeEventListener('pointerleave', this._onPointerLeave);
    window.removeEventListener('pointerdown', this._unlock, true);
    window.removeEventListener('keydown', this._unlock, true);
    this._io?.disconnect();
    this._cancel();
    this._revealAll();
    this._state = 'idle';
  }

  _arm() {
    if (this._reducedMotion()) { this._state = 'done'; return; }
    this._scan();
    this._tasks.forEach((t) => this._hide(t));
    this._state = 'armed';
    if (this.trigger === 'load') this.play();
    else if (this.trigger === 'visible') {
      this._io?.disconnect();
      this._io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { this._io.disconnect(); this.play(); }
      }, { rootMargin: '0px 0px -12% 0px' });
      this._io.observe(this);
    }
  }

  _reducedMotion() {
    return !this.hasAttribute('ignore-reduced-motion') && globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  /* --- public API --------------------------------------------------- */

  /** Start building. Content is hidden first if it isn't already. */
  play() {
    if (this._state === 'building' || this._state === 'finale') return;
    if (this._state !== 'armed') {
      if (this._reducedMotion()) return;
      this._scan();
      this._tasks.forEach((t) => this._hide(t));
    }
    this._io?.disconnect();
    this._start();
  }

  /** Hide everything and build it again. */
  replay() {
    this._cancel();
    this._revealAll();
    this._state = 'idle';
    this.play();
  }

  /** Skip to the end: reveal everything immediately and send the cursors away. */
  finish() {
    if (this._state === 'idle' || this._state === 'done') return;
    const wasBuilding = this._state === 'building' || this._state === 'armed';
    this._cancel();
    this._revealAll();
    this._clearLayer();
    this._state = 'done';
    if (wasBuilding) this._emit('swarmcomplete');
    this._emit('swarmend');
  }

  /** Reveal content, remove cursors and return to the initial idle state (no auto-start). */
  reset() {
    this._io?.disconnect();
    this._cancel();
    this._revealAll();
    this._clearLayer();
    this._state = 'idle';
  }

  /* --- scanning ----------------------------------------------------- */

  _scan() {
    this._revealAll();
    this._tasks = [];
    const max = parseInt(this.getAttribute('max-tasks'), 10) || 800;
    const walk = (el, parent) => {
      for (const child of el.children) {
        if (this._tasks.length >= max) return;
        if (SKIP_TAGS.has(child.tagName) || child.hasAttribute('data-swarm-ignore')) continue;
        const cs = getComputedStyle(child);
        if (cs.display === 'none') continue;
        const kind = this._classify(child, cs);
        if (!kind) { walk(child, parent); continue; }
        const task = { el: child, kind, parent, state: 'pending', saved: null };
        this._tasks.push(task);
        if (kind === 'box') walk(child, task);
      }
    };
    walk(this, null);
  }

  _classify(el, cs) {
    const forced = el.getAttribute('data-swarm');
    if (forced === 'skip') return null;
    if (forced === 'text' || forced === 'media' || forced === 'box' || forced === 'block') return forced;
    const tag = el.tagName.toUpperCase();
    if (MEDIA_TAGS.has(tag) || el.shadowRoot) return 'media';
    if (CONTROL_TAGS.has(tag) || tag === 'HR') return 'block';
    if (cs.display === 'contents') return null;
    const styled = isStyled(cs);
    const hasBlock = !!el.querySelector(BLOCK_SELECTOR);
    const textish = TEXT_TAGS.has(tag) || hasDirectText(el);
    if (!hasBlock && textish) return styled ? 'block' : 'text';
    if (styled && (el.offsetWidth >= 6 || el.offsetHeight >= 6)) return el.children.length ? 'box' : 'block';
    return null;
  }

  /* --- hiding / revealing ------------------------------------------- */

  _hide(task) {
    const s = task.el.style;
    if (!task.saved) {
      task.saved = {
        visibility: [s.getPropertyValue('visibility'), s.getPropertyPriority('visibility')],
        clip: [s.getPropertyValue('clip-path'), s.getPropertyPriority('clip-path')],
        transition: [s.getPropertyValue('transition'), s.getPropertyPriority('transition')],
      };
    }
    s.setProperty('visibility', 'hidden', 'important');
    task.state = 'pending';
  }

  _show(task, clip) {
    const s = task.el.style;
    s.setProperty('transition', 'none', 'important');
    s.setProperty('visibility', 'visible', 'important');
    s.setProperty('clip-path', clip, 'important');
  }

  _restore(task) {
    if (!task.saved) return;
    const s = task.el.style;
    const put = (prop, [v, p]) => (v ? s.setProperty(prop, v, p) : s.removeProperty(prop));
    put('visibility', task.saved.visibility);
    put('clip-path', task.saved.clip);
    // Restore transitions a frame later so the clip removal itself is not animated.
    const tr = task.saved.transition;
    task.saved = null;
    requestAnimationFrame(() => { if (!task.saved) put('transition', tr); });
  }

  _revealAll() {
    for (const t of this._tasks) { this._restore(t); t.state = 'done'; }
  }

  /* --- run loop ----------------------------------------------------- */

  _start() {
    this._clearLayer();
    const run = { cancelled: false };
    this._run = run;
    this._state = 'building';
    this._sound.setVolume(this.volume);
    if (this.sound) this._unlock();
    const n = Math.min(this.cursors, Math.max(1, this._tasks.length));
    this._agents = Array.from({ length: n }, (_, i) => this._makeAgent(i));
    this._emit('swarmstart');
    if (this.sound) this._sound.tone(330, 0.5, 0.05, 'sine', 0, 2);

    Promise.all(this._agents.map((a) => this._agentLoop(a, run)))
      .then(async () => {
        if (run.cancelled) return;
        this._revealAll(); // safety net for anything skipped
        this._emit('swarmcomplete');
        if (this.sound) this._sound.chord();
        this._state = 'finale';
        await this._finale(run);
        if (run.cancelled) return;
        this._clearLayer();
        this._state = 'done';
        this._emit('swarmend');
      })
      .catch((e) => { if (!isCancel(e)) console.error('[cursor-swarm]', e); });
  }

  _cancel() {
    if (this._run) this._run.cancelled = true;
    this._run = null;
    for (const a of this._anims) a.reject(CANCEL);
    this._anims.clear();
  }

  _emit(type) { this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true })); }

  async _agentLoop(agent, run) {
    try {
      await this._wait(agent.index * 110 + rand(0, 80), run);
      this._enter(agent);
      for (;;) {
        if (run.cancelled) return;
        const task = this._pick(agent);
        if (task) {
          task.state = 'active';
          try { await this._perform(agent, task, run); }
          finally { if (!run.cancelled) { this._restore(task); task.state = 'done'; } }
        } else if (this._tasks.every((t) => t.state === 'done')) {
          return;
        } else {
          await this._wander(agent, run);
        }
      }
    } catch (e) {
      if (!isCancel(e)) throw e;
    }
  }

  _ready(task, viewBottom) {
    if (task.state !== 'pending') return false;
    if (task.parent && task.parent.state !== 'done') return false;
    if (this.scope === 'all') return true;
    return task.el.getBoundingClientRect().top < viewBottom;
  }

  _pick(agent) {
    const vb = window.innerHeight * 0.92;
    const host = this._hostRect();
    const ready = [];
    for (const t of this._tasks) {
      if (this._ready(t, vb)) { ready.push(t); if (ready.length >= 4) break; }
    }
    if (!ready.length) return null;
    // Among the next few tasks in reading order, take the closest one so cursors spread out.
    let best = ready[0], bestD = Infinity;
    for (const t of ready) {
      const r = t.el.getBoundingClientRect();
      const d = Math.hypot(r.left - host.left - agent.x, r.top - host.top - agent.y) + ready.indexOf(t) * 120;
      if (d < bestD) { bestD = d; best = t; }
    }
    return best;
  }

  /** Speed multiplier: the user's speed plus a boost when a backlog builds up (fast scrolling). */
  _pace() {
    const now = performance.now();
    if (this._paceCache && now - this._paceCache.at < 250) return this._paceCache.value;
    let backlog = 0;
    const vb = window.innerHeight * 0.92;
    for (const t of this._tasks) { if (this._ready(t, vb) && ++backlog > 40) break; }
    const value = this.speed * (1 + Math.min(2, backlog / (this._agents.length * 4 + 4)));
    this._paceCache = { at: now, value };
    return value;
  }

  /* --- agents ------------------------------------------------------- */

  _makeAgent(index) {
    const el = document.createElement('div');
    el.className = 'agent';
    el.dataset.mode = 'arrow';
    el.innerHTML = `<div class="icon"><span class="i-arrow">${ICONS.arrow}</span><span class="i-cross">${ICONS.cross}</span><span class="i-text">${ICONS.text}</span></div><div class="tag"></div>`;
    el.style.opacity = '0';
    this._layer.appendChild(el);
    const agent = { index, el, x: -100, y: -100, vx: 0, vy: 0, mode: 'arrow', color: '#000' };
    this._styleAgent(agent, index);
    this._place(agent);
    return agent;
  }

  _styleAgent(agent, i) {
    const colors = this.colors, names = this.names;
    agent.color = colors[i % colors.length];
    agent.el.style.color = agent.color;
    const tag = agent.el.querySelector('.tag');
    tag.style.background = agent.color;
    tag.textContent = names[i % names.length];
  }

  _setMode(agent, mode) { agent.mode = mode; agent.el.dataset.mode = mode; }

  _place(agent) {
    const [hx, hy] = HOTSPOT[agent.mode];
    agent.el.style.transform = `translate3d(${(agent.x - hx).toFixed(1)}px, ${(agent.y - hy).toFixed(1)}px, 0)`;
  }

  _pan(agent) { const w = this.clientWidth || 1; return (agent.x / w) * 2 - 1; }

  /** Visible part of the host, in host coordinates. */
  _view() {
    const r = this._hostRect();
    const top = clamp(-r.top, 0, this.clientHeight);
    const bottom = clamp(window.innerHeight - r.top, 0, this.clientHeight);
    const left = clamp(-r.left, 0, this.clientWidth);
    const right = clamp(window.innerWidth - r.left, 0, this.clientWidth);
    return { top, bottom: Math.max(bottom, top + 1), left, right: Math.max(right, left + 1) };
  }

  _hostRect() {
    const r = this.getBoundingClientRect();
    return { left: r.left + this.clientLeft, top: r.top + this.clientTop };
  }

  _local(el) {
    const r = el.getBoundingClientRect(), h = this._hostRect();
    return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height };
  }

  _enter(agent) {
    const v = this._view();
    const side = agent.index % 3;
    if (side === 0) { agent.x = rand(v.left, v.right); agent.y = v.top - 30; }
    else if (side === 1) { agent.x = v.left - 30; agent.y = rand(v.top, v.bottom); }
    else { agent.x = v.right + 30; agent.y = rand(v.top, v.bottom); }
    this._place(agent);
    agent.el.style.opacity = '1';
  }

  /* --- animation primitives ----------------------------------------- */

  _animate(dur, fn, run) {
    if (run.cancelled) return Promise.reject(CANCEL);
    return new Promise((resolve, reject) => {
      this._anims.add({ start: performance.now(), dur: Math.max(1, dur), fn, resolve, reject });
      if (!this._raf) this._raf = requestAnimationFrame(this._frame);
    });
  }

  _wait(ms, run) { return this._animate(ms, null, run); }

  _frame(now) {
    this._raf = 0;
    for (const a of [...this._anims]) {
      const t = Math.min(1, (now - a.start) / a.dur);
      if (a.fn) a.fn(t, now);
      if (t >= 1) { this._anims.delete(a); a.resolve(); }
    }
    if (this._anims.size) this._raf = requestAnimationFrame(this._frame);
  }

  async _move(agent, x, y, run, opts = {}) {
    const x0 = agent.x, y0 = agent.y;
    const dist = Math.hypot(x - x0, y - y0);
    if (dist < 0.5) return;
    const dur = (opts.dur ?? clamp(200 + dist * 0.5, 240, 950)) / (opts.pace ?? this._pace());
    // Curved path: quadratic bezier with a control point pushed off the straight line.
    const bend = (opts.bend ?? rand(-0.18, 0.18)) * dist;
    const cx = (x0 + x) / 2 + (-(y - y0) / dist) * bend;
    const cy = (y0 + y) / 2 + ((x - x0) / dist) * bend;
    await this._animate(dur, (t) => {
      const e = (opts.ease || easeMove)(t), u = 1 - e;
      agent.x = u * u * x0 + 2 * u * e * cx + e * e * x;
      agent.y = u * u * y0 + 2 * u * e * cy + e * e * y;
      this._place(agent);
      opts.onStep?.(e);
    }, run);
  }

  async _press(agent, run) {
    agent.el.classList.add('pressed');
    if (this.sound) this._sound.press(this._pan(agent));
    await this._wait(70 / this.speed, run);
  }

  _release(agent) {
    agent.el.classList.remove('pressed');
    if (this.sound) this._sound.release(this._pan(agent));
  }

  async _wander(agent, run) {
    const v = this._view();
    const x = rand(v.left + 40, Math.max(v.left + 41, v.right - 40));
    const y = rand(lerp(v.top, v.bottom, 0.55), Math.max(v.top + 1, v.bottom - 30));
    this._setMode(agent, 'arrow');
    await this._move(agent, x, y, run, { dur: rand(700, 1100), pace: 1 });
    await this._wait(rand(120, 300), run);
  }

  /* --- tasks -------------------------------------------------------- */

  async _perform(agent, task, run) {
    const r = this._local(task.el);
    if (r.w < 1 || r.h < 1) return;
    if (task.kind === 'text') return this._type(agent, task, r, run);
    return this._draw(agent, task, r, run);
  }

  _makeSel(agent, kind) {
    const sel = document.createElement('div');
    sel.className = 'sel' + (kind === 'media' ? ' media' : '');
    sel.style.color = agent.color;
    sel.innerHTML = '<i class="h"></i><i class="h"></i><i class="h"></i><i class="h"></i><div class="badge"><b></b></div>';
    this._layer.insertBefore(sel, this._layer.firstChild);
    return sel;
  }

  async _draw(agent, task, r, run) {
    this._setMode(agent, 'arrow');
    await this._move(agent, r.x, r.y, run);
    this._setMode(agent, 'cross');
    this._place(agent);
    await this._press(agent, run);

    const sel = this._makeSel(agent, task.kind);
    const badge = sel.querySelector('b');
    const media = task.kind === 'media';
    if (!media) this._show(task, `inset(0 ${r.w}px ${r.h}px 0)`);
    const pace = this._pace();
    const dur = clamp(260 + (r.w + r.h) * 0.35, 320, 1100) / pace;
    try {
      await this._move(agent, r.x + r.w, r.y + r.h, run, {
        dur: dur * pace, pace, bend: rand(-0.06, 0.06), ease: easeDrag,
        onStep: () => {
          const w = Math.max(0, agent.x - r.x), h = Math.max(0, agent.y - r.y);
          sel.style.transform = `translate(${r.x}px, ${r.y}px)`;
          sel.style.width = `${w}px`;
          sel.style.height = `${h}px`;
          badge.textContent = `${Math.round(w)} × ${Math.round(h)}`;
          if (!media) task.el.style.setProperty('clip-path', `inset(0 ${Math.max(0, r.w - w)}px ${Math.max(0, r.h - h)}px 0)`, 'important');
        },
      });
      this._release(agent);
      sel.classList.add('done');
      if (this.sound) this._sound.pop(this._pan(agent), Math.min(1, (r.w * r.h) / 250000));

      if (media) {
        this._show(task, 'inset(0 0 100% 0)');
        await this._animate(420 / this.speed, (t) => {
          const e = 1 - Math.pow(1 - t, 3);
          task.el.style.setProperty('clip-path', `inset(0 0 ${(1 - e) * 100}% 0)`, 'important');
        }, run);
      } else {
        await this._wait(120 / this.speed, run);
      }
      this._setMode(agent, 'arrow');
      this._place(agent);
    } finally {
      sel.classList.add('fade');
      setTimeout(() => sel.remove(), 320);
    }
  }

  async _type(agent, task, r, run) {
    const lines = textLines(task.el, r, this._hostRect());
    if (!lines.length) return this._draw(agent, { ...task, kind: 'block' }, r, run);
    const first = lines[0];
    this._setMode(agent, 'arrow');
    await this._move(agent, r.x + first.x, r.y + first.y + first.h / 2, run);
    this._setMode(agent, 'text');
    this._place(agent);
    await this._press(agent, run);
    this._release(agent);

    const caret = document.createElement('div');
    caret.className = 'caret';
    caret.style.color = agent.color;
    this._layer.appendChild(caret);

    const fs = parseFloat(getComputedStyle(task.el).fontSize) || 16;
    const charW = fs * 0.52;
    const totalChars = lines.reduce((n, l) => n + l.w / charW, 0);
    // Short headings type char by char; long paragraphs speed up so nothing drags on.
    const budget = clamp(totalChars * 32, 260, 1700 + lines.length * 120);
    const pad = 40;
    const W = r.w + pad, H = r.h + pad;
    const clipFor = (li, x) => {
      const l = lines[li];
      return `polygon(${-pad}px ${-pad}px, ${W}px ${-pad}px, ${W}px ${l.y}px, ${x}px ${l.y}px, ${x}px ${l.y + l.h}px, ${-pad}px ${l.y + l.h}px)`;
    };
    this._show(task, clipFor(0, first.x));

    try {
      for (let li = 0; li < lines.length; li++) {
        const l = lines[li];
        if (li > 0) {
          // Fill the previous line completely before moving down.
          task.el.style.setProperty('clip-path', clipFor(li, l.x), 'important');
        }
        caret.style.height = `${l.h}px`;
        const lineDur = Math.max(60, budget * (l.w / charW / totalChars)) / this._pace();
        let lastKey = 0;
        await this._animate(lineDur, (t) => {
          const chars = Math.round(t * (l.w / charW));
          const x = t >= 1 ? l.x + l.w + pad : l.x + Math.min(l.w, chars * charW);
          task.el.style.setProperty('clip-path', clipFor(li, x), 'important');
          const cx = Math.min(l.x + l.w, x);
          caret.style.transform = `translate(${r.x + cx}px, ${r.y + l.y}px)`;
          agent.x = r.x + cx + 7; agent.y = r.y + l.y + l.h * 0.62;
          this._place(agent);
          if (this.sound && chars !== lastKey) { lastKey = chars; this._sound.key(this._pan(agent)); }
        }, run);
      }
      caret.classList.add('blink');
      await this._wait(260 / this.speed, run);
    } finally {
      caret.remove();
      this._setMode(agent, 'arrow');
      this._place(agent);
    }
  }

  /* --- finale ------------------------------------------------------- */

  async _finale(run) {
    const linger = this.linger;
    if (linger > 0) {
      const agents = this._agents;
      agents.forEach((a) => { this._setMode(a, 'arrow'); a.vx = rand(-1, 1); a.vy = rand(-1, 1); });
      let last = performance.now();
      const step = (now) => {
        const dt = Math.min(48, now - last) / 16.67; last = now;
        const h = this._hostRect(), v = this._view();
        const target = this._pointer
          ? { x: this._pointer.x - h.left, y: this._pointer.y - h.top }
          : { x: (v.left + v.right) / 2, y: (v.top + v.bottom) / 2 };
        agents.forEach((a, i) => {
          // Orbit the target at a personal radius, keep some distance from each other.
          const dx = target.x - a.x, dy = target.y - a.y, d = Math.hypot(dx, dy) || 1;
          const want = 46 + (i % 4) * 18;
          const pull = (d - want) / d;
          let ax = dx * pull * 0.012 + (-dy / d) * 0.22;
          let ay = dy * pull * 0.012 + (dx / d) * 0.22;
          for (const b of agents) {
            if (b === a) continue;
            const ex = a.x - b.x, ey = a.y - b.y, e = Math.hypot(ex, ey) || 1;
            if (e < 40) { ax += (ex / e) * (40 - e) * 0.02; ay += (ey / e) * (40 - e) * 0.02; }
          }
          a.vx = (a.vx + ax * dt) * 0.92; a.vy = (a.vy + ay * dt) * 0.92;
          a.x += a.vx * dt; a.y += a.vy * dt;
          this._place(a);
        });
      };
      // linger = Infinity never resolves; the run is ended by finish()/reset()/replay().
      await this._animate(linger, (_t, now) => step(now), run);
    }
    // Fly out through the nearest visible edge.
    const v = this._view();
    await Promise.all(this._agents.map(async (a) => {
      const exits = [
        [a.x, v.top - 40, a.y - v.top], [a.x, v.bottom + 40, v.bottom - a.y],
        [v.left - 40, a.y, a.x - v.left], [v.right + 40, a.y, v.right - a.x],
      ].sort((p, q) => p[2] - q[2]);
      await this._wait(rand(0, 200), run);
      a.el.style.opacity = '0';
      await this._move(a, exits[0][0], exits[0][1], run, { dur: 600, pace: 1 });
    }));
  }

  _clearLayer() {
    this._layer.textContent = '';
    this._agents = [];
  }
}

/* -------------------------------------------------------------- helpers */

function isStyled(cs) {
  const visible = (c) => c && c !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(c) && !/\/\s*0\)$/.test(c);
  if (visible(cs.backgroundColor)) return true;
  if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
  if (cs.boxShadow && cs.boxShadow !== 'none') return true;
  for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
    if (parseFloat(cs[`border${side}Width`]) > 0 && cs[`border${side}Style`] !== 'none' && visible(cs[`border${side}Color`])) return true;
  }
  return false;
}

function hasDirectText(el) {
  for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return true;
  return false;
}

/** Line boxes of an element's text, relative to the element's border box. */
function textLines(el, r, host) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = [...range.getClientRects()].filter((q) => q.width > 0.5 && q.height > 0.5);
  range.detach?.();
  const ox = host.left + r.x, oy = host.top + r.y;
  const lines = [];
  for (const q of rects.sort((a, b) => a.top - b.top || a.left - b.left)) {
    const mid = q.top + q.height / 2;
    const line = lines.find((l) => mid > l.top && mid < l.bottom);
    if (line) {
      line.left = Math.min(line.left, q.left); line.right = Math.max(line.right, q.right);
      line.top = Math.min(line.top, q.top); line.bottom = Math.max(line.bottom, q.bottom);
    } else lines.push({ left: q.left, right: q.right, top: q.top, bottom: q.bottom });
  }
  return lines
    .sort((a, b) => a.top - b.top)
    .map((l) => ({ x: l.left - ox, y: l.top - oy, w: l.right - l.left, h: l.bottom - l.top }));
}

export function defineCursorSwarm(tag = TAG) {
  if (typeof customElements !== 'undefined' && !customElements.get(tag)) customElements.define(tag, class extends CursorSwarm {});
}

if (typeof customElements !== 'undefined' && !customElements.get(TAG)) customElements.define(TAG, CursorSwarm);

export default CursorSwarm;
