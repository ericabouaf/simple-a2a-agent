import { Agent as VoltAgentCoreAgent } from "@voltagent/core";
import { VercelAIProvider } from "@voltagent/vercel-ai";
import { openai } from "@ai-sdk/openai";
import { TaskHandler, TaskContext, TaskYieldUpdate } from "./lib/a2a/server/index";
import { Message } from "./lib/a2a/schema";

// Placeholder for MCP tools
export async function getAllTools() {
  // TODO: Replace with actual MCP tool loading logic
  return [];
}

export function createAgentLogic(config: any): TaskHandler {
  let agent: any;
  (async () => {
    const allTools = await getAllTools();
    const { model } = config.llm;
    const modelInstance = openai(model as any);
    agent = new VoltAgentCoreAgent({
      name: config.agent?.name || "A2A Agent",
      description: config.agent?.description || "An assistant that can use MCP tools configured at startup",
      llm: new VercelAIProvider(),
      model: modelInstance,
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
      const completeResponse = await agent.generateText(userText);
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