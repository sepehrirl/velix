import { createJob } from '../../core/jobs/job.js';
import { parseVideoUrl } from '../../core/url.js';
import { JobQueue } from '../../core/queue/job-queue.js';

export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
  };
};

export type TelegramResponse = {
  chatId: number;
  text: string;
};

export function handleTelegramUpdate(
  update: TelegramUpdate,
  queue: JobQueue,
  createId: () => string = () => crypto.randomUUID(),
): TelegramResponse | undefined {
  const message = update.message;

  if (!message?.text) {
    return undefined;
  }

  const text = message.text.trim();

  if (text === '/start') {
    return {
      chatId: message.chat.id,
      text: '🎬 به VELIX خوش اومدی!\nلینک ویدیو رو بفرست تا بررسیش کنیم.',
    };
  }

  let parsedUrl: ReturnType<typeof parseVideoUrl>;

  try {
    parsedUrl = parseVideoUrl(text);
  } catch {
    return {
      chatId: message.chat.id,
      text: '❌ لطفاً یک لینک معتبر http یا https بفرست.',
    };
  }

  const job = createJob({ url: parsedUrl.url }, createId());
  queue.enqueue(job);

  return {
    chatId: message.chat.id,
    text: `✅ لینک دریافت شد.\n🆔 Job: ${job.id}\n📥 وضعیت: ${job.status}`,
  };
}
