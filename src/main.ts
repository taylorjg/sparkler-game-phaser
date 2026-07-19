import * as Phaser from "phaser";
import { GameScene } from "@app/scenes/game-scene";
import { HUDScene } from "@app/scenes/hud-scene";
import { configureRunningCursorHide } from "@app/cursor-running-hide";

const scheduleScaleRefresh = (game: Phaser.Game): void => {
  requestAnimationFrame(() => {
    game.scale.getParentBounds();
    game.scale.refresh();
  });
};

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: "Sparkler Game",
  type: Phaser.WEBGL,
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER,
    expandParent: true,
    fullscreenTarget: "game",
  },
  backgroundColor: "#000000",
  scene: [GameScene, HUDScene],
  parent: "game",
  dom: {
    createContainer: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        x: 0,
        y: 300,
      },
      debug: true,
    },
  },
  callbacks: {
    postBoot: (game) => {
      configureRunningCursorHide(game);
      game.scale.on(Phaser.Scale.Events.ENTER_FULLSCREEN, () =>
        scheduleScaleRefresh(game)
      );
      game.scale.on(Phaser.Scale.Events.LEAVE_FULLSCREEN, () =>
        scheduleScaleRefresh(game)
      );
    },
  },
};

new Phaser.Game(gameConfig);
