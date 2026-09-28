# Level Upgrade Prompts (0–4)

Prompts for redesigning any app built on this starter, one layer at a time from tokens up to pages.

| Level | Layer        | Lives in                                                             |
| ----- | ------------ | -------------------------------------------------------------------- |
| 0     | Tokens       | `styles/tokens.css`, `styles/globals.css`, `public/fonts/font.ts`    |
| 1     | Primitives   | `components/ui/*` and shared single-purpose parts                    |
| 2     | Compositions | Rows, bands, headers and forms built from primitives                 |
| 3     | Sections     | Data-bound views that own loading / empty / error / populated states |
| 4     | Pages        | `app/**` pages, layouts and route-level files                        |

**How to use:** fill in the **Project profile** once, then run one level per session, in order (0 → 4). Level 0 is a standalone prompt. For levels 1–4, paste the **Shared brief** followed by that level's section. Replace every `{{PLACEHOLDER}}` with its profile value before pasting. Each level builds on the one below it, so finish and commit a level before starting the next, and carry its follow-up list into the next level's `{{NOTES}}`.

**Before levels 2–4:** if the screens sit behind the session check, start the `nest-setup` backend and have a test login ready, otherwise the screenshots in "Done means" cannot be taken.

---

## Project profile

| Placeholder        | Meaning                                                  | Example (Ledgerline)                                                                                                                                                   |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{APP}}`          | Product name                                             | Ledgerline                                                                                                                                                             |
| `{{DESCRIPTION}}`  | One-line description of what the app is                  | a Next.js 16 fintech app (read-only business banking console)                                                                                                          |
| `{{REGISTER}}`     | The class of product it should feel like                 | top-tier web3                                                                                                                                                          |
| `{{REFERENCES}}`   | Products whose feel to match                             | Linear, Vercel, Uniswap's current app, Phantom                                                                                                                         |
| `{{ACCENT}}`       | The single accent hue (level 1+, once level 0 picked it) | lime                                                                                                                                                                   |
| `{{FONTS}}`        | The type pair (level 1+)                                 | Geist + Geist Mono                                                                                                                                                     |
| `{{NUMERIC}}`      | The class every number uses (tabular, slashed zero)      | `.figure`                                                                                                                                                              |
| `{{THEME_WIRING}}` | Where the theme class and browser theme colour are set   | `THEME_CLASS` / `THEME_COLOR` in `lib/constants.ts`                                                                                                                    |
| `{{TONES}}`        | Where colour pairs and domain → tone maps live           | `TONE_CLASSES` / `Tone` (`lib/constants.ts`, `lib/enums/tone.ts`); domain maps in `lib/ledger/constants.ts`                                                            |
| `{{SCREENS}}`      | The most representative screens to screenshot            | the dashboard, an account ledger, and a transaction detail                                                                                                             |
| `{{FEATURE}}`      | The feature folder holding levels 2–3                    | `components/ledger/`                                                                                                                                                   |
| `{{L2_FILES}}`     | Compositions in scope for level 2                        | `account-row`, `account-hero`, `ledger-row`, `ledger-header`, `ledger-summary`, `ledger-table`, `ledger-toolbar`, `portfolio-band`, `components/common/login-form.tsx` |
| `{{L3_FILES}}`     | Sections in scope for level 3                            | `ledger-view.tsx`, `transaction-detail.tsx`, `account-list.tsx`                                                                                                        |
| `{{NOTES}}`        | Project-specific work: the previous level's follow-ups   | see each level                                                                                                                                                         |

---

## Level 0 — Tokens (standalone)

Rerun it to rebrand or retune the design language; it works against the tiered structure once in place.

```markdown
Redesign the token layer (level 0 only) of {{APP}}, {{DESCRIPTION}}.

## Target feel

Simple, minimal, {{REGISTER}}: think {{REFERENCES}}.

- Dark by default, near-black neutral surfaces, depth from surface steps and hairlines, not shadows.
- One electric accent used sparingly; everything else is greyscale plus status colour.
- Two type families at most: one geometric sans, one mono. Numbers always mono, tabular, slashed zero.
- Tight, consistent geometry: one radius language, 1px hairlines, snappy motion.
- Explicitly NOT: violet/blue gradients, glassmorphism, glows, noise, gradient text, rounded-full CTAs.

## Scope

- In: styles/tokens.css, styles/globals.css (@theme + named classes), public/fonts/font.ts,
  theme wiring in app/layout.tsx ({{THEME_WIRING}}).
- Out: components. Components must not need edits — keep every public token/class name stable.
- Light theme: keep it as a complete, equal-quality counterpart, toggled by the existing .dark class.

## Engineering bar

- Tiered tokens: brand (hue/chroma) → theme (lightness) → semantic. Rebrand = one number.
- OKLCH. Derived colours (tints, washes, shadows, edge) computed from base tokens, never restated.
- WCAG AA ≥ 4.5:1 for every text/background pair in both themes — prove it numerically,
  including tone text on its own `-light` wash.
- Audit every @theme mapping through Tailwind's compiler and confirm each produces a working
  utility; fix any that don't without shifting existing geometry (`p-3` must stay 12px).
- No raw values in globals.css (px, rem, breakpoints, opacities) — tokens or theme() only.
- MOTION_DURATION in lib/constants.ts must keep mirroring the --durations-* tokens
  (lib/constants.test.ts enforces it).
- If the theme background changes, update the browser theme colour ({{THEME_WIRING}}) to match.
- Flag, don't delete, anything that looks unused.

## Process

1. Audit first: report what exists, what's broken, what's redundant. Wait for my go-ahead.
2. Propose the palette, type pairing and radius/motion scale with reasoning, then build.
3. Verify with type-check, lint, tests, build, and a screenshot of {{SCREENS}} in both themes.

## Done means

Components untouched, all checks green, contrast table included, screenshots attached,
the elegant-ui skill updated if any class or token it documents changed,
and a short list of follow-ups for level 1.
```

---

## Shared brief

```markdown
Upgrade one component layer of {{APP}}, {{DESCRIPTION}}, to match the level 0 tokens already in place.

## Target feel

Simple, minimal, {{REGISTER}}: think {{REFERENCES}}.

- Dark by default, near-black neutral surfaces, depth from surface steps + hairlines + the
  `inset-shadow-edge` top highlight, not drop shadows.
- One electric accent ({{ACCENT}}) used sparingly; everything else greyscale plus status colour.
- {{FONTS}} only. Every number uses `{{NUMERIC}}` (tabular, slashed zero).
- Dense application register: `text-xs` field, one focal value per card, rows h-9 / h-11.
- Explicitly NOT: violet/blue gradients, glassmorphism, glows, noise, gradient text,
  rounded-full CTAs, hover:scale, scroll-reveal animations.

## Ground rules (non-negotiable)

- Follow `.claude/CLAUDE.md` and load the `elegant-ui` skill before touching JSX.
- Only house tokens and classes: no hex, no stock Tailwind palette, no bracketed values,
  no breakpoint prefixes in className (the lint rules enforce this).
- Colour pairs come from {{TONES}}. Never hand-write `bg-X-light text-X`.
- Focus styling comes from the global `:focus-visible` outline in `styles/globals.css`.
  Do not add per-component `ring-2` focus classes.
- Do not change level 0 (styles/, public/fonts/). If a token is missing, stop and propose it.
- Stay inside this level's scope. Changes needed in another level go in the follow-up list.
- Keep public props stable unless this level's brief says otherwise; if a prop must change,
  update every consumer in the same pass.
- Flag, never delete, anything that looks unused (CLAUDE.md rule 9).

## Process

1. Audit this level: list every file, what violates the target feel or the rules above, and
   what's missing (states, artifacts, a11y). Stop and wait for my go-ahead.
2. Build, one file at a time, gate lines first.
3. Verify: `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm build`, then screenshots of
   {{SCREENS}} in the dark theme (and light theme by removing the theme class temporarily —
   restore it after).

## Done means

All checks green, screenshots reviewed by you (not just taken), no files outside this level's
scope changed, and a short follow-up list for the next level.
```

---

## Level 1 — Primitives

```markdown
## This level

Scope: `components/ui/*` and `components/common/button.tsx`.
Out of scope: `{{FEATURE}}*`, other `components/common/*` compositions, `app/`.

Known work:

- Replace repeated `tabular-nums slashed-zero` with `{{NUMERIC}}`.
- Add `inset-shadow-edge` to raised planes and check it reads on dark, and is invisible rather
  than wrong on light.
- Check every size variant against the density rules, which allow `text-sm` only for input
  value text.
- Where the elegant-ui skill references primitives that do not exist, or a composition
  hand-rolls one (inputs, fields), propose (don't build yet) the primitive for level 2 to adopt.
- Only build a new primitive (delta chip, status dot, meter variant) if a level 2 component
  needs it; name the consumer.
  {{NOTES}}
```

---

## Level 2 — Compositions

```markdown
## This level

Scope: in `{{FEATURE}}`: {{L2_FILES}}.
Out of scope: {{L3_FILES}} (level 3), `app/` (level 4).

Known work:

- Remove per-component `ring-2 ring-accent outline-none` focus classes; rely on the global outline.
- Compact-field pass: find every `text-sm` / `text-base` in scope and demote each non-focal,
  non-title hit to `text-xs` in one sweep.
- Every row carries ≥1 data-bearing artifact, and each view fields ≥3 kinds bound to different
  fields. Name the field each artifact reads.
- Row geometry: `h-9` text rows, `h-11` rows with an avatar; artifact cells `py-0`, centred.
- Adopt `{{NUMERIC}}` on every amount, count and reference; adopt any level 1 form primitive
  in the forms that hand-roll their inputs.
- Hover: `transition-colors` only, except the one focal tile per view.
  {{NOTES}}
```

---

## Level 3 — Sections / views

```markdown
## This level

Scope: in `{{FEATURE}}`: {{L3_FILES}}.
Out of scope: compositions (level 2) and `app/` (level 4).

Known work:

- Each section must render all four states: loading, empty, error, and populated. Loading
  uses skeletons at final row geometry (no layout shift); error surfaces the TanStack Query
  error and offers retry; empty copy comes from constants, not inline strings.
- Data only through `lib/hooks/use-*`; no client calls, no inline data arrays.
- One focal element per section, expressed structurally (scale / span), never by a badge.
- Depth floor: ≥2 planes per card, at least one a real surface step
  (`bg-background` → `bg-background-alt` → `bg-background-muted`).
- Entrances: `fade-in` at most on content; no staggered or scroll-triggered reveals.
- Keep every file under ~150 lines; split into level 2 compositions if it grows.
  {{NOTES}}
```

---

## Level 4 — Pages

```markdown
## This level

Scope: `app/**/page.tsx`, `app/layout.tsx`, and new route-level files under `app/`.
Out of scope: everything in `components/` except composing it.

Known work:

- Any `<main>` shell repeated across sibling pages moves into the nearest nested `layout.tsx`
  (Next's native nested layout) so pages only compose sections.
- Add `not-found.tsx`, `loading.tsx` and `error.tsx` where a route needs them (every protected
  route segment at minimum), styled in the house language, copy from constants.
- The login page (`app/auth/login/page.tsx`) is the one editorial moment: one focal heading,
  one CTA, no second effect layer.
- Pages stay compose-only (`starter/page-composes-only`): no data, no inline components.
- Confirm every route's `<title>` and metadata come from constants, not literals.
  {{NOTES}}
```
