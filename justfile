set dotenv-load := true
set dotenv-filename := ".env.dev"

default:
    @just --list

# ESLint: rule violations (unused vars, complexity, deprecated patterns) — not layout.
# Also enforces Prettier formatting as an ESLint error (eslint-plugin-prettier), so
# this alone covers what `check` gates on.
lint:
    cd src && npx eslint . --ext .js

# Prettier: rewrites files to canonical layout — quotes, wrapping, spacing
fmt:
    cd src && npx prettier --write .

# Same as `fmt` but read-only — reports unformatted files instead of rewriting them
fmt-check:
    cd src && npx prettier --check .

# Run the test suite (mocha + c8 coverage, matches `npm run test`)
test:
    cd src && npx c8 --reporter=lcov mocha --file test/global.test.js --bail --recursive

# Local quality-gate suite, matches what CI runs
check: lint test

# Unused files, exports, and dependencies
knip:
    cd src && npx knip

# Lint Nunjucks templates: rule violations, not layout
lint-html:
    djlint src --lint

# Reformat Nunjucks templates. --no-function-formatting is required — without it,
# djlint corrupts nested GOV.UK macro object arguments and breaks page rendering
# (same reason as ssar-public-site-ui).
fmt-html:
    djlint src --reformat --no-function-formatting

# Same as fmt-html but read-only
fmt-html-check:
    djlint src --check --no-function-formatting

# Check npm dependencies for known vulnerabilities — local only, deliberately not in CI
# (trivy-scan-image already covers this ground; see AGENTS.md)
audit:
    cd src && npm audit

# Lint the Dockerfile
dockerlint:
    hadolint Dockerfile

# Scan the working tree for vulnerabilities, secrets, and misconfig
scan:
    trivy fs .

# Static analysis for security and correctness bugs (not just style)
sast:
    semgrep --config=p/security-audit --config=p/nodejs .

# Full agent review: local quality gates plus broader hygiene and security checks
verify: check knip lint-html dockerlint audit scan sast
