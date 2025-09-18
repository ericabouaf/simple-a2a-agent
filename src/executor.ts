
import { AgentExecutor, RequestContext, ExecutionEventBus } from "@a2a-js/sdk/server";
import { v4 as uuidv4 } from "uuid";


class StreamingExecutor implements AgentExecutor {

    voltAgent: any;

    constructor(voltAgent: any) {
        this.voltAgent = voltAgent;
    }

  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const { taskId, contextId, userMessage } = requestContext;


    console.log(`Handling task: ${taskId}`);
    console.log(`User message: ${JSON.stringify(userMessage)}`);
    // console.log(`Agent history: ${JSON.stringify(context.history)}`);

    function isTextPart(part: any): part is { kind: 'text'; text: string } {
      return part && part.kind === 'text' && typeof part.text === 'string';
    }
    const userText = userMessage.parts?.find(isTextPart)?.text || "";


    // 1. Publish initial 'submitted' state.
    eventBus.publish({
      kind: "task",
      id: taskId,
      contextId,
      status: { state: "submitted", timestamp: new Date().toISOString() },
    });

    // 2. Publish 'working' state.
    eventBus.publish({
      kind: "status-update",
      taskId,
      contextId,
      status: { state: "working", timestamp: new Date().toISOString() },
      final: false
    });

    

    // Use the VoltAgent agent instance to generate a response
    const completeResponse = await this.voltAgent.generateText(userText, {
        userId: "default",
        conversationId: taskId,
    });
    const agentResponse = completeResponse?.text || "[No response]";


    // 3. Send the voltAgent response as a message
    eventBus.publish({
      kind: "message",
      messageId: uuidv4(),
      role: "agent",
      parts: [{ kind: "text", text: agentResponse }],
      // Associate the response with the incoming request's context.
      contextId: requestContext.contextId,
    });

    // 4. Publish final 'completed' state.
    eventBus.publish({
      kind: "status-update",
      taskId,
      contextId,
      status: { state: "completed", timestamp: new Date().toISOString() },
      final: true,
    });

    eventBus.finished();
  }
  
  cancelTask = async (): Promise<void> => {};
}


export function createAgentExecutor(voltAgent: any): AgentExecutor {
    return new StreamingExecutor(voltAgent);
};
