import type { MediaFormat } from '@velix/shared';

export const TELEGRAM_MAX_BYTES = 49 * 1024 * 1024;

export function selectVideoFormat(formats: MediaFormat[], maxBytes = TELEGRAM_MAX_BYTES): MediaFormat | null {
  return formats
    .filter((f) => f.kind === 'video' && (!f.sizeBytes || f.sizeBytes <= maxBytes) && !!f.downloadUrl)
    .sort((a, b) => ((b.height ?? 0) - (a.height ?? 0)) || ((b.width ?? 0) - (a.width ?? 0)))[0] ?? null;
}

export function selectAudioFormat(formats: MediaFormat[], maxBytes = TELEGRAM_MAX_BYTES): MediaFormat | null {
  return formats
    .filter((f) => f.kind === 'audio' && (!f.sizeBytes || f.sizeBytes <= maxBytes) && !!f.downloadUrl)
    .sort((a, b) => (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0))[0] ?? null;
}
