# egar-public-site-ui

## What this is

The sGAR front end: a Node/Express application in plain JavaScript that renders server-side Nunjucks templates using the GOV.UK Design System. It is the older front end for General Aviation Reports and has more legacy variation than `ssar-public-site-ui`.

## System context and boundaries

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

This repository owns the sGAR web journey, authentication flows, upload scanning, and its own account/registration/invite notifications. `data-access-api` owns GAR, passenger, and organisation state and routes submitted GARs to the queue consumers; this UI does not call CBP, AMG, or either queue directly.

If a change adds, removes, or redirects an external call, update the diagram and the relevant contract information in this file.

## External dependencies

| Dependency | Direction | Purpose | Configuration |
|---|---|---|---|
| `data-access-api` | HTTP | GAR, passenger, and organisation data | `common/config/index.js` |
| GOV.UK One Login | OIDC/HTTP | Login, registration, logout, and organisation invites | `ONE_LOGIN_*` |
| ClamAV | HTTP | Scan supporting-document uploads | `CLAMAV_BASE`, `CLAMAV_PORT` |
| GOV.UK Notify | HTTP | Account, registration, and invite messages | `NOTIFY_*` |

## Data/API contracts

The UI calls `data-access-api` for all report and user state. Supporting documents are scanned here before being sent to that API. Authentication is not only the OIDC handshake: login guards also depend on organisation and user data returned by `data-access-api`.

Supporting-document limits are enforced here, but the downstream CBP submission also includes generated XLSX/PDF files and base64 encoding. See the corresponding `data-integr-cbp/AGENTS.md` warning before changing upload limits.

## Setup and prerequisites

1. Clone `data-access-api` beside this repository; `docker-compose.yml` builds it from `../data-access-api`.
2. Create `.env.dev`; there is no committed `.env.example`. Check `common/config/index.js` for required variables.
3. Run `docker compose up -d --build`. This starts Postgres, the API, mock ClamAV, and the UI.
4. Run tests in the container with `docker exec -it node sh`, then `npm run test`, or use the local `just` commands when dependencies and host tools are installed.

`package.json` lives in `src/`. `just` loads `.env.dev` automatically. The broader review tools (`djlint`, `hadolint`, `trivy`, and `semgrep`) are host tools rather than npm dependencies.

## Quality gates

Run `just check` for every code change. Run `just verify` before handoff; in this repository it currently aliases `check`.

| Command | Purpose | Expected status |
|---|---|---|
| `just fmt` | Rewrite JS, JSON, CSS, and other Prettier-supported files | Modifies files |
| `just fix` | Apply safe ESLint fixes, then format code | Modifies files |
| `just fmt-check` | Check Prettier formatting without changes | Must pass when formatting is in scope |
| `just lint` | ESLint, including the configured Prettier rule | Must pass |
| `just test` | Mocha tests with c8 coverage | Must pass |
| `just check` | `lint` + `test` | Required fast gate |
| `just verify` | `check` | Required final gate |

## Agent review tools

| Command | Use |
|---|---|
| `just knip` | Unused files, exports, and dependencies; interpret the known CommonJS export baseline |
| `just lint-html` | Lint Nunjucks templates |
| `just fmt-html-check` | Check Nunjucks formatting |
| `just fmt-html` | Reformat Nunjucks with `--no-function-formatting`; use only on intentional template changes |
| `just dockerlint` | Validate `Dockerfile` changes |
| `just audit` | Local npm dependency audit |
| `just scan` | Trivy filesystem scan |
| `just sast` | Semgrep security and Node.js checks |
| `just advisory` | Run non-blocking hygiene and security reviews |

## Change-specific validation

- `.js` changes: `just check`.
- `.njk` changes: `just fmt-html-check` and `just lint-html`; preserve GOV.UK macro arguments.
- Authentication, configuration, upload, or external-integration changes: `just scan` and `just sast`.
- Dependency changes or deleted/moved modules: `just knip` and `just audit`.
- Dockerfile changes: `just dockerlint`.
- Changes to API behavior: check the corresponding `data-access-api` contract and tests.

## Known rough edges

- The 0T resubmit branch in `app/garfile/review/post.controller.js` has no test coverage. Touching it requires careful targeted testing and review.
- The upload limit is 7.5MB and is checked here, but it does not include generated CBP files or base64 expansion.
- `request` remains a deprecated dependency while the callback-based services are migrated to `HttpClient`; correlation-ID injection exists in both paths.
- `knip` reports many CommonJS route/config exports that are used through property access; treat that category as a known baseline and inspect new findings.
- `throng` currently runs one worker because `NODE_WORKER_COUNT` is not configured.
- There is no `.env.example`.
- The first ESLint cleanup fixed real stale-tooling findings; preserve the explicit `@eslint/js` dependency and do not reintroduce placeholder assignments.

Detailed domain and tool investigations live under `docs/agents/`. See `docs/agents/issue-tracker.md` and `docs/agents/domain.md` when those branches of work apply.

## Repository references

- Jira is the source of truth for issue work; use issue keys supplied by the user and do not create or transition Jira issues.
- This repository uses root `CONTEXT.md` and `docs/adr/` for domain terminology and decisions; read the relevant material before domain-heavy changes.
