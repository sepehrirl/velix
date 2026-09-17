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
      return Response.json({ ok: true, service: 'VELIX', version: '0.1.0' });
    }

    if (request.method !== 'POST' || url.pathname !== '/telegram/webhook') {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    if (!env.TELEGRAM_BOT_TOKEN) {
      return Response.json({ error: 'Telegram bot token is not configured' }, { status: 500 });
    }

    let update: TelegramUpdate;

    try {
      update = (await request.json()) as TelegramUpdate;
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const response = handleTelegramUpdate(update, queue);

    if (response) {
      const telegram = new TelegramClient(env.TELEGRAM_BOT_TOKEN, {
        apiBaseUrl: env.TELEGRAM_API_BASE_URL,
        fetchImpl: env.fetchImpl,
      });
      await telegram.sendMessage(response.chatId, response.text);
    }

    return Response.json({ ok: true });
  },
};
