import * as Phaser from "phaser";
import { createTextBig } from "@app/ui/typography";
import { applyAnchor } from "@app/ui/layout";
import { SparklerGameEvents } from "@app/constants";

export class HighScorePanel {
  private score: number;
  private highScore: number;
  private highScoreText: Phaser.GameObjects.Text;
  private container: Phaser.GameObjects.Container;
  private throbTween: Phaser.Tweens.Tween | null;
  private scene: Phaser.Scene;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.throbTween = null;
    this.highScoreText = createTextBig(scene, "");
    this.container = scene.add.container(0, 0, [this.highScoreText]);
    this.layout();
    this.container.setVisible(false);

    this.score = 0;
    this.highScore = 0;
    this.updateHighScoreText();

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
    scene.game.events.on(SparklerGameEvents.GameEnded, this.onGameEnded, this);
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
  }

  private layoutTextInContainer(): void {
    this.highScoreText.setOrigin(0.5, 0.5);
    this.highScoreText.setPosition(
      this.highScoreText.displayWidth / 2,
      this.highScoreText.displayHeight / 2
    );
  }

  private layout = (): void => {
    this.layoutTextInContainer();
    applyAnchor(this.scene, this.container, {
      right: "right-20",
      top: "top+20",
    });
  };

  private updateHighScoreText(): void {
    this.highScoreText.setText(`High: ${this.highScore}`);
    this.layout();
  }

  private playThrob(): void {
    if (this.throbTween != null) {
      this.throbTween.stop();
      this.throbTween = null;
    }

    this.highScoreText.setScale(1);

    this.throbTween = this.scene.tweens.add({
      targets: this.highScoreText,
      scale: 1.05,
      duration: 200,
      yoyo: true,
      repeat: 1,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.highScoreText.setScale(1);
        this.throbTween = null;
      },
    });
  }

  private onGameStarted(): void {
    this.score = 0;
  }

  private onObstacleCleared(): void {
    this.score++;
  }

  private onGameEnded(): void {
    const isNewHighScore = this.score > this.highScore;
    if (isNewHighScore) {
      this.highScore = this.score;
      this.updateHighScoreText();
    }
    this.container.setVisible(this.highScore > 0);
    if (isNewHighScore) {
      this.playThrob();
    }
  }
}
