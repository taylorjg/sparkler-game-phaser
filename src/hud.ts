import * as Phaser from 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import { ScorePanel } from './components/scorePanel'
import { MicrophonePanel } from './components/microphonePanel'
import { GameOverPanel } from './components/gameOverPanel'
import * as C from './constants'

export class HUDScene extends Phaser.Scene {

  public rexUI: RexUIPlugin

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
    new ScorePanel(this)
    new MicrophonePanel(this)
    new GameOverPanel(this)
  }
}
