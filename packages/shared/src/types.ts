export type MediaKind = 'video' | 'audio';

export interface MediaFormat {
  id: string;
  kind: MediaKind;
  ext: string;
  width?: number;
  height?: number;
  quality?: string;
  sizeBytes?: number;
  downloadUrl?: string;
}

export interface SubtitleTrack {
  language: string;
  name: string;
  url: string;
}

export interface ExtractionResult {
  jobId: string;
  title: string;
  source: string;
  thumbnailUrl: string | null;
  formats: MediaFormat[];
  subtitles: SubtitleTrack[];
}

export type RequestedMedia = 'video' | 'audio' | 'subtitle';

export interface ExtractionRequest {
  jobId: string;
  url: string;
  requested: RequestedMedia[];
}
