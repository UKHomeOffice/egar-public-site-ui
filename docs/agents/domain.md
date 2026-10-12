# Domain docs

This is a single-context repo. If `CONTEXT.md` exists at the repo root, read it before changing domain-heavy code. If relevant ADRs exist under `docs/adr/`, read them before changing the area they cover.

If those files do not exist, proceed using `AGENTS.md` as the source of repo context. Do not create domain docs just because they are missing; create or update them only when a discussion resolves terminology or an architectural decision.

## Current vocabulary sources

Until `CONTEXT.md` exists, use `AGENTS.md` for this repo's working vocabulary, especially:

- sGAR / GAR
- data-access-api
- GOV.UK One Login
- ClamAV
- GOV.UK Notify
- AMG / CBP
- supporting documents
- 0T resubmit
- responsible person

## ADRs

Use root-level `docs/adr/` for decisions that affect this app. If your proposed change contradicts an ADR, say so explicitly before proceeding.
