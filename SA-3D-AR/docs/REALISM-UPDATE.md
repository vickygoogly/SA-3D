# TR AWARE — plant realism update (6.3)

This update refines the existing six-area EPS-1 plant. It is an illustrative plant, not a surveyed reconstruction or a replacement for an engineering model. No generated photo or background billboard is used as plant geometry.

## Visible changes

- Neutral galvanized and insulated steel finishes, painted pipework, concrete equipment foundations and dark service-road asphalt replace the uniform blue treatment.
- Tanks and process columns have smoother shells, fine circumferential seams, inspection covers, roof vents, base bolts, guarded roof edges and caged access ladders.
- Process frames have open service walkways, visible beams, grating strips and access cages. Manifolds include bolted flanges and valve actuators. Pump motors have cooling fins and concrete bases.
- Utility buildings have cladding seams, doors, ventilation louvers and roof fans. Deck drainage grilles and subtle panel joints give scale to broad surfaces.
- The outboard flare boom now has a connected access truss, guardrails and terminal platform.
- The sea uses multi-directional waves and irregular small ripples. Its reflection is rendered from the actual plant; there are no background photographs, grids or image billboards.
- Procedural sky illumination, metallic reflections, directional shadows and warm practical lighting support day and dusk modes.
- Workers wear articulated PPE with helmets, high-visibility vests, reflective bands and boots. Vehicles have more subdued finishes, headlights, grille, mirrors and roof beacons.

## Existing operations retained

The moving workers and vehicles, IVMS, smartwatch KPIs, permits, alerts, camera/drone footage and normal navigation use the existing data and selection paths. All 248 workers are individually selectable. Camera and drone feeds remain prerecorded, looping demo footage with no upload controls or native timeline.

AR receives the same detailed plant and moving population. Its dedicated placement interface is unchanged: the plant and operational panels remain hidden until a valid flat-surface placement tap. Water and desktop sky are intentionally excluded from AR so the real camera view remains visible. Actual camera placement and device performance require a compatible phone/tablet check; see AR-VALIDATION.md.

## Geometry and performance

The model contains 5,718 source meshes and 252,584 triangles. The delivered GLB combines them into 374 spatial/material batches without removing triangles. The editable JSON and deterministic build script are included. The model is approximately 11.82 MB; each packaged file is kept below 24 MiB for GitHub browser uploads.

Personnel use shared instanced parts instead of separate rendered meshes for every limb. They retain independent selection proxies and asset records. Procedural finishes use plant-local coordinates so their scale remains stable when the model is placed in AR. Water reflections refresh at most eight times per second and skip unchanged paused views. No hardware frame-rate claim is made.

## Verification

The model validator compares triangle counts, precise bounds, finish metadata, index ranges and normals against the editable source. The existing service-road sweep checks the vehicle envelope against 3,010 fixed obstacles at 2,100 samples around the 344 m circuit, including turn headings. The added ladder cage was moved back inside its equipment bay after this check detected a lane intrusion.

The personnel regression check uses real Three.js ray intersections for all 248 workers and verifies that rendered instance positions remain aligned with their selectable assets under a translated, rotated and scaled AR root. Existing backend and AR session/placement checks remain included.

The screenshots in this folder are captures of the running WebGL application, not concept renders. Browser interaction evidence is recorded in browser-results.json. These desktop checks do not validate physical AR tracking, camera compositing or phone/tablet frame rate. Telemetry remains synthetic and video remains recorded demonstration footage.

## Rebuild / run

- Rebuild geometry: `node scripts/build-eps1.mjs`
- Run backend: `node backend/server.mjs`
- Verify: `npm test`

No runtime dependency installation or external model/texture service is required.
