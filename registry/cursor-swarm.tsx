'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, type HTMLAttributes, type ReactNode } from 'react';
import './cursor-swarm-element.js';

export interface CursorSwarmElement extends HTMLElement {
  readonly state: 'idle' | 'armed' | 'building' | 'finale' | 'done';
  play(): void;
  replay(): void;
  finish(): void;
  reset(): void;
}

export interface CursorSwarmProps extends HTMLAttributes<HTMLElement> {
  /** Number of cursors (1–24). Default 5. */
  cursors?: number;
  /** Build speed multiplier. Default 1. */
  speed?: number;
  names?: string[];
  colors?: string[];
  /** 'visible' (default) starts when scrolled into view, 'load' starts at once, 'manual' waits for play(). */
  trigger?: 'visible' | 'load' | 'manual';
  /** 'viewport' (default) builds as you scroll, 'all' builds everything at once. */
  scope?: 'viewport' | 'all';
  /** Milliseconds the cursors flock around the pointer before leaving. Default 2500. */
  linger?: number;
  sound?: boolean;
  volume?: number;
  hideLabels?: boolean;
  ignoreReducedMotion?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  onEnd?: () => void;
  children?: ReactNode;
}

const flag = (v?: boolean) => (v ? '' : undefined);

export const CursorSwarm = forwardRef<CursorSwarmElement, CursorSwarmProps>(function CursorSwarm(
  { cursors, speed, names, colors, trigger, scope, linger, sound, volume, hideLabels, ignoreReducedMotion, onStart, onComplete, onEnd, children, ...rest },
  ref,
) {
  const el = useRef<CursorSwarmElement>(null);
  useImperativeHandle(ref, () => el.current as CursorSwarmElement, []);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const pairs = ([['swarmstart', onStart], ['swarmcomplete', onComplete], ['swarmend', onEnd]] as const).filter(([, fn]) => fn);
    pairs.forEach(([type, fn]) => node.addEventListener(type, fn as EventListener));
    return () => pairs.forEach(([type, fn]) => node.removeEventListener(type, fn as EventListener));
  }, [onStart, onComplete, onEnd]);

  const attrs = {
    ref: el,
    cursors,
    speed,
    names: names?.join(','),
    colors: colors?.join(','),
    trigger,
    scope,
    linger,
    sound: flag(sound),
    volume,
    'hide-labels': flag(hideLabels),
    'ignore-reduced-motion': flag(ignoreReducedMotion),
    suppressHydrationWarning: true,
    ...rest,
  };
  // Custom element tag; cast keeps JSX typing simple without a global IntrinsicElements patch.
  const Tag = 'cursor-swarm' as unknown as 'div';
  return <Tag {...(attrs as HTMLAttributes<HTMLDivElement>)}>{children}</Tag>;
});

export default CursorSwarm;
