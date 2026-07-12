import * as Phaser from "phaser";
import { createTextSmall } from "@app/ui/ui";
import { applyAnchor } from "@app/ui/layout";
import { version } from "../../package.json";

const VERSION_TINT = 0x666666;
const VERSION_ALPHA = 0.6;

export class VersionPanel {
  private container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const versionText = createTextSmall(scene, version)
      .setTint(VERSION_TINT)
      .setAlpha(VERSION_ALPHA);
    this.container = scene.add.container(0, 0, [versionText]);
    this.layout();
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
  }

  private layout = (): void => {
    applyAnchor(this.scene, this.container, {
      left: "left+20",
      bottom: "bottom-20",
    });
  };
}
