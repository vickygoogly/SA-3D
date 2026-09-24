# TR AWARE — verification checkpoint, v6.3

## Current result

Desktop WebGL rendering is verified. The local Chromium browser renders the plant in day and dusk modes with its procedural materials, geometry, water and actual-scene reflections. The included screenshots are application captures. `docs/browser-results.json` records the interaction checks and any expected platform notices.

The previous local-browser installation blocker was resolved for this update. Earlier notes saying no WebGL browser was available are superseded by this evidence. No Fal-generated assets or external background images are included.

## Visual decisions

Retain the preferred dense, six-area EPS-1 model, TR AWARE branding, navigation and operational data flows. Improve the model through geometry and shading rather than a backdrop: neutral metallic vessels, concrete and asphalt, access cages, roof railings, flanges, pumps, utility details, articulated PPE and cab details. Retain the corrected service-road clearances. The home view now includes the outboard flare assembly and adjusts its distance for a narrow screen.

## Automated checks

- Backend integration: frontend/module delivery, model parsing and bounds, media/model byte ranges, simulated wearable/IVMS/PTW APIs, acknowledgment persistence and origin handling.
- Four real Three.js placement/transform tests and six simulated WebXR session/input tests.
- All 248 workers: individual ray selection and alignment of rendered instances with their asset nodes under translated, rotated and scaled AR transforms.
- GLB batches preserve every source triangle and precise bounds, valid indices, normalized normals and finish metadata.
- Vehicle envelope clears all 3,010 fixed obstacles over 2,100 route/turn samples.

## Browser checks

Live/Explore/Events/Reports and all left registers, a moving vehicle marker, day/dusk rendering, area focus, P-248 vitals, VEH-006 IVMS warning, PTW controls and assigned workers, SOS alert navigation, report download, configured CCTV/drone playback, unsupported desktop AR recovery and narrow-screen layout are covered by the recorded browser run.

No footage-upload control or native video timeline was added. Prerecorded footage remains labeled as a demo and loops continuously.

## Remaining limits

Physical phone/tablet AR camera compositing, plane tracking and frame rate still require hardware verification. Simulated WebXR tests do not certify real-device behavior. Worker routes are illustrative circuits, not an equipment-aware navigation mesh. The fixed-obstacle vehicle sweep is a geometric regression check, not an engineering safety assessment. Telemetry and permits remain synthetic; no live safety integrations are claimed.

See `docs/AR-VALIDATION.md` for physical-device acceptance and `docs/REALISM-UPDATE.md` for implementation and rebuild notes.
