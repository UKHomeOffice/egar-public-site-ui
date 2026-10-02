set dotenv-load := true
set dotenv-filename := ".env.dev"

default:
    @just --list

# ESLint: rule violations (unused vars, complexity, deprecated patterns) — not layout.
# Also enforces Prettier formatting as an ESLint error (eslint-plugin-prettier), so
# this alone covers what `check` gates on.
# Lint JavaScript and enforce Prettier formatting.
lint-code:
    cd src && npx eslint . --ext .js

# Prettier: rewrites files to canonical layout — quotes, wrapping, spacing
format-code:
    cd src && npm run prettier-format

# Apply safe ESLint fixes, then format code.
fix-code:
    cd src && npm run fix

# Same as `format-code` but read-only — reports unformatted files instead of rewriting them
check-code-format:
    cd src && npx prettier --check .

# Run the test suite (mocha + c8 coverage, matches `npm run test`)
run-tests:
    cd src && npx c8 --reporter=lcov mocha --file test/global.test.js --bail --recursive

# Fast default gate for normal code changes. Expected to pass on a clean branch.
check: lint-code run-tests

# Unused files, exports, and dependencies
check-unused-code:
    cd src && npx knip

# Lint Nunjucks templates: rule violations, not layout
lint-templates:
    djlint src --lint

# Reformat Nunjucks templates. --no-function-formatting is required — without it,
# djlint corrupts nested GOV.UK macro object arguments and breaks page rendering
# (same reason as ssar-public-site-ui).
# Reformat Nunjucks templates safely.
format-templates:
    djlint src --reformat --no-function-formatting

# Same as format-templates but read-only
check-template-format:
    djlint src --check --no-function-formatting

# Check npm dependencies for known vulnerabilities — local only, deliberately not in CI
# (trivy-scan-image already covers this ground; see AGENTS.md)
# Audit Node dependencies for known vulnerabilities.
audit-dependencies:
    cd src && npm audit

# Lint the Dockerfile
lint-dockerfile:
    hadolint Dockerfile

# Scan the working tree for vulnerabilities, secrets, and misconfig.
# Skip local env files and generated dependency dirs so default runs avoid local noise.
# Scan the working tree for vulnerabilities, secrets, and misconfigurations.
scan-filesystem:
    trivy fs --scanners vuln,secret,misconfig --skip-files ".env,.env.*,**/.env,**/.env.*" --skip-dirs "node_modules,**/node_modules,venv,.venv,**/venv,**/.venv" .

# Static analysis for security and correctness bugs (not just style)
scan-code:
    semgrep --config=p/security-audit --config=p/nodejs .

# Advisory code-health checks. Read the output; some checks have known baseline findings.
review-hygiene:
    -just check-unused-code
    -just lint-templates
    -just lint-dockerfile

# Security/dependency scans. Read the output; findings may be known or require triage.
review-security:
    -just audit-dependencies
    -just scan-filesystem
    -just scan-code

# Final green verification gate. Only includes checks expected to pass.
verify: check

# Run all advisory review tools. Not guaranteed to exit cleanly.
review-all:
    -just review-hygiene
    -just review-security
