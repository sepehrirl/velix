import { describe, expect, it } from 'vitest';
import { createJob } from '../../../src/core/jobs/job.js';
import { JobQueue } from '../../../src/core/queue/job-queue.js';

describe('JobQueue', () => {
  it('enqueues jobs and dequeues them in FIFO order', () => {
    const queue = new JobQueue();
    const first = createJob({ url: 'https://example.com/1' }, 'job_1');
    const second = createJob({ url: 'https://example.com/2' }, 'job_2');

    queue.enqueue(first);
    queue.enqueue(second);

    expect(queue.dequeue()).toEqual(first);
    expect(queue.dequeue()).toEqual(second);
    expect(queue.dequeue()).toBeUndefined();
  });

  it('retrieves jobs by id', () => {
    const queue = new JobQueue();
    const job = createJob({ url: 'https://example.com/video' }, 'job_123');

    queue.enqueue(job);

    expect(queue.get('job_123')).toEqual(job);
    expect(queue.get('missing')).toBeUndefined();
  });

  it('updates job status and timestamp', () => {
    const queue = new JobQueue();
    const job = createJob({ url: 'https://example.com/video' }, 'job_123', new Date('2026-09-17T00:00:00.000Z'));
    const updatedAt = new Date('2026-09-17T00:05:00.000Z');

    queue.enqueue(job);

    expect(queue.updateStatus('job_123', 'processing', updatedAt)).toEqual({
      ...job,
      status: 'processing',
      updatedAt: updatedAt.toISOString(),
    });
  });

  it('rejects duplicate job ids', () => {
    const queue = new JobQueue();
    const job = createJob({ url: 'https://example.com/video' }, 'job_123');

    queue.enqueue(job);

    expect(() => queue.enqueue(job)).toThrow('Job job_123 already exists');
  });
});
