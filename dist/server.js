"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const index_1 = require("./lib/a2a/server/index");
const agent_1 = require("./agent");
async function startServer(config) {
    const port = config.server.port;
    const agentCard = buildAgentCard(config);
    const store = new index_1.InMemoryTaskStore();
    const myAgentLogic = (0, agent_1.createAgentLogic)(config);
    const server = new index_1.A2AServer(myAgentLogic, {
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
function buildAgentCard(config) {
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
