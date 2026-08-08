import {
  MAX_SPEED_MULTIPLIER,
  REFERENCE_FRAME_MS,
  SPEED_RAMP_DURATION_MS,
  getMaxSpeed,
  getObstacleWidth,
  getScrollDistance,
  getSpeed,
} from "@app/game/tuning";
import { describe, expect, it } from "vitest";

describe("getObstacleWidth", () => {
  it("scales with the larger viewport dimension", () => {
    expect(getObstacleWidth(800, 600)).toBe(40);
    expect(getObstacleWidth(600, 800)).toBe(40);
    expect(getObstacleWidth(400, 300)).toBe(20);
  });
});

describe("getSpeed", () => {
  it("starts at base speed before the ramp completes", () => {
    expect(getSpeed(800, 600, 0)).toBe(4);
  });

  it("reaches max speed after the ramp duration", () => {
    const base = getSpeed(800, 600, 0);
    const max = getSpeed(800, 600, SPEED_RAMP_DURATION_MS);
    expect(max).toBe(Math.round(base * MAX_SPEED_MULTIPLIER));
    expect(getMaxSpeed(800, 600)).toBe(max);
  });

  it("ramps linearly mid-run", () => {
    const start = getSpeed(800, 600, 0);
    const mid = getSpeed(800, 600, SPEED_RAMP_DURATION_MS / 2);
    const end = getSpeed(800, 600, SPEED_RAMP_DURATION_MS);
    expect(mid).toBeGreaterThan(start);
    expect(mid).toBeLessThan(end);
  });
});

describe("getScrollDistance", () => {
  it("scales scroll distance with frame delta", () => {
    const speed = getSpeed(1000, 800, 0);
    const oneFrame = getScrollDistance(1000, 800, 0, REFERENCE_FRAME_MS);
    const twoFrames = getScrollDistance(1000, 800, 0, REFERENCE_FRAME_MS * 2);
    expect(oneFrame).toBeCloseTo(speed, 5);
    expect(twoFrames).toBeCloseTo(speed * 2, 5);
  });
});
