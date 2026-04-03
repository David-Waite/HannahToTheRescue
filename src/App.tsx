import { useState, useCallback, useEffect, useRef } from "react";
import { GRID_WIDTH, GRID_HEIGHT, TILE_SIZE } from "./constants";

const GAME_PX = GRID_WIDTH * TILE_SIZE; // 480
import { useInput } from "./hooks/useInput";
import { useGameLoop, spawnFood } from "./hooks/useGameLoop";
import { useAudio } from "./hooks/useAudio";
import GameBoard from "./components/GameBoard";
import HUD from "./components/HUD";
import type { Segment, Food, Direction, GameState, AnimalType } from "./types";
import "./App.css";

const INITIAL_HEAD: Segment = {
  x: Math.floor(GRID_WIDTH / 2),
  y: Math.floor(GRID_HEIGHT / 2),
  type: "head",
};

interface InitialState {
  snake: Segment[];
  food: Food;
  direction: Direction;
  score: number;
}

function getInitialState(): InitialState {
  const snake: Segment[] = [INITIAL_HEAD];
  return { snake, food: spawnFood(snake), direction: "RIGHT", score: 0 };
}

export default function App() {
  const init = getInitialState();

  const [snake, setSnake] = useState<Segment[]>(init.snake);
  const [food, setFood] = useState<Food | null>(init.food);
  const [direction, setDirection] = useState<Direction>(init.direction);
  const [gameState, setGameState] = useState<GameState>("START");
  const [score, setScore] = useState(0);
  const [animFrame, setAnimFrame] = useState(0);
  const [savedAnimals, setSavedAnimals] = useState<AnimalType[]>([]);

  const pendingDirRef = useRef<Direction>('RIGHT');

  const [scale, setScale] = useState(() => Math.min(1, window.innerWidth / GAME_PX));
  useEffect(() => {
    const update = () => setScale(Math.min(1, window.innerWidth / GAME_PX));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleStart = useCallback(() => {
    const s = getInitialState();
    setSnake(s.snake);
    setFood(s.food);
    setDirection(s.direction);
    pendingDirRef.current = s.direction;
    setScore(0);
    setSavedAnimals([]);
    setGameState("PLAYING");
  }, []);

  useEffect(() => {
    if (gameState !== "PLAYING") return;
    const id = setInterval(() => setAnimFrame((f) => (f === 0 ? 1 : 0)), 120);
    return () => clearInterval(id);
  }, [gameState]);

  useAudio(gameState);
  useInput(pendingDirRef, gameState);
  useGameLoop({
    snake,
    food,
    pendingDirRef,
    gameState,
    setSnake,
    setFood,
    setScore,
    setSavedAnimals,
    setGameState,
    setDirection,
  });

  return (
    <main className="app">
      <div className="game-wrapper" style={{ zoom: scale }}>
        <div className="score-bar">
          Animals Rescued: <strong>{score}</strong>
        </div>
        <div className="board-container">
          <GameBoard
            snake={snake}
            food={food}
            direction={direction}
            animFrame={animFrame}
          />
          <HUD
            gameState={gameState}
            score={score}
            savedAnimals={savedAnimals}
            onStart={handleStart}
            onRestart={handleStart}
          />
        </div>
      </div>
    </main>
  );
}
