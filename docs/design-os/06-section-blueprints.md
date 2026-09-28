# Phase 5 — Section Blueprints

> Status: settled · regenerated 2026-09-28 under the standing brief's
> [No visual prescription](../MASTER_PROMPT_COMPLETE.md#no-visual-prescription) rule.
> Governed by [MASTER_PROMPT_COMPLETE.md](../MASTER_PROMPT_COMPLETE.md#phase-5--section-blueprints).
> References [Phase 1](00-product-definition.md), [Phases 2–3](01-information-architecture.md)
> and [Phase 4](02-page-blueprints.md). Governs
> [`components/sections/`](../../components/sections/). Next in phase order:
> [Phase 6](07-component-library.md).

Sections are the layer between a route and the component library. **A route file is forbidden
from declaring components or fetching data** (`starter/page-composes-only`), so page
composition has nowhere to live except here. The lint rule and this layer are the same decision
expressed twice.

Each blueprint describes a section's job, content and behaviour. **None of them specifies
layout, order on screen, sizing, imagery or animation** — those are decided when the page is
built, with the owner.

---

## Contents

- [The section contract](#the-section-contract)
- [The one-job rule](#the-one-job-rule)
- [`auth/`](#auth--4-sections) · [`dashboard/`](#dashboard--3-sections) ·
  [`usage/`](#usage--7-sections) · [`plans/`](#plans--3-sections) ·
  [`subscription/`](#subscription--4-sections) · [`invoices/`](#invoices--3-sections) ·
  [`settings/`](#settings--5-sections) · [`admin/`](#admin--13-sections) ·
  [`landing/`](#landing--2-sections)
- [Reuse graph](#reuse-graph)

---

## The section contract

Every attribute the brief requires of a section is listed here once. A blueprint below states
only what distinguishes it; anything unstated is the contract.

**Hierarchy.** One folder per route, named for the route. One section per file, default export,
filename matching the component name (`starter/one-component-per-file`).

**Data requirements.** A section that reads server state calls a `use*` hook from
[`lib/hooks/`](../../lib/hooks/) and is marked `"use client"`. **It never imports the
transport** — `starter/api-access-boundary` and the `no-restricted-imports` ban on
`@/lib/api-client` both fire. A section with no hook is presentational and stays server-render
capable.

**Interaction model.** Reads render. Writes go through a mutation hook, and every destructive
write is guarded by `ConfirmDialog` — principle 3, non-negotiable.

**States — the standard ladder.** Every data section resolves in this order, and skipping a
rung is a defect:

1. `isPending` → loading, announced to assistive technology (`Skeleton`)
2. `isError` → `ErrorState` with a retry, carrying the `ApiError` message
3. no data → `EmptyState` with the single action that resolves it
4. success → content

**Four sections omit a rung for a stated reason.** They are exceptions, not oversights, and
are listed here so an audit does not re-raise them: `invoice-detail` has no empty state
because a `403` must render as an error and never as an empty invoice; `profile-form` and
`account-details` have none because `GET /users/me` cannot return nothing on an authenticated
route; `admin-overview` and `admin-invoice-health` have none because a counter is always
present, zero included. **Nothing omits the error rung** — a failed read that renders as an
empty state tells the customer something false about their billing.

**Accessibility.** Inherited from the components a section composes; a section adds no bare
interactive element of its own. Status is a word via `StatusPill`, never colour alone.

**Device needs.** Every section stays fully operable from phone width up and loses no
information or action on a small screen. How it adapts is a build decision.

**Motion.** Opt-in only, through `MotionWrapper`. `prefers-reduced-motion` is honoured
globally.

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

Composed into [`/auth/*`](02-page-blueprints.md#authentication) inside `AuthCard`, which
supplies the page heading. All four are credential forms: nothing is read, so there is no
loading or empty rung, and errors arise at submit only.

| Section                | One job                            | Mutation hook       | Composes                 |
| ---------------------- | ---------------------------------- | ------------------- | ------------------------ |
| `login-form`           | Exchange credentials for a session | `useLogin`          | `FormField` `ErrorState` |
| `register-form`        | Create an account                  | `useRegister`       | `FormField` `ErrorState` |
| `forgot-password-form` | Request a reset link               | `useForgotPassword` | `FormField` `ErrorState` |
| `reset-password-form`  | Complete a reset from a token      | `useResetPassword`  | `FormField` `ErrorState` |

**States.** Error is the only non-success state. **Failure must never clear the typed values**
(E1's recovery path).

**Content rule.** `forgot-password-form` shows the same non-committal confirmation whether or
not the email exists, so it cannot be used to discover accounts.

**Notes.** On success the session cookie is set by the backend and the form redirects; the
client stores nothing. `reset-password-form` reads its token from a URL search param, which is
why the route wraps it in `Suspense`.

---

## `dashboard/` — 3 sections

Composed into [`/dashboard`](02-page-blueprints.md#dashboard--customer-overview) with
`usage-summary`. Priority, not placement: **usage answers first because E2 is the loop the
product lives on.**

### `usage-summary` — _lives in `usage/`; blueprinted here because `/dashboard` depends on it first_

**One job:** answer _am I within my limits_ before anything else.
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
`Skeleton`, `EmptyState`, `ErrorState`.
**Empty:** _Browse plans_ → `/plans`.
**Notes:** delegates every fact to `SubscriptionFacts` so the dashboard summary and
`/subscription` cannot disagree about how a plan is described.

### `next-invoice`

**One job:** state what is owed and when.
**Data:** `useCurrentSubscription` + `useUpcomingInvoice`. **Composes:** `SectionCard`,
`DetailRow`, `Money`, `Skeleton`, `EmptyState`, `ErrorState`.
**States:** either query failing renders `ErrorState`. Without that rung a failed estimate
renders _"Nothing due yet"_, which states a fact the system does not have.
**Content rule:** the estimate is a projection, not an issued invoice — label it as such.
Amounts render through `Money`, never a hand-formatted string.

### `recent-invoices`

**One job:** the five most recent invoices as a glance, not a manager.
**Data:** `useInvoices`. **Composes:** `SectionCard`, `InvoiceTable`, `Skeleton`, `EmptyState`,
`ErrorState`.
**Notes:** truncates to five and links to `/invoices`; it owns no filtering or sorting, because
that is `invoice-list`'s job.

---

## `usage/` — 7 sections

`usage-summary` (above, under [`dashboard/`](#dashboard--3-sections)) plus the six below.

### `meter-row` — the hero interaction

**One job:** present one `UsageMeter` per metered dimension.
**Data:** none. Pure — takes `limits` and `usage` as props from `usage-summary`.
**Composes:** `UsageMeter` × 3 (`API_CALLS`, `STORAGE_GB`, `SEATS`).
**Notes:** presentational by design, so the hero interaction can be composed anywhere without
dragging a fetch behind it. **A missing `UsageLog` for the period is zero consumed, not an
error** — an absent row is the normal state at the start of a period. A `null` limit is
unlimited, not zero.

### `usage-history`

**One job:** the per-metric ledger over time.
**Data:** `useUsageHistory`, and `useCurrentSubscription` for the plan's limits.
**Composes:** `SectionCard`, `usage-trend-chart` × 3, `DataTable` inside a native `<details>`
disclosure, `Skeleton`, `EmptyState`, `ErrorState`.
**Content rules:** **one chart per metric, never one shared chart** — calls run to 500,000 and
seats to 10, so a shared scale erases seats and a dual scale invents a correlation. The table is
the charts' text twin: every value is reachable without hovering and with no script. A metric
with no history gets no chart rather than an empty one.

### `usage-trend-chart`

**One job:** one metric's consumption per billing period, against its limit.
**Data:** none — props (`points`, `limit`, `unit`). **Composes:** `trend-axes`, `trend-limit`,
`trend-tooltip`.
**Content rules:** one series, named by the chart's caption, so no legend is needed. The
**latest** value is stated. Values are whole numbers, so the scale never shows fractional units.
**`limit` is three-state:** a number shows the limit as a reference, `null` says "unlimited on
your plan", and `undefined` — the plan still loading — says nothing, because claiming
"unlimited" before the plan arrives would be false.
**Keyboard & ARIA:** every period is focusable and announces its value, so keyboard and pointer
get the same readout.
**Technical note:** drawn without a charting library (see
[Deviations](../MASTER_PROMPT_COMPLETE.md#deviations-recorded)).

### `trend-axes`

**One job:** the value scale and period labels. **Data:** none — props.
**Content rule:** the latest period is always labelled.

### `trend-limit`

**One job:** show the plan limit as a threshold, labelled when that is legible.
**Data:** none — props.
**Content rule:** the caption always states the limit in text, so an in-chart label is
supplementary. **It is omitted rather than allowed to obscure a value** — an earlier fixed label
covered the latest value, and in any month billed for overage would have covered the data itself
([recorded in QA](04-roadmap-and-qa.md#found-in-the-deferred-pass)).

### `trend-tooltip`

**One job:** the hover and focus readout. **Data:** none — props.
**Content rule:** the value leads and the period follows. It enhances and never gates:
everything it shows is also in the table.

---

## `plans/` — 3 sections

### `plan-catalog`

**One job:** compare tiers and commit to one — the `DOMAIN_TRANSACTION`.
**Data:** `usePlans`, `useCurrentSubscription`; mutations `useSelectPlan` and `useChangePlan`.
**Composes:** `PlanCard`, `ConfirmDialog`, `Skeleton`, `EmptyState`, `ErrorState`.
**Interaction:** the action is **select** when unsubscribed and **change** when subscribed —
one catalogue, two verbs, chosen from subscription state rather than by duplicating the screen.
A plan change is a billing-state mutation and therefore confirms.
**Notes:** the current plan is marked as current and its action disabled; inactive plans are not
offered. A `409` (plan deactivated between render and submit) re-fetches and marks that plan
unavailable **without discarding the rest of the selection** — E1's failure path.

### `plan-card`

**One job:** present one plan as a comparable unit.
**Data:** none — props only. **Composes:** `Money`, `PlanFeatureList`.
**Content rule:** shows **limits, not only price** — E1's decision point is what you are
allowed, not what it costs.

### `plan-feature-list`

**One job:** state a plan's limits as readable lines.
**Data:** none. **Reuse:** shared with `landing-plans`, so the public preview and the
authenticated catalogue describe a plan identically. A metric absent from `limits` reads as
unlimited.

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
**reused by `plan-summary`**. Periods always state both endpoints through `PeriodRange` and
status always reads as a word through `StatusPill` — principle 2, made structural.

**`subscription-actions`** is the danger zone. Both actions confirm through `ConfirmDialog`;
the cancel copy must state that cancelling is reversible while the record exists. On success it
invalidates the subscription, usage **and** invoice query keys together, because the backend
changes all three in one transaction.

**`subscription-history`** was constrained by a schema finding: `@@unique([userId, status])`
allowed one record per status, ever, so history stayed thin. The partial unique index that
replaced it lifts that limit — tracked in
[the billing cycle plan](05-billing-cycle-plan.md#f2--uniqueuserid-status-makes-billing-history-impossible).

---

## `invoices/` — 3 sections

### `invoice-list`

**One job:** find an invoice.
**Data:** `useInvoices`. **Composes:** `SectionCard`, `InvoiceTable`, `Skeleton`, `EmptyState`,
`ErrorState`. Owns the status filter and ordering; delegates rows to `InvoiceTable`.

### `invoice-table` — pure

**One job:** present invoice rows identically everywhere, each opening its invoice.
**Data:** none. **Composes:** `DataTable`, `Money`, `PeriodRange`, `StatusPill`.
**Reuse:** `invoice-list` **and** `recent-invoices`. Extracting it is what stops the dashboard's
five rows and the invoice manager's table from drifting apart.
**Known gap:** a row opens its invoice on pointer click only; there is no keyboard route to the
detail from the table. See [`DataTable`](07-component-library.md#datatable).

### `invoice-detail`

**One job:** one invoice in full, with the mark-paid action.
**Data:** `useInvoice`, `useMarkInvoicePaid`. **Composes:** `SectionCard`, `DetailRow`, `Money`,
`PeriodRange`, `StatusPill`, `Skeleton`, `ErrorState`.
**Permissions.** An invoice id is a URL parameter, so **ownership is enforced by the backend**,
not by this section — an IDOR here was
[found by running it](04-roadmap-and-qa.md#found-by-actually-running-it), not by reading it. A
`403` or `404` renders as `ErrorState`, never as an empty invoice.

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
both under the line ceiling and letting the fields be composed into any container.

**`payment-methods`** guards removal with `ConfirmDialog`. **Meter stores Stripe tokens and
never charges them** — no PAN, no CVC, no expiry ever enters this app; `payment-method-row`
states brand and last-four only. There is **no add-card action**, deliberately: the empty state
names the gap until Stripe is integrated
([Phase D](05-billing-cycle-plan.md#phase-d--payment-methods)).

**Password and email changes are separate submissions** from profile fields — an account
identity change is not a profile edit and must not ride along in the same PATCH.

---

## `admin/` — 13 sections

Reachable only after [`proxy.ts`](../../proxy.ts) has verified an `ADMIN` claim
server-side. **No section performs an authorisation check** — by the time one renders,
authorisation has already happened twice (the proxy, then the backend's `RolesGuard`).

| Section                   | One job                              | Data                                                              |
| ------------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| `admin-overview`          | Platform health at a glance          | `useAdminStats`, `useBillingStats`                                |
| `admin-invoice-health`    | Invoice health counters              | `useInvoiceStats`                                                 |
| `admin-overdue-invoices`  | The overdue queue — the ops worklist | `useOverdueInvoices`                                              |
| `admin-plan-list`         | The catalogue, with lifecycle        | `usePlans`, `useSetPlanActive`, `useDeletePlan`                   |
| `admin-plan-form`         | Create a plan                        | `useCreatePlan`                                                   |
| `admin-subscription-list` | Subscription oversight, filtered     | `useAdminSubscriptions`                                           |
| `admin-cycle-controls`    | Run the billing cycle by hand        | `useRunCycle`, `useRenewSubscriptions`, `useSweepOverdueInvoices` |
| `admin-plan-edit`         | Change an existing plan              | `useUpdatePlan`                                                   |
| `cycle-run-report`        | Report one cycle half (pure)         | none — props                                                      |
| `issue-invoice-button`    | Issue one subscription's invoice     | `useIssueInvoice`                                                 |
| `plan-metric-fields`      | The per-metric limit and rate inputs | none — props                                                      |
| `admin-user-list`         | Find a customer and see their state  | `useAdminUsers`, `useAdminSubscriptions`, `useCurrentUser`        |
| `account-status-button`   | Suspend or restore one account       | `useSetAccountStatus`                                             |

**`admin-user-list`** answers "who is this, and can they get in?" — the [E7](01-information-architecture.md#e7--look-up-and-act-on-a-customer-internal-ops-support)
journey. It joins each account to its most relevant subscription client-side (live before past
due before suspended before canceled, then newest), so a customer who cancelled last month and
resubscribed shows the live plan. Search is by name or email; the status filter narrows to
active, pending or suspended. If the subscription list fails, accounts still render with their
plan details empty and a notice, rather than one failure erasing the whole screen.

**`account-status-button`** confirms before it changes anything, and sends **only**
`{ status }`. It offers no action on the viewer's own row — the backend refuses that change
anyway, so offering it would be a control guaranteed to fail. **The weight of the decision lives
in the confirmation**, which says plainly that history is kept; the per-row control itself is
not presented as a destructive action.

**`DELETE /users/:id` is deliberately not wired.** It cascades to subscriptions and invoices,
destroying billing history along with the account. Suspension is the reversible answer.

**`admin-plan-list`** carries the catalogue's two lifecycle rules, both of which are business
rules before they are UI: **deactivating a plan must not cascade** to the subscriptions
referencing it, and **deletion double-confirms** because a plan with history should be
deactivated instead. Both actions route through `ConfirmDialog`.

**`admin-cycle-controls`** is the console's only platform-mutating surface. It exists because
the cycle endpoints were reachable only by `curl` — the manual trigger built in
[Phase B4](05-billing-cycle-plan.md#phase-b--invoice-generation) had no operator. Each of the
three actions states what it will change in a `ConfirmDialog` before running, and the result
is reported as a `cycle-run-report` per half (renewal, overdue sweep) so an operator can see what
moved. The jobs are idempotent server-side, so the confirm step is about intent, not safety.

**`admin-plan-edit`** is the catalogue's edit half, and the reason
[E5](01-information-architecture.md#e5--administer-the-catalog-billing-admin) reads as
delivered rather than as a promise. It is a modal dialog opened from a row of
`admin-plan-list`, mounted only while a row is selected and keyed by plan id, so its fields seed
from props and need no reset effect — the same pattern as `profile-fields`. It closes on Escape,
moves focus into the dialog on open and returns it to the trigger on close (shared
`use-modal-focus`). **It does not confirm**, because editing a plan is reversible and
[does not cascade](02-page-blueprints.md#admin) to the subscriptions referencing it; the
irreversible neighbours (deactivate, delete) do.

**`plan-metric-fields`** is the six limit and overage-rate inputs, extracted because
`admin-plan-form` and `admin-plan-edit` must offer identical fields — an edit form that
described a limit differently from the create form would be a drift bug with a customer's
money on the other end. Pure; the draft-to-payload conversion lives in
[`lib/utils/plan-draft.ts`](../../lib/utils/plan-draft.ts).

**`cycle-run-report`** reports one half of a cycle run (renewal, overdue sweep) so an operator
can see what moved. Pure, and composed twice by `admin-cycle-controls`. It reads the shape the
contract guarantees; a malformed response is caught by the route's error boundary.

**`issue-invoice-button`** owns its own mutation per row rather than lifting state into the
table, which keeps `admin-subscription-list`'s columns a module constant.

**`admin-overdue-invoices`** is reused on `/admin` and `/admin/invoices` — the ops overview and
the invoice screen show the same queue rather than two queries that can disagree.

---

## `landing/` — 2 sections

The only sections whose job is the first impression
([principle 4](00-product-definition.md#product-principles)).

- **`landing-hero`** — value proposition and the call to action into `/auth/register`. No data.
- **`landing-plans`** — public plan preview. `usePlans`; composes `PlanFeatureList` and `Money`.
  Loading while plans load; **no empty state** — a catalogue with no plans is a deployment
  fault, not a user-facing condition, and must not produce an empty marketing page. **A failed
  request is not an empty catalogue**: the section keeps its heading and renders `ErrorState`
  with a retry, so a visitor sees that pricing exists and failed to load rather than a page
  without it.

---

## Reuse graph

Twenty edges between sections. Every edge exists to stop two surfaces describing the same
record differently, or to keep a component under the 150-line ceiling by one job apiece.

| Section                   | Composes                | Why                                        |
| ------------------------- | ----------------------- | ------------------------------------------ |
| `usage-summary`           | `meter-row`             | The hero, composed on two routes           |
| `plan-summary`            | `subscription-facts`    | Dashboard summary = `/subscription`        |
| `subscription-detail`     | `subscription-facts`    |                                            |
| `recent-invoices`         | `invoice-table`         | Dashboard rows = `/invoices` rows          |
| `invoice-list`            | `invoice-table`         |                                            |
| `plan-catalog`            | `plan-card`             |                                            |
| `plan-card`               | `plan-feature-list`     |                                            |
| `landing-plans`           | `plan-feature-list`     | Public preview = authenticated catalogue   |
| `payment-methods`         | `payment-method-row`    |                                            |
| `profile-form`            | `profile-fields`        |                                            |
| `admin-plan-list`         | `admin-plan-edit`       |                                            |
| `admin-plan-edit`         | `plan-metric-fields`    |                                            |
| `admin-plan-form`         | `plan-metric-fields`    | Create form = edit form                    |
| `admin-cycle-controls`    | `cycle-run-report`      | Composed twice, once per half              |
| `admin-subscription-list` | `issue-invoice-button`  | One mutation per row                       |
| `admin-user-list`         | `account-status-button` | One mutation per row                       |
| `usage-history`           | `usage-trend-chart`     | Composed once per metric                   |
| `usage-trend-chart`       | `trend-axes`            |                                            |
| `usage-trend-chart`       | `trend-limit`           |                                            |
| `usage-trend-chart`       | `trend-tooltip`         |                                            |

**A section imported by two others is a shared description and must stay pure.** If one of
`subscription-facts`, `invoice-table`, `plan-feature-list`, `meter-row`, `payment-method-row`
or `plan-metric-fields` grows a hook, the two surfaces above it start fetching independently and
are free to disagree — which is the drift this layer exists to prevent.

---

## Changed in the 2026-09-28 regeneration

Dropped as visual prescription; no section, state or behaviour was removed.

- The dashboard's "order on screen" became a **priority** order.
- Loading as "a skeleton, never a spinner-only screen" became "loading, announced"; `Skeleton`
  remains the built component.
- Responsive behaviour "named in `styles/components.css`; no section contains a breakpoint"
  became the device need above. The breakpoint ban is a code convention
  ([outside this design OS](03-frontend-architecture.md#rules-outside-this-design-os)).
- Chart drawing specs: column form, 24-unit column cap and rounded data-ends, 1·2·5 tick
  stepping, solid hairline gridlines vs. dashed limit rule, period-label thinning to about six,
  measured left/right label placement, and the `--colors-chart-series` colour. Their content
  and accessibility intent (own scale per metric, limit shown as a reference, latest value and
  period stated, nothing obscured, text twin) is kept.
- `landing/` "editorial register" and `account-status-button` "`quiet`, not `danger` tone"
  became product intent (first impression; weight lives in the confirmation).
- The ASCII reuse graph became a table.
