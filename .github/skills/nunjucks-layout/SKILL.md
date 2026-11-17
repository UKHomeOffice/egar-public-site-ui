---
name: nunjucks-layout
description: Check Nunjucks layout changes or audit redundant width containers and grid wrappers.
---

# Nunjucks layout

Look for unnecessary nested width containers and grid wrappers while preserving the page's responsive layout and behaviour. Repeated width classes alone do not establish that a wrapper is redundant.

1. Inspect the requested layout or audit scope, including relevant inherited templates, blocks and partials. For a repository-wide audit, inspect all repository Nunjucks templates. Trace candidate wrappers through the rendered hierarchy and check their CSS, responsive grid behaviour, selectors, attributes, JavaScript hooks and conditional content.
2. For an audit or review, report candidates with file and location, why each may be redundant, and dependencies or risks that need checking. Report uninspected scope. An audit is read-only unless simplification is requested.
3. Before changing layout, capture the original rendered page using representative synthetic data and relevant content states. Compare the changed page using the same data at mobile and desktop widths, including intermediate breakpoints where relevant. Check width, alignment, spacing, overflow, reading order, keyboard interaction and affected JavaScript behaviour.
4. Remove a wrapper only when its removal preserves the intended layout and behaviour; retain necessary grid and semantic structure. Add focused regression tests where practical and run the repository's Nunjucks validation commands. If browser or other verification is unavailable, report the limitation and do not claim equivalence.

Follow `docs/setup.md#optional-browser-debugging` for local browser checks.
