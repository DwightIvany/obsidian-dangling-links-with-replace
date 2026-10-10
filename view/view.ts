import Dangling from './Dangling.svelte';
import { NAVIGATION_TAB, VIEW_TYPE_DANGLING_LINKS } from '../constants';
import type Dangle from '../model/dangle';
import { ItemView, MarkdownView, TFile, WorkspaceLeaf } from 'obsidian';
import { Config } from '../service/config';
import type DanglingNavigationItem from 'controller/navigationItem';
import type { Sortable } from 'controller/navigationItem';
import DanglingFolderItem from 'controller/folderItem';
import DanglingFileItem from 'controller/fileItem';
import DanglingLinkItem from 'controller/linkItem';
import DanglingSortItem from 'controller/sortItem';

export default class DanglingLinksView extends ItemView {
    private dangling: Dangling;
    private navigationItems: DanglingNavigationItem[];
    private sortableItems: Sortable[];

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.redraw = this.redraw.bind(this);
        this.visitDangle = this.visitDangle.bind(this);
        this.registerEvent(this.app.metadataCache.on('resolved', this.redraw));
        this.registerEvent(this.app.metadataCache.on('changed', this.redraw));
        this.sortableItems = [
            new DanglingFolderItem(this.app),
            new DanglingFileItem(this.app),
            new DanglingLinkItem(this.app),
        ];
        this.navigationItems = [
            ...(this.sortableItems as DanglingNavigationItem[]),
            new DanglingSortItem(this.app),
        ];
    }

    getViewType(): string {
        return VIEW_TYPE_DANGLING_LINKS;
    }

    getDisplayText(): string {
        return 'Dangling links with replace';
    }

    getIcon(): string {
        return 'broken-link';
    }

    onClose(): Promise<void> {
        if (this.dangling) {
            this.dangling.$destroy();
        }
        return Promise.resolve();
    }

    visitDangle(dangle: Dangle) {
        let file = this.app.vault.getAbstractFileByPath(dangle.path);
        if (file instanceof TFile) {
            let leaf: WorkspaceLeaf = this.app.workspace.getUnpinnedLeaf();
            void leaf.openFile(file).then(() => {
                if (leaf.view instanceof MarkdownView) {
                    this.app.workspace.setActiveLeaf(leaf, true, true);
                    leaf.view.editor.setCursor(dangle.line, dangle.col);
                }
            });
        }
    }

    public async replaceAllDangles(): Promise<void> {
        let settings = Config.getSettings();
        let prefix = settings.replacePrefix;
        let suffix = settings.replaceSuffix;
        let linkItem = this.sortableItems.find(
            (element) => element.tabIdentifier == NAVIGATION_TAB.LINK
        );
        let grouped = linkItem.getDanglingLinks();
        let byPath: Map<string, Dangle[]> = new Map();
        grouped.forEach((dangles) => {
            dangles.forEach((dangle) => {
                if (!byPath.has(dangle.path)) {
                    byPath.set(dangle.path, []);
                }
                byPath.get(dangle.path).push(dangle);
            });
        });
        for (let [path, dangles] of byPath) {
            let file = this.app.vault.getAbstractFileByPath(path);
            if (!(file instanceof TFile)) {
                continue;
            }
            let content = await this.app.vault.read(file);
            let lines = content.split('\n');
            // Replace from the end of the line backwards so earlier
            // replacements don't shift the position of later ones.
            dangles.sort((a, b) =>
                a.line == b.line ? b.col - a.col : b.line - a.line
            );
            let changed = false;
            for (let dangle of dangles) {
                let line = lines[dangle.line];
                if (line == null) {
                    continue;
                }
                let needle = '[[' + dangle.link;
                let start = line.indexOf(needle, Math.max(0, dangle.col));
                if (start == -1) {
                    start = line.indexOf(needle);
                }
                if (start == -1) {
                    continue;
                }
                let end = line.indexOf(']]', start + needle.length);
                if (end == -1) {
                    continue;
                }
                let inner = line.slice(start + 2, end);
                lines[dangle.line] =
                    line.slice(0, start) +
                    prefix +
                    inner +
                    suffix +
                    line.slice(end + 2);
                changed = true;
            }
            if (changed) {
                await this.app.vault.modify(file, lines.join('\n'));
            }
        }
        await this.redraw();
    }

    async onOpen(): Promise<void> {
        let dangling = this.getDangling();
        this.dangling = new Dangling({
            target: (this as any).contentEl,
            props: {
                visitDangle: this.visitDangle,
                redraw: this.redraw,
                replaceAll: () => this.replaceAllDangles(),
                dangling,
                sortableItems: this.sortableItems,
                navigationItems: this.navigationItems,
            },
        });
    }

    public async redraw(): Promise<void> {
        let dangling = this.getDangling();
        this.dangling?.$set({ dangling });
    }

    private getDangling(): [string, Dangle[]][] {
        let settings = Config.getSettings();
        let activeNavigation = this.sortableItems.find(
            (element) => element.tabIdentifier == settings.selectedTab
        );
        return activeNavigation.sort(activeNavigation.getDanglingLinks());
    }
}
