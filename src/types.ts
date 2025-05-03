/**
 * Configuration for the LLM provider and model parameters.
 */
export interface LLMConfig {
  /** Provider name, e.g., 'openai', 'anthropic' */
  provider: string;
  /** Model name or ID */
  model: string;
  /** Model temperature (optional) */
  temperature?: number;
  /** Maximum tokens for responses (optional) */
  maxTokens?: number;
  /** Additional provider-specific parameters (optional) */
  [key: string]: any;
}

/**
 * Configuration for a single MCP tool.
 */
export interface MCPToolConfig {
  /** Tool name */
  name: string;
  /** Tool description */
  description?: string;
  /** Tool-specific options (optional) */
  options?: Record<string, any>;
}

/**
 * Server configuration options.
 */
export interface ServerConfig {
  /** Hostname or IP address to bind */
  host?: string;
  /** Port to listen on (if not provided, will be autodetected) */
  port?: number;
}

/**
 * Main agent configuration schema.
 */
export interface AgentConfig {
  /** Server settings */
  server: ServerConfig;
  /** LLM configuration */
  llm: LLMConfig;
  /** List of MCP tools to load */
  mcpTools?: MCPToolConfig[];
  /** Path to config file (optional, for reference) */
  configPath?: string;
  /** Additional agent options (optional) */
  [key: string]: any;
} 