import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildAgentObservation } from "@app/agent/agent-observation";
import {
  AgentPolicy,
  createAgentPolicy,
  type ExportedAgentPolicy,
} from "@app/agent/agent-policy";
import type { AgentObservation } from "@app/agent/types";
import { describe, expect, it } from "vitest";

const alwaysFlapPolicy: ExportedAgentPolicy = {
  observationSize: 7,
  actionSize: 2,
  hiddenLayers: [1],
  activation: "relu",
  weights: {
    layer0: Array.from({ length: 1 }, () => Array.from({ length: 7 }, () => 0)),
    action: [[0], [1]],
  },
  biases: {
    layer0: [0],
    action: [0, 1],
  },
};

const neverFlapPolicy: ExportedAgentPolicy = {
  ...alwaysFlapPolicy,
  biases: {
    layer0: [0],
    action: [1, 0],
  },
};

const observation: AgentObservation = [0, 0, 0.5, 0.1, 0.5, 0.5, 0];

describe("AgentPolicy", () => {
  it("returns true when the action head prefers flap", () => {
    const policy = createAgentPolicy(alwaysFlapPolicy);
    expect(policy.decideFlap(observation)).toBe(true);
  });

  it("returns false when the action head prefers coast", () => {
    const policy = createAgentPolicy(neverFlapPolicy);
    expect(policy.decideFlap(observation)).toBe(false);
  });

  it("runs inference on the shipped BC export without throwing", () => {
    const policyPath = join(
      dirname(fileURLToPath(import.meta.url)),
      "../../public/assets/models/sparkler_bc.json"
    );
    const exported = JSON.parse(
      readFileSync(policyPath, "utf8")
    ) as ExportedAgentPolicy;
    const policy = new AgentPolicy(exported);
    const sampleObservation = buildAgentObservation({
      shipY: 300,
      velocityY: -120,
      viewportWidth: 800,
      viewportHeight: 600,
      scrollX: 500,
      shipScreenX: 120,
      runningElapsedMs: 15_000,
      thrustActive: false,
      obstacle: {
        x: 900,
        width: 40,
        gapTop: 180,
        gapBottom: 420,
      },
    });

    expect(typeof policy.decideFlap(sampleObservation)).toBe("boolean");
  });
});
