import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import { createTextBig } from '../ui'
import * as C from '../constants'
import * as T from '../types'

export class GameOverPanel {

  private gameOverPanel: RexUIPlugin.Sizer

  public constructor(scene: T.SceneWithRexUI) {

    const textLine1 = createTextBig(scene, 'GAME OVER')
    const textLine2 = createTextBig(scene, 'TAP TO RESTART')

    this.gameOverPanel = scene.rexUI.add.sizer({
      orientation: 'vertical',
      anchor: { centerX: 'center', centerY: 'center' },
      space: { item: 100 }
    })
      .add(textLine1)
      .add(textLine2)
      .setVisible(false)
      .layout()

    scene.game.events.on(C.SparklerGameEvents.GameStarted, this.onGameStarted, this)
    scene.game.events.on(C.SparklerGameEvents.GameEnded, this.onGameEnded, this)
  }

  private onGameStarted(): void {
    this.gameOverPanel.setVisible(false)
  }

  private onGameEnded(): void {
    this.gameOverPanel.setVisible(true)
  }
}
