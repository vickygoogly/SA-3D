# Lagoon House — Interactive 3D Project

A self-contained React + Three.js architectural concept for a north-facing 30 × 40 ft plot. The ground level contains two-car parking, a freeform lagoon, tropical planting, a curved staircase and a lift. Four bedrooms are distributed across three residential levels.

## Upload to GitHub and view on Render

You do **not** need Node.js on your computer if you upload through GitHub and let Render build the project.

1. Extract this ZIP.
2. Create a GitHub repository, for example `Lagoon-House-3D`.
3. Upload the **contents** of the `lagoon-house` folder. `package.json`, `package-lock.json`, `index.html`, `render.yaml`, `src`, `public` and `scripts` must be at the repository root. Do not upload the ZIP itself. Do not upload `node_modules`.
4. In Render, create a **Static Site** and connect that GitHub repository.
5. Use these settings:

| Setting | Value |
|---|---|
| Root directory | Leave blank |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist/client` |
| Environment variables | None required |

6. Deploy. Open the HTTPS address Render assigns to your site. This is the address you can open from another computer or phone and share with others.

`render.yaml` contains the same Static Site configuration for users who prefer Render's Blueprint flow. The interface wording in Render can change; the build command and output folder above come directly from this project.

### If you prefer a Node Web Service like your earlier project

Create a **Web Service**, choose Node, and use:

| Setting | Value |
|---|---|
| Root directory | Leave blank |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Node version | 22 or newer |

The included server uses Render's `PORT` environment variable and binds to `0.0.0.0`. No database, API keys or external model service is needed. The `render.yaml` is for the Static Site option; it does not describe this alternate Web Service option.

### Updating the house

Replace changed source files in the same GitHub repository and commit them. Redeploy the same Render site, or enable its automatic deploy option. Keep `package-lock.json` with `package.json`.

## Controls

- **Orbit:** drag to rotate; mouse wheel/pinch to zoom; right-drag to pan.
- **Floors:** Whole house, Ground, First, Second, Third / Terrace.
- **Hide upper floors:** show only the chosen level and those beneath it. The visible top level is open for inspection.
- **Show roof:** toggle the top roof and atrium skylight. Floors above a selected isolated level are already hidden.
- **Room list:** move to a furnished interior or landscape viewpoint.
- **Walk:** drag to look; W/A/S/D or arrow keys to move. Touch arrow buttons are provided. Use floor or room navigation to change storeys. Walking does not simulate stair climbing or an animated lift cabin.
- **Day / Night:** switch sunlight, environment and warm architectural lighting.
- **Camera tour:** cycle through the exterior, lagoon, staircase and selected interiors.
- **Camera dropdown:** 21 architectural viewpoints.
- **Camera icon:** save an image of the current 3D view.
- **Balanced:** reduce pixel density, shadow resolution and selected vegetation. Lagoon and staircase meshes remain unchanged.

## Local development (optional)

Install Node.js 22+, then run:

```bash
npm ci
npm run dev
```

For a local production run:

```bash
npm run build
npm start
```

The server defaults to port 3000 unless `PORT` is set. Do not open `index.html` by double-clicking it: this project requires an HTTP server.

## What is included

- Editable React interface and Three.js geometry, in metres.
- Four levels with furnished living, dining, show kitchen, separate wet kitchen, pantry, puja, guest bedroom, master suite and dressing/bathrooms, family bedroom, premium suite, study and terrace.
- Three detailed curved stair flights, glass guards, structural spine, warm tread lights and a glazed multi-storey atrium.
- A dimensioned lift shaft, two cars and scooters, pool services, solar panels, security-camera and control-panel details.
- A local generated travertine texture and deterministic timber grain.
- Reflective animated lagoon water, organic pool perimeter, boulders, planting and a small waterfall feature.
- Build configuration, Render settings, a Node static server and a geometry-check script.

## Honest status and limitations

**Production build: passed. Geometry construction check: passed. Live visual QA: blocked.**

The available cloud browser reports WebGL disabled and cannot create a WebGL context. Therefore actual browser rendering, water shaders, interactive camera motion, frame rate and visual fidelity have not been verified end-to-end. Do not interpret the build or vertex check as visual approval. Open the deployed project on a WebGL2-capable browser and check all levels before treating it as accepted.

This is an editable **architectural concept**, not a construction-ready or sanctioned plan, and not a claim of complete Vastu compliance. The nearly full-plot shell has no authority-approved setbacks. A local architect must validate setbacks, permitted height/FAR, structure, cantilevers, fire egress, accessibility, drainage, pool safety and services. Rooms are compact: the generated concept images were inspirational and not dimensional promises. See `docs/Design-Notes.md` for specific compromises.

This real-time model uses generated geometry and a material texture rather than a commercial BIM/furniture library. It will not reproduce the photographic detail of the AI concept images exactly. The reference images are not used as a fake 3D background.

## Troubleshooting

- **Viewer unavailable / WebGL:** enable browser hardware acceleration, restart the browser, and use a current WebGL2-capable browser. Corporate device policy can disable GPU support. Render hosts the files; rendering happens on the viewing device.
- **Missing files during build:** confirm that `package.json` is at the repository root and that `src`, `public`, `index.html`, `vite.config.mjs`, and `package-lock.json` were uploaded.
- **Slower devices:** choose Balanced and isolate a floor first. The lagoon and stair topology is never reduced.
- **Blank page after deploy:** check that the publish directory is `dist/client`, not `dist` or `src`.
- **Fonts unavailable:** the app falls back to local system fonts. The 3D model and material assets remain local.

## Key files

| File | Purpose |
|---|---|
| `src/plan.js` | Site measurements, room and camera definitions |
| `src/villa.js` | Architecture, interiors, stairs and lagoon |
| `src/geometry.js` | Geometry and furnishing builders |
| `src/materials.js` | Local textures and physical materials |
| `src/engine.js` | Rendering, camera, lighting and walking |
| `src/App.jsx` / `src/styles.css` | Interface |
| `render.yaml` | Render Static Site settings |
| `server.mjs` | Optional Node Web Service |
| `docs/Design-Notes.md` | Planning assumptions and limitations |
| `design-qa.md` | Verification record and outstanding visual gate |

The generated stone texture was created with built-in image generation. fal was attempted but its connector returned a transport error; no fal-generated assets are claimed. React, Three.js and Phosphor icons retain their own open-source licenses.
