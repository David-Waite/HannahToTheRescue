import type { CSSProperties } from 'react';
import { COLORS, TILE_SIZE } from '../constants';
import type { CellType } from '../types';

interface CellProps {
  type: CellType;
}

const SPRITES: Partial<Record<CellType, string>> = {
  'wall-top-left':     "url('/sprites/enviornment/boundary/TopLeftBoundary.png')",
  'wall-top-right':    "url('/sprites/enviornment/boundary/TopRightBoundary.png')",
  'wall-bottom-left':  "url('/sprites/enviornment/boundary/BottomLeftBoundary.png')",
  'wall-bottom-right': "url('/sprites/enviornment/boundary/BottomRightBoundary.png')",
  'wall-horizontal':   "url('/sprites/enviornment/boundary/HorizontalBoundary.png')",
  'wall-vertical':     "url('/sprites/enviornment/boundary/VerticalBoundary.png')",
  'animal1':           "url('/sprites/sickAnimals/animal1.png')",
  'animal2':           "url('/sprites/sickAnimals/animal2.png')",
  'animal3':           "url('/sprites/sickAnimals/animal3.png')",
  'trolley1':          "url('/sprites/rescuedAnimals/animal1.png')",
  'trolley2':          "url('/sprites/rescuedAnimals/animal2.png')",
  'trolley3':          "url('/sprites/rescuedAnimals/animal3.png')",
};

export default function Cell({ type }: CellProps) {
  const sprite = SPRITES[type];
  const color  = COLORS[type] ?? COLORS['grass'];

  const style: CSSProperties = {
    width:          TILE_SIZE,
    height:         TILE_SIZE,
    boxSizing:      'border-box',
    display:        'block',
    imageRendering: 'pixelated',
    ...(type === 'grass'
      ? {}
      : sprite
      ? {
          backgroundImage:    sprite,
          backgroundRepeat:   'no-repeat',
          backgroundPosition: 'center',
          backgroundSize:     type.startsWith('animal')
            ? `${TILE_SIZE / 2}px ${TILE_SIZE / 2}px`
            : `${TILE_SIZE}px ${TILE_SIZE}px`,
        }
      : { backgroundColor: color }
    ),
  };

  return <div style={style} />;
}
