# VELIX Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first testable VELIX foundation: typed media/job contracts, a Cloudflare Worker control plane skeleton, Telegram bot flow, extraction abstraction, CI, and deployment configuration.

**Architecture:** Cloudflare Worker owns request validation, job lifecycle, status, and Telegram-facing control flow. Heavy extraction remains behind an independent extraction-service interface so it can later run on suitable compute without coupling the bot/API to a runtime-heavy workload. Site support is adapter-based.

**Tech Stack:** TypeScript, Cloudflare Workers/Wrangler, Telegram Bot API, Vitest, GitHub Actions.

**Spec:** `docs/architecture.md`

## Global Constraints

- Handle only publicly accessible content that can be retrieved without bypassing access controls.
- Do not bypass DRM, private authentication, paywalls, or other technical restrictions.
- Adult/pornographic content is out of scope.
- No application-level per-user quota in the initial product design; infrastructure still uses bounded concurrency, timeouts, size limits, and abuse protection.
- Secrets must never be committed to Git.
- Cloudflare Worker must not perform heavy extraction/transcoding directly.
- Adding a supported site must use the adapter boundary rather than changing bot handlers.

---

### Task 1: Repository foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `wrangler.toml`
- Create: `.gitignore`
- Create: `.github/workflows/ci.yml`
- Create: `README.md`
- Create: `src/index.ts`
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Produces the TypeScript/Worker project entry point and a CI command that later tasks can extend.

- [ ] **Step 1: Write the failing smoke test**
- [ ] **Step 2: Run the test and verify it fails because the project scaffold is absent**
- [ ] **Step 3: Add the minimal TypeScript/Worker scaffold**
- [ ] **Step 4: Run typecheck and tests**
- [ ] **Step 5: Commit the foundation**

### Task 2: Core contracts and job state machine

**Files:**
- Create: `src/core/types.ts`
- Create: `src/core/jobs/state-machine.ts`
- Create: `tests/core/job-state-machine.test.ts`

**Interfaces:**
- `ExtractionRequest`
- `ExtractionResult`
- `JobStatus`
- `JobRecord`
- `transitionJobStatus(current, next)`

- [ ] **Step 1: Write failing state-transition tests**
- [ ] **Step 2: Run the focused tests and verify failure**
- [ ] **Step 3: Implement the minimal typed state machine**
- [ ] **Step 4: Run focused tests and full suite**
- [ ] **Step 5: Commit**

### Task 3: URL normalization and request validation

**Files:**
- Create: `src/core/validation/url.ts`
- Create: `src/core/errors/index.ts`
- Create: `tests/core/url-validation.test.ts`

**Interfaces:**
- `normalizePublicUrl(input: string): URL`
- `validateExtractionRequest(input): ExtractionRequest`

- [ ] **Step 1: Write tests for valid HTTP(S), malformed URLs, unsupported schemes, and unsafe local destinations**
- [ ] **Step 2: Run tests and verify failure**
- [ ] **Step 3: Implement validation and structured errors**
- [ ] **Step 4: Run tests**
- [ ] **Step 5: Commit**

### Task 4: Extraction adapter boundary

**Files:**
- Create: `src/extractor/types.ts`
- Create: `src/extractor/registry.ts`
- Create: `src/extractor/adapters/generic.ts`
- Create: `tests/extractor/registry.test.ts`

**Interfaces:**
- `ExtractorAdapter.matches(url): boolean`
- `ExtractorAdapter.extract(request): Promise<ExtractionResult>`
- `ExtractorRegistry.resolve(url): ExtractorAdapter`

- [ ] **Step 1: Write registry and adapter contract tests**
- [ ] **Step 2: Run tests and verify failure**
- [ ] **Step 3: Implement registry and a safe placeholder adapter**
- [ ] **Step 4: Run tests**
- [ ] **Step 5: Commit**

### Task 5: Job service and API routes

**Files:**
- Create: `src/core/jobs/service.ts`
- Create: `src/api/router.ts`
- Modify: `src/index.ts`
- Create: `tests/api/router.test.ts`

**Interfaces:**
- `createJob(request): Promise<JobRecord>`
- `getJob(jobId): Promise<JobRecord | null>`
- `handleRequest(request, env): Promise<Response>`

- [ ] **Step 1: Write API tests for create/status/error responses**
- [ ] **Step 2: Run tests and verify failure**
- [ ] **Step 3: Implement in-memory development job service behind a replaceable interface**
- [ ] **Step 4: Wire the Worker router**
- [ ] **Step 5: Run tests and typecheck**
- [ ] **Step 6: Commit**

### Task 6: Telegram bot interaction layer

**Files:**
- Create: `src/bot/messages.ts`
- Create: `src/bot/keyboards.ts`
- Create: `src/bot/handlers.ts`
- Create: `tests/bot/handlers.test.ts`

**Interfaces:**
- `handleTelegramUpdate(update, deps): Promise<void>`
- Format selection: `video | audio | subtitle`

- [ ] **Step 1: Write tests for URL intake, format menu, and invalid input**
- [ ] **Step 2: Run tests and verify failure**
- [ ] **Step 3: Implement the bot handler using the job service boundary**
- [ ] **Step 4: Add concise Persian user messages**
- [ ] **Step 5: Run tests**
- [ ] **Step 6: Commit**

### Task 7: CI and deployment hardening

**Files:**
- Modify: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy.yml`
- Modify: `wrangler.toml`
- Modify: `README.md`

**Interfaces:**
- CI runs install, lint/format checks, typecheck, and tests.
- Deployment consumes secrets from the GitHub/Cloudflare environment; no credentials are stored in source.

- [ ] **Step 1: Add CI checks**
- [ ] **Step 2: Run the same checks locally**
- [ ] **Step 3: Add deployment workflow with secret references only**
- [ ] **Step 4: Validate Wrangler configuration**
- [ ] **Step 5: Commit**

### Task 8: Production extraction-service contract

**Files:**
- Create: `src/extractor/engine/client.ts`
- Create: `src/extractor/engine/http-client.ts`
- Create: `tests/extractor/engine-client.test.ts`
- Modify: `docs/architecture.md`

**Interfaces:**
- `ExtractionEngineClient.submit(request): Promise<JobRecord>`
- `ExtractionEngineClient.getResult(jobId): Promise<ExtractionResult>`

- [ ] **Step 1: Write contract tests using a mocked transport**
- [ ] **Step 2: Run tests and verify failure**
- [ ] **Step 3: Implement authenticated HTTP client and bounded timeouts**
- [ ] **Step 4: Run tests**
- [ ] **Step 5: Commit**

### Task 9: Verification and release gate

**Files:**
- Modify: `README.md`
- Modify: `docs/architecture.md`

- [ ] **Step 1: Run the complete test suite**
- [ ] **Step 2: Run typecheck/lint/format checks**
- [ ] **Step 3: Validate Wrangler configuration**
- [ ] **Step 4: Inspect the final diff for secrets and unsafe scope expansion**
- [ ] **Step 5: Document the exact local and deployment commands**
- [ ] **Step 6: Commit the verified foundation**
