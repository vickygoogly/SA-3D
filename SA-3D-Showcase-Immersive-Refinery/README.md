# Situational Awareness · 3D Showcase

A runnable local project with a separate frontend, backend and plant model. It reproduces the interactive 3D Situational Awareness prototype. No cloud account, API key, npm package download or internet connection is needed after Node.js is installed.

## Start on Windows

1. Install Node.js 22 or newer if it is not already installed. Check with `node --version` in a new terminal.
2. Extract the entire ZIP into a folder, for example `C:\Projects\SA-3D-Showcase`. Do not run it inside the ZIP preview.
3. Double-click `START-WINDOWS.bat`. Keep its terminal window open.
4. Open **http://localhost:8080** in Chrome or Edge with hardware acceleration enabled.
5. Press Ctrl+C in the terminal to stop the server.

Alternatively, open a terminal in the project folder and run:

```bash
npm start
```

No `npm install` is needed. If PowerShell blocks `npm.ps1`, run `node backend/server.mjs` or `npm.cmd start` instead.

## Start on macOS / Linux

Install Node.js 22 or newer, extract the ZIP, open a terminal in the extracted project folder, and run:

```bash
node backend/server.mjs
```

Open **http://localhost:8080**. You can also run `bash START-MAC-LINUX.sh`. Stop with Ctrl+C.

## Project folders

| Folder | Contents |
|---|---|
| `frontend/` | HTML, CSS and JavaScript UI, Three.js viewer, camera simulation, locally bundled Three.js 0.180.0 and OrbitControls |
| `backend/` | Node.js HTTP server, REST API, configuration, seed data and local acknowledgment persistence |
| `models/` | Separate `plant-model.json` loaded by the viewer, and equivalent `plant-model.glb` for use in 3D tools |
| `scripts/` | Editable procedural model source and GLB exporter; regenerate models with `npm run build:model` |
| `docs/` | Configuration, API and guided demonstration instructions |

The backend serves the frontend and model from one address to avoid CORS setup. They remain separate folders and responsibilities. The frontend loads `/api/state`, `/api/config` and `/models/plant-model.json`; it does not embed the model geometry.

## What works

- Orbit, zoom, pan, top view, reset and fullscreen controls.
- Separate static 3D plant with tanks, process units, pipelines, utilities and wellhead modules.
- 248 illustrative personnel, 48 camera locations and four seeded events.
- Personnel, camera, alert and zone-name visibility controls.
- Select personnel or alerts to focus their model coordinates.
- Worker markers are scattered throughout the operating areas with collision spacing, subtle movement and clickable smartwatch telemetry (pulse, skin temperature, SpO₂, stress, battery and steps).
- Select a nearby camera to play a **simulated video stream rendered from its 3D camera position**.
- Preloaded CCTV and drone footage opens as a clean, looping live-feed presentation without upload controls or playback-duration UI.
- Three clickable aerial drones are attached to the 3D site and use the same CCTV layer toggle. Their supplied footage is pre-mapped: **DRN-001**, **DRN-002** and **DRN-003**.

## Preloaded demonstration feeds

| Feed | Location in demo | Video |
|---|---|---|
| CAM-012 | Wellhead Towers | CCTV 1.mp4 |
| CAM-021 | Production Separators | CCTV 2.mp4 |
| CAM-034 | Gas Compression | CCTV 3.mp4 |
| DRN-001 | Wellhead Towers aerial route | drone 1.mp4 |
| DRN-002 | Gas Compression aerial route | drone 2.mp4 |
| DRN-003 | Utilities & Power aerial route | drone 3.mp4 |

Click the blue camera marker or the ✦ drone marker on the 3D model to open its feed.
- Alert acknowledgments saved to `backend/data/state.json` and retained across server restarts.
- Demo reset endpoint for repeat presentations.

The simulation is illustrative. Camera proximity does not guarantee visibility, and marker positions do not describe a real site. The wearable values are deterministic demo telemetry supplied by the local backend, not measurements from production smartwatches. Uploaded CCTV footage is served only for this demo and is not a VMS integration.

## Model files

`models/plant-model.json` is a Three.js Object JSON asset in metres with Y up. It is the file used by the viewer. `models/plant-model.glb` is a glTF 2.0 binary interchange copy of the same static geometry, suitable for inspection/import in compatible 3D tools. Personnel, CCTV markers and alerts are dynamic overlays; they are intentionally not baked into either model.

Edit `scripts/build-model.mjs`, then run `npm run build:model` to regenerate **both** model files. Refresh the browser to load the updated geometry. Changing only the GLB does not change the running viewer: see `docs/CONFIGURATION.md` for replacing the model and mapping positions.

## Check the project

```bash
npm test
```

The tests check model geometry, backend startup, frontend/model serving, byte ranges, route confinement, alert persistence across restarts and reset. They do not perform browser or GPU testing. The project was tested with Node.js 24.19.0 in the build environment; Windows launch instructions are provided but were not executed on a Windows PC.

## Important scope

This is a local showcase, not the production SA platform. Its small Node.js backend makes the demonstration easy to run and does not replace your intended Java Spring Boot production architecture. It has no user authentication, industrial data connections, database cluster, operational incident dispatch or VMS adapter. By default it binds only to your own PC. Do not expose it directly to a public network.

Read `docs/SHOWCASE.md` for the presentation flow and `docs/CONFIGURATION.md` for video, port, model and coordinate configuration.
