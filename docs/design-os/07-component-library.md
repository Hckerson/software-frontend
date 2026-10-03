# Phase 6 — Interaction Contracts

> Status: settled · regenerated 2026-09-28 as interaction contracts under the standing brief's
> [No visual prescription](../MASTER_PROMPT_COMPLETE.md#no-visual-prescription) rule.
> Governed by [MASTER_PROMPT_COMPLETE.md](../MASTER_PROMPT_COMPLETE.md#phase-6--interaction-contracts).
> The filename predates the phase's rename and is kept as a stable id
> ([Deviations](../MASTER_PROMPT_COMPLETE.md#deviations-recorded)).
> References [Phase 4](02-page-blueprints.md) and [Phase 5](06-section-blueprints.md). Governs the
> behaviour of [`components/common/`](../../components/common/),
> [`components/layout/`](../../components/layout/),
> [`components/ui/forms/`](../../components/ui/forms/),
> [`components/providers/`](../../components/providers/) and
> [`components/wrappers/`](../../components/wrappers/). Next in phase order:
> [Phase 7](03-frontend-architecture.md).

**33 components.** Each contract says how the element behaves — its inputs, states, keyboard and
ARIA behaviour, validation, loading and error handling, and content rules. **None says how it
looks.** Which components exist, how they are grouped and how they look is decided when pages are
built; this inventory is a record of what is built, not a prescription of what must exist.

**If it is used once, it is a section, not a component** — that test is what keeps this library
from accumulating page-specific widgets.

---

## Contents

- [Contract defaults](#contract-defaults)
- [`common/` — the library](#common--16-components)
- [`layout/` — route layouts](#layout--6-components)
- [`ui/forms/` — input primitives](#uiforms--9-primitives)
- [`providers/` and `wrappers/`](#providers--wrappers--2-components)
- [Anti-patterns](#anti-patterns)
- [Known interaction gaps](#known-interaction-gaps)
- [Verification](#verification)
- [Changed in the 2026-09-28 regeneration](#changed-in-the-2026-09-28-regeneration)

---

## Contract defaults

Stated once; each contract below states only what distinguishes it.

**Fields.** Every contract answers: Purpose · Inputs · States · Accessibility · Keyboard · ARIA
· Interaction · Validation · Loading · Error · Content rules · Do · Don't · Dependencies. A field
not stated takes the default here.

**Inputs.** Typed with a local `interface Props`. Domain types come from
[`lib/types/`](../../lib/types/), which aliases generated contract schemas
(`starter/domain-types-in-lib`). Inputs that only select an appearance (tone, size, class names)
exist in code but are not part of any contract.

**Data.** **No component fetches data** — data arrives as inputs from a section. The three
exceptions are the layout components' own reads (`AppShell`, `Topbar`) and are named on their
contracts.

**States.** Any component that can render nothing must render a designed nothing. Loading is
announced to assistive technology.

**Accessibility.** WCAG 2.2 AA. Every interactive element is reachable by keyboard, labelled,
and shows visible focus. **Status is never conveyed by colour alone.** `prefers-reduced-motion`
is honoured globally.

**Keyboard.** Native elements keep their native keys: a button activates on Enter and Space, a
link on Enter, a checkbox on Space. A contract states keys only where it adds to that.

**Device needs.** Operable from phone width up with no loss of information or action.

**Composition rules.** One component per file, default export, filename matching the name
(`starter/one-component-per-file`). Under 150 lines. No comments.

---

## `common/` — 16 components

### `Button`

**Purpose:** the action affordance. **Inputs:** everything `ButtonHTMLAttributes` accepts, plus
`isLoading`; forwards a ref. **Interaction:** defaults `type="button"`, so a button inside a form
never submits by accident. **Loading:** while `isLoading`, the button is disabled and carries
`aria-busy`, so a pending mutation — a destructive one included — cannot be double-fired.
**Don't:** use it for navigation — that is `LinkButton`.

### `LinkButton`

**Purpose:** navigation that reads as an action. **Inputs:** `href`, `children`. Renders a real
link (`next/link`), so it is announced as a link, activates on Enter and can be opened in a
new tab.
**Do:** use for the `/plans` and `/dashboard` actions in empty states. **Don't:** attach
`onClick` handlers that mutate.

### `PageHeader`

**Purpose:** the route's title. **Inputs:** `title`, `description`, `actions`.
**ARIA:** renders the page's `<h1>`, so each route has exactly one.

### `SectionCard`

**Purpose:** a titled region grouping one section's content. **Inputs:** `title?`,
`description?`, `action?`, `children`. **ARIA:** a `<section>`; the title is an `<h2>`, so
section headings are one level deeper than the page's `<h1>`.

### `StatCard`

**Purpose:** one counter. **Inputs:** `label`, `value`, `meta?`, `icon?` (decorative).
**Content rule:** `value` arrives pre-formatted as a string; zero is a value, never an empty
state. **Don't:** let the counter's meaning depend on anything but its words.

### `UsageMeter` — the core interaction

**Purpose:** quota consumed against the plan limit. Principle 1 made concrete.
**Inputs:** `label`, `unit`, `consumed`, `limit: number | null`, `icon?` (decorative).
**States:** derived from the ratio against [`USAGE_THRESHOLD`](../../lib/constants.ts) —
**normal** under 75 %, **warning** 75–99 %, **exceeded** at or over 100 %. **`limit: null` means
unlimited**, stated as _"No limit on this plan"_ — never as zero, which would read as a full meter
for the least constrained plan.
**Content rules:** states consumed against limit with the unit, and the percentage of the
allowance used, in words. **Exceeded offers the upgrade path to `/plans`** — _requirement, not yet
built_ ([gaps](#known-interaction-gaps)).
**ARIA (required):** `role="progressbar"` with `aria-label`, `aria-valuenow`, `aria-valuemin` and
`aria-valuemax`.

> **`aria-valuenow` is clamped to the maximum.** An over-limit meter previously reported
> `aria-valuenow="250"` against `aria-valuemax="100"` — invalid ARIA. The visible text still
> states the true percentage. Found by writing the component test, not by reading the code;
> asserted in [`usage-meter.test.tsx`](../../components/common/usage-meter.test.tsx) so it
> cannot regress.

### `StatusPill`

**Purpose:** subscription, invoice and account state as a **word**. Principle 2.
**Inputs:** `status: string`. **Content rule:** renders the backend's status in title case —
Draft, Sent, Paid, Failed, Overdue for invoices.
**Don't:** ever convey status by anything but the word; any other signal is supplementary.

### `DataTable`

**Purpose:** row collections. **Inputs:** generic `<T>` — `columns: Column<T>[]`, `rows`,
`rowKey: (row) => string`, `onRowClick?`.
**ARIA:** a real `<table>` with `<th scope="col">` headers. **Device needs:** every column stays
reachable at narrow widths; the page itself never scrolls sideways.
**Interaction:** `rowKey` is required rather than defaulting to an index, so a re-sorted table
cannot scramble row identity.
**Known gap:** `onRowClick` is a pointer-only handler on the row — no focus, no Enter. A row
that navigates must also be reachable by keyboard ([gaps](#known-interaction-gaps)).

### `DetailRow`

**Purpose:** one label/value pair. **Inputs:** `label`, `children`.
**ARIA:** renders `<dt>`/`<dd>`, so callers must place it inside a `<dl>` — the semantics are
the point.

### `EmptyState`

**Purpose:** the designed empty. Principle 5. **Inputs:** `title`, `description?`, `icon?`
(decorative), `action?`.
**Content rule:** carry **the one action that resolves the emptiness** — the unsubscribed
dashboard's _Choose a plan_ is the canonical example. Say what is missing and why, never just
"No data".

### `ErrorState`

**Purpose:** the designed failure. **Inputs:** `error: unknown`, `onRetry?`.
**ARIA:** `role="alert"`, so the failure is announced when it appears.
**Content rules:** a fixed heading (_"We could not load this"_), then the message — narrowed
`ApiError` → `Error` → a fallback, so a thrown non-`Error` still yields something a human can
read. With `onRetry`, a _Try again_ action.
**Notes:** takes `unknown` because that is what a `catch` and a React Query `error` give you; a
component demanding `Error` pushes casts to callers.

### `Skeleton`

**Purpose:** loading. **Inputs:** `lines?`. **ARIA:** `aria-busy="true"`,
`aria-live="polite"`.

### `ConfirmDialog`

**Purpose:** guard destructive actions. Principle 3.
**Inputs:** `open`, `title`, `description`, `confirmLabel`, `isPending?`, `onConfirm`,
`onCancel`.
**ARIA:** `role="dialog"`, `aria-modal="true"`, `aria-label` from the title.
**Keyboard & focus:** on open, focus moves to the confirm action; **Escape cancels**; on close,
**focus returns to the trigger**.
**Loading:** while `isPending`, confirm shows loading and _Cancel_ is disabled, so the pending
act can neither be doubled nor abandoned half-way.
**Content rule:** `confirmLabel` names the act (_Cancel subscription_), never _OK_; the
description states the consequence, including whether it is reversible.
**Guards:** cancel, reactivate, plan change, plan deactivate, plan delete, payment-method
removal, account suspend/restore, cycle runs, invoice issue.

> **Focus restore was claimed before it was true.** The dialog moved focus in but never back,
> and because `onCancel` sat in the effect's dependencies, a parent re-render with an inline
> handler — `isPending` flipping mid-delete — pulled focus back to _Confirm_ even after the user
> had tabbed to _Cancel_. Both are fixed in
> [`use-modal-focus.ts`](../../lib/hooks/use-modal-focus.ts), which `admin-plan-edit` shares, and
> both are asserted in [`confirm-dialog.test.tsx`](../../components/common/confirm-dialog.test.tsx).

### `Money`

**Purpose:** every amount in the product. Principle 2.
**Inputs:** `amount: string | number | null | undefined`, `showCurrency?`.
**Content rule:** the currency is `USD` (`DEFAULT_CURRENCY`); `showCurrency` appends the code
where the context does not already state it.
**Notes:** `Decimal` arrives over JSON as `string` and stays a string until here. **This
component is the parsing boundary** — its existence is what keeps `Number()` out of sections.
Accepts `null`/`undefined` so callers never branch before rendering.

### `PeriodRange`

**Purpose:** a billing period with **both endpoints**. Principle 2.
**Inputs:** `start`, `end` (nullable). **Content rule:** always `start – end`; exists so no
section formats a period by hand, because a period stated as one date is ambiguous about which
end it is.

### `FormField`

**Purpose:** a labelled, validated text input. **Inputs:** `label`, `value`,
`onChange(value)`, `type`, `placeholder`, `error`, `required`, `autoComplete`.
**ARIA:** a real `<label>` bound by id; `aria-invalid` and `aria-describedby` wired to the error
text — **the error is announced, not merely coloured.**
**Validation:** the field presents a message; it does not validate. The auth forms derive
theirs from Zod schemas in [`lib/validations/`](../../lib/validations/).
**Interaction:** controlled. `onChange` hands back the **value**, not the event, so sections
never touch `event.target`. **Don't:** rely on `placeholder` as the label.

---

## `layout/` — 6 components

### `AppShell`

**Purpose:** wraps every authenticated route with navigation and account access. **Inputs:**
`children`; reads `GET /users/me` for `role`. **Loading:** while the user is pending, loading is
announced and the route's content waits.
**Critical:** `role` decides **only whether the Administration navigation group is offered. It
never authorises.**
Authorisation is [`proxy.ts`](../../proxy.ts) plus the backend's `RolesGuard`. Hiding a link is
navigation, not security.

### `Sidebar` / `SidebarGroup`

**`Sidebar`** — **Inputs:** `isAdmin`. Filters `NAV_GROUPS` from
[`lib/data/navigation.ts`](../../lib/data/navigation.ts). Adding a route means editing that file,
the sitemap and the permission table in the same change.
**`SidebarGroup`** — **Inputs:** `label`, `items`. **ARIA:** a `<nav aria-label>` per group and
**`aria-current="page"` on the current item**. **Interaction:** the current item is the
**longest** href that matches the path, so `/invoices/[id]` keeps Invoices current and `/admin`
no longer shadows every admin page.

### `Topbar` · `ThemeToggle` · `AuthCard`

**`Topbar`** — identifies the signed-in account (name and email) and lets the user sign out. Reads
`useCurrentUser`, stating _"Loading account"_ until it resolves. **Sign out** calls
`POST /auth/logout` (the server clears the cookie; the client cannot), shows loading while
pending, and replaces the route with login when it settles — success or failure.
**`ThemeToggle`** — switches the theme preference between light and dark. **Default:** the stored
preference, else the operating system's. **Persistence:** `localStorage` — the only thing the app
keeps there. **ARIA:** `aria-label` names the action it will take (_Switch to dark theme_), not
the current state. What each theme looks like is not specified here.
**`AuthCard`** — **Inputs:** `title`, `description`, `children`. Wraps each unauthenticated
route and renders its `<h1>`, so the forms it wraps carry none.

---

## `ui/forms/` — 9 primitives

Lower-level than `FormField`: building blocks for composed forms. They share a `handleChange`
convention rather than raw DOM events.

| Primitive       | Inputs                                             | Behaviour                                                                                          |
| --------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `InputTemplate` | `label`, `children`                                | Shared label wiring the other primitives are built on; its adornment inputs select appearance only |
| `TextInput`     | `label`, `value`, `handleChange(event)`            | Ids and names derive from `label`                                                                  |
| `TextAreaInput` | `rows`, `label`, `value`, `handleChange(event)`    | Multi-line text                                                                                    |
| `SelectInput`   | `label`, `data: Option[]`, `value`, `handleChange` | Button with `aria-haspopup="listbox"` / `aria-expanded`; options `role="option"` + `aria-selected`; prepends an **All** option; closes on Escape or outside click. Options from [`lib/data/`](../../lib/data/) |
| `CheckBoxInput` | `label`, `value`, `values`, `handleChange`         | Native checkboxes; generic `<T extends string>`                                                    |
| `PickInput`     | `label`, `value`, `values`, `handleChange`         | Single-choice sibling of `CheckBoxInput`                                                           |
| `ToggleInput`   | `label?`, `value?`, `handleChange?`                | Native checkbox; controlled **or** uncontrolled                                                    |
| `CalendarInput` | `value: Date`, `name?`, `handleChange`             | Guards `isValid` before formatting, so an invalid date never throws                                |
| `FileInput`     | `name?`, `label?`                                  | Native file input bound to its label; keyboard-reachable                                           |

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

**`MotionWrapper`** — the **only** animation entry point. **Behaviour:** reveals its children
once, when they enter the viewport. `prefers-reduced-motion` is honoured globally. How
anything moves is a build decision; code conventions live in [MOTION.md](../MOTION.md), which
this design OS does not govern.

---

## Anti-patterns

Enforced by lint rather than convention — each maps to a rule that fires:

| Anti-pattern                                    | Rule                             |
| ----------------------------------------------- | -------------------------------- |
| A component defined inside a route file         | `starter/page-composes-only`     |
| Calling the transport outside `lib/hooks/use-*` | `starter/api-access-boundary`    |
| A shared type declared outside `lib/types`      | `starter/domain-types-in-lib`    |
| Two components in one file                      | `starter/one-component-per-file` |
| A comment explaining TSX                        | `starter/no-comments`            |
| A file over 150 lines                           | `max-lines`                      |

Behavioural anti-patterns that no rule catches: a destructive action without `ConfirmDialog`;
an amount or period formatted by hand instead of through `Money` / `PeriodRange`; a status
signalled without its word; a failed read rendered as an empty state.

The two rules that govern how styles are written are code conventions, not part of these
contracts — see [Frontend Architecture](03-frontend-architecture.md#rules-outside-this-design-os).

---

## Known interaction gaps

Found while regenerating these contracts against the code. Recorded, not fixed — this pass edits
documents only.

1. **Invoice rows are pointer-only.** `DataTable`'s `onRowClick` sits on the row with no focus
   or key handling, and `invoice-table` uses it as the only route to `/invoices/[id]`. A keyboard
   user cannot open an invoice from the list.
2. **`ConfirmDialog` does not trap focus.** It declares `aria-modal` and handles Escape, but Tab
   can leave the dialog for the rest of the page.
3. **`SelectInput` has no arrow-key navigation.** Options are reachable with Tab; the listbox
   pattern also expects ↑/↓, Home and End.
4. **`UsageMeter` does not yet offer the upgrade path when exceeded**
   ([E2](01-information-architecture.md#e2--monitor-usage-customer-recurring--the-core-loop)).

---

## Verification

Four components carrying a product principle are **asserted by tests rather than claimed**:
`UsageMeter`, `Money`, `StatusPill` and `ConfirmDialog`. The layering is covered by lint. The
gap between those two — behaviour that neither lint nor a unit test can see — is what the
Playwright suite exercises ([QA](04-roadmap-and-qa.md#qa-checklist)).

---

## Changed in the 2026-09-28 regeneration

The document was converted from a component library to interaction contracts. Every component
survives. Dropped as visual prescription:

- The **Styling approach** section and the **Compliance statement** ("hardcodes no raw values and
  references tokens and named classes only").
- Visual variants and their rationale: `Button`/`LinkButton` `tone` (accent · quiet · ghost) and
  `size` (sm–xl) and the shared variant map; `StatCard` `tone` and the `--stat-card-*` token
  aliasing; `StatusPill`'s tone map; `SectionCard`'s `bodyless` padding variant;
  `TextAreaInput`'s "no autosize"; `FileInput`'s dashed drop affordance.
- Type and styling specifics: `PageHeader` as "`text-h4`, the console's largest type"; `Money`
  as `font-mono` / `whitespace-nowrap`; every "Styling: `.class`" line; `ThemeToggle` "toggles
  `.dark` and swaps the token layer"; focus rings "from tokens".
- Placement and responsive specifics: `DataTable` scrolling "inside `.table-scroll`";
  `AppShell`'s collapse "named in `.app-shell`"; the "no `md:`/`lg:` in components" rule.
- `MotionWrapper`'s animation parameters (`delay`, `duration`, `yOffset`, `xOffset`, `scale`)
  and "durations from `MOTION_DURATION` tokens".
- Anti-pattern rows for `starter/token-first-classnames` (raw values, arbitrary values, repeated
  utility chains, breakpoint chains) and `starter/application-register-density` (page title
  above `text-h4`).

Corrected against the code: `SidebarGroup` matches the **longest** href, not "the path or any
descendant"; `ConfirmDialog`'s guard list now includes the admin actions added since.

**2026-09-30 self-audit.** Every contract survives; component names are kept because this
phase's job is their behaviour. Reworded so no contract says how or where anything appears:
`PageHeader` "the title every route opens with"; `SectionCard` "sections sit one level under
the page title" (now heading depth); `AppShell` "the authenticated frame — navigation, account
bar, content" and "a loading state stands in for the whole frame"; `Topbar`'s inventory of what
it holds; `AuthCard` "the unauthenticated frame … the forms inside"; `LinkButton` "presented
as"; `ConfirmDialog` "the page behind it"; the contents entry "the shell". `InputTemplate`'s
`icon?` / `rightSection?` inputs were dropped from its contract as appearance-only, per the
Inputs default above.

**2026-10-02 presentational names.** Only a name changed; every contract and contract name
survives unchanged.

- Heading "`UsageMeter` — the hero interaction" → "`UsageMeter` — the core interaction" (anchor
  `#usagemeter--the-hero-interaction` → `#usagemeter--the-core-interaction`; nothing linked to
  it).
