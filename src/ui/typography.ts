import * as Phaser from "phaser";
import { FontKeys } from "@app/constants";

const FONT_COLOUR = "#ff55ff";

const getFontSizeBig = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const maxDimension = Math.max(windowWidth, windowHeight);
  return maxDimension <= 640 ? 24 : 48;
};

const getFontSizeSmall = () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const maxDimension = Math.max(windowWidth, windowHeight);
  return maxDimension <= 640 ? 8 : 16;
};

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

export const createTextBig = (
  scene: Phaser.Scene,
  text: string
): Phaser.GameObjects.Text => {
  const fontSize = getFontSizeBig();
  return scene.add.text(0, 0, text, createHudTextStyle(fontSize));
};

export const createTextSmall = (
  scene: Phaser.Scene,
  text: string
): Phaser.GameObjects.Text => {
  const fontSize = getFontSizeSmall();
  return scene.add.text(0, 0, text, createHudTextStyle(fontSize));
};
