# TR AWARE — Situational Awareness

## Plant realism update — v6.3

This release adds more detailed vessels, pipe fittings, access steelwork, equipment bases and utility-building details; distinct metal/concrete/asphalt finishes; procedural water with reflections of the actual plant; and refined day/dusk lighting. Workers have articulated PPE, and vehicles have more realistic cab details. The preferred six-area plant layout and all operational features are retained. See `docs/REALISM-UPDATE.md` and the included application screenshots.

No plant photographs or image backdrops are used. The complete project includes frontend, backend, editable model source, GLB and all six footage files. No runtime dependencies were added.

## AR operations

AR now has its own transparent overlay. The dashboard, navigation, metrics and desktop panels are hidden and made non-interactive for the entire AR session.

Before placement, only the placement instruction, a ring when an upward flat plane is detected, and Exit AR are visible. Detection alone does not place the model. Tap while the ring is visible to place it. Old hits, vertical surfaces and lost tracking cannot trigger placement.

After placement, the same plant and operational objects used by the normal viewer are rendered at table scale. Workers and vehicles keep moving on the shared simulation timeline. Drones, CCTV, PTW and alert markers are available. There is no static copy and no second simulation. The sea and desktop background are replaced by your camera view.

Tap an asset or marker to inspect it. For very small workers, use **Assets** and search any worker ID. **Alerts** lists the current events; selecting one highlights its target, opens its details and gives direction guidance if the target is outside the screen. AR cannot move your physical camera for you. Walk around the model to inspect it.

The compact panel supports smartwatch KPIs, vehicle IVMS, PTW controls/assigned workers, alert acknowledgment and recorded CCTV/drone footage. Panels open only after selection. Feeds loop, are muted, and have no seconds/timeline or upload controls. A Play button appears only if the browser blocks autoplay.

**Layers**, **Pause/Resume**, size **− / +**, and **Reposition** are available after placement. Reposition hides the plant and all panels until you tap another valid surface. Exit AR restores the original dashboard view, layer settings and pause state. Acknowledged events remain acknowledged in both views.

## Update the existing GitHub / Render project

1. Extract this ZIP. Upload the full contents of `SA-EPS1-Refined` into the existing project directory, including the new material, environment and personnel modules. Do not upload the ZIP as the running app.
2. Keep the Render Root Directory pointing at the directory containing `package.json`.
3. Build Command: `node --version`. Start Command: `node backend/server.mjs`. HOST: `0.0.0.0`. The backend respects Render's PORT.
4. Commit, deploy that commit, and reload the page on the phone/tablet. The normal dashboard and plant layout are retained.

No new runtime dependencies are required. Local launch with Node 22 or newer: `node backend/server.mjs`. Run `npm test` for the included automated checks.

## Device requirements and verification limits

AR needs HTTPS, camera permission, and a browser/device supporting immersive WebXR with plane hit tests and DOM overlays. It fails back to the usable dashboard if those features are unavailable. Native iOS Quick Look is not included. DOM overlay support is now required so the controls cannot silently disappear.

Automated API, scene-transform/placement, mocked WebXR lifecycle/input, personnel picking, model export and vehicle-clearance checks are included. Desktop WebGL rendering and interaction evidence is in `docs/browser-results.json`. A real phone/tablet is still needed to validate camera compositing, plane tracking and mobile AR performance; see `docs/AR-VALIDATION.md`. This is a demonstration project, not an operational safety system.

## Features and configured feeds

- Live / Explore / Events / Reports and the left-side registers remain available in the normal viewer.
- All 248 workers have individual smartwatch KPIs. Eight vehicles expose IVMS data. Three PTW zones link to their assigned workers.
- Camera footage: CAM-012 = CCTV 1; CAM-021 = CCTV 2; CAM-034 = CCTV 3.
- Drone footage: DRN-001 = drone 1; DRN-002 = drone 2; DRN-003 = drone 3.
- Other cameras explicitly report unconfigured or offline footage.

All telemetry, permits and IVMS values are simulated. Videos are prerecorded demo footage, labeled accordingly. No upload feature is exposed.

## Preserved geometry corrections

The dense six-area EPS-1 plant is retained, including wellhead towers, metallic surfaces, service lanes and the earlier road-obstruction fixes. Roadside lamps, diagonal braces and the lane cabinet remain outside the vehicle path. The 344 m vehicle circuit passes the existing check against 3,010 fixed obstacles at 2,100 samples including turn headings. This is not a worker/vehicle collision or engineering safety certification.

Model source: `scripts/build-eps1.mjs`. Rebuild: `node scripts/build-eps1.mjs`. Frontend, backend, model and footage remain separate. Fal-generated assets are not included.
