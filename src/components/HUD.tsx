import ConfettiBoom from "react-confetti-boom";
import type { GameState, AnimalType } from "../types";
import styles from "./HUD.module.css";

interface HUDProps {
  score: number;
  gameState: GameState;
  savedAnimals: AnimalType[];
  onStart: () => void;
  onRestart: () => void;
}

const ANIMAL_SPRITE: Record<AnimalType, string> = {
  animal1: "url('/sprites/sickAnimals/animal1.png')",
  animal2: "url('/sprites/sickAnimals/animal2.png')",
  animal3: "url('/sprites/sickAnimals/animal3.png')",
};

export default function HUD({
  score,
  gameState,
  savedAnimals,
  onStart,
  onRestart,
}: HUDProps) {
  if (gameState === "PLAYING") return null;

  return (
    <div className={styles.overlay}>
      {gameState === "START" && (
        <>
          <div className={styles.box}>
            <h1 className={styles.title}>
              Hannah to the{" "}
              <div className={styles.titleAccent}>
                Rescue! <span className={styles.splash}>Happy Birthday!</span>
              </div>
            </h1>
          </div>

          <div className={styles.spritesRow}>
            <div className={`${styles.displaySprite} ${styles.bean}`} />
            <div className={styles.hannahSprite} />
            <div className={`${styles.displaySprite} ${styles.nova}`} />
          </div>

          <p className={styles.subtitle}>Help Hannah rescue sick animals!</p>
          <p className={`${styles.controls} ${styles.controlsDesktop}`}>
            Arrow keys or WASD to move
          </p>
          <p className={`${styles.controls} ${styles.controlsMobile}`}>
            Swipe to move
          </p>
          <button className={styles.btn} onClick={onStart}>
            Start
          </button>
        </>
      )}

      {gameState === "GAME_OVER" && (
        <>
          <ConfettiBoom mode="boom" particleCount={80} shapeSize={12} />
          <div className={styles.box}>
            <h1 className={styles.title}>
              Hooray! You saved{" "}
              <span className={styles.titleAccent}>{score}</span> animal
              {score !== 1 ? "s" : ""}!
            </h1>
          </div>

          <div className={styles.savedScroll}>
            {savedAnimals.length === 0 ? (
              <p className={styles.noAnimals}>No animals rescued this time…</p>
            ) : (
              savedAnimals.map((type, i) => (
                <div
                  key={i}
                  className={styles.savedAnimal}
                  style={{ backgroundImage: ANIMAL_SPRITE[type] }}
                />
              ))
            )}
          </div>

          <button className={styles.btn} onClick={onRestart}>
            Try Again
          </button>
        </>
      )}
    </div>
  );
}
