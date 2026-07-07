# Project Instructions

This is a reusable **Next.js App Router starter**. It ships architecture, conventions, and one example per layer as a foundation for new projects.

## Non-negotiable rules

1. **No comments in code.** Ever. Code must read clearly on its own — if it doesn't, the abstraction is wrong.
2. **No hardcoding.** API routes, durations, enums, copy that appears twice — all live in `lib/constants.ts` or feature-scoped `lib/<feature>/constants.ts`. Use `config.api.*` for endpoints, `lib/motion.ts` for timing, Zod schemas for shapes.
3. **No `any` in TypeScript.** Use `unknown` + narrowing or precise types. Derive types from Zod with `z.infer`.
4. **Match the existing architecture.** Do not invent new patterns. Preserve abstractions. Before deviating from STYLE.md, explain why.
5. **Use the framework natively.** Reach for Next.js features and libs already in use (Query / Zustand / Zod / motion / CSS `clamp()`) before adding dependencies. Build what the tool already does.
6. **Single source of truth.** Name recurring decisions once as a semantic token and reference it everywhere. Define once, change in one place.
7. **Minimize LOC.** Prefer the shorter solution when equally maintainable.

## Required patterns

| Need | Use |
|------|-----|
| Styling | Token-first: named scale classes in `styles/globals.css` (`.base-text`, `.pad`, `.gap`, `.smooth`). Never inline responsive utility chains. Add colors/animations as theme tokens. See STYLE.md › Styling. |
| Component patterns | Reuse `components/ui/` (primitives) and `components/<feature>/` (feature parts) before writing JSX from scratch. New patterns must promote to a primitive once used twice. |
| State management | TanStack Query for server state. `useState` / `useReducer` / URL params for local state. `useSyncExternalStore` + `localStorage` for persistence. Avoid global stores unless complexity demands it. |
| Validation | Zod schemas. Derive types with `z.infer`. Never use loose types for API responses. |
| IDs | `nanoid`. Never `uuid` or `Date.now()`. |
| Async flows | Keep API functions in `lib/api/<resource>.ts`, wrap in hooks in `hooks/api/use-<resource>.ts`. Components consume hooks — never call API functions directly. |

## Folder Structure

| Route | Immediate Subfolders | Purpose |
|-------|----------------------|---------|
| `/app` | *(flat)* | Next.js App Router pages and layout. |
| `/components` | `common` • `general` • `icons` • `providers` • `routes` • `ui` • `wrappers` | Component hierarchy: primitives in `ui/`, feature components co-located, wrappers for patterns. |
| `/components/ui` | `auth` • `cards` • `charts` • `forms` • `skeletons` | Reusable UI primitives and patterns. |
| `/hooks` | *(empty — use `/lib/hooks`)* | Root-level hooks reserved for global patterns only. Feature hooks live in `/lib/hooks/`. |
| `/lib` | `data` • `enums` • `hooks` • `interface` • `types` • `utils` • `validations` | Core logic layer: types, utilities, API setup, validation schemas. |
| `/public` | `fonts` | Static assets. |
| `/styles` | *(flat)* | Global styles and token exports. |

## File rules

- **One component per file.** Kebab-case filenames matching the export (`motion-wrapper.tsx` → `MotionWrapper`).
- **Absolute imports via `@/`.** Never deep-relative (`../../../lib/...`).
- **Files over ~150 lines → split.** Co-locate feature components under `components/<feature>/`.
- **Add packages with `pnpm add`.** Never hand-edit `package.json`.

## Pre-merge checklist

1. `pnpm type-check` clean (`tsc --noEmit`).
2. `pnpm lint` clean.
3. No `any`, no `console.log`, no dead code, no comments.
4. No hardcoded values (URLs, copy, magic numbers, query keys). All constants in `lib/constants.ts` or feature scope.
5. Reused existing primitives, utilities, and patterns. Nothing reinvented.
6. Architecture and file structure match this layout exactly.

**This is the only architecture.** Follow it precisely. If you're unsure where something goes, the design is broken—re-read this instead of inventing new locations.
