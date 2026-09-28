---
name: cinematic-web
description: >-
    The cinematic register: award-level, motion-led marketing pages where one
    hero object or world carries the brand and scroll plays the page like a
    film. Use for any landing page, marketing site, product launch page, hero
    section, "make it look like an Awwwards site", "not a template", "premium
    website", or when the user shares reference frames / URLs of a motion-heavy
    site. Sits on top of elegant-ui (which still owns tokens, primitives and file
    structure). Not for dashboards, forms or app screens.
---

# Cinematic Web

A basic site is what happens when code starts before a concept exists. This skill forces the concept, the scene score and the technique to exist first, builds against them, then checks the result against them.

Load `elegant-ui` alongside this. It owns vocabulary and structure; this skill owns the visual register.

## The standard

Measured against the references in `references/`. What they share, and what every build must have:

1. **One hero object or world that is a metaphor for the product.** Someone who reads no copy still gets the idea. Never a generic gradient blob, a globe, floating UI cards, or particles with no structure.
2. **Scroll is the timeline.** The page is a sequence of scenes; the hero changes state between them (disperses, converges, turns, splits, opens).
3. **Choreography.** Copy reveals are cued to the hero's motion from one shared progress value, never independent fade-ins.
4. **Restraint.** Near-black or near-white ground, one accent at most, colour lives in the hero and in light, not in UI paint. A large light display face, tiny mono or uppercase labels, generous negative space.
5. **The signature recurs.** The hero device (a shape, a light, a motion) returns as a motif down the page, as image frames, dividers or transitions, so every section belongs to the same site. A hero that is never echoed makes the rest of the page read as a template.
6. **No repeated section header.** Vary header composition (split title and lead, header beside media, centred quote); the same eyebrow, title and empty right half nine times is the template tell. Feature one item in every grid instead of equal columns.
7. **Tactility.** Pointer response has inertia (damped, never 1:1). Nothing snaps, nothing bounces.

## Workflow

Run these in order. Steps 1–4 produce a written concept and **end the turn** for approval unless the user said "just build it".

### 1. Brief

Ask once, in one message, only what is missing: product and what it does, audience and what they must believe after five seconds, mood (three adjectives), references (URLs, frames, or names in `references/`), real copy or placeholder, existing assets. Never invent real-looking customer numbers, logos or testimonials; placeholder copy is marked as placeholder.

### 2. Metaphor

Three candidate hero objects. For each: the object, the product truth it expresses, why it beats the obvious choice. Recommend one in two sentences.

### 3. Journey and score

- **Beats:** four to seven, e.g. recognition → tension → turn → substance → proof → commitment. State what the visitor believes after each.
- **Feeling curve:** one emotion per scene; neighbours differ; the peak gets the most scroll length and the one before it is quieter.
- **Scene table:** `scroll range | hero state | camera | copy on screen | device | pointer`. Devices come from `techniques.md` › Devices; use at least four families, never the same device twice in a row, at most two scrubs.
- **Anchor variety:** copy alternates lead / trail / split; never centred in every scene.

### 4. Technique and art direction

- Pick the **hero route** from `techniques.md` (procedural canvas, scrubbed media, or real-time WebGL) and say why the other two lose for this metaphor.
- Name the single hardest visual problem and the plan for it.
- Palette as tokens (ground, ink, muted ink, accent, glow), type pair with `clamp()` sizes, motion curves and durations as tokens. These become entries in `styles/tokens.css`, never inline values.
- ASCII wireframes of the hero and the peak scene at desktop and 390px.
- **Fingerprint gate:** compare against `references/fingerprints.md`. The build must differ from every prior row on at least 4 of: page shape, nav treatment, hero route, scene sequence, close, signature move. Report the comparison.
- List every package or tool the route needs that the repo lacks. Do not install; ask.

### 5. Build

Follow `techniques.md` for the mechanics and `elegant-ui` for structure. One shared scroll-progress value drives hero and copy. All copy is real DOM text. The canvas or video is `aria-hidden`. `prefers-reduced-motion` gets a composed still of the peak scene; no WebGL or decode support gets a poster image.

### 6. Verify

Follow `verify.md`. A build that has not been checked against the scene table is not done; say so explicitly if verification could not run.

Append the build to `references/fingerprints.md`.

## Banned

- Hero centred headline + gradient blob; three feature cards with icons; logo cloud as the second section by default.
- Purple-to-blue gradient backgrounds, gradient text, glassmorphism cards, glow on UI chrome.
- Everything fading in on load; the same fade-up on every section; bouncy or elastic easing.
- A 3D object that spins in place unrelated to scroll.
- "Scroll" arrows, animated mice, section counters (`01 / 06`).
- Text baked into images or video.
- Animating `width` / `height` / `top` / `left`; animate `transform`, `opacity`, `clip-path` only.
- Em dashes in visible copy.
- Audio tracks left on scrub media.

## Adding references

When the user shares a site they like, follow `capture.md` and write a new file in `references/` from `references/_template.md`. The library is how this skill learns the user's taste.
