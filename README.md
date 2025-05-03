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
```

## Installation & Usage

### Install Globally (Recommended for CLI)

After building the project (see below), you can install the CLI globally:

```sh
npm install -g .
```

This will make the `simple-a2a-agent` command available anywhere:

```sh
simple-a2a-agent --config samples/sample-config.json
```

### Use with npx (No Install Required)

If you have published the package or want to use it directly from your local build, you can run:

```sh
npx simple-a2a-agent --config samples/sample-config.json
```

Or, if running from source before publishing, use:

```sh
npx tsx src/cli.ts --config samples/sample-config.json
```

## Build Step (Required for CLI)

Before using the CLI globally or with npx, make sure to build the TypeScript source:

```sh
npx tsc -p tsconfig.cli.json
```

This will output the compiled CLI to `dist/cli.js`, which is used by the global/npx command.

