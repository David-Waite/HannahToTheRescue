import { useEffect } from 'react';
import { OPPOSITE } from '../constants';
import type { Direction, GameState } from '../types';

const KEY_MAP: Record<string, Direction> = {
  ArrowUp:    'UP',
  ArrowDown:  'DOWN',
  ArrowLeft:  'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP', W: 'UP',
  s: 'DOWN', S: 'DOWN',
  a: 'LEFT', A: 'LEFT',
  d: 'RIGHT', D: 'RIGHT',
};

export function useInput(
  pendingDirRef: React.MutableRefObject<Direction>,
  gameState: GameState,
): void {
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    function handleKeyDown(e: KeyboardEvent): void {
      const newDir = KEY_MAP[e.key];
      if (!newDir) return;
      // Block 180° reversal against whatever is already queued
      if (newDir === OPPOSITE[pendingDirRef.current]) return;
      if (e.key.startsWith('Arrow')) e.preventDefault();
      pendingDirRef.current = newDir;
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, pendingDirRef]);
}
