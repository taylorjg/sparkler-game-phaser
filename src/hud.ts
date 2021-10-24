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
  private scorePanel: RexUIPlugin.Sizer
  private gameOverPanel: RexUIPlugin.Sizer

  public constructor() {
    super({
      key: 'HUD',
      active: true
    })
  }

  public create() {
    this.game.events.on(SparklerGameEvents.ObstacleCleared, this.onObstacleCleared, this)
    this.game.events.on(SparklerGameEvents.GameEnded, this.onGameEnded, this)

    this.scorePanel = this.rexUI.add.sizer({
      orientation: 'horizontal',
      anchor: { left: 'left+20', top: 'top+20' }
    })
      .add(this.add.text(0, 0, '0', TEXT_STYLE))
      .layout()

    this.gameOverPanel = this.rexUI.add.sizer({
      orientation: 'horizontal',
      anchor: { centerX: 'center', centerY: 'center' }
    })
      .add(this.add.text(0, 0, 'GAME OVER', TEXT_STYLE))
      .setVisible(false)
      .layout()
  }

  private onObstacleCleared() {
    console.log('[HUDScene#onObstacleCleared]')
  }

  private onGameEnded() {
    console.log('[HUDScene#onGameEnded]')
    this.gameOverPanel.setVisible(true)
  }
}
