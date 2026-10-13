# Integrate AMG passenger checks into the sGAR submission journey

Introduce passenger-level AMG checks alongside the existing GAR submission flow, using `data-access-api` rather than calling AMG directly from the UI. The UI reads asynchronous check progress and passenger outcomes from the API, presenting permission-to-travel guidance separately from the GAR's submission status.

For UK-inbound journeys requiring passenger checks, the review flow takes the user to the AMG check-in screen before the declaration and GAR submission step; other journeys can proceed without that screen, including military flights with no people on the manifest. The UI supports polling and user-driven resubmission of timeout (`0T`) checks. Completion of processing is distinct from a passenger's permission-to-travel outcome, and repeating passenger checks is distinct from amending or resubmitting the GAR to CBP.

The UI integration was introduced in 2023 (`61526f00`, 18 August). Early departure-confirmation screens were removed in `9959f26a` on 12 October, followed by submission-routing changes in `0419b96d` on 13 October; those early screens are not part of the retained user journey. These are repository milestones, not confirmed production launch dates.
