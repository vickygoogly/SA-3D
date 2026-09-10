# Design QA

Source visual truth: Option 2 Signal Atlas UI direction, combined with the Option 1 cinematic refinery viewer direction. Reference screenshot: `/workspace/scratch/d7fe39674e25/upload/01-9627987d-f090-45e1-9544-5c025d1a053b.png`.

Implementation target: local Signal Atlas dashboard at `http://terminal.local:4173/`.

## Revision after user visual review

- Replaced the visible model grid with a textured, animated offshore-water surface.
- Added plant shadowing, industrial practical lights, a closer default camera, and remote context platforms.
- Added an in-view Layers panel that drives the actual personnel, CCTV, alert, and zone-name controls.
- Connected Live, Explore, Events, and Reports in the top command bar to the existing working dashboard views.

## Evidence and state

- Intended viewport: desktop dashboard, 1440 × 1024.
- State: default Live / 3D Spatial View, with the AR View action visible.
- Source capture: available in the supplied reference image.
- Implementation browser capture: unavailable. The cloud browser returned `net::ERR_CONNECTION_REFUSED` for the local preview address, even after starting the local Node server.
- Primary code validation: `node --check` passed for `frontend/twin.js`, `frontend/future-ui.js`, and `frontend/ar-view.js`; `node --test backend/server.test.mjs` passed (2/2).

## Required fidelity surfaces

- Fonts and typography: Manrope and DM Mono are used for the concise operational hierarchy and telemetry styling.
- Spacing and layout rhythm: Signal Atlas uses a compact navigation rail, command bar, a single status strip, dominant spatial viewer, and a contextual alert rail.
- Colors and visual tokens: deep navy surfaces, cyan operational status, blue spatial markers, amber warnings, and red critical states are tokenized in `frontend/future.css`.
- Image quality and asset fidelity: `frontend/assets/refinery-horizon.png` is a generated cinematic refinery-horizon backdrop matched to the selected viewer direction; the foreground is the existing interactive Three.js plant model.
- Copy and content: dashboard labels remain relevant to the situational-awareness demo, with the new AR action describing its purpose plainly.

## Findings

- [P1] Browser-rendered visual comparison is blocked.
  - Location: local preview.
  - Evidence: the Cloud Browser could not connect to `terminal.local:4173` and returned `net::ERR_CONNECTION_REFUSED`.
  - Impact: a same-viewport visual comparison and interaction capture cannot be performed in this environment.
  - Fix: open the package locally or from its HTTPS Render deployment and compare at 1440 × 1024; check that the AR action is visible, the 3D model remains interactive, and narrow layouts collapse correctly.

## Implementation checklist

- Run `npm start` and open the local or Render URL.
- Confirm personnel, CCTV, alerts, and camera video interactions still work in the standard 3D view.
- On a compatible HTTPS mobile/tablet browser, tap **AR View**, allow camera access, scan a flat surface, and tap to place the plant.

final result: blocked
