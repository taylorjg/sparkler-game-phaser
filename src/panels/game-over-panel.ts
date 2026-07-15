import * as Phaser from "phaser";
import { createTextBig } from "@app/ui/typography";
import { applyAnchor } from "@app/ui/layout";
import { SparklerGameEvents } from "@app/constants";

export class GameOverPanel {
  private gameOverPanel: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const text = createTextBig(scene, "GAME OVER");

    this.gameOverPanel = scene.add.container(0, 0, [text]);
    this.layout();
    this.gameOverPanel.setVisible(false);

    scene.game.events.on(
      SparklerGameEvents.GameStarted,
      this.onGameStarted,
      this
    );
    scene.game.events.on(SparklerGameEvents.GameEnded, this.onGameEnded, this);
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
  }

  private layout = (): void => {
    applyAnchor(this.scene, this.gameOverPanel, {
      centerX: "center",
      centerY: "center",
    });
  };

  private onGameStarted(): void {
    this.gameOverPanel.setVisible(false);
  }

  private onGameEnded(): void {
    this.gameOverPanel.setVisible(true);
  }
}
