import * as Phaser from "phaser";
import { createTextVerySmall, HUD_FONT_COLOUR } from "@app/ui/typography";
import { applyAnchor } from "@app/ui/layout";
import { version } from "../../package.json";

export class VersionPanel {
  private versionText: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.versionText = createTextVerySmall(
      scene,
      version,
      HUD_FONT_COLOUR
    ).setOrigin(0, 1);
    this.layout();
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
  }

  private layout = (): void => {
    applyAnchor(this.scene, this.versionText, {
      left: "left+20",
      bottom: "bottom-20",
    });
  };
}
