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
      if (newDir === OPPOSITE[pendingDirRef.current]) return;
      if (e.key.startsWith('Arrow')) e.preventDefault();
      pendingDirRef.current = newDir;
    }

    let touchStartX = 0;
    let touchStartY = 0;

    function handleTouchStart(e: TouchEvent): void {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e: TouchEvent): void {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Ignore tiny taps
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      let newDir: Direction;
      if (Math.abs(dx) >= Math.abs(dy)) {
        newDir = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        newDir = dy > 0 ? 'DOWN' : 'UP';
      }
      if (newDir === OPPOSITE[pendingDirRef.current]) return;
      pendingDirRef.current = newDir;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, pendingDirRef]);
}
