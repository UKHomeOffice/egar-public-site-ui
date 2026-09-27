# Tooling Review

Review of the committed `ai-tooling` branch, focused on whether the changes help agents understand and work safely in this codebase, and whether the added tooling is valuable enough to maintain.

## Verdict

The branch is useful for agents and now provides a dependable core feedback loop for JavaScript, tests, formatting, and Nunjucks templates.

The strongest parts are `AGENTS.md` and the `justfile`: they give agents a much better map of the system, known traps, and verification commands. Template linting and formatting are clean and block the Drone build. Knip and the security tools remain useful but need interpretation because Knip deliberately reports warned exports and some security commands have known findings or non-blocking exit behaviour.

This review deliberately excludes branch-structure and bundling concerns. It focuses on whether the committed content helps agents work better.

## Follow-up applied

The `justfile` and `AGENTS.md` now label command tiers explicitly: `check` is the fast default gate, `verify` is a green-only final gate, `hygiene` and `security` hold advisory tools, and `advisory` runs those output-first checks without treating a non-zero result as unexpected.

The Trivy `scan` recipe now skips `.env`/`.env.*` files plus generated dependency directories (`node_modules`, `venv`, `.venv`) so default agent runs avoid surfacing local live-config metadata and third-party install noise while still scanning the repo tree for vulnerabilities, secrets, and misconfigurations.

The Nunjucks baseline was subsequently fixed. `just lint-html` now lints all 98 templates with no errors, and `just fmt-html-check` reports that no files would be updated. Drone runs both checks as a blocking `template-linting` step before the image build.

Developer prerequisites are now documented in [`docs/setup.md`](../setup.md), linked from the README and `AGENTS.md`. It distinguishes project-managed npm tools from the external Homebrew and pipx tools needed for template, Dockerfile, and security review.

## Gate model and Drone alignment

The local results below are the review snapshot, not a claim about every checkout. Re-run the gate relevant to a change. Local `just` tools overlap deliberately with Drone's build, test, and lint steps: developers use them to find and fix failures before CI. They are also a broader, quicker feedback surface for agents, so they include targeted and exploratory checks that Drone does not run. A non-clean advisory result is useful evidence to inspect, not a failed final gate.

| Gate | Local state recorded in this review | Drone alignment | Why it is blocking or advisory |
| --- | --- | --- | --- |
| `just check` | Green: ESLint and 759 tests passed. | Drone blocks on `unit-test` and `linting-formatting`; its `npm run check` also runs Prettier. | The fast local default is limited to stable, everyday checks. CI is the authoritative build gate and adds its production command. |
| `just verify` | Green: currently runs `check`. | It is a local final check, not a Drone-pipeline substitute. | Kept green so an agent can distinguish a regression from an existing advisory finding. |
| `just hygiene` | Template lint and format checks are clean across 98 templates. Knip exits 0 with 215 warned exports; Docker lint is clean under the shared Hadolint policy. | Drone blocks on both template checks and on Knip's exit status, and runs non-blocking `dockerfile-scan`. | Template checks are reliable gates. Knip remains useful but noisy because unused exports are configured as warnings; Docker lint is a clean advisory signal. |
| `just security` | `npm audit` had 3 vulnerabilities; Semgrep reported 6 findings while exiting 0; filesystem Trivy reported Dockerfile findings. | Drone image Trivy is explicitly non-blocking; Sonar is also non-blocking. Drone does not run the local audit or Semgrep commands. | Security output can be valuable without being a reliable pass/fail signal. The local scan excludes `.env` files and generated dependency trees to avoid exposing workstation data. |
| Docker image build | No equivalent `just` recipe. | Drone blocks on `build` after the configured test, lint, template, and unused-code steps. | A deployable-image failure is a release blocker and belongs in CI, where Docker is available consistently. |

## High-value changes to keep

| Area | Evidence | Why it helps agents |
| --- | --- | --- |
| System map and boundaries | `AGENTS.md:5-25` explains the Node/Express/Nunjucks app, `data-access-api`, One Login, ClamAV, and Notify boundaries. | This is exactly the kind of context agents usually infer badly. It reduces wrong assumptions like calling AMG/CBP directly or treating One Login as a single auth check. |
| Setup reality | [`docs/setup.md`](../setup.md) documents sibling `data-access-api`, `.env.dev`, local startup, tool installation, and the unusual `src/package.json` location; `AGENTS.md` points to it. | Very useful. Agents otherwise tend to run commands from the repo root and fail. |
| Command entry point | `AGENTS.md:36-52` plus `justfile:4-64`. | `just --list` gives agents a discoverable local command surface. This is a real improvement over hunting through `package.json`, Drone config, and tribal knowledge. |
| Known rough edges | `AGENTS.md:56-63`, especially 0T coverage, supporting-doc upload limits, Knip false positives, and partial `request` migration. | This is high-signal agent guidance. It names the places where an agent is most likely to make an unsafe simplification. |
| Tool configs | `src/knip.json`, `djlint.toml`, `src/.prettierignore`, `src/eslint.config.mjs`. | These turn vague quality intentions into runnable checks and encode repo-specific exceptions. |

## Feedback-loop findings

| Check | Observed result | Assessment |
| --- | --- | --- |
| `just check` | Passed; 759 tests passed. | Good fast default loop. Useful for agents. |
| `cd src && npm run check` | Passed. | CI lint/format script works. |
| `just fmt-check` | Passed. | Good read-only formatting check. |
| `just unused-code` | Exit 0, but reports 215 unused exports and 1 config hint. | Useful only because Knip exports are demoted to warn in `src/knip.json:7-9`; documentation should stress this is noisy and how to interpret it. |
| `just lint-html` | Passed: 98 templates linted with 0 errors. | Reliable targeted check and a blocking Drone gate. |
| `just fmt-html-check` | Passed: 98 templates checked and 0 files would be updated. | Reliable read-only formatting check and a blocking Drone gate. |
| `just dockerlint` | Passed. `.hadolint.yaml` accepts Alpine package-version, layer-boundary, and named-user trade-offs. | Drone runs the same command as non-blocking `dockerfile-scan`. | A clean targeted check for Dockerfile changes; the Drone step surfaces regressions without blocking the existing pipeline. |
| `just audit` | Failed with 3 vulnerabilities, including `request` and nested `uuid`. | Useful escalation check, but expected to fail until the `request` migration is complete. |
| `just sast` | Reports five Express session-cookie findings while exiting 0. The local `mock_clamav` all-interface bind is narrowly suppressed because its Docker container must be reachable by the app container. | Useful advisory output, but misleading if agents assume command success means no findings. |
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

### 3. Knip's successful exit still includes warnings

The template baseline is now clean, but `just unused-code` still reports 215 unused exports and one configuration hint while exiting successfully. This is intentional: `src/knip.json` demotes export findings to warnings because the application's dynamic router and test patterns are difficult for Knip to trace reliably.

**Recommendation:** retain Knip in CI for unused files and dependencies, but do not interpret a successful run as having no findings. Continue triaging the warned exports incrementally rather than removing them mechanically.

### 4. Security tooling needs clearer semantics

`just audit` fails and `just sast` reports blocking findings but exits 0. Trivy remains advisory too, but the default recipe now skips `.env`/`.env.*` files and generated dependency dirs so local live config and third-party install trees are not scanned by ordinary agent runs. These are valuable tools, but agents need to know whether findings are blocking, advisory, or expected baseline.

**Recommendation:** document expected behaviour per tool. For Trivy specifically, keep the default env/dependency-dir exclusions and consider scanning container images separately when production-like image risk is the goal.

### 5. External tool availability is now documented

`djlint`, `hadolint`, `trivy`, and `semgrep` are host tools and are not installed by `npm ci`. [`docs/setup.md`](../setup.md) now gives the macOS installation commands, distinguishes required or change-specific tools from optional review tools, and explains which tools are project-managed.

**Recommendation:** keep `docs/setup.md` authoritative and update it whenever the `justfile` gains or removes an external executable.

## Things to add

| Addition | Why |
| --- | --- |
| Default agent workflow section | Tell agents: read `AGENTS.md`, run `just --list`, prefer `just check`, run targeted tests where possible, escalate only when touching Docker/security/templates/dependencies. |
| Known advisory checks section | Prevent agents from wasting time treating known `audit`, Knip, Semgrep, or Trivy output as a new regression. Template linting no longer belongs in this category. |
| Test-selection guidance | The repo has 759 unit tests and many controllers; agents would benefit from examples of running one test file or one area before the full suite. |
| Generated/vendor file warnings | `src/.prettierignore` helps, but agent guidance should explicitly say not to hand-edit generated airport data or vendored/minified JS. |
| Definition of done for agents | Example: for JS/controller changes, run relevant tests, then `just check`; for template changes, run `just fmt-html-check` and `just lint-html`; for dependency changes, run audit and interpret the known baseline. |

## Things to remove or downgrade

| Candidate | Recommendation |
| --- | --- |
| `just scan` | Keep as advisory. The recipe now skips `.env`/`.env.*` files and generated dependency dirs to avoid scanning local live config and third-party install trees by default. |
| Long stale-prone operational detail in `AGENTS.md` | Keep for now, but consider moving deeper detail into linked docs if it grows. The current content is still high-signal. |

## Planned follow-on Jira and skills setup

The uncommitted setup added after the branch review is a good complement to this work. The important bit is that it records Jira as the source of truth while explicitly saying agents cannot access Jira directly. That prevents a common failure mode: agents hallucinating tracker access or trying to use GitHub Issues because the repo is hosted on GitHub.

Keep that follow-on config, but it should sit alongside a concise `AGENTS.md` "Agent skills" section rather than expanding the main file too much.

## Overall recommendation

Keep the AI-tooling direction. It is genuinely useful. The branch gives agents better context, better command discovery, and better warnings about legacy traps than the repo had before.

The core feedback-loop story is now sound: the default JavaScript/test gate is green, the template baseline is clean and enforced in CI, and advisory or noisy checks are separated from the final local gate. The main remaining improvement is to make the documented distinction between a clean check and a successful-but-noisy check—especially Knip and Semgrep—even harder to miss.
