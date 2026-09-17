import type { ExtractionResult } from './types';

export type JobState = 'queued' | 'extracting' | 'awaiting_format' | 'downloading' | 'delivering' | 'done' | 'failed';

export interface Job {
  id: string;
  chatId: number;
  url: string;
  state: JobState;
  extraction?: ExtractionResult;
  createdAt: number;
  expiresAt: number;
}

const transitions: Record<JobState, JobState[]> = {
  queued: ['extracting', 'failed'],
  extracting: ['awaiting_format', 'failed'],
  awaiting_format: ['downloading', 'failed'],
  downloading: ['delivering', 'failed'],
  delivering: ['done', 'failed'],
  done: [],
  failed: []
};

export function canTransition(from: JobState, to: JobState): boolean {
  return transitions[from].includes(to);
}
