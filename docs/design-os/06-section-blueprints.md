# Phase 5 — Section Blueprints

References [Phase 1](00-product-definition.md), [Phases 2–3](01-information-architecture.md)
and [Phase 4](02-page-blueprints.md). Governs
[`components/sections/`](../../components/sections/).

Sections are the layer between a route and the component library. **A route file is forbidden
from declaring components or fetching data** (`starter/page-composes-only`), so page
composition has nowhere to live except here. The lint rule and this layer are the same decision
expressed twice.

---

## Contents

- [The section contract](#the-section-contract)
- [The one-job rule](#the-one-job-rule)
- [`auth/`](#auth--4-sections) · [`dashboard/`](#dashboard--3-sections) ·
  [`usage/`](#usage--3-sections) · [`plans/`](#plans--3-sections) ·
  [`subscription/`](#subscription--4-sections) · [`invoices/`](#invoices--3-sections) ·
  [`settings/`](#settings--5-sections) · [`admin/`](#admin--6-sections) ·
  [`landing/`](#landing--2-sections)
- [Reuse graph](#reuse-graph)

---

## The section contract

Every attribute the master prompt requires of a section is listed here once. A blueprint below
states only what distinguishes it; anything unstated is the contract.

**Hierarchy.** One folder per route, named for the route. One section per file, default export,
filename matching the component name (`starter/one-component-per-file`).

**Data requirements.** A section that reads server state calls a `use*` hook from
[`lib/hooks/`](../../lib/hooks/) and is marked `"use client"`. **It never imports the
transport** — `starter/api-access-boundary` and the `no-restricted-imports` ban on
`@/lib/api-client` both fire. A section with no hook is presentational and stays server-render
capable.

**Interaction model.** Reads render. Writes go through a mutation hook, and every destructive
write is guarded by `ConfirmDialog` — design principle 3, non-negotiable.

**States — the standard ladder.** Every data section resolves in this order, and skipping a
rung is a defect:

1. `isPending` → `<Skeleton lines={n} />`, never a spinner-only screen
2. `isError` → `<ErrorState error onRetry={refetch} />`, carrying the `ApiError` message
3. no data → `<EmptyState>` with the single action that resolves it
4. success → content

**Accessibility.** Inherited from the components a section composes; a section adds no bare
interactive element of its own. Status is a word via `StatusPill`, never colour alone.

**Responsive behaviour.** Named in [`styles/components.css`](../../styles/components.css).
`starter/token-first-classnames` forbids `md:`/`lg:` chains in JSX, so **no section contains a
breakpoint.**

**Animation.** Opt-in only, via `MotionWrapper`. `prefers-reduced-motion` is honoured globally.

**Technical notes.** Under 150 lines (`max-lines`). No comments (`starter/no-comments`) — the
explanation belongs here instead.

---

## The one-job rule

**No section solves multiple unrelated jobs.** The rule is why `/subscription` is four files
rather than one, and it has a mechanical tell: **a section approaching 150 lines has usually
taken on a second job.** Split it rather than raising the ceiling.

The rule cuts both ways — a section extracted purely to shorten a file, with no job of its own,
is worse than the long file. The test is whether you can name its job in one clause.

---

## `auth/` — 4 sections

Composed into [`/auth/*`](02-page-blueprints.md#authentication) inside `AuthCard`. All four are
credential forms: no `SectionCard`, no skeleton (nothing is read), submit-time errors only.

| Section                | One job                            | Mutation hook       | Composes                 |
| ---------------------- | ---------------------------------- | ------------------- | ------------------------ |
| `login-form`           | Exchange credentials for a session | `useLogin`          | `FormField` `ErrorState` |
| `register-form`        | Create an account                  | `useRegister`       | `FormField` `ErrorState` |
| `forgot-password-form` | Request a reset link               | `useForgotPassword` | `FormField` `ErrorState` |
| `reset-password-form`  | Complete a reset from a token      | `useResetPassword`  | `FormField` `ErrorState` |

**States.** Error is the only non-success state — the ladder's skeleton and empty rungs do not
apply to a form that reads nothing. **Failure must never clear the typed values** (E1's
recovery path).

**Notes.** On success the session cookie is set by the backend and the form redirects; the
client stores nothing. `reset-password-form` reads its token from a URL search param, which is
why the route wraps it in `Suspense`.

---

## `dashboard/` — 3 sections

Composed into [`/dashboard`](02-page-blueprints.md#dashboard--customer-overview) in this order.
The order is the blueprint: **the meter row is first because E2 is the loop the product lives
on.**

### `usage-summary` — _also the first section of `/usage`_

**One job:** answer _am I within my limits_ before anything else renders.
**Data:** `useCurrentSubscription`, then `useCurrentUsage(enabled: Boolean(subscription.data))`
— usage is not fetched until a subscription is known to exist, so an unsubscribed visitor makes
one request, not two.
**Composes:** `MeterRow`, `Skeleton`, `ErrorState`, `EmptyState`, `LinkButton`.
**Empty:** _"You do not have a plan yet"_ → **Choose a plan** → `/plans`. This is E1's entry
point and the most important empty state in the product.
**Reuse:** the only section composed into two different routes.

### `plan-summary`

**One job:** state the current plan and its billing period.
**Data:** `useCurrentSubscription`. **Composes:** `SectionCard`, `SubscriptionFacts`,
`Skeleton`, `EmptyState`.
**Notes:** delegates every fact to `SubscriptionFacts` so the dashboard tile and
`/subscription` cannot disagree about how a plan is described.

### `next-invoice`

**One job:** state what is owed and when.
**Data:** `useCurrentSubscription` + `useUpcomingInvoice`. **Composes:** `SectionCard`,
`DetailRow`, `Money`, `Skeleton`, `EmptyState`.
**Notes:** the estimate is a projection, not an issued invoice — label it as such. Amounts
render through `Money`, never a hand-formatted string.

### `recent-invoices`

**One job:** the five most recent invoices as a glance, not a manager.
**Data:** `useInvoices`. **Composes:** `SectionCard`, `InvoiceTable`, `Skeleton`, `EmptyState`,
`ErrorState`.
**Notes:** truncates to five and links to `/invoices`; it owns no filtering or sorting, because
that is `invoice-list`'s job.

---

## `usage/` — 3 sections

### `meter-row` — the hero interaction

**One job:** render one `UsageMeter` per metered dimension.
**Data:** none. Pure — takes `limits` and `usage` as props from `usage-summary`.
**Composes:** `UsageMeter` × 3 (`API_CALLS`, `STORAGE_GB`, `SEATS`).
**Notes:** presentational by design, so the hero interaction can be composed anywhere without
dragging a fetch behind it. **A missing `UsageLog` for the period is zero consumed, not an
error** — an absent row is the normal state at the start of a period. A `null` limit is
unlimited, not zero.

### `usage-history`

**One job:** the per-metric ledger over time.
**Data:** `useUsageHistory`. **Composes:** `SectionCard`, `DataTable`, `Skeleton`,
`EmptyState`, `ErrorState`.
**Notes:** a table, not a chart — [charts are deferred](04-roadmap-and-qa.md#known-gaps-ranked)
until a real series exists and a dependency is approved.

`usage-summary` is blueprinted under [`dashboard/`](#dashboard--3-sections).

---

## `plans/` — 3 sections

### `plan-catalog`

**One job:** compare tiers and commit to one — the `DOMAIN_TRANSACTION`.
**Data:** `usePlans`, `useCurrentSubscription`; mutations `useSelectPlan` and `useChangePlan`.
**Composes:** `PlanCard`, `ConfirmDialog`, `Skeleton`, `EmptyState`, `ErrorState`.
**Interaction:** the action is **select** when unsubscribed and **change** when subscribed —
one catalogue, two verbs, chosen from subscription state rather than by duplicating the screen.
A plan change is a billing-state mutation and therefore confirms.
**Notes:** the current plan's card is marked and its action disabled; inactive plans are hidden.
A `409` (plan deactivated between render and submit) re-fetches and marks that card
unavailable **without discarding the rest of the selection** — E1's failure path.

### `plan-card`

**One job:** present one plan as a comparable unit.
**Data:** none — props only. **Composes:** `Money`, `PlanFeatureList`.
**Notes:** shows **limits, not only price** — E1's decision point is what you are allowed, not
what it costs.

### `plan-feature-list`

**One job:** render a plan's limits as readable lines.
**Data:** none. **Reuse:** shared with `landing-plans`, so the public preview and the
authenticated catalogue describe a plan identically.

---

## `subscription/` — 4 sections

Four files, not one — the clearest instance of [the one-job rule](#the-one-job-rule).

| Section                | One job                                        | Data                                                 |
| ---------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| `subscription-detail`  | Frame the current subscription; own the states | `useCurrentSubscription`                             |
| `subscription-facts`   | Describe a subscription (pure)                 | none — props                                         |
| `subscription-actions` | Cancel and reactivate                          | `useCancelSubscription`, `useReactivateSubscription` |
| `subscription-history` | Past subscription records                      | `useSubscriptionHistory`                             |

**`subscription-facts`** composes `DetailRow`, `Money`, `PeriodRange`, `StatusPill` and is
**reused by `plan-summary`**. Periods always render both endpoints through `PeriodRange` and
status always renders as a word through `StatusPill` — design principle 2, made structural.

**`subscription-actions`** is the danger zone. Both actions confirm through `ConfirmDialog`;
the cancel copy must state that cancelling is reversible while the record exists. On success it
invalidates the subscription, usage **and** invoice query keys together, because the backend
changes all three in one transaction.

**`subscription-history`** is constrained by a schema finding: `@@unique([userId, status])`
means a user cannot hold two records with the same status, so **history is thin until that
constraint is lifted** — tracked in [the billing cycle plan](05-billing-cycle-plan.md).

---

## `invoices/` — 3 sections

### `invoice-list`

**One job:** find an invoice.
**Data:** `useInvoices`. **Composes:** `SectionCard`, `InvoiceTable`, `Skeleton`, `EmptyState`,
`ErrorState`. Owns the status filter and ordering; delegates rendering to `InvoiceTable`.

### `invoice-table` — pure

**One job:** render invoice rows identically everywhere.
**Data:** none. **Composes:** `DataTable`, `Money`, `PeriodRange`, `StatusPill`.
**Reuse:** `invoice-list` **and** `recent-invoices`. Extracting it is what stops the dashboard's
five rows and the invoice manager's table from drifting apart.

### `invoice-detail`

**One job:** one invoice in full, with the mark-paid action.
**Data:** `useInvoice`, `useMarkInvoicePaid`. **Composes:** `SectionCard`, `DetailRow`, `Money`,
`PeriodRange`, `StatusPill`, `Skeleton`, `ErrorState`.
**Permissions.** An invoice id is a URL parameter, so **ownership is enforced by the backend**,
not by this section — an IDOR here was
[found by running it](04-roadmap-and-qa.md#found-by-actually-running-it), not by reading it. A
`403` renders as `ErrorState`, never as an empty invoice.

---

## `settings/` — 5 sections

| Section              | One job                               | Data                                                                        |
| -------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| `profile-form`       | Frame profile editing; own the states | `useCurrentUser`                                                            |
| `profile-fields`     | The editable fields and their submit  | `useUpdateAccount`                                                          |
| `account-details`    | Read-only account facts               | `useCurrentUser`                                                            |
| `payment-methods`    | List, default, remove                 | `usePaymentMethods`, `useSetDefaultPaymentMethod`, `useRemovePaymentMethod` |
| `payment-method-row` | Present one card (pure)               | none — props                                                                |

**The form/fields split** separates fetching and framing from editing and submitting, keeping
both under the line ceiling and letting the fields render inside any container.

**`payment-methods`** guards removal with `ConfirmDialog`. **Meter stores Stripe tokens and
never charges them** — no PAN, no CVC, no expiry ever enters this app; `payment-method-row`
renders brand and last-four only.

**Password and email changes are separate submissions** from profile fields — an account
identity change is not a profile edit and must not ride along in the same PATCH.

---

## `admin/` — 6 sections

Reachable only after [`middleware.ts`](../../middleware.ts) has verified an `ADMIN` claim
server-side. **No section performs an authorisation check** — by the time one renders,
authorisation has already happened twice (middleware, then the backend's `RolesGuard`).

| Section                   | One job                              | Data                                            |
| ------------------------- | ------------------------------------ | ----------------------------------------------- |
| `admin-overview`          | Platform health at a glance          | `useAdminStats`, `useBillingStats`              |
| `admin-invoice-health`    | Invoice health counters              | `useInvoiceStats`                               |
| `admin-overdue-invoices`  | The overdue queue — the ops worklist | `useOverdueInvoices`                            |
| `admin-plan-list`         | The catalogue, with lifecycle        | `usePlans`, `useSetPlanActive`, `useDeletePlan` |
| `admin-plan-form`         | Create a plan                        | `useCreatePlan`                                 |
| `admin-subscription-list` | Subscription oversight, filtered     | `useAdminSubscriptions`                         |

**`admin-plan-list`** carries the catalogue's two lifecycle rules, both of which are business
rules before they are UI: **deactivating a plan must not cascade** to the subscriptions
referencing it, and **deletion double-confirms** because a plan with history should be
deactivated instead. Both actions route through `ConfirmDialog`.

**`admin-overdue-invoices`** is reused on `/admin` and `/admin/invoices` — the ops overview and
the invoice screen show the same queue rather than two queries that can disagree.

---

## `landing/` — 2 sections

The **only** sections permitted the editorial register; every other section is bound by
`starter/application-register-density`.

- **`landing-hero`** — value proposition and the call to action into `/auth/register`. No data.
- **`landing-plans`** — public plan preview. `usePlans`; composes `PlanFeatureList` and `Money`.
  Skeleton while loading; **no empty state** — a catalogue with no plans is a deployment fault,
  not a user-facing condition, and must not render an empty marketing page.

---

## Reuse graph

Ten sections compose another section. Every edge exists to stop two surfaces describing the
same record differently.

```
usage-summary ──────────→ meter-row              the hero, composed on 2 routes
plan-summary ───────────→ subscription-facts     dashboard tile = /subscription
subscription-detail ────→ subscription-facts
recent-invoices ────────→ invoice-table          dashboard rows = /invoices rows
invoice-list ───────────→ invoice-table
plan-catalog ───────────→ plan-card ──→ plan-feature-list
landing-plans ──────────→ plan-feature-list      public preview = authenticated catalogue
payment-methods ────────→ payment-method-row
profile-form ───────────→ profile-fields
```

**A section imported by two others is a shared description and must stay pure.** If one of
`subscription-facts`, `invoice-table`, `plan-feature-list`, `meter-row` or `payment-method-row`
grows a hook, the two surfaces above it start fetching independently and are free to disagree —
which is the drift this layer exists to prevent.
