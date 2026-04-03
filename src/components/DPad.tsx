import type { Direction } from "../types";
import styles from "./DPad.module.css";

interface DPadProps {
  onDirection: (dir: Direction) => void;
  active: boolean;
}

export default function DPad({ onDirection, active }: DPadProps) {
  function press(dir: Direction) {
    return (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      onDirection(dir);
    };
  }

  return (
    <div className={`${styles.dpad} ${!active ? styles.inactive : ""}`}>
      <div className={styles.row}>
        <button className={`${styles.btn} ${styles.up}`}    onMouseDown={press("UP")}    onTouchStart={press("UP")}>▲</button>
      </div>
      <div className={styles.row}>
        <button className={`${styles.btn} ${styles.left}`}  onMouseDown={press("LEFT")}  onTouchStart={press("LEFT")}>◄</button>
        <div className={styles.center} />
        <button className={`${styles.btn} ${styles.right}`} onMouseDown={press("RIGHT")} onTouchStart={press("RIGHT")}>►</button>
      </div>
      <div className={styles.row}>
        <button className={`${styles.btn} ${styles.down}`}  onMouseDown={press("DOWN")}  onTouchStart={press("DOWN")}>▼</button>
      </div>
    </div>
  );
}
