import { Agent as VoltAgentCoreAgent, InMemoryStorage, MCPConfiguration } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { groq } from "@ai-sdk/groq";
import { TaskHandler, TaskContext, TaskYieldUpdate } from "./lib/a2a/server/index";
import { Message } from "./lib/a2a/schema";

// Load all MCP tools from the config's mcpServers section
export async function getAllTools(config: any) {
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

export function createAgentLogic(config: any): TaskHandler {
  let agent: any;
  (async () => {
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

    agent = new VoltAgentCoreAgent({
      name: config.agent?.name || "A2A Agent",
      description: config.agent?.description || "An assistant that can use MCP tools configured at startup",
      llm: new VercelAIProvider(),
      model: modelInstance,
      memory: memory,
      tools: allTools,
    });
  })();

  // Agent logic as a TaskHandler
  const myAgentLogic: TaskHandler = async function* (
    context: TaskContext
  ): AsyncGenerator<TaskYieldUpdate> {
    console.log(`Handling task: ${context.task.id}`);
    console.log(`User message: ${JSON.stringify(context.userMessage)}`);
    console.log(`Agent history: ${JSON.stringify(context.history)}`);

    yield {
      state: "working",
      message: { role: "agent", parts: [{ type: "text", text: "Processing..." }] } as Message,
    };

    function isTextPart(part: any): part is { type: 'text'; text: string } {
      return part && part.type === 'text' && typeof part.text === 'string';
    }
    const userText = context.userMessage.parts?.find(isTextPart)?.text || "";

    // Use the VoltAgent agent instance to generate a response
    let agentResponse = "[VoltAgent not initialized]";
    if (agent) {
      const completeResponse = await agent.generateText(userText, {
        userId: "default",
        conversationId: context.task.id,
      });
      agentResponse = completeResponse?.text || "[No response]";
    }

    if (context.isCancelled && context.isCancelled()) {
      console.log("Task cancelled!");
      yield { state: "canceled" };
      return;
    }

    yield {
      state: "completed",
      message: { role: "agent", parts: [{ type: "text", text: agentResponse }] } as Message,
    };
  };

  return myAgentLogic;
} 