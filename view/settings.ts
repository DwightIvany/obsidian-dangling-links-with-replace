import { Config } from 'service/config';
import type DanglingLinkPlugin from 'main';
import {
    App,
    PluginSettingTab,
    Setting,
    TAbstractFile,
    TFolder,
} from 'obsidian';
import { TextInputSuggest } from 'controller/suggest';

export default class DanglingSettingsTab extends PluginSettingTab {
    constructor(app: App, private plugin: DanglingLinkPlugin) {
        super(app, plugin);
    }

    display(): void {
        let { containerEl } = this;
        const settings = Config.getSettings();

        this.containerEl.empty();

        new Setting(containerEl).setName('Settings').setHeading();

        new Setting(containerEl)
            .setName(
                'You can ignore folders (and their subfolders) with entries you add here.'
            )
            .setHeading();

        settings.ignoredFolders.forEach((folder, index) => {
            const div = containerEl.createEl('div');
            div.addClass('settings-div');

            new Setting(containerEl)
                .setDesc(`Ignored Folder #${index + 1}`)
                .addExtraButton((extra) => {
                    extra
                        .setIcon('cross')
                        .setTooltip('Delete')
                        .onClick(() => {
                            settings.ignoredFolders.remove(
                                settings.ignoredFolders[index]
                            );
                            // Force refresh
                            Config.saveSettings();
                            void this.plugin.getView()?.redraw();
                            this.display();
                        });
                })
                .addText((text) => {
                    const t = text
                        .setPlaceholder('Folder name')
                        .setValue(folder)
                        .onChange((newFolder) => {
                            settings.ignoredFolders[index] = newFolder;
                            Config.saveSettings();
                            void this.plugin.getView()?.redraw();
                        });
                    new FolderSuggest(this.app, text.inputEl);
                    t.inputEl.addClass('templater_template');

                    return t;
                });
        });

        const div = containerEl.createEl('div');
        div.addClass('div');

        const setting = new Setting(containerEl).addButton((button) => {
            const b = button
                .setButtonText('Ignore another folder')
                .onClick(() => {
                    settings.ignoredFolders.push('');
                    // Force refresh
                    this.display();
                });
            b.buttonEl.addClass('templater_button');

            return b;
        });
        setting.infoEl.remove();

        div.appendChild(containerEl.lastChild);

        new Setting(containerEl).setName('Replace').setHeading();

        this.containerEl.createEl('div', {
            text: 'Settings to replace [[ ]] MarkDown with other character for Dangling Links.',
            cls: 'setting-item-description',
        });

        new Setting(containerEl)
            .setName('Replace Prefix')
            .setDesc('Text to place before each dangling link when replacing [[ prefix.')
            .addText((text) =>
                text
                    .setPlaceholder('Prefix')
                    .setValue(settings.replacePrefix)
                    .onChange((newPrefix) => {
                        settings.replacePrefix = newPrefix;
                        Config.saveSettings();
                        void this.plugin.getView()?.redraw();
                    })
            );

        new Setting(containerEl)
            .setName('Replace Suffix')
            .setDesc('Text to place after each dangling link when replacing ]] suffix.')
            .addText((text) =>
                text
                    .setPlaceholder('Suffix')
                    .setValue(settings.replaceSuffix)
                    .onChange((newSuffix) => {
                        settings.replaceSuffix = newSuffix;
                        Config.saveSettings();
                        void this.plugin.getView()?.redraw();
                    })
            );
    }
}

class FolderSuggest extends TextInputSuggest<TFolder> {
    getSuggestions(inputStr: string): TFolder[] {
        const abstractFiles = this.app.vault.getAllLoadedFiles();
        const folders: TFolder[] = [];
        const lowerCaseInputStr = inputStr.toLowerCase();

        abstractFiles.forEach((folder: TAbstractFile) => {
            if (
                folder instanceof TFolder &&
                folder.path.toLowerCase().contains(lowerCaseInputStr)
            ) {
                folders.push(folder);
            }
        });

        return folders;
    }

    renderSuggestion(file: TFolder, el: HTMLElement): void {
        el.setText(file.path);
    }

    selectSuggestion(file: TFolder): void {
        this.inputEl.value = file.path;
        this.inputEl.trigger('input');
        this.close();
    }
}
