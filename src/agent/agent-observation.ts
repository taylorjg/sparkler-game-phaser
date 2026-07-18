import { getMaxSpeed, getSpeed } from "@app/game/tuning";
import type {
  AgentObservation,
  AgentObservationContext,
} from "@app/agent/types";

export const buildAgentObservation = (
  context: AgentObservationContext
): AgentObservation => {
  const {
    shipY,
    velocityY,
    viewportWidth,
    viewportHeight,
    scrollX,
    shipScreenX,
    runningElapsedMs,
    thrustActive,
    obstacle,
  } = context;

  const gapCenter = (obstacle.gapTop + obstacle.gapBottom) / 2;
  const gapHalfHeight = (obstacle.gapBottom - obstacle.gapTop) / 2;
  const shipWorldX = scrollX + shipScreenX;
  const distanceToObstacle = obstacle.x - shipWorldX;
  const maxSpeed = getMaxSpeed(viewportWidth, viewportHeight);

  return [
    shipY / viewportHeight,
    velocityY / 1000,
    gapCenter / viewportHeight,
    gapHalfHeight / viewportHeight,
    distanceToObstacle / viewportWidth,
    getSpeed(viewportWidth, viewportHeight, runningElapsedMs) /
      Math.max(maxSpeed, 1),
    thrustActive ? 1 : 0,
  ];
};
