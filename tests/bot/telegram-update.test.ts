import { describe, expect, it } from 'vitest';
import { handleTelegramUpdate } from '../../src/bot/handlers/telegram-update.js';
import { JobQueue } from '../../src/core/queue/job-queue.js';

describe('handleTelegramUpdate', () => {
  it('creates a queued job when a Telegram message contains a video URL', () => {
    const queue = new JobQueue();

    const response = handleTelegramUpdate(
      {
        update_id: 1,
        message: {
          message_id: 10,
          chat: { id: 123 },
          text: 'https://example.com/video',
        },
      },
      queue,
      () => 'job_123',
    );

    expect(response).toEqual({
      chatId: 123,
      text: '✅ لینک دریافت شد.\n🆔 Job: job_123\n📥 وضعیت: queued',
    });
    expect(queue.get('job_123')).toMatchObject({
      id: 'job_123',
      url: 'https://example.com/video',
      status: 'queued',
    });
  });

  it('rejects invalid URL messages without creating a job', () => {
    const queue = new JobQueue();

    const response = handleTelegramUpdate(
      {
        update_id: 2,
        message: {
          message_id: 11,
          chat: { id: 123 },
          text: 'not-a-url',
        },
      },
      queue,
      () => 'job_ignored',
    );

    expect(response).toEqual({
      chatId: 123,
      text: '❌ لطفاً یک لینک معتبر http یا https بفرست.',
    });
    expect(queue.get('job_ignored')).toBeUndefined();
  });

  it('returns the start message for /start', () => {
    const response = handleTelegramUpdate({
      update_id: 3,
      message: {
        message_id: 12,
        chat: { id: 456 },
        text: '/start',
      },
    }, new JobQueue());

    expect(response).toEqual({
      chatId: 456,
      text: '🎬 به VELIX خوش اومدی!\nلینک ویدیو رو بفرست تا بررسیش کنیم.',
    });
  });

  it('ignores Telegram updates without a message text', () => {
    expect(handleTelegramUpdate({ update_id: 4 }, new JobQueue())).toBeUndefined();
  });
});
