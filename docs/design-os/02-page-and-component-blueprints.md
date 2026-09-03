# Phases 4–6 — Page, Section & Component Blueprints

References [Phase 1](00-product-definition.md) and [Phases 2–3](01-information-architecture.md).

## Page blueprints

Every page below shares the same four designed states: **loading** (skeleton, never a
spinner-only screen), **empty** (explanatory, with the one action that resolves it),
**error** (the `ApiError` message, plus retry), **success**. They are not repeated per page.

### `/dashboard` — Customer overview

Purpose: answer "am I covered, what do I owe" above the fold.
Modules, in order: **usage meter row** (3 meters) · **current plan tile** · **next invoice
tile** · **recent invoices** (5 rows).
Data: `GET /subscriptions/current`, `GET /usage/current`, `GET /invoices/upcoming/estimate`,
`GET /invoices`.
Empty: no subscription → single "Choose a plan" panel; no meters, no tiles.

### `/plans` — Plan catalogue

Purpose: compare and commit. Modules: plan grid (tier, price, limits, feature list, action).
Data: `GET /billing/plans`, `GET /subscriptions/current` (to mark the current plan).
Actions: `POST /subscriptions/select-plan` when unsubscribed;
`POST /subscriptions/change-plan` when subscribed — the tile action label changes accordingly.
Rule: the current plan's tile is marked and its action disabled. Inactive plans are hidden.

### `/subscription` — Current subscription

Modules: status header · plan summary · billing period · **history table** · danger zone.
Data: `GET /subscriptions/current`, `GET /subscriptions/history`.
Actions: cancel (confirm) / reactivate. The confirm copy states that cancelling is reversible
while the record exists.

### `/usage` — Usage detail

Modules: meter row · per-metric limit check · history table (metric, period, amount).
Data: `GET /usage/current`, `GET /usage/check-limit/:metric` per metric, `GET /usage/history`.
Note: `GET /usage/current` returns a union of three shapes from the backend
(`UsageLog | UsageLog[] | {amount, metricType, period}`). The frontend normalises this in one
place — `lib/utils/usage.ts` — and every consumer reads the normalised form.

### `/invoices` and `/invoices/[id]`

List: status filter, newest first, columns period · amount · due · status.
Detail: amount, both period endpoints, due date, paid date, status, mark-paid action.
Data: `GET /invoices`, `GET /invoices/:id`, `POST /invoices/:id/mark-paid`.

### `/settings`

Profile fields from `GET /users/me`; save via `PATCH /users/:id`. Password and email changes
are separate submissions from profile fields.

### `/admin` · `/admin/plans` · `/admin/subscriptions` · `/admin/invoices`

Overview: counter grid from `GET /admin/stats` + `GET /admin/billing/stats`.
Plans: table + create/edit form, activate/deactivate, delete (double confirm).
Subscriptions: status-filtered table from `GET /admin/billing/subscriptions[/status/:status]`.
Invoices: `GET /admin/billing/overdue-invoices` + `GET /admin/billing/invoice-stats`.

### `/` — Landing

Public. Value proposition, plan preview from `GET /billing/plans`, calls to action into
`/auth/register`. The **only** route in the app permitted the editorial register; it opts out
of `starter/application-register-density` via a `files` block in `eslint.config.ts`.

## Component library

Reusable, enterprise-first. No page-specific components. All of these compose token-mapped
utilities and named classes only — **no raw values, no arbitrary Tailwind values, and no
inline responsive chains** (`starter/token-first-classnames` forbids `md:`/`lg:` in JSX;
responsive behaviour is named once in `styles/globals.css`).

| Component           | Purpose                                | Key variants / props                                 | Tokens & classes          |
| ------------------- | -------------------------------------- | ---------------------------------------------------- | ------------------------- |
| `Button` _(exists)_ | Primary action                         | `tone` accent/quiet/ghost, `size` sm–xl, `isLoading` | `bg-accent`, `.smooth`    |
| `StatCard`          | One counter                            | `tone` pipeline/success/activity/warning             | `.stat-card`, `.metric-*` |
| `UsageMeter`        | Quota consumed vs. limit               | `state` derived from ratio                           | `.usage-meter*`           |
| `StatusPill`        | Subscription / invoice / account state | `status` string → tone map                           | `.status-pill*`           |
| `DataTable`         | Row collections                        | `columns`, `rows`, `empty`                           | `.data-table*`            |
| `PageHeader`        | Title + description + actions slot     | —                                                    | `text-h4`                 |
| `SectionCard`       | Titled panel wrapper                   | `title`, `action` slot                               | `.section-card`           |
| `EmptyState`        | Designed empty                         | `icon`, `title`, `description`, action slot          | `.empty-state`            |
| `ErrorState`        | Designed failure                       | `error: unknown`, `onRetry`                          | `.empty-state`            |
| `Skeleton`          | Loading placeholder                    | `lines`, `className`                                 | `.skeleton`               |
| `ConfirmDialog`     | Guard destructive actions              | `tone` danger/default                                | `.dialog*`, `--z-modal`   |
| `Money`             | Formatted amount                       | `amount`, `currency`                                 | `font-mono`               |
| `PeriodRange`       | `start – end`                          | `start`, `end`                                       | `text-xs`                 |

Anti-patterns, enforced by lint rather than convention:
never hardcode a raw value (add a token); never inline the same utility chain twice (promote
to a named class); never define a component inside a route file; never call the transport
layer outside `lib/hooks/use-*`.

## Component styling compliance

Every component above hardcodes no raw values and references tokens or named classes only.
Recurring combinations used by more than one component — the card frame, the table frame, the
meter track, the pill — are declared once in `styles/globals.css` under
`APPLICATION COMPONENTS`, and the responsive collapse of the shell, meter row, and plan grid
is named there too rather than inlined at call sites.
