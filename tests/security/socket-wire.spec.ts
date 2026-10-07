import http from 'node:http';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { io as connect, type Socket } from '../../apps/web/node_modules/socket.io-client';
const state = vi.hoisted(() => ({ sessionLifetime: 60000, revoked: new Set<string>(), conversation: vi.fn(), create: vi.fn(), update: vi.fn(), notification: vi.fn() }));
vi.mock('../../apps/api/src/lib/prisma', () => {
  const client = {
    $queryRaw: vi.fn(),
    user: { findUnique: async ({ where }: { where: { id: string } }) => ['buyer', 'seller', 'outsider'].includes(where.id) ? { id: where.id, status: 'ACTIVE', role: where.id === 'seller' ? 'SELLER' : 'BUYER' } : null },
    userSession: { findUnique: async ({ where }: { where: { id: string } }) => where.id.startsWith('session_') ? { id: where.id, userId: where.id.slice(8), revoked: state.revoked.has(where.id), expiresAt: new Date(Date.now() + state.sessionLifetime) } : null },
    conversation: { findUnique: state.conversation, update: state.update },
    message: { create: state.create }, notification: { create: state.notification },
  };
  return { prisma: { ...client, $transaction: async (fn: (tx: typeof client) => Promise<unknown>) => fn(client) } };
});
import { initSocket } from '../../apps/api/src/lib/socket';
import { signAccessToken } from '../../apps/api/src/modules/auth/token';
let server: ReturnType<typeof initSocket>, address: string;
const clients: Socket[] = [];
beforeEach(async () => {
  vi.clearAllMocks(); state.revoked.clear(); state.sessionLifetime = 60000;
  state.conversation.mockResolvedValue({ id: 'private', participant1Id: 'buyer', participant2Id: 'seller', unreadCount1: 0, unreadCount2: 0 });
  state.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ ...data, id: 'message', createdAt: new Date(), isRead: false }));
  const listener = http.createServer(); server = initSocket(listener);
  await new Promise<void>(resolve => listener.listen(0, '127.0.0.1', resolve));
  const bound = listener.address(); if (!bound || typeof bound === 'string') throw new Error('No loopback test address');
  address = `http://127.0.0.1:${bound.port}`;
});
afterEach(async () => { for (const client of clients.splice(0)) { client.removeAllListeners(); client.disconnect(); } await new Promise<void>(resolve => server.close(() => resolve())); });
function clientFor(actor: string, origin = 'http://localhost:3000', token = signAccessToken({ id: actor, role: actor === 'seller' ? 'SELLER' : 'BUYER' }, `session_${actor}`)) {
  const client = connect(address, { auth: { token }, transports: ['websocket'], reconnection: false, forceNew: true, extraHeaders: { Origin: origin } }); clients.push(client);
  return { client, connected: new Promise<void>((resolve, reject) => { client.once('connect', () => resolve()); client.once('connect_error', reject); }) };
}
it('rejects tampered JWTs and untrusted origins on actual Socket.IO handshakes', async () => {
  await expect(clientFor('buyer', 'http://localhost:3000', 'tampered.token.value').connected).rejects.toThrow('Authentication error');
  await expect(clientFor('buyer', 'https://attacker.invalid').connected).rejects.toThrow();
  expect(server.sockets.sockets.size).toBe(0);
});
it('does not allow an authenticated outsider to join or send to a private conversation', async () => {
  const { client, connected } = clientFor('outsider'); await connected;
  client.emit('join_conversation', 'private');
  await vi.waitFor(() => expect(state.conversation).toHaveBeenCalledTimes(1));
  expect(server.sockets.adapter.rooms.get('conv_private')?.has(client.id!)).not.toBe(true);
  client.emit('send_message', { conversationId: 'private', content: 'Denied' });
  await vi.waitFor(() => expect(state.conversation).toHaveBeenCalledTimes(2));
  expect(state.create).not.toHaveBeenCalled();
});
it('delivers an authenticated participant message using the JWT actor rather than supplied sender fields', async () => {
  const buyer = clientFor('buyer'), seller = clientFor('seller'); await Promise.all([buyer.connected, seller.connected]);
  buyer.client.emit('join_conversation', 'private'); seller.client.emit('join_conversation', 'private');
  const delivered = new Promise<{ senderId: string; content: string }>(resolve => seller.client.once('new_message', resolve));
  buyer.client.emit('send_message', { conversationId: 'private', content: 'Real wire message', senderId: 'seller' });
  expect(await delivered).toMatchObject({ senderId: 'buyer', content: 'Real wire message' });
  expect(state.create).toHaveBeenCalledOnce();
  expect(state.notification.mock.calls[0]![0].data.userId).toBe('seller');
});
it('disconnects a revoked session before processing its next packet', async () => {
  const { client, connected } = clientFor('buyer'); await connected;
  state.revoked.add('session_buyer');
  const disconnected = new Promise<void>(resolve => client.once('disconnect', () => resolve()));
  client.emit('send_message', { conversationId: 'private', content: 'Rejected after revocation' });
  await disconnected;
  expect(state.create).not.toHaveBeenCalled();
});

it('disconnects an idle socket at absolute session expiry before JWT expiry', async () => {
  state.sessionLifetime = 250;
  const { client, connected } = clientFor('buyer'); await connected;
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Idle socket survived session expiry')), 2000);
    client.once('disconnect', () => { clearTimeout(timeout); resolve(); });
  });
  expect(state.create).not.toHaveBeenCalled();
});
