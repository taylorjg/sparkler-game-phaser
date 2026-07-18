export type ObstacleGapInfo = {
  x: number;
  width: number;
  gapTop: number;
  gapBottom: number;
};

export type AgentObservationContext = {
  shipY: number;
  velocityY: number;
  viewportWidth: number;
  viewportHeight: number;
  scrollX: number;
  shipScreenX: number;
  runningElapsedMs: number;
  thrustActive: boolean;
  obstacle: ObstacleGapInfo;
};

export type AgentObservation = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];
