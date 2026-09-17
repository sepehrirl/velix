export type VelixErrorCode =
  | 'invalid_url'
  | 'unsafe_url'
  | 'unsupported'
  | 'private_content'
  | 'no_media'
  | 'too_large'
  | 'extractor_unavailable'
  | 'telegram_failed';

export class VelixError extends Error {
  constructor(public readonly code: VelixErrorCode, message: string) {
    super(message);
    this.name = 'VelixError';
  }
}
