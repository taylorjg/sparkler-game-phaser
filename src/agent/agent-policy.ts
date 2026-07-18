import type { AgentObservation } from "@app/agent/types";

export type PolicyActivation = "relu" | "tanh";

export type ExportedAgentPolicy = {
  observationSize: number;
  actionSize: number;
  hiddenLayers: number[];
  activation: PolicyActivation;
  weights: Record<string, number[][] | number[]>;
  biases: Record<string, number[][] | number[]>;
};

const applyActivation = (
  values: number[],
  activation: PolicyActivation
): number[] => {
  if (activation === "tanh") {
    return values.map((value) => Math.tanh(value));
  }
  return values.map((value) => Math.max(0, value));
};

const linear = (
  input: number[],
  weight: number[][],
  bias: number[]
): number[] => {
  return weight.map(
    (row, rowIndex) =>
      row.reduce(
        (sum, value, columnIndex) => sum + value * input[columnIndex],
        0
      ) + bias[rowIndex]
  );
};

const argMax = (values: number[]): number => {
  let bestIndex = 0;
  let bestValue = values[0] ?? Number.NEGATIVE_INFINITY;
  for (let index = 1; index < values.length; index += 1) {
    const value = values[index] ?? Number.NEGATIVE_INFINITY;
    if (value > bestValue) {
      bestValue = value;
      bestIndex = index;
    }
  }
  return bestIndex;
};

export class AgentPolicy {
  private readonly data: ExportedAgentPolicy;

  public constructor(data: ExportedAgentPolicy) {
    this.data = data;
  }

  public decideFlap(observation: AgentObservation): boolean {
    let activation = [...observation];
    const layerCount = this.data.hiddenLayers.length;

    for (let layerIndex = 0; layerIndex < layerCount; layerIndex += 1) {
      const weight = this.data.weights[`layer${layerIndex}`] as number[][];
      const bias = this.data.biases[`layer${layerIndex}`] as number[];
      activation = applyActivation(
        linear(activation, weight, bias),
        this.data.activation
      );
    }

    const actionWeight = this.data.weights.action as number[][];
    const actionBias = this.data.biases.action as number[];
    const logits = linear(activation, actionWeight, actionBias);
    return argMax(logits) === 1;
  }
}

export const createAgentPolicy = (data: ExportedAgentPolicy): AgentPolicy => {
  return new AgentPolicy(data);
};
