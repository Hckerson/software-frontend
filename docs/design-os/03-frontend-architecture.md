# Phases 7–8 — Design Tokens & Frontend Architecture

References [Phase 4](02-page-blueprints.md), [Phase 5](06-section-blueprints.md) and [Phase 6](07-component-library.md).

## Phase 7 — Design tokens

The token system is the single source of truth, in three layers:

1. [`styles/tokens.css`](../../styles/tokens.css) — every raw value, once.
2. [`styles/globals.css`](../../styles/globals.css) — maps tokens onto Tailwind names in
   `@theme`, plus reset, typography and accessibility defaults.
3. [`styles/components.css`](../../styles/components.css) — named pattern classes, imported by
   `globals.css`.

Nothing else in the repo may declare a raw value.

The third layer is a deliberate addition. The master prompt puts named pattern classes in
`globals.css`; with the shell, grids, meter, pill, table, dialog and states all named, that
file would have doubled. Splitting them mirrors the `tokens.css` import that already existed,
and gives responsive behaviour one findable home — which matters because
`token-first-classnames` forbids breakpoint chains in JSX, so **every** breakpoint in the
application is in that one file.

Changes made while closing out this phase:

- The seven `--stat-card-*` tokens hardcoded hex and px that duplicated existing tokens. They
  now alias `--colors-*`, `--paddings-*`, `--radii-*`, `--shadows-*`. This is what makes a
  theme swap possible at all.
- `.metric-icon` referenced `--metric-color-rgb`, which was never defined — the rule was dead
  CSS. It now uses `color-mix()`, so no parallel RGB token exists to drift.
- The dark theme variant is delivered: a `.dark` block overriding colours and shadows only.
  Every scale token (type, spacing, motion, radii, z-index) is theme-independent and inherited.

## Phase 8 — Frontend architecture

### Folder structure

```
middleware.ts            server-side route + admin gate
app/
  layout.tsx  page.tsx  not-found.tsx  error.tsx
  auth/       layout.tsx + login | register | forgot-password | reset-password
  (app)/      layout.tsx + dashboard | plans | subscription | usage
              | invoices/[id] | settings | admin/*
components/
  common/     Button, PageHeader, SectionCard, StatCard, StatusPill,
              UsageMeter, DataTable, EmptyState, ErrorState, Skeleton,
              ConfirmDialog, Money, PeriodRange
  layout/     Sidebar, SidebarNav, Topbar
  sections/   one folder per route; each file is a composable section
  ui/forms/   existing input primitives
  providers/  Provider (React Query)
  wrappers/   MotionWrapper
lib/
  api-client.ts        transport — credentialed; reachable only from lib/hooks
  contract/            generated; never hand-edited
  errors/api-error.ts  typed transport failure
  hooks/               one use-<resource> per endpoint group, plus query-keys
  types/               domain response types + api envelope + table column
  data/                navigation, metric descriptors, status options
  utils/               formatters, usage normaliser, status tones, form errors
  validations/         zod form schemas
styles/
  tokens.css  globals.css  components.css
```

### The layering rule

`route → section → component → hook → transport`. Each arrow is enforced:

| Boundary                                            | Enforced by                                   |
| --------------------------------------------------- | --------------------------------------------- |
| Routes compose only                                 | `starter/page-composes-only`                  |
| One component per file                              | `starter/one-component-per-file`              |
| Views never import the transport                    | `no-restricted-imports` on `@/lib/api-client` |
| Transport calls live in `use*` hooks in `lib/hooks` | `starter/api-access-boundary`                 |
| Shared types live in `lib/types`                    | `starter/domain-types-in-lib`                 |
| No raw or arbitrary style values                    | `starter/token-first-classnames`              |
| Console register spacing and type                   | `starter/application-register-density`        |
| Files stay under 150 lines                          | `max-lines`                                   |

This is why the section layer exists. A route file that is forbidden from declaring
components or data has nowhere to put page composition except sections — the lint rules and
the folder structure are the same decision expressed twice.

### Data layer

React Query owns server state (`staleTime` 60 s, no refetch on focus). Local state is
`useState`; filters that should survive a reload are URL search params. **No global store, and
no client-held session** — the session is a cookie the browser attaches automatically, so
there is no auth state for the client to own, synchronise, or get wrong.

Query keys are centralised in `lib/hooks/query-keys.ts` so invalidation after a mutation is a
lookup, not a guess. Mutations that change billing state invalidate the subscription, usage,
and invoice keys together, because the backend changes all three in one transaction.

### Response types

Every one of the backend's 49 operations declares its success shape —
`@ApiOkResponse`, `@ApiCreatedResponse` or `@ApiNoContentResponse` — so the OpenAPI document
carries responses as well as requests, and `pnpm contract` generates both. The generator never
distinguished the two: it emits a zod schema for everything under `components.schemas`, so
response DTOs started generating the moment the decorators landed.

`lib/types/billing.ts` and `lib/types/account.ts` are therefore **aliases over generated
types**, not hand-written mirrors of the Prisma models. They exist to give the domain a
vocabulary — `Subscription` rather than `SubscriptionDto` — and to derive unions from it
(`SubscriptionDto["status"]`). Adding a field to a Nest DTO propagates without anyone editing a
type by hand.

`Decimal` fields arrive over JSON as `string` and are typed as such, parsed at the formatting
boundary, never with `Number()` scattered through components.

The one shape still written by hand is `SessionClaims` — the JWT payload middleware verifies.
That is not an API response and has no DTO to generate from.

### Authentication boundary

The JWT lives in an **httpOnly cookie** issued by the backend on login and register
(`auth.cookie.ts`), cleared by `POST /auth/logout`. It is `HttpOnly`, `SameSite=Lax`,
`Path=/`, and `Secure` in production. No JavaScript on the page can read it, and nothing
about the session is kept in `localStorage`.

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

### What middleware enforces

[`lib/auth/verify-token.ts`](../../lib/auth/verify-token.ts) verifies the signature with
WebCrypto (`RSASSA-PKCS1-v1_5` / SHA-256), which is available in the Edge runtime — so this
needs **no dependency** on either side. Imported keys are cached per PEM.

`middleware.ts` runs before render and:

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

### Performance

Server Components by default; `"use client"` only where interaction demands it — which in
practice is every screen that reads React Query, so sections are client and layouts/routes
stay server where they can. Route-level code splitting is automatic. `next/font` is already
self-hosting the three families with `display: swap`.
