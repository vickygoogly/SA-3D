# Signal Atlas — Full Plant Operations Demo

This is a runnable front-end, Node backend and separate GLB plant model. No dependency installation or paid service is required to run it. Use Node.js 22 or newer.

## Run

Extract the project, then double-click START-WINDOWS.bat on Windows, or run `node backend/server.mjs` from this folder. Open http://localhost:8080. Keep the terminal open. On macOS/Linux, `bash START-MAC-LINUX.sh` also works.

Company laptop without Node: use your existing approved Render workflow. Upload the **extracted project contents**, not the ZIP. Root Directory is the folder containing package.json. Build Command: `node --version`. Start Command: `node backend/server.mjs`. Set HOST to `0.0.0.0`. Render provides PORT. Never enter the previous misspelling `bvackedn`. Public hosting exposes demo footage; use only media you are permitted to share. Do not put company data or credentials in this demo.

## What is included

- Eight modeled areas: oil storage/export, inlet/separation, gas processing, utilities/water, loading/logistics, control/maintenance, wellhead islands, flare/relief.
- Four copies of your supplied detailed tank, including stairs, railings, valve and pipe detail. Fine grating is simplified for browser performance.
- Geometry-only islands, bridges, seawalls, roads, process equipment, buildings, pipe racks and water. No photographic scenery is placed behind the model.
- 248 clickable walking personnel, each with backend-generated pulse, skin temperature, SpO2, stress index, battery and steps.
- Eight moving illustrative vehicles with IVMS data: speed, limit, driver, seatbelt, fuel, engine state and harsh-braking count.
- Three PTW zones with permit type, status, owner, assigned personnel and control checklist. Permits are visualization-only; they cannot authorize work.
- 48 camera locations, three selectable drones, four events with shared asset targets. Event selection focuses the corresponding 3D object. Acknowledgments persist in backend/data/state.json.
- Live, Explore, Events, Reports, Personnel, Feeds, IVMS and PTW views. Reports exports a CSV shift snapshot.
- Day/dusk, pause movement, top view, reset, fullscreen, separate layer toggles and mobile-responsive layout.

## Video mapping

| Feed | Included file | Illustrative mapped area |
| --- | --- | --- |
| CAM-012 | CCTV 1.mp4 | Control & maintenance |
| CAM-021 | CCTV 2.mp4 | Gas processing |
| CAM-034 | CCTV 3.mp4 | Utilities & water |
| DRN-001 | drone 1.mp4 | Oil storage & export |
| DRN-002 | drone 2.mp4 | Gas processing |
| DRN-003 | drone 3.mp4 | Loading & logistics |

Select Feeds to open any configured clip, or click its marker in 3D. Videos loop, are muted, and have no timeline or seconds display. A Play button appears only if browser autoplay is blocked. There is no upload UI or upload endpoint. Cameras without clips explicitly say footage is not configured; CAM-047 and CAM-048 are offline in the demo. Footage is prerecorded and not geographically matched to the illustrative model.

## AR

On an HTTPS URL in a WebXR-compatible Android phone/tablet browser, select AR View, grant permission, scan a clear surface, then tap the placement ring. The static plant is placed at tabletop scale. Unsupported browsers show a clear message. Desktop operational overlays are not shown inside AR. iOS Quick Look / USDZ is not included. Actual camera permission, surface placement and mobile GPU performance have not been device-tested.

## Files and customization

- `frontend/operations.html`, `operations.css`, `operations.js`: active UI and viewer.
- `frontend/domain.js`: shared asset IDs, zones, pedestrian paths, vehicle routes, PTW and alerts. Change mappings here, not independently in each tab.
- `frontend/campus-loader.js`: loads the project's uncompressed GLB format.
- `backend/server.mjs`: same-origin static/media serving, REST APIs and acknowledgment persistence.
- `backend/config.json`: media mapping and port/host settings.
- `models/campus.glb`: full static plant, about 19 MB. Used in the UI and AR; importable in compatible 3D tools.
- `models/refinery.bin.gz` + `refinery.json`: compressed intermediate supplied-tank geometry, read automatically when rebuilding.
- `scripts/build-campus.mjs`: editable surrounding plant builder. Run `npm run build:model` to regenerate the plant; the application loads campus.glb.
- `scripts/import-refinery.py`: optional original OBJ importer; requires Python + NumPy only if reimporting a different OBJ. Not needed to run the demo.

## APIs

GET `/api/health`, `/api/config`, `/api/state`, `/api/personnel/P-001/vitals`, `/api/ivms?elapsed=20`, `/api/permits`.

POST `/api/alerts/SA-2041/acknowledge` persists acknowledgment. POST `/api/demo/reset` clears demo acknowledgments. These are demo APIs, not authenticated production endpoints. Configure persistent storage separately if a hosted deployment must retain changes across replacement/restart of an ephemeral filesystem.

IVMS motion and values share the same deterministic domain model; the UI renders local simulation time and the API accepts elapsed seconds. Wearable KPIs are sampled from the backend. PTW values are static seeded demonstration records, not a permit workflow engine.

## Verification and limitations

Run `npm test`. Checks cover backend responses, route confinement, media configuration, byte ranges, acknowledgment persistence, GLB structure, alert target references and worker separation sampled across the first three minutes (minimum about 2 model units).

JavaScript syntax and backend/model checks passed during packaging. Browser interaction, visual/GPU rendering, Windows launch and physical AR placement have not been verified on your device. The full scene has about 2.18 million triangles; performance depends on GPU/browser. Use hardware acceleration. This is detailed real-time geometry, **not a claim of photorealism or an exact reconstruction** of the JPG refinery.

All non-tank equipment and site geography are illustrative. No AVEVA, Data Lake, VMS, wearable, IVMS or operational PTW integration is connected. No authentication, permissions, audit-grade workflow, safety certification or production hardening is provided. Use only for demonstration.

The supplied asset's creator is identified in its reference renders as Vadim Ryabchenko / design-rva.com. No redistribution license was included in the ZIP; confirm your usage rights before public/commercial distribution. Your original ZIP is not modified. Fal was not used for this build because the previous generation attempt was blocked by exhausted account balance.
