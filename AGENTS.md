# egar-public-site-ui

## What this is

The sGAR front end — a Node/Express app (plain JS, not TypeScript) rendering server-side Nunjucks templates, built on the GOV.UK Design System. This is the original, ~10-year-old system for submitting General Aviation Reports; passed between several teams and vendors over its life, so expect more legacy and inconsistency here than in the newer repos (`ssar-public-site-ui`, `gateway-api`).

Talks directly to four external things, not just one: `data-access-api` (report/passenger/organisation data — never AMG, CBP, or the queue-consumer repos directly; all of that routing happens inside `data-access-api` once a GAR is submitted), GOV.UK One Login (`common/utils/oneLoginAuth.js` — OIDC-style authentication, JWT creation/verification against One Login's public key, spanning login/registration/logout/org-invite flows across at least six files, not a single auth check), ClamAV (`common/services/clamAVService.js` — virus-scans supporting-document uploads before they ever reach `data-access-api`), and GOV.UK Notify (`common/services/sendEmail.js`, `notifications-node-client` — this repo's own account/registration/invite emails, using its own `NOTIFY_*` template IDs). `data-access-api` separately sends its own, different set of GAR-related Notify emails — the two repos each own their own Notify integration, neither goes through the other.

## Where this sits in the system

```mermaid
flowchart LR
    UI["egar-public-site-ui (this repo)"]
    API["data-access-api"]
    CLAMAV(["External: ClamAV — virus scanning"])
    ONELOGIN(["External: GOV.UK One Login"])
    NOTIFY(["External: GOV.UK Notify"])

    UI -- HTTP --> API
    UI -- "scan uploads" --> CLAMAV
    UI -- OIDC --> ONELOGIN
    UI -- HTTP --> NOTIFY
```

`data-access-api`'s own `AGENTS.md` has the fuller system diagram (queues, S3, the two consumer repos) — this repo's view of the world stops at `data-access-api`.

## Setup

1. This repo doesn't stand alone locally — its `docker-compose.yml` also builds `data-access-api` from a sibling checkout (`context: ../data-access-api`), so clone that repo alongside this one first.
2. Create a `.env.dev` — no committed `.env.example` yet (see Known rough edges); check `common/config/index.js` for the full list of variables it reads.
3. `docker compose up -d --build` — brings up `database` (Postgres), `api` (`data-access-api`, built with `target: development` so it has its own test tooling available), `mock_clamav` (stand-in for the real ClamAV service — set `CLAMAV_BASE=http://mock-clamav`/`CLAMAV_PORT=8080` in `.env.dev` to use it), and `node` (this app, on port 3000).
4. To run this repo's own tests inside its running container: `docker exec -it node sh` then `npm run test`. `data-access-api`'s tests can be run the same way against its own `api` container — see that repo's `AGENTS.md`.

Note `package.json` lives in `src/`, not the repo root — every command below assumes that.

## Commands

This repo has a `justfile`. Run `just --list` to see everything; the important ones:

| Command | What it does |
|---|---|
| `just test` | Unit tests with coverage (`mocha` + `c8`, matches `npm run test`) |
| `just lint` | ESLint — rule violations. Also enforces Prettier formatting as an ESLint error, so this alone covers what CI's `linting-formatting` step gates on for JS |
| `just fmt` / `fmt-check` | Prettier, repo-wide (JSON, CSS, JS, not just what ESLint touches) |
| `just check` | Fast default gate for normal code changes: lint + test |
| `just knip` | Unused files, exports, and dependencies (also a blocking CI step — `unused-code-scan`) |
| `just lint-html` / `fmt-html` / `fmt-html-check` | djlint against the Nunjucks templates. **`fmt-html` always passes `--no-function-formatting`** — without it, djlint corrupts nested GOV.UK macro object arguments and breaks page rendering |
| `just audit` | `npm audit` — local only, deliberately not in CI (`trivy-scan-image` already covers this ground) |
| `just dockerlint` | hadolint against the `Dockerfile` |
| `just scan` | Trivy filesystem scan; skips local `.env` files by default |
| `just sast` | Semgrep (`p/security-audit` + `p/nodejs`) |
| `just hygiene` | Advisory code-health checks (`knip`, template lint, Docker lint); read the output, some findings may be known baseline |
| `just security` | Advisory security/dependency scans (`audit`, Trivy, Semgrep); read the output, findings may be known or need triage |
| `just advisory` | Runs `hygiene` and `security`; not guaranteed to exit cleanly |
| `just verify` | Final green verification gate; currently `check` only |

## Known rough edges (as of this writing)

- **The 0T-resubmit flow (`app/garfile/review/post.controller.js`, the `resubmit0TOnSummaryPage` branch) has zero test coverage.** Confirmed via coverage instrumentation, not just absence of test names — every statement in that branch shows 0 hits. Confirmed working in production by direct operational knowledge, not by any test. "0T" is AMG's response code for a passenger's digital permission-to-travel check timing out; the banner in `common/templates/includes/banners.njk` prompts the user to retry, which re-attempts `garApi.submitGARForCheckin` and records the GAR id in a session-cookie-backed list (`cookie.setResubmitFor0T`/`getResubmitFor0T`) so `app/garfile/view` can tell it's already been retried once. If you touch this code, there's no safety net catching a regression.
- **Supporting-document size limits are enforced here, but only individually and only up to the same combined figure `data-access-api` and `data-integr-cbp` already flag as an undercount.** `app/api/uploadfile/index.js` caps each upload via `multer`'s `limits.fileSize`, and `post.controller.js` separately re-checks the running total, both against `config.SUPPORTING_DOCS_MAX_SIZE` (7.5MB). `data-access-api` never re-validates this itself once a file arrives; `data-integr-cbp`'s `AGENTS.md` documents why CBP still sometimes rejects GARs for size regardless (the generated XLSX/PDF and base64 encoding aren't counted here).
- **`knip`'s "Unused exports" category is demoted to `warn`, not fixed.** Same root cause as `ssar-public-site-ui`'s equivalent: this codebase is CommonJS throughout, and route modules export `{ router, paths }` objects consumed via property access (`app.use(someRoute.router)`) rather than named imports — `knip` can't trace that, so almost every route index and every `common/config/index.js` export shows as "unused" when it demonstrably isn't (verified by hand for several: `router`, `paths`, `config.NOTIFY_API_KEY`). Check current `just knip` output for the live count.
- **`throng` (in `start.js`) wraps Node's `cluster` module for worker-process management, but its actual clustering has never been exercised.** `workers: process.env.NODE_WORKER_COUNT || 1` — `NODE_WORKER_COUNT` is never set anywhere (Dockerfile, k8s manifests, env files), so it always runs exactly one worker. It still provides automatic respawn-on-crash for that one worker, which overlaps (at a different granularity) with the Kubernetes `livenessProbe` already configured to restart the whole pod on `/healthcheck` failure. Deliberately left as-is — a real architectural question, not dead code.
- **The `request`→`HttpClient` migration is part-complete, and that's why the deprecated `request` package is still a real dependency.** `common/services/httpClient.js`'s `HttpClient` class (native `fetch`, no `request` dependency) is only used by `common/services/dataAccessApi.js` — the other 13 service modules (`garApi.js`, `createGarApi.js`, `oneLoginApi.js`, `verificationApi.js`, `fileUploadApi.js`, `organisationApi.js`, `tokenApi.js`, `resPersonApi.js`, `userManageApi.js`, `clamAVService.js`, `createUserApi.js`, `craftApi.js`, `personApi.js`) still go through `common/utils/requestWithCorrelationId.js`, which wraps `request` directly. `request` is unmaintained (deprecated by its own maintainers) and pulls in a vulnerable nested `uuid@3.4.0` (separate from the app's own top-level `uuid@11.1.1`) — a `pip-audit`-equivalent scan will keep flagging `request`-originated CVEs until this finishes. Not a drop-in rename: `request` is callback-style, `HttpClient` is `async`/`fetch`-based, so each remaining file needs its call sites actually rewritten.
  - **Correlation-ID header injection is duplicated across both paths, not shared** — `requestWithCorrelationId.js`'s `withCorrelationId()` for the `request` path, a separate inline block in `httpClient.js`'s `#request()` for the `fetch` path. Both currently need to keep working. If you're migrating a file off `request`, or touching `common/utils/correlationContext.js`, check both implementations — a change to only one would silently stop propagating correlation IDs for whichever path you missed, with no error, just quietly untraceable requests.
- **No `.env.example` exists** — `common/config/index.js` reads real env vars (DB connection, ClamAV, One Login keys, Notify template IDs, and more) with no committed template for what a new setup needs.
- **`ruff`-equivalent housekeeping for this repo (the first real ESLint pass with a correctly-resolved `@eslint/js`) found real bugs, not just style.** `@eslint/js` was previously resolving to a stale, one-major-version-behind copy via `rewire`'s nested dependency tree rather than the explicit devDependency it is now — fixed, and the newer ESLint 10 rules it unlocked (`no-useless-assignment`, `no-unassigned-vars`) found 6 genuine issues (dead placeholder initializers in `app/garfile/review/post.controller.js`, `app/user/onelogin/post.controller.js`, `common/models/Cookie.class.js`; an unassigned `req` in `test/common/middleware/flagpole.test.js`), all fixed. Worth knowing if a similarly-stale transitive tooling dependency shows up elsewhere.

## Agent skills

### Issue tracker

Jira is the source of truth; use Jira issue keys supplied by the user, and do not attempt to access, create, or transition Jira issues. See `docs/agents/issue-tracker.md`.

### Domain docs

This is a single-context repository using root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.
