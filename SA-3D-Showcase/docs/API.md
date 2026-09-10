# Local backend API

Same-origin JSON REST endpoints. Default origin: `http://localhost:8080`.

| Method | Path | Behavior |
|---|---|---|
| GET | `/api/health` | Local demo backend status |
| GET | `/api/config` | Model URL and configured camera video URLs |
| GET | `/api/state` | Zone records and current alert state |
| POST | `/api/alerts/SA-2041/acknowledge` | Save the chosen event's acknowledgment and timestamp; no request body needed |
| POST | `/api/demo/reset` | Restore seeded data and overwrite local acknowledgment state |
| GET/HEAD | `/models/<filename>` | Separate model assets; HTTP byte ranges supported |
| GET/HEAD | `/media/<filename>` | Local camera video files; HTTP byte ranges supported |

All state endpoints return JSON. Unknown IDs return 404. Cross-origin browser mutations are rejected. The server does not implement authentication, user roles, CORS for a second origin, WebSockets, SSE or live industrial ingestion. Files are served only from the frontend, models and media roots.

Suggested production integration boundary: replace these demo endpoints with the chosen Java Spring Boot APIs and adapt the UI's data provider, then replace frontend simulation with validated telemetry and VMS playback. This is integration guidance, not an included production backend.
