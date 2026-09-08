# Configuration

## Host and port

Edit `backend/config.json`, then restart the server:

```json
{
  "host": "127.0.0.1",
  "port": 8080,
  "modelUrl": "/models/plant-model.json",
  "cameraVideos": {}
}
```

The environment variables `HOST` and `PORT` override the file. For example, in PowerShell:

```powershell
$env:PORT=8090
node backend/server.mjs
```

Open `http://localhost:8090`. Keep the default loopback host for a demonstration on your own PC. Network sharing requires a deliberate host/firewall configuration; authentication is not implemented in this demo.

## Use your own video for a camera

1. Copy a browser-compatible video to `backend/media/separator-demo.mp4`. MP4 using H.264 is a practical choice; actual playback depends on the browser's codec support.
2. Update the configuration:

```json
{
  "host": "127.0.0.1",
  "port": 8080,
  "modelUrl": "/models/plant-model.json",
  "cameraVideos": {
    "CAM-021": "/media/separator-demo.mp4"
  }
}
```

3. Restart the backend and refresh the browser. Click CAM-021 on the model. The panel identifies the configured source instead of labelling it as the 3D simulation.

You can configure an HTTP(S) MP4/WebM URL instead. That URL must be accessible from the browser. Authentication headers are not implemented by this video element; do not place private credentials in a public URL or this config. Locally supplied files are served with HTTP byte-range support for seeking.

Cameras without a configured source use the simulated camera view. CAM-047 and CAM-048 are marked offline by the demo and do not play video. To change their status, edit the camera record creation in `frontend/twin.js`.

Raw RTSP URLs do not play in the browser. A real VMS needs a suitable browser delivery path, such as a WebRTC adapter or HLS player/gateway. Those adapters are not included. The configured video player accepts browser-supported sources; it does not automatically convert RTSP or implement portable HLS playback.

## Replace or edit the plant model

The active model is a Three.js Object JSON file loaded with ObjectLoader in `frontend/twin.js`. Edit the procedural geometry in `scripts/build-model.mjs` and regenerate with:

```bash
npm run build:model
```

This updates the separate JSON and GLB files. You can also supply another compatible Three.js Object JSON scene and point `modelUrl` to `/models/your-model.json`.

The supplied GLB is an interchange copy for 3D tools. To use an edited GLB directly as the active model, a developer must replace the ObjectLoader call with a GLTFLoader integration (including its dependencies and any required compression decoders). A GLB file cannot be loaded by changing `modelUrl` alone in this version.

When replacing geometry, align scale, origin and orientation before displaying overlays. Do not assume existing demonstration positions are valid on a new model.

## Overlay coordinates

The model uses **metres, Y up**. X and Z are horizontal; Y is elevation. The representative site covers approximately 210 by 145 metres including the flare structure.

In `frontend/twin.js`:

- `centers` defines the six representative zone centres in X/Z.
- The personnel-generation loop creates demonstration positions along zone perimeters and small walking movements.
- `camRecords` defines camera position, viewing target and availability. Cameras are distributed around zone centres in this version.
- `events` contains the alert coordinates.
- The two personnel associated with the SOS/restricted-entry demonstrations are placed at their event coordinates.

Real integration requires transforming wearable coordinates, camera installation positions and event locations into the model's coordinate frame. Nearby cameras are ranked by 3D Euclidean distance, not by line of sight, lens coverage or analytics confidence. Overlay labels are intentionally visible through structures; the UI labels this as X-ray markers.

## Seed data and reset

Edit `backend/data/seed.json` to change zone counts or event descriptions. The spatial view has corresponding IDs, cameras and coordinates in `frontend/twin.js`; keep these consistent. The current showcase has six zone records, with the Wellhead Towers record representing two monitoring zones. Summary cards and trend values in `frontend/index.html` remain illustrative, so update them when changing the dataset.

Acknowledgment state is saved in `backend/data/state.json`. To reset, stop the server and delete only `state.json`, or while it runs use PowerShell:

```powershell
Invoke-RestMethod -Method Post http://localhost:8080/api/demo/reset
```

On macOS/Linux:

```bash
curl -X POST http://localhost:8080/api/demo/reset
```

Then refresh the browser. The default configuration/data are loaded at server startup. Refreshing without a reset preserves saved acknowledgments. Nothing is sent to an operational response team.

## Troubleshooting

- **Node is not recognized:** install Node.js, then open a new terminal.
- **Port already in use:** change `port` and restart; open the matching address.
- **Blank 3D view:** use a WebGL-capable browser with hardware acceleration; check the browser console and backend terminal. Remote desktop GPU restrictions can affect WebGL.
- **Page opened as a local file:** use `http://localhost:8080`, not `file://`; the UI requires its backend API.
- **Camera video paused:** click Play. Browser autoplay policies can require a gesture.
- **Configured video fails:** check file spelling, camera ID, browser codec support, and the `/media/...` URL.
- **Model unavailable:** verify `modelUrl`, confirm the JSON file exists, and run `npm run build:model` if needed.
- **Model changed but markers are misplaced:** calibrate the coordinate frame and update overlay positions; the demo does not do automatic spatial registration.
