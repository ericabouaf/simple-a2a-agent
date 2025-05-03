import { ConfigLoader } from '../src/configLoader';
import { AgentConfig } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('ConfigLoader', () => {
  const sampleConfig: AgentConfig = {
    server: { host: 'localhost', port: 3000 },
    llm: { provider: 'openai', model: 'gpt-3.5-turbo' },
    mcpServers: {},
    configPath: './config/agent.json',
    customOption: 42,
  };

  afterEach(() => {
    // Clean up temp files
    const tempPath = path.resolve('./tests/temp_config.json');
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  });

  it('parses CLI arguments into config', () => {
    const argv = [
      'node',
      'script.js',
      '--host', '127.0.0.1',
      '--port', '8080',
      '--llm-provider', 'anthropic',
      '--llm-model', 'claude',
      '--llm-temperature', '0.5',
      '--llm-max-tokens', '512',
      '--config', './config/agent.json',
    ];
    const config = ConfigLoader.parseCLI(argv);
    expect(config.server).toEqual({ host: '127.0.0.1', port: 8080 });
    expect(config.llm).toEqual({ provider: 'anthropic', model: 'claude', temperature: 0.5, maxTokens: 512 });
    expect(config.configPath).toBe('./config/agent.json');
  });

  it('loads JSON config file', () => {
    const tempPath = path.resolve('./tests/temp_config.json');
    fs.writeFileSync(tempPath, JSON.stringify(sampleConfig), 'utf-8');
    const loaded = ConfigLoader.loadJSONConfig(tempPath);
    expect(loaded.server).toEqual(sampleConfig.server);
    expect(loaded.llm).toEqual(sampleConfig.llm);
  });

  it('throws on missing config file', () => {
    expect(() => ConfigLoader.loadJSONConfig('./tests/does_not_exist.json')).toThrow(/Config file not found/);
  });

  it('throws on invalid JSON', () => {
    const tempPath = path.resolve('./tests/temp_config.json');
    fs.writeFileSync(tempPath, '{invalid json}', 'utf-8');
    expect(() => ConfigLoader.loadJSONConfig(tempPath)).toThrow(/Failed to parse config file/);
  });

  it('merges configs with correct precedence', () => {
    const defaults = { server: { host: 'default', port: 1000 }, llm: { provider: 'openai', model: 'gpt' } };
    const fileConfig = { server: { port: 2000 }, llm: { provider: 'openai', model: 'gpt-3.5-turbo' } };
    const cliConfig = { server: { host: 'cli' } };
    const merged = ConfigLoader.mergeConfigs(defaults, fileConfig, cliConfig);
    expect(merged.server).toEqual({ host: 'cli', port: 2000 });
    expect(merged.llm).toEqual({ provider: 'openai', model: 'gpt-3.5-turbo' });
  });

  it('validates a correct config', () => {
    expect(() => ConfigLoader.validateConfig(sampleConfig)).not.toThrow();
  });

  it('throws on missing required fields', () => {
    expect(() => ConfigLoader.validateConfig({} as AgentConfig)).toThrow(/Missing server config/);
    expect(() => ConfigLoader.validateConfig({ server: {} } as AgentConfig)).toThrow(/Missing llm config/);
    expect(() => ConfigLoader.validateConfig({ server: {}, llm: {} } as AgentConfig)).toThrow(/Missing llm.provider/);
    expect(() => ConfigLoader.validateConfig({ server: {}, llm: { provider: 'x' } } as AgentConfig)).toThrow(/Missing llm.model/);
  });

  it('saves config to JSON file', () => {
    const tempPath = path.resolve('./tests/temp_config.json');
    ConfigLoader.saveConfig(sampleConfig, tempPath);
    const raw = fs.readFileSync(tempPath, 'utf-8');
    const loaded = JSON.parse(raw);
    expect(loaded.server).toEqual(sampleConfig.server);
    expect(loaded.llm).toEqual(sampleConfig.llm);
  });
}); 