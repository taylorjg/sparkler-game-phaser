import * as Phaser from 'phaser'
import * as C from './constants'
import * as T from './types'

const FONT_SIZE_BIG = 48
const FONT_SIZE_SMALL = 16
const FONT_COLOUR = 0x800080

export const createTextBig = (
  scene: T.SceneWithRexUI,
  text: string
): Phaser.GameObjects.BitmapText =>
  scene.add.bitmapText(0, 0, C.FontKeys.Arcade, text, FONT_SIZE_BIG).setTint(FONT_COLOUR)

export const createTextSmall = (
  scene: T.SceneWithRexUI,
  text: string
): Phaser.GameObjects.BitmapText =>
  scene.add.bitmapText(0, 0, C.FontKeys.Arcade, text, FONT_SIZE_SMALL).setTint(FONT_COLOUR)
