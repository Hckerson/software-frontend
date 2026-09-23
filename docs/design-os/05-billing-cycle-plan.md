# Billing Cycle — Implementation Plan

Turns the console from one that _displays_ billing into one that _does_ billing.
References [Roadmap & QA](04-roadmap-and-qa.md) and [Product Definition](00-product-definition.md).

Status: **implemented 2026-09-03**. The three dependency-gated items are approved and built —
see [Previously gated, now approved and built](#previously-gated-now-approved-and-built).
Verified against a live Postgres, API and web server.

Two blocking decisions were taken as **stated assumptions** rather than stalling the work:

- **Overage pricing → option 2 (bill for overage).** ~~Option 1~~ was the stated assumption
  until the decision was taken; `SubscriptionPlan.overageRates` now carries a price per unit
  per metric. **A metric with a rate may exceed its limit and is billed for the excess; a
  metric with no rate stays a hard cap.** That makes option 2 a superset of option 1 rather
  than a replacement — a plan can price API calls and still cap seats, and every plan carrying
  `overageRates: {}` behaves exactly as it did before.
- **Scheduler shape → idempotent service methods behind admin triggers.** No cron dependency
  was added. `CycleService` exposes `renewDueSubscriptions`, `markOverdueInvoices` and
  `issueInvoiceForPeriod`; `POST /admin/billing/cycle/*` calls them. Adding `@nestjs/schedule`
  later is a thin caller over the same methods.

Reverse either by saying so; neither is baked into a schema.

---

## What the investigation found

Three defects sit _underneath_ the missing features. Building invoice generation on top of
them would bake them in, so they come first.

### F1 — Usage limits are read from the wrong field (UI and enforcement disagree)

`UsageService` resolves a plan's limits with
`usageValidator.extractLimitsFromPlanFeatures(sub.plan.features)`. That reads
**`plan.features`**, using camelCase keys via `getLimitKeyForMetric`:

| Metric enum  | Key the code looks up | Where the real value lives |
| ------------ | --------------------- | -------------------------- |
| `API_CALLS`  | `features.apiCalls`   | `limits.API_CALLS`         |
| `STORAGE_GB` | `features.storage`    | `limits.STORAGE_GB`        |
| `SEATS`      | `features.seats`      | `limits.SEATS`             |

`plan.features` never holds those keys, so every lookup falls through to the validator's
hardcoded defaults — `apiCalls: 10000`, `storage: 5`, `seats: 1`.

The consequence is not cosmetic. The frontend meter reads `plan.limits` correctly and shows a
Pro customer 500,000 API calls; `POST /usage/track` enforces 10,000 and rejects at 2 % of the
displayed allowance. **The number the customer sees and the number the system enforces are
different numbers.** Any invoice built on overage would inherit the wrong basis.

Fix: delete `extractLimitsFromPlanFeatures` and `getLimitKeyForMetric`, read
`plan.limits[metricType]` directly, and treat a missing key as _unlimited_ rather than as a
default — matching how [`PlanFeatureList`](../../components/sections/plans/plan-feature-list.tsx)
already renders it, and how the Enterprise plan (`limits: {}`) is meant to behave.

### F2 — `@@unique([userId, status])` makes billing history impossible

`Subscription` carries `@@unique([userId, status])`. A user may therefore hold at most **one
subscription per status, ever**. That is fine for `ACTIVE` — it is the invariant the product
wants — but it also means:

- a second cancellation violates the constraint, because a `CANCELED` row already exists;
- `getSubscriptionHistory` can return at most four rows, one per status;
- a renewal that supersedes a subscription has nowhere to put the old one.

The intent — _one active subscription per user_ — should be a partial unique index on
`userId` where `status = 'ACTIVE'`, not a composite across all statuses. Prisma cannot express
a partial index, so this needs a raw migration:

```sql
DROP INDEX "Subscription_userId_status_key";
CREATE UNIQUE INDEX "Subscription_one_active_per_user"
  ON "Subscription" ("userId") WHERE status = 'ACTIVE';
```

This is a **breaking schema change** and the reason it leads the plan: invoice generation and
renewal both write subscription rows, and both are blocked by it.

### F3 — `BillingAudit` coverage is partial (corrected)

**An earlier draft of this plan claimed `BillingAudit` was never written. That was wrong.**
`SubscriptionsService` writes an audit row on all four billing-state changes —
`subscription_created`, `plan_changed`, `subscription_canceled`, `subscription_reactivated`.
The mistaken finding came from grepping the Prisma accessor (`billingAudit`) while the code
calls the injected `auditRepo`.

What remains is coverage, not absence: the new cycle jobs (renewal, invoice issue, overdue
sweep) must write audit rows too, and `oldValue` on `plan_changed` records only the plan id
rather than the prior period, which makes a renewal-vs-change hard to tell apart after the fact.

---

## Phase A — Foundations (no new dependencies)

| #   | Work                                                        | Notes                                                                                                             |
| --- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| A1  | Read limits from `plan.limits`; missing key means unlimited | Fixes F1. Delete the two dead helpers.                                                                            |
| A2  | Partial unique index migration                              | Fixes F2. Raw SQL migration; back up first.                                                                       |
| A3  | Extend `BillingAudit` coverage to the cycle jobs            | F3 revised: the four subscription mutations already audit. Renewal, invoice issue and the overdue sweep must too. |
| A4  | Unit tests for limit resolution and audit writes            | Backend has a working Jest harness now.                                                                           |

**Exit:** enforcement matches the displayed allowance; a user can cancel twice; every billing
mutation leaves a row.

---

## Phase B — Invoice generation

`InvoiceGeneratorService` already computes amount, due date (period end + 14 days), overage and
an invoice number. It is injected nowhere. The work is wiring and policy, not algorithms.

| #   | Work                                                                                      | Notes                                                                                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Provide `InvoiceGeneratorService` and add `issueInvoiceForPeriod(subscriptionId, period)` | Idempotent by construction — `@@unique([subscriptionId, billingPeriodStart])` already exists; catch the unique violation and treat it as "already issued".                                           |
| B2  | Compute overage from `UsageLog` vs `plan.limits`                                          | **Done.** `OverageCalculatorService` is the single place overage becomes money, shared by the cycle and the upcoming-invoice estimate so the two cannot disagree. Unlimited metric contributes zero. |
| B3  | Persist `DRAFT` → transition to `SENT` when issued                                        | The `stripeInvoiceId` column stays null; no processor in scope.                                                                                                                                      |
| B4  | Admin endpoint to issue manually                                                          | `POST /admin/billing/subscriptions/:id/issue-invoice`, `ADMIN` + `RolesGuard`. **Now also has a UI**: an Issue invoice action per row on `/admin/subscriptions`.                                     |

### Decision taken — overage pricing (option 2)

**Nothing in the schema models an overage rate.** `calculateOverageCharge(usage, limit, ratePerUnit)`
takes a rate the system cannot supply. Options:

1. **No overage** — exceeding a limit blocks the request (today's behaviour). Simplest, and
   consistent with the current `BadRequestException`. Invoices are then always the flat plan price.
2. **Overage rates per metric on the plan** — add `overageRates Json` to `SubscriptionPlan`
   (e.g. `{ "API_CALLS": 0.0001 }`). Requires a migration and admin-form fields.
3. **Hard cap with upgrade prompt** — block, but surface the upgrade path in the UI.

**Resolved: option 2.** Option 1 was the smaller step, but the product is called Meter and the
README promises usage metering — a console that blocks at the limit is a quota system, not a
metered-billing one. Closing that gap between the name and the behaviour was worth a migration.

Implemented per metric rather than per plan, so option 1 survives wherever it is the right
answer: `overageRates: {}` is still a hard cap everywhere, and the seeded Free plan keeps it.
Sequenced deliberately **after** F5, because billing for overage means being right about usage
accounting, and that is not a step to take on an untested cycle.

---

## Phase C — The scheduler

| #   | Work                            | Notes                                                                                                                                                                  |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Add `@nestjs/schedule`          | **New dependency — needs approval** per the Library Selection Policy.                                                                                                  |
| C2  | `renewDueSubscriptions` (daily) | For each `ACTIVE` subscription past `renewalDate`: issue the closing invoice, roll `currentBillingPeriodStart/End` forward, advance `renewalDate`, write an audit row. |
| C3  | `markOverdueInvoices` (daily)   | `SENT` invoices past `dueDate` → `OVERDUE`; the owning subscription → `PAST_DUE`.                                                                                      |
| C4  | Idempotency + safety            | Every job must be safe to run twice. B1's unique constraint carries invoices; renewal needs a guard on `currentBillingPeriodEnd` so a re-run cannot double-advance.    |

### Concurrency caveat

`@nestjs/schedule` runs in-process. With more than one API instance, **every instance runs
every job** — double invoicing, double renewal. For a single instance this is fine; beyond
that it needs a database advisory lock or an external trigger. Recommendation: build the jobs
as **plain idempotent service methods**, and have the cron layer be a thin caller. That keeps
the option of moving to an external scheduler (or an admin-triggered endpoint) without a
rewrite, and makes each job directly testable.

---

## Phase D — Payment methods

The `PaymentMethod` model and repo exist; there are **zero endpoints**.

| #   | Work                                                       | Notes                                                                                                                                                              |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | `PaymentMethodsModule` — list / add / set-default / remove | Every handler scoped to the caller via `assertCanActOn`. Given two IDORs already found in this codebase, ownership is the design centre here, not an afterthought. |
| D2  | Never return `stripeToken`                                 | Same `omit` pattern as `PublicUser`. Expose only `last4Digits`, `expiryMonth/Year`, `isDefault`.                                                                   |
| D3  | Enforce exactly one default                                | Setting a new default clears the previous one in a transaction.                                                                                                    |
| D4  | Frontend `/settings` section                               | **Partly delivered.** `payment-methods` + `payment-method-row` list, set default and remove. **No add form**, deliberately — see below.                            |

Card data never touches this system — `stripeToken` is a reference. Without a processor, "add
card" means storing a token from a client-side integration. **Until Stripe is in scope, D1–D4
can only manage placeholder records**, which is worth being clear-eyed about before building it.

**This is why there is no add-card form.** `useAddPaymentMethod` and `POST /payment-methods`
both exist and work; the missing piece is deliberately the UI, because a form that invents a
placeholder token would tell a customer their card is on file when nothing was tokenised. The
section's empty state names the gap rather than hiding it. **Build the form in the same change
as the Stripe integration, not before** — the unconsumed hook is the record of this decision,
not an oversight.

---

## Phase E — Password reset

`forgotPassword` returns _"If the email exists, reset instructions were sent"_ and does nothing.
`resetPassword` already verifies a JWT and updates the hash — so the **verification half works**;
only issuance and delivery are missing.

| #   | Work                            | Notes                                                                                                                                  |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | Issue a short-lived reset token | Reuse the RS256 keypair with a distinct audience/purpose claim and ~30 min expiry, so a reset token cannot be used as a session token. |
| E2  | Persist a single-use marker     | Otherwise the token is replayable until expiry. A `passwordResetAt` column, checked against `iat`, is the cheapest version.            |
| E3  | Deliver the email               | **New dependency — needs approval.** Resend or Nodemailer.                                                                             |
| E4  | Keep the response non-committal | The current message is correct and must not change; it avoids account enumeration.                                                     |

---

## Phase F — Verification

| #   | Work                                            | Notes                                                                                                                                                                                                |
| --- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | ~~`@ApiOkResponse({ type })` on every handler~~ | **Done.** All 49 operations declare a success shape; response schemas generate and `lib/types` is aliases over them.                                                                                 |
| F2  | ~~Collapse `GET /usage/current` to one shape~~  | **Done.** It returns `MetricUsage[]`, and the client-side normaliser has been removed. This row and the `/usage` blueprint both still described the old union until a later pass checked the source. |
| F3  | ~~Component tests~~                             | **Done.** Vitest runs a jsdom `components` project; the `common/` components carrying a design principle are covered.                                                                                |
| F4  | ~~E2E~~                                         | **Done.** Playwright drives Chromium against the real proxy and UI; the API is stubbed per test, so the suite runs without a database.                                                               |
| F5  | ~~Integration tests for the cycle~~             | **Done.** 15 tests in `test/cycle.e2e-spec.ts` against a real Postgres: issuance, renewal, the overdue sweep, both idempotency guarantees and the audit trail.                                       |

---

## Sequencing

```
A (foundations)  ──▶ B (invoices) ──▶ C (scheduler)
                          │
                          └──────────▶ F5 (cycle integration tests)
D (payment methods)  ─ independent, gated on the Stripe question
E (password reset)   ─ independent, gated on the email-provider question
F1–F2 ─ independent, do any time; F1 pays for itself immediately
```

A → B → C is the critical path and the only sequence with hard ordering. D, E and F1–F2 can
run in parallel or be dropped without affecting it.

---

## Decisions, and how they went

1. ~~**Overage pricing**~~ — **resolved: option 2.** Rates live on the plan per metric; a
   metric without one is still a hard cap.
2. ~~**Scheduler shape**~~ — **resolved: both.** `@nestjs/schedule` v6 calls the same
   idempotent methods the admin endpoints call, and `BILLING_CYCLE_CRON=off` falls back to an
   external trigger.
3. **Stripe** — still out of scope. The seams are modelled as reference columns; payment
   methods manage placeholder records.
4. ~~**Email provider**~~ — **resolved: SMTP via Nodemailer**, so any provider works and none
   is required to boot.
5. ~~**New dependencies**~~ — `@nestjs/schedule`, `nodemailer` and `@playwright/test` were all
   approved and installed.

---

## Environment note

Investigation for this pass was done by reading source, not by probing a running system: the
Docker daemon, Postgres, the API and the web server had all been stopped since the previous
session. Worth knowing for next time — **another service (`travel-service`) now occupies port
5000**, the backend's default `PORT`. Bringing this stack up again needs that port freed or
`PORT` changed in `backend/.env` and `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.

Restore with:

```bash
cd backend && docker compose up -d db && pnpm seed && pnpm start:prod
cd frontend && pnpm dev
```

---

## Previously gated, now approved and built

All three dependencies were approved and installed.

| Item                              | Dependency           | State                                                                               |
| --------------------------------- | -------------------- | ----------------------------------------------------------------------------------- |
| Cron wiring for the cycle jobs    | `@nestjs/schedule@6` | `CycleScheduler` calls `runAll()` daily at 02:00; `BILLING_CYCLE_CRON=off` disables |
| Email delivery for password reset | `nodemailer`         | `SmtpResetDelivery` behind `RESET_DELIVERY`; falls back to logging with no SMTP     |
| End-to-end tests                  | `@playwright/test`   | Chromium drives the real UI with a real signed session; API stubbed, no database    |

Three things worth recording about how they went in:

- **`@nestjs/schedule` v6, not v12.** v12 is ESM-only (`"type": "module"`) with no CJS build,
  which the Jest harness — the one this project had to repair to exist at all — cannot parse.
  v6 is the CJS major whose peer range is `^10 || ^11`, matching Nest 11 exactly.
- **No advisory lock.** The obvious hardening for an in-process scheduler is
  `pg_try_advisory_lock`, but those are _session_-scoped, and a Prisma connection pool gives no
  guarantee the lock and the unlock land on the same connection. A lock that can silently leak
  is worse than none. The jobs are idempotent by construction, which is the real safety
  mechanism; `BILLING_CYCLE_CRON` designates a single runner when there is more than one
  instance.
- **The reset send is wrapped in try/catch.** `send` is only reached when the account exists,
  so an uncaught SMTP failure would turn a 500 into an account-enumeration oracle and undo E4.
  Failures are logged, and the response stays identical either way.

Stripe remains out of scope; `stripeToken` and `stripeInvoiceId` are reference columns.
Payment methods manage placeholder records until a processor is integrated.

## Verified live — overage billing

Against a seeded Postgres and a running API, signed in as the seeded customer on Pro
(500,000 API calls at `$0.0002`, seats hard-capped at 10):

- `GET /usage/limits` reports the rate and a zero charge while inside the limit.
- `POST /usage/track` pushing API calls to 600,000 is **accepted**, because the metric is
  billable — 100,000 over at `$0.0002` = **`$20`**, and the meter reads 120 %.
- `POST /usage/track` adding a seat past 10 is **refused 400**, because seats carry no rate:
  _"This metric has no overage rate, so the limit is a hard cap."_
- `GET /invoices/upcoming/estimate` returns `baseAmount 49`, `overageAmount 20`, `amount 69`.
- `POST /admin/billing/cycle/subscriptions/:id/issue-invoice` issues **`$69`**, and issuing it
  three times returns the same invoice each time.

## Verified live

- Limits now resolve from `plan.limits` — a Pro customer reads 500,000 API calls with 82.5 %
  consumed, matching the meter. Previously enforced at the hardcoded 10,000.
- `POST /usage/track` accepts within the real limit and rejects past it.
- The partial index is in place; `pnpm db:constraints` is idempotent across repeated runs.
- One cycle run renewed a due subscription, issued its invoice, marked two invoices overdue and
  moved the subscription to `PAST_DUE`, writing `subscription_renewed`, `invoice_issued` and
  `invoice_overdue` audit rows.
- Issuing the same period's invoice three times produced exactly one invoice.
- Password reset: identical response for known and unknown emails, reset succeeds, the same
  token is refused on replay, and login with the new password works.
- Payment methods: added, listed, exactly one default enforced, `stripeToken` never returned.
- A non-admin receives 403 from every `/admin/billing/cycle/*` endpoint.
