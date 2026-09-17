# VELIX v1 — Technical Design

## Goal
VELIX is a small Telegram bot that accepts a public video URL, detects the source, extracts available media, lets the user choose quality when useful, and delivers video/audio/subtitles when available.

## Product boundaries
- Public, technically extractable media only.
- No DRM, private-account, paywall, authentication, or access-control bypass.
- No per-user quota in v1; the bot is free to use.
- Telegram is the primary user interface.
- The control-plane/backend API runs on Cloudflare Workers.
- Heavy media extraction runs outside the Worker in an isolated extractor runtime; the Worker never performs long-running video downloads or transcoding itself.

## Architecture

```text
Telegram
   |
   v
Cloudflare Worker (API + bot orchestration)
   |\
   | \--> Telegram API
   |
   +--> Queue / job state
   |
   +--> Extractor service
             |
             +--> generic extractor engine
             +--> site adapters when needed
             +--> metadata / formats / subtitles
             +--> media fetch
   |
   +--> delivery coordinator
             |
             +--> Telegram upload
             +--> direct media URL fallback
```

### Components

1. **Worker**
   - Receives Telegram webhook updates.
   - Parses commands and URLs.
   - Creates and tracks jobs.
   - Requests extraction from the extractor service.
   - Presents format choices through inline keyboards.
   - Sends final media to Telegram.
   - Exposes `/health` for deployment checks.

2. **Job state**
   - Cloudflare KV stores short-lived job state and idempotency keys.
   - Cloudflare Queue is used for asynchronous extraction requests when configured.
   - Job states: `queued`, `extracting`, `awaiting_format`, `downloading`, `delivering`, `done`, `failed`.

3. **Extractor service**
   - A small container/service with a generic extraction engine.
   - Returns normalized metadata rather than leaking site-specific details to the Worker.
   - Supports video, audio, and subtitle tracks where exposed by the source.
   - Enforces timeout, maximum download size, URL validation, and SSRF protections.

4. **Telegram delivery**
   - Video is preferred when Telegram accepts the selected media size/type.
   - Audio and subtitles are sent separately when available.
   - If Telegram upload is not practical, the bot returns a short-lived direct media URL when the extractor can safely provide one.

## Normalized extraction contract

`POST /extract` request:

```json
{
  "jobId": "string",
  "url": "https://example.com/video",
  "requested": ["video", "audio", "subtitle"]
}
```

Successful response:

```json
{
  "jobId": "string",
  "title": "string",
  "source": "string",
  "thumbnailUrl": "string|null",
  "formats": [
    {
      "id": "string",
      "kind": "video|audio",
      "ext": "mp4|webm|m4a|mp3|...",
      "width": 1920,
      "height": 1080,
      "quality": "1080p",
      "sizeBytes": 123456789,
      "downloadUrl": "https://..."
    }
  ],
  "subtitles": [
    {
      "language": "en",
      "name": "English",
      "url": "https://..."
    }
  ]
}
```

The service-to-worker authentication mechanism is an HMAC/shared-secret header. Secrets are never committed to Git.

## Telegram UX

### `/start`
Short welcome message explaining that the user can send a public video URL.

### URL message
1. Validate URL.
2. Reply with a small processing message.
3. Extract metadata.
4. If multiple useful formats exist, show quality buttons.
5. Otherwise select the best safe format automatically.
6. Deliver media and available subtitles.
7. Remove or edit the processing message when practical.

### Errors
User-facing errors stay short and conversational:
- unsupported link
- private/blocked content
- no downloadable media found
- file too large for Telegram
- temporary extraction failure

Internal logs include a job ID and sanitized error category, never bot tokens or full sensitive URLs containing credentials.

## Security
- Allow only `http`/`https` URLs.
- Reject localhost, loopback, link-local, private-network and metadata-service destinations before fetching.
- Do not follow arbitrary redirects into private address ranges.
- Validate Telegram webhook secret token.
- Authenticate extractor requests with a shared secret.
- Apply request and job timeouts.
- Limit response/download size.
- Sanitize filenames before sending.
- Never log `TELEGRAM_BOT_TOKEN` or secrets.

## Repository layout

```text
velix/
├── apps/
│   ├── worker/
│   │   └── src/
│   └── extractor/
│       └── src/
├── packages/
│   ├── bot/
│   ├── extractor-core/
│   ├── media/
│   └── shared/
├── tests/
├── docs/
│   ├── design/
│   └── superpowers/
├── package.json
├── tsconfig.json
└── README.md
```

## Definition of done for v1
- Clean TypeScript monorepo builds from an empty checkout.
- Worker deploys successfully to Cloudflare.
- `/health` returns a healthy response.
- Telegram `/start` works through the real webhook.
- A public supported video URL creates a job and returns useful metadata.
- A selected video can be delivered to Telegram.
- Audio and subtitles are delivered when the source exposes them.
- Unsupported/private/oversized/unsafe URLs fail cleanly.
- Automated tests cover URL validation, source normalization, job transitions, format selection, webhook parsing, and delivery error mapping.
- No secrets or credentials are committed.
