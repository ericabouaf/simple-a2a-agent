import { Agent as VoltAgentCoreAgent, InMemoryStorage, MCPConfiguration } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { groq } from "@ai-sdk/groq";

import { AgentConfig } from "./types";


// Load all MCP tools from the config's mcpServers section
export async function getAllTools(config: AgentConfig) {
  if (!config.mcpServers) return [];
  const mcpConfig = new MCPConfiguration({
    servers: config.mcpServers,
  });
  return await mcpConfig.getTools();
}

function getProviderInstance(providerConfig: any) {
  switch (providerConfig.type) {
    case "vercel-ai":
      return new VercelAIProvider(providerConfig.options || {});
    // Add other providers here as needed
    default:
      throw new Error(`Unknown provider type: ${providerConfig.type}`);
  }
}

function getModelInstance(providerType: string, modelName: string) {
  switch (providerType) {
    case "openai":
      return openai(modelName);
    case "anthropic":
      return anthropic(modelName);
    case "groq":
      return groq(modelName);
    default:
      throw new Error(`Unknown provider type for model: ${providerType}`);
  }
}

export async function createVoltAgent(config: AgentConfig): Promise<any> {
    
    const allTools = await getAllTools(config);

    const providerType = config.llm.provider?.type;
    const modelName = config.llm.model;

    let modelInstance;
    try {
        modelInstance = getModelInstance(providerType, modelName);
    } catch (e) {
        console.error(e);
        return;
    }

    const memory = new InMemoryStorage({
        // Optional: Limit the number of messages stored per conversation thread
        storageLimit: 100, // Defaults to no limit if not specified
    
        // Optional: Enable verbose debug logging from the memory provider
        debug: true, // Defaults to false
    });

    return new VoltAgentCoreAgent({
        name: config.agent?.name || "A2A Agent",
        description: config.agent?.description || "An assistant that can use MCP tools configured at startup",
        llm: new VercelAIProvider(),
        model: modelInstance,
        memory: memory,
        tools: allTools,
    });
}
