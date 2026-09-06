# Meter — Design OS Brief

> This was a portable template with `{{PLACEHOLDERS}}`. It has been run: the placeholders are
> resolved, the system it describes is built, and the documents it specifies are in
> [`docs/design-os/`](design-os/). It is now **Meter's standing brief** — the contract that
> governs regeneration, extension, and review of this codebase, not a prompt awaiting a first
> execution.
>
> Read it when you are adding a surface, changing an architectural boundary, or auditing
> whether the code still matches the design system. If this document and the code disagree,
> one of them is a bug — decide which, then fix that one.

---

## Contents

- [What this governs](#what-this-governs)
- [Product constants](#product-constants)
- [Technology stack](#technology-stack)
- [The three agreements](#the-three-agreements)
- [Phase map](#phase-map)
- [Phases 1–11](#phase-1--product-vision)
- [Output contract](#output-contract)
- [Critical rules](#critical-rules)
- [Deviations, recorded](#deviations-recorded)

---

## What this governs

You are operating as Design System Lead, Product Designer, Information Architect, Frontend
Architect, and Senior Next.js engineer on **Meter** — a B2B subscription-billing and
usage-metering console.

The reference bar is **Stripe Billing, Chargebee, Paddle, Orb**. Not a landing page with a
pricing table: a console an operator lives in.

The deliverable is a system that supports millions of subscriptions and hands off to
engineering without ambiguity. Every decision must serve usability, accessibility,
scalability, maintainability, performance, responsive behaviour, and enterprise consistency —
and must be traceable to the phase above it.

**Think in systems, never in pages.** Never begin at UI. Begin at product strategy, and let
each phase reference the one before it. Where an assumption is unavoidable, record it as an
assumption rather than presenting it as a finding.

---

## Product constants

These are settled. Nothing in this repo may re-derive them; see
[00-product-definition.md](design-os/00-product-definition.md) for the reasoning behind each.

| Constant           | Value                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Product            | **Meter**                                                                                          |
| Domain             | Subscription billing & usage metering (B2B SaaS)                                                   |
| Reference products | Stripe Billing, Chargebee, Paddle, Orb                                                             |
| Personas           | Customer (`USER`), Billing Admin (`ADMIN`), Internal Ops (`ADMIN`)                                 |
| Core entity        | **Subscription** / Subscriptions                                                                   |
| Primary flows      | Select a plan · Monitor usage against limits · Pay and retrieve invoices · Change or cancel a plan |
| Supporting flows   | Authentication, onboarding, profile, plan-catalogue administration, ops oversight                  |
| Role dashboards    | Customer dashboard (`/dashboard`), Admin console (`/admin`)                                        |
| Core transaction   | Plan selection / plan change — the billing-state mutation                                          |
| Hero interaction   | The **usage meter**: quota consumed vs. plan limit                                                 |
| Metered dimensions | `API_CALLS`, `STORAGE_GB`, `SEATS` — exactly these three                                           |
| Plan tiers         | `FREE`, `PRO`, `ENTERPRISE` — exactly these three                                                  |
| Theme variant      | Dark, derived from the same tokens (`.dark` in `styles/tokens.css`)                                |
| Domain libraries   | **None.** No maps, no geo, no editor. Charts deferred until a real series exists.                  |
| Output directory   | [`docs/design-os/`](design-os/)                                                                    |

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

## Technology stack

The versions below are what the repo runs, not a recommendation to re-evaluate.

**Framework** — Next.js 16 (App Router) · React 19 · TypeScript 5.

**Styling** — Tailwind v4 with token-mapped utilities only, no arbitrary values · CSS custom
properties as the single source of truth · named utility and pattern classes.

**Server state** — TanStack React Query (`staleTime` 60 s, no refetch on focus). **Local
state** — `useState`; filters that must survive a reload are URL search params. **No global
store, and no client-held session** — the JWT is an httpOnly cookie the browser attaches
itself, so there is no auth state for the client to own or get wrong.

**Transport** — axios, credentialed, reachable only from `use*` hooks in `lib/hooks`.

**Validation** — Zod v4. Request schemas are **generated** into `lib/contract/` from the
backend's OpenAPI document; form schemas are hand-written in `lib/validations/`. Types are
derived from schemas, never declared alongside them.

**Motion** — `motion`, via `components/wrappers/motion-wrapper.tsx`. Conventions in
[MOTION.md](MOTION.md). `prefers-reduced-motion` is honoured globally in `globals.css`.

**Icons** — `lucide-react`, the only icon set. **Dates** — `date-fns`. **Images** —
`next/image`. **Fonts** — `next/font`, three families self-hosted with `display: swap`.

**Accessibility** — WCAG 2.2 AA.

**Testing** — Vitest, currently `node` environment only: it covers the tooling
(`tools/contract`, `tools/codemods`, the seven lint rules) and the auth verification logic.
No React component is rendered in a test yet; that needs `jsdom` + `@testing-library/react`,
and E2E needs Playwright.

### Library selection policy

1. **Reuse first.** If the repo already depends on a library for the need, use it. Do not
   introduce an alternative.
2. **Otherwise propose.** Name the package, say why it is the current default for Next.js App
   Router + React + TypeScript, and state what it costs.
3. **Confirm before installing.** Never add a dependency unilaterally and never hand-edit
   `package.json`. Propose, wait for approval, then `pnpm add`.

The three outstanding dependency decisions — component-test harness, E2E runner, charts — are
all pending under this policy. See [known gaps](design-os/04-roadmap-and-qa.md#known-gaps-ranked).

---

## The three agreements

Meter's architecture is **enforced, not documented**. Seven custom ESLint rules in
[`tools/eslint/rules/`](../tools/eslint/rules/) hold these boundaries. If a rule fires, the
design is wrong — not the rule.

### 1. Styling is token-first, in three layers

| Layer                                               | Owns                                                                                                       |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`styles/tokens.css`](../styles/tokens.css)         | Every raw value, exactly once. Light palette on `:root`, dark overrides on `.dark`. Swap here to rebrand.  |
| [`styles/globals.css`](../styles/globals.css)       | `@theme` mapping tokens onto Tailwind names · reset · typography defaults · `.pad`/`.gap`/`.smooth` · a11y |
| [`styles/components.css`](../styles/components.css) | Named pattern classes: `.app-shell`, `.metric-grid`, `.usage-meter`, `.status-pill`, `.data-table`, …      |

Token groups are `--colors-*`, `--fonts-*`, `--spacing-*`, `--paddings-*`, `--margins-*`,
`--gaps-*`, `--radii-*`, `--shadows-*`, `--durations-*`, `--timing-*`, `--opacities-*`,
`--measures-*`, `--border-*`, `--icon-*`, `--z-*`. Every scale token is theme-independent; the
`.dark` block overrides colours and shadows only.

**Nothing outside `tokens.css` may declare a raw value.**

```
Where should this style live?
├─ A raw value (colour, spacing, duration, radius)? ────────→ styles/tokens.css
├─ Base typography (h1–h6, p, a) or an a11y default? ───────→ styles/globals.css
├─ A named scale (.pad, .gap, .smooth)? ────────────────────→ styles/globals.css
├─ A combo used more than once, or any breakpoint? ─────────→ styles/components.css
└─ Genuinely one-off? ─────────────────────→ token-mapped Tailwind utilities in the component
```

Two consequences worth stating plainly:

- **`components.css` is a deliberate departure from the generic template**, which put pattern
  classes in `globals.css`. With the shell, grids, meter, pill, table, dialog and states all
  named, that file would have doubled. The split mirrors the existing `tokens.css` import.
- Because `token-first-classnames` forbids breakpoint chains in JSX, **every breakpoint in the
  application lives in `components.css`** — responsive behaviour has one findable, auditable
  home.

Forbidden, without exception: `bg-[#1f4e3d]`, `p-[13px]`, a hex in a component, a duplicated
utility chain, a variant that re-declares a raw value instead of selecting a token.

### 2. Layering: `route → section → component → hook → transport`

| Boundary                                                  | Enforced by                                   |
| --------------------------------------------------------- | --------------------------------------------- |
| Routes compose only — no inline components or data        | `starter/page-composes-only`                  |
| One component per file, filename matches its name         | `starter/one-component-per-file`              |
| Views never import the transport                          | `no-restricted-imports` on `@/lib/api-client` |
| Transport calls live in `use*` hooks in `lib/hooks`       | `starter/api-access-boundary`                 |
| Shared types live in `lib/types`                          | `starter/domain-types-in-lib`                 |
| No raw values, no arbitrary values, no inline breakpoints | `starter/token-first-classnames`              |
| Console spacing ceiling and title scale                   | `starter/application-register-density`        |
| No comments in TS/TSX                                     | `starter/no-comments`                         |
| Files stay under 150 lines                                | `max-lines`                                   |

**This is why the section layer exists.** A route file forbidden from declaring components or
data has nowhere to put page composition except sections. The lint rules and the folder
structure are the same decision expressed twice.

### 3. Application register, not editorial

This is a console, not a marketing site. Dense spacing, `text-h4` page titles, no hero type,
no decorative scale. Enforced by `starter/application-register-density`. The single exception
is `/` — the landing route, which uses `.landing-hero` and `.landing-section`.

---

## Phase map

The eleven phases of the original template are carried by six documents. Each phase below
states where it lives and what code it governs.

| Phases | Document                                                                             | Governs                                              |
| ------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| 1      | [00-product-definition.md](design-os/00-product-definition.md)                       | Personas, business rules, design principles          |
| 2–3    | [01-information-architecture.md](design-os/01-information-architecture.md)           | `lib/data/navigation.ts`, `middleware.ts`            |
| 4–6    | [02-page-and-component-blueprints.md](design-os/02-page-and-component-blueprints.md) | `app/`, `components/sections/`, `components/common/` |
| 7–8    | [03-frontend-architecture.md](design-os/03-frontend-architecture.md)                 | `styles/`, `lib/`, the layering rule                 |
| 9–10   | [04-roadmap-and-qa.md](design-os/04-roadmap-and-qa.md)                               | Known gaps, verification gates                       |
| next   | [05-billing-cycle-plan.md](design-os/05-billing-cycle-plan.md)                       | Invoicing, scheduler, payments, reset                |
| 11     | [design-os/README.md](design-os/README.md) + [repo README](../README.md)             | Navigation and orientation                           |

---

# Phase 1 — Product Vision

**Lands in** [00-product-definition.md](design-os/00-product-definition.md). **Status:**
settled 2026-08-27.

Business vision, purpose, goals, value proposition, competitive positioning; primary,
secondary and internal personas; jobs to be done; business rules; success metrics and the
North Star; governance; platform constraints; design principles; implementation philosophy;
non-goals; future scalability.

**Settled for Meter:** North Star is **active subscriptions**. The root decision on record is
the removal of `MENTOR | STUDENT | GUARDIAN | SCHOOL_ADMIN` from `UserRole` — a vocabulary
from a different product with no model, service or endpoint behind it. `UserRole` is now
`ADMIN | USER`, and every persona descends from that.

The five design principles are binding on every later phase:

1. **The meter is the hero.** Every customer screen answers _am I within my limits_ first.
2. **Money is never ambiguous.** Amounts carry currency, periods carry both endpoints, status
   is a word — never a colour alone.
3. **Destructive actions confirm.** Cancel, deactivate, delete all take a second step.
4. **Application register, not editorial.**
5. **Empty, loading and error are designed states**, not afterthoughts.

---

# Phase 2 — Experience Maps

**Lands in** [01-information-architecture.md](design-os/01-information-architecture.md).

Design experiences before pages. Meter has six, and every route traces to one:

| Map | Flow                                                |
| --- | --------------------------------------------------- |
| E1  | Select a plan (Customer, first run)                 |
| E2  | Monitor usage (Customer, recurring — the core loop) |
| E3  | Pay & retrieve invoices (Customer)                  |
| E4  | Change or cancel (Customer)                         |
| E5  | Administer the catalogue (Billing Admin)            |
| E6  | Watch platform health (Internal Ops)                |

Each map carries: user intent · trigger · entry points · journey · decision points · emotional
state · failure paths · recovery paths · system behaviour · completion criteria · dependencies.

A new flow gets a map before it gets a route. E2 is the loop the product lives or dies on;
weigh changes against it first.

---

# Phase 3 — Information Architecture

**Lands in** [01-information-architecture.md](design-os/01-information-architecture.md).
**Governs** [`lib/data/navigation.ts`](../lib/data/navigation.ts) and
[`middleware.ts`](../middleware.ts).

Navigation hierarchy · sitemap · content hierarchy · role-based navigation · permissions ·
taxonomy · labelling conventions · cross-linking · search and filtering hierarchy · SEO ·
breadcrumbs · empty routes · fallback routes · expansion strategy.

**Settled for Meter.** Two route groups behind one shell:

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
to authorise. Adding a route means adding it to the sitemap, to `navigation.ts`, and to the
permission table in the same change.

---

# Phase 4 — Page Blueprints

**Lands in** [02-page-and-component-blueprints.md](design-os/02-page-and-component-blueprints.md).
**Governs** [`app/`](../app/).

Every page defines: purpose · business objective · user objective · primary tasks · modules ·
required data · permissions · responsive behaviour · loading, empty, error and success states
· actions · dependencies · implementation notes.

**All four states are mandatory on every data surface.** A page blueprint that omits its empty
state is incomplete, not concise.

Blueprinted: `/dashboard`, `/plans`, `/subscription`, `/usage`, `/invoices`, `/invoices/[id]`,
`/settings`, the four `/admin` screens, `/`, `/auth/*`, `not-found`, `error`.

---

# Phase 5 — Section Blueprints

**Lands in** [02-page-and-component-blueprints.md](design-os/02-page-and-component-blueprints.md).
**Governs** [`components/sections/`](../components/sections/), one folder per route.

Each section carries: purpose · responsibilities · hierarchy · content model · data
requirements · interaction model · controls · responsive behaviour · accessibility · loading,
error, skeleton and empty states · animation behaviour · reuse potential · technical notes.

**No section solves multiple unrelated jobs.** This is why `/subscription` is four files
(`subscription-detail`, `subscription-facts`, `subscription-actions`, `subscription-history`)
rather than one — and why a section that grows past 150 lines is telling you it has taken on
a second job.

---

# Phase 6 — Component Library

**Lands in** [02-page-and-component-blueprints.md](design-os/02-page-and-component-blueprints.md).
**Governs** [`components/common/`](../components/common/) and
[`components/layout/`](../components/layout/).

Prioritise reusable enterprise components. Avoid page-specific ones — if it is used once, it
is a section, not a component.

For each component specify: name · purpose · variants · props · slots · **styling approach** ·
tokens consumed · states · accessibility · keyboard support · ARIA · responsive behaviour ·
composition rules · interaction patterns · validation · animation · loading behaviour · error
behaviour · content rules · do / don't · anti-patterns · dependencies · examples.

The **styling approach** entry is not optional. It names the classes the component composes,
lists the tokens it consumes, promotes any twice-used combo to `components.css`, and asserts:
_this component hardcodes no raw values and references tokens and named classes only._

**The library:** Button · LinkButton · PageHeader · SectionCard · StatCard · StatusPill ·
UsageMeter · DataTable · DetailRow · EmptyState · ErrorState · Skeleton · ConfirmDialog ·
Money · PeriodRange · FormField, plus the `ui/forms/` input primitives and the layout set
(AppShell, Sidebar, SidebarGroup, Topbar, ThemeToggle, AuthCard).

Two of these carry the product's principles directly: **UsageMeter** is the hero interaction
and must expose `role="progressbar"` with `aria-valuenow/min/max`; **Money** and
**PeriodRange** exist so that no component formats an amount or a period by hand.

### Component styling standards

1. Token-only values — every value comes from a token.
2. No arbitrary Tailwind values — `bg-accent`, never `bg-[#1f4e3d]`.
3. No repeated chains — a combo used twice becomes a named class.
4. Variants select tokens and named classes; they never re-declare raw values.
5. One source of truth per recurring decision.
6. Components meant to look alike reference the same class.

All six are lint-enforced. Failing them is a design problem to rework, not a lint error to
silence.

---

# Phase 7 — Design Tokens

**Lands in** [03-frontend-architecture.md](design-os/03-frontend-architecture.md).
**Governs** [`styles/`](../styles/).

Colours · typography · spacing · sizing · elevation · radii · motion · transitions · opacity ·
shadows · breakpoints · grid · container widths · icon sizes · focus rings · z-index · dark
mode · semantic tokens · component tokens.

See [the styling agreement](#1-styling-is-token-first-in-three-layers) for the layer contract.

Two corrections made when this phase closed, worth remembering because both are easy to
reintroduce:

- The seven `--stat-card-*` tokens hardcoded hex and px that duplicated existing tokens. They
  now alias `--colors-*`, `--paddings-*`, `--radii-*`, `--shadows-*`. **This aliasing is what
  makes a theme swap possible at all** — a component token that holds its own raw value is a
  theme leak.
- `.metric-icon` referenced `--metric-color-rgb`, which was never defined: dead CSS. It now
  uses `color-mix()`, so no parallel RGB token exists to drift.

---

# Phase 8 — Frontend Architecture

**Lands in** [03-frontend-architecture.md](design-os/03-frontend-architecture.md).

### Folder structure

```
middleware.ts            server-side route + admin gate
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
styles/
  tokens.css  globals.css  components.css
tools/
  eslint/rules/  the seven rules · contract/  generator · codemods/
```

### Data layer

React Query owns server state. Query keys are centralised in
[`lib/hooks/query-keys.ts`](../lib/hooks/query-keys.ts) so invalidation after a mutation is a
lookup, not a guess. **Mutations that change billing state invalidate the subscription, usage
and invoice keys together**, because the backend changes all three in one transaction.

### The contract is generated

`lib/contract/` is generated from the backend's OpenAPI document — `pnpm openapi` in
`../backend`, then `pnpm contract` here. Never hand-edit it.

Nest emits **request** DTOs only (no `@ApiOkResponse({ type })` on the handlers), so response
types are hand-written in `lib/types/billing.ts` to mirror the Prisma models. That is a
recorded gap with a known fix, not a pattern to imitate.

### Authentication boundary

The JWT is an **httpOnly cookie** issued by the backend, cleared by `POST /auth/logout`;
`HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in production. No script on the page can read
it, and nothing about the session touches `localStorage`.

Tokens are signed **RS256**. The backend holds the private key; this app is given only the
public half (`AUTH_JWT_PUBLIC_KEY`), so nothing secret crosses the boundary and the two
services stay independently deployable.

[`middleware.ts`](../middleware.ts) runs before render and rejects any token whose signature
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
every screen that reads React Query, so sections are client and layouts and routes stay server
where they can. Route-level code splitting is automatic.

---

# Phase 9 — Implementation Roadmap

**Lands in** [04-roadmap-and-qa.md](design-os/04-roadmap-and-qa.md) and
[05-billing-cycle-plan.md](design-os/05-billing-cycle-plan.md).

Development phases · priority order · sprint breakdown · milestones · dependencies · risk
assessment · technical-debt prevention · testing strategy · deployment readiness.

Seven stages are delivered. The next body of work is the **billing cycle** — invoice
generation, the scheduler, payment methods, password reset, and the two schema findings that
block them (usage limits read from the wrong field; `@@unique([userId, status])` making
billing history impossible). That plan carries its own open decisions; read it before starting
any of it.

---

# Phase 10 — Quality Assurance

**Lands in** [04-roadmap-and-qa.md](design-os/04-roadmap-and-qa.md).

Validate: accessibility · consistency · responsiveness · scalability · performance · state
coverage · error handling · loading behaviour · design-system compliance · frontend readiness ·
developer experience · SEO · maintainability · cross-browser · WCAG.

**Verification gates:** `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm build` — all green
before merge.

**Design-system QA is lint-enforced**, not reviewed by eye: no raw values, no arbitrary
values, no repeated chains, variants select tokens, look-alikes share a class.

**Accessibility QA:** every input labelled · `:focus-visible` rings from tokens · meters carry
`role="progressbar"` with `aria-valuenow/min/max` · dialogs close on Escape and restore focus
to the trigger · status is never colour-only · `prefers-reduced-motion` honoured globally.

**The standing lesson from this phase:** the most serious defects — a decorator ignoring its
argument, an IDOR on invoices, a swallowed error `cause` — were invisible to reading,
type-checking and linting. They appeared the first time a real request hit a real database.
Static gates are necessary and not sufficient; run the thing.

---

# Phase 11 — Navigation & Orientation

**Lands in** [design-os/README.md](design-os/README.md) and the [repo README](../README.md).

The generic template specified six ancillary files (START_HERE, README, DESIGN-OS-COMPLETE,
ARTIFACT_INDEX, SETUP-CHECKLIST, IMPLEMENTATION_PROMPT) as navigation over a sixteen-file set.
Meter's design OS is six documents. Six files do not need an index, a start-here and a
separate artifact index — that scaffolding would be longer than the thing it indexes, and
every line of it can drift out of sync with the code.

Two files carry the whole job:

- **[design-os/README.md](design-os/README.md)** — the table of the six documents, a
  one-paragraph product summary, and where the rules live.
- **[the repo README](../README.md)** — getting started, the contract workflow, the
  authentication model, the layering table, and the styling layers.

Setup lives in the repo README; the implementation guide is the phase documents themselves.

---

## Output contract

**Location.** All design-OS documents are written into [`docs/design-os/`](design-os/) as
individual `.md` files. Never concatenate them into one blob and never deliver a phase as a
chat response only.

| Path                                                                                                  | Phases |
| ----------------------------------------------------------------------------------------------------- | ------ |
| [`docs/design-os/00-product-definition.md`](design-os/00-product-definition.md)                       | 1      |
| [`docs/design-os/01-information-architecture.md`](design-os/01-information-architecture.md)           | 2–3    |
| [`docs/design-os/02-page-and-component-blueprints.md`](design-os/02-page-and-component-blueprints.md) | 4–6    |
| [`docs/design-os/03-frontend-architecture.md`](design-os/03-frontend-architecture.md)                 | 7–8    |
| [`docs/design-os/04-roadmap-and-qa.md`](design-os/04-roadmap-and-qa.md)                               | 9–10   |
| [`docs/design-os/README.md`](design-os/README.md)                                                     | 11     |

Work in progress that is not yet a phase gets its own numbered plan —
[`05-billing-cycle-plan.md`](design-os/05-billing-cycle-plan.md) is the pattern: findings
first, phased work second, open decisions listed explicitly at the end.

**Ordering.** Dependency order. A phase may reference the phases above it and must not
contradict them.

**Formatting.** `#` title, `##` major section, `###` subsection · a table of contents in files
over 250 lines · relative markdown links between documents and into the code they govern ·
status or date stamps where a document records a decision.

**Completion.** After writing, state which files changed and confirm the cross-links resolve.

---

## Critical rules

1. Never skip a phase, and never merge two.
2. Never jump straight to UI.
3. Every artifact is production-ready; vague descriptions are not deliverables.
4. Maintain traceability — every decision references the phase above it.
5. Think in systems, not pages.
6. Explain design decisions, including the ones that were rejected.
7. **Link documents to the code they govern.** A phase document that names no file is a
   description; one that links the file is a contract.
8. **Record deviations rather than omitting them silently** — a documented departure is a
   decision, an undocumented one is a gap.
9. **If a lint rule fires, the design is wrong.** Fix the design; do not add a disable
   comment — `no-comments` will reject it anyway.
10. Never add a dependency unilaterally.

---

## Deviations, recorded

Where Meter departs from the generic template it was generated from, and why.

| Departure                                                 | Reason                                                                                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **6 documents, not 16**                                   | The five phase files carry all 11 phases of content. Index scaffolding over six files exceeds what it indexes.                              |
| **A third styling layer (`components.css`)**              | Pattern classes in `globals.css` would have doubled that file. The split also gives every breakpoint one home.                              |
| **Response types hand-written in `lib/types/billing.ts`** | Nest emits request DTOs only. Recorded as the top-ranked gap with a known fix, not adopted as a pattern.                                    |
| **Charts deferred**                                       | Usage history renders as a table. A charting library is a dependency decision, and there is no real series to plot until the database runs. |
| **No component or E2E tests**                             | Both need new dependencies, which the Library Selection Policy says are proposed, not installed unilaterally.                               |
| **`no-comments` extends the template's standards**        | Explanation belongs in these documents, where it is reviewable, not scattered through TSX where it rots.                                    |

---

_Meter · Design OS Brief · placeholders resolved 2026-08-27 · rewritten project-specific 2026-09-03_
