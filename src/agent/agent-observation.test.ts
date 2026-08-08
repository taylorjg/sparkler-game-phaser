import { buildAgentObservation } from "@app/agent/agent-observation";
import type { AgentObservationContext } from "@app/agent/types";
import { describe, expect, it } from "vitest";

const baseContext = (): AgentObservationContext => ({
  shipY: 450,
  velocityY: 0,
  viewportWidth: 800,
  viewportHeight: 600,
  scrollX: 0,
  shipScreenX: 120,
  runningElapsedMs: 0,
  thrustActive: false,
  obstacle: {
    x: 680,
    width: 40,
    gapTop: 200,
    gapBottom: 400,
  },
});

describe("buildAgentObservation", () => {
  it("normalizes game state into a fixed-size observation vector", () => {
    const observation = buildAgentObservation(baseContext());

    expect(observation).toHaveLength(7);
    expect(observation[0]).toBeCloseTo(0.75);
    expect(observation[1]).toBe(0);
    expect(observation[2]).toBeCloseTo(0.5);
    expect(observation[3]).toBeCloseTo(1 / 6);
    expect(observation[4]).toBeCloseTo(0.7);
    expect(observation[6]).toBe(0);
  });

  it("encodes thrust as 0 or 1", () => {
    const idle = buildAgentObservation(baseContext());
    const thrusting = buildAgentObservation({
      ...baseContext(),
      thrustActive: true,
    });

    expect(idle[6]).toBe(0);
    expect(thrusting[6]).toBe(1);
  });

  it("reflects vertical velocity in normalized form", () => {
    const rising = buildAgentObservation({
      ...baseContext(),
      velocityY: -500,
    });

    expect(rising[1]).toBeCloseTo(-0.5);
  });
});
