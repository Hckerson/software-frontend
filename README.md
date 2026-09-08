# Meter — frontend

A subscription billing & usage metering console. Customers pick a plan, watch quota consumed
against their limits, retrieve invoices, and change or cancel. Admins own the plan catalogue
and watch platform health.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · React Query · Zod.

## Getting started

```bash
pnpm install
cp .env.example .env.local     # then fill in AUTH_JWT_PUBLIC_KEY (see Authentication below)
pnpm dev
```

The API lives in the sibling [`../backend`](../backend) repo (NestJS + Prisma + Postgres).
Start it with `pnpm start:dev` there; it listens on port 5000.

Scripts: `pnpm dev` · `build` · `start` · `type-check` · `lint` · `test` · `format` ·
`contract`.

## The API contract is generated, not written

`lib/contract/` is generated from the backend's OpenAPI document. Never hand-edit it.

```bash
cd ../backend && pnpm openapi   # writes ../backend/openapi.json
cd ../frontend && pnpm contract # regenerates lib/contract/{routes,schemas}.ts
```

Every backend operation declares its success shape, so **responses generate alongside
requests**. `lib/types/` holds domain aliases over the generated schemas (`Subscription` for
`SubscriptionDto`), not hand-written mirrors of the Prisma models — add a field to a Nest DTO
and it propagates on the next `pnpm contract`.

## Authentication

The JWT is held in an **httpOnly cookie** set by the backend; no token is ever stored in
`localStorage` and there is no client-side session state.

Tokens are signed **RS256** with an RSA keypair. The backend holds the private key; this app
gets only the public half, so [`middleware.ts`](middleware.ts) **verifies the signature** with
WebCrypto before render — no shared secret, and no dependency. It redirects unauthenticated
visitors to `/auth/login?next=<path>`, keeps non-admins out of `/admin/*`, and fails closed if
the key is unset. Authorization is still enforced independently by `JwtAuthGuard` +
`RolesGuard` on the backend.

Set up the keys once:

```bash
cd ../backend && pnpm keys:generate   # prints the three env lines to paste
```

Put `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` in `backend/.env` and `AUTH_JWT_PUBLIC_KEY` in
`frontend/.env.local`. Never copy the private key into the frontend.

See [the architecture notes](docs/design-os/03-frontend-architecture.md#authentication-boundary).

## Architecture

`route → section → component → hook → transport`, and every arrow is **enforced by lint**,
not by convention. Seven custom ESLint rules live in [`tools/eslint/rules/`](tools/eslint/rules/):

| Rule                           | Boundary it holds                                                      |
| ------------------------------ | ---------------------------------------------------------------------- |
| `page-composes-only`           | Route files compose sections — no inline components or data            |
| `one-component-per-file`       | One component per file, filename matches its kebab-case name           |
| `api-access-boundary`          | The transport layer is reachable only from `use*` hooks in `lib/hooks` |
| `domain-types-in-lib`          | Shared types live in `lib/types`, never exported from a view           |
| `token-first-classnames`       | No arbitrary values, no inline responsive chains                       |
| `application-register-density` | Console spacing ceiling and title scale                                |
| `no-comments`                  | No comments in TS/TSX                                                  |

If a rule fires, the design is wrong — not the rule.

## Styling: token-first, three layers

1. **`styles/tokens.css`** — every raw value, once. Light palette on `:root`, dark overrides
   on `.dark`. Swap these to rebrand.
2. **`styles/globals.css`** — maps tokens onto Tailwind names in `@theme`, plus reset,
   typography and accessibility defaults.
3. **`styles/components.css`** — named pattern classes (`.app-shell`, `.usage-meter`,
   `.status-pill`, `.data-table`, the layout grids). **All responsive behaviour lives here**,
   because `token-first-classnames` forbids `md:`/`lg:` chains in JSX. Breakpoints are
   auditable in one file.

Components compose token-mapped utilities and named classes. A combination used twice becomes
a named class; a raw value becomes a token.

Fonts are swapped in one place: `public/fonts/font.ts`.

## Design OS

The product definition, information architecture, page and component blueprints, architecture
rules, and known gaps live in [`docs/design-os/`](docs/design-os/README.md). Read that before
adding a screen.
