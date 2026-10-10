# Branch history

All branches merged into `main`, in merge order, grouped the way they landed.

## Feature foundation (arrived as one merge, `ffc513f`)

| Branch | What it did |
|---|---|
| `replace-sprint-1` | Rebranded everything to `dangling-links-with-replace` (all cases: manifest ID/name, view type, command ID, ribbon tooltip, README, sample vault directory); added Replace Prefix/Suffix settings fields + settings-tab section; expanded `.gitignore`; refreshed the stale `yarn.lock` integrity hash that was breaking fresh builds |
| `replace-button` | The Replace button in the panel header (Lucide icon, "Replace" tooltip) plus `replaceAllDangles()` — wraps each `[[link]]` in the configured prefix/suffix by editing source files, one read+modify per file, right-to-left per line so positions stay valid; panel refreshes when done |
| `ux-improvements` | Header icons forced into one horizontal row (flex, inline so it needs no CSS file); explicit redraw after replace completes; settings descriptions clarified with `[[`/`]]`; backtick defaults for new installs; de-bolding of the Replace blurb |

## Review rounds (one merge commit + release each)

| Branch | Release | Fix |
|---|---|---|
| `use-settings-container` | **0.4.1** | Settings headings via `new Setting(containerEl).setName(...).setHeading()` instead of raw `h2`/`h4` elements |
| `not-assign-in-registerView` | **0.4.1** | `registerView` creates and returns the view directly (no plugin-property assignment → no leak risk); `getView()` accessor used at the 4 settings call sites |
| `unexpected-directive` | **0.4.1** | All three eslint directives gained `--` descriptions (they reach internal `app.dom`/`app.keymap` APIs missing from the public typings) |
| `no-explicit-any-not-allowed` | **0.4.1** | `(<any>this.app)` casts replaced by a typed `AppInternal` interface cast through `unknown`; the directives disappeared with the `any`s (stacked on the previous branch since both touched the same three lines) |
| `unsafe-var-warnings` | **0.4.2** | `var` → `const` ternary in grouping; dropped unsafe namespace `this` in `Config`; typed `loadData()` result; `void` on intentionally un-awaited promises (setViewState, redraws, openFile chain, popper `update`); `.bind(this)` → typed arrow wrappers |
| `update-obsidian-api` | **0.4.3** | `minAppVersion` 1.0.0 → **1.1.0** — `ExtraButtonComponent.setTooltip` only exists since 1.1.0 |
| `avoid-settings-in-settings` | **0.4.4** | Removed the redundant "Settings" heading (the tab already carries the plugin name) |
| `fix-id-and-description` | **0.4.5** | Description no longer self-referential ("Shows dangling links in your vault and replaces them with your chosen prefix and suffix"); command ID `show-dangling-links-with-replace-view` → `open-view` (no embedded plugin ID) |
| `css-styles-and-enumerate-vault` | **0.4.6** | Killed `!important` via plugin-scoped `.dlwr-settings`/`.dlwr-settings-footer` selectors with higher specificity; removed a dead typo'd CSS rule; README gained a Permissions section answering the vault-enumeration recommendation (finds dangling links locally, nothing transmitted) |

## Modernization sprint (`fix-many-recommendations-and-warnings`, release **0.5.0**)

One branch carried the full second-round review list: settings tab implements
`getSettingDefinitions()` (Obsidian 1.13+ declarative API, searchable in
settings search) with `display()` kept only as the pre-1.13 fallback;
`FolderSuggest` moved to the built-in `AbstractInputSuggest` and the custom
popper-based `controller/suggest.ts` plus the `@popperjs/core` dependency were
deleted; `view.ts` got arrow-function properties (`redraw`/`visitDangle`, no
`.bind()`), `this.contentEl` instead of `(this as any)`, and the
`getLeaf(false)` / `setActiveLeaf(leaf, {focus})` forms; `config.ts` namespace
became ES module exports; plus `substr`→`substring`, `createEl('div')`→`createDiv`,
`contains`→`includes`, unused imports dropped. The obsidian typings tarball got
pinned to commit `9abd9605` (1.14.4) instead of floating `master`, and
`minAppVersion` went 1.1.0 → **1.13.0**. (Also swept up: Dwight's own
`versions.json` entries and README Compatibility-section removal, committed in
the same window.)

The first 0.5.0 workflow run failed: npm's reader silently ignores the
standard-format `yarn.lock` that npm itself rewrote, so fresh CI installs
floated to typescript 4.9.5 / rollup 2.80.0. Fixed by committing a
`package-lock.json` (generated from the previously pinned tree) and switching
the workflow to `npm ci` (commit `b8cf528`), then re-pointing the 0.5.0 tag.

## Post-0.4.6 feature & fix rounds (one merge commit + release each)

| Branch | Release | What it did |
|---|---|---|
| `update-settings` | **0.5.1** | Ignored-folder selection reworked to the task-checker UX: compact declarative list, add/change opens a fuzzy folder-picker modal, delete + drag-reorder. Killed the now-unreachable pre-1.13 `display()` fallback, the inline suggester, and 18 lines of dead settings CSS; dropped the "Settings to replace [[ ]]" explainer row |
| `create-files-by-template` | **0.5.2** | Create Files button (plus icon) in the panel header; one note created per dangling link in the source file's folder, named after the link; template file chosen in settings; existing files skipped; Notice summarizes results |
| `deprecated-display-and-fixes` | **0.6.0** | Vault-enumeration recommendation answered in README Permissions (picker enumerates only to suggest folders). The `display()` deprecation it was paired with traced to the 0.5.0 scan — already removed in 0.5.1 — documented rather than re-fixed |
| `template-picker-ux` | **0.7.0** | Template selection reworked to the same modal-picked list UX after the declarative file control froze settings for seconds in large vaults; multiple templates persist as `templateFiles` in `data.json` (old `templateFile` migrates); Create Files prompts for a template when several exist and creates empty files when none do |
| `unused-error-binding` | **0.7.2** | Removed the unused `catch (error)` binding in `createDangleFiles` |

## Direct commits to main (no branch)

Small, mostly housekeeping — recorded here because they never passed through a
merge commit:

| Commit | What it did |
|---|---|
| `1235d01` | Renamed `branh-history.md` → `branch-history.md` (typo) |
| `7b04856` | README Note section rewritten as a proper fork introduction; stale "Compatibility" blurb removed |
| `b8cf528` | CI switched to `package-lock.json` + `npm ci` (see 0.5.0 note above) |
| `3b8937a` | Settings simplified: Create-files group + instruction row folded into the template list's heading and empty-state text |
| `5011f26` | README demo gif moved above the fold |
| `48e9c0b` | 0.7.1 manifest/versions bump |

The `Release X.Y.Z` commits (`eccde8b`, `4ed9601`, `1d64791`, `ff8fe1e`,
`3aa7ee3`, …) are mechanical manifest + `versions.json` bumps, one per tag.

## Current state

`main` at **0.7.2**. Releases:
[0.4.0](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.0) →
[0.4.1](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.1) →
[0.4.2](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.2) →
[0.4.3](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.3) →
[0.4.4](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.4) →
[0.4.5](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.5) →
[0.4.6](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.6) →
[0.5.0](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.5.0) →
[0.5.1](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.5.1) →
[0.5.2](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.5.2) →
[0.6.0](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.6.0) →
[0.7.0](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.7.0) →
[0.7.1](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.7.1) →
[0.7.2](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.7.2),
every one built and published by the tag-driven workflow (itself commit `96b0a42`, modeled on task-checker; since 0.5.0 installing via `npm ci` from the committed `package-lock.json`).

For the upstream conversation: the first three feature rows are the *product*
(rebrand + replace + create-by-template), the modernization sprint plus the
nine review rows are the *modernization pass* the original would need anyway,
and the 0.5.x–0.7.x rounds are the UX maturation on top — each independently
cherry-pickable thanks to the branch-per-fix discipline.
