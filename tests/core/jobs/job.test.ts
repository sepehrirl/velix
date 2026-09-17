import { describe, expect, it } from 'vitest';
import { createJob } from '../../../src/core/jobs/job.js';

describe('createJob', () => {
  it('creates a queued job with stable timestamps', () => {
    const now = new Date('2026-09-17T00:00:00.000Z');

    expect(createJob({ url: 'https://example.com/video' }, 'job_123', now)).toEqual({
      id: 'job_123',
      url: 'https://example.com/video',
      status: 'queued',
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    });
  });
});
