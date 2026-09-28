# Dashboard anatomy — the composition archetypes

Read before building any dashboard, admin route, analytics view, or panel-composed screen. These are the shapes first-class admin UI actually uses; picking the wrong one is why a dense route still scrolls. Geometry comes from `density.md`.

Paths are relative to `components/`; this project has no `src/`. Classes compose with **`clsx` only — there is no `cn` helper and no tailwind-merge**, so a `className` never overrides a base utility of the same property, it just appends both. Every archetype below is **prescriptive**: this starter ships no Card, Table, Panel, chart or meter, so each one is a build, and `density.md` §5 has the order.

## The failure this prevents

A route built as _"section → section → section, each full width, each `gap-8` apart"_ is a scroll, not a dashboard. Every archetype below exists to put more decided information inside one viewport.

---

## 1. Stat band — N stats in ONE band, not N cards

The highest-yield structure here. Five labelled stats fit in a single `h-14` band; the same five as cards cost four times the height and read as five unrelated things.

A bordered band is a card for the depth floor's purposes, and it is not chrome — so it owes the floor two planes — take them at zero height cost by tinting the band and letting the value chips sit on the base surface:

```tsx
<div className="border-border-light bg-background-alt divide-border-light flex h-14 items-center divide-x rounded-lg border">
    {stats.map((stat) => (
        <div
            key={stat.id}
            className="flex min-w-0 flex-1 items-center gap-2 px-3"
        >
            <stat.icon
                className="text-text-muted size-3 shrink-0"
                strokeWidth={1.5}
                aria-hidden
            />
            <span className="text-text-muted min-w-0 truncate font-mono text-[10px] tracking-wide uppercase">
                {stat.label}
            </span>
            <span
                className={clsx(
                    "bg-background ml-auto rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                    stat.tone,
                )}
            >
                {stat.value}
            </span>
        </div>
    ))}
</div>
```

Use when the stats are **peers of one subject** (pipeline: total / new / in-review / approved / rejected). Use separate cards only when each stat owns its own trend, timeframe or drill-through.

**Color is the point:** `stat.tone` is a token lookup on state (`text-success`, `text-warning`, `text-error`), the same map the status dot and meter use. A band of uniformly `text-text` numbers is the flat failure. **Because `clsx` only appends, keep the base string free of any `text-*` color** — adding one later would ship both and let stylesheet order decide.

## 2. KPI card — value and trend share ONE band

Not label → value → delta stacked down the card. Value left, trend right **on the same row**, delta beneath.

**The shipped `.stat-card` family is the stacked shape, not the band.** `styles/globals.css` gives `.stat-card` `display:flex; flex-direction:column; height:100%` with `.metric-icon` (margin-bottom), `.metric-label`, `.metric-value` (`text-h5`, `font-light`, display face) and `.metric-meta` stacked beneath — four bands and no height cap. Its `--metric-color` hook and the `.stat-card--pipeline/--success/--activity/--warning` modifiers are genuinely useful; the **stacking** is what to replace. Rebuild as one `h-20` band that reuses those tone modifiers.

**Read the cost before the code.** A trailing sparkline means the metric type carries a series **and** a charting dependency exists — neither is true yet. Before shipping a KPI card:

- A card whose only artifact is a **delta chip** renders **zero** artifacts when the delta is null. That is a texture-floor breach, not a judgement call.
- If the type carries neither a series nor a ratio, don't ship the card: fold the metric into the stat band, or declare `VETO: TEXTURE — <metric> has no series or ratio — …`.
- A pure-CSS **meter** is the artifact that needs no dependency. Prefer it over promising a chart.

The label is a `font-mono text-[10px] uppercase tracking-wide` eyebrow **inside** the band, above or left of the value — a separate header band would blow the `h-20` cap on its own.

## 3. Chart card — the headline number lives INSIDE the chart header

A chart card carries its own focal readout and its range control in the header, then the plot, then the accessible table view.

Do not put a chart in a bare card with a title and nothing else — the plot has no readout to anchor it. No charting library is installed; pick one deliberately, and note that every responsive chart mounts its own resize observer per instance (see `density.md` §4).

Pair the plot with a `<details>`-based table view so the data is reachable without the canvas.

## 4. Table card — four bands, in order

```
toolbar    h-11  search + filter Selects + "More" · right-aligned actions (Export / New)
header     h-9   quiet mono column labels, sort caret if sortable
rows       h-9 / h-11, one line each, ≥4 typed columns
footer     h-9   pagination left · "Showing 1–8 of 50" right
```

- **Never `flex-wrap` the toolbar** — wrapping is exactly what lets a bar exceed its stated band.
- Row height goes on the row (`h-9`), not in the cell padding. Naming `h-9` in your DENSITY line requires `h-9` in the JSX.
- Filter controls are `Select` **wrapped in a sized box** (`<div className="w-44">`) — with `clsx` and no merge, a `w-full` base cannot be narrowed through `className`.
- The row count line is not optional. A table without "showing X of Y" hides its own scale.
- Sorting: build `aria-sort` + a caret on the header, or don't imply a sortable column. There is no sortable-header primitive here.

## 5. List / rail card — header, rows, footer action

```
header   title + a count chip on the right
rows     divide-y divide-border, one line, each with its artifact
footer   a single "View all →" action at h-9
```

A list card is the correct downgrade **only** when the type declares fewer than 4 renderable fields — it is not a way to duck the column floor. Every row still carries its artifact; a `<dl>` of label/value pairs with no dot, meter or pill is the textureless row.

## 6. Ranked set — hero tile + condensed rail

When the typed shape declares rank (`featured`, `rank`, a fixed order), **a table row cannot express it** — span, scale jump and internal-layout changes are all unavailable inside a fixed-height row, and recoloring one row is the cosmetic fail.

Pull the ranked item out: a hero tile carrying the rank (larger span, an added data point, its own internal layout) above a condensed table or rail of the peers. Rank lives in the tile, never in a special row.

## 7. Three-zone shell

```
┌────────┬───────────────────────────────┬──────────────┐
│  rail  │  main column                  │ context rail │
│  w-60  │  flex-1 min-w-0               │  w-72/w-80   │
│  w-14  │  stat band                    │  activity    │
│ collapsed  chart + table               │  queues      │
└────────┴───────────────────────────────┴──────────────┘
```

The context rail is a **peer of the main column for the whole route**, not an `xl:col-span-1` inside one section. Stacking full-width sections and splitting 2/3–1/3 inside only one of them wastes the right third of every other section.

Rail geometry is in `page-chrome.md` (`bg-sidebar border-r border-sidebar-border`, `w-60` expanded / `w-14` icon-only). **Never dark rail + dark bar.** Chrome is exempt from both floors.

Nav grouping, above ~7 items: section labels (`font-mono text-[10px] uppercase tracking-wide`), children indented under an L-connector (`border-l border-border` on the child list) rather than by padding alone.

---

## Choosing

| The data is                                | Build                                                                                               |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| peer stats of one subject                  | stat band (1)                                                                                       |
| metrics with independent series            | KPI cards with trailing sparklines (2) — check the type has one, and that a chart dependency exists |
| one series over time                       | chart card with embedded readout (3)                                                                |
| an equal-rank set, type declares ≥4 fields | table card (4)                                                                                      |
| an equal-rank set, type declares <4 fields | list card (5)                                                                                       |
| a set whose type declares rank             | hero tile + condensed rail (6)                                                                      |
| a route with ambient/streaming context     | three-zone shell (7)                                                                                |
