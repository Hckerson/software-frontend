# Design OS — Meter

Subscription billing & usage metering. Generated from
[MASTER_PROMPT_COMPLETE.md](../MASTER_PROMPT_COMPLETE.md), 2026-08-27.

**Read in phase order, which is not filename order.** The numeric prefix is a stable id
recording when a document was added — `06` and `07` were split out of `02` once page, section
and component blueprints each outgrew a shared file. The table below is in reading order.

| Phase | Document                                                      | Read it when                                                     |
| ----- | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1     | [Product Definition](00-product-definition.md)                | You need the personas, rules, or the resolved constants          |
| 2–3   | [Experience Maps & IA](01-information-architecture.md)        | You are adding a route, a nav item, or a permission              |
| 4     | [Page Blueprints](02-page-blueprints.md)                      | You are building or changing a route                             |
| 5     | [Section Blueprints](06-section-blueprints.md)                | You are building a section, or deciding whether to split one     |
| 6     | [Component Library](07-component-library.md)                  | You are building a component or need its props, states and a11y  |
| 7–8   | [Tokens & Frontend Architecture](03-frontend-architecture.md) | You need the layering rules or where a file goes                 |
| 9–10  | [Roadmap & QA](04-roadmap-and-qa.md)                          | You want the known gaps or the pre-merge checklist               |
| next  | [Billing Cycle Plan](05-billing-cycle-plan.md)                | You are implementing invoicing, the scheduler, payments or reset |

## In one paragraph

**Meter** is a B2B subscription-billing console. Customers pick a plan, watch quota consumed
against their limits across three metered dimensions, retrieve invoices, and change or cancel
their plan. Admins own the plan catalogue and watch platform health. The core entity is the
**Subscription**; the hero interaction is the **usage meter**.

## The system, in numbers

**16 routes** (plus `not-found` and `error`) · **36 sections** · **33 components** ·
**3 metered dimensions** · **3 plan tiers** · **7 custom lint rules**.

## Where the rules live

Architecture is enforced, not documented: seven custom ESLint rules in
[`tools/eslint/rules/`](../../tools/eslint/rules/) hold the layering, styling, and density
boundaries. Read [Phases 7–8](03-frontend-architecture.md#the-layering-rule) for the map from
rule to boundary. If a rule fires, the design is wrong — not the rule.

The three standing agreements — token-first styling, the
`route → section → component → hook → transport` layering, and the application register — are
stated in [the master prompt](../MASTER_PROMPT_COMPLETE.md#the-three-agreements).
