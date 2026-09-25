# Tooling Review

Review of the committed `ai-tooling` branch, focused on whether the changes help agents understand and work safely in this codebase, and whether the added tooling is valuable enough to maintain.

## Verdict

The branch is useful for agents, but the feedback-loop documentation needs tightening before it fully earns its maintenance cost.

The strongest parts are `AGENTS.md` and the `justfile`: they give agents a much better map of the system, known traps, and verification commands. The weakest part is that some advertised checks are not yet dependable agent feedback loops because they fail on known baseline issues, are noisy, or report findings without failing.

This review deliberately excludes branch-structure and bundling concerns. It focuses on whether the committed content helps agents work better.

## Follow-up applied

The `justfile` and `AGENTS.md` now label command tiers explicitly: `check` is the fast default gate, `verify` is a green-only final gate, `hygiene` and `security` hold advisory tools, and `advisory` runs those output-first checks without treating a non-zero result as unexpected.

The Trivy `scan` recipe now skips `.env`/`.env.*` files plus generated dependency directories (`node_modules`, `venv`, `.venv`) so default agent runs avoid surfacing local live-config metadata and third-party install noise while still scanning the repo tree for vulnerabilities, secrets, and misconfigurations.

## Gate model and Drone alignment

The local results below are the review snapshot, not a claim about every checkout. Re-run the gate relevant to a change. Local `just` tools overlap deliberately with Drone's build, test, and lint steps: developers use them to find and fix failures before CI. They are also a broader, quicker feedback surface for agents, so they include targeted and exploratory checks that Drone does not run. A non-clean advisory result is useful evidence to inspect, not a failed final gate.

| Gate | Local state recorded in this review | Drone alignment | Why it is blocking or advisory |
| --- | --- | --- | --- |
| `just check` | Green: ESLint and 759 tests passed. | Drone blocks on `unit-test` and `linting-formatting`; its `npm run check` also runs Prettier. | The fast local default is limited to stable, everyday checks. CI is the authoritative build gate and adds its production command. |
| `just verify` | Green: currently runs `check`. | It is a local final check, not a Drone-pipeline substitute. | Kept green so an agent can distinguish a regression from an existing advisory finding. |
| `just hygiene` | Knip exits 0 with 215 warned exports; `lint-html` had 77 findings; Docker lint is clean under the shared Hadolint policy. | Drone configures `template-linting` and `unused-code-scan` as blocking steps, and runs non-blocking `dockerfile-scan`. The recorded local template-lint baseline therefore conflicts with that configuration and must be resolved before relying on the alignment. | These tools are useful but their current output needs interpretation or baseline work; Docker lint is a clean advisory signal. |
| `just security` | `npm audit` had 3 vulnerabilities; Semgrep reported 6 findings while exiting 0; filesystem Trivy reported Dockerfile findings. | Drone image Trivy is explicitly non-blocking; Sonar is also non-blocking. Drone does not run the local audit or Semgrep commands. | Security output can be valuable without being a reliable pass/fail signal. The local scan excludes `.env` files and generated dependency trees to avoid exposing workstation data. |
| Docker image build | No equivalent `just` recipe. | Drone blocks on `build` after the configured test, lint, template, and unused-code steps. | A deployable-image failure is a release blocker and belongs in CI, where Docker is available consistently. |

## High-value changes to keep

| Area | Evidence | Why it helps agents |
| --- | --- | --- |
| System map and boundaries | `AGENTS.md:5-25` explains the Node/Express/Nunjucks app, `data-access-api`, One Login, ClamAV, and Notify boundaries. | This is exactly the kind of context agents usually infer badly. It reduces wrong assumptions like calling AMG/CBP directly or treating One Login as a single auth check. |
| Setup reality | `AGENTS.md:27-34` documents sibling `data-access-api`, `.env.dev`, Docker Compose, and the unusual `src/package.json` location. | Very useful. Agents otherwise tend to run commands from the repo root and fail. |
| Command entry point | `AGENTS.md:36-52` plus `justfile:4-64`. | `just --list` gives agents a discoverable local command surface. This is a real improvement over hunting through `package.json`, Drone config, and tribal knowledge. |
| Known rough edges | `AGENTS.md:56-63`, especially 0T coverage, supporting-doc upload limits, Knip false positives, and partial `request` migration. | This is high-signal agent guidance. It names the places where an agent is most likely to make an unsafe simplification. |
| Tool configs | `src/knip.json`, `djlint.toml`, `src/.prettierignore`, `src/eslint.config.mjs`. | These turn vague quality intentions into runnable checks and encode repo-specific exceptions. |

## Feedback-loop findings

| Check | Observed result | Assessment |
| --- | --- | --- |
| `just check` | Passed; 759 tests passed. | Good fast default loop. Useful for agents. |
| `cd src && npm run check` | Passed. | CI lint/format script works. |
| `just fmt-check` | Passed. | Good read-only formatting check. |
| `just knip` | Exit 0, but reports 215 unused exports and 1 config hint. | Useful only because exports are demoted to warn in `src/knip.json:7-9`; documentation should stress this is noisy and how to interpret it. |
| `just lint-html` | Failed with 77 djlint findings. | Not ready as an ordinary verification command. Good candidate for advisory/baseline work, not part of a green default loop yet. |
| `just dockerlint` | Passed. `.hadolint.yaml` accepts Alpine package-version, layer-boundary, and named-user trade-offs. | Drone runs the same command as non-blocking `dockerfile-scan`. | A clean targeted check for Dockerfile changes; the Drone step surfaces regressions without blocking the existing pipeline. |
| `just audit` | Failed with 3 vulnerabilities, including `request` and nested `uuid`. | Useful escalation check, but expected to fail until the `request` migration is complete. |
| `just sast` | Completed and reported 6 findings, but exited 0. | Useful as advisory output, but misleading if agents assume command success means no findings. |
| Bounded `trivy fs` spot-check | Reported Dockerfile issues and scanned local ignored `.env.dev`. The default `scan` recipe now skips `.env`/`.env.*` files and generated dependency dirs. | Valuable advisory scan; default exclusions reduce local-secret metadata and third-party install noise. |

## Main problems to fix

### 1. `just check` is described as matching CI, but it does not exactly match CI

`AGENTS.md:45` and `justfile:25-26` say `just check` is the local quality gate and matches CI. But CI runs `npm run check` in `.drone.yml:20-26`, and `src/package.json` defines that as `eslint . --ext .js && prettier --check .`. `just check` runs `lint test`, not `fmt-check`.

The practical result is okay right now because ESLint includes `prettier/prettier`, and `fmt-check` passes, but the documentation is still slightly misleading.

**Recommendation:** change the wording to something like: "`just check` is the fast local gate: ESLint plus tests. CI additionally runs `npm run check`, which includes Prettier." Alternatively, update `just check` to include `fmt-check`.

### 2. `just verify` has been narrowed to a green final gate

The earlier `verify` recipe bundled green checks with advisory tools. It now runs only `check`, while `knip`, `lint-html`, `dockerlint`, `audit`, `scan`, and `sast` live under the labelled advisory tiers.

That makes `verify` a dependable final gate again. Agents still need to read advisory output when they deliberately run `hygiene`, `security`, or `advisory`.

**Recommendation:** keep this split:

- `just check`: fast green default.
- `just hygiene`: Knip, template linting, and Docker linting.
- `just security`: audit, Semgrep, and the env-file-skipping Trivy recipe.
- `just verify`: only checks expected to pass on a clean branch.

### 3. Template linting is useful but not yet actionable enough

`djlint.toml` is thoughtful, especially the `--no-function-formatting` usage in `justfile:36-44`, but `just lint-html` fails with 77 existing findings. That is not a dependable agent feedback loop yet.

**Recommendation:** either fix the baseline, add ignores for accepted legacy findings, or document `lint-html` as exploratory/advisory until it is green.

### 4. Security tooling needs clearer semantics

`just audit` fails and `just sast` reports blocking findings but exits 0. Trivy remains advisory too, but the default recipe now skips `.env`/`.env.*` files and generated dependency dirs so local live config and third-party install trees are not scanned by ordinary agent runs. These are valuable tools, but agents need to know whether findings are blocking, advisory, or expected baseline.

**Recommendation:** document expected behaviour per tool. For Trivy specifically, keep the default env/dependency-dir exclusions and consider scanning container images separately when production-like image risk is the goal.

### 5. External tool availability is not encoded

`djlint`, `hadolint`, `trivy`, and `semgrep` are host tools. They are not installed by `npm install`. An agent in a fresh environment may see `just verify` and fail before reaching the code.

**Recommendation:** add a short tool-prerequisites note to `AGENTS.md` or the `justfile`: Node/npm are project-local; djlint/hadolint/trivy/semgrep are host tools; Docker is needed for Compose/build checks.

## Things to add

| Addition | Why |
| --- | --- |
| Default agent workflow section | Tell agents: read `AGENTS.md`, run `just --list`, prefer `just check`, run targeted tests where possible, escalate only when touching Docker/security/templates/dependencies. |
| Known advisory checks section | Prevent agents from wasting time treating `audit` or `lint-html` output as a regression when it is an accepted baseline. |
| Test-selection guidance | The repo has 759 unit tests and many controllers; agents would benefit from examples of running one test file or one area before the full suite. |
| Generated/vendor file warnings | `src/.prettierignore` helps, but agent guidance should explicitly say not to hand-edit generated airport data or vendored/minified JS. |
| Definition of done for agents | Example: for JS/controller changes, run relevant tests, then `just check`; for template changes, run `just fmt-html-check`/`lint-html` only if the baseline is understood; for dependency changes, run audit. |

## Things to remove or downgrade

| Candidate | Recommendation |
| --- | --- |
| `just scan` | Keep as advisory. The recipe now skips `.env`/`.env.*` files and generated dependency dirs to avoid scanning local live config and third-party install trees by default. |
| `just lint-html` in ordinary workflow | Downgrade until the baseline is clean or configured. |
| Long stale-prone operational detail in `AGENTS.md` | Keep for now, but consider moving deeper detail into linked docs if it grows. The current content is still high-signal. |

## Planned follow-on Jira and skills setup

The uncommitted setup added after the branch review is a good complement to this work. The important bit is that it records Jira as the source of truth while explicitly saying agents cannot access Jira directly. That prevents a common failure mode: agents hallucinating tracker access or trying to use GitHub Issues because the repo is hosted on GitHub.

Keep that follow-on config, but it should sit alongside a concise `AGENTS.md` "Agent skills" section rather than expanding the main file too much.

## Overall recommendation

Keep the AI-tooling direction. It is genuinely useful. The branch gives agents better context, better command discovery, and better warnings about legacy traps than the repo had before.

Before considering it good, make the feedback-loop story sharper: make the default gate reliably green, clearly mark advisory/expensive checks, and fix or baseline the checks that currently fail. That would turn the work from "lots of tools and helpful notes" into a dependable agent operating model.
