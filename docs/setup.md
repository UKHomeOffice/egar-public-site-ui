# Development setup

## Prerequisites

- Node.js 24; the exact CI version is defined in `.drone.yml`.
- The sibling `data-access-api` repository, because `docker-compose.yml` builds it from `../data-access-api`.
- [`just`](https://github.com/casey/just) for the documented development commands:

  ```sh
  brew install just
  ```

`package.json` and `package-lock.json` live in `src/`, rather than at the repository root.

## Install the runtime

Install Node.js 24 using the team's existing runtime-management approach. Confirm the active version before installing dependencies:

```sh
node --version
npm --version
```

## Install project dependencies

```sh
cd src
npm ci
cd ..
```

This installs the project-managed tools, including ESLint, Prettier, Knip, Mocha, and c8.

## Configure the environment

Obtain the team's local development configuration and save it as `.env.dev`. Use `src/common/config/index.js` to check the application settings. Keep credentials out of version control.

To use the local mock ClamAV container, include:

```dotenv
CLAMAV_BASE=http://mock-clamav
CLAMAV_PORT=8080
```

`just` loads `.env.dev` automatically.

## Run the service

The PostgreSQL session store automatically creates its `session` table if missing. The database must already exist, and the configured database user needs permission to create tables in the target schema.

From the repository root:

```sh
docker compose up -d --build
```

This builds the UI and its sibling `data-access-api`. The UI is available on port 3000.

The production image installs application dependencies before removing npm/npx and npm's bundled libraries. It starts the service directly with Node and runs as the existing non-root user. The development stage retains npm.

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

[Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) lets a local agent inspect console messages, network requests, screenshots, and rendered pages, and interact with the application. Install Chrome and use the Node.js runtime above. MCP registration and tool permissions are per developer, not application dependencies.

In Copilot CLI, run `/mcp add`, select a local server named `chrome-devtools`, and enter this command, then press Ctrl+S:

```sh
npx -y chrome-devtools-mcp@latest --isolated --no-usage-statistics --no-performance-crux
```

For other clients, use the same command and arguments with their [MCP registration instructions](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/client-configurations.md). The server launches Chrome when a browser tool is first used; confirm the server is available in the client before testing.

`--isolated` creates a temporary browser profile separate from everyday Chrome; test logins are discarded when it closes. The other flags disable server usage telemetry and CrUX lookups. Use this dedicated browser with dummy data and local/mock services, without Chrome Sync or personal accounts. Browser isolation does not restrict network destinations: obtain explicit approval before contacting external environments or submitting forms that trigger external calls.

Start the local stack first, then ask the agent:

> Open http://localhost:3000. Inspect the welcome page, report console errors and failed network requests, and take a screenshot. Do not submit forms or contact external services.

For a journey check, agree the allowed actions and dependencies first. Useful scenarios include login with a test account, creating a draft GAR, editing manifest people, and uploading a dummy supporting document through mock ClamAV. Check keyboard focus and person-specific accessible names on repeated controls; automated inspection is not a full accessibility audit.

Record the scenario, expected result, observed result, and relevant errors. Redact tokens, cookies, personal data, and sensitive URLs before sharing screenshots, network output, or saved artifacts; keep them out of version control. Re-run the same scenario after a fix and retain automated regression coverage where practical.

Browser debugging is optional and complements automated tests; it is not part of `just check` or `just verify`.

## Verify the setup

```sh
just --list
just check
just verify
just lint-templates
just check-template-format
```

`just check` is the normal code gate. `just verify` also checks formatting of non-JavaScript files, matching CI. The template commands are required when changing Nunjucks files. Run `just review-all` when the broader review tools are installed; its findings may require interpretation.
