# Verifying a build

Code that looks right in the editor proves nothing about a scroll-driven page. The build is checked by scrolling it.

## When it runs

Verification needs a dev server and a browser. Start them only when the user's current message asks for it ("verify", "run it", "check it in the browser"). Otherwise end the build report with **Not verified** and the command they can give you to run it. Never present an unverified build as finished.

## Steps

1. `pnpm dev`, then open the route with the `anthropic-skills:chrome-browser` skill.
2. For every scene in the scene table, screenshot at its start, midpoint and end, at 1440×900 and at 390×844.
3. Emulate `prefers-reduced-motion: reduce` and screenshot the top of the page.
4. Put each capture beside its scene-table row and check:
    - **Hero state** matches the row (scattered vs converged, angle, plate positions).
    - **Copy** on screen is the row's copy, fully revealed at the midpoint, legible against the hero (contrast at least 4.5:1 for body, 3:1 for display).
    - **Dead scroll:** no range of more than ~15% where nothing on screen changes.
    - **Anchor variety** holds and no device repeats back to back.
    - **Reference match:** set the peak capture beside the reference frames. Name what is weaker: density, light, type scale, pacing.
5. Performance: measure, never eyeball. Per scene, record fps, p95 frame time, % of frames over 17.5 ms, and JS time per rAF callback, at DPR 1 and 2. Pass bar: 55+ fps and under 5% slow frames on the user's machine. If the Chrome extension is not connected, drive headless Chrome over CDP with Node's built-in `WebSocket` (no install): `--headless=new --remote-debugging-port`, wrap `requestAnimationFrame` via `Page.addScriptToEvaluateOnNewDocument` to time callbacks, `Emulation.setDeviceMetricsOverride` for DPR, `Page.captureScreenshot` per scene. When it fails the bar, isolate: rerun with one layer hidden at a time (canvas, overlays, text, antialiasing) before changing anything.
6. Fix, then repeat from step 2 for the scenes that changed.
7. Stop the dev server.

## Report

A table: `scene | intended | observed | fixed?`, then the list of deviations kept on purpose and why. Attach the capture paths.
