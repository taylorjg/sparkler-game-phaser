import * as Phaser from 'phaser'

export class GameScene extends Phaser.Scene {

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private ship: Phaser.GameObjects.Rectangle

  public constructor() {
    super('Game')
  }

  public create() {
    this.cursors = this.input.keyboard.createCursorKeys()

    const searchParams = new URLSearchParams(window.location.search)
    this.physics.world.drawDebug = searchParams.has('debug')

    const onResize = () => this.resize()
    const onOrientationChange = () => this.resize()

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onOrientationChange)

    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    const cx = windowWidth / 2
    const cy = windowHeight / 2

    this.ship = this.add.rectangle(cx, cy, 20, 20, 0xFF0000)
    this.physics.add.existing(this.ship)
  }

  public update(_time: number, _delta: number) {
    const body = this.ship.body as Phaser.Physics.Arcade.Body
    const accelerationY = this.cursors.up.isDown ? -600 : 0
    body.setAccelerationY(accelerationY)
  }

  private resize(): void {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    this.scale.resize(windowWidth, windowHeight)
  }
}
