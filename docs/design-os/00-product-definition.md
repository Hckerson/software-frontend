# Phase 1 — Product Definition

> Status: settled 2026-08-27. This document fills the placeholder glossary in
> [MASTER_PROMPT_COMPLETE.md](../MASTER_PROMPT_COMPLETE.md). Every downstream phase
> references it. Nothing in this repo may re-derive these values.

## Placeholder glossary (resolved)

| Placeholder                                  | Value                                                                                              |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `{{PRODUCT_NAME}}`                           | Meter                                                                                              |
| `{{DOMAIN}}`                                 | Subscription billing & usage metering (B2B SaaS)                                                   |
| `{{REFERENCE_PRODUCTS}}`                     | Stripe Billing, Chargebee, Paddle, Orb                                                             |
| `{{PERSONAS}}`                               | Customer, Billing Admin, Internal Ops                                                              |
| `{{CORE_ENTITY}}` / `{{CORE_ENTITY_PLURAL}}` | Subscription / Subscriptions                                                                       |
| `{{PRIMARY_FLOWS}}`                          | Select a plan · Monitor usage against limits · Pay and retrieve invoices · Change or cancel a plan |
| `{{SUPPORTING_FLOWS}}`                       | Authentication, onboarding, profile, plan catalog administration, ops oversight                    |
| `{{ROLE_DASHBOARDS}}`                        | Customer dashboard, Admin console                                                                  |
| `{{DOMAIN_TRANSACTION}}`                     | Plan selection / plan change (the billing-state mutation)                                          |
| `{{DOMAIN_TOOL}}`                            | Usage meter — quota consumed vs. plan limit                                                        |
| `{{DOMAIN_SPECIFIC_LIBS}}`                   | None. No maps, no geo, no editor. Charts deferred until a real series exists.                      |
| `{{THEME_VARIANT}}`                          | Dark theme, already derived from the same tokens (`.dark` in `styles/tokens.css`)                  |
| `{{OUTPUT_DIR}}`                             | `docs/design-os/`                                                                                  |

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
read surface that hands off to support tooling.

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

- A user has **at most one non-canceled subscription** — enforced by
  `@@unique([userId, status])` on `Subscription`.
- An invoice is unique per `(subscriptionId, billingPeriodStart)` — one invoice per period.
- A usage log is unique per `(subscriptionId, metricType, period)` — usage accumulates into
  a single row per metric per period, never appends.
- Metered dimensions are exactly `API_CALLS`, `STORAGE_GB`, `SEATS`.
- Plan tiers are exactly `FREE`, `PRO`, `ENTERPRISE`.
- Deactivating a plan must not cascade to subscriptions; `Subscription.plan` has no
  `onDelete: Cascade` and that is deliberate.

## Success metrics

North Star: **active subscriptions**. Supporting: self-serve plan-change rate, invoices paid
without intervention, share of customers who upgrade _before_ hitting a limit rather than
after, time-to-first-plan on signup.

## Non-goals

Not building: a payment processor (Stripe tokens are stored, not charged here), dunning
automation, tax/VAT handling, multi-currency, seat provisioning, or an in-app support inbox.
`Invoice.stripeInvoiceId` and `PaymentMethod.stripeToken` are integration seams, not
features to build now.

## Design principles

1. **The meter is the hero.** Every customer screen answers "am I within my limits" before
   it answers anything else.
2. **Money is never ambiguous.** Amounts carry currency, periods carry both endpoints, and
   status is a word, never a colour alone.
3. **Destructive actions confirm.** Cancel, deactivate, delete — all require a second step.
4. **Application register, not editorial.** This is a console. Dense spacing, `text-h4` page
   titles, no hero type. Enforced by `starter/application-register-density`.
5. **Empty, loading, and error are designed states**, not afterthoughts.
