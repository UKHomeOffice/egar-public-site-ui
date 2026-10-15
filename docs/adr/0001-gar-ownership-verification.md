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
- **`POST /garfile/manifest/deleteperson`:** it is built with `buildGarRouterAndPaths`, so it is checked by the middleware. Its controller still reads the GarId from the session cookie instead of `res.locals.gar`.

## Testing

- Route-level tests mount the real router with `proxyquire`, stub the other middleware, and stub `hasGarOwnership`. They assert that a non-owned GAR is redirected to `/home` and the controller is not called, and that an owned GAR reaches the controller. See `src/test/garfile/manifest/deleteperson/index.test.js`.
- Controller unit tests do not exercise ownership, so they do not replace route-level tests.

## Guidance for AI agents

- Use `buildGarRouterAndPaths` and read the GAR from `res.locals.gar`.
- Never use a GarId from the request or session on a route without the middleware, and never set one in the session unverified.
- When adding or changing a GAR route, add a route-level test for the ownership check, following the pattern above.
- When writing controller tests, await or flush the controller's promise chain so assertions run before the test ends. Un-awaited `.then(() => expect(...))` assertions cannot fail the test.
- Before relying on this ADR's list of deviations, check the code, as it can go stale.
