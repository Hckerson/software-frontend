# Motion

`motion@12` (the library formerly called Framer Motion) is the animation layer for this app.
This file is the reference for **what it can do**, **what we use it for**, and **what stays CSS**.

---

## 1. Entry points

| Import path           | Gives you                                                                      |
| --------------------- | ------------------------------------------------------------------------------ |
| `motion`              | Vanilla JS: `animate`, `scroll`, `inView`, `stagger`, `spring`                 |
| `motion/react`        | Full React API — `motion.*`, `AnimatePresence`, hooks                          |
| `motion/react-m`      | The `m` component (tree-shakeable, ~5kb with `LazyMotion`)                     |
| `motion/react-client` | Pre-marked `"use client"` — lets `<motion.div>` sit in a Server Component file |
| `motion/mini`         | ~2.5kb `animate`/`scroll` built on native WAAPI                                |

**In this codebase:** always `motion/react`, always the `m` component — never `motion.*`.
`LazyMotion` runs with `strict`, which throws if a full `motion` component is used.

---

## 2. The ten mechanisms

### 1 — Enter / exit (mount & unmount)

Anything that appears or disappears from the tree. CSS cannot animate an unmount.

Modals, dialogs, drawers, popovers, tooltips · toasts · accordions and expandable rows ·
items removed from a list · route transitions · wizard steps · tab panels · skeleton→content ·
empty-state→populated swaps.

**Applied here** — this is the workhorse category:

| Surface        | What animates                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `ui/modal.tsx` | Backdrop fade + plate scale. Covers every modal in all four portals.                                     |
| `(auth)`       | Form errors, field errors, reset step swaps                                                              |
| `(public)`     | Listing lightbox, gallery frame crossfade, search result set, filter chips                               |
| `admin`        | Table rows, table↔empty swaps, focus hero swaps, verification queue rail                                 |
| `agent`        | Listing table rows, pipeline column empty states, deal notes disclosure                                  |
| `dashboard`    | Viewing / offer / saved / alert rows, settings notices, offer timeline, message thread, typing indicator |

### 2 — Layout & shared element (`layout`, `layoutId`)

FLIP animation when position or size changes — no manual measurement.

**Applied here:**

- Listing dossier **tab indicator** — `layoutId` namespaced with the Tabs context `baseId`
- **`FilterPills`** selection highlight — `layoutId` namespaced with `useId()`
- **Pipeline kanban** — advancing a deal makes the card physically travel between columns
  (`layoutId={deal-<id>}` with `layout="position"`)

Namespacing is **mandatory**. Two un-namespaced instances on one page share an indicator and
it flies across the screen between them.

`layout="position"` on the kanban card is deliberate: full `layout` would scale the card and
distort its contents mid-flight.

### 3 — Gestures

`whileHover` / `whileTap` / `whileDrag` · drag with constraints · swipe-to-dismiss ·
drag-to-reorder (`Reorder`) · sliders driven by pointer velocity.

**Applied here:** nothing. Hover and press states are CSS transitions; nothing is draggable.

### 4 — Scroll-driven

`useScroll` progress · `whileInView` reveals · parallax · shrinking sticky headers ·
scroll-linked SVG drawing.

**Applied here:** `Reveal` on the below-fold home sections only.
Deliberately absent from all four portals — scroll reveal is an editorial device and the
portals are an application register.

### 5 — Motion values (state that bypasses React render)

`useMotionValue` / `useTransform` / `useSpring` / `useVelocity`.

**Applied here:** nothing, and nothing should be.
`ProgressBar` carries `transition-all duration-500 ease-smooth`, so every meter built on it —
share, compliance, escrow, queue-load, error-budget, region-share, user-volume, exposure —
animates its fill in CSS for free.

### 6 — Orchestration (variants + stagger)

**Applied here:** the auth plane cascades its five sections at 40ms; search results stagger
at 25ms.
**Not** applied to any portal data table — staggering 20+ rows on every filter keystroke reads
as lag, not polish.

### 7 — SVG & iconography

**Applied here:** nothing. Charts are Recharts, which owns its own animation.

### 8 — Feedback & state communication

**Applied here:**

- Auth submit button crossfades arrow↔spinner
- Row exits double as action confirmation — suspending a user or cancelling a viewing
  visibly removes the row
- Offer timeline entries animate in; countering an offer makes its own receipt appear
- Settings notices collapse in rather than jolting the page
- No shake on error: wrong register for this design language

### 9 — Vanilla-JS contexts

**Applied here:** N/A.

### 10 — Cross-cutting concerns

- **Reduced motion** — `MotionConfig reducedMotion="user"` disables transforms app-wide while keeping opacity fades
- **Interruptibility** — animations retarget mid-flight from current velocity instead of snapping
- **Independent transforms** — `x`, `scale`, `rotate` animate on separate timelines and never fight
- **Off-main-thread** — opacity/transform hand off to WAAPI where supported

---

## 3. Where it is the wrong tool

- Hover colour/opacity/border transitions → CSS `transition`
- Infinite decorative loops (pulsing dots, marquees, shimmer) → CSS `@keyframes`
- Enter-only fades with no exit → CSS animation or `tw-animate-css`
- Collapsible height where the content must stay in the SSR HTML → CSS `grid-template-rows: 0fr → 1fr`
- Anything that never unmounts, never moves, and is not pointer- or scroll-driven

Motion earns its bundle on **exit animations, layout transitions, gestures, and scroll-linked
values** — the four things CSS structurally cannot do.

### Deliberate CSS holdouts

| Surface                                                        | Why it stays CSS                                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `brand-panel.module.css`                                       | Infinite decorative loop, already off the React tree, already reduced-motion guarded. |
| `ProgressBar` and every meter                                  | Already transitions its fill.                                                         |
| `search-filter-aside` mobile collapse                          | `grid-template-rows` keeps the rail in the SSR HTML; a JS panel would strip it out.   |
| Role-choice toggle, tab-strip geometry, all hover/focus states | CSS transforms are exact and free.                                                    |
| `DropdownMenu`                                                 | Pure `group-hover:block`, no JS state.                                                |
| `Drawer`                                                       | Hand-rolls its own mount delay and translate. Works; leave it.                        |

---

## 4. House conventions

### Where the values live

Never inline a duration, easing or variant.

| File                          | Holds                                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `lib/config/motion.ts`        | `EASE_SMOOTH`, `FAST`, `NORMAL`, the `MotionPresence` interface, and the seven app-wide presets below |
| `lib/config/auth-motion.ts`   | `AUTH_PLANE_MOTION`, `AUTH_SECTION_MOTION`, `AUTH_COLLAPSE_MOTION`, `AUTH_SWAP_MOTION`                |
| `lib/config/public-motion.ts` | Search, gallery, lightbox, tab-panel and reveal presets                                               |

### Which preset when

Picking the wrong one is the easiest mistake to make here.

| Preset                                         | Use for                                                                                                                                               |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MODAL_BACKDROP_MOTION` / `MODAL_PLATE_MOTION` | Overlays. Already wired into `ui/modal.tsx`.                                                                                                          |
| `TABLE_ROW_MOTION`                             | `<tr>` only. **Opacity, no transform** — `<tr>` cannot animate height reliably and transforms clip against dividers in `table-fixed`.                 |
| `LIST_ROW_MOTION`                              | `<li>` and block list items. True height collapse, so the gap closes instead of snapping. Needs `overflow-hidden` on the item.                        |
| `COLLAPSE_MOTION`                              | Disclosure blocks — expanding notes, inline error text, notices. Needs `overflow-hidden`.                                                             |
| `ENTRY_MOTION`                                 | **Appended** entries: chat messages, timeline events. Rises and fades at `NORMAL`; an arriving message should not behave like a row leaving a filter. |
| `CONTENT_SWAP_MOTION`                          | Keyed swaps. Usually reached via `PresenceSwap` rather than directly.                                                                                 |

`FAST` is 0.2s, `NORMAL` is 0.35s, `EASE_SMOOTH` is `[0.25, 0.46, 0.45, 0.94]` — mirroring
`--durations-*` and `--timing-functions-smooth` in `styles/tokens.css`. Motion needs numeric
seconds and CSS needs its own tokens, so the two values are written once on each side of that
boundary. That duplication is deliberate; do not read computed styles at runtime.

### The provider

`MotionProvider` (`LazyMotion features={domMax} strict` + `MotionConfig reducedMotion="user"`)
mounts once in the root provider tree. `domMax` is required because we use layout animations.
Every `m.*` component depends on it being an ancestor.

### Reusable wrappers

- `components/patterns/reveal.tsx` — `whileInView` reveal, marketing surfaces only
- `components/patterns/presence-swap.tsx` — keyed content swap (table↔empty, focus hero replacement)

### Three gotchas that will bite you

**1. `HTMLAttributes` vs `HTMLMotionProps`.** Spreading React's `HTMLAttributes<HTMLDivElement>`
onto an `m.div` fails to compile — React's `onDrag` is a `DragEventHandler`, Motion's is a pan
handler. Extend `HTMLMotionProps<"div">`. Never reach for a cast.

**2. Exit animations need their content to survive.** The common call-site shape is
`open={item !== undefined}` with `{item && …}` inside. Both flip in the same commit, so the
exit plays on an empty box. `Modal` holds the last-open children in a ref and renders those
during exit. Any new overlay primitive needs the same treatment.

**3. Nested `AnimatePresence` blocks exit propagation.** An inner `AnimatePresence` reports
its children as present even while an outer one is exiting. Pass `propagate` on the inner one
when the exit must reach through — the auth reset steps do this.

### No-JS fallback

`Reveal` stamps `data-reveal` and ships `opacity: 0` inline. `styles/globals.css` carries:

```css
@media (scripting: none) {
    [data-reveal] {
        opacity: 1 !important;
        transform: none !important;
    }
}
```

`!important` in a stylesheet beats Motion's inline style. This covers _disabled_ JavaScript,
not JavaScript that failed to load — there is no CSS hook for the latter.

---

## 5. Coverage by route group

All five groups have had a pass.

| Group       | State                                                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `(auth)`    | Plane cascade, field/form error collapse, reset step swaps, submit spinner crossfade                                                    |
| `(public)`  | Home scroll reveal, search result set + filter chips, listing gallery + lightbox, dossier tabs                                          |
| `admin`     | Modal enter/exit, row exits across five tables, table↔empty swaps, focus hero swaps, verification queue collapse, filter pill indicator |
| `agent`     | Pipeline kanban cards travelling between columns, deal notes disclosure, listing row exits, calendar schedule view swap                 |
| `dashboard` | Row exits across four tables, settings notices, offer timeline entries, message thread + typing indicator                               |

### Known gap

Route-change exit transitions are **not** implemented anywhere. Next's App Router hands the
layout its new `children` before the old page unmounts, so `AnimatePresence` never sees an
exiting child. The fix is a `FrozenRoute` wrapper pinning `LayoutRouterContext` — internal API
that Next has broken before. Entrance-only is the deliberate choice.
