import * as Phaser from "phaser";
import { isAgentMode } from "@app/agent/agent-controller";
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
const INACTIVE_ICON_ALPHA = 0.45;

const styleHudIcon = (icon: Phaser.GameObjects.Image): void => {
  icon
    .setDisplaySize(HUD_ICON_DISPLAY_SIZE, HUD_ICON_DISPLAY_SIZE)
    .setTint(HUD_ICON_COLOUR)
    .setTintMode(Phaser.TintModes.FILL);
};

export class AgentPanel {
  private icon: Phaser.GameObjects.Image;
  private agentPanel: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private agentEnabled: boolean;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.agentEnabled = isAgentMode();

    this.icon = scene.add
      .image(0, 0, ImageKeys.Agent)
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, this.onClickAgent, this);
    this.updateIconAppearance();

    this.agentPanel = scene.add.container(0, 0, [this.icon]);
    attachHudIconTooltip(this.icon, this.agentPanel, () =>
      this.agentEnabled ? "Turn off agent" : "Turn on agent"
    );
    this.layout();

    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
  }

  private layout = (): void => {
    applyAnchor(this.scene, this.agentPanel, {
      right: `right-${HUD_RIGHT_MARGIN}`,
      bottom: `bottom-${HUD_BOTTOM_MARGIN + HUD_ICON_DISPLAY_SIZE + HUD_ICON_GAP}`,
    });
  };

  private updateIconAppearance(): void {
    styleHudIcon(this.icon);
    this.icon.setAlpha(this.agentEnabled ? 1 : INACTIVE_ICON_ALPHA);
  }

  private onClickAgent(): void {
    if (this.agentEnabled) {
      this.disableAgent();
    } else {
      this.enableAgent();
    }
  }

  private enableAgent(): void {
    this.agentEnabled = true;
    this.updateIconAppearance();
    this.scene.game.events.emit(SparklerGameEvents.AgentOn);
  }

  private disableAgent(): void {
    this.agentEnabled = false;
    this.updateIconAppearance();
    this.scene.game.events.emit(SparklerGameEvents.AgentOff);
  }
}
