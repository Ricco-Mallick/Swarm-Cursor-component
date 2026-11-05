export type SwarmTrigger = 'visible' | 'load' | 'manual';
export type SwarmScope = 'viewport' | 'all';
export type SwarmState = 'idle' | 'armed' | 'building' | 'finale' | 'done';

export declare class CursorSwarm extends HTMLElement {
  /** Number of cursors (1–24). Default 5. */
  cursors: number;
  /** Build speed multiplier. Default 1. */
  speed: number;
  /** When to start: when scrolled into view (default), on load, or only via play(). */
  trigger: SwarmTrigger;
  /** 'viewport' (default) builds as you scroll; 'all' builds everything at once. */
  scope: SwarmScope;
  /** Milliseconds the cursors flock around the pointer after building. Default 2500. */
  linger: number;
  /** Synthesized UI sounds (Web Audio). Off by default. */
  sound: boolean;
  /** Sound volume 0–1. Default 0.4. */
  volume: number;
  /** Hide the name tags next to each cursor. */
  hideLabels: boolean;
  names: string[];
  colors: string[];
  readonly state: SwarmState;
  play(): void;
  replay(): void;
  finish(): void;
  reset(): void;
}

export declare function defineCursorSwarm(tag?: string): void;
export default CursorSwarm;

declare global {
  interface HTMLElementTagNameMap {
    'cursor-swarm': CursorSwarm;
  }
  interface HTMLElementEventMap {
    swarmstart: CustomEvent<void>;
    swarmcomplete: CustomEvent<void>;
    swarmend: CustomEvent<void>;
  }
}
