import * as Phaser from "phaser";
import configureMicrophoneModule from "@app/audio/microphone";
import { buildAgentObservation } from "@app/agent/agent-observation";
import {
  AGENT_POLICY_KEY,
  AGENT_POLICY_PATH,
  isAgentMode,
  loadAgentPolicyFromCache,
} from "@app/agent/agent-controller";
import type { AgentPolicy } from "@app/agent/agent-policy";
import type {
  AgentObservationContext,
  ObstacleGapInfo,
} from "@app/agent/types";
import { ParticleKeys, SceneKeys, SparklerGameEvents } from "@app/constants";
import {
  getObstacleWidth,
  getScrollDistance,
  INITIAL_GAP_PERCENT,
  INITIAL_OBSTACLE_X_RATIO,
  MIN_GAP_PERCENT,
  NOISE_STIMULUS_DURATION_MS,
  OBSTACLE_LINE_WIDTH,
  SHIP_X_RATIO,
  SHIP_Y_RATIO,
  TAP_STIMULUS_DURATION_MS,
  UP_THRUST,
  MAX_DELTA_MS,
} from "@app/game/tuning";

enum GameState {
  Waiting,
  Running,
}

export class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private gameState!: GameState;
  private firstStart!: boolean;
  private tapped!: boolean;
  private tappedRemainingMs!: number;
  private noised!: boolean;
  private noisedRemainingMs!: number;
  private ship!: Phaser.GameObjects.Rectangle;
  private sparkler!: Phaser.GameObjects.Particles.ParticleEmitter;
  private obstacles!: Phaser.GameObjects.Polygon[];
  private obstacleGap!: ObstacleGapInfo;
  private gapPercent!: number;
  private obstaclePairCleared!: boolean;
  private runningElapsedMs!: number;
  private agentMode!: boolean;
  private agentPolicy: AgentPolicy | null = null;
  private microphoneModule: ReturnType<typeof configureMicrophoneModule>;

  public constructor() {
    super(SceneKeys.Game);
    const microphoneModuleConfig = {
      NOISE_LEVEL_THRESHOLD: 0.5,
      onNoiseLevelAboveThreshold: this.onMicrophoneStimulus.bind(this),
    };
    this.microphoneModule = configureMicrophoneModule(microphoneModuleConfig);
  }

  public preload() {
    this.load.image(ParticleKeys.Star, "assets/particles/star_06.png");
    this.agentMode = isAgentMode();
    if (this.agentMode) {
      this.load.json(AGENT_POLICY_KEY, AGENT_POLICY_PATH);
    }
  }

  public create() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.gameState = GameState.Waiting;
    this.firstStart = true;
    this.tapped = false;
    this.tappedRemainingMs = 0;
    this.noised = false;
    this.noisedRemainingMs = 0;
    this.gapPercent = INITIAL_GAP_PERCENT;
    this.obstaclePairCleared = false;
    this.runningElapsedMs = 0;
    this.agentPolicy = this.agentMode
      ? loadAgentPolicyFromCache(this.cache)
      : null;

    const searchParams = new URLSearchParams(window.location.search);
    this.physics.world.drawDebug = searchParams.has("debug");

    const width = this.scale.width;
    const height = this.scale.height;

    this.ship = this.add
      .rectangle(width * SHIP_X_RATIO, height * SHIP_Y_RATIO, 5, 5, 0xffffff)
      .setAngle(45);
    this.ship.scrollFactorX = 0;
    this.physics.add.existing(this.ship);
    const body = this.ship.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(1, 1);
    body.moves = false;

    this.sparkler = this.createSparklerParticleEmitter();

    this.obstacles = this.makeObstaclePair(
      width * INITIAL_OBSTACLE_X_RATIO,
      this.gapPercent
    );

    if (!this.agentMode) {
      this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    }

    this.game.events.on(
      SparklerGameEvents.MicrophoneOn,
      this.onMicrophoneOn,
      this
    );
    this.game.events.on(
      SparklerGameEvents.MicrophoneOff,
      this.onMicrophoneOff,
      this
    );

    this.scale.on(Phaser.Scale.Events.RESIZE, this.relayoutWaitingScene, this);
  }

  public getAgentObservationContext(): AgentObservationContext {
    const body = this.ship.body as Phaser.Physics.Arcade.Body;
    return {
      shipY: this.ship.y,
      velocityY: body.velocity.y,
      viewportWidth: this.scale.width,
      viewportHeight: this.scale.height,
      scrollX: this.cameras.main.scrollX,
      shipScreenX: this.ship.x,
      runningElapsedMs: this.runningElapsedMs,
      thrustActive: this.tapped || this.noised,
      obstacle: this.obstacleGap,
    };
  }

  private relayoutWaitingScene = (): void => {
    if (this.gameState !== GameState.Waiting) {
      return;
    }

    const width = this.scale.width;
    const height = this.scale.height;
    const body = this.ship.body as Phaser.Physics.Arcade.Body;

    this.cameras.main.scrollX = 0;
    body.setVelocity(0, 0);
    body.setAcceleration(0, 0);
    body.moves = false;

    this.ship.setPosition(width * SHIP_X_RATIO, height * SHIP_Y_RATIO);
    this.gapPercent = INITIAL_GAP_PERCENT;
    this.obstaclePairCleared = false;
    this.obstacles.forEach((obstacle) => obstacle.destroy());
    this.obstacles = this.makeObstaclePair(
      width * INITIAL_OBSTACLE_X_RATIO,
      this.gapPercent
    );

    this.physics.world.setBounds(0, 0, width, height);
  };

  public update(_time: number, delta: number) {
    const width = this.scale.width;
    const height = this.scale.height;
    const body = this.ship.body as Phaser.Physics.Arcade.Body;
    const clampedDelta = Math.min(delta, MAX_DELTA_MS);

    if (!this.agentMode && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.triggerFlap();
    }

    if (this.agentMode && this.gameState === GameState.Waiting) {
      this.triggerFlap();
    }

    if (
      this.agentMode &&
      this.gameState === GameState.Running &&
      this.agentPolicy !== null
    ) {
      const observation = buildAgentObservation(
        this.getAgentObservationContext()
      );
      if (this.agentPolicy.decideFlap(observation)) {
        this.triggerFlap();
      }
    }

    const gotInputStimulus = this.tapped || this.noised;

    if (this.gameState == GameState.Waiting && gotInputStimulus) {
      if (this.firstStart) {
        this.sparkler.setParticleGravity(-1000, 0);
        this.sparkler.particleAngle = { min: 180 - 60, max: 180 + 60 };
        this.firstStart = false;
      }

      body.moves = true;
      body.setVelocity(0, 0);
      this.cameras.main.scrollX = 0;
      this.ship.y = height * SHIP_Y_RATIO;
      this.gapPercent = INITIAL_GAP_PERCENT;
      this.obstaclePairCleared = false;
      this.runningElapsedMs = 0;
      this.obstacles.forEach((obstacle) => obstacle.destroy());
      this.obstacles = this.makeObstaclePair(
        width * INITIAL_OBSTACLE_X_RATIO,
        this.gapPercent
      );
      this.gameState = GameState.Running;
      this.game.events.emit(SparklerGameEvents.GameStarted);
    }

    if (this.gameState == GameState.Running) {
      this.runningElapsedMs += clampedDelta;
      const accelerationY = gotInputStimulus ? UP_THRUST : 0;
      body.setAccelerationY(accelerationY);
      const scrollThisFrame = getScrollDistance(
        width,
        height,
        this.runningElapsedMs,
        clampedDelta
      );
      this.cameras.main.scrollX += scrollThisFrame;
      this.checkForCollision();
    }

    if (this.tapped) {
      this.tappedRemainingMs -= clampedDelta;
      if (this.tappedRemainingMs <= 0) {
        this.tapped = false;
        this.tappedRemainingMs = 0;
      }
    }

    if (this.noised) {
      this.noisedRemainingMs -= clampedDelta;
      if (this.noisedRemainingMs <= 0) {
        this.noised = false;
        this.noisedRemainingMs = 0;
      }
    }
  }

  private triggerFlap(): void {
    if (!this.tapped) {
      this.tappedRemainingMs = TAP_STIMULUS_DURATION_MS;
    }
    this.tapped = true;
  }

  private onPointerDown() {
    this.triggerFlap();
  }

  private onMicrophoneStimulus(_maxValue: number) {
    if (this.agentMode) {
      return;
    }
    if (!this.noised) {
      this.noisedRemainingMs = NOISE_STIMULUS_DURATION_MS;
    }
    this.noised = true;
  }

  private async onMicrophoneOn(): Promise<void> {
    console.log("[onMicrophoneOn]");
    try {
      await this.microphoneModule.microphoneOn();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[onMicrophoneOn]", message);
      this.game.events.emit(SparklerGameEvents.MicrophoneError, message);
    }
  }

  private onMicrophoneOff(): void {
    console.log("[onMicrophoneOff]");
    this.microphoneModule.microphoneOff();
  }

  private checkForCollision(): void {
    const shipX = this.ship.x + this.cameras.main.scrollX;
    const shipY = this.ship.y;

    const collision = this.obstacles.some((obstacle) =>
      obstacle.geom.contains(shipX, shipY)
    );
    if (collision) {
      this.gameState = GameState.Waiting;
      const body = this.ship.body as Phaser.Physics.Arcade.Body;
      body.moves = false;
      this.game.events.emit(SparklerGameEvents.GameEnded);
      return;
    }

    const obstacleRight = Math.max(
      ...this.obstacles.map(
        (obstacle) => Phaser.Geom.Polygon.GetAABB(obstacle.geom).right
      )
    );

    if (!this.obstaclePairCleared && shipX >= obstacleRight) {
      this.obstaclePairCleared = true;
      this.game.events.emit(SparklerGameEvents.ObstacleCleared);
      this.createBurstParticleEmitter(this.ship.x, this.ship.y);
    }

    const obstacleGone = obstacleRight < this.cameras.main.scrollX;
    if (obstacleGone) {
      if (this.gapPercent > MIN_GAP_PERCENT) {
        this.gapPercent -= 2;
      }
      this.obstacles.forEach((obstacle) => obstacle.destroy());
      const obstacleX =
        this.cameras.main.scrollX +
        this.scale.width +
        getObstacleWidth(this.scale.width, this.scale.height) +
        OBSTACLE_LINE_WIDTH;
      this.obstacles = this.makeObstaclePair(obstacleX, this.gapPercent);
      this.obstaclePairCleared = false;
    }
  }

  private createSparklerParticleEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
    const emitter = this.add.particles(0, 0, ParticleKeys.Star, {
      follow: this.ship,
      followOffset: { x: -3, y: 0 },
      alpha: { start: 1, end: 0.5 },
      scale: { start: 0.1, end: 0.01 },
      blendMode: "ADD",
      lifespan: 400,
      quantity: 2,
      speed: 200,
      frequency: 80,
      tint: [0xffffff, 0x00ffff, 0xff00ff, 0x0000ff, 0x90ee90],
    });
    emitter.setScrollFactor(0);
    return emitter;
  }

  private createBurstParticleEmitter(x: number, y: number): void {
    const emitter = this.add.particles(x, y, ParticleKeys.Star, {
      accelerationX: 50,
      accelerationY: 50,
      angle: { start: 0, end: 360, steps: 8 },
      alpha: { start: 1, end: 0.5 },
      speed: { start: 800, end: 200, steps: 5 },
      scale: { start: 0.06, end: 0.01 },
      lifespan: 800,
      frequency: -1,
      quantity: 8,
      maxParticles: 40,
      tint: 0xffffff,
    });
    emitter.setScrollFactor(0);
    emitter.setDepth(10);
    emitter.explode(40);
  }

  private makeObstaclePair(
    x: number,
    gapPercent: number
  ): [Phaser.GameObjects.Polygon, Phaser.GameObjects.Polygon] {
    const makeObstacle = (
      addPathDetails: (path: Phaser.Curves.Path) => void
    ): Phaser.GameObjects.Polygon => {
      const path = new Phaser.Curves.Path();
      addPathDetails(path);
      const points = path.getPoints();
      const polygon = this.add.polygon(0, 0, points);
      polygon.closePath = false;
      polygon.setOrigin(0, 0);
      polygon.isStroked = true;
      polygon.lineWidth = OBSTACLE_LINE_WIDTH;
      polygon.strokeColor = 0xffffff;
      return polygon;
    };

    const obstacleWidth = getObstacleWidth(this.scale.width, this.scale.height);
    const RADIUS = obstacleWidth / 2;
    const height = this.scale.height;
    const gapHeight = (height * gapPercent) / 100;
    const halfRemainingHeight = (height - gapHeight) / 2;
    const centreOffsetRatio = Phaser.Math.FloatBetween(-0.5, 0.5);
    const upperHeight = (1 + centreOffsetRatio) * halfRemainingHeight;
    const lowerHeight = (1 - centreOffsetRatio) * halfRemainingHeight;

    this.obstacleGap = {
      x,
      width: obstacleWidth,
      gapTop: upperHeight,
      gapBottom: height - lowerHeight,
    };

    const upperObstacle = makeObstacle((path: Phaser.Curves.Path): void => {
      path
        .moveTo(x, 0)
        .lineTo(x, upperHeight - RADIUS)
        .ellipseTo(RADIUS, RADIUS, 180, 0, true)
        .lineTo(x + obstacleWidth, 0);
    });

    const lowerObstacle = makeObstacle((path: Phaser.Curves.Path): void => {
      path
        .moveTo(x, height)
        .lineTo(x, height - lowerHeight + RADIUS)
        .ellipseTo(RADIUS, RADIUS, 180, 0, false)
        .lineTo(x + obstacleWidth, height);
    });

    return [upperObstacle, lowerObstacle];
  }
}
