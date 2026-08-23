# Next.js App Router Starter

A domain-neutral, reusable Next.js (App Router) starter with a token-driven design system and a house UI language. Clone it, reskin the brand tokens in one place, and build.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Edit `app/page.tsx`; the page hot-reloads.

Scripts: `pnpm dev` · `pnpm build` · `pnpm start` · `pnpm type-check` · `pnpm lint` · `pnpm format`.

## Architecture

The binding conventions (no hardcoding, single source of truth, no code comments in TS/TSX) apply to everything in this repo. Follow them before adding anything.

## Reskin in one place

Brand identity is the swappable default. To rebrand, edit only these three sources of truth:

1. **Color + scale tokens** — `styles/tokens.css`. Change the CSS custom property _values_ (colors, type scale, spacing). Every component derives from these; do not hardcode values elsewhere.
2. **Fonts** — `public/fonts/font.ts`. Swap the `next/font` families; the `--nf-display` / `--nf-body` / `--nf-mono` CSS variables stay the same, so nothing downstream changes.
3. **Page metadata** — the `metadata` export in `app/layout.tsx` (title, description).

Then build UI with the **elegant-ui** skill, which composes against these tokens (text-text, bg-background, font-display, text-h*, ease-smooth) and keeps everything consistent.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
