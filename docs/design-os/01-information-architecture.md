# Phases 2–3 — Experience Maps & Information Architecture

> Status: settled · regenerated 2026-09-28 under the standing brief's
> [No visual prescription](../MASTER_PROMPT_COMPLETE.md#no-visual-prescription) rule.
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

Journey: register → land on the plan catalog → compare price, tier, limits → select →
subscription created → dashboard.

Decision point: which tier. The catalog must show **limits**, not just price, because limits
are the thing the customer is actually buying.

Failure paths: plan inactive by the time of submit (409) → re-fetch catalog, mark that plan
unavailable, keep the rest selectable. Network failure → the form retains selection.

Completion: `GET /subscriptions/current` returns an `ACTIVE` subscription.

### E2 · Monitor usage (Customer, recurring — the core loop)

Intent: "am I about to be cut off." Trigger: any session; this is the reason to open the app.
Entry: `/dashboard` (summary) → `/usage` (detail).

System behaviour: for each of the three metrics, read consumed vs. limit, present a meter, and
change state at thresholds — under 75 % **normal**, 75–99 % **warning**, at or over 100 %
**exceeded**. The state is stated in words, never signalled by colour alone. An exceeded meter
offers the upgrade path to `/plans` alongside its reading _(requirement; not yet built — today
the meter states the percentage, and `/plans` is reached through navigation)_.

Emotional state: mild anxiety. The screen's job is to resolve it in one glance, which is why
usage is the dashboard's first priority, ahead of every other piece of information on it.

Failure path: a metric has no log for the period → treat as zero consumed, not as an error.
An absent `UsageLog` row is the normal state at the start of a period.

### E3 · Pay & retrieve invoices (Customer)

Intent: "what do I owe, and what did I pay." Entry: `/invoices`, or the next-invoice summary
on the dashboard.

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

Journey: search by name or email → read the row: role, account status, current plan and
subscription status, last active → act: **suspend** or **reactivate**.

Decision point: suspend is reversible, delete is not offered. `DELETE /users/:id` cascades to
the account's subscriptions and invoices, so it would destroy billing history and the audit
trail along with the person; suspension removes access and keeps the record. The route stays
generated in the contract and deliberately unconsumed.

Failure paths: an administrator's own row offers no action, and the backend refuses a
self-change to `role` or `status` with 403 — suspending yourself locks you out, and if you are
the last administrator, locks everyone out. A failed change keeps the row as it was and reports
the reason with the action that failed. If the subscription list fails, accounts still render
with their plan details empty and a notice saying why, rather than the whole screen erroring.

Completion: the row reads **Suspended**; that account's next request is refused 401 and a
sign-in attempt 403. Reactivating restores access with the subscription untouched.

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
/settings                  Profile, account, payment methods                    [USER, ADMIN]

/admin                     Ops counters, billing cycle, overdue queue           [ADMIN]
/admin/plans               Plan catalogue CRUD                                  [ADMIN]
/admin/users               Customer lookup; suspend and restore access          [ADMIN]
/admin/subscriptions       All subscriptions, status filter, issue invoice      [ADMIN]
/admin/invoices            Overdue invoices + invoice stats                     [ADMIN]

/not-found                 404
/error                     Error boundary (there is no /500 route)
```

## Navigation

Two navigation groups. The admin group renders only for `role === "ADMIN"` — absent, not
disabled, because a disabled control invites a support ticket.

**One link is current at a time — the longest one that matches.** `/admin` is a prefix of every
admin route, so plain prefix matching marked Overview current on every admin page alongside the
page's own link. `/invoices/[id]` still marks Invoices current, because no longer link matches
it. The current link is announced with `aria-current`.

| Group                    | Items                                                                |
| ------------------------ | -------------------------------------------------------------------- |
| Billing                  | Dashboard, Usage, Subscription, Invoices, Plans                      |
| Administration _(ADMIN)_ | Overview, Plan catalogue, Customers, Subscriptions, Overdue invoices |
| _(outside both groups)_  | Settings, Sign out                                                   |

## Permissions

Route protection is **server-side, before render**. [`proxy.ts`](../../proxy.ts) reads the
httpOnly session cookie, verifies its RS256 signature with WebCrypto, and redirects an
unauthenticated visitor to `/auth/login?next=<path>`, a non-`ADMIN` session off `/admin/*`, and
a signed-in visitor away from `/auth/*`. It fails closed: with no `AUTH_JWT_PUBLIC_KEY`, every
protected route redirects to login. See
[Frontend Architecture](03-frontend-architecture.md#what-the-proxy-enforces) for the full list.

**No route, layout or section gates itself on the client, and nothing about the session is
readable by script** — the cookie is `HttpOnly`, and `localStorage` holds only the theme
preference. `AppShell` reads `role` from `GET /users/me` for one purpose: deciding whether the
admin nav group renders. Hiding a link is navigation, not authorisation.

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

- No subscription → `/dashboard` offers a single call to action pointing at `/plans`. It does
  not present empty meters.
- No invoices yet → explanatory empty state, not a blank table.
- Unknown route → `not-found.tsx`. Thrown render error → `error.tsx` with a reset action.

## Changed in the 2026-09-28 regeneration

No flow, route, role or permission was removed. Dropped as visual prescription: the meter row
"sitting above everything else on the dashboard" (now a priority), plan "tiles" (now plans),
deactivation "presented first" (now offered as the preferred action), the failure reason "shown
on the button", and the sidebar "footer". Meter states are named by meaning (normal · warning ·
exceeded) rather than by colour, and the exceeded meter's upgrade path is marked as not yet
built. Added from the other documents so the maps agree with them: the admin write exceptions in
E6, the edit rule in E5, the fuller sitemap descriptions.
