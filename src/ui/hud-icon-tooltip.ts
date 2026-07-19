import * as Phaser from "phaser";
import { createHudIconTooltipText } from "@app/ui/typography";

const TOOLTIP_OFFSET_X = 40;

export const attachHudIconTooltip = (
  icon: Phaser.GameObjects.Image,
  container: Phaser.GameObjects.Container,
  getText: () => string
): Phaser.GameObjects.Text => {
  const tooltip = createHudIconTooltipText(container.scene, getText());
  tooltip.setOrigin(1, 1);
  tooltip.setPosition(icon.x - TOOLTIP_OFFSET_X, icon.y);
  tooltip.setVisible(false);
  container.add(tooltip);

  icon.on(Phaser.Input.Events.POINTER_OVER, () => {
    tooltip.setText(getText());
    tooltip.setVisible(true);
  });
  icon.on(Phaser.Input.Events.POINTER_OUT, () => {
    tooltip.setVisible(false);
  });

  return tooltip;
};
