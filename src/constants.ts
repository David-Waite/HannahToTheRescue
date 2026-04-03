import type { Direction, AnimalType, TrolleyType } from './types';

export const GRID_WIDTH  = 15;
export const GRID_HEIGHT = 13;
export const TILE_SIZE   = 32;
export const TICK_MS     = 175;

export const DIRECTIONS: Record<Direction, Direction> = {
  UP: 'UP', DOWN: 'DOWN', LEFT: 'LEFT', RIGHT: 'RIGHT',
};

export const OPPOSITE: Record<Direction, Direction> = {
  UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
};

export const DELTA: Record<Direction, { x: number; y: number }> = {
  UP:    { x:  0, y: -1 },
  DOWN:  { x:  0, y:  1 },
  LEFT:  { x: -1, y:  0 },
  RIGHT: { x:  1, y:  0 },
};

export const ANIMAL_TYPES: AnimalType[] = ['animal1', 'animal2', 'animal3'];

export const ANIMAL_TO_TROLLEY: Record<AnimalType, TrolleyType> = {
  animal1: 'trolley1',
  animal2: 'trolley2',
  animal3: 'trolley3',
};

// Placeholder colours (swap out when sprites are ready)
export const COLORS: Record<string, string> = {
  head:     '#2e7d32',
  trolley1: '#e65100',
  trolley2: '#6a1b9a',
  trolley3: '#0277bd',
  animal1:  '#ff8f00',
  animal2:  '#c62828',
  animal3:  '#4527a0',
  wall:     '#4e342e',
  grass:    '#c8e6c9',
};
