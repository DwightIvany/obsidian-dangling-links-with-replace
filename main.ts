import {
    Plugin,
    PluginSettingTab,
    Setting,
    View,
    WorkspaceLeaf,
} from 'obsidian';
import { Config } from 'service/config';
import DanglingSettingsTab from 'view/settings';
import DanglingLinksView from 'view/view';
import { VIEW_TYPE_DANGLING_LINKS } from './constants';

export default class DanglingLinkPlugin extends Plugin {
    async onload() {
        await Config.loadSettings(this);
        this.registerView(
            VIEW_TYPE_DANGLING_LINKS,
            (leaf: WorkspaceLeaf) => new DanglingLinksView(leaf)
        );
        this.addCommand({
            id: 'show-dangling-links-with-replace-view',
            name: 'Open view',
            callback: () => this.showPanel(),
        });

        this.addRibbonIcon('broken-link', 'Show dangling links with replace panel', (e) =>
            this.showPanel()
        );
        this.addSettingTab(new DanglingSettingsTab(this.app, this));
    }

    showPanel() {
        this.app.workspace
            .getRightLeaf(true)
            .setViewState({ type: VIEW_TYPE_DANGLING_LINKS });
    }

    getView(): DanglingLinksView | null {
        const leaves = this.app.workspace.getLeavesOfType(
            VIEW_TYPE_DANGLING_LINKS
        );
        return leaves.length > 0
            ? (leaves[0].view as DanglingLinksView)
            : null;
    }

    onunload() {
        this.app.workspace
            .getLeavesOfType(VIEW_TYPE_DANGLING_LINKS)
            .forEach((leaf) => leaf.detach());
    }
}
