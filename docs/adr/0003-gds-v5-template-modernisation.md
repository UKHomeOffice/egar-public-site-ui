# GDS v5 upgrade and template modernisation

Use the GOV.UK Frontend Nunjucks component macros and shared application layout macros rather than duplicating component HTML across sGAR templates. The project maintainer recalls that the GOV.UK Frontend v5 upgrade was deliberately used to remove accumulated template technical debt, not just update the dependency: upstream component macros are more likely to produce standards-compliant HTML, accommodate future GDS markup changes, and incorporate upstream HTML improvements when the dependency is upgraded.

Prefer upstream macros where a suitable component exists, keeping application-specific composition in shared layouts and partials. This reduces the markup maintained locally, but does not guarantee compliance or remove the need to review and test version upgrades.

The maintainer also identifies reducing custom CSS in favour of unmodified GOV.UK components, and moving all inline JavaScript and event handlers into external `.js` files, as goals of the refactor. Removing inline scripts and styles made a restrictive Content Security Policy (CSP) easier to introduce. The current CSP disallows inline scripts, event handlers and styles, enforcing that separation and helping prevent those patterns from returning; future UI changes should preserve it rather than relax the policy.

The dependency moved from v4 to v5 in `5f7d5ca5` on 30 September 2025, followed by extensive template refactoring during October and November. The accumulated migration was merged into `dev` through PR #818 (`9e3770ab`) on 29 April 2026; these are repository milestones, not confirmed production-release dates.
