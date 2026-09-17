import { handleTelegramUpdate, type TelegramUpdate } from './bot/handlers/telegram-update.js';
import { JobQueue } from './core/queue/job-queue.js';
import { TelegramClient } from './api/telegram-client.js';

export interface Env {
  TELEGRAM_BOT_TOKEN: string;
}

const queue = new JobQueue();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return Response.json({ ok: true, service: 'VELIX' });
    }

    if (request.method !== 'POST' || url.pathname !== '/telegram/webhook') {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    let update: TelegramUpdate;

    try {
      update = (await request.json()) as TelegramUpdate;
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const response = handleTelegramUpdate(update, queue);

    if (response) {
      const telegram = new TelegramClient(env.TELEGRAM_BOT_TOKEN);
      await telegram.sendMessage(response.chatId, response.text);
    }

    return Response.json({ ok: true });
  },
};
