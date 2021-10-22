import * as Phaser from 'phaser'

export class GameScene extends Phaser.Scene {

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private started: Boolean
  private ship: Phaser.GameObjects.Rectangle

  public constructor() {
    super('Game')
  }

  public create() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.started = false

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
    const body = this.ship.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.moves = false

    this.makeObstaclePair(1000, 10)
  }

  public update(_time: number, _delta: number) {
    const body = this.ship.body as Phaser.Physics.Arcade.Body
    if (!this.started && this.cursors.up.isDown) {
      body.moves = true
      this.started = true
    }
    const accelerationY = this.cursors.up.isDown ? -700 : 0
    body.setAccelerationY(accelerationY)
  }

  private resize(): void {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    this.scale.resize(windowWidth, windowHeight)
  }

  private makeObstaclePair(x: number, gapPercent: number) {

    const windowHeight = window.innerHeight
    const gapHeight = windowHeight * gapPercent / 100
    const remainingHeight = windowHeight - gapHeight
    const ratio = Phaser.Math.FloatBetween(-0.5, 0.5)
    const upperHeight = (1 + ratio) * remainingHeight / 2
    const lowerHeight = (1 - ratio) * remainingHeight / 2

    const OBSTACLE_WIDTH = 50
    const RADIUS = OBSTACLE_WIDTH / 2

    const upperObstaclePath = this.add.path(0, 0)
    upperObstaclePath.moveTo(x, 0)
    upperObstaclePath.lineTo(x, upperHeight - RADIUS)
    upperObstaclePath.ellipseTo(RADIUS, RADIUS, 180, 0, true)
    upperObstaclePath.lineTo(x + OBSTACLE_WIDTH, 0)

    const lowerObstaclePath = this.add.path(0, 0)
    lowerObstaclePath.moveTo(x, windowHeight)
    lowerObstaclePath.lineTo(x, windowHeight - lowerHeight + RADIUS)
    lowerObstaclePath.ellipseTo(RADIUS, RADIUS, 180, 0, false)
    lowerObstaclePath.lineTo(x + OBSTACLE_WIDTH, windowHeight)

    const graphics = this.add.graphics()
    graphics.lineStyle(2, 0xFFFFFF)
    upperObstaclePath.draw(graphics)
    lowerObstaclePath.draw(graphics)
  }
}
