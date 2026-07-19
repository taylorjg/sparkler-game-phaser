import * as Phaser from "phaser";
import { FontKeys } from "@app/constants";

export const HUD_FONT_COLOUR = "#ff55ff";
export const HUD_FONT_COLOUR_MUTED = "#cc66cc";

const FONT_COLOUR = HUD_FONT_COLOUR;

export const UI_SANS_FONT_FAMILY =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const getMaxDimension = () => Math.max(window.innerWidth, window.innerHeight);

const getResponsiveFontSize = (compact: number, spacious: number) =>
  getMaxDimension() <= 640 ? compact : spacious;

const getFontSizeBig = () => getResponsiveFontSize(20, 48);
const getFontSizeSmall = () => getResponsiveFontSize(10, 18);
const getFontSizeVerySmall = () => getResponsiveFontSize(8, 14);

const getFontPadding = (fontSize: number) => ({
  top: Math.max(2, Math.ceil(fontSize * 0.2)),
  bottom: Math.max(1, Math.ceil(fontSize * 0.05)),
});

const createHudTextStyle = (
  fontSize: number,
  color = FONT_COLOUR
): Phaser.Types.GameObjects.Text.TextStyle => ({
  fontFamily: FontKeys.VectorBattle,
  fontSize: `${fontSize}px`,
  color,
  padding: getFontPadding(fontSize),
});

const createUiSansTextStyle = (
  fontSize: number,
  color = HUD_FONT_COLOUR,
  withStroke = false
): Phaser.Types.GameObjects.Text.TextStyle => {
  const style: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: UI_SANS_FONT_FAMILY,
    fontSize: `${fontSize}px`,
    color,
    padding: getFontPadding(fontSize),
  };

  if (withStroke) {
    style.stroke = "#000000";
    style.strokeThickness = Math.max(2, Math.round(fontSize * 0.15));
  }

  return style;
};

export const createTextBig = (
  scene: Phaser.Scene,
  text: string
): Phaser.GameObjects.Text => {
  const fontSize = getFontSizeBig();
  return scene.add.text(0, 0, text, createHudTextStyle(fontSize));
};

export const createTextSmall = (
  scene: Phaser.Scene,
  text: string,
  color = FONT_COLOUR
): Phaser.GameObjects.Text => {
  const fontSize = getFontSizeSmall();
  return scene.add.text(0, 0, text, createHudTextStyle(fontSize, color));
};

export const createTextVerySmall = (
  scene: Phaser.Scene,
  text: string,
  color = HUD_FONT_COLOUR_MUTED
): Phaser.GameObjects.Text => {
  const fontSize = getFontSizeVerySmall();
  return scene.add.text(0, 0, text, createHudTextStyle(fontSize, color));
};

export const createHudIconTooltipText = (
  scene: Phaser.Scene,
  text: string
): Phaser.GameObjects.Text => {
  const fontSize = getResponsiveFontSize(14, 22);
  return scene.add.text(
    0,
    0,
    text,
    createUiSansTextStyle(fontSize, HUD_FONT_COLOUR, true)
  );
};

export const createVersionText = (
  scene: Phaser.Scene,
  text: string
): Phaser.GameObjects.Text => {
  const fontSize = getFontSizeVerySmall();
  return scene.add.text(
    0,
    0,
    text,
    createUiSansTextStyle(fontSize, HUD_FONT_COLOUR)
  );
};
