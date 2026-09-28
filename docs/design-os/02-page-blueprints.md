# Phase 4 — Page Blueprints

> Status: settled · regenerated 2026-09-28 under the standing brief's
> [No visual prescription](../MASTER_PROMPT_COMPLETE.md#no-visual-prescription) rule.
> Governed by [MASTER_PROMPT_COMPLETE.md](../MASTER_PROMPT_COMPLETE.md#phase-4--page-blueprints).
> References [Phase 1](00-product-definition.md) and [Phases 2–3](01-information-architecture.md).
> Governs [`app/`](../../app/). Next in phase order: [Phase 5](06-section-blueprints.md)
> (sections), then [Phase 6](07-component-library.md) (interaction contracts).

**19 surfaces** — 17 routes plus `not-found` and `error`. Each blueprint states what the page
must do and offer, in priority order. **How a page looks, and where anything sits on it, is
decided when it is built, with the owner** — see the
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
fetching (`starter/page-composes-only`). It imports sections. This is why every page below
lists its content as sections rather than markup.

**Content priority.** Where a blueprint lists content "in priority order", the order is what the
user needs answered first. It is not an order on screen; placement is a build decision.

**The four designed states** are mandatory on every data surface and are owned by the sections,
not the route: **loading** (announced to assistive technology; built today with `Skeleton`) ·
**empty** (explanatory, carrying the one action that resolves it) · **error** (the `ApiError`
message plus retry) · **success**. A blueprint that omits its empty state is incomplete, not
concise.

**Permissions.** Enforced **server-side before render** by
[`proxy.ts`](../../proxy.ts), and independently again by the backend's `JwtAuthGuard`
and `RolesGuard`. No route gates itself on the client. Unauthenticated visitors are sent to
`/auth/login?next=<path>`; non-admins never reach `/admin/*`; signed-in visitors are bounced
out of `/auth/*`.

**Device needs.** Every customer and admin surface stays fully operable from phone width up:
the shell, the meters, the plan catalogue and the tables lose no information and no action on a
small screen. How each adapts is a build decision.

**Repeat visit.** Every console route is built for the operator who returns daily — finding
and acting over first impression ([principle 4](00-product-definition.md#product-principles)).
**`/` is the single exception.**

**Dependencies.** Every authenticated route depends on `AppShell`, which depends on
`GET /users/me`.

---

## Public

### `/` — Landing

**Purpose:** convert an unauthenticated visitor. **Business objective:** registrations.
**User objective:** decide whether this product meters what they need.
**Primary tasks:** read the proposition → compare plans → register.
**Sections:** `landing-hero` · `landing-plans`. **Data:** `GET /billing/plans`.
**Permissions:** public — the only route outside the shell and outside auth.
**Actions:** → `/auth/register`.
**States:** loading while plans load; **no empty state** — a catalogue with no plans is a
deployment fault, not a user-facing condition. A failed request renders `ErrorState` with a
retry and keeps the pricing heading, so a visitor sees that pricing exists and failed to load.
**Implementation note:** the **only** route whose job is the first impression
([principle 4](00-product-definition.md#product-principles)). Its look is decided with the owner
at build time, like every other page's.

---

## Authentication

Four routes, one shape: `AuthCard` supplies the page's `<h1>`; a single form section supplies
the fields. Wrapped in `Suspense` because the forms read search params.

| Route                   | Purpose              | Section                | Endpoint                     |
| ----------------------- | -------------------- | ---------------------- | ---------------------------- |
| `/auth/login`           | Exchange credentials | `login-form`           | `POST /auth/login`           |
| `/auth/register`        | Create an account    | `register-form`        | `POST /auth/register`        |
| `/auth/forgot-password` | Request a reset link | `forgot-password-form` | `POST /auth/forgot-password` |
| `/auth/reset-password`  | Complete a reset     | `reset-password-form`  | `POST /auth/reset-password`  |

**Permissions:** public, but **signed-in visitors are redirected away** — a logged-in user
landing on `/auth/login` is a navigation bug, not a sign-out affordance.
**States:** error only; nothing is read, so there is no loading or empty rung.
**Failure must never clear typed values.**
**Success:** the backend sets the httpOnly session cookie and the route redirects to `next` or
`/dashboard`. **The client stores nothing.**
**Content rule:** `forgot-password` always answers with the same non-committal message, whether
or not the email exists — it must never reveal which accounts exist.
**Dependency:** password reset is delivered end to end — the backend emails the link through
`SmtpResetDelivery` when `SMTP_HOST` is set, and logs it otherwise, so an unconfigured
environment still boots. See [Phase E](05-billing-cycle-plan.md#phase-e--password-reset).

---

## Customer

### `/dashboard` — Customer overview

**Purpose:** answer _am I covered, what do I owe_ in one glance.
**Business objective:** retention through the E2 loop. **User objective:** resolve limit
anxiety in one glance.
**Content, in priority order — the priority is the blueprint:** `usage-summary` (the three
meters) · `plan-summary` · `next-invoice` · `recent-invoices`.
**Data:** `GET /subscriptions/current` · `GET /usage/current` ·
`GET /invoices/upcoming/estimate` · `GET /invoices`.
**Empty:** no subscription → a single _Choose a plan_ action. **No meters, no summaries** — an
unsubscribed user is offered one decision, not four empty sections.
**Implementation note:** **usage is the first priority because E2 is the loop the product lives
or dies on.** Weigh any change to this priority against that.

### `/plans` — Plan catalogue

**Purpose:** compare and commit — the `DOMAIN_TRANSACTION`.
**Primary tasks:** compare tier, price and **limits**; select or change.
**Sections:** `plan-catalog`. **Data:** `GET /billing/plans`, `GET /subscriptions/current`.
**Actions:** `POST /subscriptions/select-plan` when unsubscribed;
`POST /subscriptions/change-plan` when subscribed — **the action label changes with
subscription state.** A change confirms.
**Rules:** the current plan is marked as current and its action disabled; inactive plans are
not offered.
**Failure path:** `409` (plan deactivated between render and submit) → re-fetch, mark that plan
unavailable, **keep the rest selectable**.

### `/subscription` — Current subscription

**Sections:** `subscription-detail` · `subscription-history` · `subscription-actions`.
**Data:** `GET /subscriptions/current`, `GET /subscriptions/history`.
**Actions:** cancel (confirm) · reactivate. **The confirm copy states that cancelling is
reversible while the record exists.**
**Implementation note:** a successful mutation invalidates the subscription, usage **and**
invoice keys together, because the backend changes all three in one transaction. History was
thin while `@@unique([userId, status])` held; the partial index that replaced it
([F2](05-billing-cycle-plan.md#f2--uniqueuserid-status-makes-billing-history-impossible))
lets it grow.

### `/usage` — Usage detail

**Sections:** `usage-summary` (reused from the dashboard) · `usage-history`.
**Data:** `GET /usage/current`, `GET /usage/history`, and the current plan's limits from
`GET /subscriptions/current`.
**History is charted, one chart per metric.** API calls, storage and seats differ by five
orders of magnitude, so each metric is presented independently on its own scale — a shared or
dual scale would invent a relationship between them. Each chart shows the current plan's limit
as a reference, so a period billed for overage is identifiable as over it. **Every plotted value
is also available as text** in a table, reachable without hovering and without script.
**Implementation note:** `GET /usage/current` returns one shape, `MetricUsage[]`. It once
returned a union of three and was normalised client-side; that was
[collapsed on the backend](05-billing-cycle-plan.md#phase-f--verification) and the normaliser
is gone.
**Rule:** a missing log for the period is **zero consumed, not an error**. A `null` limit is
unlimited, not zero.

### `/invoices` and `/invoices/[id]`

**List** — `invoice-list`: status filter, newest first; each row states period · amount ·
due · status, and opens the detail.
**Detail** — `invoice-detail`: amount, **both** period endpoints, due date, paid date, status,
mark-paid.
**Data:** `GET /invoices`, `GET /invoices/:id`, `POST /invoices/:id/mark-paid`.
**Permissions — the sharp edge.** An invoice id is a URL parameter, so **ownership is enforced
by the backend**. An IDOR here was
[found by running it](04-roadmap-and-qa.md#found-by-actually-running-it), not by reading or
type-checking it. A `403` or `404` renders as an error, **never as an empty invoice**.

### `/settings`

**Sections:** `profile-form` · `account-details` · `payment-methods`.
**Data:** `GET /users/me`, `GET /billing/payment-methods`.
**Actions:** `PATCH /users/:id`; set default and remove payment method (remove confirms).
**Rules:** **password and email changes are separate submissions** from profile fields. Meter
**stores Stripe tokens and never charges them** — brand and last-four only; no PAN, CVC or expiry
ever enters this app. There is **no add-card action** until Stripe is integrated; the empty
state names that gap rather than hiding it
([Phase D](05-billing-cycle-plan.md#phase-d--payment-methods)).

---

## Admin

Reachable only after the proxy has verified an `ADMIN` claim. **No admin route checks a role
itself.**

| Route                  | Sections                                                             | Data                                                                               |
| ---------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `/admin`               | `admin-overview` · `admin-cycle-controls` · `admin-overdue-invoices` | `GET /admin/stats`, `GET /admin/billing/stats`, `POST .../cycle/*`                 |
| `/admin/plans`         | `admin-plan-list` · `admin-plan-edit` · `admin-plan-form`            | `GET /billing/plans` + create · edit · activate · deactivate · delete              |
| `/admin/users`         | `admin-user-list` · `account-status-button`                          | `GET /users`, `GET /admin/billing/subscriptions`, `PATCH /users/:id` (status only) |
| `/admin/subscriptions` | `admin-subscription-list` · `issue-invoice-button`                   | `GET /admin/billing/subscriptions[/status/:status]`, `POST .../issue-invoice`      |
| `/admin/invoices`      | `admin-invoice-health` · `admin-overdue-invoices`                    | `GET /admin/billing/overdue-invoices`, `GET /admin/billing/invoice-stats`          |

**The console is no longer read-only.** `/admin` carries the billing cycle, and
`/admin/subscriptions` can issue a single period's invoice. Both are **write actions behind a
confirm step**, and both are idempotent server-side, so a double click cannot double-bill.

**Catalogue rules, business before UI:** **deactivating a plan must not cascade** to the
subscriptions referencing it, and **deletion double-confirms** — a plan with history should be
deactivated instead. **Editing does not cascade either**: a price or limit change applies to a
subscription when it renews, never retroactively, which is why editing needs no confirm step
while its two neighbours do.
**Note:** `admin-overdue-invoices` is composed on both `/admin` and `/admin/invoices`, so the
two screens cannot show different queues.

---

## Fallbacks

### `not-found` (404)

**Purpose:** a designed dead end. **Content:** the code, a plain-language title, a line
acknowledging the record may have been removed, and a `LinkButton` back to `/dashboard`.
**No data, no shell** — it must render when nothing else can.

### `error`

**Purpose:** the route-level error boundary. Renders the message and a retry.
**Rule:** it must not assume the shell mounted or that `GET /users/me` succeeded — an error
boundary that itself depends on a request is not a boundary.

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

**`{{DOMAIN_TOOL}}` resolved to the usage meter**, which is not a page — it is the hero
interaction composed into `/dashboard` and `/usage`. **Adding any of the above requires an
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
