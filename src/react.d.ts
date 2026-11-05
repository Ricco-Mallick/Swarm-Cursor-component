import type { ForwardRefExoticComponent, HTMLAttributes, ReactNode, RefAttributes } from 'react';
import type { CursorSwarm as CursorSwarmElement, SwarmScope, SwarmTrigger } from './cursor-swarm.js';

export interface CursorSwarmProps extends Omit<HTMLAttributes<HTMLElement>, 'onEnded'> {
  cursors?: number;
  speed?: number;
  names?: string[] | string;
  colors?: string[] | string;
  trigger?: SwarmTrigger;
  scope?: SwarmScope;
  linger?: number;
  sound?: boolean;
  volume?: number;
  hideLabels?: boolean;
  ignoreReducedMotion?: boolean;
  maxTasks?: number;
  onStart?: (e: Event) => void;
  onComplete?: (e: Event) => void;
  onEnd?: (e: Event) => void;
  children?: ReactNode;
}

export declare const CursorSwarm: ForwardRefExoticComponent<CursorSwarmProps & RefAttributes<CursorSwarmElement>>;
export default CursorSwarm;
