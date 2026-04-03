import { useEffect, useRef } from "react";
import type { GameState } from "../types";

export function useAudio(gameState: GameState): void {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!audioRef.current) {
    audioRef.current = new Audio(
      "/audio/_Whos on First_ Original 16-bit Chiptune.mp3",
    );
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
  }

  useEffect(() => {
    const audio = audioRef.current!;
    if (gameState === "PLAYING") {
      audio.play().catch(() => {});
    } else {
      audio.pause();
      if (gameState === "START") audio.currentTime = 0;
    }
  }, [gameState]);
}
