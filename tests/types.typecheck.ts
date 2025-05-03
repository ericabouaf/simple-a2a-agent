/**
 * Type checking tests for agent configuration types.
 * These tests are for compile-time validation only.
 * Run with: tsc --noEmit tests/types.test.ts
 */
import { AgentConfig, LLMConfig, MCPToolConfig, ServerConfig } from '../src/types';

// Valid LLMConfig
const validLLMConfig: LLMConfig = {
  provider: 'openai',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1024,
  customParam: 'value', // extra param allowed
};

// Valid MCPToolConfig
const validTool: MCPToolConfig = {
  name: 'echo',
  description: 'Echoes input',
  options: { repeat: 2 },
};

// Valid ServerConfig
const validServer: ServerConfig = {
  host: '127.0.0.1',
  port: 8080,
};

// Valid AgentConfig
const validAgentConfig: AgentConfig = {
  server: validServer,
  llm: validLLMConfig,
  mcpTools: [validTool],
  configPath: './config/agent.json',
  customOption: 123,
};

// The following are examples of invalid configs for type checking.
// Uncomment to verify TypeScript catches the errors.
//
// // @ts-expect-error Missing required 'provider' in LLMConfig
// // const invalidLLMConfig: LLMConfig = { model: 'gpt-3.5-turbo' };
//
// // @ts-expect-error 'server' is required in AgentConfig
// // const invalidAgentConfig: AgentConfig = { llm: validLLMConfig };
//
// // @ts-expect-error 'name' is required in MCPToolConfig
// // const invalidTool: MCPToolConfig = { description: 'No name' };
//
// // @ts-expect-error 'llm' is required in AgentConfig
// // const invalidAgentConfig2: AgentConfig = { server: validServer }; 