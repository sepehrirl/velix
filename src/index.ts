import { handleTelegramUpdate, type TelegramUpdate } from './bot/handlers/telegram-update.js';
import { JobQueue } from './core/queue/job-queue.js';
import { TelegramClient } from './api/telegram-client.js';

export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_API_BASE_URL?: string;
  fetchImpl?: typeof fetch;
}

const queue = new JobQueue();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return Response.json({
        ok: true,
        service: 'VELIX',
        version: '0.1.0',
        telegramConfigured: Boolean(env.TELEGRAM_BOT_TOKEN),
      });
    }

    if (request.method !== 'POST' || url.pathname !== '/telegram/webhook') {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    if (!env.TELEGRAM_BOT_TOKEN) {
      console.error('Telegram bot token is not configured');
      return Response.json({ ok: true });
    }

    let update: TelegramUpdate;

    try {
      update = (await request.json()) as TelegramUpdate;
    } catch (error) {
      console.error('Invalid Telegram update JSON', error);
      return Response.json({ ok: true });
    }

    let response;

    try {
      response = handleTelegramUpdate(update, queue);
    } catch (error) {
      console.error('Telegram update handler failed', error);
      return Response.json({ ok: true });
    }

    if (!response) {
      return Response.json({ ok: true });
    }

    try {
      const telegram = new TelegramClient(env.TELEGRAM_BOT_TOKEN, {
        apiBaseUrl: env.TELEGRAM_API_BASE_URL,
        fetchImpl: env.fetchImpl,
      });

      await telegram.sendMessage(response.chatId, response.text);
    } catch (error) {
      console.error('Telegram sendMessage failed', error);
      // Always acknowledge Telegram's webhook request. Telegram retries a 5xx
      // response, which can otherwise build an ever-growing pending queue.
    }

    return Response.json({ ok: true });
  },
};
