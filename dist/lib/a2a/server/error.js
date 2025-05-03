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
exports.A2AError = void 0;
const schema = __importStar(require("../schema.js"));
/**
 * Custom error class for A2A server operations, incorporating JSON-RPC error codes.
 */
class A2AError extends Error {
    code;
    data;
    taskId; // Optional task ID context
    constructor(code, message, data, taskId) {
        super(message);
        this.name = "A2AError";
        this.code = code;
        this.data = data;
        this.taskId = taskId; // Store associated task ID if provided
    }
    /**
     * Formats the error into a standard JSON-RPC error object structure.
     */
    toJSONRPCError() {
        const errorObject = {
            code: this.code,
            message: this.message,
        };
        if (this.data !== undefined) {
            errorObject.data = this.data;
        }
        return errorObject;
    }
    // Static factory methods for common errors
    static parseError(message, data) {
        return new A2AError(schema.ErrorCodeParseError, message, data);
    }
    static invalidRequest(message, data) {
        return new A2AError(schema.ErrorCodeInvalidRequest, message, data);
    }
    static methodNotFound(method) {
        return new A2AError(schema.ErrorCodeMethodNotFound, `Method not found: ${method}`);
    }
    static invalidParams(message, data) {
        return new A2AError(schema.ErrorCodeInvalidParams, message, data);
    }
    static internalError(message, data) {
        return new A2AError(schema.ErrorCodeInternalError, message, data);
    }
    static taskNotFound(taskId) {
        return new A2AError(schema.ErrorCodeTaskNotFound, `Task not found: ${taskId}`, undefined, taskId);
    }
    static taskNotCancelable(taskId) {
        return new A2AError(schema.ErrorCodeTaskNotCancelable, `Task not cancelable: ${taskId}`, undefined, taskId);
    }
    static pushNotificationNotSupported() {
        return new A2AError(schema.ErrorCodePushNotificationNotSupported, "Push Notification is not supported");
    }
    static unsupportedOperation(operation) {
        return new A2AError(schema.ErrorCodeUnsupportedOperation, `Unsupported operation: ${operation}`);
    }
}
exports.A2AError = A2AError;
