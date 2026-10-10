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

## Current state

`main` at 0.4.6, all review *errors* cleared, ready to publish. Releases:
[0.4.0](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.0) →
[0.4.1](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.1) →
[0.4.2](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.2) →
[0.4.3](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.3) →
[0.4.4](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.4) →
[0.4.5](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.5) →
[0.4.6](https://github.com/DwightIvany/obsidian-dangling-links-with-replace/releases/tag/0.4.6),
every one built and published by the tag-driven workflow (itself commit `96b0a42`, modeled on task-checker).

For the upstream conversation: the first three rows are the *product* (rebrand +
replace feature), and the nine review rows are the *modernization pass* the
original would need anyway — each independently cherry-pickable thanks to the
branch-per-fix discipline.
