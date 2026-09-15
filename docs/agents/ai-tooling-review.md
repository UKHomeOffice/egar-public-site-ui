# AI Tooling Branch Review

Review of the committed `ai-tooling` branch, focused on whether the changes help agents understand and work safely in this codebase, and whether the added tooling is valuable enough to maintain.

## Verdict

The branch is useful for agents, but the feedback-loop documentation needs tightening before it fully earns its maintenance cost.

The strongest parts are `AGENTS.md` and the `justfile`: they give agents a much better map of the system, known traps, and verification commands. The weakest part is that some advertised checks are not yet dependable agent feedback loops because they fail on known baseline issues, are noisy, or report findings without failing.

This review deliberately excludes branch-structure and bundling concerns. It focuses on whether the committed content helps agents work better.

## Follow-up applied

The `justfile` and `AGENTS.md` now label command tiers explicitly: `check` is the fast default gate, `verify` is a green-only final gate, `hygiene` and `security` hold advisory tools, and `advisory` runs those output-first checks without treating a non-zero result as unexpected.

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
| `just dockerlint` | Failed on `Dockerfile:3` because `apk add curl` is unpinned. | Useful, but currently not green. Either fix the Dockerfile or document this as a known baseline failure. |
| `just audit` | Failed with 3 vulnerabilities, including `request` and nested `uuid`. | Useful escalation check, but expected to fail until the `request` migration is complete. |
| `just sast` | Completed and reported 6 findings, but exited 0. | Useful as advisory output, but misleading if agents assume command success means no findings. |
| Bounded `trivy fs` spot-check | Reported Dockerfile issues and scanned local ignored `.env.dev`. | Valuable but risky/noisy as written. The recipe `trivy fs .` can expose local ignored secrets in output and should be constrained. |

## Main problems to fix

### 1. `just check` is described as matching CI, but it does not exactly match CI

`AGENTS.md:45` and `justfile:25-26` say `just check` is the local quality gate and matches CI. But CI runs `npm run check` in `.drone.yml:20-26`, and `src/package.json` defines that as `eslint . --ext .js && prettier --check .`. `just check` runs `lint test`, not `fmt-check`.

The practical result is okay right now because ESLint includes `prettier/prettier`, and `fmt-check` passes, but the documentation is still slightly misleading.

**Recommendation:** change the wording to something like: "`just check` is the fast local gate: ESLint plus tests. CI additionally runs `npm run check`, which includes Prettier." Alternatively, update `just check` to include `fmt-check`.

### 2. `just verify` currently aggregates checks that are expected to fail

`justfile:64` defines `verify: check knip lint-html dockerlint audit scan sast`. In practice, `lint-html`, `dockerlint`, and `audit` fail today. That makes `verify` a poor "full agent review" command because an agent cannot tell whether it introduced a failure or hit the existing baseline.

**Recommendation:** split checks into tiers:

- `just check`: fast green default.
- `just hygiene`: Knip, formatting, and maybe Docker linting once fixed.
- `just security`: audit, Trivy, and Semgrep advisory checks.
- `just verify`: only checks expected to pass on a clean branch.

### 3. Template linting is useful but not yet actionable enough

`djlint.toml` is thoughtful, especially the `--no-function-formatting` usage in `justfile:36-44`, but `just lint-html` fails with 77 existing findings. That is not a dependable agent feedback loop yet.

**Recommendation:** either fix the baseline, add ignores for accepted legacy findings, or document `lint-html` as exploratory/advisory until it is green.

### 4. Security tooling needs clearer semantics

`just audit` fails, `just sast` reports blocking findings but exits 0, and Trivy can scan ignored local files such as `.env.dev`. These are valuable tools, but agents need to know whether findings are blocking, advisory, or expected baseline.

**Recommendation:** document expected behaviour per tool. For Trivy specifically, consider excluding local env files and dependency directories, or using a safer recipe such as scanning tracked files or container images rather than raw `trivy fs .`.

### 5. External tool availability is not encoded

`djlint`, `hadolint`, `trivy`, and `semgrep` are host tools. They are not installed by `npm install`. An agent in a fresh environment may see `just verify` and fail before reaching the code.

**Recommendation:** add a short tool-prerequisites note to `AGENTS.md` or the `justfile`: Node/npm are project-local; djlint/hadolint/trivy/semgrep are host tools; Docker is needed for Compose/build checks.

## Things to add

| Addition | Why |
| --- | --- |
| Default agent workflow section | Tell agents: read `AGENTS.md`, run `just --list`, prefer `just check`, run targeted tests where possible, escalate only when touching Docker/security/templates/dependencies. |
| Known failing/advisory checks section | Prevent agents from wasting time trying to make `audit`, `lint-html`, or `dockerlint` green if those failures are accepted baseline. |
| Test-selection guidance | The repo has 759 unit tests and many controllers; agents would benefit from examples of running one test file or one area before the full suite. |
| Generated/vendor file warnings | `src/.prettierignore` helps, but agent guidance should explicitly say not to hand-edit generated airport data or vendored/minified JS. |
| Definition of done for agents | Example: for JS/controller changes, run relevant tests, then `just check`; for template changes, run `just fmt-html-check`/`lint-html` only if the baseline is understood; for dependency changes, run audit. |

## Things to remove or downgrade

| Candidate | Recommendation |
| --- | --- |
| `just verify` as currently named | Change, not remove. The name implies a green final gate, but it currently includes known failing/advisory checks. |
| `just scan: trivy fs .` | Change. As written, it can scan ignored local secrets and dependency folders. Make it safer or document it as manual-only. |
| `just lint-html` in ordinary workflow | Downgrade until the baseline is clean or configured. |
| Long stale-prone operational detail in `AGENTS.md` | Keep for now, but consider moving deeper detail into linked docs if it grows. The current content is still high-signal. |

## Planned follow-on Jira and skills setup

The uncommitted setup added after the branch review is a good complement to this work. The important bit is that it records Jira as the source of truth while explicitly saying agents cannot access Jira directly. That prevents a common failure mode: agents hallucinating tracker access or trying to use GitHub Issues because the repo is hosted on GitHub.

Keep that follow-on config, but it should sit alongside a concise `AGENTS.md` "Agent skills" section rather than expanding the main file too much.

## Overall recommendation

Keep the AI-tooling direction. It is genuinely useful. The branch gives agents better context, better command discovery, and better warnings about legacy traps than the repo had before.

Before considering it good, make the feedback-loop story sharper: make the default gate reliably green, clearly mark advisory/expensive checks, fix or baseline the checks that currently fail, and protect Trivy from scanning local ignored secrets. That would turn the work from "lots of tools and helpful notes" into a dependable agent operating model.
