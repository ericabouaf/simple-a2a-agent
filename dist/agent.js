"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTools = getAllTools;
exports.createAgentLogic = createAgentLogic;
const core_1 = require("@voltagent/core");
const vercel_ai_1 = require("@voltagent/vercel-ai");
const openai_1 = require("@ai-sdk/openai");
const anthropic_1 = require("@ai-sdk/anthropic");
const groq_1 = require("@ai-sdk/groq");
// Load all MCP tools from the config's mcpServers section
async function getAllTools(config) {
    if (!config.mcpServers)
        return [];
    const mcpConfig = new core_1.MCPConfiguration({
        servers: config.mcpServers,
    });
    return await mcpConfig.getTools();
}
function getProviderInstance(providerConfig) {
    switch (providerConfig.type) {
        case "vercel-ai":
            return new vercel_ai_1.VercelAIProvider(providerConfig.options || {});
        // Add other providers here as needed
        default:
            throw new Error(`Unknown provider type: ${providerConfig.type}`);
    }
}
function getModelInstance(providerType, modelName) {
    switch (providerType) {
        case "openai":
            return (0, openai_1.openai)(modelName);
        case "anthropic":
            return (0, anthropic_1.anthropic)(modelName);
        case "groq":
            return (0, groq_1.groq)(modelName);
        default:
            throw new Error(`Unknown provider type for model: ${providerType}`);
    }
}
function createAgentLogic(config) {
    let agent;
    (async () => {
        const allTools = await getAllTools(config);
        const providerType = config.llm.provider?.type;
        const modelName = config.llm.model;
        let modelInstance;
        try {
            modelInstance = getModelInstance(providerType, modelName);
        }
        catch (e) {
            console.error(e);
            return;
        }
        const memory = new core_1.InMemoryStorage({
            // Optional: Limit the number of messages stored per conversation thread
            storageLimit: 100, // Defaults to no limit if not specified
            // Optional: Enable verbose debug logging from the memory provider
            debug: true, // Defaults to false
        });
        agent = new core_1.Agent({
            name: config.agent?.name || "A2A Agent",
            description: config.agent?.description || "An assistant that can use MCP tools configured at startup",
            llm: new vercel_ai_1.VercelAIProvider(),
            model: modelInstance,
            memory: memory,
            tools: allTools,
        });
    })();
    // Agent logic as a TaskHandler
    const myAgentLogic = async function* (context) {
        console.log(`Handling task: ${context.task.id}`);
        console.log(`User message: ${JSON.stringify(context.userMessage)}`);
        console.log(`Agent history: ${JSON.stringify(context.history)}`);
        yield {
            state: "working",
            message: { role: "agent", parts: [{ type: "text", text: "Processing..." }] },
        };
        function isTextPart(part) {
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
            message: { role: "agent", parts: [{ type: "text", text: agentResponse }] },
        };
    };
    return myAgentLogic;
}
