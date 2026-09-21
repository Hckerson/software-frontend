# Phase 4 — Page Blueprints

References [Phase 1](00-product-definition.md) and [Phases 2–3](01-information-architecture.md).
Governs [`app/`](../../app/). Sections are blueprinted in
[Phase 5](06-section-blueprints.md); components in [Phase 6](07-component-library.md).

**18 surfaces** — 16 routes plus `not-found` and `error`.

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
fetching (`starter/page-composes-only`). It imports sections and arranges them. This is why
every page below lists its modules as sections rather than markup.

**The four designed states** are mandatory on every data surface and are owned by the sections,
not the route: **loading** (skeleton, never a spinner-only screen) · **empty** (explanatory,
carrying the one action that resolves it) · **error** (the `ApiError` message plus retry) ·
**success**. A blueprint that omits its empty state is incomplete, not concise.

**Permissions.** Enforced **server-side before render** by
[`proxy.ts`](../../proxy.ts), and independently again by the backend's `JwtAuthGuard`
and `RolesGuard`. No route gates itself on the client. Unauthenticated visitors are sent to
`/auth/login?next=<path>`; non-admins never reach `/admin/*`; signed-in visitors are bounced
out of `/auth/*`.

**Responsive behaviour.** Named in [`styles/components.css`](../../styles/components.css). No
route contains a breakpoint.

**Register.** `text-h4` page titles via `PageHeader`, dense spacing, no hero type
(`starter/application-register-density`). **`/` is the single exception.**

**Dependencies.** Every authenticated route depends on `AppShell`, which depends on
`GET /users/me`.

---

## Public

### `/` — Landing

**Purpose:** convert an unauthenticated visitor. **Business objective:** registrations.
**User objective:** decide whether this product meters what they need.
**Primary tasks:** read the proposition → compare plans → register.
**Modules:** `landing-hero` · `landing-plans`. **Data:** `GET /billing/plans`.
**Permissions:** public — the only route outside the shell and outside auth.
**Actions:** → `/auth/register`.
**States:** skeleton while plans load; **no empty state** — a catalogue with no plans is a
deployment fault, not a user-facing condition.
**Implementation note:** the **only** route permitted the editorial register. It opts out of
`starter/application-register-density` through an explicit `files` block in
[`eslint.config.ts`](../../eslint.config.ts) — an opt-out on the record, not a disable comment.

---

## Authentication

Four routes, one shape: `AuthCard` supplies the `<h1>` and framing; a single form section
supplies the fields. Wrapped in `Suspense` because the forms read search params.

| Route                   | Purpose              | Section                | Endpoint                     |
| ----------------------- | -------------------- | ---------------------- | ---------------------------- |
| `/auth/login`           | Exchange credentials | `login-form`           | `POST /auth/login`           |
| `/auth/register`        | Create an account    | `register-form`        | `POST /auth/register`        |
| `/auth/forgot-password` | Request a reset link | `forgot-password-form` | `POST /auth/forgot-password` |
| `/auth/reset-password`  | Complete a reset     | `reset-password-form`  | `POST /auth/reset-password`  |

**Permissions:** public, but **signed-in visitors are redirected away** — a logged-in user
landing on `/auth/login` is a navigation bug, not a sign-out affordance.
**States:** error only; nothing is read, so there is no skeleton or empty rung.
**Failure must never clear typed values.**
**Success:** the backend sets the httpOnly session cookie and the route redirects to `next` or
`/dashboard`. **The client stores nothing.**
**Dependency:** password reset is
[not yet delivered end to end](05-billing-cycle-plan.md) — the surfaces exist ahead of the
mail path.

---

## Customer

### `/dashboard` — Customer overview

**Purpose:** answer _am I covered, what do I owe_ above the fold.
**Business objective:** retention through the E2 loop. **User objective:** resolve limit
anxiety in one glance.
**Modules, in order — the order is the blueprint:** `usage-summary` (3 meters) ·
`plan-summary` · `next-invoice` · `recent-invoices`.
**Data:** `GET /subscriptions/current` · `GET /usage/current` ·
`GET /invoices/upcoming/estimate` · `GET /invoices`.
**Empty:** no subscription → a single _Choose a plan_ panel. **No meters, no tiles** — an
unsubscribed user sees one decision, not four empty frames.
**Implementation note:** **the meter row is first because E2 is the loop the product lives or
dies on.** Weigh any change to this order against that.

### `/plans` — Plan catalogue

**Purpose:** compare and commit — the `DOMAIN_TRANSACTION`.
**Primary tasks:** compare tier, price and **limits**; select or change.
**Modules:** `plan-catalog`. **Data:** `GET /billing/plans`, `GET /subscriptions/current`.
**Actions:** `POST /subscriptions/select-plan` when unsubscribed;
`POST /subscriptions/change-plan` when subscribed — **the action label changes with
subscription state.** A change confirms.
**Rules:** the current plan's card is marked and its action disabled; inactive plans hidden.
**Failure path:** `409` (plan deactivated between render and submit) → re-fetch, mark that card
unavailable, **keep the rest selectable**.

### `/subscription` — Current subscription

**Modules:** `subscription-detail` · `subscription-history` · `subscription-actions`.
**Data:** `GET /subscriptions/current`, `GET /subscriptions/history`.
**Actions:** cancel (confirm) · reactivate. **The confirm copy states that cancelling is
reversible while the record exists.**
**Implementation note:** a successful mutation invalidates the subscription, usage **and**
invoice keys together, because the backend changes all three in one transaction. History is thin
until `@@unique([userId, status])` is lifted.

### `/usage` — Usage detail

**Modules:** `usage-summary` (reused from the dashboard) · `usage-history`.
**Data:** `GET /usage/current`, `GET /usage/history`.
**Implementation note:** `GET /usage/current` returns a union of three shapes
(`UsageLog | UsageLog[] | { amount, metricType, period }`). **The frontend normalises this in
exactly one place** — [`lib/utils/usage.ts`](../../lib/utils/usage.ts) — and every consumer reads
the normalised form. Collapsing the endpoint to one shape is
[tracked](05-billing-cycle-plan.md).
**Rule:** a missing log for the period is **zero consumed, not an error**. A `null` limit is
unlimited, not zero.

### `/invoices` and `/invoices/[id]`

**List** — `invoice-list`: status filter, newest first; columns period · amount · due · status.
**Detail** — `invoice-detail`: amount, **both** period endpoints, due date, paid date, status,
mark-paid.
**Data:** `GET /invoices`, `GET /invoices/:id`, `POST /invoices/:id/mark-paid`.
**Permissions — the sharp edge.** An invoice id is a URL parameter, so **ownership is enforced
by the backend**. An IDOR here was
[found by running it](04-roadmap-and-qa.md#found-by-actually-running-it), not by reading or
type-checking it. A `403` renders as an error, **never as an empty invoice**.

### `/settings`

**Modules:** `profile-form` · `account-details` · `payment-methods`.
**Data:** `GET /users/me`, `GET /billing/payment-methods`.
**Actions:** `PATCH /users/:id`; set default and remove payment method (remove confirms).
**Rules:** **password and email changes are separate submissions** from profile fields. Meter
**stores Stripe tokens and never charges them** — brand and last-four only; no PAN, CVC or expiry
ever enters this app.

---

## Admin

Reachable only after the proxy has verified an `ADMIN` claim. **No admin route checks a role
itself.**

| Route                  | Modules                                                              | Data                                                                          |
| ---------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `/admin`               | `admin-overview` · `admin-cycle-controls` · `admin-overdue-invoices` | `GET /admin/stats`, `GET /admin/billing/stats`, `POST .../cycle/*`            |
| `/admin/plans`         | `admin-plan-list` · `admin-plan-edit` · `admin-plan-form`            | `GET /billing/plans` + create · edit · activate · deactivate · delete         |
| `/admin/subscriptions` | `admin-subscription-list` · `issue-invoice-button`                   | `GET /admin/billing/subscriptions[/status/:status]`, `POST .../issue-invoice` |
| `/admin/invoices`      | `admin-invoice-health` · `admin-overdue-invoices`                    | `GET /admin/billing/overdue-invoices`, `GET /admin/billing/invoice-stats`     |

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

**Purpose:** a designed dead end. Renders in `.auth-shell` with `.empty-state`: the code, a
plain-language title, a line acknowledging the record may have been removed, and a
`LinkButton` back to `/dashboard`. **No data, no shell** — it must render when nothing else can.

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
component composed into `/dashboard` and `/usage`. **Adding any of the above requires an
[experience map](01-information-architecture.md) first**, per the Phase 2 rule that a new flow
gets a map before it gets a route.
