import * as Phaser from "phaser";
import { ScorePanel } from "@app/panels/score-panel";
import { MicrophonePanel } from "@app/panels/microphone-panel";
import { GameOverPanel } from "@app/panels/gameover-panel";
import { VersionPanel } from "@app/panels/version-panel";
import { FontKeys, ImageKeys, SceneKeys } from "@app/constants";

export class HUDScene extends Phaser.Scene {
  public constructor() {
    super({
      key: SceneKeys.HUD,
      active: true,
    });
  }

  public preload() {
    this.load.font(
      FontKeys.VectorBattle,
      "assets/fonts/VectorBattle.ttf",
      "truetype"
    );
    this.load.image(ImageKeys.Microphone, "assets/icons/66-microphone@2x.png");
  }

  public create() {
    new ScorePanel(this);
    new MicrophonePanel(this);
    new GameOverPanel(this);
    new VersionPanel(this);
  }
}
