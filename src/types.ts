export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameState = 'START' | 'PLAYING' | 'GAME_OVER';
export type AnimalType = 'animal1' | 'animal2' | 'animal3';
export type TrolleyType = 'trolley1' | 'trolley2' | 'trolley3';
export type WallType =
  | 'wall-top-left'
  | 'wall-top-right'
  | 'wall-bottom-left'
  | 'wall-bottom-right'
  | 'wall-horizontal'
  | 'wall-vertical';

export type CellType = 'head' | TrolleyType | AnimalType | WallType | 'grass';

export interface Segment {
  x: number;
  y: number;
  type: 'head' | TrolleyType;
}

export interface Food {
  x: number;
  y: number;
  type: AnimalType;
}
