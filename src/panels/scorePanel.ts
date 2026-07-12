import * as Phaser from "phaser";
import { createTextBig } from "@app/ui/ui";
import { applyAnchor } from "@app/ui/layout";
import { SparklerGameEvents } from "@app/constants";

export class ScorePanel {
  private score: number;
  private scoreText: Phaser.GameObjects.BitmapText;
  private container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scoreText = createTextBig(scene, "");
    this.container = scene.add.container(0, 0, [this.scoreText]);
    this.layout();

    this.score = 0;
    this.updateScoreText();

    scene.game.events.on(
      SparklerGameEvents.GameStarted,
      this.onGameStarted,
      this
    );
    scene.game.events.on(
      SparklerGameEvents.ObstacleCleared,
      this.onObstacleCleared,
      this
    );
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
  }

  private layout = (): void => {
    applyAnchor(this.scene, this.container, { left: "left+20", top: "top+20" });
  };

  private updateScoreText(): void {
    this.scoreText.setText(this.score.toString());
  }

  private onGameStarted(): void {
    this.score = 0;
    this.updateScoreText();
  }

  private onObstacleCleared(): void {
    this.score++;
    this.updateScoreText();
  }
}
