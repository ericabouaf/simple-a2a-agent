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
exports.PortUtility = void 0;
const net = __importStar(require("net"));
/**
 * Utility for port availability checking and autodetection.
 */
class PortUtility {
    /**
     * Check if a specific port is available on the given host.
     */
    static isPortAvailable(port, host = '0.0.0.0') {
        return new Promise((resolve) => {
            const server = net.createServer()
                .once('error', () => resolve(false))
                .once('listening', () => {
                server.close(() => resolve(true));
            })
                .listen(port, host);
        });
    }
    /**
     * Find a random available port in the given range.
     * Retries up to maxAttempts times.
     */
    static async findAvailablePort(min = 3000, max = 9000, maxAttempts = 20, host = '0.0.0.0') {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const port = Math.floor(Math.random() * (max - min + 1)) + min;
            if (await this.isPortAvailable(port, host)) {
                return port;
            }
        }
        throw new Error(`No available port found in range ${min}-${max} after ${maxAttempts} attempts.`);
    }
}
exports.PortUtility = PortUtility;
