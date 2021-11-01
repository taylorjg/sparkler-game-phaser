import * as Phaser from 'phaser'
import { createTextBig } from '../ui'
import * as C from '../constants'
import * as T from '../types'

export class ScorePanel {

  private score: number
  private scoreText: Phaser.GameObjects.BitmapText

  public constructor(scene: T.SceneWithRexUI) {

    this.scoreText = createTextBig(scene, '')

    scene.rexUI.add.sizer({
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
