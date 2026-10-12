# Delivered interaction verification

Public URL https://ryosuzuki.github.io/room-scan-blender-viewer/ was checked in isolated headless Chrome on 2026-10-12.

- `live-verification.json`: all 6 scene entries loaded/rendered; orbit, pan and zoom operated via real pointer input from both panes; camera position, quaternion, target and zoom match within1e-9. Source/variant switching and 390px viewport passed, no page errors.
- `live-asset-availability.json`: all107 model/scan assets HTTP200 and unencoded byte lengths match; served app/index/style/catalog match source. Accept-Encoding identity avoids comparing compressed transport size with raw GLB length.
- `asset-validation.json`: every published GLB decoded and its SHA-256 verified; scene/catalog references checked.
- `live-*.png`: actual public site screenshots, not synthetic renders.

These checks verify the web interaction and source placement implementation, not independent geometry or registration accuracy. Original scans and reconstruction candidates retain holes/inferred hidden structures and known limitations. Local earlier screenshots/results are staging evidence; live results are the delivered endpoint evidence.

Completion state: main-integrated, with public GitHub Pages deployment and runtime source readback. Runtime publication commit502217a613bfb4e579cf8f1cce51aba5e2fb2ff8. Subsequent evidence-only record preserves that runtime; no application changes were made after the live check. Private archive visibility remains private.
