import type { CSSProperties } from "react";
import { GRID_WIDTH, GRID_HEIGHT, TILE_SIZE, TICK_MS } from "../constants";
import Cell from "./Cell";
import type { Segment, Food, Direction, TrolleyType, FloorType } from "../types";

// Seedable pseudo-random (no visible patterns)
function rand(x: number, y: number, salt = 0): number {
  let h = (x * 374761393 + y * 1376312589 + salt * 668265263) | 0;
  h ^= h >>> 13;
  h = Math.imul(h, 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// Deterministic floor map — computed once at module load, never changes
const FLOOR_MAP = (() => {
  const map = new Map<string, FloorType>();

  // Scrub zone: upper-left quadrant fading out towards centre
  const scrubZoneCentreX = GRID_WIDTH  * 0.25;
  const scrubZoneCentreY = GRID_HEIGHT * 0.3;

  for (let y = 1; y < GRID_HEIGHT - 1; y++) {
    for (let x = 1; x < GRID_WIDTH - 1; x++) {
      const r = rand(x, y);

      // Distance from scrub cluster centre (0–1 normalised)
      const dx = (x - scrubZoneCentreX) / GRID_WIDTH;
      const dy = (y - scrubZoneCentreY) / GRID_HEIGHT;
      const scrubChance = Math.max(0, 0.38 - (dx * dx + dy * dy) * 6);

      let tile: FloorType;
      if (r < scrubChance)               tile = 'scrub';
      else if (r < 0.18)                 tile = 'grass2';
      else if (r < 0.26)                 tile = 'grass3';
      else                               tile = 'grass';

      // Sparse lone bushes spread across the whole map
      if (tile === 'grass' && rand(x, y, 1) < 0.04) tile = 'bush';

      map.set(`${x},${y}`, tile);
    }
  }
  return map;
})();

const BUSH_SIZE = TILE_SIZE / 2; // 16px — rendered at native sprite size
const BUSH_OFFSET = (TILE_SIZE - BUSH_SIZE) / 2; // 8px — centres in tile

// Pre-collect overlay positions (bush + scrub) for rendering above the floor
const OVERLAY_POSITIONS: { x: number; y: number; type: 'bush' | 'scrub' }[] = [];
for (let y = 1; y < GRID_HEIGHT - 1; y++) {
  for (let x = 1; x < GRID_WIDTH - 1; x++) {
    const t = FLOOR_MAP.get(`${x},${y}`);
    if (t === 'bush' || t === 'scrub') OVERLAY_POSITIONS.push({ x, y, type: t });
  }
}

const OVERLAY_SPRITES: Record<'bush' | 'scrub', string> = {
  bush:  "url('/sprites/enviornment/EnvironmentTileBush.png')",
  scrub: "url('/sprites/enviornment/EnvironmentTileScrub.png')",
};

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

// Tree constants — native 16×22, rendered 2× = 32×44
// Crown = top 6px native = top 12px rendered, overlaps the tile above
const TREE_W = TILE_SIZE;           // 32
const TREE_H = 22 * (TILE_SIZE / 16); // 44
const TREE_CROWN = 6 * (TILE_SIZE / 16); // 12px — how far crown extends above tile

// Pre-collect wall positions for tree overlay rendering
const WALL_POSITIONS: { x: number; y: number }[] = [];
for (let y = 0; y < GRID_HEIGHT; y++) {
  for (let x = 0; x < GRID_WIDTH; x++) {
    if (x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1) {
      WALL_POSITIONS.push({ x, y });
    }
  }
}

export default function GameBoard({
  snake,
  food,
  direction,
  animFrame,
}: GameBoardProps) {
  const head = snake[0];
  const body = snake.slice(1) as (Segment & { type: TrolleyType })[];

  const cells: JSX.Element[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const isWall =
        x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1;
      const key = `${x},${y}`;

      if (isWall) {
        cells.push(<Cell key={key} type="grass" />);
      } else {
        const floor = FLOOR_MAP.get(key) ?? "grass";
        const cellType = (floor === "bush" || floor === "scrub") ? "grass" : floor;
        cells.push(<Cell key={key} type={cellType} />);
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
    backgroundImage: "url('/sprites/enviornment/EnvironmentTile1.png')",
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
      style={{ position: "relative", display: "inline-block", lineHeight: 0, overflow: "hidden" }}
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

      {/* Food — above bushes/scrubs */}
      {food && (
        <div
          style={{
            position: "absolute",
            left: food.x * TILE_SIZE + TILE_SIZE / 4,
            top: food.y * TILE_SIZE + TILE_SIZE / 4,
            width: TILE_SIZE / 2,
            height: TILE_SIZE / 2,
            backgroundImage: `url('/sprites/sickAnimals/${food.type}.png')`,
            backgroundSize: `${TILE_SIZE / 2}px ${TILE_SIZE / 2}px`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}

      {/* Bush/scrub overlays — above floor, under trolleys/Hannah */}
      {OVERLAY_POSITIONS.map(({ x, y, type }) => (
        <div
          key={`${type}-${x},${y}`}
          style={{
            position: "absolute",
            left: x * TILE_SIZE + BUSH_OFFSET,
            top: y * TILE_SIZE + BUSH_OFFSET,
            width: BUSH_SIZE,
            height: BUSH_SIZE,
            backgroundImage: OVERLAY_SPRITES[type],
            backgroundSize: `${BUSH_SIZE}px ${BUSH_SIZE}px`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      {/* Trees — above everything, crown overlaps tile above */}
      {WALL_POSITIONS.map(({ x, y }) => (
        <div
          key={`tree-${x},${y}`}
          style={{
            position: "absolute",
            left: x * TILE_SIZE,
            top: y * TILE_SIZE - TREE_CROWN,
            width: TREE_W,
            height: TREE_H,
            backgroundImage: "url('/sprites/enviornment/boundary/Tree.png')",
            backgroundSize: `${TREE_W}px ${TREE_H}px`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
      ))}

      {/* Hannah — above floor/bushes, below trees */}
      <div style={hannahStyle} />
    </div>
  );
}
