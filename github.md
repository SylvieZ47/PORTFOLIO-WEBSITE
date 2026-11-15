repo: SylvieZ47/PORTFOLIO-IMAGE
branch: main
path: (image library — project photos & drawings)

## Last sync
date: 2026-09-09T04:04:15Z
commit: c2e49b1341b8

### Updated in this project
- Full re-pull of image library (83 repo files → 92 organized under assets/projects/)
- New projects wired: pku-teaching-building (p08), river-lantern (p09)
- Expanded: seedlings (cover+2 renders+night+2 plans), downstairs-bazaar (cover+index+11 renders/maps+8 dwg), 798 (real cover+3 photos)
- Cover rule: img_00_cover = main/cinematic/detail cover; img_01_index-cover = Work overview cover (falls back to cover)

## Screen map
| Screen | Repo source |
|---|---|
| Home cinematic covers + project detail pages | assets/projects/<slug>/img_00_cover.* |
| Work overview (Index) cards | assets/projects/<slug>/img_01_index-cover.* (fallback img_00_cover) |
| Project galleries & drawings | assets/projects/<slug>/img_*, dwg_* |

## Notes
- Import size cap ~5MB/file. Repo images now compressed <3.1MB — all import cleanly.
- Renamed on import: pku & river-lattern Chinese filenames → ASCII; beck `..._img_00_cover .png` → img_00_cover.png. Local folder downstairs-bazzar → downstairs-bazaar, river-lattern → river-lantern.
- Skipped repo dupes (double-ext / typo): downstairs img_13/img_15 (.jpg.jpg / .png.jpg), immg_18_map, img_14_exploed.png — clean equivalents used instead.
- Still placeholder-only (no repo images): laminated-coliseum, roski, korea-commercial ×4, chadron.
