"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigLoader = void 0;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * ConfigLoader handles loading, parsing, and validating agent configuration
 * from CLI arguments and JSON files.
 */
class ConfigLoader {
    /**
     * Parse CLI arguments using commander and return partial AgentConfig.
     */
    static parseCLI(argv) {
        const program = new commander_1.Command();
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
            .addOption(new commander_1.Option('--port <port>', 'Server port').argParser((v) => parseInt(v, 10)))
            .addOption(new commander_1.Option('--llm-temperature <temperature>', 'LLM temperature').argParser((v) => parseFloat(v)))
            .addOption(new commander_1.Option('--llm-max-tokens <maxTokens>', 'LLM max tokens').argParser((v) => parseInt(v, 10)));
        program.parse(argv);
        const opts = program.opts();
        const config = {};
        if (opts.host || opts.port) {
            config.server = {
                ...(opts.host ? { host: opts.host } : {}),
                ...(opts.port ? { port: opts.port } : {}),
            };
        }
        // Only construct llm if provider or model is present
        if (opts.llmProvider || opts.llmModel || opts.llmTemperature || opts.llmMaxTokens || opts.llmProviderOption) {
            const llm = {};
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
            if (opts.llmModel)
                llm.model = opts.llmModel;
            if (opts.llmTemperature !== undefined)
                llm.temperature = opts.llmTemperature;
            if (opts.llmMaxTokens !== undefined)
                llm.maxTokens = opts.llmMaxTokens;
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
    static loadJSONConfig(filePath) {
        const absPath = path.resolve(filePath);
        if (!fs.existsSync(absPath)) {
            throw new Error(`Config file not found: ${absPath}`);
        }
        const raw = fs.readFileSync(absPath, 'utf-8');
        try {
            const parsed = JSON.parse(raw);
            return parsed;
        }
        catch (e) {
            throw new Error(`Failed to parse config file: ${e}`);
        }
    }
    /**
     * Merge defaults, CLI options, and file config into a final AgentConfig.
     */
    static mergeConfigs(defaults, fileConfig, cliConfig) {
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
        };
    }
    /**
     * Validate the AgentConfig (basic runtime checks).
     * Throws if required fields are missing.
     */
    static validateConfig(config) {
        if (!config.server)
            throw new Error('Missing server config');
        if (!config.llm)
            throw new Error('Missing llm config');
        if (!config.llm.provider || !config.llm.provider.type)
            throw new Error('Missing llm.provider.type');
        if (!config.llm.model)
            throw new Error('Missing llm.model');
    }
    /**
     * Save AgentConfig to a JSON file.
     */
    static saveConfig(config, filePath) {
        const absPath = path.resolve(filePath);
        fs.writeFileSync(absPath, JSON.stringify(config, null, 2), 'utf-8');
    }
}
exports.ConfigLoader = ConfigLoader;
