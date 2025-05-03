import { PortUtility } from '../src/portUtility';
import * as net from 'net';

function getRandomPort() {
  return Math.floor(Math.random() * 10000) + 40000;
}

describe('PortUtility', () => {
  let server: net.Server | null = null;
  let testPort: number;

  afterEach((done) => {
    if (server) {
      server.close(() => {
        server = null;
        done();
      });
    } else {
      done();
    }
  });

  it('should report a free port as available', async () => {
    testPort = getRandomPort();
    const available = await PortUtility.isPortAvailable(testPort);
    expect(available).toBe(true);
  }, 10000);

  it('should report an occupied port as unavailable', async () => {
    testPort = getRandomPort();
    server = net.createServer().listen(testPort);
    await new Promise((resolve) => server!.once('listening', resolve));
    const available = await PortUtility.isPortAvailable(testPort);
    expect(available).toBe(false);
  }, 10000);

  it('should find an available port in the given range', async () => {
    const min = getRandomPort();
    const max = min + 10;
    const port = await PortUtility.findAvailablePort(min, max, 10);
    expect(port).toBeGreaterThanOrEqual(min);
    expect(port).toBeLessThanOrEqual(max);
  }, 10000);

  it('should throw if no ports are available in the range', async () => {
    const min = getRandomPort();
    const max = min + 2;
    // Occupy all ports in the range
    const servers: net.Server[] = [];
    for (let p = min; p <= max; p++) {
      const s = net.createServer().listen(p);
      await new Promise((resolve) => s.once('listening', resolve));
      servers.push(s);
    }
    await expect(
      PortUtility.findAvailablePort(min, max, 5)
    ).rejects.toThrow(/No available port found/);
    // Cleanup
    for (const s of servers) {
      await new Promise((resolve) => s.close(resolve));
    }
  }, 20000);
}); 