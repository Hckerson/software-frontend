# Phase 7 — Frontend Architecture

> Status: settled · regenerated 2026-09-28 under the standing brief's
> [No visual prescription](../MASTER_PROMPT_COMPLETE.md#no-visual-prescription) rule.
> Governed by [MASTER_PROMPT_COMPLETE.md](../MASTER_PROMPT_COMPLETE.md#phase-7--frontend-architecture).
> References [Phase 4](02-page-blueprints.md), [Phase 5](06-section-blueprints.md) and
> [Phase 6](07-component-library.md). Governs [`lib/`](../../lib/), the folder structure and the
> layering rule. Next in phase order: [Phases 8–9](04-roadmap-and-qa.md).

Styling organisation follows the code's own conventions and is not specified here. The
[`styles/`](../../styles/) layer is part of the codebase, not of this design OS.

## Folder structure

```
proxy.ts                 server-side route + admin gate (Next 16 renamed `middleware`)
app/
  layout.tsx  page.tsx  not-found.tsx  error.tsx
  auth/       layout.tsx + login | register | forgot-password | reset-password
  (app)/      layout.tsx + dashboard | plans | subscription | usage
              | invoices | invoices/[id] | settings | admin/*
components/
  common/     Button, LinkButton, PageHeader, SectionCard, StatCard, StatusPill,
              UsageMeter, DataTable, DetailRow, EmptyState, ErrorState, Skeleton,
              ConfirmDialog, Money, PeriodRange, FormField
  layout/     AppShell, Sidebar, SidebarGroup, Topbar, ThemeToggle, AuthCard
  sections/   one folder per route; each file is a composable section
  ui/forms/   input primitives
  providers/  Provider (React Query)
  wrappers/   MotionWrapper
lib/
  api-client.ts        transport — credentialed; reachable only from lib/hooks
  auth/                verify-token (Edge, WebCrypto) + its tests
  contract/            generated from OpenAPI; never hand-edited
  errors/api-error.ts  typed transport failure
  hooks/               one use-<resource> per endpoint group, plus query-keys
  types/               domain aliases over the contract, api envelope, table column
  data/                navigation, metric descriptors, status and plan options
  utils/               formatters, status mapping, form errors, plan drafts, clock
  validations/         zod form schemas
styles/                the code's styling layer (not governed by this design OS)
tools/
  eslint/rules/  the seven rules · contract/  generator · codemods/
```

The folder tree above is a text listing of files, not a layout.

**No stores and no contexts.** The template listed both; Meter has neither, because React Query
owns server state and the session is an httpOnly cookie the client never reads. Recorded so their
absence is legible as a decision.

## The layering rule

`route → section → component → hook → transport`. Each arrow is enforced:

| Boundary                                            | Enforced by                                   |
| --------------------------------------------------- | --------------------------------------------- |
| Routes compose only                                 | `starter/page-composes-only`                  |
| One component per file                              | `starter/one-component-per-file`              |
| Views never import the transport                    | `no-restricted-imports` on `@/lib/api-client` |
| Transport calls live in `use*` hooks in `lib/hooks` | `starter/api-access-boundary`                 |
| Shared types live in `lib/types`                    | `starter/domain-types-in-lib`                 |
| No comments in TS/TSX                               | `starter/no-comments`                         |
| Files stay under 150 lines                          | `max-lines`                                   |

This is why the section layer exists. A route file that is forbidden from declaring
components or data has nowhere to put page composition except sections — the lint rules and
the folder structure are the same decision expressed twice. If a rule fires, the design is
wrong, not the rule.

### Rules outside this design OS

The repo has seven custom rules in [`tools/eslint/rules/`](../../tools/eslint/rules/). Five
appear above. The other two — `starter/token-first-classnames` and
`starter/application-register-density` — govern **how styles are written**. They belong to the
code's conventions, not to this design OS, and nothing here restates or depends on them. `/`'s
opt-out from the second, in [`eslint.config.ts`](../../eslint.config.ts), is likewise a code
convention.

## Data layer

React Query owns server state (`staleTime` 60 s, no refetch on focus). Local state is
`useState`; filters that should survive a reload are URL search params. **No global store, and
no client-held session** — the session is a cookie the browser attaches automatically, so
there is no auth state for the client to own, synchronise, or get wrong.

Query keys are centralised in [`lib/hooks/query-keys.ts`](../../lib/hooks/query-keys.ts) so
invalidation after a mutation is a lookup, not a guess. Mutations that change billing state
invalidate the subscription, usage, and invoice keys together, because the backend changes all
three in one transaction.

## Response types

Every one of the backend's 49 operations declares its success shape —
`@ApiOkResponse`, `@ApiCreatedResponse` or `@ApiNoContentResponse` — so the OpenAPI document
carries responses as well as requests, and `pnpm contract` generates both. The generator never
distinguished the two: it emits a zod schema for everything under `components.schemas`, so
response DTOs started generating the moment the decorators landed.

`lib/types/billing.ts` and `lib/types/account.ts` are therefore **aliases over generated
types**, not hand-written mirrors of the Prisma models. They exist to give the domain a
vocabulary — `Subscription` rather than `SubscriptionDto` — and to derive unions from it
(`SubscriptionDto["status"]`). Adding a field to a Nest DTO propagates without anyone editing a
type by hand. **If you add a Nest handler, give it a response decorator in the same commit** — a
handler without one silently drops its shape out of the frontend's type system.

`Decimal` fields arrive over JSON as `string` and are typed as such, parsed at the formatting
boundary (`Money`), never with `Number()` scattered through components.

The one shape still written by hand is `SessionClaims` — the JWT payload the proxy verifies.
That is not an API response and has no DTO to generate from.

## Authentication boundary

The JWT lives in an **httpOnly cookie** issued by the backend on login and register
(`auth.cookie.ts`), cleared by `POST /auth/logout`. It is `HttpOnly`, `SameSite=Lax`,
`Path=/`, and `Secure` in production. No JavaScript on the page can read it, and nothing
about the session is kept in `localStorage` — which holds only the theme preference.

The transport sends `withCredentials: true`; the Nest strategy extracts the token from the
cookie first and falls back to the `Authorization` header, so CLI and Swagger clients keep
working unchanged.

### Asymmetric signing

Tokens are signed **RS256** with an RSA keypair, not HS256 with a shared secret. The backend
holds the private key; the Next server is given only the **public** half
(`AUTH_JWT_PUBLIC_KEY`). Nothing secret crosses the boundary, so the two services stay
independently deployable — which is exactly what blocked signature verification while the
system was on HS256.

Generate a pair with `pnpm keys:generate` in the backend; it prints the three environment
lines to paste. Both services fail fast if their key is missing.

### What the proxy enforces

[`lib/auth/verify-token.ts`](../../lib/auth/verify-token.ts) verifies the signature with
WebCrypto (`RSASSA-PKCS1-v1_5` / SHA-256), which is available in the Edge runtime — so this
needs **no dependency** on either side. Imported keys are cached per PEM.

[`proxy.ts`](../../proxy.ts) runs before render and:

- rejects any token whose signature does not check out, whose `alg` is not `RS256` (closing
  the `alg: none` downgrade), or whose `exp` has passed;
- redirects an unauthenticated visitor to `/auth/login?next=<path>`, and the login form
  returns them there;
- redirects a verified session whose `role` is not `ADMIN` off `/admin/*`;
- bounces a signed-in visitor away from `/auth/*`.

It **fails closed**: if `AUTH_JWT_PUBLIC_KEY` is unset, every protected route redirects to
login rather than falling open.

There is no client-side gate any more and no flash of protected shell. `AppShell` reads `role`
from `GET /users/me` purely to decide whether to render the admin nav group.

The verification path is unit-tested against a real keypair in
[`verify-token.test.ts`](../../lib/auth/verify-token.test.ts): a valid token passes; a token
signed by a different key, a token with a forged signature, a tampered payload carrying a
valid signature block, an `alg: none` downgrade, and an expired token are all rejected.

Authorization still lives on the backend — `JwtAuthGuard` + `RolesGuard` verify independently
on every request. Middleware is now a genuine first line rather than a cosmetic one, but it is
a _routing_ layer, and the backend remains the authority.

One residual: login and register still return `accessToken` in the response body so
non-browser clients can use bearer auth. The browser ignores it. This keeps a token
momentarily reachable by script at login time, though never persisted — remove the field from
`AuthResponse` if you decide no non-browser client needs it.

## Performance

Server Components by default; `"use client"` only where interaction demands it — which in
practice is every screen that reads React Query, so sections are client and layouts/routes
stay server where they can. Route-level code splitting is automatic. Fonts load through
`next/font`, self-hosted with `display: swap`, so text is never blocked on a font request.
Usage charts are drawn without a charting library, so the only bundle cost is their own code.

## Delivered history — not a requirement

Recorded because it happened, not because it binds anything. This document once opened with a
"Design tokens" phase; the brief no longer governs the look, and that phase is gone. What it
delivered, in the code's styling layer, during [stage 1](04-roadmap-and-qa.md#delivered-in-this-pass):

- The styles were split into three files — raw values, the Tailwind mapping plus resets, and
  named pattern classes — so that responsive behaviour had one findable home.
- Seven `--stat-card-*` tokens that duplicated raw hex and px values were deduplicated into
  aliases of the shared tokens.
- A dead `.metric-icon` rule referencing an undefined variable was repaired.
- A dark theme was delivered as a colour-and-shadow override. The user-facing preference that
  selects it survives as a behaviour ([`ThemeToggle`](07-component-library.md#topbar--themetoggle--authcard)).

How the styling layer is organised today is governed by the code and its two style rules
([above](#rules-outside-this-design-os)), not by this document.

## Changed in the 2026-09-28 regeneration

Renumbered from "Phases 7–8 — Design Tokens & Frontend Architecture" to the brief's Phase 7.
Dropped as visual prescription: the whole "Phase 7 — Design tokens" section (the three-layer
token system as a source of truth, "nothing else may declare a raw value", the `components.css`
rationale and its breakpoint home), the `tokens.css · globals.css · components.css` listing in the
folder tree, and the two style rows of the layering table (`token-first-classnames`,
`application-register-density`), which now sit under
[Rules outside this design OS](#rules-outside-this-design-os). The token work it recorded is kept
above as history. Added: `lib/auth/`, `tools/`, the `no-comments` row, and the rule for new Nest
handlers, all from the brief.
