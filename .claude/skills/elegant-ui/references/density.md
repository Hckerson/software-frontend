# Density & texture — the geometry spec

Padding tokens are necessary and **not sufficient**. A row can be `py-2.5 text-xs size-3` and still render at 76px carrying five data points. Density is a **geometry** and an **information shape**, not a padding scale. This file is the hard spec; SKILL.md holds the gate and the floors.

Paths below are relative to `components/` unless stated. This project has no `src/` directory.

**Read this first: almost everything here is prescriptive.** This starter ships four components — `common/button.tsx`, `ui/forms/input-template.tsx`, `providers/provider.tsx`, `wrappers/motion-wrapper.tsx`. There is no Card, Table, Badge, Avatar, Modal, chart or meter. The geometry below is what to **build to**, and the build cost in §5 is real. Do not cite a primitive here as if it existed.

## 1. Row geometry (hard)

| Surface                                    | Height            | Lines | Notes                                                                                                          |
| ------------------------------------------ | ----------------- | ----- | -------------------------------------------------------------------------------------------------------------- |
| Table / list row, text-only                | `h-9` (36px)      | **1** | The default.                                                                                                   |
| Table / list row with an identity artifact | `h-11` (44px)     | **1** | A 32px avatar — see the content-box rule below.                                                                |
| Table header row                           | `h-9`             | 1     | `text-[10px] font-mono uppercase tracking-wide text-text-muted`, quiet weight — never bold all-caps on a fill. |
| Toolbar above a table                      | `h-11 px-3 gap-2` | 1     | From `page-chrome.md`. Never `flex-wrap` — wrapping is what lets a bar exceed its band.                        |
| Stat band (N stats in one strip)           | `h-14`            | **1** | One bordered band with `divide-x divide-border`.                                                               |
| Metric / KPI card                          | `h-20`            | ≤3    | One band: value left, trend artifact right, delta + caption beneath.                                           |
| Card footer (pagination / count / action)  | `h-9`             | 1     |                                                                                                                |
| Dense card body                            | `p-3`             | —     | `p-4` for the ONE hero tile. Never `p-5+`.                                                                     |

**Rows never grow to fit content. Content is chosen to fit the row.**

### The content-box rule

Row height is a **budget**, and cell `py-*` is subtracted from it. `h-11` minus `px-3 py-2` leaves a **28px** content box — smaller than a 32px avatar and smaller than a 32px button. So:

> **Artifact cells and action cells run `py-0` and center vertically** (`flex items-center`). The `py-2` cell padding applies to text cells only.

At `h-9` the content box under `py-2` is 20px — exactly one `text-xs` line, and already too tight for a pill with its own padding. Badge cells run `py-0` too.

In a **grid-based pseudo-table** (a `grid-cols-[…]` row rather than a real `<tr>`) the budget is the row container's own `h-*` with no `py-*` at all — set the height, not the padding.

A row action is a `grid size-5 place-items-center` button — 20px, which fits `h-9` under `py-0`. Do not put a full-size `Button` in a row.

### Height floors — what to build to

- **Row-scale controls need an `h-8` (32px) size that does not exist yet.** `common/button.tsx` sizes are arbitrary responsive heights (`h-[36px] lg:h-[42px] xl:h-[48px]`, plus a `custom` at `h-[35px] lg:h-[45px]`) — those are editorial-register CTA sizes, they are off the spacing scale, and they change height at every breakpoint, which a fixed-height row cannot absorb. **Add an `sm: "h-8 px-3 text-xs"` variant** before using `Button` in application UI.
- **Form controls:** build `Input` / `Select` to `h-8` (`text-xs`) as the small size and `h-9` (`text-sm`) as the default. Form **value** text has a `text-sm` floor for legibility even though the field around it is `text-xs`.
- **Inline editing is out of scope at row scale** until those sizes exist. A 36px control cannot sit in a 36px row with cell padding. Edit on the detail surface the row links to.
- **Checkbox / radio:** fixed `size-4`, no size axis.
- **Avatar:** build `sm` at 32px, `md` at 40px. In rows, only `sm`.
- **`clsx` has no merge**, so a primitive whose base is `w-full` cannot be narrowed by `className`. Either give every primitive an explicit size axis, or wrap it: `<div className="w-44"><Select … /></div>`.

## 2. Information shape — prose has ONE home

The largest density lever, and the one padding cannot reach.

- **A row carries no prose.** Descriptive text has exactly one home per card: a lede slot in the card header, or the detail surface the row links to. Never a second line inside every row.
- **A label never sits above its value inside a row.** Either the label is the column header, or label and value sit side by side. Stacking a value over its note doubles the row for one datum. Note that the shipped `.metric-label` / `.metric-value` / `.metric-meta` classes are built to stack — they are a card treatment, not a row treatment.
- **Row text is single-line, `truncate` + `max-w-*`.** The card's one prose slot is the only place text wraps; `line-clamp-2` belongs there.
- **Column floor — count the TYPE, not the JSX.** A table row renders **≥4 typed columns** when its type declares ≥4 renderable fields. **Relabeling the table as a "list" is not a remedy.** A list card is legal only when the type genuinely declares fewer than 4, and the DENSITY line shows the arithmetic: `columns 3 of 3 typed fields — list, not table`. One field short ⇒ promote an existing enum to a labelled column via a tone lookup, or add the field.

Converting prose to columns is the move: `title` + a wrapped `detail` line becomes `title` + a typed dimension (status, owner, count, timestamp) in the next column.

Inside a row, rank is carried by **weight, colour, case and column position** — never by size. A row's type sits at `text-xs` throughout; `font-medium` + `text-text` vs `text-text-secondary` is the whole ladder.

## 3. Vertical rhythm ladder (application register)

`gap-4` is the **largest** gap in an application view, not its default.

| Between                            | Gap                                           |
| ---------------------------------- | --------------------------------------------- |
| Rows in a stack, elements in a row | `gap-2`                                       |
| Card to card inside a section      | `gap-3`                                       |
| Section to section                 | `gap-4`                                       |
| Section padding                    | `py-4` (`py-6` for the route's first section) |

`py-10` and `gap-8` are editorial values. They are how a dashboard becomes a scroll.

The named `.pad` / `.gap` / `.large-pad` / `.md-pad` classes in `styles/globals.css` are sized for the editorial register. In an application view state the step explicitly (`gap-2`, `p-3`) rather than defaulting to them.

## 4. The artifact catalogue (the TEXTURE floor's vocabulary)

Every row carries **≥1**; a view fields **≥3 distinct kinds bound to ≥3 DIFFERENT fields**; a single row carries **≤3**.

**Three rules that decide whether something counts:**

1. **Bound to a field.** An artifact that renders identically in every row is decoration.
2. **One field, one kind.** A status rail + a status badge + a status-tinted glyph is **one** kind, not three. Counting shapes instead of fields is how a flat screen passes.
3. **It must actually render.** A delta chip renders nothing on a null delta; a sparkline renders nothing under 2 points. For a nullable field, name the fallback in the DENSITY line.

**Row controls are not artifacts.** The selection checkbox, the row action button, the disclosure chevron encode interaction, not data — they count toward neither the ≥1 floor nor the ≤3 cap.

| Kind                 | Encodes          | Build as                                                                                                                                                                      | Row size     |
| -------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **Avatar**           | identity         | `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full` with an `sm` = `size-8` variant; initials fallback at `text-xs`                               | 32px         |
| **Thumbnail**        | the item itself  | `size-8 rounded-md object-cover` via `next/image` — **add the host to `next.config.ts` `remotePatterns` first**, there are none configured                                    | 32px         |
| **Status dot**       | live state       | `inline-block size-1.5 shrink-0 rounded-full` + a `Record<Tone, string>` map (`bg-success` / `bg-warning` / `bg-error` / `bg-info` / `bg-text-muted`)                         | 6px          |
| **Status pill**      | enumerated state | `inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] leading-none font-medium` + the same tone map on `-light` backgrounds                                        | small        |
| **Meter / progress** | ratio to a cap   | `bg-background-alt h-1.5 w-16 overflow-hidden rounded-full` track + a tone-filled inner div at `style={{ width: pct }}`. **Pure CSS — the correct row-scale trend artifact.** | `h-1.5 w-16` |
| **Ranked bar**       | share of max     | the same meter at a fixed width, proportional to the set max                                                                                                                  | inline       |
| **Delta chip**       | change vs prior  | `inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums` + a `size-3` trend glyph, polarity-aware. **Renders nothing when null.**         | `text-xs`    |
| **Icon chip**        | category         | `grid size-6 place-items-center rounded-full border` — counts only when its glyph or tone varies per row                                                                      | 24px         |
| **Sparkline**        | trend shape      | a charting library, or a hand-rolled `<svg>` polyline — **card scale only**                                                                                                   | see below    |

**Sparkline constraint (hard).** No charting library is installed. When you add one, every instance mounts a responsive container with its own resize observer — correct for a 4-tile KPI strip, **wrong for a 50-row table**. For row-scale trend use the pure-CSS meter or a hand-rolled inline `<svg>` polyline, which costs nothing. If you do use a responsive chart inline, it needs a fixed-width **flex-item** wrapper to measure against:

```tsx
<span className="w-16 shrink-0">
    <Sparkline data={points} height={20} />
</span>
```

**`tabular-nums` on every numeric cell.** It is not in the tree yet — introduce it as a habit on figures, deltas, counts and money, so columns of numbers align.

**The eyebrow has no class here.** Write `font-mono text-[10px] uppercase tracking-wide text-text-muted`, or add a `.micro-label` class to `styles/globals.css` alongside `.pad` / `.gap` / `.smooth` and use that.

## 5. What does not exist yet

Build cost is honest. This is the order that unblocks the most: a table route needs rows 1–5, a dashboard route needs 1–4 plus the stat band.

| Missing                     | Cost               | Notes                                                                                                                            |
| --------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| 1. `h-8` button size        | trivial            | add `sm: "h-8 px-3 text-xs"` to `common/button.tsx`; the current sizes are responsive `h-[…]` values                             |
| 2. Status dot + tone map    | trivial            | one `Record<Tone, string>`, reused by the pill and the meter                                                                     |
| 3. Status pill / badge      | trivial            | `text-[10px]` on a `-light` background                                                                                           |
| 4. Meter / progress bar     | trivial            | pure CSS, no dependency — the workhorse row artifact                                                                             |
| 5. Table primitive          | small              | header `h-9`, `divide-y divide-border` rows at a stated `h-9`/`h-11`, cells `px-3 py-2`, `aria-sort` + caret on sortable columns |
| 6. Card / Panel             | small              | header band, body, `h-9` footer; do **not** bake in a fixed padding — take a `padding` prop                                      |
| 7. Avatar                   | small              | `size-8` / `size-10`, initials fallback                                                                                          |
| 8. Delta chip               | trivial            | polarity-aware, returns `null` on a null delta                                                                                   |
| 9. Sparkline / charts       | needs a dependency | none installed; pick one before promising a series                                                                               |
| 10. `.micro-label` class    | trivial            | the eyebrow is hand-rolled everywhere until it exists                                                                            |
| 11. `images.remotePatterns` | trivial            | `next.config.ts` has none — every remote thumbnail is blocked until added                                                        |

Build these to the house standard in SKILL.md (`forwardRef` + `displayName` + `cva`), give each an explicit size axis rather than relying on `className` overrides, and add a `components/ui/index.ts` barrel as they accrue.
