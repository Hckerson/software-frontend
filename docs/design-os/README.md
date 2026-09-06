# Design OS — Meter

Subscription billing & usage metering. Generated from
[MASTER_PROMPT_COMPLETE.md](../MASTER_PROMPT_COMPLETE.md), 2026-08-27.

| #   | Document                                                           | Phases | Read it when                                                       |
| --- | ------------------------------------------------------------------ | ------ | ------------------------------------------------------------------ |
| 00  | [Product Definition](00-product-definition.md)                     | 1      | You need the personas, rules, or the resolved placeholder glossary |
| 01  | [Experience Maps & IA](01-information-architecture.md)             | 2–3    | You are adding a route, a nav item, or a permission                |
| 02  | [Page & Component Blueprints](02-page-and-component-blueprints.md) | 4–6    | You are building a screen or a component                           |
| 03  | [Tokens & Frontend Architecture](03-frontend-architecture.md)      | 7–8    | You need the layering rules or where a file goes                   |
| 04  | [Roadmap & QA](04-roadmap-and-qa.md)                               | 9–10   | You want the known gaps or the pre-merge checklist                 |
| 05  | [Billing Cycle Plan](05-billing-cycle-plan.md)                     | next   | You are implementing invoicing, the scheduler, payments or reset   |

## In one paragraph

**Meter** is a B2B subscription-billing console. Customers pick a plan, watch quota consumed
against their limits across three metered dimensions, retrieve invoices, and change or cancel
their plan. Admins own the plan catalogue and watch platform health. The core entity is the
**Subscription**; the hero interaction is the **usage meter**.

## Where the rules live

Architecture is enforced, not documented: seven custom ESLint rules in
[`tools/eslint/rules/`](../../tools/eslint/rules/) hold the layering, styling, and density
boundaries. Read [03](03-frontend-architecture.md#the-layering-rule) for the map from rule to
boundary. If a rule fires, the design is wrong — not the rule.
