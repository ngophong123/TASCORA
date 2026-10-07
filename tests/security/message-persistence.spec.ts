import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ list: vi.fn(), conversation: vi.fn(), create: vi.fn(), update: vi.fn(), emit: vi.fn(), transaction: vi.fn() }));
vi.mock('../../apps/api/src/lib/prisma', () => {
  const client = { $queryRaw: vi.fn(), notification: { create: vi.fn() }, conversation: { findMany: mocks.list, findUnique: mocks.conversation, update: mocks.update }, message: { create: mocks.create } };
  mocks.transaction.mockImplementation(async (fn: (tx: typeof client) => Promise<unknown>) => fn(client));
  return { prisma: { ...client, $transaction: mocks.transaction } };
});
vi.mock('../../apps/api/src/lib/socket', () => ({ getIO: () => ({ to: () => ({ emit: mocks.emit }) }) }));
import { MessageService } from '../../apps/api/src/modules/message/message.service';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.conversation.mockResolvedValue({ participant1Id: 'one', participant2Id: 'two', unreadCount1: 7, unreadCount2: 8 });
  mocks.create.mockResolvedValue({ id: 'message' });
  mocks.update.mockResolvedValue({});
});

it('omits private seller fields from both conversation participants', async () => {
  await MessageService.getConversations('one');
  const include = mocks.list.mock.calls[0]![0].include;
  for (const participant of [include.participant1, include.participant2]) {
    expect(participant.select.sellerProfile.select.firstName).toBe(true);
    expect(participant.select.sellerProfile.select).not.toHaveProperty('stripeAccountId');
    expect(participant.select.sellerProfile.select).not.toHaveProperty('identityVerification');
  }
});

it.each([['one', 'unreadCount2', 'unreadCount1'], ['two', 'unreadCount1', 'unreadCount2']])('increments only the receiver counter for %s', async (sender, incremented, untouched) => {
  await MessageService.sendMessage('conversation', sender, 'Hello');
  expect(mocks.transaction).toHaveBeenCalledOnce();
  const data = mocks.update.mock.calls[0]![0].data;
  expect(data[incremented]).toEqual({ increment: 1 });
  expect(data).not.toHaveProperty(untouched);
  expect(mocks.emit).toHaveBeenCalledTimes(2);
});

it('rejects nonparticipants before persistence or notification', async () => {
  await expect(MessageService.sendMessage('conversation', 'outsider', 'Hello')).rejects.toThrow('Unauthorized');
  expect(mocks.transaction).not.toHaveBeenCalled();
  expect(mocks.emit).not.toHaveBeenCalled();
});

it('does not broadcast a message when its conversation update fails', async () => {
  mocks.update.mockRejectedValueOnce(new Error('Database update failed'));
  await expect(MessageService.sendMessage('conversation', 'one', 'Hello')).rejects.toThrow('Database update failed');
  expect(mocks.emit).not.toHaveBeenCalled();
});
