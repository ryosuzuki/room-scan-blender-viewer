# Room Twin — synchronized scan / Blender comparison

**Live public viewer:** https://ryosuzuki.github.io/room-scan-blender-viewer/

Recorded scan **left**, editable Blender reconstruction candidate **right**. Orbit, pan and zoom either side; both cameras and orbit targets share the exact same world-space state. Choose Ryo's three floors, Ziru's home, LAB, or the separately retained LAB corridor. The variant menu retains intermediate, partial, experimental and different capture-state candidates rather than presenting them as completed models.

- [Narrated introduction and complete production demos](https://youtu.be/h4kDsGPTDqY)
- [Detailed production archive / reproducibility](https://github.com/ryosuzuki/scan-digital-twin-archive/tree/main/docs/2026-10-11-room-showcase) — existing **private** repository, unchanged visibility.
- [Published asset provenance, SHA-256, sizes and preparation](asset-provenance.json)
- [Scene, source capture, model and registration catalog](catalog.json)

## Controls

Drag to orbit; right-drag or Shift+drag to pan; wheel/pinch to zoom; double-click a visible surface to focus both panes. Overview, top and interior presets. The **common cut plane** clips both panes at the same Y height without modifying their assets. Upper-floor cutaway also applies a common lower plane at 2.2m to omit downstairs; disable cutaway to inspect the complete multi-elevation mesh. A viewpoint link records scene, asset selections, shared camera/target, cut height and cut state.

The responsive layout keeps equal left/right viewport dimensions; synchronized world positions therefore have equal projection. There is no separate recentering, scale fitting or camera normalization for either model. Source matrices are explicit row-major Y-up matrices. Native per-record room meshes get their session transform once on a new parent. Ziru archived Polycam/Record3D GLBs already serialize their registration at the root, so their added parent is identity (never apply registration twice). Reconstruction GLBs preserve Blender's glTF Y-up export frame.

## Coverage

6 scene entries; 90 reconstruction / method GLB variants; 18 scan selections (17 unique source assets, the multi-elevation Ryo scan is shared). Five full current cumulative scenes are first in their variant menus. Corridor stays separate because its main-room registration is not accepted. Object-only variants keep their original placement; they are not independently normalized to fill the screen.

Original native source observations are used, not repaired hybrid scans masquerading as evidence. Ryo main uses original Polycam; upper/lower use the same native multi-elevation Scaniverse mesh. Ziru uses original Polycam/Record3D plus seven per-record observations. LAB uses the complete retained recorded-scan assembly (embedded registration, identity parent), plus per-record original fused RGBD observations with stored `toSpace` registrations. Some captures cover only part of the room and have different moving-object states. The LAB corridor capture has a known weak registration / floor-height discrepancy.

The proprietary MORABO manufacturer GLB acquired for local evaluation is **not redistributed**. Its user-authored comparison candidates remain available. The project does not contain `.blend` source archives, raw frame images, session transcripts, personal credentials, or unrelated project exports. Authorized room/model texture pixels are included in the public scene assets.

## Important limits

All geometry remains an **unverified reconstruction candidate**. Source scans have holes, blur, missing backs and moving objects. Clean models include inferred hidden structures. Camera synchronization is exact but does **not** prove scan/model registration accuracy. Models are not absolute-accuracy accepted. The three Ryo floors are independent scenes, not a falsely registered whole-house dollhouse. Open-door variants and cloth observations are distinct capture states/methods.

Web derivatives use meshopt compression with **14-bit position quantization**, no triangle simplification, and texture resizing to at most 2048px (quality 82). Original files and SHA-256 remain recorded, unchanged in local storage. Quantization and texture compression introduce small display differences; use the originals for metric analysis. Paper/photo textures are replayed observations, not measured physical reflectance.

## Reproduce / run

```
npm ci --ignore-scripts
npm run serve
# open http://localhost:8098
```

All runtime JS and GLB assets are checked in; no backend or authenticated endpoint is required. Rendering is on demand (not a perpetual render loop). Google Fonts is optional; system fonts are the fallback. GitHub Pages deploys only `index.html`, app/style/catalog/provenance, assets and vendor modules, not build inputs or test screenshots.

To reproduce derivatives from the original restored Storage layout:

```
ROOM_STORAGE=/path/to/Storage npm run build-assets
```

The script writes an explicit provenance catalog, strips source extras, retains coordinate transforms, deduplicates byte-identical inputs, resizes textures and compresses geometry. Original input files are unchanged. Each publication derivative is identified by the original content hash in its filename. To regenerate after changing compression settings, remove only task-owned derived `assets/` in a separate clean checkout first; the script otherwise reuses existing immutable derivatives.

## Verification

```
node scripts/verify.mjs http://localhost:8098 local
node scripts/verify.mjs https://ryosuzuki.github.io/room-scan-blender-viewer/ live
```

Verification uses an isolated headless Chrome instance, loads and renders all six scene pairs, then uses real pointer orbit/right-drag-pan/wheel-zoom on **both** panes and compares position, quaternion, target and zoom within `1e-9`. It also checks source/variant switching and 390px responsive layout, and records screenshots in `evidence/`. This verifies delivered interaction, not geometric fidelity. `scripts/validate-assets.mjs` decodes every published GLB and checks provenance hashes/catalog references.

## Publication

Public repository and GitHub Pages were specifically authorized for this interactive comparison. The pre-existing production archive remains private. `.github/workflows/pages.yml` uploads a bounded static website artifact on every `main` push. Completion means the live URL has loaded the actual models and passed the interaction checks, not merely that a commit or build succeeded.
