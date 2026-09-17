import { describe, expect, it, vi } from 'vitest';
import { TelegramClient } from '../../src/api/telegram-client.js';

describe('TelegramClient', () => {
  it('sends a text message through the Telegram Bot API', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: { message_id: 42 } }), { status: 200 }),
    );
    const client = new TelegramClient('test-token', { fetchImpl: fetchMock });

    await expect(client.sendMessage(456, 'Different message')).resolves.toEqual({ message_id: 42 });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: 456, text: 'Different message' }),
      }),
    );
  });

  it('supports a custom API base URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: { message_id: 7 } }), { status: 200 }),
    );
    const client = new TelegramClient('test-token', {
      apiBaseUrl: 'https://telegram.test',
      fetchImpl: fetchMock,
    });

    await expect(client.sendMessage(789, 'Hello')).resolves.toEqual({ message_id: 7 });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://telegram.test/bottest-token/sendMessage',
      expect.anything(),
    );
  });

  it('throws when Telegram reports an API error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: false, description: 'Unauthorized' }), { status: 401 }),
    );
    const client = new TelegramClient('bad-token', { fetchImpl: fetchMock });

    await expect(client.sendMessage(123, 'Hello')).rejects.toThrow('Telegram API error: Unauthorized');
  });
});
