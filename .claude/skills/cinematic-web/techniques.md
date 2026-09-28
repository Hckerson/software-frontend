# Techniques

How the cinematic register is built in this starter. Mechanics only; the concept comes from SKILL.md steps 1–4.

## Hero routes

Pick one per build and justify it against the other two.

| Route                    | What it is                                                                             | Wins when                                                                                                               | Needs                                                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **A. Procedural canvas** | Drawn every frame from math: raw WebGL2 for dense fields (strands, particles), 2D canvas or SVG only for a few hundred strokes | The metaphor is abstract structure (flows, networks, convergence). Pegasus is buildable here                            | Nothing new                                                                                                                   |
| **B. Scrubbed media**    | A pre-rendered clip or image sequence whose frame is chosen by scroll progress         | The metaphor is photographic or physical (glass, liquid, a product, a place). Most likely how both references were made | Source footage or stills, `ffmpeg` to encode; an image or video generation service if nothing exists. Ask before any of these |
| **C. Real-time WebGL**   | three.js via `@react-three/fiber` + `@react-three/drei`                                | Real refraction, true 3D the pointer can orbit, or geometry that must react live                                        | Those three packages. Ask before installing                                                                                   |

Route B looks the most expensive and is often the cheapest: a four-second render does what a week of shader work does. Route C is only right when the object must respond live in ways a clip cannot.

## Scene container

Every scrollytelling section is a tall track with a sticky stage:

- Outer track height = scenes × `100svh`, as a named class in `styles/globals.css` per scene count.
- Inner stage is `sticky top-0 h-svh overflow-hidden`; the hero canvas or media fills it.
- Scene ranges (`[0, 0.18]`, `[0.18, 0.42]` …) live in `lib/<feature>/constants.ts`, never inline.

## One progress value

```tsx
const trackRef = useRef<HTMLElement>(null);
const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
});
const progress = useSpring(scrollYProgress, SCENE_SPRING);
```

- `progress` feeds both the hero and the copy. Copy maps it with `useTransform(progress, range, [0, 1])`.
- The hero reads `progress.get()` inside its own `requestAnimationFrame` loop. Never put per-frame values in React state.
- Wrap this in `lib/hooks/use-scene-progress.ts`; components consume the hook.

## Pointer with inertia

Two motion values for normalised pointer position (−1…1) through `useSpring` with a soft spring from `lib/constants.ts`. The hero reads `.get()` per frame. Touch devices get a slow idle drift instead.

## Route A: procedural canvas

- `CanvasStage` in `components/wrappers/`: owns the canvas, `ResizeObserver`, DPR capped at 1.5, and an `IntersectionObserver` that stops the loop off-screen. It hands the canvas to the consumer; it does not pick a context.
- **Dense fields go to raw WebGL2, not 2D canvas.** No package needed. Measured on the first build (Intel HD 620): 900 strands in 2D canvas with `lighter` blending ran at 3–13 fps, ~15 ms of JS per frame. The same field as a WebGL2 vertex shader runs at 60 fps with ~0.1 ms of JS. 2D canvas is for a few hundred strokes at most.
- The shape maths lives in the vertex shader. Each strand is one instance of a `LINE_STRIP` (`drawArraysInstanced`): per-vertex `u` along the strand, per-instance strand params, and a handful of uniforms (size, focal point, state, time, pointer) are all JS sends per frame. Shader constants are interpolated from the TS constants so there is one source of truth. Reference: `cinematic-lab/lib/tributary/flow-shaders.ts` and `flow-renderer.ts`.
- **`antialias: false` for dense additive fields.** MSAA alone halved the frame rate (31 → 60 fps when removed) and a thousand faint overlapping lines show no aliasing.
- Glow: additive blending (`blendFunc(SRC_ALPHA, ONE)`) on an opaque canvas cleared to the ground token, so density builds the light. A focal bloom is a CSS radial-gradient layer with `mix-blend-mode: plus-lighter`, opacity driven by the same state; it costs nothing measurable.
- **Light as a pipeline, not a CSS glow.** Draw the field and sparks additively into a half-float offscreen target (`EXT_color_buffer_float`, RGBA8 fallback), bright-pass and blur at quarter resolution for bloom, a long horizontal-only blur of the same bright pass for a lens streak, then one composite: filmic tone map `1 - exp(-x * exposure)` (dense areas go white-hot on their own), ground colour, per-pixel grain. Measured at 60 fps on an Intel HD 620. Reference: `cinematic-lab/lib/tributary/flow-post.ts`.
- **Bright-pass on luminance, never per channel.** Subtracting a threshold per channel shifts saturated warm light toward green-yellow. Scale the colour by `max(lum - threshold, 0) / lum` to keep its hue.
- **Colour temperature is narrow.** A heat ramp (crimson ends, ember body, gold core) reads as heat only when the hot zone is tight around the focal point and the hot token is a saturated gold, not near-white; otherwise the whole field turns silver.
- Colours come from CSS tokens read once with `getComputedStyle`, never hardcoded.

## Route B: scrubbed media

- **Image sequence (preferred on mobile):** 60–150 WebP frames, preloaded progressively, drawn to canvas at `Math.round(progress * (n - 1))`. Reliable everywhere, no decoder seek lag.
- **Video:** encode for seeking, not playback: every frame a keyframe or a short GOP, audio stripped, `muted playsInline preload="auto"`, set `currentTime` from progress inside rAF. Test on a real phone.
- **Layering:** split the hero into background, subject and foreground plates and move them at different rates for parallax depth.
- **Generated assets:** one style preamble reused verbatim in every prompt so separate renders read as one world. Never bake copy into the media.
- Poster = the peak frame, also used for reduced motion.

## Route C: real-time WebGL

- `Canvas` from r3f, `dpr={[1, 2]}`, `frameloop="demand"` or paused off-screen, lazy-loaded with `next/dynamic` and `ssr: false`.
- Animate in `useFrame` through refs; never set state per frame.
- Glass: `MeshTransmissionMaterial` over bright emissive shapes to refract (the NebulaX slats), with `thickness`, `chromaticAberration`, `anisotropy`.
- Strands at scale: instanced lines or tubes displaced in a vertex shader by a `uProgress` uniform.
- Post: bloom and grain sparingly; each pass costs every frame.

## Copy choreography

- **A hero that is the page's LCP plays on load, by time, not by scroll.** The first scene's hero state (e.g. convergence) runs from a mount-time motion value (`animate(intro, 1)`), and its headline reveals immediately. Scroll takes over from the second scene. Never make the largest above-the-fold element wait for the visitor to scroll.

- **Line reveal:** split the headline into lines, each in an `overflow-hidden` mask, translating from `100%` to `0` with a stagger. Cue the start to a scene threshold, not to mount.
- **Type-on:** for a single short line that should feel like a system speaking.
- **Stat count-up:** numbers tween to value when their scene enters; tabular numerals.
- **Nothing moves linearly and nothing starts hard.** `useTransform` maps linearly unless given `{ ease }`: pass an ease per segment (ease-out in, linear hold, ease-in out). State ramps use smootherstep (zero velocity and acceleration at both ends), not smoothstep. Scene copy crossfades with an overlap instead of leaving an empty beat. The hero fades in from zero on load, and a field that starts inside the viewport fades in along its length instead of showing a cut edge. Scroll spring around stiffness 70 / damping 24; stiffer reads as the wheel stepping.
- Durations and easings are tokens (`MOTION_DURATION`, `--ease-*`); see `docs/MOTION.md`.

## Devices

The scene table assigns one device per scene. At least four families per page, never the same twice in a row, at most two scrubs.

| Device       | Reads as                                                     |
| ------------ | ------------------------------------------------------------ |
| **scrub**    | The visitor drives time: the hero transforms under the wheel |
| **pin**      | The frame holds while copy or elements assemble around it    |
| **reveal**   | A `clip-path` wipe from one state to another                 |
| **pan**      | Lateral travel through a row of options                      |
| **parallax** | Independent planes at different rates; depth                 |
| **morph**    | The hero changes form between two named states               |
| **cut**      | A hard scene change, used once for emphasis                  |

## Performance and fallback

- 60fps on a mid-range laptop; hero loop paused off-screen and on `visibilitychange`.
- `prefers-reduced-motion`: no scrub, no loop; render the peak scene as a still with copy visible.
- No WebGL or failed media load: the poster image.
- The hero is `aria-hidden`; every word on screen is real DOM text in reading order.
- Animate only `transform`, `opacity`, `clip-path`.

## Theming the stage

A cinematic page usually needs a dark ground the starter's light tokens do not have. Add a theme class in `styles/tokens.css` that redefines the `--colors-*` values (plus `--colors-flow*` or whatever the hero reads) and put it on `<html>` in the layout. The `@theme` mapping resolves on that same element, so every house utility (`bg-background`, `text-text`, `Button` tones) follows without a parallel set of classes. Scoped to a deeper element, the `--color-*` mappings would also have to be redeclared there. The canvas reads its colours from the same tokens with `getComputedStyle`.

Display and scene sizes are `clamp()` tokens consumed by named classes (`.stage-display`, `.stage-scene`), never `md:` prefixes: `starter/token-first-classnames` rejects breakpoint prefixes in any string literal, not only in `className`.

## Lint in this repo

`starter/application-register-density` rejects `text-h1`–`text-h3` and editorial spacing in view files. A cinematic route and its feature folder opt out with a `files` block in `eslint.config.ts`, as the rule's message says. Add that block as part of the build and name it in the report; do not disable the rule inline.
