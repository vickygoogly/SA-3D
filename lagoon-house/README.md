# Lagoon House — measured 2D + 3D project

Revision 02 for a **30 × 40 ft site (9.144 × 12.192 m)**. The new entrance stair has two straight flights and one quarter-turn landing, flared first steps, a sculptural underside, glass rails and tread lighting. The spiral stair has been removed.

Open the house in **2D plan** mode to inspect all four levels and clear room sizes. Select a room, then **See this space in 3D**. The plan and model read the same room, partition, opening and furniture coordinates from `src/layout.js`.

## Fix your existing Render deployment

The earlier log looked for `lagoon-house/backend/server.mjs`. The actual server is `server.mjs`, launched by `npm start`. Also, `node --version` is not a build command for this project.

Replace the project files in GitHub with this version. For the folder structure shown in your log, use:

| Render Web Service setting | Value |
|---|---|
| Root directory | `lagoon-house` |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Runtime | Node |

If `package.json` is at the repository root instead of inside `lagoon-house`, leave **Root directory** blank. Commands are relative to that directory. Save the settings and deploy the latest commit.

The included server binds to `0.0.0.0` and uses Render's `PORT`. The tiny `backend/server.mjs` compatibility entry also forwards to the same server, but use the settings above. No database or API key is needed.

### New Render Static Site (alternative)

A Static Site can serve this frontend without a running Node server:

| Setting | Value |
|---|---|
| Root directory | `lagoon-house`, or blank if package.json is at repo root |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist/client` |

`render.yaml` describes a Static Site when the project files are at the repository root. If using a nested-folder Blueprint, add `rootDir: lagoon-house` to its service definition. Do not upload `node_modules`, the ZIP itself, or scratch previews to GitHub. Render gives the deployed site an HTTPS address that can be opened on other devices.

Official references: [Root directory and relative commands](https://render.com/docs/monorepo-support), [Node Web Services](https://render.com/docs/deploy-node-express-app), [Static Sites](https://render.com/docs/static-sites).

## Explore the measured house

- **2D plan / 3D model:** switch representations. The 2D plans work without WebGL.
- **Ground, First, Second, Third:** choose one of the four levels.
- **Metres / Feet and inches:** change displayed dimensions. Inches are rounded; metric coordinates are authoritative.
- **Plan selection:** click a room or its schedule entry, then open the same room in 3D.
- **Save plan:** export the current floor as SVG. Eight standalone drawings are included in `docs/plans` (four levels × two unit systems).
- **Whole house:** exterior orbit view. Drag to rotate, scroll to zoom, right-drag to pan.
- **Floor selection in 3D:** inspect a cutaway. Selecting a room restores full walls and the ceiling for an eye-level view.
- **Walk:** fixed eye height 1.65 m; WASD/arrows or touch buttons; drag to look. Use the floor selector for storey changes. Walking does not simulate stair climbing or a moving lift.
- **Dimensions / scale figure:** optional 3D room annotations and a 1.70 m person.
- **Day / Night, camera tour, image capture:** included in the 3D toolbar.
- **Balanced:** adjusts texture filtering, planting, pixel density and shadows. The full staircase and all 192 lagoon segments remain unchanged. Rendering pauses in 2D mode.

## Key dimensions

| Space | Clear size | Area |
|---|---|---|
| Living hall | L-shaped: 3.38 × 3.65 m main part + 1.57 × 1.88 m bay | 15.29 m² |
| Dining | 2.57 × 2.72 m | 6.99 m² |
| Main kitchen | 2.26 × 2.72 m | 6.15 m² |
| Wet kitchen | 2.85 × 1.61 m | 4.59 m² |
| Guest bedroom | 3.03 × 3.35 m | 10.15 m² |
| Master sleeping room | 2.85 × 4.35 m | 12.40 m² |
| Family bedroom | 3.81 × 3.55 m | 13.53 m² |
| Premium bedroom | 4.17 × 3.35 m | 13.97 m² |

See `docs/Dimension-Schedule.md` for every space, including bathrooms, wardrobes, passages, pantry, puja, lift and terrace. Stair: 20 × 165 mm rises per storey, two 1.20 m nominal-width flights with 290 mm treads, a 1.20 m landing and 3.81 × 3.81 m atrium footprint. Floor-to-floor height is 3.30 m; clear ceiling height is 3.02 m.

## Verification and limits

The production build and geometric checks pass. Desktop 2D plans, room selection, units, floor switching and the WebGL fallback were exercised in the preview browser. A 390 px-wide frame was used to inspect the mobile layout. The model was also projected with an independent software renderer to inspect the stair and room arrangement.

**Live 3D visual QA remains blocked:** the cloud browser reports `GL_VENDOR = Disabled` and cannot create a WebGL context. Water shaders, real-time lighting, camera motion and frame rate have not been verified in a GPU-enabled browser. Software geometry previews do not replace that check. The ZIP contains the actual editable 3D code, not a rendered background.

This is a **dimensioned architectural concept**, not a sanctioned or construction-ready plan. The building envelope is 8.50 × 10.96 m, leaving only 0.322 m side margins and 0.616 m front/rear margins. These are illustrative, not approved setbacks. A local architect must validate the feasible envelope, permitted floors, structure, fire escape, stair/guard details, drainage, pool protection and services. Required setbacks may change the layout substantially.

The dimensions make the compromises visible: a compact master sleeping room; no kitchen island; a 1.01 m wet-kitchen aisle; a common guest bathroom; four comfortable or six close dining places. This version is not a promise of the spaciousness in the inspirational images and is not fully Vastu-compliant.

## Development

Requires Node.js 22 or newer:

```bash
npm ci
npm run dev
```

Production and verification:

```bash
npm run build
npm run check:geometry
npm start
```

The server uses port 3000 locally unless `PORT` is set. Open through HTTP, not by double-clicking `index.html`.

| File | Purpose |
|---|---|
| `src/layout.js` | Shared measured layout, wall openings, room polygons and furniture coordinates |
| `src/plan-svg.js`, `src/FloorPlan.jsx` | Dimensioned interactive SVG drawing and room schedule |
| `src/stair.js` | Two-flight sculptural stair; no spiral geometry |
| `src/villa.js`, `src/geometry.js` | 3D architecture, landscape and furnishings |
| `src/plan.js`, `src/engine.js` | Cameras, rendering, movement and visibility |
| `src/materials.js` | Generated local travertine and deterministic timber materials |
| `server.mjs`, `render.yaml` | Hosting configuration |
| `docs/Design-Notes.md`, `docs/Dimension-Schedule.md` | Planning assumptions and dimensions |
| `design-qa.md` | Verification evidence and outstanding 3D visual gate |

The texture uses lossless WebP encoding. Furnishings and planting are parametric meshes. React, Three.js and Phosphor icons retain their own open-source licenses.
