import * as Phaser from "phaser";
import { FontKeys } from "@app/constants";

const FONT_COLOUR = 0x800080;

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

export const createTextBig = (
  scene: Phaser.Scene,
  text: string
): Phaser.GameObjects.BitmapText => {
  const fontSize = getFontSizeBig();
  return scene.add
    .bitmapText(0, 0, FontKeys.Arcade, text, fontSize)
    .setTint(FONT_COLOUR);
};

export const createTextSmall = (
  scene: Phaser.Scene,
  text: string
): Phaser.GameObjects.BitmapText => {
  const fontSize = getFontSizeSmall();
  return scene.add
    .bitmapText(0, 0, FontKeys.Arcade, text, fontSize)
    .setTint(FONT_COLOUR);
};
