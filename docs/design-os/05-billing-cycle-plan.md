# Billing Cycle — Implementation Plan

Turns the console from one that _displays_ billing into one that _does_ billing.
References [Roadmap & QA](04-roadmap-and-qa.md) and [Product Definition](00-product-definition.md).

Status: **implemented 2026-09-03**, except the four dependency-gated items listed under
[Still gated](#still-gated). Verified against a live Postgres, API and web server.

Two blocking decisions were taken as **stated assumptions** rather than stalling the work:

- **Overage pricing → option 1 (no overage).** Exceeding a limit blocks the request; invoices
  are the flat plan price. `calculateOverageCharge` is wired but called with a zero rate, so
  switching to option 2 means adding `overageRates` to the plan and passing it through — the
  call site already exists.
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

| #   | Work                                                                                      | Notes                                                                                                                                                      |
| --- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Provide `InvoiceGeneratorService` and add `issueInvoiceForPeriod(subscriptionId, period)` | Idempotent by construction — `@@unique([subscriptionId, billingPeriodStart])` already exists; catch the unique violation and treat it as "already issued". |
| B2  | Compute overage from `UsageLog` vs `plan.limits`                                          | Depends on A1. Unlimited metric contributes zero.                                                                                                          |
| B3  | Persist `DRAFT` → transition to `SENT` when issued                                        | The `stripeInvoiceId` column stays null; no processor in scope.                                                                                            |
| B4  | Admin endpoint to issue manually                                                          | `POST /admin/billing/subscriptions/:id/issue-invoice`, `ADMIN` + `RolesGuard`. Gives a way to exercise the path before the scheduler exists.               |

### Decision required — overage pricing

**Nothing in the schema models an overage rate.** `calculateOverageCharge(usage, limit, ratePerUnit)`
takes a rate the system cannot supply. Options:

1. **No overage** — exceeding a limit blocks the request (today's behaviour). Simplest, and
   consistent with the current `BadRequestException`. Invoices are then always the flat plan price.
2. **Overage rates per metric on the plan** — add `overageRates Json` to `SubscriptionPlan`
   (e.g. `{ "API_CALLS": 0.0001 }`). Requires a migration and admin-form fields.
3. **Hard cap with upgrade prompt** — block, but surface the upgrade path in the UI.

Option 1 is the smallest honest step and matches [Phase 1's non-goals](00-product-definition.md#non-goals).
Option 2 is what "metered billing" usually implies. **This is a product decision, not a
technical one, and Phase B cannot be finished without it.**

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
| D4  | Frontend `/settings` section                               | `PaymentMethodList` + add form, reusing existing primitives.                                                                                                       |

Card data never touches this system — `stripeToken` is a reference. Without a processor, "add
card" means storing a token from a client-side integration. **Until Stripe is in scope, D1–D4
can only manage placeholder records**, which is worth being clear-eyed about before building it.

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

| #   | Work                                        | Notes                                                                                                                                            |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| F1  | `@ApiOkResponse({ type })` on every handler | Response schemas then generate; `lib/types/billing.ts` mostly deletes itself. Removes a whole class of frontend/backend drift.                   |
| F2  | Collapse `GET /usage/current` to one shape  | It returns three today, normalised client-side in `lib/utils/usage.ts`.                                                                          |
| F3  | Component tests                             | `jsdom` + `@testing-library/react` — **new dependencies**.                                                                                       |
| F4  | E2E                                         | Playwright — **new dependency**. Would have caught every runtime bug found so far, and would let the UI be visually verified for the first time. |
| F5  | Integration tests for the cycle             | A seeded database, run the jobs, assert invoice and status transitions. Highest value per line of the lot.                                       |

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

## Decisions needed before starting

1. **Overage pricing** — block at limit (option 1), or model rates and bill for overage
   (option 2)? Blocks Phase B.
2. **Scheduler shape** — in-process `@nestjs/schedule`, or idempotent methods behind an
   admin/external trigger? Affects C1's dependency.
3. **Stripe** — in scope? Determines whether Phase D is real or placeholder.
4. **Email provider** — which, if any? Blocks Phase E.
5. **New dependencies** — `@nestjs/schedule`, an email SDK, `jsdom`/`@testing-library/react`,
   Playwright. All require approval under the Library Selection Policy.

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

## Still gated

Everything else in this plan is implemented and verified. These four need a dependency the
Library Selection Policy says must be approved, not installed unilaterally:

| Item                              | Dependency                         | What it unlocks                                                                         |
| --------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------- |
| Cron wiring for the cycle jobs    | `@nestjs/schedule`                 | The jobs run unattended instead of on an admin trigger                                  |
| Email delivery for password reset | an email SDK                       | The reset link reaches the customer; issuance, single-use and verification already work |
| Component tests                   | `jsdom` + `@testing-library/react` | React components covered by tests                                                       |
| End-to-end tests                  | Playwright                         | The UI verified in a browser for the first time                                         |

Stripe remains out of scope; `stripeToken` and `stripeInvoiceId` are reference columns.
Payment methods manage placeholder records until a processor is integrated.

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
