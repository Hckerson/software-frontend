# MASTER PROMPT — Enterprise Meter Design Operating System (COMPLETE)

> **Status.** This began as a portable template driven by `{{PLACEHOLDERS}}`. It has been run:
> the placeholders are resolved to Meter's measured values, the system it specifies is built,
> and the documents it governs live in [`docs/design-os/`](design-os/).
>
> It is now **Meter's standing brief** — the contract governing Meter's **product, behaviour
> and architecture**: users, flows, information architecture, content, data, states,
> accessibility and code structure. It governs regeneration, extension and review of those,
> and is not a prompt awaiting a first execution. The full phase specification is retained
> deliberately: a requirement deleted once it is satisfied cannot be checked again, and cannot
> tell a later reader what was dropped.
>
> **It does not govern how Meter looks.** Meter's current visual design lives in the code — the
> tokens in [`styles/`](../styles/) and the components that use them. Changes to it are decided
> when each page is built, with the owner, not by this brief. See
> [No visual prescription](#no-visual-prescription).
>
> Read it when adding a surface, changing an architectural boundary, or auditing whether the
> code still does what the product specifies. **If this document and the code disagree on
> anything this brief governs, one of them is a bug — decide which, then fix that one.**

---

## Contents

- [Resolved constants](#resolved-constants)
- [Primary objective](#primary-objective)
- [Technology stack](#technology-stack)
- [Design philosophy](#design-philosophy)
- [Required workflow](#required-workflow)
- [The layering agreement](#the-layering-agreement)
- [Phase map](#phase-map)
- [Phases 1–10](#phase-1--product-vision)
- [Complete deliverables summary](#complete-deliverables-summary)
- [Functional standards](#functional-standards)
- [Cross-file linking requirements](#cross-file-linking-requirements)
- [Critical rules](#critical-rules)
- [Output contract](#output-contract)
- [Output format](#output-format)
- [Deviations, recorded](#deviations-recorded)

---

# Resolved constants

Each constant below was a `{{PLACEHOLDER}}` in the portable template. Every one is now
resolved and settled; nothing in this repo may re-derive them. The reasoning behind each is in
[00-product-definition.md](design-os/00-product-definition.md). Counts are measured against
the working tree, not estimated.

| Constant               | Resolved value                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `PRODUCT_NAME`         | **Meter**                                                                                                                   |
| `DOMAIN`               | Subscription billing & usage metering (B2B SaaS)                                                                            |
| `REFERENCE_PRODUCTS`   | Stripe Billing, Chargebee, Paddle, Orb — benchmarks for features and flows only, never for look or feel                     |
| `PERSONAS`             | Customer (`USER`), Billing Admin (`ADMIN`), Internal Ops (`ADMIN`)                                                          |
| `CORE_ENTITY`          | **Subscription**                                                                                                            |
| `CORE_ENTITY_PLURAL`   | **Subscriptions**                                                                                                           |
| `PRIMARY_FLOWS`        | Select a plan · Monitor usage against limits · Pay and retrieve invoices · Change or cancel a plan                          |
| `SUPPORTING_FLOWS`     | Authentication, onboarding, profile, plan-catalogue administration, ops oversight                                           |
| `ROLE_DASHBOARDS`      | Customer dashboard (`/dashboard`), Admin console (`/admin`)                                                                 |
| `ROLE`                 | `ADMIN \| USER` — exactly these two                                                                                         |
| `DOMAIN_TOOL`          | The **usage meter**: quota consumed vs. plan limit. The hero interaction.                                                   |
| `DOMAIN_TRANSACTION`   | Plan selection / plan change — the billing-state mutation                                                                   |
| `DOMAIN_SPECIFIC_LIBS` | **None.** No maps, no geo, no editor. Charts are hand-drawn SVG — no charting library.                                      |
| `SCALE_TARGET`         | Millions of subscriptions                                                                                                   |
| `COMPONENT_COUNT`      | **33** — 16 `common/` · 6 `layout/` · 9 `ui/forms/` · 1 provider · 1 wrapper                                                |
| `SECTION_COUNT`        | **44** in [`components/sections/`](../components/sections/), one folder per route                                           |
| `PAGE_COUNT`           | **16** routes, plus `not-found` and `error`                                                                                 |
| `TIMELINE_WEEKS`       | Not applicable. Meter tracks **8 delivered stages**, not a week estimate — see [Phase 8](#phase-8--implementation-roadmap). |
| `QA_ITEM_COUNT`        | **4 verification gates** over 3 checked categories — see [Phase 9](#phase-9--quality-assurance)                             |
| `OUTPUT_DIR`           | [`docs/design-os/`](design-os/)                                                                                             |

### Additional constants this domain required

The template did not anticipate these; they are as binding as the ones above.

| Constant           | Value                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| Metered dimensions | `API_CALLS`, `STORAGE_GB`, `SEATS` — exactly these three                      |
| Plan tiers         | `FREE`, `PRO`, `ENTERPRISE` — exactly these three                             |
| Hero interaction   | The usage meter. Every customer screen answers _am I within my limits_ first. |

### Business rules that constrain every screen

- A user has **at most one non-canceled subscription** (`@@unique([userId, status])`).
- One invoice per `(subscriptionId, billingPeriodStart)`.
- Usage accumulates into one row per `(subscriptionId, metricType, period)` — it never appends.
- Deactivating a plan must not cascade to the subscriptions referencing it.
- `Decimal` fields arrive over JSON as `string`. They are typed as `string` and parsed at the
  formatting boundary — never with a `Number()` scattered through a component.

### Non-goals

Not a payment processor (Stripe tokens are stored, not charged), no dunning automation, no
tax/VAT, no multi-currency, no seat provisioning, no in-app support inbox.

---

# Primary objective

You are operating as **Product Strategist**, **UX Architect**, **Information Architect**,
**Frontend System Architect**, and **Senior Next.js Engineer** on Meter.

Your responsibility is **not to design a billing website**. It is to hold an enterprise-grade
subscription-billing platform, defined through a structured Design Operating System that turns
business requirements into an unambiguous specification of what the product does: its users,
flows, information, content, data, behaviour and architecture.

Benchmark features and flows against **Stripe Billing, Chargebee, Paddle, Orb** — never their
look or feel. Meter is a console an operator lives in.

**This brief never decides how anything looks.** Visual design (colour, type, layout,
placement, imagery, motion) is decided when each page is built, with the owner. See
[No visual prescription](#no-visual-prescription).

The system must scale to **millions of subscriptions**, and every decision must support:

- usability
- accessibility
- scalability
- maintainability
- performance
- frontend implementation
- responsive behaviour
- enterprise consistency

The deliverable must be production-ready and suitable for handoff to engineering without
ambiguity.

---

# Technology stack

> **Scope & portability.** The template deferred to the host repo's conventions and named a
> greenfield default. That reconciliation is done. **The versions below are what the repo
> runs** — a record, not a recommendation to re-evaluate.

**Framework** — Next.js 16 (App Router) · React 19 · TypeScript 5.

**Styling** — Tailwind v4 over the repo's token system. How styles are written is governed by
the code's own conventions and lint rules; what anything looks like is decided at build time.
This brief makes no styling decisions.

**Server state** — TanStack React Query (`staleTime` 60 s, no refetch on focus). **Local
state** — `useState`; filters that must survive a reload are URL search params. **No global
store, and no client-held session** — the JWT is an httpOnly cookie the browser attaches
itself, so there is no auth state for the client to own or get wrong.

**Transport** — axios, credentialed, reachable only from `use*` hooks in `lib/hooks`.

**Validation** — Zod v4. Request **and response** schemas are **generated** into
`lib/contract/` from the backend's OpenAPI document; form schemas are hand-written in
`lib/validations/`. Types are derived from schemas, never declared alongside them.

**Motion** — `motion`, via [`components/wrappers/motion-wrapper.tsx`](../components/wrappers/motion-wrapper.tsx).
`prefers-reduced-motion` is honoured globally.

**Icons** — `lucide-react`, the only icon set. **Dates** — `date-fns`. **Images** —
`next/image`. **Fonts** — `next/font`, self-hosted with `display: swap`.

**Domain-specific libraries** — none. No maps, no geo, no editor.

**Charts** — deferred. Usage history renders as a table until a real series exists to plot.

**Accessibility** — WCAG 2.2 AA.

**Testing** — Vitest, two projects. `node` covers the tooling (`tools/contract`,
`tools/codemods`, the seven lint rules) and the auth verification logic; `react` runs in
jsdom with `@testing-library/react` and covers the `common/` components that carry a product
principle — the meter, money, status and confirmation surfaces. **E2E** is Playwright: 23 tests
across 5 specs in `e2e/` (admin users, auth boundary, billing cycle, plan edit, usage history).

## Library selection policy

Do not assume or hardcode a third-party library. For each need:

1. **Reuse first.** If the repo already depends on a library for this need, use it. Do not
   introduce an alternative.
2. **Otherwise propose.** Name the package, say why it is the current default for a Next.js
   App Router + React + TypeScript stack, and state what it costs.
3. **Confirm before installing.** Never add a dependency unilaterally and never hand-edit
   `package.json`. Propose, wait for approval, then `pnpm add`.

Two decisions remain outstanding under this policy — **the E2E runner** and **charts**. The
component-test harness (`jsdom` + `@testing-library/react`) was proposed, approved and is now
wired in. See [known gaps](design-os/04-roadmap-and-qa.md#known-gaps-ranked).

---

# Design philosophy

Think in systems. Never think in pages first. Never jump directly into UI. Always begin with
product strategy.

Every output must be traceable. Every decision must reference previous phases. Avoid
assumptions unless necessary — and where an assumption is unavoidable, **record it as an
assumption rather than presenting it as a finding.**

---

# Required workflow

You MUST complete every phase before continuing. **Never skip phases. Never merge phases.**
Every phase must produce implementation-ready artifacts.

A phase marked settled below is not an invitation to skip it — it is the record of what that
phase produced, and the thing any change in that area must stay consistent with.

---

# The layering agreement

Meter's architecture is **enforced, not documented**. Seven custom ESLint rules live in
[`tools/eslint/rules/`](../tools/eslint/rules/); five of them, with `no-restricted-imports`
and `max-lines`, hold the boundaries below. If one fires, the design is wrong — not the rule.
The remaining two govern how styles are written; they belong to the code's conventions, not
to this brief.

## Layering: `route → section → component → hook → transport`

| Boundary                                            | Enforced by                                   |
| --------------------------------------------------- | --------------------------------------------- |
| Routes compose only — no inline components or data  | `starter/page-composes-only`                  |
| One component per file, filename matches its name   | `starter/one-component-per-file`              |
| Views never import the transport                    | `no-restricted-imports` on `@/lib/api-client` |
| Transport calls live in `use*` hooks in `lib/hooks` | `starter/api-access-boundary`                 |
| Shared types live in `lib/types`                    | `starter/domain-types-in-lib`                 |
| No comments in TS/TSX                               | `starter/no-comments`                         |
| Files stay under 150 lines                          | `max-lines`                                   |

**This is why the section layer exists.** A route file forbidden from declaring components or
data has nowhere to put page composition except sections. The lint rules and the folder
structure are the same decision expressed twice.

---

# Phase map

The ten phases are carried by nine documents. Each phase states where it lives and what code
it governs.

| Phases | Document                                                                   | Governs                                                    |
| ------ | -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1      | [00-product-definition.md](design-os/00-product-definition.md)             | Personas, business rules, product principles               |
| 2–3    | [01-information-architecture.md](design-os/01-information-architecture.md) | `lib/data/navigation.ts`, `proxy.ts`                       |
| 4      | [02-page-blueprints.md](design-os/02-page-blueprints.md)                   | `app/`                                                     |
| 5      | [06-section-blueprints.md](design-os/06-section-blueprints.md)             | `components/sections/`                                     |
| 6      | [07-component-library.md](design-os/07-component-library.md)               | Behaviour of `components/common/`, `layout/`, `ui/forms/`  |
| 7      | [03-frontend-architecture.md](design-os/03-frontend-architecture.md)       | `lib/`, the folder structure, the layering rule            |
| 8–9    | [04-roadmap-and-qa.md](design-os/04-roadmap-and-qa.md)                     | Known gaps, verification gates                             |
| next   | [05-billing-cycle-plan.md](design-os/05-billing-cycle-plan.md)             | Invoicing, scheduler, payments, reset                      |
| 10     | [design-os/README.md](design-os/README.md) + [repo README](../README.md)   | Navigation and orientation                                 |

Phase 6's document keeps its original filename: the numeric prefix and name are stable ids,
not a description of the phase (see [Deviations](#deviations-recorded)).

---

# PHASE 1 — Product Vision

**Lands in** [00-product-definition.md](design-os/00-product-definition.md). **Status:**
settled 2026-08-27.

Create the enterprise product vision. Include:

Business vision · Product purpose · Business goals · Value proposition · Competitive
positioning · Primary personas · Secondary personas · Jobs To Be Done · Business rules ·
Success metrics · KPIs · North Star metric · Governance · Platform constraints · Product
principles (how the product behaves and treats its users; no visual decisions) ·
Implementation philosophy · Non-goals · Future scalability considerations.

**Output:** a Product Vision document that becomes the single source of truth.

### Settled for Meter

North Star is **active subscriptions**. The root decision on record is the removal of
`MENTOR | STUDENT | GUARDIAN | SCHOOL_ADMIN` from `UserRole` — a vocabulary from a different
product with no model, service or endpoint behind it. `UserRole` is now `ADMIN | USER`, and
every persona descends from that.

The five product principles are binding on every later phase:

1. **The meter is the hero.** Every customer screen answers _am I within my limits_ first.
2. **Money is never ambiguous.** Amounts carry currency, periods carry both endpoints, status
   is a word — never a colour alone.
3. **Destructive actions confirm.** Cancel, deactivate and delete all take a second step.
4. **Built for the repeat visit.** Meter is a console an operator returns to daily; it is
   optimised for finding and acting, not for a first impression. The public landing route `/`
   is the one surface whose job is the first impression.
5. **Empty, loading and error are designed states**, not afterthoughts.

---

# PHASE 2 — Experience Maps

**Lands in** [01-information-architecture.md](design-os/01-information-architecture.md).

Design experiences before pages. Create experience maps for the primary flows, the role
dashboards, and the supporting flows.

For each experience include:

User intent · Trigger · Entry points · Journey · Decision points · Emotional state · Failure
paths · Recovery paths · System behaviour · Completion criteria · Dependencies.

### Settled for Meter

Six maps, and every route traces to one:

| Map | Flow                                                |
| --- | --------------------------------------------------- |
| E1  | Select a plan (Customer, first run)                 |
| E2  | Monitor usage (Customer, recurring — the core loop) |
| E3  | Pay & retrieve invoices (Customer)                  |
| E4  | Change or cancel (Customer)                         |
| E5  | Administer the catalogue (Billing Admin)            |
| E6  | Watch platform health (Internal Ops)                |

**A new flow gets a map before it gets a route.** E2 is the loop the product lives or dies on;
weigh changes against it first.

---

# PHASE 3 — Information Architecture

**Lands in** [01-information-architecture.md](design-os/01-information-architecture.md).
**Governs** [`lib/data/navigation.ts`](../lib/data/navigation.ts) and
[`proxy.ts`](../proxy.ts).

Using the experience maps, design:

Navigation hierarchy · Sitemap · Content hierarchy · Role-based navigation · Permissions ·
Content taxonomy · Labelling conventions · Cross-linking · Search hierarchy · Filtering
hierarchy · SEO hierarchy · Breadcrumb strategy · Empty routes · Fallback routes · Future
expansion strategy.

### Settled for Meter

Two route groups behind one shell:

```
/                        landing (public)
/auth/*                  login · register · forgot-password · reset-password
(app)/
  /dashboard             customer overview
  /plans                 plan catalogue
  /subscription          current subscription
  /usage                 usage detail
  /invoices  /invoices/[id]
  /settings
  /admin  /admin/plans  /admin/subscriptions  /admin/invoices
```

Permissions are enforced server-side before render, not by a client gate. `AppShell` reads
`role` from `GET /users/me` **only** to decide whether to render the admin nav group — never
to authorise.

**Adding a route means adding it to the sitemap, to `navigation.ts`, and to the permission
table in the same change.**

---

# PHASE 4 — Page Blueprints

**Lands in** [02-page-blueprints.md](design-os/02-page-blueprints.md).
**Governs** [`app/`](../app/).

For every page create functional blueprints. For each page define:

Purpose · Business objective · User objective · Primary tasks · Content requirements (the
information and actions the page must offer, in priority order; never layout, placement or
module names that imply a layout) · Required data · Permissions · Device needs (what users on
each device need to do; never layout) · Loading states · Empty states · Error states · Success
states · Actions · Dependencies · Implementation notes.

**All four states are mandatory on every data surface.** A page blueprint that omits its empty
state is incomplete, not concise.

### Settled for Meter — the 17 routes

The template's generic page list (Search, Compare, Favourites, Messages, Help Center, …) was a
marketplace vocabulary. Meter's actual surface:

| Route                   | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `/`                     | Landing — the public entry point               |
| `/auth/login`           | Authenticate                                   |
| `/auth/register`        | Create an account                              |
| `/auth/forgot-password` | Request a reset                                |
| `/auth/reset-password`  | Complete a reset                               |
| `/dashboard`            | Customer overview — plan, next invoice, meters |
| `/plans`                | Plan catalogue (the `DOMAIN_TRANSACTION`)      |
| `/subscription`         | Current subscription, change and cancel        |
| `/usage`                | Usage detail across the three dimensions       |
| `/invoices`             | Invoice list                                   |
| `/invoices/[id]`        | Invoice detail                                 |
| `/settings`             | Profile, account, payment methods              |
| `/admin`                | Ops overview — platform health                 |
| `/admin/plans`          | Catalogue administration                       |
| `/admin/users`          | Customer lookup; suspend and restore access    |
| `/admin/subscriptions`  | Subscription oversight                         |
| `/admin/invoices`       | Invoice health, overdue                        |

Plus `not-found` and `error` as designed states, not defaults.

**Not built, and deliberately:** Search, Compare, Favourites, Saved items, Messages,
Notifications, Help Center, 500. They belong to the template's marketplace vocabulary and have
no persona, flow or endpoint behind them in this product. Listed here so their absence is a
decision on record rather than an oversight.

---

# PHASE 5 — Section Blueprints

**Lands in** [06-section-blueprints.md](design-os/06-section-blueprints.md).
**Governs** [`components/sections/`](../components/sections/), one folder per route.

Break every page into sections by the job each one does. Each section must include:

Purpose · Responsibilities · Content model · Data requirements · Interaction model · Controls
· Device needs · Accessibility requirements · Loading states · Error states · Empty states ·
Reuse potential · Technical notes.

**No section should solve multiple unrelated jobs.** Describe content and behaviour only.
Never specify layout, order on screen, sizing, imagery, animation or wireframes.

### Settled for Meter

44 sections across 9 folders: `admin/` (13), `auth/` (4), `dashboard/` (3), `invoices/` (3),
`landing/` (2), `plans/` (3), `settings/` (5), `subscription/` (4), `usage/` (7).

The one-job rule is why `/subscription` is four files — `subscription-detail`,
`subscription-facts`, `subscription-actions`, `subscription-history` — rather than one, and
**why a section that grows past 150 lines is telling you it has taken on a second job.** The
`max-lines` rule turns that from advice into a gate.

---

# PHASE 6 — Interaction Contracts

**Lands in** [07-component-library.md](design-os/07-component-library.md).
**Governs** the behaviour of [`components/common/`](../components/common/),
[`components/layout/`](../components/layout/) and [`components/ui/forms/`](../components/ui/forms/).

Define how every interactive element behaves. Contracts describe behaviour, never appearance.
Which components exist, how they are grouped and how they look is decided when pages are
built. For every interactive element specify:

Name · Purpose · Inputs (the data it takes) · States · Accessibility · Keyboard support · ARIA
· Interaction patterns · Validation rules · Loading behaviour · Error behaviour · Content rules
· Do · Don't · Dependencies.

### Settled for Meter — contracts over the 33 built components

**`common/` (16)** — Button · LinkButton · PageHeader · SectionCard · StatCard · StatusPill ·
UsageMeter · DataTable · DetailRow · EmptyState · ErrorState · Skeleton · ConfirmDialog ·
Money · PeriodRange · FormField.

**`layout/` (6)** — AppShell · Sidebar · SidebarGroup · Topbar · ThemeToggle · AuthCard.

**`ui/forms/` (9)** — TextInput · TextAreaInput · SelectInput · CheckBoxInput · ToggleInput ·
PickInput · CalendarInput · FileInput · InputTemplate.

**`providers/` (1)** Provider (React Query) · **`wrappers/` (1)** MotionWrapper.

This inventory is a record of what is built, not a prescription of what must exist. Three
contracts carry the product's principles directly:

- **UsageMeter** is the hero interaction and must expose `role="progressbar"` with
  `aria-valuenow/min/max`.
- **Money** and **PeriodRange** exist so that no component formats an amount or a period by
  hand — principle 2 made structural.
- **ConfirmDialog** is the second step every destructive action takes — principle 3. It
  closes on Escape and restores focus to its trigger.

---

# PHASE 7 — Frontend Architecture

**Lands in** [03-frontend-architecture.md](design-os/03-frontend-architecture.md).

Design the frontend architecture. Styling organisation follows the code's own conventions and
is not specified here. Generate:

Folder structure · Route structure · Layouts · Providers · Feature folders · Hooks · Utilities
· Constants · Contexts · Stores · API organization · Component organization · Shared libraries
· Asset organization · Naming conventions · Code splitting strategy · Lazy loading ·
Performance strategy.

### Settled for Meter — folder structure

```
proxy.ts                 server-side route + admin gate
app/
  layout.tsx  page.tsx  not-found.tsx  error.tsx
  auth/       layout.tsx + login | register | forgot-password | reset-password
  (app)/      layout.tsx + dashboard | plans | subscription | usage
              | invoices | invoices/[id] | settings | admin/*
components/
  common/     the reusable library (Phase 6)
  layout/     AppShell, Sidebar, SidebarGroup, Topbar, ThemeToggle, AuthCard
  sections/   one folder per route; each file is a composable section
  ui/forms/   input primitives
  providers/  Provider (React Query)
  wrappers/   MotionWrapper
lib/
  api-client.ts        transport — credentialed; reachable only from lib/hooks
  auth/                verify-token (Edge, WebCrypto) + its tests
  contract/            generated from OpenAPI; never hand-edited
  errors/              typed transport failure
  hooks/               one use-<resource> per endpoint group, plus query-keys
  types/               domain response types, api envelope, table column
  data/                navigation, metric descriptors, status and plan options
  utils/               formatters, usage normaliser, status tones, form errors, clock
  validations/         zod form schemas
styles/                the code's styling layer (not governed by this brief)
tools/
  eslint/rules/  the seven rules · contract/  generator · codemods/
```

**No stores and no contexts.** The template listed both; Meter has neither, because React
Query owns server state and the session is an httpOnly cookie the client never reads. Recorded
so their absence is legible as a decision.

### Data layer

React Query owns server state. Query keys are centralised in
[`lib/hooks/query-keys.ts`](../lib/hooks/query-keys.ts) so invalidation after a mutation is a
lookup, not a guess. **Mutations that change billing state invalidate the subscription, usage
and invoice keys together**, because the backend changes all three in one transaction.

### The contract is generated

`lib/contract/` is generated from the backend's OpenAPI document — `pnpm openapi` in
`../backend`, then `pnpm contract` here. **Never hand-edit it.**

Every backend operation declares its success shape — `@ApiOkResponse`, `@ApiCreatedResponse`
or `@ApiNoContentResponse` — so responses generate alongside requests. `lib/types/` holds
domain aliases over those generated schemas (`Subscription` for `SubscriptionDto`), never
hand-written mirrors of the Prisma models. The only shape still written by hand is
`SessionClaims`, the JWT payload — not an API response, so nothing generates it.

**If you add a Nest handler, give it a response decorator in the same commit.** A handler
without one silently drops its shape out of the frontend's type system.

### Authentication boundary

The JWT is an **httpOnly cookie** issued by the backend, cleared by `POST /auth/logout`;
`HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in production. No script on the page can read
it, and nothing about the session touches `localStorage`.

Tokens are signed **RS256**. The backend holds the private key; this app is given only the
public half (`AUTH_JWT_PUBLIC_KEY`), so nothing secret crosses the boundary and the two
services stay independently deployable.

[`proxy.ts`](../proxy.ts) runs before render and rejects any token whose signature
fails, whose `alg` is not `RS256` (closing the `alg: none` downgrade), or whose `exp` has
passed; redirects unauthenticated visitors to `/auth/login?next=<path>`; keeps non-admins out
of `/admin/*`; bounces signed-in visitors away from `/auth/*`. It **fails closed** — an unset
public key sends every protected route to login rather than falling open.

Verification uses WebCrypto (`RSASSA-PKCS1-v1_5` / SHA-256) so it runs in the Edge runtime
with **no dependency on either side**, and is tested against a real keypair in
[`verify-token.test.ts`](../lib/auth/verify-token.test.ts).

**Middleware is a routing layer. The backend remains the authority** — `JwtAuthGuard` +
`RolesGuard` verify independently on every request.

### Performance

Server Components by default; `"use client"` only where interaction demands it — in practice
every screen that reads React Query, so sections are client while layouts and routes stay
server where they can. Route-level code splitting is automatic.

---

# PHASE 8 — Implementation Roadmap

**Lands in** [04-roadmap-and-qa.md](design-os/04-roadmap-and-qa.md) and
[05-billing-cycle-plan.md](design-os/05-billing-cycle-plan.md).

Produce a complete implementation roadmap. Include:

Development phases · Priority order · Sprint breakdown · Milestones · Dependencies · Risk
assessment · Technical debt prevention · Testing strategy · Deployment readiness.

### Settled for Meter — eight delivered stages

The template asked for a sprint breakdown across `{{TIMELINE_WEEKS}}` weeks. Meter records
**delivered stages instead of estimated weeks**, because the stages are verifiable after the
fact and the weeks were never measured. The substitution is the honest one; do not
retroactively invent a week count.

| Stage | Outcome                                                                                                  |
| ----- | -------------------------------------------------------------------------------------------------------- |
| 1     | Transport rewritten, token registry deduplicated, dark theme, build green                                |
| 2     | Backend boots; OpenAPI emitted; contract covers 33 routes / 12 schemas                                   |
| 3     | Product definition settled; IA, blueprints, architecture recorded                                        |
| 4     | App shell, auth, route protection, hooks for every endpoint group                                        |
| 5     | Customer surfaces (dashboard, plans, subscription, usage, invoices, settings) and admin surfaces         |
| 6     | Auth moved to an httpOnly cookie; `proxy.ts` enforces routes and admin access server-side                |
| 7     | RS256 keypair signing; the proxy verifies signatures with WebCrypto, no shared secret                    |
| 8     | Response schemas on all 49 backend operations; frontend types generated end to end; Vitest renders React |

Stage 1 is a record of what was delivered, not a visual requirement.

**Next body of work — the billing cycle:** invoice generation, the scheduler, payment methods,
password reset, and the two schema findings that block them (usage limits read from the wrong
field; `@@unique([userId, status])` making billing history impossible). That plan carries its
own open decisions — [read it](design-os/05-billing-cycle-plan.md) before starting any of it.

**Technical debt prevention** is structural rather than scheduled: the seven lint rules, the
150-line ceiling, and the generated contract each remove a class of drift that would otherwise
need a cleanup sprint.

---

# PHASE 9 — Quality Assurance

**Lands in** [04-roadmap-and-qa.md](design-os/04-roadmap-and-qa.md).

Review the entire system. QA here is functional; visual quality is judged when each page is
built. Validate:

Accessibility · Behavioural consistency (the same action works the same way everywhere) ·
Responsiveness · Scalability · Performance · State coverage · Error handling · Loading
behaviour · Frontend readiness · Developer experience · SEO readiness · Maintainability ·
Cross-browser compatibility · WCAG compliance.

### Settled for Meter

**Verification gates** — `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm build`, all green
before merge. `pnpm test` runs both Vitest projects: `node` for tooling, logic and auth
verification, `react` in jsdom for React.

**Accessibility** — every input labelled · every interactive element shows visible focus ·
meters carry `role="progressbar"` with `aria-valuenow/min/max` · dialogs close on Escape and
restore focus to the trigger · status is never colour-only, always a word ·
`prefers-reduced-motion` honoured globally.

The meter and dialog halves of that list are now **asserted by component tests rather than
claimed**. Writing them found a real defect: an over-limit meter reported `aria-valuenow="250"`
against `aria-valuemax="100"`, which is invalid ARIA. The value is now clamped to the track
maximum while the visible text still states the true percentage.

**States** — every data surface has loading, empty, error and success, verified per page in
[the blueprints](design-os/02-page-blueprints.md#the-page-contract).

**Responsive** — every customer and admin surface stays fully operable from phone width up:
the shell, the meters, the plan catalogue and the tables lose no information and no action on
a small screen. How each adapts is a build decision.

**The standing lesson from this phase:** the most serious defects — a decorator ignoring its
argument, an IDOR on invoices, a swallowed error `cause` — were invisible to reading,
type-checking and linting. They appeared the first time a real request hit a real database.
**Static gates are necessary and not sufficient; run the thing.**

---

# PHASE 10 — Ancillary Documentation & Navigation

**Lands in** [design-os/README.md](design-os/README.md) and the [repo README](../README.md).

Generate supporting documentation that helps teams navigate and use the design OS.

> **Meter's resolution, stated before the specification below.** The template specifies six
> ancillary files as navigation over a fifteen-file set. Meter's design OS is nine documents.
> Six files do not need an index, a start-here and a separate artifact index — that scaffolding
> would be longer than the thing it indexes, and every line of it can drift out of sync with
> the code.
>
> **Two files carry the whole job:**
>
> - **[design-os/README.md](design-os/README.md)** — the document table, a one-paragraph
>   product summary, and where the rules live.
> - **[the repo README](../README.md)** — getting started, the contract workflow, the
>   authentication model, the layering table.
>
> The six specifications are **retained below and marked superseded**, each with where its
> content actually went. They are kept rather than deleted so that a future reader can see what
> was traded away and re-open the trade if the document set grows. **If `docs/design-os/` ever
> exceeds roughly ten documents, revisit this decision** — the arithmetic that justifies it
> stops holding.

## 10.1 — START_HERE.md · superseded

**Purpose:** quick entry point for new users discovering the design OS.

**Would contain:** what the design OS contains · file listing with purpose · a 3-step workflow
(Read → Copy → Execute) · next-session instructions · a quick reference table (I want to… → Go
to…). **Length:** ~150–200 lines. **Tone:** friendly, action-oriented, zero friction.

**Superseded by** the [design-os README](design-os/README.md) table, whose _Read it when_
column is the quick reference this file would have carried.

## 10.2 — README.md · built

**Purpose:** 5-minute comprehensive overview. The "what is this?" document.

**Would contain:** 30-second summary, including that the design OS defines what the product
does and leaves how it looks to the build · quick start · complete file listing with purpose ·
how to use it per role (Product, Design, Engineering, QA) · key statistics · getting started ·
design OS philosophy. **Length:** ~180–220 lines. **Tone:** professional, reference-style.

**Built**, as [design-os/README.md](design-os/README.md) — shorter than specified, because the
per-role reading paths collapsed into one table for nine documents.

## 10.3 — DESIGN-OS-COMPLETE.md · superseded

**Purpose:** master index and summary. Single source of truth for what exists.

**Would contain:** executive summary · complete deliverable list with descriptions ·
deliverable statistics · cross-references between phases · what is included vs. not · version
and date. **Length:** ~250–300 lines. **Tone:** authoritative, index-style.

**Superseded by** [Complete deliverables summary](#complete-deliverables-summary) in this
document, which is the same index against the real file set.

## 10.4 — ARTIFACT_INDEX.md · superseded

**Purpose:** detailed index with deep descriptions, mapping each phase to its use case.

**Would contain:** every phase with a long description, who needs it, when to reference it,
what it contains, and how it flows to other phases · reading-order recommendations per role ·
search keywords. **Length:** ~300–350 lines. **Tone:** reference, detailed.

**Superseded by** the [Phase map](#phase-map) here and the _Governs_ line on each phase, which
carry the phase-to-code mapping this file would have described in prose.

## 10.5 — SETUP-CHECKLIST.md · superseded

**Purpose:** implementation setup walkthrough.

**Would contain:** prerequisites · environment setup · project initialisation · testing setup
· developer workflow (git hooks, linting, formatting) · verification checklist. **Length:**
~250–300 lines. **Tone:** instructional, numbered.

**Superseded by** the [repo README](../README.md), which carries getting-started and the
contract workflow against the real commands. **A setup checklist that duplicates the README
is the file most likely to rot**, because nothing fails when it drifts.

## 10.6 — IMPLEMENTATION_PROMPT.md · superseded

**Purpose:** self-contained implementation guide synthesising all phases into engineering
action items.

**Would contain:** required reading (Phases 1–6) · the Visual Design Hand-off, verbatim ·
Phase 7 architecture setup · Phase 8 sprint breakdown · Phase 9 QA checklist · code, page and
hook templates · testing strategy · pre-merge checklist · deployment readiness. **Length:**
~700–1000 lines. **Tone:** technical, directive.

**Superseded by** two things that outrank a document: **the seven lint rules**, which enforce
what this file would have asked engineers to remember, and **the phase documents themselves**,
which are the implementation guide.

The one part no lint rule can carry is the **Visual Design Hand-off**. It survives here
verbatim and binds every page built in this repo:

> "This design OS defines what each page must do, not how it looks. The look of each page is
> decided when it is built: before coding a page, run a visual concept for it with the repo's
> UI skills, present it to the owner, and build only after approval. Review the rendered page
> before marking it Built."

## 10.7 Output requirements for Phase 10 · amended

The template requires exactly 6 ancillary files. **Meter produces 2.** All documents must
still: cross-reference each other · reference the phases consistently · use identical
formatting conventions · maintain consistent tone · include version and date information ·
include a table of contents where the file exceeds 250 lines.

---

# Complete deliverables summary

## Critical references

**No visual prescription** ([Critical rules](#no-visual-prescription)) — this design OS
defines what the product does. How anything looks is decided when each page is built, with
the owner. This applies across all ten phases, and the
[Visual Design Hand-off](#106--implementation_promptmd--superseded) binds every build.

## The design OS (9 files)

| Path                                                                                        | Phases | Status      |
| ------------------------------------------------------------------------------------------- | ------ | ----------- |
| [`docs/design-os/00-product-definition.md`](design-os/00-product-definition.md)             | 1      | Settled     |
| [`docs/design-os/01-information-architecture.md`](design-os/01-information-architecture.md) | 2–3    | Settled     |
| [`docs/design-os/02-page-blueprints.md`](design-os/02-page-blueprints.md)                   | 4      | Settled     |
| [`docs/design-os/03-frontend-architecture.md`](design-os/03-frontend-architecture.md)       | 7      | Settled     |
| [`docs/design-os/04-roadmap-and-qa.md`](design-os/04-roadmap-and-qa.md)                     | 8–9    | Settled     |
| [`docs/design-os/05-billing-cycle-plan.md`](design-os/05-billing-cycle-plan.md)             | next   | In progress |
| [`docs/design-os/06-section-blueprints.md`](design-os/06-section-blueprints.md)             | 5      | Settled     |
| [`docs/design-os/07-component-library.md`](design-os/07-component-library.md)               | 6      | Settled     |
| [`docs/design-os/README.md`](design-os/README.md)                                           | 10     | Settled     |

## Supporting documents

| Path                                                  | Purpose                                                          |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| [`docs/MOTION.md`](MOTION.md)                         | Code conventions for `MotionWrapper`; not governed by this brief |
| [`docs/from-idea-to-click.md`](from-idea-to-click.md) | Narrative walkthrough of the system                              |
| [the repo README](../README.md)                       | Getting started, contract workflow, auth model                   |
| This document                                         | The standing brief governing all of the above                    |

**Total: 9 design-OS files + 4 supporting documents.** The template's 15 (9 phase files + 6
ancillary) is [recorded as a deviation](#deviations-recorded), not silently dropped.

---

# Functional standards

The resulting product must be: highly usable · mobile-first · responsive · accessible · fast ·
SEO-friendly · conversion-focused.

**Amended for the console.** "Conversion-focused" is the job of `/` and the plan catalogue.
Inside the console, read it as optimised for the operator's repeat visit
([principle 4](#settled-for-meter)).

Every page must support:

- Loading states
- Empty states
- Error states
- Offline behaviour where appropriate
- Keyboard navigation
- Screen reader compatibility
- Progressive enhancement

---

# Cross-file linking requirements

All 9 design-OS files must be interconnected:

1. **Phase documents** reference each other in **phase order**, which is not filename order:
   `00` → `01` → `02` → `06` → `07` → `03` → `04`. **The numeric prefix is a stable id
   recording when a document was added, not its place in the sequence** — `06` and `07` were split
   out of `02` after it was already numbered. Read the phase column, not the filename.
2. **A phase document must not contradict the phases above it.**
3. **[design-os/README.md](design-os/README.md)** is the entry point, directing readers to each
   document and to where the rules live.
4. **Every phase document links the code it governs.** A document that names no file is a
   description; one that links the file is a contract.
5. Consistent file naming, formatting and structure across all files.
6. **This document links every design-OS file, and every design-OS file links back to it.**

---

# Critical rules

1. **Never skip a phase, and never merge two.**
2. **Never jump straight to UI.**
3. **Always explain design decisions** — including the ones that were rejected.
4. **Maintain traceability** — every decision references the phase above it.
5. **Think in systems, not pages.**
6. **Optimise for engineering implementation.** Avoid vague descriptions; every artifact is
   production-ready.
7. **Link documents to the code they govern.** A phase document that names no file is a
   description; one that links the file is a contract.
8. **Record deviations rather than omitting them silently** — a documented departure is a
   decision, an undocumented one is a gap.
9. **If a lint rule fires, the design is wrong.** Fix the design; do not add a disable comment
   — `no-comments` will reject it anyway.
10. **Never add a dependency unilaterally.**
11. **When this document and the code disagree on what this brief governs, one of them is a
    bug.** Decide which, then fix that one. Do not leave the disagreement standing. The look
    is not in scope: it lives in the code and changes with the owner at build time.
12. **Never prescribe visual design** — see below.

## No visual prescription

Never prescribe visual design. No colours, fonts, sizes, spacing, layouts, placement ("banner
here", "hero with image"), imagery, animation, visual references or wireframes, in any phase
or in any implementation guidance.

Describe what users need, what information and actions each page must offer and in what
priority, and how it behaves. Never how it looks or where things sit.

The look of each page is decided when it is built, with the owner.

---

# Output contract

**Location.** All design-OS documents are written into [`docs/design-os/`](design-os/) as
individual `.md` files. **Never concatenate them into one blob and never deliver a phase as a
chat response only.**

| Path                                                                                        | Phases |
| ------------------------------------------------------------------------------------------- | ------ |
| [`docs/design-os/00-product-definition.md`](design-os/00-product-definition.md)             | 1      |
| [`docs/design-os/01-information-architecture.md`](design-os/01-information-architecture.md) | 2–3    |
| [`docs/design-os/02-page-blueprints.md`](design-os/02-page-blueprints.md)                   | 4      |
| [`docs/design-os/03-frontend-architecture.md`](design-os/03-frontend-architecture.md)       | 7      |
| [`docs/design-os/04-roadmap-and-qa.md`](design-os/04-roadmap-and-qa.md)                     | 8–9    |
| [`docs/design-os/06-section-blueprints.md`](design-os/06-section-blueprints.md)             | 5      |
| [`docs/design-os/07-component-library.md`](design-os/07-component-library.md)               | 6      |
| [`docs/design-os/README.md`](design-os/README.md)                                           | 10     |

**Work in progress** that is not yet a phase gets its own numbered plan —
[`05-billing-cycle-plan.md`](design-os/05-billing-cycle-plan.md) is the pattern: findings
first, phased work second, open decisions listed explicitly at the end.

**Delivery mode.** One file per artifact, written to disk. Cross-links between files use
relative paths within `docs/design-os/`; links into code use relative paths out of it.

**Ordering.** Dependency order. A phase may reference the phases above it and must not
contradict them.

**Regeneration.** A run over `docs/design-os/` is a **merge, not an overwrite**: every page,
section, interaction contract, flow, persona, role and state already defined survives.
Visual prescriptions from earlier runs (tokens, palettes, layouts, wireframes, styling
approaches) are not features: drop them and list them as changed. The current documents
predate this rule and still carry some — `03`, `06` and `07` in particular. Until they are
regenerated, where they describe the look they describe the code as built, not a requirement.

**Completion signal.** After writing, **state which files changed and confirm the cross-links
resolve.** Do not consider the task complete until that manifest is stated.

---

# Output format

Generate markdown files with:

- Consistent heading hierarchy (`#` title, `##` major section, `###` subsection)
- A table of contents in files over 250 lines
- Relative markdown links between documents and into the code they govern
- Status or date stamps where a document records a decision
- Examples where appropriate, in text and data only: no wireframes, mockups or ASCII layouts
- Implementation notes for engineers

Each file is self-contained but interconnected with the others.

---

# Deviations, recorded

Where Meter departs from the generic template it was generated from, and why.

| Departure                                          | Reason                                                                                                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **9 documents, not 15**                            | Seven files carry Phases 1–9, the README carries Phase 10, and one is work in progress. Phases 4, 5 and 6 were split apart once each outgrew a shared file. Revisit past ~12. |
| **Phase 10's six ancillary files reduced to two**  | START_HERE, DESIGN-OS-COMPLETE, ARTIFACT_INDEX, SETUP-CHECKLIST and IMPLEMENTATION_PROMPT are navigation layers; their specs are retained above and marked superseded.         |
| **Phase 6 lands in `07-component-library.md`**     | The file predates the phase's rename to Interaction Contracts. Filenames are stable ids; renaming would break every inbound link for no gain in meaning.                       |
| **Stages instead of `{{TIMELINE_WEEKS}}`**         | Eight stages were delivered and are verifiable; the week count never was. Recording an unmeasured estimate would be a fabrication.                                             |
| **Template page list replaced**                    | Search, Compare, Favourites, Messages and Help Center are marketplace vocabulary with no persona, flow or endpoint in this product.                                            |
| **No stores, no contexts**                         | React Query owns server state and the session is an httpOnly cookie the client never reads. Neither layer has a job.                                                           |
| **Charts without a library**                       | Three single-series usage charts did not justify a charting dependency. How they are drawn is a build decision.                                                                |
| **No E2E tests**                                   | Needs Playwright, which the Library Selection Policy says is proposed, not installed unilaterally. Component tests now exist.                                                  |
| **`no-comments` extends the template's standards** | Explanation belongs in these documents, where it is reviewable, not scattered through TSX where it rots.                                                                       |

---

_Meter · Design OS Brief · template placeholders resolved 2026-08-27 · rewritten
project-specific 2026-09-03 · full specification restored and re-resolved 2026-09-06 · visual
prescription removed 2026-09-28_
