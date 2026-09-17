export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Job {
  id: string;
  url: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface CreateJobInput {
  url: string;
}

export function createJob(input: CreateJobInput, id: string, now = new Date()): Job {
  const timestamp = now.toISOString();

  return {
    id,
    url: input.url,
    status: 'queued',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
