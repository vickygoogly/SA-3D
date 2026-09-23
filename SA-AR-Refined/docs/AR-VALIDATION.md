# AR validation — 23 September 2026

## Changes covered

- `frontend/ar-experience.js`: dedicated DOM overlay, session/input lifecycle, compact AR panel, projected markers, asset register, alerts, layers and size/reposition controls.
- `frontend/ar-placement.js`: horizontal surface placement, recent-hit gate, shared root transfer and transform restoration.
- `frontend/ar.css`: transparent full-screen AR shell with placement-stage panel gating; responsive detail sheet.
- `frontend/operations.js`: one renderer animation loop and one simulation for desktop and AR; shared selection, vitals, IVMS, PTW, alert acknowledgment and looping-feed logic.

## Automated evidence

`npm test` runs the backend integration check, four real Three.js transform/placement tests, six AR session tests with simulated DOM/WebXR APIs, model validation and the existing fixed-obstacle vehicle sweep.

The tests cover explicit tap placement, plane slope rejection, stale/lost hit rejection, surface contact at different scales, object identity and motion, panel gating, input rays in the transformed scene, DOM UI input suppression, repositioning, repeated sessions, permission denial, hit-test initialization failure, exit during asynchronous setup, and dashboard/layer/renderer restoration. The select-event fixture deliberately rejects `getViewerPose`, because that API is valid on animation frames rather than select-event frames.

Backend checks verify that the new AR modules and stylesheet are served and that first, last and SOS workers have vitals, IVMS returns eight vehicles, permits resolve and alert acknowledgment persists. Model and road-clearance checks retain the prior scope.

## Not verified here

The local Playwright Chromium installation attempt failed because the returned browser archives were invalid/truncated. No browser screenshot, CSS layout pass, real camera session, physical plane placement, phone performance result, browser media playback pass or AR tracking accuracy is claimed. The DOM test double does not compute CSS or render WebGL. Earlier design QA findings are retained in `design-qa.md`.

## Physical-device acceptance

Use the deployed HTTPS URL on the same WebXR-compatible phone/tablet as the reported issue.

1. Enter AR from Live and from a non-Live register. Confirm that header, navigation, metrics and the desktop viewer disappear. Before placement, see only the camera, instructions, the surface ring when detected, and Exit AR.
2. Scan a table or clear floor. A wall must not enable placement. Detecting a surface without tapping must not show the plant. Losing the detected plane must remove the ring. Tap to place: the model appears once, with its deck resting on the surface and no details panel open.
3. Observe a vehicle and workers for at least ten seconds. They should continue moving. Camera/drone/PTW/alert markers must remain tied to the plant as you walk around it; they must not bob up and down.
4. Tap a vehicle: inspect speed, limit, driver, seatbelt, fuel and engine state. VEH-006 has the demo seatbelt warning. Pause/resume and verify motion and displayed speed agree.
5. Tap a worker. Search P-001, P-042 and P-248 through Assets if their bodies are too small. Each must open its own smartwatch KPIs. Closing the panel must expose the plant again.
6. Select an alert in Alerts. Its target must be highlighted without moving the physical camera. Offscreen targets should give direction guidance. Acknowledge an event and confirm its marker/list count update, including after exiting AR.
7. Open PTW-101/102/103 and follow an assigned-worker link. Test CAM-012/021/034 and DRN-001/002/003 footage. Footage must loop with no playback seconds, upload fields or native timeline. Close the panel and verify playback stops.
8. Tap UI controls while a surface ring or asset is behind them. These taps must not place, reposition or accidentally select the object underneath.
9. Use both size buttons, rotate the device, and walk around the plant. It must remain on the surface and controls must stay within the screen. Use Reposition: hide the model, pins and all panels until a fresh placement tap.
10. Exit with Exit AR and with the browser's session-ending control. The previous dashboard route, orbit camera, layer settings and pause state must return. Enter AR again: it must start at placement with no duplicate model or old panel.
11. Deny camera permission / test an unsupported browser. The app must show a concise failure message and leave the dashboard usable.

## API references

- WebXR DOM overlays and `beforexrselect`: https://www.w3.org/TR/webxr-dom-overlays-1/
- WebXR plane hit-test API: https://www.w3.org/TR/webxr-hit-test-1/

AR and the normal viewer both display synthetic operational data and recorded demo video. Neither validates work authorization or implements a live safety system.
