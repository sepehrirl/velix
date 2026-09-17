const URL_RE = /https?:\/\/[^\s<>]+/i;

export interface IncomingUrl {
  chatId: number;
  url: string;
}

export function parseIncomingUrl(update: any): IncomingUrl | null {
  const message = update?.message;
  if (!message?.chat?.id) return null;
  const text = typeof message.text === 'string' ? message.text : typeof message.caption === 'string' ? message.caption : '';
  if (!text || text.startsWith('/')) return null;
  const match = text.match(URL_RE);
  return match ? { chatId: Number(message.chat.id), url: match[0].replace(/[),.!?]+$/, '') } : null;
}
