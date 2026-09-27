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

Create `.env.dev`. There is no committed example file; ask the team for development values and use `src/common/config/index.js` as the authoritative list of environment reads.

To use the local mock ClamAV container, include:

```dotenv
CLAMAV_BASE=http://mock-clamav
CLAMAV_PORT=8080
```

`just` loads `.env.dev` automatically.

## Run the service

From the repository root:

```sh
docker compose up -d --build
```

This builds the UI and its sibling `data-access-api`. The UI is available on port 3000.

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

## Verify the setup

```sh
just --list
just check
just lint-html
just fmt-html-check
```

`just check` is the normal code gate. The template commands are required when changing Nunjucks files. Run `just advisory` when the broader review tools are installed; its findings may require interpretation.
