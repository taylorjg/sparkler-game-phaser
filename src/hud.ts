import * as Phaser from 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import { ScorePanel } from './components/scorePanel'
import { promisifyDelayedCall } from './promisifyThings'
import * as C from './constants'

export class HUDScene extends Phaser.Scene {

  public rexUI: RexUIPlugin

  private gameOverPanel: RexUIPlugin.Sizer
  private microphoneIcon: Phaser.GameObjects.Image
  private microphonePanel: RexUIPlugin.Sizer
  private muteLine: Phaser.GameObjects.Line

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
    this.game.events.on(C.SparklerGameEvents.MicrophoneError, this.onMicrophoneError, this)

    new ScorePanel(this)

    this.gameOverPanel = this.rexUI.add.sizer({
      orientation: 'vertical',
      anchor: { centerX: 'center', centerY: 'center' },
      space: { item: 100 }
    })
      .add(this.add.bitmapText(0, 0, C.FONT_KEY, 'GAME OVER', C.FONT_SIZE).setTint(C.FONT_COLOUR))
      .add(this.add.bitmapText(0, 0, C.FONT_KEY, 'TAP TO RESTART', C.FONT_SIZE).setTint(C.FONT_COLOUR))
      .setVisible(false)
      .layout()

    this.microphoneIcon = this.add.image(0, 0, 'microphone')
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, this.onClickMicrophone, this)
    const microphoneIconWidth = this.microphoneIcon.width
    const microphoneIconHeight = this.microphoneIcon.height
    this.muteLine = this.add.line(0, 0, microphoneIconWidth, 0, 0, microphoneIconHeight, 0xff0000).setOrigin(1, 1).setLineWidth(3)
    const microphoneIconContainer = this.add.container(0, 0, [this.microphoneIcon, this.muteLine]).setScale(.75)
    this.microphonePanel = this.rexUI.add.sizer({
      orientation: 'horizontal',
      anchor: { right: 'right-20', bottom: 'bottom-20' }
    })
      .add(microphoneIconContainer)
      .layout()
  }

  private onClickMicrophone(): void {
    if (this.muteLine.visible) {
      this.muteLine.setVisible(false)
      this.game.events.emit(C.SparklerGameEvents.MicrophoneOn)
    } else {
      this.muteLine.setVisible(true)
      this.game.events.emit(C.SparklerGameEvents.MicrophoneOff)
    }
  }

  private async onMicrophoneError(errorMessage: string): Promise<void> {
    this.microphonePanel.setVisible(false)
    const text1 = this.add.bitmapText(0, 0, C.FONT_KEY, 'Failed to turn on microphone', C.FONT_SIZE_SMALL).setTint(C.FONT_COLOUR)
    const text2 = this.add.bitmapText(0, 0, C.FONT_KEY, errorMessage, C.FONT_SIZE_SMALL).setTint(C.FONT_COLOUR)
    const sizer = this.rexUI.add.sizer({
      orientation: 'vertical',
      anchor: { centerX: 'center', bottom: 'bottom-20' },
      space: { item: 20 }
    })
      .add(text1)
      .add(text2)
      .layout()
    await promisifyDelayedCall(this, 5 * 1000)
    sizer.removeAll(true)
    sizer.destroy(true)
  }

  private onGameStarted(): void {
    this.gameOverPanel.setVisible(false)
  }

  private onGameEnded(): void {
    this.gameOverPanel.setVisible(true)
    if (!this.muteLine.visible) {
      this.muteLine.setVisible(true)
      this.game.events.emit(C.SparklerGameEvents.MicrophoneOff)
    }
  }
}
