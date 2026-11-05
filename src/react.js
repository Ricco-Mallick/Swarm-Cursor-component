'use client';
import { createElement, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import './cursor-swarm.js';

const TAG = 'cursor-swarm';

const flag = (v) => (v ? '' : undefined);
const list = (v) => (Array.isArray(v) ? v.join(',') : v);

/**
 * React wrapper for <cursor-swarm>. The ref exposes the element (play, replay, finish, reset).
 */
export const CursorSwarm = forwardRef(function CursorSwarm(props, ref) {
  const {
    cursors, speed, names, colors, trigger, scope, linger, sound, volume, hideLabels, ignoreReducedMotion, maxTasks,
    onStart, onComplete, onEnd, className, children, ...rest
  } = props;
  const el = useRef(null);
  useImperativeHandle(ref, () => el.current, []);

  useEffect(() => {
    const node = el.current;
    if (!node) return undefined;
    const pairs = [['swarmstart', onStart], ['swarmcomplete', onComplete], ['swarmend', onEnd]].filter(([, fn]) => fn);
    pairs.forEach(([type, fn]) => node.addEventListener(type, fn));
    return () => pairs.forEach(([type, fn]) => node.removeEventListener(type, fn));
  }, [onStart, onComplete, onEnd]);

  return createElement(TAG, {
    ref: el,
    className,
    cursors,
    speed,
    names: list(names),
    colors: list(colors),
    trigger,
    scope,
    linger: linger === Infinity ? 'infinite' : linger,
    sound: flag(sound),
    volume,
    'hide-labels': flag(hideLabels),
    'ignore-reduced-motion': flag(ignoreReducedMotion),
    'max-tasks': maxTasks,
    suppressHydrationWarning: true,
    ...rest,
  }, children);
});

export default CursorSwarm;
