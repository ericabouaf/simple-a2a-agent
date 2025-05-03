"use strict";
/**
 * Main entry point for the A2A Server V2 library.
 * Exports the server class, store implementations, and core types.
 */
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
exports.schema = exports.A2AError = exports.FileStore = exports.InMemoryTaskStore = exports.A2AServer = void 0;
// Export the main server class and its options
var server_1 = require("./server");
Object.defineProperty(exports, "A2AServer", { enumerable: true, get: function () { return server_1.A2AServer; } });
var store_js_1 = require("./store.js");
Object.defineProperty(exports, "InMemoryTaskStore", { enumerable: true, get: function () { return store_js_1.InMemoryTaskStore; } });
Object.defineProperty(exports, "FileStore", { enumerable: true, get: function () { return store_js_1.FileStore; } });
// Export the custom error class
var error_js_1 = require("./error.js");
Object.defineProperty(exports, "A2AError", { enumerable: true, get: function () { return error_js_1.A2AError; } });
// Re-export all schema types for convenience
exports.schema = __importStar(require("../schema.js"));
// Example basic usage (for documentation or testing)
/*
import { A2AServer, TaskContext, TaskYieldUpdate, schema } from './index.js';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is installed

async function* mySimpleHandler(context: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
  console.log(`Handling task ${context.task.id}`);
  yield { state: 'working', message: { role: 'agent', parts: [{ text: 'Working on it...' }] } };

  // Simulate work
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (context.isCancelled()) {
     console.log("Task cancelled!");
     return;
  }

  yield {
    name: 'output.txt',
    parts: [{ text: `Result for task ${context.task.id}` }],
  };

  yield { state: 'completed', message: { role: 'agent', parts: [{ text: 'Done!' }] } };
}

// Create and start the server (e.g., using InMemoryTaskStore)
const server = new A2AServer(mySimpleHandler);
server.start();

console.log("Example server started on port 41241");

// To test (using curl or similar):
// 1. Send a task:
// curl -X POST http://localhost:41241 -H "Content-Type: application/json" -d \
// '{
//   "jsonrpc": "2.0",
//   "method": "tasks/send",
//   "id": 1,
//   "params": {
//     "id": "'$(uuidgen)'",
//     "message": {
//       "role": "user",
//       "parts": [{"text": "Please do the thing."}]
//     }
//   }
// }'
//
// 2. Send and subscribe:
// curl -N -X POST http://localhost:41241 -H "Content-Type: application/json" -d \
// '{
//   "jsonrpc": "2.0",
//   "method": "tasks/sendSubscribe",
//   "id": 2,
//   "params": {
//      "id": "'$(uuidgen)'",
//      "message": {
//        "role": "user",
//        "parts": [{"text": "Please do the streaming thing."}]
//      }
//    }
// }'
*/
