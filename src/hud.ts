import * as Phaser from 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import { SparklerGameEvents } from './constants'

const FONT_KEY = 'arcade'
const FONT_SIZE = 48
const FONT_COLOUR = 0x800080

export class HUDScene extends Phaser.Scene {

  private rexUI: RexUIPlugin
  private score: number
  private scoreText: Phaser.GameObjects.BitmapText
  private gameOverPanel: RexUIPlugin.Sizer

  public constructor() {
    super({
      key: 'HUD',
      active: true
    })
    this.score = 0
  }

  public preload() {
    this.load.bitmapFont(FONT_KEY, 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml')
  }

  public create() {
    this.game.events.on(SparklerGameEvents.GameStarted, this.onGameStarted, this)
    this.game.events.on(SparklerGameEvents.GameEnded, this.onGameEnded, this)
    this.game.events.on(SparklerGameEvents.ObstacleCleared, this.onObstacleCleared, this)

    this.scoreText = this.add.bitmapText(0, 0, FONT_KEY, '', FONT_SIZE).setTint(FONT_COLOUR)
    this.rexUI.add.sizer({
      orientation: 'horizontal',
      anchor: { left: 'left+20', top: 'top+20' }
    })
      .add(this.scoreText)
      .layout()

    this.gameOverPanel = this.rexUI.add.sizer({
      orientation: 'vertical',
      anchor: { centerX: 'center', centerY: 'center' },
      space: { item: 100 }
    })
      .add(this.add.bitmapText(0, 0, FONT_KEY, 'GAME OVER', FONT_SIZE).setTint(FONT_COLOUR))
      .add(this.add.bitmapText(0, 0, FONT_KEY, 'TAP TO RESTART', FONT_SIZE).setTint(FONT_COLOUR))
      .setVisible(false)
      .layout()

    this.updateScoreText()
  }

  private updateScoreText(): void {
    this.scoreText.setText(`${this.score}`)
  }

  private onGameStarted(): void {
    this.score = 0
    this.updateScoreText()
    this.gameOverPanel.setVisible(false)
  }

  private onGameEnded(): void {
    this.gameOverPanel.setVisible(true)
  }

  private onObstacleCleared(): void {
    this.score++
    this.updateScoreText()
  }
}
