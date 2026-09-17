export interface TelegramMessageResult {
  message_id: number;
}

type TelegramApiResponse = {
  ok: boolean;
  result?: TelegramMessageResult;
  description?: string;
};

export interface TelegramClientOptions {
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
}

export class TelegramClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly token: string, options: TelegramClientOptions = {}) {
    this.baseUrl = `${options.apiBaseUrl ?? 'https://api.telegram.org'}/bot${token}`;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async sendMessage(chatId: number, text: string): Promise<TelegramMessageResult> {
    const response = await this.fetchImpl(`${this.baseUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    const payload = (await response.json()) as TelegramApiResponse;

    if (!response.ok || !payload.ok || !payload.result) {
      throw new Error(`Telegram API error: ${payload.description ?? `HTTP ${response.status}`}`);
    }

    return payload.result;
  }
}
