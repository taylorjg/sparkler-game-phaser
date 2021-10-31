import * as Phaser from 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import { promisifyDelayedCall } from '../promisifyThings'
import * as C from '../constants'
import * as T from '../types'

export class MicrophonePanel {

  private icon: Phaser.GameObjects.Image
  private muteLine: Phaser.GameObjects.Line
  private microphonePanel: RexUIPlugin.Sizer
  private scene: T.SceneWithRexUI

  public constructor(scene: T.SceneWithRexUI) {

    this.scene = scene

    this.icon = scene.add.image(0, 0, 'microphone')
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, this.onClickMicrophone, this)

    const iconWidth = this.icon.width
    const iconHeight = this.icon.height
    this.muteLine = scene.add.line(0, 0, iconWidth, 0, 0, iconHeight, 0xff0000)
      .setOrigin(1, 1)
      .setLineWidth(3)

    const microphoneIconContainer = scene.add.container(0, 0, [this.icon, this.muteLine]).setScale(.75)
    this.microphonePanel = scene.rexUI.add.sizer({
      orientation: 'horizontal',
      anchor: { right: 'right-20', bottom: 'bottom-20' }
    })
      .add(microphoneIconContainer)
      .layout()

    this.scene.game.events.on(C.SparklerGameEvents.MicrophoneError, this.onMicrophoneError, this)
    this.scene.game.events.on(C.SparklerGameEvents.GameEnded, this.onGameEnded, this)
  }

  private get muted() {
    return this.muteLine.visible
  }

  private onClickMicrophone(): void {
    if (this.muted) {
      this.becomeUnmuted()
    } else {
      this.becomeMuted()
    }
  }

  private becomeUnmuted() {
    this.muteLine.setVisible(false)
    this.scene.game.events.emit(C.SparklerGameEvents.MicrophoneOn)
  }

  private becomeMuted() {
    this.muteLine.setVisible(true)
    this.scene.game.events.emit(C.SparklerGameEvents.MicrophoneOff)
  }

  private async onMicrophoneError(errorMessage: string): Promise<void> {
    this.microphonePanel.setVisible(false)
    const textLine1 = this.scene.add.bitmapText(0, 0, C.FONT_KEY, 'Failed to turn on microphone', C.FONT_SIZE_SMALL)
      .setTint(C.FONT_COLOUR)
    const textLine2 = this.scene.add.bitmapText(0, 0, C.FONT_KEY, errorMessage, C.FONT_SIZE_SMALL)
      .setTint(C.FONT_COLOUR)
    const sizer = this.scene.rexUI.add.sizer({
      orientation: 'vertical',
      anchor: { centerX: 'center', bottom: 'bottom-20' },
      space: { item: 20 }
    })
      .add(textLine1)
      .add(textLine2)
      .layout()
    await promisifyDelayedCall(this.scene, 5 * 1000)
    sizer.removeAll(true)
    sizer.destroy(true)
  }

  private onGameEnded(): void {
    if (!this.muted) {
      this.becomeMuted()
    }
  }
}
