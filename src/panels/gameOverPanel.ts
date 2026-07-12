import * as Phaser from "phaser";
import { createTextBig } from "@app/ui";
import { applyAnchor, layoutVertical } from "@app/layout";
import { SparklerGameEvents } from "@app/constants";

export class GameOverPanel {
  private gameOverPanel: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const textLine1 = createTextBig(scene, "GAME OVER");
    const textLine2 = createTextBig(scene, "TAP TO RESTART");

    this.gameOverPanel = scene.add.container(0, 0, [textLine1, textLine2]);
    layoutVertical([textLine1, textLine2], 100);
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
