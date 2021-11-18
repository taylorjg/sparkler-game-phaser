import * as Phaser from 'phaser'
import configureMicrophoneModule from './microphone.js'
import { ObstaclePair } from './components/obstaclePair'
import * as C from './constants'

// const SCROLL_X_SPEED = 8
const UPSTRUST = -1500
// const OBSTACLE_WIDTH = 80
const OBSTACLE_LINE_WIDTH = 2
const INITIAL_GAP_PERCENT = 30
const MIN_GAP_PERCENT = 10
const TAPPED_UPDATE_COUNT_RESET_THRESHOLD = 5
const NOISED_UPDATE_COUNT_RESET_THRESHOLD = 5

interface MicrophoneModule {
  microphoneOn: () => Promise<void>,
  microphoneOff: () => void
}

enum GameState {
  Waiting,
  Running
}

export class GameScene extends Phaser.Scene {

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private gameState: GameState
  private firstStart: boolean
  private tapped: boolean
  private tappedUpdateCount: number
  private noised: boolean
  private noisedUpdateCount: number
  private ship: Phaser.GameObjects.Rectangle
  private sparkler: Phaser.GameObjects.Particles.ParticleEmitter
  private obstaclePair: ObstaclePair
  private gapPercent: number
  private microphoneModule: MicrophoneModule
  private windowWidth: number
  private windowHeight: number

  public constructor() {
    super(C.SceneKeys.Game)
    const microphoneModuleConfig = {
      NOISE_LEVEL_THRESHOLD: 0.5,
      onNoiseLevelAboveThreshold: this.onMicrophoneStimulus.bind(this)
    }
    this.microphoneModule = configureMicrophoneModule(microphoneModuleConfig)
    this.windowWidth = window.innerWidth
    this.windowHeight = window.innerHeight
  }

  public preload() {
    this.load.image(C.ParticleKeys.Star, 'assets/particles/star_06.png')
  }

  public create() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.gameState = GameState.Waiting
    this.firstStart = true
    this.tapped = false
    this.tappedUpdateCount = 0
    this.noised = false
    this.noisedUpdateCount = 0
    this.gapPercent = INITIAL_GAP_PERCENT

    const searchParams = new URLSearchParams(window.location.search)
    this.physics.world.drawDebug = searchParams.has('debug')

    const onResize = () => this.resize()
    const onOrientationChange = () => this.resize()

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onOrientationChange)

    this.ship = this.add.rectangle(this.windowWidth * 0.15, this.windowHeight * 0.9, 5, 5, 0xFFFFFF).setAngle(45)
    this.ship.scrollFactorX = 0
    this.physics.add.existing(this.ship)
    const body = this.ship.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.setSize(1, 1)
    body.moves = false

    this.sparkler = this.createSparklerParticleEmitter()

    this.obstaclePair = new ObstaclePair(this, this.windowWidth * 0.85, this.gapPercent)

    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this)

    this.game.events.on(C.SparklerGameEvents.MicrophoneOn, this.onMicrophoneOn, this)
    this.game.events.on(C.SparklerGameEvents.MicrophoneOff, this.onMicrophoneOff, this)
  }

  public update(_time: number, _delta: number) {

    const body = this.ship.body as Phaser.Physics.Arcade.Body

    // One of the following:
    // - the UP ARROW key is pressed
    // - the screen has been clicked or tapped
    // - a certain level of sound has been picked up by the microphone
    const gotInputStimulus = this.cursors.up.isDown || this.tapped || this.noised

    if (this.gameState == GameState.Waiting && gotInputStimulus) {

      if (this.firstStart) {
        this.sparkler.setGravityX(-1000)
        this.sparkler.setAngle({ min: 180 - 60, max: 180 + 60 })
        this.firstStart = false
      }

      body.moves = true
      this.cameras.main.scrollX = 0
      console.log('[update]', 'this.windowHeight:', this.windowHeight)
      this.ship.y = this.windowHeight * 0.9
      this.gapPercent = INITIAL_GAP_PERCENT
      this.obstaclePair.destroy()
      this.obstaclePair = new ObstaclePair(this, this.windowWidth * 0.85, this.gapPercent)
      this.gameState = GameState.Running
      this.game.events.emit(C.SparklerGameEvents.GameStarted)
    }

    if (this.gameState == GameState.Running) {
      const accelerationY = gotInputStimulus ? UPSTRUST : 0
      body.setAccelerationY(accelerationY)
      this.cameras.main.scrollX += this.getSpeed()
      this.checkForCollision()
    }

    if (this.tapped) {
      if (this.tappedUpdateCount >= TAPPED_UPDATE_COUNT_RESET_THRESHOLD) {
        this.tapped = false
        this.tappedUpdateCount = 0
      } else {
        this.tappedUpdateCount++
      }
    }

    if (this.noised) {
      if (this.noisedUpdateCount >= NOISED_UPDATE_COUNT_RESET_THRESHOLD) {
        this.noised = false
        this.noisedUpdateCount = 0
      } else {
        this.noisedUpdateCount++
      }
    }
  }

  private onPointerDown() {
    this.tapped = true
  }

  private onMicrophoneStimulus(_maxValue: number) {
    this.noised = true
  }

  private async onMicrophoneOn(): Promise<void> {
    console.log('[onMicrophoneOn]')
    try {
      await this.microphoneModule.microphoneOn()
    } catch (error) {
      console.error('[onMicrophoneOn]', error.message)
      this.game.events.emit(C.SparklerGameEvents.MicrophoneError, error.message)
    }
  }

  private onMicrophoneOff(): void {
    console.log('[onMicrophoneOff]')
    this.microphoneModule.microphoneOff()
  }

  private checkForCollision(): void {
    const shipX = this.ship.x + this.cameras.main.scrollX
    const shipY = this.ship.y

    const obstacleCollidedWith = this.obstaclePair.contains(shipX, shipY)
    if (obstacleCollidedWith) {
      this.gameState = GameState.Waiting
      const body = this.ship.body as Phaser.Physics.Arcade.Body
      body.moves = false
      this.game.events.emit(C.SparklerGameEvents.GameEnded)
      return
    }

    const obstacleCleared = this.obstaclePair.rightSatisfies(right => {
      const dx = shipX - right
      return dx >= 0 && dx <= this.getSpeed() * 0.9
    })
    if (obstacleCleared) {
      this.game.events.emit(C.SparklerGameEvents.ObstacleCleared)
      this.createBurstParticleEmitter(this.ship.x, this.ship.y)
    }

    const obstacleGone = this.obstaclePair.rightSatisfies(right => right < this.cameras.main.scrollX)
    if (obstacleGone) {
      if (this.gapPercent > MIN_GAP_PERCENT) {
        this.gapPercent -= 2
      }
      const obstacleX = this.cameras.main.scrollX + this.windowWidth + this.obstaclePair.overallWidth
      this.obstaclePair.destroy()
      this.obstaclePair = new ObstaclePair(this, obstacleX, this.gapPercent)
    }
  }

  private createSparklerParticleEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
    const particles = this.add.particles(C.ParticleKeys.Star)
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
    const particles = this.add.particles(C.ParticleKeys.Star)
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

    const windowWidthNew = window.innerWidth
    const windowHeightNew = window.innerHeight

    const windowWidthOld = this.windowWidth
    const windowHeightOld = this.windowHeight

    if (windowWidthNew !== windowWidthOld || windowHeightNew !== windowHeightOld) {
      this.windowWidth = windowWidthNew
      this.windowHeight = windowHeightNew
      this.scale.resize(windowWidthNew, windowHeightNew)
      this.physics.world.setBounds(0, 0, windowWidthNew, windowHeightNew)
      const ratioX = windowWidthNew / windowWidthOld
      const ratioY = windowHeightNew / windowHeightOld
      console.log({ wo: windowWidthOld, ho: windowHeightOld, wn: windowWidthNew, hn: windowHeightNew, ratioX, ratioY })
      this.ship.x = this.ship.x * ratioX
      this.ship.y = this.ship.y * ratioY
      this.obstaclePair.resize(ratioX, ratioY)
    }
  }

  private getSpeed() {
    return Math.round(this.windowWidth / 150)
  }
}
