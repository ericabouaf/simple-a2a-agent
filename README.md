# Simple A2A Agent

A tool to quickly spin up simple Agent-to-Agent (A2A) servers.

## Features

- Run A2A servers from CLI parameters or a JSON config file
- Autodetect available port (if not configured)
- Select LLM model and model parameters to use (through [VoltAgent](https://github.com/VoltAgent/voltagent))
- Add MCP tools to the agent (through [VoltAgent](https://github.com/VoltAgent/voltagent))

## WARNING: Experimental

This project was done for educational purposes only, it is not production ready.
Use at your own risks.


## Installation

### Install Globally (Recommended for CLI)

After building the project (see below), you can install the CLI globally:

```sh
npm install -g simple-a2a-agent
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


## Usage


### Without config file

Export the required environment variables (depending on your model provider):

```sh
export OPENAI_API_KEY=sk-your-key
```

Run an agent (the description is the system prompt) :

```sh
npx simple-a2a-agent \
    --name "Cool agent" \
    --description "Reply with a cool description and emojis" \
    --llm-provider openai \
    --llm-model gpt-4o-mini
```

### With config file

```sh
npx simple-a2a-agent --config samples/sample-config.json
```

or even shorter :

```sh
npx simple-a2a-agent -c samples/mcp-sample-config.json
```

### Improvements / TODO

- Remove option for config file (use first argument)
- Add an example for Anthropic Claude
- Split the agentCard description from the system prompt
- Use a future official A2A typescript SDK (for the time being, we imported files from https://github.com/google/A2A)
- Support for additional A2A features (streaming, input/output modes, ...)
