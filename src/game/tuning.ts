export const UP_THRUST = -1500;
export const OBSTACLE_LINE_WIDTH = 2;
export const INITIAL_GAP_PERCENT = 30;
export const MIN_GAP_PERCENT = 10;
export const GAP_SHRINK_STEP = 2;
export const SPEED_RAMP_DURATION_MS = 60_000;
export const MAX_SPEED_MULTIPLIER = 1.75;
export const REFERENCE_FRAME_MS = 1000 / 60;
export const MAX_DELTA_MS = 50;
export const STIMULUS_FRAME_COUNT = 5;
export const TAP_STIMULUS_DURATION_MS =
  STIMULUS_FRAME_COUNT * REFERENCE_FRAME_MS;
export const NOISE_STIMULUS_DURATION_MS =
  STIMULUS_FRAME_COUNT * REFERENCE_FRAME_MS;
export const SHIP_X_RATIO = 0.15;
export const SHIP_Y_RATIO = 0.9;
export const INITIAL_OBSTACLE_X_RATIO = 0.85;

export const getObstacleWidth = (width: number, height: number): number => {
  const maxDimension = Math.max(width, height);
  return Math.round(maxDimension / 20);
};

export const getSpeed = (
  width: number,
  height: number,
  runningElapsedMs: number
): number => {
  const maxDimension = Math.max(width, height);
  const baseSpeed = maxDimension / 200;
  const rampProgress = Math.min(1, runningElapsedMs / SPEED_RAMP_DURATION_MS);
  const multiplier = 1 + (MAX_SPEED_MULTIPLIER - 1) * rampProgress;
  return Math.round(baseSpeed * multiplier);
};

export const getMaxSpeed = (width: number, height: number): number => {
  return getSpeed(width, height, SPEED_RAMP_DURATION_MS);
};

export const getScrollDistance = (
  width: number,
  height: number,
  runningElapsedMs: number,
  delta: number
): number => {
  return (
    getSpeed(width, height, runningElapsedMs) * (delta / REFERENCE_FRAME_MS)
  );
};
