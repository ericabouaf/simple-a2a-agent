"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStore = exports.InMemoryTaskStore = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const error_js_1 = require("./error.js");
// ========================
// InMemoryTaskStore
// ========================
// Use TaskAndHistory directly for storage
class InMemoryTaskStore {
    store = new Map();
    async load(taskId) {
        const entry = this.store.get(taskId);
        // Return copies to prevent external mutation
        return entry
            ? { task: { ...entry.task }, history: [...entry.history] }
            : null;
    }
    async save(data) {
        // Store copies to prevent internal mutation if caller reuses objects
        this.store.set(data.task.id, {
            task: { ...data.task },
            history: [...data.history],
        });
    }
}
exports.InMemoryTaskStore = InMemoryTaskStore;
// ========================
// FileStore
// ========================
class FileStore {
    baseDir;
    constructor(options) {
        // Default directory relative to the current working directory
        this.baseDir = options?.dir || ".a2a-tasks";
    }
    async ensureDirectoryExists() {
        try {
            await promises_1.default.mkdir(this.baseDir, { recursive: true });
        }
        catch (error) {
            throw error_js_1.A2AError.internalError(`Failed to create directory ${this.baseDir}: ${error.message}`, error);
        }
    }
    getTaskFilePath(taskId) {
        // Sanitize taskId to prevent directory traversal
        const safeTaskId = path_1.default.basename(taskId);
        return path_1.default.join(this.baseDir, `${safeTaskId}.json`);
    }
    getHistoryFilePath(taskId) {
        // Sanitize taskId
        const safeTaskId = path_1.default.basename(taskId);
        if (safeTaskId !== taskId || taskId.includes("..")) {
            throw error_js_1.A2AError.invalidParams(`Invalid Task ID format: ${taskId}`);
        }
        return path_1.default.join(this.baseDir, `${safeTaskId}.history.json`);
    }
    // Type guard for history file content
    isHistoryFileContent(content) {
        return (typeof content === "object" &&
            content !== null &&
            Array.isArray(content.messageHistory) &&
            // Optional: Add deeper validation of message structure if needed
            content.messageHistory.every((msg) => typeof msg === "object" && msg.role && msg.parts));
    }
    async readJsonFile(filePath) {
        try {
            const data = await promises_1.default.readFile(filePath, "utf8");
            return JSON.parse(data);
        }
        catch (error) {
            if (error.code === "ENOENT") {
                return null; // File not found is not an error for loading
            }
            throw error_js_1.A2AError.internalError(`Failed to read file ${filePath}: ${error.message}`, error);
        }
    }
    async writeJsonFile(filePath, data) {
        try {
            await this.ensureDirectoryExists();
            await promises_1.default.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
        }
        catch (error) {
            throw error_js_1.A2AError.internalError(`Failed to write file ${filePath}: ${error.message}`, error);
        }
    }
    async load(taskId) {
        const taskFilePath = this.getTaskFilePath(taskId);
        const historyFilePath = this.getHistoryFilePath(taskId);
        // Read task file first - if it doesn't exist, the task doesn't exist.
        const task = await this.readJsonFile(taskFilePath);
        if (!task) {
            return null; // Task not found
        }
        // Task exists, now try to read history. It might not exist yet.
        let history = [];
        try {
            const historyContent = await this.readJsonFile(historyFilePath);
            // Validate the structure slightly
            if (this.isHistoryFileContent(historyContent)) {
                history = historyContent.messageHistory;
            }
            else if (historyContent !== null) {
                // Log a warning if the history file exists but is malformed
                console.warn(`[FileStore] Malformed history file found for task ${taskId} at ${historyFilePath}. Ignoring content.`);
                // Attempt to delete or rename the malformed file? Or just proceed with empty history.
                // For now, proceed with empty. A 'save' will overwrite it correctly later.
            }
            // If historyContent is null (file not found), history remains []
        }
        catch (error) {
            // Log error reading history but proceed with empty history
            console.error(`[FileStore] Error reading history file for task ${taskId}:`, error);
            // Proceed with empty history
        }
        return { task, history };
    }
    async save(data) {
        const { task, history } = data;
        const taskFilePath = this.getTaskFilePath(task.id);
        const historyFilePath = this.getHistoryFilePath(task.id);
        // Ensure directory exists (writeJsonFile does this, but good practice)
        await this.ensureDirectoryExists();
        // Write both files - potentially in parallel
        await Promise.all([
            this.writeJsonFile(taskFilePath, task),
            this.writeJsonFile(historyFilePath, { messageHistory: history }),
        ]);
    }
}
exports.FileStore = FileStore;
