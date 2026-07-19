// Keep in sync with `base` in vite.config.ts.
export const AppBaseUrl = "/sparkler-game-phaser/";

export const SparklerGameEvents = {
  GameStarted: "GameStarted",
  GameEnded: "GameEnded",
  ObstacleCleared: "ObstacleCleared",
  MicrophoneOn: "MicrophoneOn",
  MicrophoneOff: "MicrophoneOff",
  MicrophoneError: "MicrophoneError",
  AgentOn: "AgentOn",
  AgentOff: "AgentOff",
} as const;

export type SparklerGameEvent =
  (typeof SparklerGameEvents)[keyof typeof SparklerGameEvents];

export const SceneKeys = {
  Game: "Game",
  HUD: "HUD",
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];

export const FontKeys = {
  VectorBattle: "VectorBattle",
} as const;

export type FontKey = (typeof FontKeys)[keyof typeof FontKeys];

export const ImageKeys = {
  MicrophoneOn: "microphone-on",
  MicrophoneOff: "microphone-off",
  FullscreenEnter: "fullscreen-enter",
  FullscreenExit: "fullscreen-exit",
  Agent: "agent",
} as const;

export type ImageKey = (typeof ImageKeys)[keyof typeof ImageKeys];

export const ParticleKeys = {
  Star: "star",
} as const;

export type ParticleKey = (typeof ParticleKeys)[keyof typeof ParticleKeys];
