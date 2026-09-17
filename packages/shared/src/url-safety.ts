const PRIVATE_HOSTS = new Set(['localhost', 'localhost.localdomain', 'metadata.google.internal']);

function isPrivateIpv4(host: string): boolean {
  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts;
  return a === 10 || a === 127 || (a === 169 && b === 254) || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31) || a === 0;
}

function isUnsafeHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (PRIVATE_HOSTS.has(host) || host.endsWith('.localhost')) return true;
  if (host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:')) return true;
  return isPrivateIpv4(host);
}

export function validatePublicUrl(raw: string): { ok: true; url: URL } | { ok: false; code: 'invalid' | 'scheme' | 'private-host' | 'credentials' } {
  let url: URL;
  try { url = new URL(raw); } catch { return { ok: false, code: 'invalid' }; }
  if (!['http:', 'https:'].includes(url.protocol)) return { ok: false, code: 'scheme' };
  if (url.username || url.password) return { ok: false, code: 'credentials' };
  if (isUnsafeHost(url.hostname)) return { ok: false, code: 'private-host' };
  return { ok: true, url };
}
