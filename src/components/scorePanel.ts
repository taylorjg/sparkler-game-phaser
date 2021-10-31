import * as Phaser from 'phaser'
import * as C from '../constants'
import * as T from '../types'

export class ScorePanel {

  private score: number
  private scoreText: Phaser.GameObjects.BitmapText

  public constructor(scene: T.SceneWithRexUI) {

    this.scoreText = scene.add.bitmapText(0, 0, C.FONT_KEY, '', C.FONT_SIZE)
      .setTint(C.FONT_COLOUR)

    scene.rexUI.add.sizer({
      orientation: 'horizontal',
      anchor: { left: 'left+20', top: 'top+20' }
    })
      .add(this.scoreText)
      .layout()

    this.score = 0
    this.updateScoreText()

    scene.game.events.on(C.SparklerGameEvents.GameStarted, this.onGameStarted, this)
    scene.game.events.on(C.SparklerGameEvents.ObstacleCleared, this.onObstacleCleared, this)
  }

  private updateScoreText(): void {
    this.scoreText.setText(this.score.toString())
  }

  private onGameStarted(): void {
    this.score = 0
    this.updateScoreText()
  }

  private onObstacleCleared(): void {
    this.score++
    this.updateScoreText()
  }
}
