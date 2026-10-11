# ADR 0001: GAR / GarId Ownership Verification

- **Status:** Accepted
- **Date:** 2026-10-09

## Context

Controllers act on a `GarId` taken from the request or session. Both are client-influenced, so the id cannot be trusted.

## Decision

Every GAR route must verify ownership server-side before its controller runs, using `nav.buildGarRouterAndPaths` or `garAccessCheck` (`src/common/middleware/garOwnership.js`).

- The id is read from `req.body.garId`, then `req.query.garId`, then the session.
- The GAR is loaded from the data API. The user's organisation must match `gar.organisationId`, or for users without an organisation, `gar.userId` must match.
- **Pass:** the session GarId is set and the GAR is put in `res.locals.gar`.
- **Fail:** the session GAR is cleared and the user is redirected to `/home`.

## Assumptions

- Only routes behind `garAccessCheck` are protected, and the session only holds verified GarIds.

## Known deviations

- **Deep link:** after login, `gar_id` is set in the session before any check. The target route's middleware verifies it later.
- **`/garfile/printmanifest`:** it is checked by the middleware, but its controller re-derives the id instead of using `res.locals.gar`.
- **`POST /garfile/manifest/deleteperson`:** it has no `garAccessCheck`. It uses the session GarId.

## Guidance for AI agents

- Use `buildGarRouterAndPaths` and read the GAR from `res.locals.gar`.
- Never use a GarId from the request or session on a route without the middleware, and never set one in the session unverified.
