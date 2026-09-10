# Restore the deleted GitHub project

1. Extract SA-3D-Complete-Recovery.zip.
2. In GitHub, open the main Code page of vickygoogly/Test (repository root).
3. Click Add file > Upload files, or uploading an existing file if the repository appears empty.
4. Drag the extracted folder named SA-3D-Showcase-Project into the upload area. Do not drag the ZIP or the outer SA-3D-Complete-Recovery extraction folder.
5. Commit to main with message Restore complete corrected SA demo.
6. Confirm package.json is at SA-3D-Showcase-Project/SA-3D-Showcase/package.json.
7. Keep Render Root Directory as SA-3D-Showcase-Project/SA-3D-Showcase, Build Command as node --version, Start Command as node backend/server.mjs, and HOST as 0.0.0.0.
8. Wait for automatic deployment, or use Manual Deploy > Deploy latest commit if it does not start.
9. When Live, open the demo and refresh with Ctrl+Shift+R.

This is the full project, not a partial patch. It includes the model-transform fix and Render HTTPS-origin fix. No additional source edits are needed to apply those fixes. It retains local-demo behavior, simulated positions/video and file-based acknowledgment persistence. Render free instances do not retain that state across restarts.
