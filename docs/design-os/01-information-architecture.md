# Phases 2–3 — Experience Maps & Information Architecture

> Status: settled · regenerated 2026-09-28 under the standing brief's
> [No visual prescription](../MASTER_PROMPT_COMPLETE.md#no-visual-prescription) rule · self-audited
> 2026-09-30 against its [Self-audit before delivery](../MASTER_PROMPT_COMPLETE.md#self-audit-before-delivery).
> Governed by [MASTER_PROMPT_COMPLETE.md](../MASTER_PROMPT_COMPLETE.md#phase-2--experience-maps)
> and its [Phase 3](../MASTER_PROMPT_COMPLETE.md#phase-3--information-architecture). References
> [Phase 1](00-product-definition.md). Governs
> [`lib/data/navigation.ts`](../../lib/data/navigation.ts) and [`proxy.ts`](../../proxy.ts).
> Next in phase order: [Phase 4](02-page-blueprints.md).

**A new flow gets a map before it gets a route.** E2 is the loop the product lives or dies on;
weigh changes against it first. **Adding a route means adding it to the sitemap, to
`navigation.ts`, and to the permission table in the same change.**

## Primary experience maps

### E1 · Select a plan (Customer, first run)

Intent: "get me covered." Trigger: registration completes with no subscription.
Entry: `/auth/register` → `/plans`.

Journey: register → arrive at the plan catalog → compare price, tier, limits → select →
subscription created → dashboard.

Decision point: which tier. The catalog must state **limits**, not just price, because limits
are the thing the customer is actually buying.

Failure paths: plan inactive by the time of submit (409) → re-fetch catalog, tell the customer
that plan is unavailable, keep the rest selectable. Network failure → the selection is kept.

Completion: `GET /subscriptions/current` returns an `ACTIVE` subscription.

### E2 · Monitor usage (Customer, recurring — the core loop)

Intent: "am I about to be cut off." Trigger: any session; this is the reason to open the app.
Entry: `/dashboard` (summary) → `/usage` (detail).

System behaviour: for each of the three metrics, read consumed vs. limit, report it, and
change state at thresholds — under 75 % **normal**, 75–99 % **warning**, at or over 100 %
**exceeded**. The state is stated in words, never signalled by colour alone. An exceeded meter
offers the upgrade path to `/plans` _(requirement; not yet built — today the meter states the
percentage, and `/plans` is reached through navigation)_.

Emotional state: mild anxiety. The route's job is to resolve it in one glance, which is why
usage is the dashboard's first priority, ahead of everything else it answers.

Failure path: a metric has no log for the period → treat as zero consumed, not as an error.
An absent `UsageLog` row is the normal state at the start of a period.

### E3 · Pay & retrieve invoices (Customer)

Intent: "what do I owe, and what did I pay." Entry: `/invoices`, or from `/dashboard`, where
the next invoice is answered.

Journey: find the invoice (newest first, narrowable by status) → open it → learn its period,
amount, due date and status → mark it paid where permitted.

Decision point: none for the customer; this is a reading surface. Its failure mode is
ambiguity, not error — hence explicit period endpoints on every invoice.

### E4 · Change or cancel (Customer)

Intent: "my needs changed." Entry: `/subscription`.

Journey: current plan → change (pick a new plan, confirm) or cancel (confirm, with an
explicit statement of what happens to access and the current period).

Recovery path: cancellation is reversible while the subscription still exists —
`POST /subscriptions/reactivate`. The cancel confirmation says so, which is what makes the
action safe to offer.

### E5 · Administer the catalog (Billing Admin)

Entry: `/admin/plans`. Create, edit price and limits, activate/deactivate. Deactivation is the
preferred action and is offered as such; deletion is available but confirms twice because
subscriptions reference plans. Editing a price or limit applies at the next renewal, never
retroactively, so it needs no confirm step.

### E6 · Watch platform health (Internal Ops)

Entry: `/admin`. Counters → drill into `/admin/subscriptions` filtered by status, or
`/admin/invoices` for overdue. Read-only by design, with two confirmed exceptions: running the
billing cycle by hand from `/admin`, and issuing one subscription's invoice from
`/admin/subscriptions`. Both are idempotent server-side, so a repeat cannot double-bill.

### E7 · Look up and act on a customer (Internal Ops, Support)

Intent: "who is this, and can they get in?" Trigger: a support ticket names an email, or the
suspended-accounts counter on `/admin` moves. Entry: `/admin/users`.

Journey: search by name or email → learn who the customer is, whether they can get in, which
plan they are on and when they were last active → act: **suspend** or **reactivate**.

Decision point: suspend is reversible, delete is not offered. `DELETE /users/:id` cascades to
the account's subscriptions and invoices, so it would destroy billing history and the audit
trail along with the person; suspension removes access and keeps the record. The route stays
generated in the contract and deliberately unconsumed.

Failure paths: an administrator is offered no action on their own account, and the backend
refuses a self-change to `role` or `status` with 403 — suspending yourself locks you out, and if
you are the last administrator, locks everyone out. A failed change leaves the account as it was
and tells the operator which action failed and why. If the subscription list fails, accounts are
still listed without plan details and the operator is told why, rather than the whole route
erroring.

Completion: the account's status reads **Suspended**; that account's next request is refused 401 and a
sign-in attempt 403. Reactivating restores access with the subscription untouched.

## Sitemap

Route group in brackets after each route's purpose, then who can reach it.

```
/                          Decide whether Meter fits; preview plans; register   (root)  [public]
/auth/login                Sign in                                              auth/   [public]
/auth/register             Create an account                                    auth/   [public]
/auth/forgot-password      Request a reset                                      auth/   [public]
/auth/reset-password       Complete a reset                                     auth/   [public]

/dashboard                 Am I covered, and what do I owe                      (app)   [USER, ADMIN]
/plans                     Choose or change a plan                              (app)   [USER, ADMIN]
/subscription              Review, cancel or reactivate the subscription        (app)   [USER, ADMIN]
/usage                     Usage now and across periods, by metric              (app)   [USER, ADMIN]
/invoices                  Find an invoice                                      (app)   [USER, ADMIN]
/invoices/[id]             One invoice in full; mark paid                       (app)   [USER, ADMIN]
/settings                  Profile, sign-in details, payment methods            (app)   [USER, ADMIN]

/admin                     Platform health; run the billing cycle               (app)   [ADMIN]
/admin/plans               Administer the plan catalogue                        (app)   [ADMIN]
/admin/users               Customer lookup; suspend and restore access          (app)   [ADMIN]
/admin/subscriptions       Subscription oversight; issue one invoice            (app)   [ADMIN]
/admin/invoices            Invoice health and the overdue queue                 (app)   [ADMIN]

/not-found                 404                                                  (root)  [anyone]
/error                     Error boundary (there is no /500 route)              (root)  [anyone]
```

`/invoices/[id]` is reached from `/invoices` and from `/dashboard`; every other `(app)` route
is reachable directly through navigation. `/auth/*` and `/` are the only routes outside the
`(app)` group.

## Navigation

The `(app)` routes form two navigation groups. The Administration group is offered only to
`role === "ADMIN"` — absent, not disabled, because an unavailable destination invites a support
ticket.

**One destination is current at a time — the longest route that matches.** `/admin` is a
prefix of every admin route, so plain prefix matching marked Overview current on every admin
route alongside that route's own entry. `/invoices/[id]` still marks Invoices current, because
no longer route matches it. The current destination is announced with `aria-current`.

| Group                    | Routes (label)                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Billing                  | `/dashboard` (Dashboard), `/usage` (Usage), `/subscription` (Subscription), `/invoices` (Invoices), `/plans` (Plans) |
| Administration _(ADMIN)_ | `/admin` (Overview), `/admin/plans` (Plan catalogue), `/admin/users` (Customers), `/admin/subscriptions` (Subscriptions), `/admin/invoices` (Overdue invoices) |
| _(outside both groups)_  | `/settings` (Settings); signing out, an action rather than a route (Sign out)                                        |

## Permissions

Route protection is **server-side, before render**. [`proxy.ts`](../../proxy.ts) reads the
httpOnly session cookie, verifies its RS256 signature with WebCrypto, and redirects an
unauthenticated visitor to `/auth/login?next=<path>`, a non-`ADMIN` session off `/admin/*`, and
a signed-in visitor away from `/auth/*`. It fails closed: with no `AUTH_JWT_PUBLIC_KEY`, every
protected route redirects to login. See
[Frontend Architecture](03-frontend-architecture.md#what-the-proxy-enforces) for the full list.

**No route, layout or section gates itself on the client, and nothing about the session is
readable by script** — the cookie is `HttpOnly`, and `localStorage` holds only the theme
preference. The client reads `role` from `GET /users/me` for one purpose: deciding whether the
Administration group is offered. Withholding a destination is navigation, not authorisation.

The backend remains the authority: `JwtAuthGuard` + `RolesGuard` verify independently on every
admin route. The proxy is a genuine first line rather than a cosmetic one, but it is a
_routing_ layer — authorisation is checked twice more behind it.

## Labelling conventions

- "Plan", never "tier" or "package", in user-facing copy.
- "Usage", never "consumption".
- Invoice states use the backend's words verbatim: Draft, Sent, Paid, Failed, Overdue.
- Periods always read as `start – end`, never as a single date.
- Amounts always carry `USD`.

## Empty & fallback routes

- No subscription → `/dashboard` offers one next step, to `/plans`. It gives no empty usage
  readings.
- No invoices yet → the customer is told there are none yet and why, rather than being given
  nothing.
- Unknown route → `not-found.tsx`. Thrown render error → `error.tsx`, from which the user can
  retry.

## Changed in the 2026-09-28 regeneration

No flow, route, role or permission was removed. Dropped as visual prescription: the meter row
"sitting above everything else on the dashboard" (now a priority), plan "tiles" (now plans),
deactivation "presented first" (now offered as the preferred action), the failure reason "shown
on the button", and the sidebar "footer". Meter states are named by meaning (normal · warning ·
exceeded) rather than by colour, and the exceeded meter's upgrade path is marked as not yet
built. Added from the other documents so the maps agree with them: the admin write exceptions in
E6, the edit rule in E5, the fuller sitemap descriptions.

**2026-09-30 self-audit.** No flow, route, role, permission or navigation entry was removed.
Structure and reachability only: sitemap descriptions became each route's purpose (dropping
"meters", "status filter", "counters", "CRUD", "stats" as content lists) and gained the route
group; the navigation table now maps each group to its routes, keeping the labels as labelling;
"admin nav group renders", `AppShell` and "hiding a link" became the Administration group being
offered or withheld. Experience maps lost screen content and placement: "land on", "the catalog
must show", "present a meter", "alongside its reading", "the screen's job", "the next-invoice
summary on the dashboard", "every row", "read the row: role, account status…", "own row",
"keeps the row as it was", "plan details empty and a notice", "the row reads Suspended". Empty
routes lost "call to action", "empty meters", "blank table" and "reset action". Every failure
path, decision point and completion condition is kept as behaviour.
