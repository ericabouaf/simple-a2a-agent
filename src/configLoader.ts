import { Command, Option } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { AgentConfig } from './types';

/**
 * ConfigLoader handles loading, parsing, and validating agent configuration
 * from CLI arguments and JSON files.
 */
export class ConfigLoader {
  /**
   * Parse CLI arguments using commander and return partial AgentConfig.
   */
  static parseCLI(argv: string[]): Partial<AgentConfig> {
    const program = new Command();
    program
      .option('-c, --config <path>', 'Path to JSON config file')
      .option('--host <host>', 'Server host')
      .option('--llm-provider <provider>', 'LLM provider')
      .option('--llm-model <model>', 'LLM model')
      .option('--llm-provider-option <keyValue...>', 'LLM provider options as key=value pairs (can be repeated)')
      .option('-n, --name <name>', 'Name of the agent')
      .option('-d, --description <description>', 'System prompt of the agent');
    // Use addOption for numeric options only
    program
      .addOption(
        new Option('--port <port>', 'Server port').argParser((v: string) => parseInt(v, 10))
      )
      .addOption(
        new Option('--llm-temperature <temperature>', 'LLM temperature').argParser((v: string) => parseFloat(v))
      )
      .addOption(
        new Option('--llm-max-tokens <maxTokens>', 'LLM max tokens').argParser((v: string) => parseInt(v, 10))
      );
    program.parse(argv);
    const opts = program.opts();
    const config: Partial<AgentConfig> = {};
    if (opts.host || opts.port) {
      config.server = {
        ...(opts.host ? { host: opts.host } : {}),
        ...(opts.port ? { port: opts.port } : {}),
      };
    }
    // Only construct llm if provider or model is present
    if (opts.llmProvider || opts.llmModel || opts.llmTemperature || opts.llmMaxTokens || opts.llmProviderOption) {
      const llm: any = {};
      if (opts.llmProvider) {
        llm.provider = { type: opts.llmProvider };
        if (opts.llmProviderOption) {
          llm.provider.options = {};
          for (const kv of opts.llmProviderOption) {
            const [key, value] = kv.split('=');
            llm.provider.options[key] = value;
          }
        }
      }
      if (opts.llmModel) llm.model = opts.llmModel;
      if (opts.llmTemperature !== undefined) llm.temperature = opts.llmTemperature;
      if (opts.llmMaxTokens !== undefined) llm.maxTokens = opts.llmMaxTokens;
      if (llm.provider && llm.model) {
        config.llm = llm;
      }
    }
    if (opts.config) {
      config.configPath = opts.config;
    }
    if (opts.name || opts.description) {
      config.agent = {
        ...(opts.name ? { name: opts.name } : {}),
        ...(opts.description ? { description: opts.description } : {}),
      };
    }
    return config;
  }

  /**
   * Load and parse a JSON config file.
   */
  static loadJSONConfig(filePath: string): Partial<AgentConfig> {
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
      throw new Error(`Config file not found: ${absPath}`);
    }
    const raw = fs.readFileSync(absPath, 'utf-8');
    try {
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (e) {
      throw new Error(`Failed to parse config file: ${e}`);
    }
  }

  /**
   * Merge defaults, CLI options, and file config into a final AgentConfig.
   */
  static mergeConfigs(
    defaults: Partial<AgentConfig>,
    fileConfig: Partial<AgentConfig>,
    cliConfig: Partial<AgentConfig>
  ): AgentConfig {
    // Port resolution order: CLI > file > env > default
    const cliPort = cliConfig.server?.port;
    const filePort = fileConfig.server?.port;
    const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
    const resolvedPort = cliPort || filePort || envPort;
    return {
      ...defaults,
      ...fileConfig,
      ...cliConfig,
      server: {
        ...defaults.server,
        ...fileConfig.server,
        ...cliConfig.server,
        port: resolvedPort,
      },
      llm: {
        ...defaults.llm,
        ...fileConfig.llm,
        ...cliConfig.llm,
      },
      mcpServers: cliConfig.mcpServers || fileConfig.mcpServers || defaults.mcpServers,
      configPath: cliConfig.configPath || fileConfig.configPath || defaults.configPath,
    } as AgentConfig;
  }

  /**
   * Validate the AgentConfig (basic runtime checks).
   * Throws if required fields are missing.
   */
  static validateConfig(config: AgentConfig): void {
    if (!config.server) throw new Error('Missing server config');
    if (!config.llm) throw new Error('Missing llm config');
    if (!config.llm.provider || !config.llm.provider.type) throw new Error('Missing llm.provider.type');
    if (!config.llm.model) throw new Error('Missing llm.model');
  }

  /**
   * Save AgentConfig to a JSON file.
   */
  static saveConfig(config: AgentConfig, filePath: string): void {
    const absPath = path.resolve(filePath);
    fs.writeFileSync(absPath, JSON.stringify(config, null, 2), 'utf-8');
  }
} 