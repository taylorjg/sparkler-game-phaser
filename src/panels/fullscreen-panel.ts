import * as Phaser from "phaser";
import { HUD_FONT_COLOUR } from "@app/ui/typography";
import { applyAnchor } from "@app/ui/layout";
import { attachHudIconTooltip } from "@app/ui/hud-icon-tooltip";
import { ImageKeys, SparklerGameEvents } from "@app/constants";

const HUD_ICON_DISPLAY_SIZE = 36;
const HUD_RIGHT_MARGIN = 20;
const HUD_BOTTOM_MARGIN = 20;
const HUD_ICON_GAP = 12;
const HUD_ICON_COLOUR =
  Phaser.Display.Color.HexStringToColor(HUD_FONT_COLOUR).color;

const styleHudIcon = (icon: Phaser.GameObjects.Image): void => {
  icon
    .setDisplaySize(HUD_ICON_DISPLAY_SIZE, HUD_ICON_DISPLAY_SIZE)
    .setTint(HUD_ICON_COLOUR)
    .setTintMode(Phaser.TintModes.FILL);
};

export class FullscreenPanel {
  private icon: Phaser.GameObjects.Image;
  private fullscreenPanel: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private isFullscreen: boolean;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isFullscreen = scene.scale.isFullscreen;

    this.icon = scene.add
      .image(0, 0, ImageKeys.FullscreenEnter)
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, this.onClickFullscreen, this);
    this.updateIconTexture();

    this.fullscreenPanel = scene.add.container(0, 0, [this.icon]);
    attachHudIconTooltip(this.icon, this.fullscreenPanel, () =>
      this.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
    );
    this.layout();

    scene.game.events.on(
      SparklerGameEvents.GameStarted,
      this.onGameStarted,
      this
    );
    scene.game.events.on(SparklerGameEvents.GameEnded, this.onGameEnded, this);
    scene.scale.on(
      Phaser.Scale.Events.ENTER_FULLSCREEN,
      this.onEnterFullscreen,
      this
    );
    scene.scale.on(
      Phaser.Scale.Events.LEAVE_FULLSCREEN,
      this.onLeaveFullscreen,
      this
    );
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
  }

  private layout = (): void => {
    applyAnchor(this.scene, this.fullscreenPanel, {
      right: `right-${HUD_RIGHT_MARGIN}`,
      bottom: `bottom-${
        HUD_BOTTOM_MARGIN + 2 * (HUD_ICON_DISPLAY_SIZE + HUD_ICON_GAP)
      }`,
    });
  };

  private updateIconTexture(): void {
    this.icon.setTexture(
      this.isFullscreen ? ImageKeys.FullscreenExit : ImageKeys.FullscreenEnter
    );
    styleHudIcon(this.icon);
  }

  private onClickFullscreen(): void {
    this.scene.scale.toggleFullscreen();
  }

  private onGameStarted(): void {
    this.fullscreenPanel.setVisible(false);
  }

  private onGameEnded(): void {
    this.fullscreenPanel.setVisible(true);
  }

  private onEnterFullscreen(): void {
    this.isFullscreen = true;
    this.updateIconTexture();
  }

  private onLeaveFullscreen(): void {
    this.isFullscreen = false;
    this.updateIconTexture();
  }
}
