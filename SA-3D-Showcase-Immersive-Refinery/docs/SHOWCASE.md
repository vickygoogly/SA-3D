# Five-minute showcase

1. Start the backend and open http://localhost:8080. Introduce the screen as a representative site demonstration, not an operational feed.
2. Drag the model to orbit, use the mouse wheel to zoom, and right-drag to pan. Show Top view, Reset and fullscreen. On a trackpad/touchscreen, OrbitControls supplies supported touch gestures. Keyboard: focus the canvas, use arrow keys to orbit and +/− to zoom.
3. Toggle Personnel, CCTV and Alerts independently. Explain that green figures, blue camera buttons and alert labels are attached to positions in the model. Zone names can be hidden to reduce clutter.
4. Click the SOS alert or select 'Personnel SOS activated' in the priority list. The view focuses the event, displays its coordinates, and lists three nearby online cameras ranked by model distance.
5. Click a nearby camera. The video panel renders a simulated view from that camera's 3D position. Rotate the main model while the camera remains at its installed viewpoint. The panel explicitly labels the stream as simulation.
6. Click a green figure or a named personnel label to inspect its zone and nearby cameras. Demonstration movement is generated locally.
7. Acknowledge an alert. Refresh the page to show that the backend retained acknowledgment. Acknowledgment does not resolve the incident; the event remains available in the event register.
8. If you prepared an MP4, click the matching camera to show configured video playback instead of simulated footage.
9. Finish by showing the separate frontend, backend and models folders. Explain that real-site rollout requires the actual model, calibrated spatial coordinates, wearable telemetry, VMS integration, authentication and operational workflows.

Before repeating the showcase, reset the demo via the endpoint in CONFIGURATION.md and refresh the page.
