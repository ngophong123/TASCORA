import net from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ClamdMalwareScanner,
  parseClamdScanReply,
  parseClamdVersionReply,
} from '../../apps/api/src/modules/kyc/malware-scanner';

interface MockClamdOptions {
  versionReply?: string;
  onInstream?: (bytesReceived: number, connectionIndex: number) => Promise<string> | string;
  hangInstream?: boolean;
  delayMs?: number;
}

async function startMockClamdServer(opts: MockClamdOptions) {
  const events = {
    versionCalls: 0,
    instreamCalls: 0,
    activeInstream: 0,
    maxConcurrentInstream: 0,
    totalInstreamBytes: [] as number[],
  };
  const sockets = new Set<net.Socket>();

  const server = net.createServer(socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));

    let mode: 'header' | 'instream' | 'done' = 'header';
    let buffer = Buffer.alloc(0);
    let currentStreamBytes = 0;

    const handleInstreamBuffer = async () => {
      while (mode === 'instream') {
        if (buffer.length < 4) return;
        const chunkLen = buffer.readUInt32BE(0);
        if (chunkLen === 0) {
          buffer = buffer.subarray(4);
          mode = 'done';
          events.totalInstreamBytes.push(currentStreamBytes);
          if (opts.hangInstream) {
            return;
          }
          if (opts.delayMs) {
            await new Promise(resolve => setTimeout(resolve, opts.delayMs));
          }
          const reply = opts.onInstream
            ? await opts.onInstream(currentStreamBytes, events.instreamCalls)
            : 'stream: OK\0';
          events.activeInstream -= 1;
          socket.end(reply);
          return;
        }
        if (buffer.length < 4 + chunkLen) return;
        currentStreamBytes += chunkLen;
        buffer = buffer.subarray(4 + chunkLen);
      }
    };

    socket.on('data', chunk => {
      buffer = Buffer.concat([buffer, chunk]);
      if (mode === 'header') {
        const nulIndex = buffer.indexOf(0);
        if (nulIndex === -1) return;
        const cmd = buffer.subarray(0, nulIndex).toString('utf8');
        buffer = buffer.subarray(nulIndex + 1);
        if (cmd === 'zVERSION') {
          events.versionCalls += 1;
          socket.write(opts.versionReply ?? 'ClamAV 1.4.2/27480\0');
          socket.end();
          return;
        }
        if (cmd === 'zINSTREAM') {
          events.instreamCalls += 1;
          events.activeInstream += 1;
          if (events.activeInstream > events.maxConcurrentInstream) {
            events.maxConcurrentInstream = events.activeInstream;
          }
          mode = 'instream';
          void handleInstreamBuffer();
        }
      } else if (mode === 'instream') {
        void handleInstreamBuffer();
      }
    });

    socket.on('error', () => {
      if (mode === 'instream' && events.activeInstream > 0) {
        events.activeInstream -= 1;
      }
    });
  });

  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as net.AddressInfo;

  return {
    host: '127.0.0.1',
    port: address.port,
    events,
    async close() {
      for (const s of sockets) s.destroy();
      await new Promise<void>(resolve => server.close(() => resolve()));
    },
  };
}

describe('Workstream C: ClamdMalwareScanner protocol hardening & bounded streaming', () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    while (cleanups.length > 0) {
      await cleanups.pop()!();
    }
  });

  it('rejects UNKNOWN COMMAND and error replies in parseClamdVersionReply instead of persisting bogus versions', () => {
    expect(parseClamdVersionReply('ClamAV 1.4.2/27480\0')).toBe('ClamAV 1.4.2/27480');
    expect(parseClamdVersionReply('UNKNOWN COMMAND\0')).toBeNull();
    expect(parseClamdVersionReply('ERROR: command disabled\0')).toBeNull();
    expect(parseClamdVersionReply('   \0')).toBeNull();
    expect(parseClamdVersionReply('malformed reply with\nnewline')).toBeNull();
  });

  it('fails closed on ambiguous, empty, or error zINSTREAM replies in parseClamdScanReply', () => {
    const now = new Date();
    expect(parseClamdScanReply('stream: OK\0', 'ClamAV 1.4', now)).toMatchObject({
      verdict: 'CLEAN',
      scanStatus: 'VERIFIED_SAFE',
      engineVersion: 'ClamAV 1.4',
    });
    expect(parseClamdScanReply('stream: Eicar-Signature FOUND\0', 'ClamAV 1.4', now)).toMatchObject({
      verdict: 'INFECTED',
      scanStatus: 'INFECTED',
    });
    expect(parseClamdScanReply('UNKNOWN COMMAND\0', 'ClamAV 1.4', now)).toMatchObject({
      verdict: 'FAILED',
      scanStatus: 'SCAN_FAILED',
    });
    expect(parseClamdScanReply('stream: File size limit exceeded. ERROR\0', 'ClamAV 1.4', now)).toMatchObject({
      verdict: 'FAILED',
      scanStatus: 'SCAN_FAILED',
    });
    expect(parseClamdScanReply('', null, now)).toMatchObject({
      verdict: 'FAILED',
      scanStatus: 'SCAN_FAILED',
    });
  });

  it('streams chunks over a single sequential zINSTREAM socket and caches valid zVERSION responses', async () => {
    const mock = await startMockClamdServer({
      versionReply: 'ClamAV 1.4.2/27490\0',
      onInstream: () => 'stream: OK\0',
    });
    cleanups.push(() => mock.close());

    const scanner = new ClamdMalwareScanner(mock.host, mock.port, 5000, {
      versionCacheTtlMs: 60_000,
    });

    const payload = Buffer.alloc(150 * 1024, 0x41);
    const first = await scanner.scanBuffer(payload, 'user/a.png');
    const second = await scanner.scanBuffer(Buffer.from('second-file'), 'user/b.png');

    expect(first).toMatchObject({
      verdict: 'CLEAN',
      scanStatus: 'VERIFIED_SAFE',
      engineVersion: 'ClamAV 1.4.2/27490',
    });
    expect(second).toMatchObject({
      verdict: 'CLEAN',
      scanStatus: 'VERIFIED_SAFE',
      engineVersion: 'ClamAV 1.4.2/27490',
    });
    expect(mock.events.versionCalls).toBe(1);
    expect(mock.events.instreamCalls).toBe(2);
    expect(mock.events.totalInstreamBytes).toEqual([150 * 1024, 11]);
  });

  it('rejects empty buffers and buffers exceeding maxBytes fail-closed without opening zINSTREAM', async () => {
    const mock = await startMockClamdServer({});
    cleanups.push(() => mock.close());

    const scanner = new ClamdMalwareScanner(mock.host, mock.port, 5000, {
      maxBytes: 1024,
      fetchVersion: false,
    });

    const emptyRes = await scanner.scanBuffer(Buffer.alloc(0), 'user/empty.png');
    expect(emptyRes).toMatchObject({ verdict: 'FAILED', scanStatus: 'SCAN_FAILED' });

    const oversizedRes = await scanner.scanBuffer(Buffer.alloc(1025, 0x42), 'user/huge.png');
    expect(oversizedRes).toMatchObject({ verdict: 'FAILED', scanStatus: 'SCAN_FAILED' });
    expect(oversizedRes.resultDetail).toContain('SCAN_PAYLOAD_TOO_LARGE');
    expect(mock.events.instreamCalls).toBe(0);
  });

  it('handles zVERSION UNKNOWN COMMAND gracefully, detects malware, and fails closed on socket timeout', async () => {
    const eicarServer = await startMockClamdServer({
      versionReply: 'UNKNOWN COMMAND\0',
      onInstream: () => 'stream: Eicar-Test-Signature FOUND\0',
    });
    cleanups.push(() => eicarServer.close());

    const eicarScanner = new ClamdMalwareScanner(eicarServer.host, eicarServer.port, 5000);
    const infected = await eicarScanner.scanBuffer(Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR'), 'user/eicar.png');
    expect(infected).toMatchObject({
      verdict: 'INFECTED',
      scanStatus: 'INFECTED',
      engineVersion: null,
    });

    const silentServer = await startMockClamdServer({ hangInstream: true });
    cleanups.push(() => silentServer.close());

    const timeoutScanner = new ClamdMalwareScanner(silentServer.host, silentServer.port, 120, {
      connectTimeoutMs: 120,
      fetchVersion: false,
    });
    const timedOut = await timeoutScanner.scanBuffer(Buffer.from('timeout-check'), 'user/timeout.png');
    expect(timedOut).toMatchObject({
      verdict: 'FAILED',
      scanStatus: 'SCAN_FAILED',
    });
  });

  it('bounds concurrent clamd scans via AsyncSemaphore', async () => {
    const slowServer = await startMockClamdServer({
      delayMs: 40,
      onInstream: () => 'stream: OK\0',
    });
    cleanups.push(() => slowServer.close());

    const boundedScanner = new ClamdMalwareScanner(slowServer.host, slowServer.port, 5000, {
      maxConcurrentScans: 2,
      fetchVersion: false,
    });

    const results = await Promise.all(
      Array.from({ length: 5 }, (_, idx) => boundedScanner.scanBuffer(Buffer.from(`doc-${idx}`), `user/${idx}.png`))
    );
    expect(results.every(r => r.verdict === 'CLEAN')).toBe(true);
    expect(slowServer.events.maxConcurrentInstream).toBeLessThanOrEqual(2);
    expect(slowServer.events.instreamCalls).toBe(5);
  });
});
