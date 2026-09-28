# Design OS — Meter

Subscription billing & usage metering. Generated from, and governed by,
[MASTER_PROMPT_COMPLETE.md](../MASTER_PROMPT_COMPLETE.md) — Meter's standing brief — first on
2026-08-27, regenerated 2026-09-28 under its
[No visual prescription](../MASTER_PROMPT_COMPLETE.md#no-visual-prescription) rule. This is
[Phase 10](../MASTER_PROMPT_COMPLETE.md#phase-10--ancillary-documentation--navigation): the entry
point to the other eight documents.

**This design OS defines what Meter does, not how it looks.** It specifies users, flows,
information architecture, content, data, states, accessibility and code structure. Colour, type,
layout, placement, imagery and motion are decided when each page is built, with the owner — see
the [Visual Design Hand-off](../MASTER_PROMPT_COMPLETE.md#106--implementation_promptmd--superseded).
Meter's current look lives in the code ([`styles/`](../../styles/) and the components), not here.

**Read in phase order, which is not filename order.** The numeric prefix is a stable id
recording when a document was added — `06` and `07` were split out of `02` once page, section
and component blueprints each outgrew a shared file. The table below is in reading order.

| Phase | Document                                                   | Read it when                                                          |
| ----- | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| 1     | [Product Definition](00-product-definition.md)             | You need the personas, rules, principles or the resolved constants    |
| 2–3   | [Experience Maps & IA](01-information-architecture.md)     | You are adding a flow, a route, a nav item, or a permission           |
| 4     | [Page Blueprints](02-page-blueprints.md)                   | You are building or changing a route                                  |
| 5     | [Section Blueprints](06-section-blueprints.md)             | You are building a section, or deciding whether to split one          |
| 6     | [Interaction Contracts](07-component-library.md)           | You need a component's inputs, states, keyboard, ARIA or content rules |
| 7     | [Frontend Architecture](03-frontend-architecture.md)       | You need the layering rules, the data layer, auth, or where a file goes |
| 8–9   | [Roadmap & QA](04-roadmap-and-qa.md)                       | You want the delivered stages, known gaps, or the verification gates  |
| next  | [Billing Cycle Plan](05-billing-cycle-plan.md)             | You are implementing invoicing, the scheduler, payments or reset      |
| 10    | This README                                                | You are finding your way in                                           |

## In one paragraph

**Meter** is a B2B subscription-billing console. Customers pick a plan, watch quota consumed
against their limits across three metered dimensions, retrieve invoices, and change or cancel
their plan. Admins own the plan catalogue, run the billing cycle, manage customer access and
watch platform health. The core entity is the **Subscription**; the hero interaction is the
**usage meter**.

## The system, in numbers

**17 routes** (plus `not-found` and `error`) · **44 sections** · **33 components** ·
**7 experience maps** · **3 metered dimensions** · **3 plan tiers** · **2 roles** ·
**7 custom lint rules**, five of which hold the layering.

## Where the rules live

Architecture is enforced, not documented: custom ESLint rules in
[`tools/eslint/rules/`](../../tools/eslint/rules/) hold the
`route → section → component → hook → transport` layering. Read
[Phase 7](03-frontend-architecture.md#the-layering-rule) for the map from rule to boundary. If a
rule fires, the design is wrong — not the rule. The two rules that govern how styles are written
are code conventions, [outside this design OS](03-frontend-architecture.md#rules-outside-this-design-os).

The layering agreement itself is stated in
[the brief](../MASTER_PROMPT_COMPLETE.md#the-layering-agreement); the product principles every
screen answers to are in [Phase 1](00-product-definition.md#product-principles).

## Regenerating these documents

A run over `docs/design-os/` is a **merge, not an overwrite**: every page, section, interaction
contract, flow, persona, role and state already defined survives. Visual prescriptions are not
features — they are dropped and listed as changed. Each document records what the 2026-09-28
regeneration changed in a closing section; [Frontend Architecture](03-frontend-architecture.md#delivered-history--not-a-requirement)
keeps the styling work it once specified as delivered history. See the brief's
[Output contract](../MASTER_PROMPT_COMPLETE.md#output-contract).
