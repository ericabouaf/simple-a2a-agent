/**
 * Configuration for the LLM provider and model parameters.
 */
export interface LLMProviderConfig {
  /** Provider type, e.g., 'openai', 'anthropic', 'groq' */
  type: string;
  /** Provider-specific options (e.g., apiKey, endpoint, etc.) */
  options?: Record<string, any>;
}

/**
 * Configuration for the LLM provider and model parameters.
 */
export interface LLMConfig {
  /** Provider configuration object */
  provider: LLMProviderConfig;
  /** Model name or ID */
  model: string;
  /** Model temperature (optional) */
  temperature?: number;
  /** Maximum tokens for responses (optional) */
  maxTokens?: number;
  /** Additional model-specific parameters (optional) */
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
  /** List of MCP servers to load */
  mcpServers?: Record<string, any>;
  /** Path to config file (optional, for reference) */
  configPath?: string;
  /** Additional agent options (optional) */
  [key: string]: any;
} 