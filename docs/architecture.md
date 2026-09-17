# VELIX Architecture

## Goal
VELIX is a public Telegram video utility that accepts publicly accessible video URLs, resolves available media variants, and lets the user choose Video, Audio, or Subtitle when those assets are available.

## Product Scope
- Telegram-first user interface.
- Generic URL intake with a pluggable extraction layer.
- Video, audio, and subtitle outputs when available.
- No per-user application quota in the initial product design; infrastructure still protects itself with concurrency, size, timeout, and abuse controls.
- Public repository and automated CI/deployment.
- Cloudflare is the edge/API control plane.

## Safety and Access Rules
VELIX only handles publicly accessible content that can be retrieved without bypassing access controls. It must not bypass DRM, private authentication, paywalls, or other technical restrictions. Adult/pornographic content is out of scope.

## Architecture

```text
Telegram User
    |
    v
Telegram Bot Layer
    |
    v
Cloudflare Worker / API
    |---- request validation
    |---- job creation
    |---- status polling/webhooks
    |---- queue/concurrency control
    |---- signed/internal service authentication
    |
    v
Extraction Service
    |---- extraction engine
    |---- site adapters
    |---- format selection
    |---- metadata normalization
    |
    +----> Object/temporary storage
    |
    v
Delivery Layer
    |---- Telegram upload when size/runtime permits
    +---- temporary download URL fallback
```

The Cloudflare Worker is intentionally not responsible for heavy extraction or transcoding. Heavy work belongs in an independently deployable extraction service so the edge layer remains fast and replaceable.

## Repository Layout

```text
velix/
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
├── src/
│   ├── bot/
│   │   ├── handlers/
│   │   ├── keyboards/
│   │   └── messages/
│   ├── core/
│   │   ├── config/
│   │   ├── queue/
│   │   └── errors/
│   ├── extractor/
│   │   ├── engine/
│   │   ├── adapters/
│   │   └── formats/
│   └── api/
├── tests/
├── docs/
├── .gitignore
├── README.md
├── package.json
└── wrangler.toml
```

## Core Interfaces

### ExtractionRequest
- `url`: normalized public URL.
- `requestedFormat`: `video | audio | subtitle`.
- `jobId`: unique internal job identifier.

### ExtractionResult
- `status`: `ready | unavailable | failed`.
- `title`: normalized media title when available.
- `mimeType`: output MIME type.
- `filename`: safe suggested filename.
- `sizeBytes`: known output size when available.
- `downloadUrl`: temporary delivery URL when generated.
- `telegramFileId`: reusable Telegram file identifier when available.

### Adapter contract
Each site adapter must expose URL matching plus metadata/media extraction through a common interface. Adding support for a site should not require changes to bot handlers or the job API.

## Job Lifecycle

```text
received -> validating -> queued -> extracting -> packaging -> ready
                                      |                 |
                                      +-> failed        +-> unavailable
```

Every job gets a stable ID and bounded timeout. User-visible errors are short and actionable; internal errors remain structured for logs.

## Security
- Telegram and service credentials live in deployment secrets, never in source control.
- Internal extraction requests use authenticated service-to-service calls.
- Download URLs are temporary and scoped to a single artifact/job.
- User input is treated as untrusted data.
- Redirects, URL schemes, response sizes, and fetch destinations are validated to reduce SSRF and resource-abuse risk.

## Testing Strategy
- Unit tests for URL normalization, format selection, adapters, error mapping, and job state transitions.
- Contract tests for the extraction service interface.
- API tests for request validation and status handling.
- Bot handler tests for command/menu behavior.
- CI must run formatting/linting and the complete test suite.

## Initial Delivery Phases
1. Repository scaffold, documentation, CI, and configuration.
2. Core request/result contracts and job state machine.
3. Cloudflare API control plane.
4. Telegram bot UX and format-selection flow.
5. Extraction engine abstraction and first supported public video adapters.
6. Artifact delivery and temporary URLs.
7. Observability, hardening, and production deployment.
