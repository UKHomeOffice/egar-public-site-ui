---
name: prefer-govuk-macros
description: Check GOV.UK component macros when creating, modifying, reviewing, or auditing Nunjucks templates.
---

# Prefer GOV.UK macros

Use GOV.UK Frontend component macros instead of hand-written component HTML wherever a suitable macro is available. Macros are easier to read, follow the framework's expected markup, and pick up upstream markup changes when the dependency is upgraded. They do not by themselves guarantee accessibility or compliance.

1. Inspect every added or changed Nunjucks component, including markup inside shared macros and partials. For a retrospective audit, inspect all templates in the requested scope, including unchanged files; for a repository-wide audit, inspect all repository Nunjucks templates. Check the installed `govuk-frontend` version and its component macros for a suitable match; do not assume legacy markup is the preferred pattern.
2. For an audit or review, report each replaceable component's file and location, suitable macro, and any behavioural or accessibility risks; identify justified exceptions and any uninspected scope. An audit is read-only unless migration is requested.

## Replacing markup

1. Before replacing existing markup, render the original with synthetic data derived from the controller, template and existing tests.
2. Use the upstream macro or an existing shared application layout or partial that delegates to it. Follow the repository's import conventions, and preserve content, translations, form names and values, IDs, error and accessibility associations, classes, attributes, and JavaScript hooks. Use macro `text` for plain content and only use `html` with appropriately escaped or trusted content.
3. Keep ordinary HTML for page structure, content, and functionality without a suitable macro. If a suitable macro cannot preserve required behaviour, retain the necessary HTML and explain the exception in the handoff or review. Do not expand the change into an unrelated legacy-template migration.
4. Verify equivalence: render the replacement with the same data and app Nunjucks configuration, covering relevant empty, populated and error states. Compare content, form submission, accessibility relationships and JavaScript hooks, not exact HTML. Add focused regression tests where practical and run the repository's Nunjucks validation commands. If rendering or browser checks are infeasible, report what was not verified and why.

See `docs/adr/0003-gds-v5-template-modernisation.md` for the project's design decision and CSP requirements.

If a macro conversion changes page layout, follow the [Nunjucks layout skill](../nunjucks-layout/SKILL.md).
