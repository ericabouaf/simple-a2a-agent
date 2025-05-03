# Simple A2A Agent

A CLI tool to quickly spin up simple Agent-to-Agent (A2A) servers.

## Features
- Run A2A servers from CLI parameters
- Run A2A servers from a JSON config file
- Autodetect available port
- Select LLM model and model parameters to use
- Add MCP tools to the agent


## Usage


### Without config file

```sh
npx tsx src/cli.ts \
    --name "Cool agent" \
    --description "Reply with a cool description and emojis" \
    --llm-provider openai \
    --llm-model gpt-4o-mini
```

### With config file

```sh
npx tsx src/cli.ts --config samples/sample-config.json
```

or even shorter :

```sh
npx tsx src/cli.ts -c samples/mcp-sample-config.json
````

