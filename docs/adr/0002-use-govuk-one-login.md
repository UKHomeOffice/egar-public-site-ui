# Use GOV.UK One Login for sGAR authentication

sGAR replaced its application-managed email OTP authentication with GOV.UK One Login through OIDC. Authentication is delegated to One Login, while sGAR retains PostgreSQL-backed application sessions and user/organisation access checks against `data-access-api`; a successful One Login authentication does not replace those application responsibilities.

The migration was staged in 2025, with One Login account-creation work recorded in `8129d9be` on 19 May 2025 and post-migration UI changes in `20c992de` on 27 October 2025. These are repository milestones, not confirmed production cutover dates. The project maintainer recalls that the move addressed advice to adopt multi-factor authentication and that both authentication paths remained available temporarily to let users transition.
