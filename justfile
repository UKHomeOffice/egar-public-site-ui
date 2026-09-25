set dotenv-load := true
set dotenv-filename := ".env.dev"

default:
    @just --list

# ESLint: rule violations (unused vars, complexity, deprecated patterns) — not layout.
# Also enforces Prettier formatting as an ESLint error (eslint-plugin-prettier), so
# this alone covers what `check` gates on.
# Lint JavaScript and enforce Prettier formatting.
lint:
    cd src && npx eslint . --ext .js

# Prettier: rewrites files to canonical layout — quotes, wrapping, spacing
fmt:
    cd src && npm run prettier-format

# Apply safe ESLint fixes, then format code.
fix:
    cd src && npm run fix

# Same as `fmt` but read-only — reports unformatted files instead of rewriting them
fmt-check:
    cd src && npx prettier --check .

# Run the test suite (mocha + c8 coverage, matches `npm run test`)
test:
    cd src && npx c8 --reporter=lcov mocha --file test/global.test.js --bail --recursive

# Fast default gate for normal code changes. Expected to pass on a clean branch.
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
# Reformat Nunjucks templates safely.
fmt-html:
    djlint src --reformat --no-function-formatting

# Same as fmt-html but read-only
fmt-html-check:
    djlint src --check --no-function-formatting

# Check npm dependencies for known vulnerabilities — local only, deliberately not in CI
# (trivy-scan-image already covers this ground; see AGENTS.md)
# Audit Node dependencies for known vulnerabilities.
audit:
    cd src && npm audit

# Lint the Dockerfile
dockerlint:
    hadolint Dockerfile

# Scan the working tree for vulnerabilities, secrets, and misconfig.
# Skip local env files and generated dependency dirs so default runs avoid local noise.
# Scan the working tree for vulnerabilities, secrets, and misconfigurations.
scan:
    trivy fs --scanners vuln,secret,misconfig --skip-files ".env,.env.*,**/.env,**/.env.*" --skip-dirs "node_modules,**/node_modules,venv,.venv,**/venv,**/.venv" .

# Static analysis for security and correctness bugs (not just style)
sast:
    semgrep --config=p/security-audit --config=p/nodejs .

# Advisory code-health checks. Read the output; some checks have known baseline findings.
hygiene:
    -just knip
    -just lint-html
    -just dockerlint

# Security/dependency scans. Read the output; findings may be known or require triage.
security:
    -just audit
    -just scan
    -just sast

# Final green verification gate. Only includes checks expected to pass.
verify: check

# Run all advisory review tools. Not guaranteed to exit cleanly.
advisory:
    -just hygiene
    -just security
