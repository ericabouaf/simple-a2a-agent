#!/usr/bin/env node
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
const configLoader_1 = require("./configLoader");
const server_1 = require("./server");
const portUtility_1 = require("./portUtility");
const path = __importStar(require("path"));
function printBanner(chalk) {
    console.log(chalk.cyanBright("\n=== A2A Agent Server ===\n"));
}
function printConfig(config, chalk) {
    console.log(chalk.magentaBright("\nLoaded Configuration:"));
    console.log(chalk.gray("----------------------"));
    console.log(chalk.whiteBright(JSON.stringify(config, null, 2)));
}
async function buildConfig() {
    // Parse CLI args
    const cliConfig = configLoader_1.ConfigLoader.parseCLI(process.argv);
    // Load config file if provided
    let fileConfig = {};
    if (cliConfig.configPath) {
        fileConfig = configLoader_1.ConfigLoader.loadJSONConfig(path.resolve(cliConfig.configPath));
    }
    const config = configLoader_1.ConfigLoader.mergeConfigs({}, fileConfig, cliConfig);
    // Ensure a port is set, using PortUtility if needed
    if (!config.server.port) {
        config.server.port = await portUtility_1.PortUtility.findAvailablePort();
    }
    return config;
}
async function main() {
    const chalk = (await import('chalk')).default;
    printBanner(chalk);
    const config = await buildConfig();
    printConfig(config, chalk);
    const agentCard = await (0, server_1.startServer)(config);
    // Display the agent card nicely
    console.log(chalk.cyanBright("\nA2A Agent Card:"));
    console.log(chalk.gray("----------------------"));
    console.log(chalk.whiteBright(JSON.stringify(agentCard, null, 2)));
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
