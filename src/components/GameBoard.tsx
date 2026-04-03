import type { CSSProperties } from "react";
import { GRID_WIDTH, GRID_HEIGHT, TILE_SIZE, TICK_MS } from "../constants";
import Cell from "./Cell";
import type { Segment, Food, Direction, WallType, TrolleyType } from "../types";

interface GameBoardProps {
  snake: Segment[];
  food: Food | null;
  direction: Direction;
  animFrame: number;
}

// Sprite sheet: 96×128px, 3 cols × 4 rows, each frame 32×32
// Cols: 0=idle, 1=walk_1, 2=walk_2
// Rows: 0=down, 1=left, 2=right, 3=up
const DIRECTION_ROW: Record<Direction, number> = {
  DOWN: 0,
  LEFT: 1,
  RIGHT: 2,
  UP: 3,
};

const TROLLEY_ANIMAL: Record<TrolleyType, string> = {
  trolley1: "animal1",
  trolley2: "animal2",
  trolley3: "animal3", // ready for when the third is added
};

function getTrolleySprite(
  type: TrolleyType,
  ahead: { x: number; y: number },
  seg: { x: number; y: number },
): string {
  const animal = TROLLEY_ANIMAL[type];
  const dx = ahead.x - seg.x;
  const dy = ahead.y - seg.y;
  if (dx > 0) return `url('/sprites/rescuedAnimals/${animal}Right.png')`;
  if (dx < 0) return `url('/sprites/rescuedAnimals/${animal}Left.png')`;
  if (dy > 0) return `url('/sprites/rescuedAnimals/${animal}Down.png')`;
  return `url('/sprites/rescuedAnimals/${animal}Up.png')`;
}

function getWallType(x: number, y: number): WallType {
  const isLeft = x === 0;
  const isRight = x === GRID_WIDTH - 1;
  const isTop = y === 0;
  const isBottom = y === GRID_HEIGHT - 1;

  if (isTop && isLeft) return "wall-top-left";
  if (isTop && isRight) return "wall-top-right";
  if (isBottom && isLeft) return "wall-bottom-left";
  if (isBottom && isRight) return "wall-bottom-right";
  if (isTop || isBottom) return "wall-horizontal";
  return "wall-vertical";
}

export default function GameBoard({
  snake,
  food,
  direction,
  animFrame,
}: GameBoardProps) {
  const head = snake[0];
  const headKey = `${head.x},${head.y}`;
  const body = snake.slice(1) as (Segment & { type: TrolleyType })[];

  // Only food and walls go in the cell grid — snake is all overlays
  const foodCell = food
    ? new Map([[`${food.x},${food.y}`, food.type]])
    : new Map<string, string>();
  const bodyKeys = new Set(body.map((s) => `${s.x},${s.y}`));

  const cells: JSX.Element[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const isWall =
        x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1;
      const key = `${x},${y}`;

      if (key === headKey || bodyKeys.has(key)) {
        cells.push(<Cell key={key} type="grass" />);
      } else if (foodCell.has(key)) {
        cells.push(<Cell key={key} type={foodCell.get(key) as any} />);
      } else if (isWall) {
        cells.push(<Cell key={key} type={getWallType(x, y)} />);
      } else {
        cells.push(<Cell key={key} type="grass" />);
      }
    }
  }

  const boardStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${GRID_WIDTH}, ${TILE_SIZE}px)`,
    gridTemplateRows: `repeat(${GRID_HEIGHT}, ${TILE_SIZE}px)`,
    gap: 0,
    lineHeight: 0,
    imageRendering: "pixelated",
    backgroundImage: "url('/sprites/enviornment/EnvironmentTile.png')",
    backgroundRepeat: "repeat",
    backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`,
  };

  const slideTransition = `left ${TICK_MS}ms linear, top ${TICK_MS}ms linear`;

  const col = animFrame === 0 ? 1 : 2; // 0=idle, 1=walk_1, 2=walk_2
  const row = DIRECTION_ROW[direction];
  const bgPosX = -(col * TILE_SIZE);
  const bgPosY = -(row * TILE_SIZE);

  const hannahSheet =
    snake.length > 1
      ? "url('/sprites/hannahTrolley.png')"
      : "url('/sprites/hannah.png')";

  const hannahStyle: CSSProperties = {
    position: "absolute",
    left: head.x * TILE_SIZE,
    top: head.y * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundImage: hannahSheet,
    backgroundSize: "96px 128px",
    backgroundPosition: `${bgPosX}px ${bgPosY}px`,
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
    transition: slideTransition,
    pointerEvents: "none",
    zIndex: 2,
  };

  return (
    <div
      style={{ position: "relative", display: "inline-block", lineHeight: 0 }}
    >
      <div style={boardStyle}>{cells}</div>

      {/* Trolley segments — each slides independently */}
      {body.map((seg, i) => {
        // Direction = towards the segment ahead (snake[i] is directly ahead of body[i])
        const ahead = snake[i];
        const sprite = getTrolleySprite(seg.type, ahead, seg);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: seg.x * TILE_SIZE,
              top: seg.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundImage: sprite,
              backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`, // scale 64→32
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
              transition: slideTransition,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        );
      })}

      {/* Hannah — always on top */}
      <div style={hannahStyle} />
    </div>
  );
}
