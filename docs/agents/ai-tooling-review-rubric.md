# AI Tooling Review Rubric

Use this rubric to assess whether a repository's agent-facing documentation and tooling actually help AI agents understand, modify, and verify work safely.

The goal is not to reward a repo for having more tools or longer instructions. The goal is to decide whether the added complexity prevents real agent failure modes and gives agents dependable feedback loops.

## Assessment criteria

| Criterion | What to assess |
| --- | --- |
| Agent context | Does the repo explain its architecture, boundaries, external services, setup quirks, and known traps clearly enough for an agent to avoid bad assumptions? |
| Feedback loops | Are there discoverable commands for linting, tests, formatting, security, unused code, and other relevant checks? Do they actually run? |
| Tiering | Is there a fast default check, plus slower advisory or escalation checks, rather than an expectation to run everything every time? |
| Accuracy | Do docs match the real scripts, CI config, package layout, tool configuration, and observed tool behaviour? |
| Actionability | When tools fail, can an agent tell whether it introduced the issue or hit a known baseline? |
| Maintenance cost | Does each added tool or instruction prevent a concrete agent failure mode, or is it just more surface area to maintain? |
| Safety and process boundaries | Does the repo tell agents what they must not assume or access, such as Jira, production services, secrets, destructive git actions, or cross-repo ownership? |
| Recommendation quality | Does the review say what to keep, change, remove, and add, rather than only listing problems? |

## Review process

1. Identify the review boundary: committed branch, working tree, or both.
2. Read the agent-facing docs, especially `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, and `docs/agents/`.
3. Inspect the command surface: `justfile`, `package.json`, CI config, Docker setup, Makefiles, and tool config files.
4. Run the smallest practical checks needed to verify that documented feedback loops are real.
5. Classify each check as a fast default check, targeted check, advisory check, expensive escalation check, or known failing baseline.
6. Compare documentation claims with observed behaviour.
7. Judge whether each tool or instruction has a clear agent-facing benefit.
8. Produce keep, change, remove, and add recommendations with concrete evidence.

## Feedback-loop tiers

| Tier | Purpose | Examples |
| --- | --- | --- |
| Fast default | The normal verification loop for most code changes. Should be green on a clean branch. | Unit tests, lint, format check, type check. |
| Targeted | Checks tied to the changed area. | One test file, template lint for Nunjucks changes, Docker lint for Dockerfile changes. |
| Advisory | Useful findings, but not necessarily blocking. Output needs interpretation. | Unused-code scans with known false positives, Semgrep rules that report findings but exit 0. |
| Expensive escalation | Run sparingly when the change warrants it. | Full security scans, filesystem vulnerability scans, container scans, dependency audits. |
| Known baseline | Checks that currently fail for accepted legacy reasons. | Existing audit findings, unresolved template-lint findings, noisy unused-export reports. |

## Questions to answer

- Can an agent quickly learn what this repo is, what it talks to, and what it must not touch?
- Can an agent find the correct setup and command entry points without guessing?
- Is there one clear default verification loop?
- Are expensive tools labelled as escalation checks rather than everyday commands?
- Do documented commands work from a normal checkout?
- Does CI run the same checks that the docs claim it runs?
- If a command fails, is the failure actionable?
- Are known false positives documented close to the tool that emits them?
- Are host-level tool prerequisites documented?
- Are generated, vendored, or sensitive files clearly identified?
- Are issue-tracker and access limitations explicit?
- Does every added tool or instruction justify its maintenance cost?

## Report shape

Structure the report around decisions, not just observations:

- **Verdict**: whether the agent tooling is useful overall.
- **High-value changes to keep**: what is already working and why.
- **Feedback-loop findings**: each documented check, observed result, and assessment.
- **Main problems to fix**: the most important gaps or misleading claims.
- **Things to add**: missing high-leverage agent affordances.
- **Things to remove or downgrade**: tools or instructions whose name, tier, or behaviour is misleading.
- **Overall recommendation**: what would make the repo's agent tooling dependable enough to rely on.

## Useful standard

A good AI-tooling setup makes agents more likely to:

- understand the domain and system boundaries before editing;
- choose the right command for the change they made;
- distinguish new failures from known baseline failures;
- avoid unsupported access, unsafe operations, and cross-repo assumptions;
- escalate to expensive checks only when they add value; and
- explain recommendations with evidence from the repository.
