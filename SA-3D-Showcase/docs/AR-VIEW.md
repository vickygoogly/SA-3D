# AR View demonstration

The **AR View** control sits in the 3D Spatial View toolbar. It does not replace the regular desktop viewer. The main desktop scene now uses a textured animated offshore-water surface, shadowed plant geometry, contextual remote platforms, and operational lights; all normal personnel, camera, drone, and alert interactions remain in the standard viewer.

1. Deploy the project on an HTTPS address (Render provides this automatically).
2. Open that URL on a compatible Android phone or tablet browser with WebXR support.
3. Select **AR View**, allow camera access, slowly scan a clear flat surface, then tap the placement ring.
4. Walk around the placed EPS-1 plant model; use **Exit AR** to return to the normal dashboard.

The AR mode uses the same `models/plant-model.json` geometry as the web viewer. It needs `immersive-ar` and `hit-test`; if the device cannot provide them, the dashboard shows a clear compatibility message rather than pretending to run AR.

For the demo, use a mobile/tablet browser that supports WebXR immersive AR. Apple Safari and most desktop browsers do not currently provide the required plane-detection API.
