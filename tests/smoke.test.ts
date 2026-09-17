import { describe, expect, it } from 'vitest';
import { isAllowedPublicUrl } from '../packages/shared/src/url-safety';

describe('VELIX smoke', () => {
  it('accepts a normal public HTTPS URL', () => {
    expect(isAllowedPublicUrl('https://example.com/video')).toBe(true);
  });

  it('rejects localhost URLs', () => {
    expect(isAllowedPublicUrl('http://127.0.0.1/video')).toBe(false);
  });
});
