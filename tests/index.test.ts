import { describe, expect, it, vi } from 'vitest';
import worker from '../src/index.js';

describe('VELIX Worker', () => {
  it('returns health information', async () => {
    const response = await worker.fetch(new Request('https://velix.example/health'), {} as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      service: 'VELIX',
      version: '0.1.0',
      telegramConfigured: false,
    });
  });

  it('rejects unsupported routes', async () => {
    const response = await worker.fetch(new Request('https://velix.example/'), {} as never);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Not found' });
  });

  it('accepts a Telegram webhook update and replies through Telegram', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: { message_id: 99 } }), { status: 200 }),
    );

    const response = await worker.fetch(
      new Request('https://velix.example/telegram/webhook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          update_id: 1,
          message: { message_id: 1, chat: { id: 123 }, text: '/start' },
        }),
      }),
      { TELEGRAM_BOT_TOKEN: 'test-token', TELEGRAM_API_BASE_URL: 'https://api.telegram.test', fetchImpl: fetchMock } as never,
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.telegram.test/bottest-token/sendMessage',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('acknowledges the webhook even when Telegram sendMessage fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: false, description: 'Forbidden: bot was blocked by the user' }), { status: 403 }),
    );

    const response = await worker.fetch(
      new Request('https://velix.example/telegram/webhook', {
        method: 'POST',
        body: JSON.stringify({
          update_id: 2,
          message: { message_id: 2, chat: { id: 456 }, text: '/start' },
        }),
      }),
      { TELEGRAM_BOT_TOKEN: 'test-token', TELEGRAM_API_BASE_URL: 'https://api.telegram.test', fetchImpl: fetchMock } as never,
    );

    expect(response.status).toBe(200);
  });
});
