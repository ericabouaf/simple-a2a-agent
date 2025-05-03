import { A2AServer, InMemoryTaskStore } from "./lib/a2a/server/index";
import { AgentCard } from "./lib/a2a/schema";
import { createAgentLogic } from "./agent";

export async function startServer(config: any) {
  const port = config.server.port;
  const agentCard = buildAgentCard(config);

  const store = new InMemoryTaskStore();
  const myAgentLogic = createAgentLogic(config);
  const server = new A2AServer(myAgentLogic, {
    taskStore: store,
    card: agentCard,
  });

  server.start(port);
  
  return agentCard;
}

/**
 * Builds an AgentCard from a config.
 * @param config The config to build the agent card from.
 * @returns The agent card.
 */
function buildAgentCard(config: any): AgentCard {
  const port = config.server.port;
  return {
    name: config.agent?.name || "A2A Agent",
    description: config.agent?.description || "An agent that serves as an A2A protocol agent.",
    url: `http://localhost:${port}`,
    provider: config.agent?.provider || { organization: "A2A Samples" },
    version: config.agent?.version || "0.0.1",
    capabilities: {
      streaming: config.agent?.capabilities?.streaming ?? false,
      pushNotifications: config.agent?.capabilities?.pushNotifications ?? false,
      stateTransitionHistory: config.agent?.capabilities?.stateTransitionHistory ?? false,
    },
    authentication: config.agent?.authentication ?? null,
    defaultInputModes: config.agent?.defaultInputModes || ["text"],
    defaultOutputModes: config.agent?.defaultOutputModes || ["text"],
    skills: config.agent?.skills || [],
  };
}