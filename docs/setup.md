# Development setup

## Prerequisites

- Node.js 24; the exact CI version is defined in `.drone.yml`.
- Docker Desktop on macOS and sibling checkouts of `data-access-api`, `data-integr-cbp`, and
  `gateway-api`.
- The AMG test-harness image used by `gateway-api` already available in Docker Desktop. Compose does
  not pull it.
- [`just`](https://github.com/casey/just) for the documented development commands:

  ```sh
  brew install just
  ```

`package.json` and `package-lock.json` live in `src/`, rather than at the repository root.

## Install the runtime

Install Node.js 24 using the team's existing runtime-management approach. Confirm the active version
before installing dependencies:

```sh
node --version
npm --version
```

## Install project dependencies

```sh
(cd src && npm ci)
```

The UI container uses the local `node_modules` directory and runs nodemon to reload changes. Run
`npm install` locally in `src/` when adding or updating dependencies. Native dependencies installed
on the host may not be compatible with the container's Linux environment.

## Configure the environment

Copy `.env.example` to `.env` and add the local One Login, Notify and gateway settings. Keep
credentials out of version control. Compose and `just` load `.env` automatically; the sibling
repositories' env files are not used by the stack. If migrating an existing `.env.dev`, transfer its
values to the application-native names in `.env.example`; `.env.dev` is no longer loaded.

sGAR, CBP and data-access use the same `NOTIFY_API_KEY` for the sGAR Notify service. Use local dummy
credentials for the AWS access-key settings and set `X_API_KEY` from the local gateway
configuration. Empty gateway client certificate values are supported for local startup.

The database and container-specific addresses are configured in `docker-compose.yml`. The API's
development database is `sgar` with user `user` and password `test`; it must match the session
store. Compose overrides shell values for those container addresses, while shell environment
variables take precedence over `.env` for Compose's other passed-through settings. Commands run
directly on the host may need different addresses.

Postgres only creates `POSTGRES_DB` when initializing a new volume. An existing volume using `egar`
needs a separately created `sgar` database or a data migration before the stack can use it. When
moving from the earlier anonymous volume, the new named volume starts with an empty database.

## Run the service

The PostgreSQL session store automatically creates its `session` table if missing. The database must
already exist, and the configured database user needs permission to create tables in the target
schema.

From the repository root:

```sh
docker compose up -d --build
```

The command starts the sGAR UI, the API, both queue consumers, Postgres, LocalStack, mock ClamAV,
mock CBP and the AMG test harness. sGAR is available at `http://localhost:3000`. The LocalStack
initializer creates the two document buckets and three queues before the API and consumers start.
The API runs its database migrations before the UI starts. Online APIS has a separate Compose setup
in `ssar-public-site-ui`.

Make sure other Compose projects are not already using these container names or ports. Inspect
status and stop this project with:

```sh
docker compose ps
docker compose down
```

Postgres uses a named volume that `down` retains; `down -v` deletes it. LocalStack data is stored in
`./volume`; `down` does not remove it. One Login and Notify are external integrations: starting the
stack does not validate those journeys. Use approved test credentials and obtain approval before
exercising live integrations.

The production image installs application dependencies before removing npm/npx and npm's bundled
libraries. It starts the service directly with Node and runs as the existing non-root user. The
development stage retains npm.

## Install review tools

djLint is required for Nunjucks changes. Install its CI-pinned version in an isolated environment:

```sh
brew install pipx
pipx ensurepath
pipx install djlint==1.46.1
```

Hadolint, Trivy, and Semgrep are optional tools for Dockerfile and security review:

```sh
brew install hadolint trivy semgrep
```

## Optional browser debugging

[Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) lets a local agent
inspect console messages, network requests, screenshots, and rendered pages, and interact with the
application. Install Chrome and use the Node.js runtime above. MCP registration and tool permissions
are per developer, not application dependencies.

In Copilot CLI, run `/mcp add`, select a local server named `chrome-devtools`, and enter this
command, then press Ctrl+S:

```sh
npx -y chrome-devtools-mcp@latest --isolated --no-usage-statistics --no-performance-crux
```

For other clients, use the same command and arguments with their
[MCP registration instructions](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/client-configurations.md).
The server launches Chrome when a browser tool is first used; confirm the server is available in the
client before testing.

`--isolated` creates a temporary browser profile separate from everyday Chrome; test logins are
discarded when it closes. The other flags disable server usage telemetry and CrUX lookups. Use this
dedicated browser with dummy data and local/mock services, without Chrome Sync or personal accounts.
Browser isolation does not restrict network destinations: obtain explicit approval before contacting
external environments or submitting forms that trigger external calls.

Start the local stack first, then ask the agent:

> Open http://localhost:3000. Inspect the welcome page, report console errors and failed network
> requests, and take a screenshot. Do not submit forms or contact external services.

For a journey check, agree the allowed actions and dependencies first. Useful scenarios include
login with a test account, creating a draft GAR, editing manifest people, and uploading a dummy
supporting document through mock ClamAV. Check keyboard focus and person-specific accessible names
on repeated controls; automated inspection is not a full accessibility audit.

Record the scenario, expected result, observed result, and relevant errors. Redact tokens, cookies,
personal data, and sensitive URLs before sharing screenshots, network output, or saved artifacts;
keep them out of version control. Re-run the same scenario after a fix and retain automated
regression coverage where practical.

Browser debugging is optional and complements automated tests; it is not part of `just check` or
`just verify`.

## Verify the setup

```sh
just --list
just check
just verify
just lint-templates
just check-template-format
```

`just check` is the normal code gate. `just verify` also checks formatting of non-JavaScript files,
matching CI. The template commands are required when changing Nunjucks files. Run `just review-all`
when the broader review tools are installed; its findings may require interpretation.
