import * as Phaser from "phaser";
import { ScorePanel } from "@app/panels/scorePanel";
import { MicrophonePanel } from "@app/panels/microphonePanel";
import { GameOverPanel } from "@app/panels/gameOverPanel";
import { FontKeys, ImageKeys, SceneKeys } from "./constants";

export class HUDScene extends Phaser.Scene {
  public constructor() {
    super({
      key: SceneKeys.HUD,
      active: true,
    });
  }

  public preload() {
    this.load.bitmapFont(
      FontKeys.Arcade,
      "assets/fonts/arcade.png",
      "assets/fonts/arcade.xml"
    );
    this.load.image(ImageKeys.Microphone, "assets/icons/66-microphone@2x.png");
  }

  public create() {
    new ScorePanel(this);
    new MicrophonePanel(this);
    new GameOverPanel(this);
  }
}
