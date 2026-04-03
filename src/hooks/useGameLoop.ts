import { useEffect, useRef } from 'react';
import { GRID_WIDTH, GRID_HEIGHT, TICK_MS, DELTA, ANIMAL_TYPES, ANIMAL_TO_TROLLEY } from '../constants';
import type { Segment, Food, Direction, GameState, AnimalType } from '../types';

function randomAnimal(snake: Segment[], currentFood: Food | null): Food | null {
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
  if (currentFood) occupied.add(`${currentFood.x},${currentFood.y}`);

  const candidates: { x: number; y: number }[] = [];
  for (let y = 1; y < GRID_HEIGHT - 1; y++) {
    for (let x = 1; x < GRID_WIDTH - 1; x++) {
      if (!occupied.has(`${x},${y}`)) candidates.push({ x, y });
    }
  }
  if (candidates.length === 0) return null;

  const pos  = candidates[Math.floor(Math.random() * candidates.length)];
  const type = ANIMAL_TYPES[Math.floor(Math.random() * ANIMAL_TYPES.length)];
  return { ...pos, type };
}

export function spawnFood(snake: Segment[]): Food {
  return randomAnimal(snake, null) ?? { x: 5, y: 5, type: 'animal1' };
}

interface GameLoopProps {
  snake:         Segment[];
  food:          Food | null;
  pendingDirRef: React.MutableRefObject<Direction>;
  gameState:     GameState;
  setSnake:      (s: Segment[]) => void;
  setFood:       (f: Food | null) => void;
  setScore:        (fn: (prev: number) => number) => void;
  setSavedAnimals: (fn: (prev: AnimalType[]) => AnimalType[]) => void;
  setGameState:    (s: GameState) => void;
  setDirection:    (d: Direction) => void;
}

export function useGameLoop({
  snake, food, pendingDirRef, gameState,
  setSnake, setFood, setScore, setSavedAnimals, setGameState, setDirection,
}: GameLoopProps): void {
  const snakeRef = useRef<Segment[]>(snake);
  const foodRef  = useRef<Food | null>(food);

  snakeRef.current = snake;
  foodRef.current  = food;

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const id = setInterval(() => {
      const currentSnake = snakeRef.current;
      const currentFood  = foodRef.current;

      // Lock in the buffered direction at the start of each step
      const dir = pendingDirRef.current;
      setDirection(dir);

      const head    = currentSnake[0];
      const delta   = DELTA[dir];
      const newHead: Segment = { x: head.x + delta.x, y: head.y + delta.y, type: 'head' };

      // Wall collision
      if (
        newHead.x <= 0 || newHead.x >= GRID_WIDTH  - 1 ||
        newHead.y <= 0 || newHead.y >= GRID_HEIGHT - 1
      ) {
        setGameState('GAME_OVER');
        return;
      }

      // Self collision (exclude last segment — it will move away this tick)
      const hitSelf = currentSnake.slice(0, -1).some(s => s.x === newHead.x && s.y === newHead.y);
      if (hitSelf) {
        setGameState('GAME_OVER');
        return;
      }

      // Food collection
      if (currentFood && newHead.x === currentFood.x && newHead.y === currentFood.y) {
        const collectedType = currentFood.type as AnimalType;
        const trolleyType   = ANIMAL_TO_TROLLEY[collectedType];
        const grown: Segment[] = [
          newHead,
          { ...currentSnake[0], type: trolleyType },
          ...currentSnake.slice(1),
        ];
        setSnake(grown);
        setScore(s => s + 1);
        setSavedAnimals(arr => [...arr, collectedType]);
        setFood(randomAnimal(grown, null));
      } else {
        // Each body segment slides forward into the position of the segment
        // ahead of it, keeping its own type (trolley sprites stay consistent).
        const movedBody = currentSnake.slice(1).map((seg, i) => ({
          ...seg,
          x: currentSnake[i].x,
          y: currentSnake[i].y,
        }));
        setSnake([newHead, ...movedBody]);
      }

    }, TICK_MS);

    return () => clearInterval(id);
  }, [gameState, pendingDirRef, setSnake, setFood, setScore, setSavedAnimals, setGameState, setDirection]);
}
