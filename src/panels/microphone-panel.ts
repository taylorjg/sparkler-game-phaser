import * as Phaser from "phaser";
import { promisifyDelayedCall } from "@app/helpers/promisify";
import { HUD_FONT_COLOUR, createTextSmall } from "@app/ui/typography";
import { applyAnchor, createAnchoredContainer } from "@app/ui/layout";
import { attachHudIconTooltip } from "@app/ui/hud-icon-tooltip";
import { ImageKeys, SparklerGameEvents } from "@app/constants";

const SHOW_MICROPHONE_ERROR_FOR = 5000;
const AUTO_TURN_OFF_PERIOD = 10000;
const MICROPHONE_ICON_DISPLAY_SIZE = 36;
const MICROPHONE_ICON_COLOUR =
  Phaser.Display.Color.HexStringToColor(HUD_FONT_COLOUR).color;
const DISABLED_ICON_ALPHA = 0.45;

const styleMicIcon = (icon: Phaser.GameObjects.Image): void => {
  icon
    .setDisplaySize(MICROPHONE_ICON_DISPLAY_SIZE, MICROPHONE_ICON_DISPLAY_SIZE)
    .setTint(MICROPHONE_ICON_COLOUR)
    .setTintMode(Phaser.TintModes.FILL);
};

export class MicrophonePanel {
  private icon: Phaser.GameObjects.Image;
  private microphonePanel: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private muted: boolean;
  private agentEnabled: boolean;
  private autoTurnOffTimeoutId: ReturnType<typeof setTimeout> | null;

  public constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.autoTurnOffTimeoutId = null;
    this.muted = true;
    this.agentEnabled = false;

    this.icon = scene.add
      .image(0, 0, ImageKeys.MicrophoneOff)
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, this.onClickMicrophone, this);
    styleMicIcon(this.icon);

    this.microphonePanel = scene.add.container(0, 0, [this.icon]);
    attachHudIconTooltip(this.icon, this.microphonePanel, () => {
      if (this.agentEnabled && this.muted) {
        return "Microphone unavailable while agent is on";
      }
      return this.muted ? "Turn on microphone" : "Turn off microphone";
    });
    this.updateIconAppearance();
    this.layout();

    this.scene.game.events.on(SparklerGameEvents.AgentOn, this.onAgentOn, this);
    this.scene.game.events.on(
      SparklerGameEvents.AgentOff,
      this.onAgentOff,
      this
    );
    this.scene.game.events.on(
      SparklerGameEvents.MicrophoneError,
      this.onMicrophoneError,
      this
    );
    this.scene.game.events.on(
      SparklerGameEvents.GameStarted,
      this.onGameStarted,
      this
    );
    this.scene.game.events.on(
      SparklerGameEvents.GameEnded,
      this.onGameEnded,
      this
    );
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
  }

  private layout = (): void => {
    applyAnchor(this.scene, this.microphonePanel, {
      right: "right-20",
      bottom: "bottom-20",
    });
  };

  private updateIconTexture(): void {
    this.icon.setTexture(
      this.muted ? ImageKeys.MicrophoneOff : ImageKeys.MicrophoneOn
    );
    styleMicIcon(this.icon);
  }

  private updateIconAppearance(): void {
    this.updateIconTexture();
    const disabled = this.agentEnabled && this.muted;
    this.icon.setAlpha(disabled ? DISABLED_ICON_ALPHA : 1);
  }

  private onClickMicrophone(): void {
    if (this.muted && this.agentEnabled) {
      return;
    }

    if (this.muted) {
      this.becomeUnmuted();
    } else {
      this.becomeMuted();
    }
  }

  private onAgentOn(): void {
    this.agentEnabled = true;
    if (!this.muted) {
      this.becomeMuted();
    } else {
      this.updateIconAppearance();
    }
  }

  private onAgentOff(): void {
    this.agentEnabled = false;
    this.updateIconAppearance();
  }

  private becomeUnmuted(): void {
    this.muted = false;
    this.updateIconAppearance();
    this.scene.game.events.emit(SparklerGameEvents.MicrophoneOn);
  }

  private becomeMuted(): void {
    this.muted = true;
    this.updateIconAppearance();
    this.scene.game.events.emit(SparklerGameEvents.MicrophoneOff);
  }

  private async onMicrophoneError(errorMessage: string): Promise<void> {
    this.microphonePanel.setVisible(false);

    const textLine1 = createTextSmall(
      this.scene,
      "Failed to turn on microphone"
    );
    const textLine2 = createTextSmall(this.scene, errorMessage);

    const errorPanel = createAnchoredContainer(
      this.scene,
      [textLine1, textLine2],
      { centerX: "center", bottom: "bottom-20" },
      20
    );

    await promisifyDelayedCall(this.scene, SHOW_MICROPHONE_ERROR_FOR);

    errorPanel.destroy(true);
    this.microphonePanel.setVisible(true);
    this.layout();
  }

  private onGameStarted(): void {
    if (this.autoTurnOffTimeoutId != null) {
      clearTimeout(this.autoTurnOffTimeoutId);
    }
    this.autoTurnOffTimeoutId = null;
  }

  private onGameEnded(): void {
    if (this.autoTurnOffTimeoutId != null) {
      clearTimeout(this.autoTurnOffTimeoutId);
    }
    this.autoTurnOffTimeoutId = null;

    const callback = () => {
      if (!this.muted) {
        this.becomeMuted();
      }
      this.autoTurnOffTimeoutId = null;
    };

    this.autoTurnOffTimeoutId = setTimeout(callback, AUTO_TURN_OFF_PERIOD);
  }
}
