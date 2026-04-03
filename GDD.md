# Master Game Design Document: Wildlife Rescue Snake

## 1. Game Concept & Core Features

**Concept:** A top-down, grid-based puzzle game based on classic "Snake" mechanics. The player controls a wildlife rescuer. Instead of eating food, the rescuer collects sick animals. Upon collection, the animal is cured, placed in a trolley, and appended to the rescuer's trailing conga line.

### Core Features

- **Grid Movement:** Continuous, single-tile movement dictated by player input (Up, Down, Left, Right).
- **Collection Logic:** Intersecting with a "Sick Animal" tile removes it from the board, increments the score, and adds a "Trolley" segment to the tail of the snake.
- **Dynamic Spawning:** Upon collection, a new Sick Animal (randomly selected from 3 variants) spawns on a random, unoccupied grid tile.
- **Collision Detection (Loss Condition):** The game ends if the rescuer's head collides with the boundary walls or any part of the trailing trolley line.
- **Scoring:** Displayed on screen, tracking the total number of animals rescued.

---

## 2. Art Style & Sprite Specifications

**Visual Direction:** 16-bit Top-Down 3/4 Perspective (Orthogonal). Influenced by Game Boy Advance RPGs (e.g., Pokémon). Characters have "chibi" proportions (large heads, small bodies).

**Technical Format:**
- All assets must be exported as `.PNG` with transparent backgrounds.
- The base grid resolution is **32x32 pixels per tile**.

### Sprite Asset List

| Asset Name | Grid Size | Frames Required | Description & Animation Details |
|---|---|---|---|
| Rescuer Head | 32x32 | 6 frames total | 2 frames walking Down (front), 2 frames walking Up (back), 2 frames walking Left (side). Note: Right walk cycle handled in code via horizontal flip. |
| Sick Animal 1 (Fox) | 32x32 | 1 frame | Static image. Facing forward/down. Visual cue of being unwell (e.g., bandage or sleepy eyes). |
| Sick Animal 2 (Bunny) | 32x32 | 1 frame | Static image. Facing forward/down. Unwell visual cue. |
| Sick Animal 3 (Raccoon) | 32x32 | 1 frame | Static image. Facing forward/down. Unwell visual cue. |
| Trolley + Animal 1 | 32x32 | 1 frame | Static image. Wooden cart/wagon facing forward with Happy Animal 1 (Fox) popping out of the top. |
| Trolley + Animal 2 | 32x32 | 1 frame | Static image. Wagon facing forward with Happy Animal 2 (Bunny) popping out. |
| Trolley + Animal 3 | 32x32 | 1 frame | Static image. Wagon facing forward with Happy Animal 3 (Raccoon) popping out. |
| Environment Tile | 32x32 | 1 to 2 frames | Seamless tiling grass or dirt texture for the floor. |
| Boundary Obstacle | 32x32 | 1 frame | A tree, rock, or fence to visually represent the deadly outer wall border. |

**Sprite Sheet Layout (for Rescuer Head):**
When the PNG sprite sheet is created, lay frames out horizontally in this order:
1. Walk Down — Frame A
2. Walk Down — Frame B
3. Walk Up — Frame A
4. Walk Up — Frame B
5. Walk Left — Frame A
6. Walk Left — Frame B

In code, `background-position: -Npx 0` selects each frame. Right movement mirrors the Left frames via `transform: scaleX(-1)`.

---

## 3. React Implementation Architecture

**Framework & Rendering:** React.js using standard functional components and hooks. The game board is rendered using CSS Grid, where each cell maps to an X/Y coordinate.

### Core State Management (Hooks)

```js
// snake: array of segments
// Index 0 is always the rescuer's head
snake: [{ x: int, y: int, type: 'head' | 'trolley1' | 'trolley2' | 'trolley3' }]

// food: current sick animal on the board
food: { x: int, y: int, type: 'animal1' | 'animal2' | 'animal3' }

// direction: current movement direction
direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

// gameState: current phase
gameState: 'START' | 'PLAYING' | 'GAME_OVER'
```

### Game Loop Logic

Utilise a `useEffect` hook with a `setInterval` (175ms tick rate) to drive the game loop when `gameState === 'PLAYING'`.

**On every tick:**
1. Calculate the new head position based on current direction.
2. Check for collisions (walls or snake body). If true → set `gameState` to `'GAME_OVER'`.
3. Check for food collection (new head position matches food position).
   - **If collected:** Unshift the new head to the snake array. Leave the tail in place (grows the snake). Set the previous head segment to the trolley type matching the collected animal. Spawn new food. Increment score.
   - **If not collected:** Unshift the new head to the snake array, `pop()` the last item (simulates movement without growth).

### CSS & Styling Guidelines

**The Board:**
```css
display: grid;
grid-template-columns: repeat(GRID_WIDTH, 32px);
grid-template-rows: repeat(GRID_HEIGHT, 32px);
```

**The Entities:**
- Render standard `<div>` elements inside grid cells.
- Apply PNG sprite sheets using `background-image`.
- Use `background-position` to display the correct frame for the rescuer's walking animation.
- Apply `transform: scaleX(-1)` when direction is `'RIGHT'`.

### Input Handling

- Attach a `keydown` event listener to `window`.
- Map Arrow Keys and W/A/S/D to update the direction state.
- **Crucial Logic:** Prevent 180-degree turns (e.g., cannot press `'DOWN'` if current direction is `'UP'`).

---

## 4. Grid & Timing

| Setting | Value |
|---|---|
| Grid Width | 20 tiles |
| Grid Height | 20 tiles |
| Tile Size | 32px |
| Tick Rate | 175ms |
| Board Size | 640x640px (playable area, excluding walls) |

The outer ring of the grid (x=0, x=GRID_WIDTH-1, y=0, y=GRID_HEIGHT-1) renders as Boundary Obstacle tiles. The rescuer starts in the centre of the playable inner area.

---

## 5. Placeholder Colour Scheme (pre-sprite)

| Entity | Colour |
|---|---|
| Rescuer head | `#2e7d32` (dark green) |
| Trolley 1 — Fox | `#e65100` (deep orange) |
| Trolley 2 — Bunny | `#6a1b9a` (purple) |
| Trolley 3 — Raccoon | `#0277bd` (blue) |
| Sick Animal 1 — Fox | `#ff8f00` (amber) |
| Sick Animal 2 — Bunny | `#c62828` (red) |
| Sick Animal 3 — Raccoon | `#4527a0` (indigo) |
| Wall / Boundary | `#4e342e` (dark brown) |
| Grass / Floor | `#c8e6c9` (light green) |
