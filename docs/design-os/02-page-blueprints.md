# Phase 4 — Page Blueprints

> Status: settled · regenerated 2026-09-28 under the standing brief's
> [No visual prescription](../MASTER_PROMPT_COMPLETE.md#no-visual-prescription) rule · self-audited
> 2026-09-30 against its [Self-audit before delivery](../MASTER_PROMPT_COMPLETE.md#self-audit-before-delivery).
> Governed by [MASTER_PROMPT_COMPLETE.md](../MASTER_PROMPT_COMPLETE.md#phase-4--page-blueprints).
> References [Phase 1](00-product-definition.md) and [Phases 2–3](01-information-architecture.md).
> Governs [`app/`](../../app/). Next in phase order: [Phase 5](06-section-blueprints.md)
> (sections), then [Phase 6](07-component-library.md) (interaction contracts).

**19 surfaces** — 17 routes plus `not-found` and `error`. Each blueprint states what the user
comes to get done and how the page behaves, in priority order. **What a page contains, how it
looks, and where anything sits on it, is decided when it is built, with the owner** — see the
[Visual Design Hand-off](../MASTER_PROMPT_COMPLETE.md#106--implementation_promptmd--superseded).

---

## Contents

- [The page contract](#the-page-contract)
- [Public](#public) · [Authentication](#authentication) · [Customer](#customer) ·
  [Admin](#admin) · [Fallbacks](#fallbacks)
- [Routes deliberately not built](#routes-deliberately-not-built)

---

## The page contract

Stated once. A blueprint below states only what distinguishes it.

**Composition.** A route file **composes and nothing else** — no inline components, no data
fetching (`starter/page-composes-only`). It imports sections. This is why every page below names
the sections it depends on rather than what it contains.

**Task priority.** Where a blueprint lists primary tasks in priority order, the order is what
the user needs answered first. It is not an order on screen; that is a build decision.

**The four designed states** are mandatory on every data surface and are owned by the sections,
not the route: **loading** (announced to assistive technology) · **empty** (the user is told
what is missing and why, and offered the one next step that resolves it) · **error** (the user
is told what failed, in the `ApiError` message, and can retry) · **success**. A blueprint that
omits its empty state is incomplete, not concise.

**Permissions.** Enforced **server-side before render** by
[`proxy.ts`](../../proxy.ts), and independently again by the backend's `JwtAuthGuard`
and `RolesGuard`. No route gates itself on the client. Unauthenticated visitors are sent to
`/auth/login?next=<path>`; non-admins never reach `/admin/*`; signed-in visitors are bounced
out of `/auth/*`.

**Device needs.** Every customer and admin surface stays fully operable from phone width up:
navigation, usage readings, the plan catalogue and every list of records lose no information
and no action on a small screen. How each adapts is a build decision.

**Repeat visit.** Every console route is built for the operator who returns daily — finding
and acting over first impression ([principle 4](00-product-definition.md#product-principles)).
**`/` is the single exception.**

**Dependencies.** Every authenticated route depends on `GET /users/me` — the signed-in user and
their role — through the `(app)` route group's layout.

---

## Public

### `/` — Landing

**Purpose:** convert an unauthenticated visitor. **Business objective:** registrations.
**User objective:** decide whether this product meters what they need.
**Primary tasks:** understand what Meter does → see what each plan costs and allows → create an
account.
**Required data:** `GET /billing/plans`.
**Permissions:** public — the only route outside the `(app)` group and outside auth.
**Dependencies:** sections `landing-hero` · `landing-plans`; registration continues at
`/auth/register`.
**States:** loading while plans load; **no empty state** — a catalogue with no plans is a
deployment fault, not a user-facing condition. A failed request tells the visitor that pricing
exists and failed to load, and lets them retry.
**Implementation note:** the **only** route whose job is the first impression
([principle 4](00-product-definition.md#product-principles)). Its look is decided with the owner
at build time, like every other page's.

---

## Authentication

Four routes, one shape: each composes a single form section. Wrapped in `Suspense` because the
forms read search params.

| Route                   | Primary task                         | Depends on section     | Endpoint                     |
| ----------------------- | ------------------------------------ | ---------------------- | ---------------------------- |
| `/auth/login`           | Get into my account                  | `login-form`           | `POST /auth/login`           |
| `/auth/register`        | Open an account                      | `register-form`        | `POST /auth/register`        |
| `/auth/forgot-password` | Get back in when I forgot a password | `forgot-password-form` | `POST /auth/forgot-password` |
| `/auth/reset-password`  | Choose a new password                | `reset-password-form`  | `POST /auth/reset-password`  |

**Permissions:** public, but **signed-in visitors are redirected away** — a logged-in user
landing on `/auth/login` is a navigation bug, not a sign-out affordance.
**States:** error only; nothing is read, so there is no loading or empty rung.
**Failure must never clear typed values.**
**Success:** the backend sets the httpOnly session cookie and the route redirects to `next` or
`/dashboard`. **The client stores nothing.** On `forgot-password`, the user is told the same
non-committal thing whether or not the email exists — it must never reveal which accounts
exist.
**Dependency:** password reset is delivered end to end — the backend emails the link through
`SmtpResetDelivery` when `SMTP_HOST` is set, and logs it otherwise, so an unconfigured
environment still boots. See [Phase E](05-billing-cycle-plan.md#phase-e--password-reset).

---

## Customer

### `/dashboard` — Customer overview

**Purpose:** answer _am I covered, what do I owe_ in one glance.
**Business objective:** retention through the E2 loop. **User objective:** resolve limit
anxiety in one glance.
**Primary tasks, in priority order — the priority is the blueprint:** know whether I am within
my limits on each metric · confirm which plan I am on and its current period · know what I will
owe next and when · check what I have been billed recently.
**Required data:** `GET /subscriptions/current` · `GET /usage/current` ·
`GET /invoices/upcoming/estimate` · `GET /invoices`.
**Dependencies:** sections `usage-summary` · `plan-summary` · `next-invoice` ·
`recent-invoices`.
**Empty:** no subscription → the user is told they have no plan yet and offered one next step:
choosing a plan at `/plans`. **They are not given empty usage, plan or invoice answers** — an
unsubscribed user is offered one decision, not four empty ones.
**Implementation note:** **usage is the first priority because E2 is the loop the product lives
or dies on.** Weigh any change to this priority against that.

### `/plans` — Plan catalogue

**Purpose:** compare and commit — the `DOMAIN_TRANSACTION`.
**Primary tasks:** find the plan whose limits and price fit how I use the product, and move onto
it — whether I have no plan yet or am changing the one I have.
**Required data:** `GET /billing/plans`, `GET /subscriptions/current`;
`POST /subscriptions/select-plan` when unsubscribed, `POST /subscriptions/change-plan` when
subscribed. **Dependencies:** section `plan-catalog`.
**Implementation notes:** **the user is told whether they are choosing a first plan or changing
plan**, decided by subscription state. A change is a billing-state mutation and confirms first
(principle 3). The user is told which plan they are already on and cannot choose it again;
inactive plans are not offered.
**Error:** `409` (plan deactivated between render and submit) → re-fetch, tell the user that
plan is no longer available, **keep the rest selectable**.

### `/subscription` — Current subscription

**Primary tasks:** see what I am subscribed to and what I had before · cancel · undo a
cancellation.
**Required data:** `GET /subscriptions/current`, `GET /subscriptions/history`;
`POST /subscriptions/cancel`, `POST /subscriptions/reactivate`.
**Dependencies:** sections `subscription-detail` · `subscription-history` ·
`subscription-actions`.
**Implementation note:** cancelling confirms first, and **the confirmation tells the user that
cancelling is reversible while the record exists.** A successful mutation invalidates the
subscription, usage **and** invoice keys together, because the backend changes all three in one
transaction. History was thin while `@@unique([userId, status])` held; the partial index that
replaced it
([F2](05-billing-cycle-plan.md#f2--uniqueuserid-status-makes-billing-history-impossible))
lets it grow.

### `/usage` — Usage detail

**Primary tasks:** see where I stand on each metric now · see how my use of each metric has
moved across billing periods, and which periods went over the limit.
**Required data:** `GET /usage/current`, `GET /usage/history`, and the current plan's limits
from `GET /subscriptions/current`.
**Dependencies:** sections `usage-summary` (reused from the dashboard) · `usage-history`.
**Implementation notes:** **each metric stands on its own scale.** API calls, storage and seats
differ by five orders of magnitude, so a shared or dual scale would invent a relationship
between them. The current plan's limit is given for each metric, so a period billed for overage
is identifiable as over it. **Every value is also available as text**, reachable without
hovering and without script. Built today as one chart per metric
([Deviations](../MASTER_PROMPT_COMPLETE.md#deviations-recorded)); that is a record of the code,
and the form is a build decision.
`GET /usage/current` returns one shape, `MetricUsage[]`. It once
returned a union of three and was normalised client-side; that was
[collapsed on the backend](05-billing-cycle-plan.md#phase-f--verification) and the normaliser
is gone. A missing log for the period is **zero consumed, not an error**. A `null` limit is
unlimited, not zero.

### `/invoices` and `/invoices/[id]`

**Primary tasks:** find a particular invoice · know what each invoice was for, what it came to,
when it is due and whether it is paid · mark an invoice paid where permitted.
**Required data:** `GET /invoices` (newest first, narrowable by status), `GET /invoices/:id`
(amount, **both** period endpoints, due date, paid date, status),
`POST /invoices/:id/mark-paid`.
**Dependencies:** sections `invoice-list` (`/invoices`) · `invoice-detail` (`/invoices/[id]`).
Every invoice is stated with both period endpoints (principle 2), and every invoice in the list
leads to its detail.
**Permissions — the sharp edge.** An invoice id is a URL parameter, so **ownership is enforced
by the backend**. An IDOR here was
[found by running it](04-roadmap-and-qa.md#found-by-actually-running-it), not by reading or
type-checking it. A `403` or `404` is reported as an error, **never treated as an empty
invoice**.

### `/settings`

**Primary tasks:** keep my profile current · change how I sign in · choose which saved payment
method is my default, and remove one I no longer use.
**Required data:** `GET /users/me`, `GET /billing/payment-methods`, `PATCH /users/:id`; set
default and remove on payment methods.
**Dependencies:** sections `profile-form` · `account-details` · `payment-methods`.
**Implementation notes:** removing a payment method confirms first. **Password and email changes
are separate submissions** from profile fields. Meter **stores Stripe tokens and never charges
them** — brand and last-four only; no PAN, CVC or expiry ever enters this app. **Adding a
payment method is not offered** until Stripe is integrated; the empty state tells the user so
rather than hiding the gap ([Phase D](05-billing-cycle-plan.md#phase-d--payment-methods)).

---

## Admin

Reachable only after the proxy has verified an `ADMIN` claim. **No admin route checks a role
itself.**

| Route                  | Primary task                                                        | Depends on sections                                                  | Required data                                                                      |
| ---------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `/admin`               | Know whether the platform is healthy; run the billing cycle by hand | `admin-overview` · `admin-cycle-controls` · `admin-overdue-invoices` | `GET /admin/stats`, `GET /admin/billing/stats`, `POST .../cycle/*`                 |
| `/admin/plans`         | Keep the plan catalogue right                                       | `admin-plan-list` · `admin-plan-edit` · `admin-plan-form`            | `GET /billing/plans` + create · edit · activate · deactivate · delete              |
| `/admin/users`         | Find a customer and decide whether they can get in                  | `admin-user-list` · `account-status-button`                          | `GET /users`, `GET /admin/billing/subscriptions`, `PATCH /users/:id` (status only) |
| `/admin/subscriptions` | Oversee subscriptions by status; bill one period by hand            | `admin-subscription-list` · `issue-invoice-button`                   | `GET /admin/billing/subscriptions[/status/:status]`, `POST .../issue-invoice`      |
| `/admin/invoices`      | See invoice health and chase what is overdue                        | `admin-invoice-health` · `admin-overdue-invoices`                    | `GET /admin/billing/overdue-invoices`, `GET /admin/billing/invoice-stats`          |

Section names are code identifiers ([Phase 5](06-section-blueprints.md#admin--13-sections)), not
a statement of what the page contains.

**The console is no longer read-only.** `/admin` carries the billing cycle, and
`/admin/subscriptions` can issue a single period's invoice. Both are **write actions behind a
confirm step**, and both are idempotent server-side, so a double click cannot double-bill.

**Implementation notes — catalogue rules, business before UI:** **deactivating a plan must not cascade** to the
subscriptions referencing it, and **deletion double-confirms** — a plan with history should be
deactivated instead. **Editing does not cascade either**: a price or limit change applies to a
subscription when it renews, never retroactively, which is why editing needs no confirm step
while its two neighbours do.
**Implementation note:** `admin-overdue-invoices` is composed on both `/admin` and `/admin/invoices`, so the
two routes cannot report different queues.

---

## Fallbacks

### `not-found` (404)

**Purpose:** a designed dead end. **Primary tasks:** understand that what I asked for is not
here — it may have been removed — and get back to my overview at `/dashboard`.
**No data, and no dependency on the authenticated layout** — it must render when nothing else
can.

### `error`

**Purpose:** the route-level error boundary. The user is told what failed and can retry.
**Implementation note:** it must not assume the authenticated layout mounted or that `GET /users/me`
succeeded — an error boundary that itself depends on a request is not a boundary.

**There is no `500` route.** Next.js App Router handles server faults through `error.tsx` and
`global-error`; a hand-written `/500` would be unreachable. The template listed one; this is the
framework-correct substitution.

---

## Routes deliberately not built

The portable template's page list assumed a marketplace. These have **no persona, flow or
endpoint** behind them in Meter, and are recorded so their absence reads as a decision rather
than an oversight:

Search · `{{CORE_ENTITY}}` List/Map View · Compare · Favourites · Saved items · Messages ·
Notifications · Help Center · `{{DOMAIN_TOOL}}` as a standalone page · 500.

**`{{DOMAIN_TOOL}}` resolved to the usage meter**, which is not a page — it is the core
interaction of `/dashboard` and `/usage`. **Adding any of the above requires an
[experience map](01-information-architecture.md) first**, per the Phase 2 rule that a new flow
gets a map before it gets a route.

---

## Changed in the 2026-09-28 regeneration

No route, section or state was removed. Dropped as visual prescription: "above the fold" and
"modules in order" on `/dashboard` (now content in priority order); the "editorial register" of
`/` and its `text-h4` / density rule for every other route (now principle 4); responsive
behaviour "named in `styles/components.css`" (now the device need); loading as "skeleton, never a
spinner-only screen"; the usage chart's column form and dashed limit rule (now: limit shown as a
reference, every value also text); `not-found` rendering "in `.auth-shell` with `.empty-state`";
plan "cards" and "tiles" in behaviour rules. Added: the non-committal forgot-password rule, the
no-add-card rule, and `404` alongside `403` on invoice detail, each already recorded in
[05](05-billing-cycle-plan.md) or [04](04-roadmap-and-qa.md).

**2026-09-30 self-audit.** No route, section, state or rule was removed. Screen content was
rewritten as user goals and behaviour: the **Actions** fields (`/`, `/plans`, `/subscription`,
`/settings`) and the dashboard's **Content, in priority order** became **Primary tasks** (the
dashboard's in the same priority), with their endpoints moved to **Required data** and the
cancel-copy, confirm and no-add-card rules to **Implementation notes**; `not-found`'s
**Content** inventory (code, title, removal line, link back) became a primary task; the invoice
list's per-row field list and the detail's field list became **Required data**;
**Sections** became **Dependencies**; the forgot-password **Content rule** moved to
**Success**; the **Failure path** on `/plans` became **Error**. Removed as component or
placement naming: `ErrorState`, `Skeleton`, `AuthCard` supplying the `<h1>`, `LinkButton`,
`AppShell` as a dependency (now `GET /users/me`), "the shell", "the tables", "keeps the pricing
heading", "the hero interaction", "one chart per metric … in a table" as a requirement (now a
record of the build).
