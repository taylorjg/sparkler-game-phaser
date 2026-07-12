import * as Phaser from "phaser";
import { GameScene } from "./scenes/game-scene";
import { HUDScene } from "./scenes/hud-scene";

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: "Sparkler Game",
  type: Phaser.WEBGL,
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
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
};

new Phaser.Game(gameConfig);
