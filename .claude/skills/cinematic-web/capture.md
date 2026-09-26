# Capturing a reference

Turn a site the user likes into a file in `references/` so its taste is available to every later build.

## From a URL

1. Open it with the `anthropic-skills:chrome-browser` skill at 1440×900.
2. Screenshot at scroll progress 0, 10, 20 … 100%, pausing ~600ms at each so animation settles. Repeat the hero and peak at 390×844.
3. Inspect the page to identify the route, not guess it:
    - `<canvas>` with a WebGL context, or `three` / `@react-three` / `ogl` in the scripts → route C.
    - `<video>` whose `currentTime` changes on scroll, or a folder of numbered frames → route B.
    - `<canvas>` 2D or animated SVG paths → route A.
    - Lottie, Spline or Rive embeds: name them; they are the tool, not the concept.
4. Note the builder (Framer, Webflow, Aura, custom). Many sites that go viral are templates; that tells you the technique is reproducible.

## From frames the user sends

Ask for 6–10 screenshots spread evenly from the top of the page to the bottom, plus one at the moment they found most impressive. Two frames of the same scene at different moments (as with the Pegasus reference) are the most useful thing they can send: they show what moves.

## From a screen recording

If `ffmpeg` is already installed (`ffmpeg -version`), extract one frame per second into the scratchpad and read them. If it is not, ask the user to install it or to send screenshots instead; do not install it yourself.

## Write the reference

Copy `references/_template.md` to `references/<slug>.md` and fill every field. Describe what moves and why it works, not only what it looks like. Record whether the site is live and where it came from.

Borrow structure, technique and devices. Never carry a reference's brand name, copy, logos or numbers into a build.
