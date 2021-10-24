import * as Phaser from 'phaser'
import { SparklerGameEvents } from './constants'

export class GameScene extends Phaser.Scene {

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private started: Boolean
  private gameEnded: Boolean
  private ship: Phaser.GameObjects.Rectangle
  private obstacles: Phaser.GameObjects.Polygon[]

  public constructor() {
    super('Game')
  }

  public create() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.started = false
    this.gameEnded = false

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
    this.ship.scrollFactorX = 0
    this.physics.add.existing(this.ship)
    const body = this.ship.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.moves = false

    const [p1, p2] = this.makeObstaclePair(350, 20)
    const [p3, p4] = this.makeObstaclePair(1000, 10)
    this.obstacles = []
    this.obstacles.push(p1, p2, p3, p4)
  }

  public update(_time: number, _delta: number) {

    if (this.gameEnded) return

    const body = this.ship.body as Phaser.Physics.Arcade.Body

    if (!this.started && this.cursors.up.isDown) {
      body.moves = true
      this.started = true
    }

    const accelerationY = this.cursors.up.isDown ? -700 : 0
    body.setAccelerationY(accelerationY)
    if (this.started) {
      this.cameras.main.scrollX += 2
    }

    this.checkForCollision()
  }

  private checkForCollision(): void {
    const shipX = this.ship.x + this.cameras.main.scrollX
    const shipY = this.ship.y
    const collision = this.obstacles.some(obstacle => obstacle.geom.contains(shipX, shipY))
    if (collision) {
      this.gameEnded = true
      const body = this.ship.body as Phaser.Physics.Arcade.Body
      body.moves = false
      this.game.events.emit(SparklerGameEvents.GameEnded)
    }
  }

  private resize(): void {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    this.scale.resize(windowWidth, windowHeight)
  }

  private makeObstaclePair(
    x: number,
    gapPercent: number
  ): [Phaser.GameObjects.Polygon, Phaser.GameObjects.Polygon] {

    const makeObstacle = (
      addPathDetails: (path: Phaser.Curves.Path) => void
    ): Phaser.GameObjects.Polygon => {
      const path = new Phaser.Curves.Path()
      addPathDetails(path)
      const points = path.getPoints()
      const polygon = this.add.polygon(0, 0, points)
      polygon.closePath = false
      polygon.setOrigin(0, 0)
      polygon.isStroked = true
      polygon.lineWidth = 2
      polygon.strokeColor = 0xFFFFFF
      return polygon
    }

    const OBSTACLE_WIDTH = 50
    const RADIUS = OBSTACLE_WIDTH / 2

    const windowHeight = window.innerHeight
    const gapHeight = windowHeight * gapPercent / 100
    const halfRemainingHeight = (windowHeight - gapHeight) / 2
    const centreOffsetRatio = Phaser.Math.FloatBetween(-0.5, 0.5)
    const upperHeight = (1 + centreOffsetRatio) * halfRemainingHeight
    const lowerHeight = (1 - centreOffsetRatio) * halfRemainingHeight

    const upperObstacle = makeObstacle((path: Phaser.Curves.Path): void => {
      path
        .moveTo(x, 0)
        .lineTo(x, upperHeight - RADIUS)
        .ellipseTo(RADIUS, RADIUS, 180, 0, true)
        .lineTo(x + OBSTACLE_WIDTH, 0)
    })

    const lowerObstacle = makeObstacle((path: Phaser.Curves.Path): void => {
      path
        .moveTo(x, windowHeight)
        .lineTo(x, windowHeight - lowerHeight + RADIUS)
        .ellipseTo(RADIUS, RADIUS, 180, 0, false)
        .lineTo(x + OBSTACLE_WIDTH, windowHeight)
    })

    return [upperObstacle, lowerObstacle]
  }
}
