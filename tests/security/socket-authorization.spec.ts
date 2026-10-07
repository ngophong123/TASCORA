import { afterEach, expect, it, vi } from 'vitest';
import http from 'http';
const mocks = vi.hoisted(() => ({ conversation: vi.fn(), message: vi.fn(), createMessage: vi.fn(), updateMessage: vi.fn(), updateConversation: vi.fn() }));
vi.mock('../../apps/api/src/lib/prisma', () => {
 const client = {
  $queryRaw: vi.fn(),
  notification: { create: vi.fn() },
  conversation: { findUnique: mocks.conversation, update: mocks.updateConversation },
  message: { findUnique: mocks.message, create: mocks.createMessage, update: mocks.updateMessage, count: vi.fn().mockResolvedValue(0) },
 };
 return { prisma: { ...client, $transaction: async (fn: (tx: typeof client) => Promise<unknown>) => fn(client) } };
});
vi.mock('../../apps/api/src/modules/auth/token', () => ({ authenticateAccess: vi.fn() }));
import { initSocket } from '../../apps/api/src/lib/socket';
const servers: ReturnType<typeof initSocket>[] = [];
afterEach(() => { for (const server of servers.splice(0)) server.close(); vi.clearAllMocks(); });

function socketFixture() {
  const io = initSocket(http.createServer()); servers.push(io);
  const handlers = new Map<string, (data: unknown) => Promise<void>>();
  const socket = {
    id: 'test', data: { userId: 'participant', role: 'BUYER', sessionId: 'session', expiresAt: Date.now() + 10000 },
    handshake: { auth: { token: 'test-only' } },
    join: vi.fn(), leave: vi.fn(), use: vi.fn(), once: vi.fn(), disconnect: vi.fn(),
    on: (event: string, handler: (data: unknown) => Promise<void>) => handlers.set(event, handler),
    to: () => ({ emit: vi.fn() }),
  };
  io.sockets.listeners('connection')[0]!(socket);
  return { socket, handlers };
}
it('does not let a nonparticipant join a conversation', async () => {
  mocks.conversation.mockResolvedValue({ participant1Id: 'other', participant2Id: 'another' });
  const { socket, handlers } = socketFixture(); socket.join.mockClear();
  await handlers.get('join_conversation')!('private');
  expect(socket.join).not.toHaveBeenCalled();
});
it('allows a participant to join their conversation', async () => {
  mocks.conversation.mockResolvedValue({ participant1Id: 'participant', participant2Id: 'another' });
  const { socket, handlers } = socketFixture(); socket.join.mockClear();
  await handlers.get('join_conversation')!('private');
  expect(socket.join).toHaveBeenCalledWith('conv_private');
});
it('rejects read updates for another conversation or a nonparticipant', async () => {
  mocks.conversation.mockResolvedValue({ participant1Id: 'other', participant2Id: 'another' });
  const { handlers } = socketFixture();
  await handlers.get('mark_read')!({ messageId: 'message', conversationId: 'private' });
  expect(mocks.updateMessage).not.toHaveBeenCalled();
  mocks.conversation.mockResolvedValue({ participant1Id: 'participant', participant2Id: 'another' });
  mocks.message.mockResolvedValue({ conversationId: 'different', senderId: 'another' });
  await handlers.get('mark_read')!({ messageId: 'message', conversationId: 'private' });
  expect(mocks.updateMessage).not.toHaveBeenCalled();
});

it('sends without overwriting the sender unread counter', async () => {
  mocks.conversation.mockResolvedValue({ participant1Id: 'participant', participant2Id: 'another', unreadCount1: 3, unreadCount2: 4 });
  mocks.createMessage.mockResolvedValue({ id: 'message' });
  const { handlers } = socketFixture();
  await handlers.get('send_message')!({ conversationId: 'private', content: 'Hello' });
  expect(mocks.createMessage).toHaveBeenCalledOnce();
  const data = mocks.updateConversation.mock.calls[0]![0].data;
  expect(data.unreadCount2).toEqual({ increment: 1 });
  expect(data).not.toHaveProperty('unreadCount1');
});

it('marks read without overwriting the other participant counter', async () => {
  mocks.conversation.mockResolvedValue({ participant1Id: 'participant', participant2Id: 'another', unreadCount1: 3, unreadCount2: 4 });
  mocks.message.mockResolvedValue({ conversationId: 'private', senderId: 'another' });
  const { handlers } = socketFixture();
  await handlers.get('mark_read')!({ messageId: 'message', conversationId: 'private' });
  const data = mocks.updateConversation.mock.calls[0]![0].data;
  expect(data.unreadCount1).toBe(0);
  expect(data).not.toHaveProperty('unreadCount2');
});
