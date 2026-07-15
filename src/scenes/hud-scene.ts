import * as Phaser from "phaser";
import { CurrentScorePanel } from "@app/panels/current-score-panel";
import { HighScorePanel } from "@app/panels/high-score-panel";
import { MicrophonePanel } from "@app/panels/microphone-panel";
import { GameOverPanel } from "@app/panels/game-over-panel";
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
    this.load.image(
      ImageKeys.MicrophoneOn,
      "assets/icons/microphone-solid.png"
    );
    this.load.image(
      ImageKeys.MicrophoneOff,
      "assets/icons/microphone-slash-solid.png"
    );
  }

  public create() {
    new CurrentScorePanel(this);
    new HighScorePanel(this);
    new MicrophonePanel(this);
    new GameOverPanel(this);
    new VersionPanel(this);
  }
}
