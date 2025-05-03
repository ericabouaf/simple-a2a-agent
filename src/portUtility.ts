import * as net from 'net';

/**
 * Utility for port availability checking and autodetection.
 */
export class PortUtility {
  /**
   * Check if a specific port is available on the given host.
   */
  static isPortAvailable(port: number, host: string = '0.0.0.0'): Promise<boolean> {
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
  static async findAvailablePort(
    min: number = 3000,
    max: number = 9000,
    maxAttempts: number = 20,
    host: string = '0.0.0.0'
  ): Promise<number> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const port = Math.floor(Math.random() * (max - min + 1)) + min;
      if (await this.isPortAvailable(port, host)) {
        return port;
      }
    }
    throw new Error(`No available port found in range ${min}-${max} after ${maxAttempts} attempts.`);
  }
} 