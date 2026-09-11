# EPS-1 road clearance fix — v6.1

## Fixed in this update

Roadside lamps moved outside the vehicle circuit. Diagonal braces crossing the longitudinal roads removed. The cabinet near the western lane moved into the equipment bay. Transverse lanes and the surrounding deck/rail setback now allow the tanker envelope at turns. UI, feeds, IVMS, workers and the main plant arrangement are preserved.

The full 344 m vehicle circuit is checked against 824 fixed obstacles at 2,100 samples, including intermediate corner headings. The conservative vehicle envelope is 3.3 m wide, 9.4 m long and extends from 0.35 m to 4.3 m high. This check passes. It covers fixed geometry and CCTV poles, not worker/vehicle traffic interactions or a physical engineering safety certification.

For an existing deployment, replace `models/campus.glb` to apply the geometry fix. Upload the full extracted folder to also retain the updated model source, regression test and documentation. Restart/redeploy and refresh the page after the upload. No new dependencies or UI configuration are needed.

This work restores the original dense EPS-1 plant. Frontend, backend, model source and media are separate. Automated API/model tests pass; visual/browser QA is blocked by unavailable WebGL and a failed alternative browser download. Do not describe this as errorless or production-ready.

Run `node backend/server.mjs` with Node 22 or newer. Open the localhost URL printed by the server. Set HOST=0.0.0.0 for hosting; PORT is respected. Rebuild the separate GLB using `node scripts/build-eps1.mjs`. Run `npm test` for API and structural checks.

Recorded looping footage is assigned to CAM-012, CAM-021, CAM-034 and DRN-001 through DRN-003. There are no upload controls or video duration controls. Other cameras explicitly report unconfigured/offline footage. IVMS, permits and smartwatch telemetry are synthetic demo data, not live integrations.

Work still requires browser review: plant/camera framing, worker/equipment collisions, all navigation, alert focus, video playback, mobile layout and physical-device AR. Fal-generated assets are not included because generation remains blocked by the earlier balance limitation.

## Update your existing GitHub/Render demo

Extract this archive first. Upload the contents of `SA-EPS1-Refined` to the chosen project directory in your GitHub repository, preserving `frontend`, `backend`, `models`, and `scripts`. Do not upload the archive as the running application.

In your existing Render service, Root Directory must point to the directory containing `package.json`. Start Command is `node backend/server.mjs`. Build Command can remain `node --version`. Set the HOST environment variable to `0.0.0.0`; the server reads Render's PORT. Commit the files, then deploy that commit. Local launch uses Node 22+ and `node backend/server.mjs`; no npm dependencies are needed.

## Navigation and feeds

- Live: full plant, alert list and selected-item panel.
- Explore: six operating areas with Locate actions.
- Events/Alerts: event register; Locate event returns to and focuses the 3D scene.
- People: all 248 workers have individual smartwatch KPIs. Click a body in 3D or locate its ID from the register.
- IVMS: eight moving vehicles; select one to inspect driver, speed, limit, seatbelt, fuel and engine state.
- PTW: three demonstration permits, control checklist and assigned-worker links.
- Reports: downloadable shift CSV.
- Feeds: CAM-012 = CCTV 1; CAM-021 = CCTV 2; CAM-034 = CCTV 3. DRN-001/002/003 = drone 1/2/3 respectively.

Footage loops without playback time controls or upload fields. It remains labeled recorded demo, because it is not a live camera stream.

AR is an additive WebXR surface-placement implementation for compatible Android devices over HTTPS. It has not been tested on a physical device. It does not provide native iOS Quick Look or operational overlays in AR.
