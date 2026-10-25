# HTTP client migration to native Fetch

## Problem Statement

The sGAR application still makes outbound HTTP calls through the deprecated callback-based `request` library and a correlation-ID wrapper. A partial migration has introduced a Fetch-based `HttpClient` for some GAR reads, while other GAR operations and service integrations continue to use `request`. This leaves two transport implementations in production code, splits behavior and tests across different patterns, and prevents removing the direct `request` dependency.

The migration must preserve the sGAR journeys and service contracts that depend on these calls while replacing the underlying transport.

## Solution

Complete the migration of all server-side application calls currently made through the `requestWithCorrelationId` wrapper to native Node.js Fetch through the shared `HttpClient`. Migrate incrementally by service, allowing temporary coexistence during the work, but finish with the legacy wrapper and direct `request` dependency removed.

Keep service method names, signatures, caller-visible response shapes, and user-facing behavior compatible. Make Fetch-specific transport behavior consistent in `HttpClient`, and retain compatibility at service boundaries where legacy services currently handle failures differently.

## User Stories

1. As an sGAR user, I want GAR information and supporting documents to continue loading, so that I can view and complete my GAR without a transport-library change affecting my journey.
2. As an sGAR user, I want GAR updates, submissions, check-in, departure exceptions, and deletions to continue working, so that existing GAR workflows behave as before.
3. As an sGAR user, I want user, organisation, craft, person, responsible-person, token, and verification operations to continue working, so that account and GAR tasks remain available after the migration.
4. As an sGAR user, I want GOV.UK One Login requests to continue working, so that authentication and account journeys are unaffected by the transport change.
5. As an sGAR user, I want uploaded supporting documents to retain their original file content and filename, so that documents continue to upload and be scanned correctly.
6. As an sGAR user, I want ClamAV scan results to be interpreted as before, so that accepted and rejected uploads retain their current behavior.
7. As an operator investigating an integration failure, I want outbound calls to retain their correlation ID, so that related application and service logs can be traced together.
8. As a service caller, I want existing service method names, signatures, and success result shapes to remain stable, so that this transport migration does not require unrelated controller or journey changes.
9. As a service caller, I want each service to retain its existing caller-visible failure behavior, so that the shared transport layer does not unexpectedly change user-facing error handling.
10. As a developer diagnosing an HTTP failure, I want the shared client to expose the Fetch status, status text, request URL and method, and available response body, so that failures can be interpreted consistently.
11. As a developer diagnosing a network or explicitly timed request failure, I want the error type to distinguish HTTP responses, network failures, and configured timeout aborts, so that each can be handled appropriately.
12. As a developer integrating an HTTP service, I want JSON, text, and empty responses to be supported, so that the shared client works with both data APIs and non-JSON integrations.
13. As a developer integrating an external service, I want each client instance to accept only fully qualified HTTP(S) URLs for its configured origin, so that requests are unambiguous and cannot be sent to an unintended host.
14. As a developer maintaining GAR integrations, I want all GAR operations to use the injected `GarApi` implementation, so that the module no longer contains parallel Fetch and `request` implementations.
15. As a maintainer, I want the direct `request` dependency and its application wrapper removed once migration is complete, so that the application no longer relies on the deprecated transport.
16. As a maintainer, I want tests to exercise the shared transport and each service's public behavior without contacting live integrations, so that the migration can be verified safely and repeatably.

## Implementation Decisions

- Migrate every server-side service that currently uses the correlation-ID-wrapped `request` client, including GAR/data-access, user, person, organisation, craft, responsible-person, token, verification, create-user, create-GAR, GOV.UK One Login, ClamAV, and supporting-document upload integrations.
- Do not migrate browser-side Fetch calls or unrelated HTTP clients as part of this work.
- Use the shared `HttpClient` as the application transport. Consolidate the existing mixed GAR API implementations on the injected `GarApi` class and migrate remaining consumers to the configured instance.
- Preserve existing service method names and signatures and caller-visible success and failure shapes. Adapt individual service boundaries where needed rather than redesigning their public contracts as part of this work.
- Require fully qualified HTTP(S) request URLs. Configure each `HttpClient` for a trusted service origin and reject requests to other origins; use separate configured clients for separate integrations. Do not derive request destinations from user-controlled input.
- Keep HTTP method support, query construction, request headers, JSON body handling, and correlation-ID propagation in the shared client. Preserve service-specific headers and authentication behavior.
- Decode response bodies as JSON, text, or empty according to the response representation. Do not turn valid text responses or empty responses into misleading JSON success values.
- Represent transport failures with an `Error` instance carrying consistent metadata. HTTP error metadata uses the Fetch `status` property (not `statusCode`) and includes status text, URL, method, and the available response body. HTTP non-success responses reject at the client layer; service adapters preserve their existing caller-facing behavior.
- Distinguish network failures from explicitly configured timeout aborts. Do not impose a default timeout: existing application `request` calls and other native Fetch calls specify none. Keep per-client or per-request timeout overrides available; no longer explicit timeout overrides were found in the current application calls.
- Use Node.js native `FormData` for multipart upload and scan requests, preserving file bytes and filenames. Do not set the multipart `Content-Type` manually; Fetch must provide the boundary.
- Do not add automatic retries. Retain native Fetch's default redirect behavior.
- Migrate incrementally by service, with temporary coexistence permitted during transition. The completed migration must remove the legacy correlation-ID request wrapper and the direct `request` dependency from the manifest and lockfile.
- Replace test-only uses of `request.cookie` so test code does not prevent removal of the direct dependency.
- The project runtime is Node.js 24, which provides the native Fetch and FormData APIs required by this solution.

## Testing Decisions

- Good tests verify observable request/response behavior and service contracts, rather than private implementation details. Use deterministic stubs and local mocks; do not contact live APIs, One Login, ClamAV, or other external services.
- Test `HttpClient` at its Fetch boundary using a stubbed global `fetch`. Cover absolute URL and origin enforcement; methods and query parameters; header and correlation-ID propagation; JSON, text, and empty response handling; HTTP, network, and explicitly configured timeout errors; multipart bodies and filenames; and the absence of automatic retries.
- Test migrated services through their injected `HttpClient` seam. Verify their established method signatures, request arguments, successful return shapes, and caller-visible error behavior.
- Include focused coverage for the consolidated GAR API and for multipart upload and ClamAV services, where Fetch body and response handling differ from JSON APIs.
- Confirm no application service retains direct use of the legacy request wrapper and that the direct dependency can be removed.
- Prior art includes the existing `HttpClient` correlation-ID test, GAR service tests with an injected client, and service tests using local stubs/mocks.
- Run the repository's required `just check` and `just verify` gates, along with the documented unused-code and dependency checks applicable to removed modules and dependencies.

## Out of Scope

- Migrating browser-side Fetch calls.
- Replacing unrelated third-party HTTP clients or changing their behavior.
- Redesigning service APIs, controller interfaces, user journeys, or external service contracts.
- Adding automatic retries, a default request timeout, or custom redirect behavior.
- Changing authentication policy, integration destinations, or external service configuration.
- Publishing or changing Jira issues as part of this specification.

## Further Notes

- The current implementation is part-way through the migration: a subset of GAR reads uses `HttpClient`, while the other GAR operations and service integrations remain on `request`.
- The current Fetch wrapper has a 10-second default timeout; the agreed target is to remove that implicit timeout to match the existing no-timeout defaults.
- The shared client currently uses `response.statusCode`, which is not a Fetch response property. The migration must use `response.status` and expose it consistently in HTTP error metadata.
- The repository's issue-tracker guidance identifies Jira as authoritative and prohibits agents from accessing or modifying Jira. This specification is therefore prepared locally for review and Business Analyst refinement; it has not been published as a Jira issue.
