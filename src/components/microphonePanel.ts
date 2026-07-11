import * as Phaser from 'phaser'
import { promisifyDelayedCall } from '../promisifyThings'
import { createTextSmall } from '../ui'
import { applyAnchor, createAnchoredContainer } from '../layout'
import * as C from '../constants'
import * as T from '../types'

const SHOW_MICROPHONE_ERROR_FOR = 5000
const AUTO_TURN_OFF_PERIOD = 10000

export class MicrophonePanel {

  private icon: Phaser.GameObjects.Image
  private muteLine: Phaser.GameObjects.Line
  private microphonePanel: Phaser.GameObjects.Container
  private scene: T.HUDSceneLike
  private autoTurnOffTimeoutId: NodeJS.Timeout

  public constructor(scene: T.HUDSceneLike) {
    this.scene = scene
    this.autoTurnOffTimeoutId = null

    this.icon = scene.add.image(0, 0, C.ImageKeys.Microphone)
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, this.onClickMicrophone, this)

    const iconWidth = this.icon.width
    const iconHeight = this.icon.height
    this.muteLine = scene.add.line(0, 0, iconWidth, 0, 0, iconHeight, 0xff0000)
      .setOrigin(1, 1)
      .setLineWidth(3)

    const microphoneIconContainer = scene.add.container(0, 0, [this.icon, this.muteLine]).setScale(.75)

    this.microphonePanel = scene.add.container(0, 0, [microphoneIconContainer])
    this.layout()

    this.scene.game.events.on(C.SparklerGameEvents.MicrophoneError, this.onMicrophoneError, this)
    this.scene.game.events.on(C.SparklerGameEvents.GameStarted, this.onGameStarted, this)
    this.scene.game.events.on(C.SparklerGameEvents.GameEnded, this.onGameEnded, this)
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this)
  }

  private layout = (): void => {
    applyAnchor(this.scene, this.microphonePanel, {
      right: 'right-20',
      bottom: 'bottom-20'
    })
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

    const textLine1 = createTextSmall(this.scene, 'Failed to turn on microphone')
    const textLine2 = createTextSmall(this.scene, errorMessage)

    const errorPanel = createAnchoredContainer(
      this.scene,
      [textLine1, textLine2],
      { centerX: 'center', bottom: 'bottom-20' },
      20
    )

    await promisifyDelayedCall(this.scene, SHOW_MICROPHONE_ERROR_FOR)

    errorPanel.destroy(true)
    this.microphonePanel.setVisible(true)
    this.layout()
  }

  private onGameStarted(): void {
    clearTimeout(this.autoTurnOffTimeoutId)
    this.autoTurnOffTimeoutId = null
  }

  private onGameEnded(): void {
    clearTimeout(this.autoTurnOffTimeoutId)
    this.autoTurnOffTimeoutId = null

    const callback = () => {
      if (!this.muted) {
        this.becomeMuted()
      }
      this.autoTurnOffTimeoutId = null
    }

    this.autoTurnOffTimeoutId = setTimeout(callback, AUTO_TURN_OFF_PERIOD)
  }
}
