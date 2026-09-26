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
  [`usage/`](#usage--7-sections) · [`plans/`](#plans--3-sections) ·
  [`subscription/`](#subscription--4-sections) · [`invoices/`](#invoices--3-sections) ·
  [`settings/`](#settings--5-sections) · [`admin/`](#admin--13-sections) ·
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

**Four sections omit a rung for a stated reason.** They are exceptions, not oversights, and
are listed here so an audit does not re-raise them: `invoice-detail` has no empty state
because a `403` must render as an error and never as an empty invoice; `profile-form` and
`account-details` have none because `GET /users/me` cannot return nothing on an authenticated
route; `admin-overview` and `admin-invoice-health` have none because a counter is always
present, zero included. **Nothing omits the error rung** — a failed read that renders as an
empty state tells the customer something false about their billing.

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

### `usage-summary` — _lives in `usage/`; blueprinted here because `/dashboard` composes it first_

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
`Skeleton`, `EmptyState`, `ErrorState`.
**Notes:** delegates every fact to `SubscriptionFacts` so the dashboard tile and
`/subscription` cannot disagree about how a plan is described.

### `next-invoice`

**One job:** state what is owed and when.
**Data:** `useCurrentSubscription` + `useUpcomingInvoice`. **Composes:** `SectionCard`,
`DetailRow`, `Money`, `Skeleton`, `EmptyState`, `ErrorState`.
**States:** either query failing renders `ErrorState`. Without that rung a failed estimate
renders _"Nothing due yet"_, which states a fact the system does not have.
**Notes:** the estimate is a projection, not an issued invoice — label it as such. Amounts
render through `Money`, never a hand-formatted string.

### `recent-invoices`

**One job:** the five most recent invoices as a glance, not a manager.
**Data:** `useInvoices`. **Composes:** `SectionCard`, `InvoiceTable`, `Skeleton`, `EmptyState`,
`ErrorState`.
**Notes:** truncates to five and links to `/invoices`; it owns no filtering or sorting, because
that is `invoice-list`'s job.

---

## `usage/` — 7 sections

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
**Data:** `useUsageHistory`, and `useCurrentSubscription` for the plan's limits.
**Composes:** `SectionCard`, `usage-trend-chart` × 3, `DataTable` inside a `<details>`,
`Skeleton`, `EmptyState`, `ErrorState`.
**Notes:** **small multiples, never one shared chart** — calls run to 500,000 and seats to 10,
so a shared axis flattens seats to nothing and a dual axis invents a correlation. The table is
the chart's table-view twin, kept as a native disclosure so every value is reachable without
hovering and with no script. A metric with no history draws no chart rather than an empty one.

### `usage-trend-chart`

**One job:** one metric's consumption per billing period, against its limit.
**Data:** none — props (`points`, `limit`, `unit`). **Composes:** `trend-axes`, `trend-limit`,
`trend-tooltip`.
**Notes:** inline SVG with no charting library. One series, so no legend; the caption names it.
Columns are capped at 24 units with rounded data-ends; only the **latest** value is labelled.
**`limit` is three-state:** a number draws the rule, `null` says "unlimited on your plan", and
`undefined` — the plan still loading — says nothing, because claiming "unlimited" before the
plan arrives would be false. Every column carries a full-band hit target that is focusable and
announces its value, so keyboard and pointer get the same readout. Scales step in 1·2·5 with a
minimum step of 1, since every metric is a whole number. The series colour is
`--colors-chart-series`, a validated sibling of the brand accent: the accent itself fails as a
data mark (too dark and too grey in light mode).

### `trend-axes`

**One job:** gridlines, value ticks and period labels. **Data:** none — props.
**Notes:** gridlines are solid hairlines; dashing is reserved for the limit, which is a
threshold. Period labels thin to about six and always keep the latest.

### `trend-limit`

**One job:** the plan limit as a dashed rule, and its label when there is room.
**Data:** none — props.
**Notes:** the label is **placed by measurement, not by default**: right-hand if the columns
beneath that span sit well clear of the rule, else left-hand, else omitted — the caption
already states the limit, so dropping the in-plot label loses nothing. A fixed placement put
"Limit 500K" on top of the latest value label, and on top of the column itself in any month
billed for overage.

### `trend-tooltip`

**One job:** the hover and focus readout. **Data:** none — props.
**Notes:** the value leads and the period follows. It enhances and never gates: everything it
shows is also in the table.

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
active, pending or suspended. If the subscription list fails, accounts still render with the
plan columns empty and a notice, rather than one failure erasing the whole screen.

**`account-status-button`** confirms before it changes anything, and sends **only**
`{ status }`. It renders no control on the viewer's own row — the backend refuses that change
anyway, so offering it would be a button guaranteed to fail. It is `quiet`, not `danger`: a
column of red buttons down a customer list is noise, and the destructive weight belongs in the
confirmation, which says plainly that history is kept.

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
renders as a `cycle-run-report` per half (renewal, overdue sweep) so an operator can see what
moved. The jobs are idempotent server-side, so the confirm step is about intent, not safety.

**`admin-plan-edit`** is the catalogue's edit half, and the reason
[E5](01-information-architecture.md#e5--administer-the-catalog-billing-admin) reads as
delivered rather than as a promise. It renders as a dialog over `admin-plan-list`, is mounted
only while a row is selected and keyed by plan id, so its fields seed from props and need no
reset effect — the same pattern as `profile-fields`. It closes on Escape and moves focus to
the panel. **It does not confirm**, because editing a plan is reversible and
[does not cascade](02-page-blueprints.md#admin) to the subscriptions referencing it; the
irreversible neighbours (deactivate, delete) do.

**`plan-metric-fields`** is the six limit and overage-rate inputs, extracted because
`admin-plan-form` and `admin-plan-edit` must offer identical fields — an edit form that
described a limit differently from the create form would be a drift bug with a customer's
money on the other end. Pure; the draft-to-payload conversion lives in
[`lib/utils/plan-draft.ts`](../../lib/utils/plan-draft.ts).

**`cycle-run-report`** renders one half of a cycle run (renewal, overdue sweep) so an operator
can see what moved. Pure, and composed twice by `admin-cycle-controls`.

**`issue-invoice-button`** owns its own mutation per row rather than lifting state into the
table, which keeps `admin-subscription-list`'s columns a module constant.

**`admin-overdue-invoices`** is reused on `/admin` and `/admin/invoices` — the ops overview and
the invoice screen show the same queue rather than two queries that can disagree.

---

## `landing/` — 2 sections

The **only** sections permitted the editorial register; every other section is bound by
`starter/application-register-density`.

- **`landing-hero`** — value proposition and the call to action into `/auth/register`. No data.
- **`landing-plans`** — public plan preview. `usePlans`; composes `PlanFeatureList` and `Money`.
  Skeleton while loading; **no empty state** — a catalogue with no plans is a deployment fault,
  not a user-facing condition, and must not render an empty marketing page. **A failed request
  is not an empty catalogue**: the section keeps its heading and renders `ErrorState` with a
  retry, so a visitor sees that pricing exists and failed to load rather than a page without it.

---

## Reuse graph

Twenty edges between sections. Every edge exists to stop two surfaces describing the same
record differently, or to keep a component under the 150-line ceiling by one job apiece.

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
admin-plan-list ────────→ admin-plan-edit ──→ plan-metric-fields
admin-plan-form ────────→ plan-metric-fields     create form = edit form
admin-cycle-controls ───→ cycle-run-report       composed twice, once per half
admin-subscription-list → issue-invoice-button   one mutation per row
admin-user-list ────────→ account-status-button  one mutation per row
usage-history ──────────→ usage-trend-chart      composed once per metric
usage-trend-chart ──────→ trend-axes
usage-trend-chart ──────→ trend-limit
usage-trend-chart ──────→ trend-tooltip
```

**A section imported by two others is a shared description and must stay pure.** If one of
`subscription-facts`, `invoice-table`, `plan-feature-list`, `meter-row`, `payment-method-row`
or `plan-metric-fields` grows a hook, the two surfaces above it start fetching independently and are free to disagree —
which is the drift this layer exists to prevent.
