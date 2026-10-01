# Phase 5 — Section Blueprints

> Status: settled · regenerated 2026-09-28 under the standing brief's
> [No visual prescription](../MASTER_PROMPT_COMPLETE.md#no-visual-prescription) rule · self-audited
> 2026-09-30 against its [Self-audit before delivery](../MASTER_PROMPT_COMPLETE.md#self-audit-before-delivery).
> Governed by [MASTER_PROMPT_COMPLETE.md](../MASTER_PROMPT_COMPLETE.md#phase-5--section-blueprints).
> References [Phase 1](00-product-definition.md), [Phases 2–3](01-information-architecture.md)
> and [Phase 4](02-page-blueprints.md). Governs
> [`components/sections/`](../../components/sections/). Next in phase order:
> [Phase 6](07-component-library.md).

Sections are the layer between a route and the component library. **A route file is forbidden
from declaring components or fetching data** (`starter/page-composes-only`), so page
composition has nowhere to live except here. The lint rule and this layer are the same decision
expressed twice.

Each blueprint describes a section's job and behaviour. **None of them specifies what the
section shows, which components or controls it uses, layout, order on screen, sizing, imagery
or animation** — those are decided when the page is built, with the owner. Section names are
code identifiers; a name such as `plan-card` or `issue-invoice-button` records the file, not a
presentation.

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
write confirms first, per the [confirmation contract](07-component-library.md#confirmdialog) —
principle 3, non-negotiable.

**States — the standard ladder.** Every data section resolves in this order, and skipping a
rung is a defect:

1. `isPending` → loading, announced to assistive technology
2. `isError` → the user is told what failed (the `ApiError` message) and can retry
3. no data → the user is told what is missing and why, and offered the single step that
   resolves it
4. success

**Four sections omit a rung for a stated reason.** They are exceptions, not oversights, and
are listed here so an audit does not re-raise them: `invoice-detail` has no empty state
because a `403` must be reported as an error and never as an empty invoice; `profile-form` and
`account-details` have none because `GET /users/me` cannot return nothing on an authenticated
route; `admin-overview` and `admin-invoice-health` have none because a counter is always
present, zero included. **Nothing omits the error rung** — a failed read reported as empty
tells the customer something false about their billing.

**Accessibility requirements.** Inherited from the [interaction contracts](07-component-library.md)
a section relies on; a section adds no bare interactive element of its own. Status is always a
word, never colour alone. `prefers-reduced-motion` is honoured globally.

**Device needs.** Every section stays fully operable from phone width up and loses no
information or action on a small screen. How it adapts is a build decision.

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

Composed into [`/auth/*`](02-page-blueprints.md#authentication). All four are credential
forms: nothing is read, so there is no loading or empty rung, and errors arise at submit only.

| Section                | Purpose (one job)                  | Data requirements (mutation) |
| ---------------------- | ---------------------------------- | ---------------------------- |
| `login-form`           | Exchange credentials for a session | `useLogin`                   |
| `register-form`        | Create an account                  | `useRegister`                |
| `forgot-password-form` | Request a reset link               | `useForgotPassword`          |
| `reset-password-form`  | Complete a reset from a token      | `useResetPassword`           |

**Error states.** Error is the only non-success state. **Failure must never clear the typed
values** (E1's recovery path). Input is validated against the Zod schemas in
[`lib/validations/`](../../lib/validations/).

**Responsibilities.** `forgot-password-form` tells the user the same non-committal thing
whether or not the email exists, so it cannot be used to discover accounts.

**Technical notes.** On success the session cookie is set by the backend and the form
redirects; the client stores nothing. `reset-password-form` reads its token from a URL search
param, which is why the route wraps it in `Suspense`.

---

## `dashboard/` — 3 sections

Composed into [`/dashboard`](02-page-blueprints.md#dashboard--customer-overview) with
`usage-summary`. Priority, not placement: **usage answers first because E2 is the loop the
product lives on.**

### `usage-summary` — _lives in `usage/`; blueprinted here because `/dashboard` depends on it first_

**Purpose:** answer _am I within my limits_ before anything else.
**Data requirements:** `useCurrentSubscription`, then
`useCurrentUsage(enabled: Boolean(subscription.data))` — usage is not fetched until a
subscription is known to exist, so an unsubscribed visitor makes one request, not two.
**Empty state:** the user is told they do not have a plan yet and offered one step: choosing a
plan at `/plans`. This is E1's entry point and the most important empty state in the product.
**Reuse potential:** the only section composed into two different routes; reuses `meter-row`.

### `plan-summary`

**Purpose:** state the current plan and its billing period.
**Data requirements:** `useCurrentSubscription`.
**Empty state:** the user is told they have no plan and offered the way to `/plans`.
**Reuse potential:** delegates every fact to the `subscription-facts` section so the dashboard
summary and `/subscription` cannot disagree about how a plan is described.

### `next-invoice`

**Purpose:** state what is owed and when.
**Data requirements:** `useCurrentSubscription` + `useUpcomingInvoice`.
**Error states:** either query failing is reported as an error. Without that rung a failed
estimate would tell the user _"Nothing due yet"_, which states a fact the system does not have.
**Responsibilities:** the estimate is a projection, not an issued invoice — the user is told so.
Amounts follow the [money contract](07-component-library.md#money), never a hand-formatted
string.

### `recent-invoices`

**Purpose:** the five most recent invoices as a glance, not a manager.
**Data requirements:** `useInvoices`.
**Responsibilities:** limited to the five most recent, with the full list reachable at
`/invoices`; it owns no filtering or sorting, because that is `invoice-list`'s job.
**Reuse potential:** reuses `invoice-table`.

---

## `usage/` — 7 sections

`usage-summary` (blueprinted with [`dashboard/`](#dashboard--3-sections)) plus the six below.

### `meter-row` — the hero interaction

**Purpose:** one usage reading per metered dimension — `API_CALLS`, `STORAGE_GB`, `SEATS`.
**Data requirements:** none. Pure — takes `limits` and `usage` as props from `usage-summary`.
**Technical notes:** presentational by design, so the core interaction can be reused anywhere
without dragging a fetch behind it. **A missing `UsageLog` for the period is zero consumed, not
an error** — an absent row is the normal state at the start of a period. A `null` limit is
unlimited, not zero.

### `usage-history`

**Purpose:** the per-metric ledger over time.
**Data requirements:** `useUsageHistory`, and `useCurrentSubscription` for the plan's limits.
**Responsibilities:** **each metric stands on its own scale, never shared** — calls run to
500,000 and seats to 10, so a shared scale erases seats and a dual scale invents a
correlation. Every value is also available as text, reachable without hovering and with no
script. A metric with no history is left out rather than reported as an empty history.
**Reuse potential:** reuses `usage-trend-chart` once per metric.

### `usage-trend-chart`

**Purpose:** one metric's consumption per billing period, against its limit.
**Data requirements:** none — props (`points`, `limit`, `unit`).
**Responsibilities:** one metric only, identified by name. The **latest** value is stated.
Values are whole numbers, so the scale never reports fractional units.
**`limit` is three-state:** a number gives the limit as a reference, `null` tells the user it is
"unlimited on your plan", and `undefined` — the plan still loading — says nothing, because
claiming "unlimited" before the plan arrives would be false.
**Accessibility requirements:** every period is focusable and announces its value, so keyboard
and pointer get the same readout.
**Reuse potential:** reuses `trend-axes`, `trend-limit` and `trend-tooltip`.
**Technical notes:** built without a charting library (see
[Deviations](../MASTER_PROMPT_COMPLETE.md#deviations-recorded)).

### `trend-axes`

**Purpose:** make each period and the range of values identifiable. **Data requirements:**
none — props.
**Responsibilities:** the latest period is always identified.

### `trend-limit`

**Purpose:** relate each period's value to the plan limit. **Data requirements:** none — props.
**Responsibilities:** the limit is always stated in text, so any further limit label is
supplementary. **It is dropped rather than allowed to obscure a value** — an earlier fixed
label covered the latest value, and in any month billed for overage would have covered the data
itself ([recorded in QA](04-roadmap-and-qa.md#found-in-the-deferred-pass)).

### `trend-tooltip`

**Purpose:** the per-period readout on hover and focus. **Data requirements:** none — props.
**Responsibilities:** the readout states the value first, then the period. It enhances and
never gates: everything it reports is also available as text.

---

## `plans/` — 3 sections

### `plan-catalog`

**Purpose:** compare tiers and commit to one — the `DOMAIN_TRANSACTION`.
**Data requirements:** `usePlans`, `useCurrentSubscription`; mutations `useSelectPlan` and
`useChangePlan`.
**Interaction model:** the user **selects** when unsubscribed and **changes** when subscribed —
one catalogue, two verbs, chosen from subscription state rather than by duplicating the route.
A plan change is a billing-state mutation and therefore confirms.
**Responsibilities:** the user is told which plan is current and cannot choose it again;
inactive plans are not offered.
**Error states:** a `409` (plan deactivated between render and submit) re-fetches and tells the
user that plan is unavailable **without discarding the rest of the selection** — E1's failure
path.
**Reuse potential:** reuses `plan-card`.

### `plan-card`

**Purpose:** present one plan as a comparable unit.
**Data requirements:** none — props only.
**Responsibilities:** states **limits, not only price** — E1's decision point is what you are
allowed, not what it costs. Amounts follow the [money contract](07-component-library.md#money).
**Reuse potential:** reuses `plan-feature-list`.

### `plan-feature-list`

**Purpose:** state each of a plan's limits in plain language.
**Data requirements:** none. **Reuse potential:** shared with `landing-plans`, so the public
preview and the authenticated catalogue describe a plan identically. A metric absent from
`limits` reads as unlimited.

---

## `subscription/` — 4 sections

Four files, not one — the clearest instance of [the one-job rule](#the-one-job-rule).

| Section                | Purpose (one job)                                      | Data requirements                                    |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| `subscription-detail`  | Own the current subscription's read and its states     | `useCurrentSubscription`                             |
| `subscription-facts`   | Describe a subscription (pure)                         | none — props                                         |
| `subscription-actions` | Cancel and reactivate                                  | `useCancelSubscription`, `useReactivateSubscription` |
| `subscription-history` | Past subscription records                              | `useSubscriptionHistory`                             |

**`subscription-facts`** is **reused by `plan-summary`**. Periods always state both endpoints
and status always reads as a word — principle 2, made structural by the
[period](07-component-library.md#periodrange) and [status](07-component-library.md#statuspill)
contracts.

**`subscription-actions`** is the danger zone. Both actions confirm first; the cancel
confirmation must tell the user that cancelling is reversible while the record exists. On
success it invalidates the subscription, usage **and** invoice query keys together, because the
backend changes all three in one transaction.

**`subscription-history`** was constrained by a schema finding: `@@unique([userId, status])`
allowed one record per status, ever, so history stayed thin. The partial unique index that
replaced it lifts that limit — tracked in
[the billing cycle plan](05-billing-cycle-plan.md#f2--uniqueuserid-status-makes-billing-history-impossible).

---

## `invoices/` — 3 sections

### `invoice-list`

**Purpose:** find an invoice.
**Data requirements:** `useInvoices`.
**Responsibilities:** narrowing by status, and ordering newest first.
**Reuse potential:** delegates describing each invoice to `invoice-table`.

### `invoice-table` — pure

**Purpose:** describe invoices identically everywhere, each leading to its own detail.
**Data requirements:** none. Every invoice is stated with both period endpoints, its amount and
its status as a word (principle 2).
**Reuse potential:** `invoice-list` **and** `recent-invoices`. Extracting it is what stops the
dashboard's five invoices and the full list from drifting apart.
**Accessibility requirements:** every invoice must be openable from the keyboard. **Known gap:**
today an invoice opens on pointer click only; there is no keyboard route to the detail. See the
[recorded contract gap](07-component-library.md#datatable).

### `invoice-detail`

**Purpose:** one invoice in full, and marking it paid.
**Data requirements:** `useInvoice`, `useMarkInvoicePaid`.
**Technical notes:** an invoice id is a URL parameter, so **ownership is enforced by the
backend**, not by this section — an IDOR here was
[found by running it](04-roadmap-and-qa.md#found-by-actually-running-it), not by reading it. A
`403` or `404` is reported as an error, never as an empty invoice.

---

## `settings/` — 5 sections

| Section              | Purpose (one job)                           | Data requirements                                                           |
| -------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| `profile-form`       | Own profile editing's read and its states   | `useCurrentUser`                                                            |
| `profile-fields`     | Edit and submit profile changes             | `useUpdateAccount`                                                          |
| `account-details`    | Read-only account facts                     | `useCurrentUser`                                                            |
| `payment-methods`    | List, default, remove                       | `usePaymentMethods`, `useSetDefaultPaymentMethod`, `useRemovePaymentMethod` |
| `payment-method-row` | Describe one payment method (pure)          | none — props                                                                |

**The form/fields split** separates fetching and state from editing and submitting, keeping
both under the line ceiling and letting the editing half be reused wherever profile editing is
needed.

**`payment-methods`** confirms before removal. **Meter stores Stripe tokens and never charges
them** — no PAN, no CVC, no expiry ever enters this app; `payment-method-row` states brand and
last-four only. **Adding a payment method is not offered**, deliberately: the empty state tells
the user why until Stripe is integrated
([Phase D](05-billing-cycle-plan.md#phase-d--payment-methods)).

**Password and email changes are separate submissions** from profile fields — an account
identity change is not a profile edit and must not ride along in the same PATCH.

---

## `admin/` — 13 sections

Reachable only after [`proxy.ts`](../../proxy.ts) has verified an `ADMIN` claim
server-side. **No section performs an authorisation check** — by the time one renders,
authorisation has already happened twice (the proxy, then the backend's `RolesGuard`).

| Section                   | Purpose (one job)                                | Data requirements                                                 |
| ------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| `admin-overview`          | Platform health at a glance                      | `useAdminStats`, `useBillingStats`                                |
| `admin-invoice-health`    | Invoice health counters                          | `useInvoiceStats`                                                 |
| `admin-overdue-invoices`  | The overdue queue — the ops worklist             | `useOverdueInvoices`                                              |
| `admin-plan-list`         | The catalogue, with lifecycle                    | `usePlans`, `useSetPlanActive`, `useDeletePlan`                   |
| `admin-plan-form`         | Create a plan                                    | `useCreatePlan`                                                   |
| `admin-subscription-list` | Subscription oversight, narrowable by status     | `useAdminSubscriptions`                                           |
| `admin-cycle-controls`    | Run the billing cycle by hand                    | `useRunCycle`, `useRenewSubscriptions`, `useSweepOverdueInvoices` |
| `admin-plan-edit`         | Change an existing plan                          | `useUpdatePlan`                                                   |
| `cycle-run-report`        | Report one cycle half (pure)                     | none — props                                                      |
| `issue-invoice-button`    | Issue one subscription's invoice                 | `useIssueInvoice`                                                 |
| `plan-metric-fields`      | Capture per-metric limits and overage rates      | none — props                                                      |
| `admin-user-list`         | Find a customer and see their state              | `useAdminUsers`, `useAdminSubscriptions`, `useCurrentUser`        |
| `account-status-button`   | Suspend or restore one account                   | `useSetAccountStatus`                                             |

**`admin-user-list`** answers "who is this, and can they get in?" — the [E7](01-information-architecture.md#e7--look-up-and-act-on-a-customer-internal-ops-support)
journey. It joins each account to its most relevant subscription client-side (live before past
due before suspended before canceled, then newest), so a customer who cancelled last month and
resubscribed is reported on the live plan. Operators search by name or email and narrow by
account status (active, pending, suspended). If the subscription list fails, accounts are still
listed without plan details and the operator is told why, rather than one failure erasing the
whole route.

**`account-status-button`** confirms before it changes anything, and sends **only**
`{ status }`. It offers no action on the viewer's own account — the backend refuses that change
anyway, so offering it would be an action guaranteed to fail. **The weight of the decision
lives in the confirmation**, which says plainly that history is kept; the action itself is not
treated as destructive.

**`DELETE /users/:id` is deliberately not wired.** It cascades to subscriptions and invoices,
destroying billing history along with the account. Suspension is the reversible answer.

**`admin-plan-list`** carries the catalogue's two lifecycle rules, both of which are business
rules before they are UI: **deactivating a plan must not cascade** to the subscriptions
referencing it, and **deletion double-confirms** because a plan with history should be
deactivated instead. Both confirm first.

**`admin-cycle-controls`** is the console's only platform-mutating section. It exists because
the cycle endpoints were reachable only by `curl` — the manual trigger built in
[Phase B4](05-billing-cycle-plan.md#phase-b--invoice-generation) had no operator. Each of the
three actions tells the operator what it will change and confirms before running, and the
result is reported per half (renewal, overdue sweep) through `cycle-run-report`, so an operator
can see what moved. The jobs are idempotent server-side, so the confirm step is about intent,
not safety.

**`admin-plan-edit`** is the catalogue's edit half, and the reason
[E5](01-information-architecture.md#e5--administer-the-catalog-billing-admin) reads as
delivered rather than as a promise. It is opened for one plan of `admin-plan-list`, mounted
only while a plan is selected and keyed by plan id, so its values seed from props and need no
reset effect — the same pattern as `profile-fields`. **Accessibility requirements:** Escape
closes it; focus moves into it on open and returns to what opened it on close (shared
`use-modal-focus`). **It does not confirm**, because editing a plan is reversible and
[does not cascade](02-page-blueprints.md#admin) to the subscriptions referencing it; the
irreversible neighbours (deactivate, delete) do.

**`plan-metric-fields`** captures a limit and an overage rate for each of the three metrics,
extracted because `admin-plan-form` and `admin-plan-edit` must ask for exactly the same values —
an edit that described a limit differently from creation would be a drift bug with a customer's
money on the other end. Pure; the draft-to-payload conversion lives in
[`lib/utils/plan-draft.ts`](../../lib/utils/plan-draft.ts).

**`cycle-run-report`** reports one half of a cycle run (renewal, overdue sweep) so an operator
can see what moved. Pure, and composed twice by `admin-cycle-controls`. It reads the shape the
contract guarantees; a malformed response is caught by the route's error boundary.

**`issue-invoice-button`** owns its own mutation per subscription rather than lifting state into
`admin-subscription-list`, which keeps that section's column definitions a module constant.

**`admin-overdue-invoices`** is reused on `/admin` and `/admin/invoices` — the ops overview and
the invoice route report the same queue rather than two queries that can disagree.

---

## `landing/` — 2 sections

The only sections whose job is the first impression
([principle 4](00-product-definition.md#product-principles)).

- **`landing-hero`** — tell a visitor what Meter does and lead them to `/auth/register`. No data.
- **`landing-plans`** — public plan preview. `usePlans`; reuses `plan-feature-list`, and amounts
  follow the [money contract](07-component-library.md#money). Loading while plans load; **no
  empty state** — a catalogue with no plans is a deployment fault, not a user-facing condition,
  and must not produce an empty marketing page. **A failed request is not an empty
  catalogue**: the visitor is told that pricing exists and failed to load, and can retry, rather
  than pricing silently disappearing.

---

## Reuse graph

Twenty edges between sections. Every edge exists to stop two surfaces describing the same
record differently, or to keep a component under the 150-line ceiling by one job apiece.

| Section                   | Reuses section          | Why                                        |
| ------------------------- | ----------------------- | ------------------------------------------ |
| `usage-summary`           | `meter-row`             | The core usage readout, on two routes      |
| `plan-summary`            | `subscription-facts`    | Dashboard summary = `/subscription`        |
| `subscription-detail`     | `subscription-facts`    |                                            |
| `recent-invoices`         | `invoice-table`         | Dashboard invoices = `/invoices`           |
| `invoice-list`            | `invoice-table`         |                                            |
| `plan-catalog`            | `plan-card`             |                                            |
| `plan-card`               | `plan-feature-list`     |                                            |
| `landing-plans`           | `plan-feature-list`     | Public preview = authenticated catalogue   |
| `payment-methods`         | `payment-method-row`    |                                            |
| `profile-form`            | `profile-fields`        |                                            |
| `admin-plan-list`         | `admin-plan-edit`       |                                            |
| `admin-plan-edit`         | `plan-metric-fields`    |                                            |
| `admin-plan-form`         | `plan-metric-fields`    | Create = edit                              |
| `admin-cycle-controls`    | `cycle-run-report`      | Composed twice, once per half              |
| `admin-subscription-list` | `issue-invoice-button`  | One mutation per subscription              |
| `admin-user-list`         | `account-status-button` | One mutation per account                   |
| `usage-history`           | `usage-trend-chart`     | Composed once per metric                   |
| `usage-trend-chart`       | `trend-axes`            |                                            |
| `usage-trend-chart`       | `trend-limit`           |                                            |
| `usage-trend-chart`       | `trend-tooltip`         |                                            |

**A section imported by two others is a shared description and must stay pure.** If one of
`subscription-facts`, `invoice-table`, `plan-feature-list`, `meter-row`, `payment-method-row`
or `plan-metric-fields` grows a hook, the two surfaces that reuse it start fetching
independently and are free to disagree — which is the drift this layer exists to prevent.

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

**2026-09-30 self-audit.** No section, state, rule, known gap or reuse edge was removed.

- Every **Composes** line and the `auth/` table's **Composes** column were removed — they named
  the components a section is built from (`SectionCard`, `DetailRow`, `Money`, `PeriodRange`,
  `StatusPill`, `DataTable`, `PlanCard`, `UsageMeter`, `Skeleton`, `EmptyState`, `ErrorState`,
  `LinkButton`, `ConfirmDialog`, `FormField`, a `<details>` disclosure). Section-to-section
  reuse from those lines moved to **Reuse potential**; the reuse graph's column is now
  "Reuses section".
- Fields not defined for Phase 5 were mapped onto the brief's: **One job** → Purpose, **Data** →
  Data requirements, **Content rule(s)** → Responsibilities, **Composes**/**Reuse** → Reuse
  potential, **Keyboard & ARIA** → Accessibility requirements, **Notes**/**Permissions** →
  Technical notes, **Interaction** → Interaction model. **Motion** folded into accessibility
  (reduced motion honoured); the `MotionWrapper` entry point is recorded in
  [Phase 6](07-component-library.md#providers--wrappers--2-components).
- Screen content became behaviour: empty-state copy and button labels (_Choose a plan_,
  _Browse plans_), "renders `ErrorState`", "keeps its heading", "caption", "legend",
  "in-chart label", "value scale and period labels", "rows", "fields", "inputs", "modal dialog
  opened from a row", "container", "the hero".
- Kept as genuine requirements, relocated: the invoice keyboard-access gap (Accessibility
  requirements); the `admin-plan-edit` Escape/focus behaviour (Accessibility requirements);
  the invoice ownership rule (Technical notes). Auth input validation against
  `lib/validations/` (from the `FormField` contract) is now stated under the auth Error states.
