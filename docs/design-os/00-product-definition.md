# Phase 1 — Product Definition

> Status: settled 2026-08-27 · regenerated 2026-09-28 under the standing brief's
> [No visual prescription](../MASTER_PROMPT_COMPLETE.md#no-visual-prescription) rule.
> Governed by [MASTER_PROMPT_COMPLETE.md](../MASTER_PROMPT_COMPLETE.md#phase-1--product-vision).
> This document resolves the template's placeholder glossary; every downstream phase references
> it, and nothing in this repo may re-derive these values. Next in phase order:
> [Phases 2–3](01-information-architecture.md).

## Placeholder glossary (resolved)

| Placeholder                                  | Value                                                                                              |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `{{PRODUCT_NAME}}`                           | Meter                                                                                              |
| `{{DOMAIN}}`                                 | Subscription billing & usage metering (B2B SaaS)                                                   |
| `{{REFERENCE_PRODUCTS}}`                     | Stripe Billing, Chargebee, Paddle, Orb — benchmarks for features and flows only, never look or feel |
| `{{PERSONAS}}`                               | Customer, Billing Admin, Internal Ops                                                              |
| `{{CORE_ENTITY}}` / `{{CORE_ENTITY_PLURAL}}` | Subscription / Subscriptions                                                                       |
| `{{PRIMARY_FLOWS}}`                          | Select a plan · Monitor usage against limits · Pay and retrieve invoices · Change or cancel a plan |
| `{{SUPPORTING_FLOWS}}`                       | Authentication, onboarding, profile, plan catalog administration, ops oversight                    |
| `{{ROLE_DASHBOARDS}}`                        | Customer dashboard, Admin console                                                                  |
| `{{DOMAIN_TRANSACTION}}`                     | Plan selection / plan change (the billing-state mutation)                                          |
| `{{DOMAIN_TOOL}}`                            | Usage meter — quota consumed vs. plan limit                                                        |
| `{{DOMAIN_SPECIFIC_LIBS}}`                   | None. No maps, no geo, no editor, no charting library.                                             |
| `{{OUTPUT_DIR}}`                             | `docs/design-os/`                                                                                  |

The full resolved-constant table, including the counts measured against the working tree, is in
[the brief](../MASTER_PROMPT_COMPLETE.md#resolved-constants).

## Why this and not the alternative

The Prisma schema models `SubscriptionPlan`, `Subscription`, `Invoice`, `UsageLog`,
`PaymentMethod`, `BillingAudit` — a billing system, end to end. The `UserRole` enum
additionally carried `MENTOR`, `STUDENT`, `GUARDIAN`, `SCHOOL_ADMIN`, a vocabulary from a
different product with no model, service, or endpoint behind it anywhere in the codebase.

Those roles were vestigial and have been removed from the schema. `UserRole` is now
`ADMIN | USER`. This is the traceable root decision; every persona below descends from it.

## Personas

**Customer** (`USER`) — signs up, picks a plan, consumes quota, wants to know before they
hit a limit and what next month costs. Reads far more than they write. Their entire
relationship with the product is: _am I covered, and what do I owe?_

**Billing Admin** (`ADMIN`) — owns the plan catalog. Creates and prices plans, activates and
deactivates them. Destructive actions live here and need confirmation.

**Internal Ops** (`ADMIN`) — watches aggregate health: active vs. past-due subscriptions,
overdue invoices, churn. Never edits a single customer's data from these screens; this is a
read surface that hands off to support tooling. The two exceptions — running the billing cycle
and suspending or restoring an account — are write actions behind a confirm step
([E6, E7](01-information-architecture.md#e6--watch-platform-health-internal-ops)).

Admin and Ops share the `ADMIN` role today. They are separated as personas because their
screens answer different questions, and because a future `OPS` role would split cleanly
along this seam.

## Jobs to be done

1. _When I sign up, I want to understand what each plan costs and limits, so I pick without
   having to talk to sales._
2. _When I am mid-cycle, I want to see quota consumed against my limit, so I can upgrade
   before I am cut off rather than after._
3. _When an invoice arrives, I want its line items and period, so I can reconcile it._
4. _When my needs change, I want to switch plans without losing history or re-entering
   payment details._
5. _(Admin) When pricing changes, I want to deactivate a plan without deleting the
   subscriptions that reference it._
6. _(Ops) When revenue is at risk, I want past-due and overdue counts on one screen._

## Business rules

- A user has **at most one active subscription** — enforced by a partial unique index on
  `Subscription(userId) WHERE status = 'ACTIVE'`. The composite `@@unique([userId, status])`
  it replaced allowed only one row per status ever, which made billing history impossible;
  see [F2](05-billing-cycle-plan.md#f2--uniqueuserid-status-makes-billing-history-impossible).
- An invoice is unique per `(subscriptionId, billingPeriodStart)` — one invoice per period.
- A usage log is unique per `(subscriptionId, metricType, period)` — usage accumulates into
  a single row per metric per period, never appends.
- Metered dimensions are exactly `API_CALLS`, `STORAGE_GB`, `SEATS`.
- A metric's limit is **billable or a hard cap, never both**: if the plan lists a per-unit
  price for it in `overageRates`, usage may exceed the limit and the excess is billed; if it
  does not, the request is refused at the limit. A metric absent from `limits` is unlimited
  and is never billed for overage.
- Plan tiers are exactly `FREE`, `PRO`, `ENTERPRISE`.
- A **suspended account cannot sign in, and a session it already holds stops working on its
  next request** — suspension is checked on every authenticated request, not only at sign-in,
  or a suspended customer would keep working for the rest of a seven-day token. Suspension
  never touches the subscription, invoices or history; reactivating restores access intact.
- **Nobody changes their own role or status**, administrators included. An administrator who
  suspends or demotes themselves locks themselves out; that change goes through another
  administrator.
- Deactivating a plan must not cascade to subscriptions; `Subscription.plan` has no
  `onDelete: Cascade` and that is deliberate.
- `Decimal` fields arrive over JSON as `string`. They are typed as `string` and parsed at the
  formatting boundary — never with a `Number()` scattered through a component.

## Success metrics

North Star: **active subscriptions**. Supporting: self-serve plan-change rate, invoices paid
without intervention, share of customers who upgrade _before_ hitting a limit rather than
after, time-to-first-plan on signup.

## Non-goals

Not building: a payment processor (Stripe tokens are stored, not charged here), dunning
automation, tax/VAT handling, multi-currency, seat provisioning, or an in-app support inbox.
`Invoice.stripeInvoiceId` and `PaymentMethod.stripeToken` are integration seams, not
features to build now.

## Product principles

How the product behaves and treats its users. None of them is a visual decision; how each is
expressed on screen is decided when the page is built, with the owner.

1. **The meter is the hero.** Every customer screen answers "am I within my limits" before
   it answers anything else.
2. **Money is never ambiguous.** Amounts carry currency, periods carry both endpoints, and
   status is a word, never a colour alone.
3. **Destructive actions confirm.** Cancel, deactivate, delete — all require a second step.
4. **Built for the repeat visit.** Meter is a console an operator returns to daily; it is
   optimised for finding and acting, not for a first impression. The public landing route `/`
   is the one surface whose job is the first impression.
5. **Empty, loading, and error are designed states**, not afterthoughts.

### Changed in the 2026-09-28 regeneration

- Principle 4 was _"Application register, not editorial — dense spacing, `text-h4` page titles,
  no hero type"_. That is a visual prescription; the product intent under it (a console built
  for the repeat visit, with `/` as the one first-impression surface) is kept, in the brief's
  wording. The lint rule that still enforces the old register in code is a code convention,
  not a requirement of this document — see
  [Frontend Architecture](03-frontend-architecture.md#rules-outside-this-design-os).
- The `{{THEME_VARIANT}}` glossary row (a dark theme derived from the token file) was dropped.
  The user-facing **theme preference** survives as a behaviour —
  [`ThemeToggle`](07-component-library.md#topbar--themetoggle--authcard); what each theme looks
  like is not specified here.
