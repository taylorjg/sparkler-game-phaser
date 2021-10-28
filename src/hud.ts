import * as Phaser from 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import { SparklerGameEvents } from './constants'

const TEXT_STYLE = {
  fontFamily: 'VectorBattle',
  fontSize: '4rem',
  fontStyle: 'bold',
  color: 'purple'
}

export class HUDScene extends Phaser.Scene {

  private rexUI: RexUIPlugin
  private score: number
  private scoreText: Phaser.GameObjects.Text
  private gameOverPanel: RexUIPlugin.Sizer

  public constructor() {
    super({
      key: 'HUD',
      active: true
    })
    this.score = 0
  }

  public create() {
    this.game.events.on(SparklerGameEvents.GameStarted, this.onGameStarted, this)
    this.game.events.on(SparklerGameEvents.GameEnded, this.onGameEnded, this)
    this.game.events.on(SparklerGameEvents.ObstacleCleared, this.onObstacleCleared, this)

    this.scoreText = this.add.text(0, 0, '', TEXT_STYLE)
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
      .add(this.add.text(0, 0, 'GAME OVER', TEXT_STYLE))
      .add(this.add.text(0, 0, 'TAP TO RESTART', TEXT_STYLE))
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
