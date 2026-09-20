# Phases 2–3 — Experience Maps & Information Architecture

References [Phase 1](00-product-definition.md).

## Primary experience maps

### E1 · Select a plan (Customer, first run)

Intent: "get me covered." Trigger: registration completes with no subscription.
Entry: `/auth/register` → `/plans`.

Journey: register → land on the plan catalog → compare price, tier, limits → select →
subscription created → dashboard.

Decision point: which tier. The catalog must show **limits**, not just price, because limits
are the thing the customer is actually buying.

Failure paths: plan inactive by the time of submit (409) → re-fetch catalog, mark the tile
unavailable, keep the rest selectable. Network failure → the form retains selection.

Completion: `GET /subscriptions/current` returns an `ACTIVE` subscription.

### E2 · Monitor usage (Customer, recurring — the core loop)

Intent: "am I about to be cut off." Trigger: any session; this is the reason to open the app.
Entry: `/dashboard` (summary) → `/usage` (detail).

System behaviour: for each of the three metrics, read consumed vs. limit, render a meter, and
change state at thresholds — under 75 % neutral, 75–99 % warning, at/over 100 % error with an
upgrade affordance inline.

Emotional state: mild anxiety. The screen's job is to resolve it in one glance, which is why
the meter row sits above everything else on the dashboard.

Failure path: a metric has no log for the period → treat as zero consumed, not as an error.
An absent `UsageLog` row is the normal state at the start of a period.

### E3 · Pay & retrieve invoices (Customer)

Intent: "what do I owe, and what did I pay." Entry: `/invoices`, or the next-invoice tile on
the dashboard.

Journey: list, newest first, status-filterable → open one → period, amount, due date, status
→ mark paid where permitted.

Decision point: none for the customer; this is a reading surface. Its failure mode is
ambiguity, not error — hence explicit period endpoints on every row.

### E4 · Change or cancel (Customer)

Intent: "my needs changed." Entry: `/subscription`.

Journey: current plan → change (pick a new plan, confirm) or cancel (confirm, with an
explicit statement of what happens to access and the current period).

Recovery path: cancellation is reversible while the subscription still exists —
`POST /subscriptions/reactivate`. The cancel confirmation says so, which is what makes the
action safe to offer.

### E5 · Administer the catalog (Billing Admin)

Entry: `/admin/plans`. Create, edit price and limits, activate/deactivate. Deactivation is
preferred over deletion and is presented first; deletion is available but confirms twice
because subscriptions reference plans.

### E6 · Watch platform health (Internal Ops)

Entry: `/admin`. Counters → drill into `/admin/subscriptions` filtered by status, or
`/admin/invoices` for overdue. Read-only by design.

## Sitemap

```
/                          Landing — value proposition + plan catalog preview  [public]
/auth/login                                                                     [public]
/auth/register                                                                  [public]
/auth/forgot-password                                                           [public]
/auth/reset-password                                                            [public]

/dashboard                 Customer overview: meters, plan, next invoice        [USER, ADMIN]
/plans                     Plan catalog; select or change                       [USER, ADMIN]
/subscription              Current subscription, history, cancel/reactivate     [USER, ADMIN]
/usage                     Meters + history by metric and period                [USER, ADMIN]
/invoices                  Invoice list, status filter                          [USER, ADMIN]
/invoices/[id]             Invoice detail                                       [USER, ADMIN]
/settings                  Profile                                              [USER, ADMIN]

/admin                     Ops counters                                         [ADMIN]
/admin/plans               Plan catalogue CRUD                                  [ADMIN]
/admin/subscriptions       All subscriptions, status filter                     [ADMIN]
/admin/invoices            Overdue invoices + invoice stats                     [ADMIN]

/not-found                 404
/error                     500 (error boundary)
```

## Navigation

Two groups in one sidebar. The admin group renders only for `role === "ADMIN"` — absent, not
disabled, because a disabled control invites a support ticket.

| Group                    | Items                                           |
| ------------------------ | ----------------------------------------------- |
| Billing                  | Dashboard, Usage, Subscription, Invoices, Plans |
| Administration _(ADMIN)_ | Overview, Plans, Subscriptions, Invoices        |
| —                        | Settings, Sign out (footer)                     |

## Permissions

Route protection is client-side today: `session.isActive()` gates the `(app)` layout and
`role` gates `/admin/*`. The JWT lives in `localStorage`, which the edge runtime cannot read,
so `proxy.ts` cannot enforce this — see [Frontend Architecture](03-frontend-architecture.md#authentication-boundary)
for the httpOnly-cookie migration this is deliberately staged behind.

The backend is the real boundary: `JwtAuthGuard` + `RolesGuard` on every admin route. The
frontend gate is a navigation convenience, not a security control, and is documented as such
so nobody mistakes it for one.

## Labelling conventions

- "Plan", never "tier" or "package", in user-facing copy.
- "Usage", never "consumption".
- Invoice states use the backend's words verbatim: Draft, Sent, Paid, Failed, Overdue.
- Periods always render as `start – end`, never as a single date.
- Amounts always carry `USD`.

## Empty & fallback routes

- No subscription → `/dashboard` renders a single call to action pointing at `/plans`. It
  does not render empty meters.
- No invoices yet → explanatory empty state, not a blank table.
- Unknown route → `not-found.tsx`. Thrown render error → `error.tsx` with a reset action.
