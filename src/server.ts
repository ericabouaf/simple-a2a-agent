import express from "express";
import { AGENT_CARD_PATH } from "@a2a-js/sdk";
import type { AgentCard } from "@a2a-js/sdk";
import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";
import { A2AExpressApp } from "@a2a-js/sdk/server/express";

import { AgentConfig } from "./types";
import { createAgentExecutor } from "./executor";
import { createVoltAgent } from "./voltAgent";


export async function startServer(config: AgentConfig) {
  const port = config.server.port;

  const store = new InMemoryTaskStore();
  const agentCard = buildAgentCard(config);

  const voltAgent = await createVoltAgent(config);

  const agentExecutor = createAgentExecutor(voltAgent);

  const requestHandler = new DefaultRequestHandler(
    agentCard,
    store,
    agentExecutor
  );

  const appBuilder = new A2AExpressApp(requestHandler);
  const expressApp = appBuilder.setupRoutes(express());

  expressApp.listen(port, () => {
    console.log(`🚀 Server started on http://localhost:${port}`);
    console.log(`🪪 Agent card available at http://localhost:${port}/${AGENT_CARD_PATH}`);
  });
  
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
      streaming: config.agent?.capabilities?.streaming ?? true,
      pushNotifications: config.agent?.capabilities?.pushNotifications ?? false,
      stateTransitionHistory: config.agent?.capabilities?.stateTransitionHistory ?? false,
    },
    // authentication: config.agent?.authentication ?? null,
    defaultInputModes: config.agent?.defaultInputModes || ["text"],
    defaultOutputModes: config.agent?.defaultOutputModes || ["text"],
    skills: config.agent?.skills || [],
    protocolVersion: "0.3.0",
  };
}
