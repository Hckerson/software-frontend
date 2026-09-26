# Design OS — Build Status

**Everything design-os specifies is built.** Confirmed 2026-09-22 against `development` @
`b2b4514`, frontend and backend both pushed.

The one capability the documents describe but the code does not deliver — Stripe card capture —
is recorded _in the documents themselves_ as out of scope, not as a promise. See
[Deliberately not built](#deliberately-not-built).

---

## By document

| #   | Document                                                             | Specifies                                                               | Status   | Evidence                                                                                              |
| --- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| 00  | [Product Definition](design-os/00-product-definition.md)             | Personas, business rules, overage model, design principles              | ✅ Built | Rules enforced in the backend schema and services; overage billed per metric, hard cap without a rate |
| 01  | [Information Architecture](design-os/01-information-architecture.md) | Experience maps E1–E7, sitemap, navigation, permissions                 | ✅ Built | Every sitemap route has a page; `proxy.ts` enforces the permission model                              |
| 02  | [Page Blueprints](design-os/02-page-blueprints.md)                   | 17 routes plus `not-found` and `error`                                  | ✅ Built | 17 of 17 routes, both fallbacks                                                                       |
| 03  | [Frontend Architecture](design-os/03-frontend-architecture.md)       | Token layers, layering rule, auth boundary, RS256 verification          | ✅ Built | 7 of 7 custom lint rules; `verify-token` tested against a real keypair                                |
| 04  | [Roadmap & QA](design-os/04-roadmap-and-qa.md)                       | Delivered stages, known gaps, QA gates                                  | ✅ Built | Every gate green (below); the three known gaps are decisions, not missing work                        |
| 05  | [Billing Cycle Plan](design-os/05-billing-cycle-plan.md)             | Phases A–F: limits, invoicing, scheduler, payment methods, reset, tests | ✅ Built | A, B, C, E, F delivered; D delivered except the Stripe-gated add-card form                            |
| 06  | [Section Blueprints](design-os/06-section-blueprints.md)             | 44 sections, their state ladder and reuse graph                         | ✅ Built | 44 of 44 sections; all 37 named hooks exported; every data section renders its error state            |
| 07  | [Component Library](design-os/07-component-library.md)               | 33 components, props, accessibility contracts                           | ✅ Built | 33 of 33; the four principle-carrying components asserted by tests                                    |
| —   | [README](design-os/README.md)                                        | The counts: 17 routes, 44 sections, 33 components                       | ✅ Exact | Counts match the filesystem                                                                           |

---

## By inventory

Checked mechanically by `pnpm design:audit`, which reads its expectations from the documents
and diffs them both ways against the code. Current result:

```
design-os matches the code: 17 routes, 44 sections, 33 components
```

| Asserted          | Documented | Built  | Breakdown                                                                                                  |
| ----------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| Routes            | 17 + 2     | 17 + 2 | public 1 · auth 4 · customer 7 · admin 5 · `not-found` · `error`                                           |
| Sections          | 44         | 44     | admin 13 · usage 7 · settings 5 · auth 4 · subscription 4 · dashboard 3 · invoices 3 · plans 3 · landing 2 |
| Components        | 33         | 33     | common 16 · layout 6 · ui/forms 9 · providers & wrappers 2                                                 |
| Hooks named in 06 | 37         | 37     | every one exported from `lib/hooks`                                                                        |
| Custom lint rules | 7          | 7      | the layering, styling and density boundaries                                                               |
| Links and anchors | all        | all    | every relative link and `#anchor` in design-os resolves                                                    |

---

## Verification

| Gate                  | Result                    | When                                      |
| --------------------- | ------------------------- | ----------------------------------------- |
| `pnpm design:audit`   | 0 findings                | against `b2b4514`                         |
| Frontend `lint`       | 0 errors, incl. 7 custom  | pre-push hook on the final push           |
| Frontend `type-check` | 0 errors                  | pre-push hook on the final push           |
| Frontend unit         | 253 of 253, 31 files      | full tree before the final commits        |
| Frontend `build`      | clean, 18 pages generated | full tree before the final commits        |
| Frontend e2e          | 23 of 23, Chromium        | earlier the same day — see caveat         |
| Backend unit          | 65 of 65                  | this pass                                 |
| Backend e2e           | 19 of 19, real Postgres   | this pass, isolated `meter_test` database |
| Backend `lint`, types | 0 errors                  | pre-push hook on the final push           |

**Caveat — frontend e2e.** The 23 tests last ran in full earlier the same day. They were not
re-run on the final commits, because a development server was running from the same checkout
and Next will not start a second one there. What changed since that run: the landing error
state (covered by its own unit tests, including one that fails without the fix), documentation,
and a one-line button tone. Run `pnpm test:e2e` with the dev server stopped to close this.

---

## Deliberately not built

Recorded as decisions in the documents, not as gaps in the build:

| Item                                                                            | Where recorded                                                                                                                             | Why                                                                                                                                                      |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stripe integration and the add-card form                                        | [04, gap 1](design-os/04-roadmap-and-qa.md#known-gaps-ranked) · [05, Phase D](design-os/05-billing-cycle-plan.md#phase-d--payment-methods) | Out of scope; a form without a processor would claim a card is on file when nothing was tokenised. The hook and endpoint are ready. **In progress now.** |
| Search, compare, favourites, messages, help centre and the other template pages | [02](design-os/02-page-blueprints.md#routes-deliberately-not-built)                                                                        | No persona, flow or endpoint in Meter; a new flow needs an experience map before it gets a route                                                         |
| A standalone `/500` route                                                       | [02, Fallbacks](design-os/02-page-blueprints.md#fallbacks)                                                                                 | Next.js handles server faults through `error.tsx`; a hand-written `/500` would be unreachable                                                            |

Two further items in [04's known gaps](design-os/04-roadmap-and-qa.md#known-gaps-ranked) are
operational limits of what _is_ built rather than missing features: the in-process scheduler
has no cross-instance lock (run `BILLING_CYCLE_CRON=off` on all but one instance), and the
admin customer list is unpaginated.

---

## What changed to reach this state

The documents and the code had drifted in both directions. Reconciling them took three passes,
recorded in full in the [conformance audit](design-os-audit.md):

- **Built what was promised but missing:** plan editing (E5), error states on four sections
  that rendered a failed request as a false fact about billing, and focus restore in the
  dialogs.
- **Documented what was built but undescribed:** eight sections, `/admin/users`, the usage
  trend chart, and the permission model, which 01 had described as the opposite of the code.
- **Corrected what was stated wrongly:** dead links and anchors, stale counts, a component
  name that existed nowhere, and — found while preparing this report — a line in 02 still
  calling password reset undelivered.
