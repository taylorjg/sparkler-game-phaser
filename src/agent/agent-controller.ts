import {
  createAgentPolicy,
  type ExportedAgentPolicy,
  type AgentPolicy,
} from "@app/agent/agent-policy";

export const AGENT_POLICY_KEY = "agentPolicy";
export const AGENT_POLICY_PATH = "assets/models/sparkler_bc.json";

export const isAgentMode = (): boolean => {
  return new URLSearchParams(window.location.search).has("agent");
};

export const loadAgentPolicyFromCache = (
  cache: Phaser.Cache.CacheManager,
  key: string = AGENT_POLICY_KEY
): AgentPolicy => {
  const data = cache.json.get(key) as ExportedAgentPolicy;
  return createAgentPolicy(data);
};
