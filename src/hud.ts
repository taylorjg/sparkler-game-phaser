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
  private muteLine: Phaser.GameObjects.Line

  public constructor() {
    super({
      key: 'HUD',
      active: true
    })
    this.score = 0
  }

  public preload() {
    this.load.bitmapFont(FONT_KEY, 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml')
    this.load.image('microphone', 'assets/icons/66-microphone@2x.png')
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

    const microphone = this.add.image(0, 0, 'microphone')
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, this.onClickMicrophone, this)
    const microphoneWidth = microphone.width
    const microphoneHeight = microphone.height
    this.muteLine = this.add.line(0, 0, microphoneWidth, 0, 0, microphoneHeight, 0xff0000).setOrigin(1, 1).setLineWidth(3)
    const microphoneIconContainer = this.add.container(0, 0, [microphone, this.muteLine]).setScale(.75)
    this.rexUI.add.sizer({
      orientation: 'horizontal',
      anchor: { right: 'right-20', bottom: 'bottom-20' }
    })
      .add(microphoneIconContainer)
      .layout()
  }

  private onClickMicrophone(): void {
    if (this.muteLine.visible) {
      this.muteLine.setVisible(false)
      this.game.events.emit(SparklerGameEvents.MicrophoneOn)
    } else {
      this.muteLine.setVisible(true)
      this.game.events.emit(SparklerGameEvents.MicrophoneOff)
    }
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
    if (!this.muteLine.visible) {
      this.muteLine.setVisible(true)
      this.game.events.emit(SparklerGameEvents.MicrophoneOff)
    }
  }

  private onObstacleCleared(): void {
    this.score++
    this.updateScoreText()
  }
}
