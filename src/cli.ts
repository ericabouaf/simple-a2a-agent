#!/usr/bin/env node
import { ConfigLoader } from "./configLoader";
import { startServer } from "./server";
import { PortUtility } from "./portUtility";
import * as path from "path";

function printBanner(chalk: any) {
  console.log(chalk.cyanBright("\n=== A2A Agent Server ===\n"));
}

function printConfig(config: any, chalk: any) {
  console.log(chalk.magentaBright("\nLoaded Configuration:"));
  console.log(chalk.gray("----------------------"));
  console.log(chalk.whiteBright(
    JSON.stringify(config, null, 2)
  ));
}

async function buildConfig() {
  // Parse CLI args
  const cliConfig = ConfigLoader.parseCLI(process.argv);

  // Load config file if provided
  let fileConfig = {};
  if (cliConfig.configPath) {
    fileConfig = ConfigLoader.loadJSONConfig(path.resolve(cliConfig.configPath));
  }
  const config = ConfigLoader.mergeConfigs({}, fileConfig, cliConfig);

  // Ensure a port is set, using PortUtility if needed
  if (!config.server.port) {
    config.server.port = await PortUtility.findAvailablePort();
  }

  return config;
}

async function main() {
  const chalk = (await import('chalk')).default;

  printBanner(chalk);

  const config = await buildConfig();

  printConfig(config, chalk);

  const agentCard = await startServer(config);
  // Display the agent card nicely
  console.log(chalk.cyanBright("\nA2A Agent Card:"));
  console.log(chalk.gray("----------------------"));
  console.log(chalk.whiteBright(
    JSON.stringify(agentCard, null, 2)
  ));
  console.log(chalk.gray("----------------------\n"));

  console.log(chalk.green("Server started successfully. Press Ctrl+C to stop."));

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log(chalk.yellow("\nReceived SIGINT. Shutting down..."));
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    console.log(chalk.yellow("\nReceived SIGTERM. Shutting down..."));
    process.exit(0);
  });
}

main();
