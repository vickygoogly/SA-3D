# Design QA — Revision 02

## What was checked

- The 2D plan, room schedule, room selection, metres/feet-inches switch and standalone SVG export were exercised in the preview browser.
- The first, second and third floor schedules expose the same measured room data used by the model. The ground drawing shows the two straight entrance flights, 1.20 m landing, 20 rises and 165 mm riser note.
- A 390 px-wide frame was checked for the plan navigation and schedule layout.
- `npm run build` completed successfully.
- `npm run check:geometry` completed successfully: four floors, three stair storeys, two flights per storey, 20 rises per storey, 192 lagoon boundary segments, 43 measured spaces, finite vertices.
- The Node server was started through `backend/server.mjs`; `/` and the built JavaScript asset returned HTTP 200.
- CPU depth-buffer projections inspected the ground arrival, stair, first-floor shell and exterior. These are software geometry projections, not browser renders.

## Browser limitation

The cloud preview browser reports `GL_VENDOR = Disabled` and cannot create a WebGL context. Its 3D canvas therefore cannot be visually accepted here. This leaves real-time water shaders, lighting, orbit, walking, tour, image capture, device frame rate and material appearance unverified. The app reports this limitation and keeps the 2D plans available.

A WebGL2-capable desktop or phone browser must still exercise the 3D view, all room presets, the stair landing interfaces, floor isolation, roof/cutaway controls, day/night mode, walk, tour, capture and quality mode.

## Planning and performance notes

`src/layout.js` is the single metric source for the drawing, furniture, camera targets and model room bounds. The site is exactly 9.144 × 12.192 m (30 × 40 ft). The model keeps true-size furniture and a 1.65 m eye-level camera. The revised stair and all 192 lagoon shoreline samples are preserved in every quality mode; performance controls adjust textures, selected planting, pixel density, shadows, batching and hidden-level visibility first.

This is a measured architectural concept, not a sanctioned or construction-ready plan. The small illustrative plot margins, structure, fire egress, pool safety, lift and services require local architectural and engineering review.
