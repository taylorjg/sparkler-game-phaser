import * as Phaser from 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import { ScorePanel } from './components/scorePanel'
import { MicrophonePanel } from './components/microphonePanel'
import * as C from './constants'

export class HUDScene extends Phaser.Scene {

  public rexUI: RexUIPlugin

  private gameOverPanel: RexUIPlugin.Sizer

  public constructor() {
    super({
      key: 'HUD',
      active: true
    })
  }

  public preload() {
    this.load.bitmapFont(C.FONT_KEY, 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml')
    this.load.image('microphone', 'assets/icons/66-microphone@2x.png')
  }

  public create() {
    this.game.events.on(C.SparklerGameEvents.GameStarted, this.onGameStarted, this)
    this.game.events.on(C.SparklerGameEvents.GameEnded, this.onGameEnded, this)

    new ScorePanel(this)
    new MicrophonePanel(this)

    this.gameOverPanel = this.rexUI.add.sizer({
      orientation: 'vertical',
      anchor: { centerX: 'center', centerY: 'center' },
      space: { item: 100 }
    })
      .add(this.add.bitmapText(0, 0, C.FONT_KEY, 'GAME OVER', C.FONT_SIZE).setTint(C.FONT_COLOUR))
      .add(this.add.bitmapText(0, 0, C.FONT_KEY, 'TAP TO RESTART', C.FONT_SIZE).setTint(C.FONT_COLOUR))
      .setVisible(false)
      .layout()
  }

  private onGameStarted(): void {
    this.gameOverPanel.setVisible(false)
  }

  private onGameEnded(): void {
    this.gameOverPanel.setVisible(true)
  }
}
