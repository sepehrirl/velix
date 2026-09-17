import type { Job, JobStatus } from '../jobs/job.js';

export class JobQueue {
  private readonly jobs = new Map<string, Job>();
  private readonly pending: string[] = [];

  enqueue(job: Job): void {
    if (this.jobs.has(job.id)) {
      throw new Error(`Job ${job.id} already exists`);
    }

    this.jobs.set(job.id, job);
    this.pending.push(job.id);
  }

  dequeue(): Job | undefined {
    const id = this.pending.shift();
    return id === undefined ? undefined : this.jobs.get(id);
  }

  get(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  updateStatus(id: string, status: JobStatus, now = new Date()): Job {
    const job = this.jobs.get(id);

    if (!job) {
      throw new Error(`Job ${id} not found`);
    }

    const updatedJob: Job = {
      ...job,
      status,
      updatedAt: now.toISOString(),
    };

    this.jobs.set(id, updatedJob);
    return updatedJob;
  }
}
