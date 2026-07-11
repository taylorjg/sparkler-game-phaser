import * as Phaser from "phaser";
import { GameScene } from "./game";
import { HUDScene } from "./hud";
import { version } from "../package.json";

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: "Sparkler Game",
  type: Phaser.WEBGL,
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
    mode: Phaser.Scale.NONE,
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

const setVersion = () => {
  document.querySelector("#version").innerHTML = version;
};

setVersion();
new Phaser.Game(gameConfig);
