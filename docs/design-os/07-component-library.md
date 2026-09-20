# Phase 6 — Component Library

References [Phase 4](02-page-blueprints.md) and [Phase 5](06-section-blueprints.md). Governs
[`components/common/`](../../components/common/),
[`components/layout/`](../../components/layout/),
[`components/ui/forms/`](../../components/ui/forms/),
[`components/providers/`](../../components/providers/) and
[`components/wrappers/`](../../components/wrappers/).

**33 components.** Reusable and enterprise-first. **If it is used once, it is a section, not a
component** — that test is what keeps this library from accumulating page-specific widgets.

---

## Contents

- [The component contract](#the-component-contract)
- [Styling approach](#styling-approach)
- [`common/` — the library](#common--16-components)
- [`layout/` — the shell](#layout--6-components)
- [`ui/forms/` — input primitives](#uiforms--9-primitives)
- [`providers/` and `wrappers/`](#providers--wrappers--2-components)
- [Anti-patterns](#anti-patterns)
- [Compliance statement](#compliance-statement)

---

## The component contract

Stated once; each blueprint below states only what distinguishes it.

**Composition rules.** One component per file, default export, filename matching the name
(`starter/one-component-per-file`). Under 150 lines. No comments. **No component fetches
data** — data arrives as props from a section.

**Props.** Typed with a local `interface Props`. Domain types come from
[`lib/types/`](../../lib/types/), which aliases generated contract schemas
(`starter/domain-types-in-lib`).

**States.** Any component that can render nothing must render a designed nothing. Loading is
`Skeleton`, never a bare spinner.

**Accessibility.** WCAG 2.2 AA. Every interactive element is reachable and labelled;
`:focus-visible` rings come from tokens; **status is never colour alone.**

**Responsive behaviour.** Named in [`styles/components.css`](../../styles/components.css).
`starter/token-first-classnames` forbids breakpoint chains in JSX — **no component contains a
`md:` or `lg:`.**

**Animation.** Opt-in via `MotionWrapper`; `prefers-reduced-motion` honoured globally.

---

## Styling approach

**Required on every component, not optional.** Each blueprint names the classes it composes and
the tokens it consumes, and every one asserts the same thing:

> This component hardcodes no raw values and references tokens and named classes only.

That claim is **machine-checked** by `starter/token-first-classnames`, not reviewed by eye.

---

## `common/` — 16 components

### `Button`

**Purpose:** the primary action affordance. **Variants:** `tone` accent · quiet · ghost;
`size` sm–xl; `isLoading`. **Props:** extends `ButtonHTMLAttributes`, forwards a ref, defaults
`type="button"` — so a button inside a form never submits by accident.
**A11y:** `aria-busy` while loading; disabled during a pending mutation so a destructive action
cannot be double-fired. **Styling:** `bg-accent`, `.smooth`.
**Don't:** use it for navigation — that is `LinkButton`.

### `LinkButton`

**Purpose:** navigation that looks like an action. **Props:** `href`, `size`, `tone`,
`className`. **Styling:** shares `BUTTON_SIZES` / `BUTTON_TONES` with `Button` so the two can
never drift apart — the single source of truth rule applied to a variant map.
**Do:** use for `/plans` and `/dashboard` affordances in empty states. **Don't:** attach
`onClick` handlers that mutate.

### `PageHeader`

**Purpose:** the title block every route opens with. **Props:** `title`, `description`,
`actions` slot. **Styling:** `text-h4` — **the console's largest type.** A page title above
`text-h4` fires `starter/application-register-density`; this component is where that ceiling is
enforced in practice. Renders `<h1>`, so each route has exactly one.

### `SectionCard`

**Purpose:** the titled panel every section renders inside. **Props:** `title`, `description`,
`action` slot, `bodyless`, `className`. **Styling:** `.section-card`.
**Notes:** `bodyless` exists for panels wrapping a full-bleed table, so the card frame does not
double-pad a `DataTable`.

### `StatCard`

**Purpose:** one counter. **Variants:** `tone` pipeline · success · activity · warning.
**Props:** `label`, `value`, `meta`, `icon`, `tone`.
**Styling:** `.stat-card`, `.stat-card--<tone>`, `.metric-*`.
**Notes:** the seven `--stat-card-*` tokens **alias** `--colors-*` / `--paddings-*` /
`--radii-*` / `--shadows-*` rather than holding raw values. That aliasing is what makes the dark
theme possible at all — [a component token holding its own raw value is a theme
leak](03-frontend-architecture.md).

### `UsageMeter` — the hero interaction

**Purpose:** quota consumed against the plan limit. Design principle 1 made concrete.
**Props:** `label`, `unit`, `consumed`, `limit: number | null`, `icon`.
**Variants:** state derived from ratio — **under 75 % neutral · 75–99 % warning · ≥ 100 % error**
with an upgrade affordance inline.
**A11y (required):** `role="progressbar"` with `aria-valuenow` / `aria-valuemin` /
`aria-valuemax`, plus `aria-label`.

> **`aria-valuenow` is clamped to the track maximum.** An over-limit meter previously reported
> `aria-valuenow="250"` against `aria-valuemax="100"` — invalid ARIA. The visible text still
> states the true percentage. Found by writing the component test, not by reading the code;
> asserted in [`usage-meter.test.tsx`](../../components/common/usage-meter.test.tsx) so it
> cannot regress.

**`limit: null` means unlimited**, rendered as _"No limit on this plan"_ — never as zero, which
would show a full meter for the least constrained plan.

### `StatusPill`

**Purpose:** subscription, invoice and account state as a **word**. Design principle 2.
**Props:** `status: string`, `className`. **Variants:** tone map success · warning · error ·
info · neutral. **Styling:** `.status-pill`, `.status-pill--<tone>`.
**Don't:** ever convey status by colour alone — the word is the payload, the tone is decoration.

### `DataTable`

**Purpose:** row collections. **Props:** generic `<T>` — `columns: Column<T>[]`, `rows`,
`rowKey: (row) => string`, `onRowClick?`. **Styling:** `.data-table*`, `.table-scroll`.
**Responsive:** scrolls inside `.table-scroll`; **the page never scrolls horizontally.**
**Notes:** `rowKey` is required rather than defaulting to an index, so a re-sorted table cannot
scramble row identity.

### `DetailRow`

**Purpose:** one label/value pair. **Props:** `label`, `children`.
**Notes:** renders `<dt>`/`<dd>`, so callers must place it inside a `<dl>` — the semantics are
the point, not the layout.

### `EmptyState`

**Purpose:** the designed empty. Design principle 5. **Props:** `title`, `description?`,
`icon?`, `action?`. **Styling:** `.empty-state`.
**Content rule:** carry **the one action that resolves the emptiness** — the unsubscribed
dashboard's _Choose a plan_ is the canonical example.

### `ErrorState`

**Purpose:** the designed failure. **Props:** `error: unknown`, `onRetry?`.
**A11y:** `role="alert"`. **Styling:** `.empty-state` — shares the frame deliberately.
**Notes:** narrows `ApiError` → `Error` → a fallback message, so a thrown non-`Error` still
renders something a human can read. **Takes `unknown`** because that is what a `catch` and a
React Query `error` actually give you; a component demanding `Error` pushes casts to callers.

### `Skeleton`

**Purpose:** loading. **Props:** `lines`, `className`. **A11y:** `aria-busy="true"`,
`aria-live="polite"`. **Styling:** `.skeleton`.

### `ConfirmDialog`

**Purpose:** guard destructive actions. Design principle 3.
**Props:** `open`, `title`, `description`, `confirmLabel`, `isPending?`, `onConfirm`,
`onCancel`. **A11y:** `role="dialog"`, `aria-modal`, `aria-label`; **closes on Escape and
restores focus to the trigger.** **Styling:** `.dialog*`, `--z-modal`.
**Content rule:** `confirmLabel` names the act (_Cancel subscription_), never _OK_.
**Guards:** cancel, reactivate, plan change, plan deactivate, plan delete, payment-method
removal.

### `Money`

**Purpose:** every amount in the product. Design principle 2.
**Props:** `amount: string | number | null | undefined`, `showCurrency?`, `className`.
**Styling:** `font-mono`, `whitespace-nowrap` — figures align in a column and never wrap
mid-amount.
**Notes:** `Decimal` arrives over JSON as `string` and stays a string until here. **This
component is the parsing boundary** — its existence is what keeps `Number()` out of sections.
Accepts `null`/`undefined` so callers never branch before rendering.

### `PeriodRange`

**Purpose:** a billing period with **both endpoints**. Design principle 2.
**Props:** `start`, `end` (nullable). **Notes:** exists so no section formats a period by hand;
a period rendered as one date is ambiguous about which end it is.

### `FormField`

**Purpose:** a labelled, validated text input. **Props:** `label`, `value`, `onChange(value)`,
`type`, `placeholder`, `error`, `required`, `autoComplete`.
**A11y:** `aria-invalid` and `aria-describedby` wired to the error text — **the error is
announced, not merely coloured.**
**Notes:** the controlled input used by every auth and settings form. `onChange` hands back the
**value**, not the event, so sections never touch `event.target`.

---

## `layout/` — 6 components

### `AppShell`

**Purpose:** the authenticated frame — sidebar, topbar, content. **Props:** none; reads
`GET /users/me` for `role`.
**Critical:** `role` decides **only whether the admin nav group renders. It never authorises.**
Authorisation is [`proxy.ts`](../../proxy.ts) plus the backend's `RolesGuard`. Hiding
a link is navigation, not security.
**Styling:** `.app-shell` — and its responsive collapse is named there, not inlined.

### `Sidebar` / `SidebarGroup`

**`Sidebar`** — **Props:** `isAdmin`. Filters `NAV_GROUPS` from
[`lib/data/navigation.ts`](../../lib/data/navigation.ts). Adding a route means editing that file,
the sitemap and the permission table in the same change.
**`SidebarGroup`** — **Props:** `label`, `items`. **A11y:** `<nav aria-label>` per group and
**`aria-current` on the active item**; active matches the path or any descendant, so
`/invoices/[id]` keeps `/invoices` lit.

### `Topbar` · `ThemeToggle` · `AuthCard`

**`Topbar`** — page context and account actions, including sign-out via `POST /auth/logout`
(the server clears the cookie; the client cannot).
**`ThemeToggle`** — toggles `.dark` on the root. **A11y:** `aria-label`. Swaps the token layer
only; no component knows which theme is active.
**`AuthCard`** — **Props:** `title`, `description`, `children`. The unauthenticated frame;
renders the `<h1>` for auth routes so the forms inside carry none.

---

## `ui/forms/` — 9 primitives

Lower-level than `FormField`: unlabelled-by-default building blocks for composed forms. They
share a `handleChange` convention rather than raw DOM events.

| Primitive       | Props                                              | Notes                                       |
| --------------- | -------------------------------------------------- | ------------------------------------------- |
| `InputTemplate` | `label`, `icon?`, `rightSection?`, `children`      | The frame the others render inside          |
| `TextInput`     | `label`, `value`, `handleChange(event)`            | Ids and names derive from `label`           |
| `TextAreaInput` | `rows`, `label`, `value`, `handleChange(event)`    | Explicit `rows`; no autosize                |
| `SelectInput`   | `label`, `data: Option[]`, `value`, `handleChange` | Options from [`lib/data/`](../../lib/data/) |
| `CheckBoxInput` | `label`, `value`, `values`, `handleChange`         | Generic `<T extends string>`                |
| `PickInput`     | `label`, `value`, `values`, `handleChange`         | Single-choice sibling of `CheckBoxInput`    |
| `ToggleInput`   | `label?`, `value?`, `handleChange?`                | Controlled **or** uncontrolled              |
| `CalendarInput` | `value: Date`, `name?`, `handleChange`             | Guards `isValid` before formatting          |
| `FileInput`     | `name?`, `label?`                                  | Dashed drop affordance; `focus-within` ring |

**Known inconsistency, recorded not hidden.** These take `handleChange` and mostly hand back
events, while `FormField` takes `onChange` and hands back a **value**. Two conventions for one
job. `FormField`'s is the better one — it keeps `event.target` out of sections — and the
primitives should converge on it. Until they do, **`FormField` is the default for new forms**
and these are for composed cases it cannot express.

---

## `providers/` & `wrappers/` — 2 components

**`Provider`** — the React Query client: `staleTime` 60 s, no refetch on focus. Mounted once in
the root layout. **There is no session provider and no store**, because the JWT is an httpOnly
cookie the client cannot read.

**`MotionWrapper`** — **Props:** `delay`, `duration`, `yOffset`, `xOffset`, `scale`,
`className`. The **only** animation entry point; conventions in [MOTION.md](../MOTION.md).
Durations come from `MOTION_DURATION` tokens, never inline numbers.

---

## Anti-patterns

Enforced by lint rather than convention — each maps to a rule that fires:

| Anti-pattern                                    | Rule                                   |
| ----------------------------------------------- | -------------------------------------- |
| A raw value in a component (`#1f4e3d`, `13px`)  | `starter/token-first-classnames`       |
| An arbitrary Tailwind value (`bg-[#1f4e3d]`)    | `starter/token-first-classnames`       |
| The same utility chain inlined twice            | `starter/token-first-classnames`       |
| A `md:` / `lg:` chain in JSX                    | `starter/token-first-classnames`       |
| A component defined inside a route file         | `starter/page-composes-only`           |
| Calling the transport outside `lib/hooks/use-*` | `starter/api-access-boundary`          |
| A shared type declared outside `lib/types`      | `starter/domain-types-in-lib`          |
| Two components in one file                      | `starter/one-component-per-file`       |
| A page title larger than `text-h4`              | `starter/application-register-density` |
| A comment explaining TSX                        | `starter/no-comments`                  |
| A file over 150 lines                           | `max-lines`                            |

**A variant that re-declares a raw value instead of selecting a token** is the subtlest of these
and the one most worth watching, because it passes review by looking like configuration.

---

## Compliance statement

Every component above **hardcodes no raw values and references tokens and named classes only.**

Recurring combinations used by more than one component — the card frame, the table frame, the
meter track, the pill, the dialog — are declared once in
[`styles/components.css`](../../styles/components.css), and the responsive collapse of the
shell, meter row, plan grid and tables is named there too rather than inlined at call sites.

Four components carrying a design principle are **asserted by tests rather than claimed**:
`UsageMeter`, `Money`, `StatusPill` and `ConfirmDialog`. The remainder are covered by lint. The
gap between those two — behaviour that neither lint nor a unit test can see — is what
[E2E would close](04-roadmap-and-qa.md#known-gaps-ranked).
