import * as Phaser from 'phaser'
import { SparklerGameEvents } from './constants'

const SCROLL_X_SPEED = 5
const OBSTACLE_WIDTH = 80
const INITIAL_GAP_PERCENT = 30
const MIN_GAP_PERCENT = 5

export class GameScene extends Phaser.Scene {

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private started: Boolean
  private gameEnded: Boolean
  private ship: Phaser.GameObjects.Rectangle
  private sparkler: Phaser.GameObjects.Particles.ParticleEmitter
  private obstacles: Phaser.GameObjects.Polygon[]
  private gapPercent: number

  public constructor() {
    super('Game')
  }

  public preload() {
    this.load.atlas('flares', 'assets/particles/flares.png', 'assets/particles/flares.json')
    this.load.image('star', 'assets/particles/star_06.png')
  }

  public create() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.started = false
    this.gameEnded = false
    this.gapPercent = INITIAL_GAP_PERCENT

    const searchParams = new URLSearchParams(window.location.search)
    this.physics.world.drawDebug = searchParams.has('debug')

    const onResize = () => this.resize()
    const onOrientationChange = () => this.resize()

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onOrientationChange)

    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    this.ship = this.add.rectangle(windowWidth / 4, windowHeight * 0.9, 5, 5, 0xFFFFFF).setAngle(45)
    this.ship.scrollFactorX = 0
    this.physics.add.existing(this.ship)
    const body = this.ship.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.setSize(1, 1)
    body.moves = false

    this.sparkler = this.createSparklerParticleEmitter()

    this.obstacles = [] = this.makeObstaclePair(windowWidth * 0.75, this.gapPercent)
  }

  public update(_time: number, _delta: number) {

    if (this.gameEnded) return

    const body = this.ship.body as Phaser.Physics.Arcade.Body

    if (!this.started && this.cursors.up.isDown) {
      body.moves = true
      this.started = true
      this.sparkler.setGravityX(-1000)
      this.sparkler.setAngle({ min: 180 - 60, max: 180 + 60 })
    }

    const accelerationY = this.cursors.up.isDown ? -700 : 0
    body.setAccelerationY(accelerationY)
    if (this.started) {
      this.cameras.main.scrollX += SCROLL_X_SPEED
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
      return
    }

    const obstacleCleared = this.obstacles.some(obstacle => {
      const right = Phaser.Geom.Polygon.GetAABB(obstacle.geom).right
      const dx = shipX - right
      return dx >= 0 && dx <= SCROLL_X_SPEED * 0.9
    })
    if (obstacleCleared) {
      this.game.events.emit(SparklerGameEvents.ObstacleCleared)
      this.createBurstParticleEmitter(this.ship.x, this.ship.y)
    }

    const obstacleGone = this.obstacles.some(obstacle => {
      const right = Phaser.Geom.Polygon.GetAABB(obstacle.geom).right
      return right < this.cameras.main.scrollX
    })
    if (obstacleGone) {
      if (this.gapPercent > MIN_GAP_PERCENT) {
        this.gapPercent -= 2
      }
      const windowWidth = window.innerWidth
      this.obstacles = [] = this.makeObstaclePair(this.cameras.main.scrollX + windowWidth + OBSTACLE_WIDTH + 10, this.gapPercent)
    }
  }

  private createSparklerParticleEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
    const particles = this.add.particles('star')
    const emitter = particles.createEmitter({
      follow: this.ship,
      followOffset: { x: -3 },
      alpha: { start: 1, end: 0.5 },
      scale: { start: 0.1, end: 0.01 },
      blendMode: 'ADD',
      lifespan: 400,
      quantity: 2,
      speed: 200,
      frequency: 80,
      tint: [
        0xffffff,
        0x00ffff,
        0xff00ff,
        0x0000ff,
        0x90ee90
      ]
    })
    emitter.setScrollFactor(0)
    return emitter
  }

  private createBurstParticleEmitter(x: number, y: number): void {
    const particles = this.add.particles('star')
    const emitter = particles.createEmitter({
      accelerationX: 50,
      accelerationY: 50,
      angle: { start: 0, end: 360, steps: 8 },
      alpha: { start: 1, end: 0.5 },
      speed: { start: 800, end: 200, steps: 5 },
      scale: { start: 0.06, end: 0.01 },
      lifespan: 800,
      frequency: 80,
      quantity: 8,
      maxParticles: 5 * 8,
      tint: 0xffffff
    })
    emitter.setScrollFactor(0)
    emitter.explode(40, x, y)
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
