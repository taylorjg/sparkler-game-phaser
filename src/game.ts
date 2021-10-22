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

    this.makeObstaclePair(1000, 40)
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

  private makeObstaclePair(x: number, percent: number) {

    const windoHeight = window.innerHeight
    const ratio = Math.random() - 0.5
    const height = windoHeight * percent / 100
    const height1 = (1 + ratio) * height
    const height2 = (1 - ratio) * height

    const OBSTACLE_WIDTH = 80
    const RADIUS = OBSTACLE_WIDTH / 2

    const obstacle1 = this.add.path(0, 0)
    obstacle1.moveTo(x, 0)
    obstacle1.lineTo(x, height1 - RADIUS)
    obstacle1.ellipseTo(RADIUS, RADIUS, 180, 0, true)
    obstacle1.lineTo(x + OBSTACLE_WIDTH, 0)

    const obstacle2 = this.add.path(0, 0)
    obstacle2.moveTo(x, windoHeight)
    obstacle2.lineTo(x, windoHeight - height2 + RADIUS)
    obstacle2.ellipseTo(RADIUS, RADIUS, 180, 0, false)
    obstacle2.lineTo(x + OBSTACLE_WIDTH, windoHeight)

    const graphics = this.add.graphics()
    graphics.lineStyle(2, 0xFFFFFF)
    obstacle1.draw(graphics)
    obstacle2.draw(graphics)
  }
}
