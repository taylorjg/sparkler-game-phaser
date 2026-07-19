import * as Phaser from "phaser";
import { SparklerGameEvents } from "@app/constants";

const CURSOR_HIDDEN_CLASS = "cursor-hidden";
const CURSOR_IDLE_MS = 3000;
const MOVEMENT_THRESHOLD_PX = 2;

const hideCursor = (game: Phaser.Game): void => {
  document.documentElement.classList.add(CURSOR_HIDDEN_CLASS);
  game.input.setDefaultCursor("none");
};

const showCursor = (game: Phaser.Game): void => {
  document.documentElement.classList.remove(CURSOR_HIDDEN_CLASS);
  game.input.setDefaultCursor("default");
};

export const configureRunningCursorHide = (game: Phaser.Game): (() => void) => {
  let running = false;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastX = Number.NaN;
  let lastY = Number.NaN;

  const clearHideTimeout = (): void => {
    if (hideTimeout != null) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  };

  const scheduleHide = (): void => {
    if (!running) {
      return;
    }
    clearHideTimeout();
    hideTimeout = setTimeout(() => {
      if (running) {
        hideCursor(game);
      }
      hideTimeout = null;
    }, CURSOR_IDLE_MS);
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!running) {
      return;
    }

    if (!Number.isNaN(lastX) && !Number.isNaN(lastY)) {
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      if (Math.hypot(deltaX, deltaY) < MOVEMENT_THRESHOLD_PX) {
        return;
      }
    }

    lastX = event.clientX;
    lastY = event.clientY;
    showCursor(game);
    scheduleHide();
  };

  const onGameStarted = (): void => {
    running = true;
    lastX = Number.NaN;
    lastY = Number.NaN;
    clearHideTimeout();
    hideCursor(game);
  };

  const onGameEnded = (): void => {
    running = false;
    clearHideTimeout();
    showCursor(game);
  };

  document.addEventListener("pointermove", onPointerMove);
  game.events.on(SparklerGameEvents.GameStarted, onGameStarted);
  game.events.on(SparklerGameEvents.GameEnded, onGameEnded);

  return () => {
    document.removeEventListener("pointermove", onPointerMove);
    game.events.off(SparklerGameEvents.GameStarted, onGameStarted);
    game.events.off(SparklerGameEvents.GameEnded, onGameEnded);
    running = false;
    clearHideTimeout();
    showCursor(game);
  };
};
