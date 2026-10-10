import { Config } from 'service/config';
import type DanglingLinkPlugin from 'main';
import {
    AbstractInputSuggest,
    App,
    PluginSettingTab,
    Setting,
    TAbstractFile,
    TFolder,
    type SettingDefinitionItem,
} from 'obsidian';

export default class DanglingSettingsTab extends PluginSettingTab {
    constructor(app: App, private plugin: DanglingLinkPlugin) {
        super(app, plugin);
    }

    // Declarative settings (Obsidian 1.13+): Obsidian renders the tab from
    // these definitions and indexes them for settings search. On older
    // versions it calls display() instead, which renders imperatively below.
    getSettingDefinitions(): SettingDefinitionItem[] {
        const settings = Config.getSettings();
        return [
            {
                type: 'list',
                heading:
                    'You can ignore folders (and their subfolders) with entries you add here.',
                emptyState: 'No ignored folders.',
                addItem: {
                    name: 'Ignore another folder',
                    action: () => {
                        settings.ignoredFolders.push('');
                        Config.saveSettings();
                        this.update();
                    },
                },
                onDelete: (index) => {
                    settings.ignoredFolders.splice(index, 1);
                    Config.saveSettings();
                    void this.plugin.getView()?.redraw();
                    this.update();
                },
                items: settings.ignoredFolders.map((folder, index) => ({
                    name: folder || `Ignored folder #${index + 1}`,
                    searchable: false,
                    control: {
                        type: 'folder',
                        key: `ignoredFolders.${index}`,
                        placeholder: 'Folder name',
                    },
                })),
            },
            {
                type: 'group',
                heading:
                    'Replace [[link]] with other characters for all Dangling Links',
                items: [
                    {
                        name: 'Replace Prefix',
                        desc: 'Text to place before each dangling link when replacing [[ prefix.',
                        control: {
                            type: 'text',
                            key: 'replacePrefix',
                            placeholder: 'Prefix',
                            defaultValue: '`',
                        },
                    },
                    {
                        name: 'Replace Suffix',
                        desc: 'Text to place after each dangling link when replacing ]] suffix.',
                        control: {
                            type: 'text',
                            key: 'replaceSuffix',
                            placeholder: 'Suffix',
                            defaultValue: '`',
                        },
                    },
                ],
            },
            {
                name: 'Replace [[link]] with other characters for all Dangling Links',
                desc: 'Settings to replace [[ ]] MarkDown with other character for Dangling Links.',
                searchable: false,
            },
        ];
    }

    // Back the declarative controls above with Config storage instead of
    // the default `plugin.settings` object this plugin does not use. List
    // rows bind their text control to an `ignoredFolders.<index>` key.
    getControlValue(key: string): unknown {
        const listKey = /^ignoredFolders\.(\d+)$/.exec(key);
        if (listKey) {
            return Config.getSettings().ignoredFolders[Number(listKey[1])];
        }
        return (Config.getSettings() as unknown as Record<string, unknown>)[
            key
        ];
    }

    setControlValue(key: string, value: unknown): void {
        const settings = Config.getSettings();
        const listKey = /^ignoredFolders\.(\d+)$/.exec(key);
        if (listKey) {
            settings.ignoredFolders[Number(listKey[1])] = String(value);
        } else {
            (settings as unknown as Record<string, unknown>)[key] = value;
        }
        Config.saveSettings();
        void this.plugin.getView()?.redraw();
    }

    display(): void {
        this.renderImperative();
    }

    // Imperative rendering, kept as the fallback for Obsidian versions
    // without the declarative settings API (pre-1.13).
    private renderImperative(): void {
        let { containerEl } = this;
        const settings = Config.getSettings();

        this.containerEl.empty();
        containerEl.addClass('dlwr-settings');

        new Setting(containerEl)
            .setName(
                'You can ignore folders (and their subfolders) with entries you add here.'
            )
            .setHeading();

        settings.ignoredFolders.forEach((folder, index) => {
            const div = containerEl.createDiv();
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
                            this.renderImperative();
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

        const div = containerEl.createDiv();
        div.addClass('dlwr-settings-footer');

        const setting = new Setting(containerEl).addButton((button) => {
            const b = button
                .setButtonText('Ignore another folder')
                .onClick(() => {
                    settings.ignoredFolders.push('');
                    // Force refresh
                    this.renderImperative();
                });
            b.buttonEl.addClass('templater_button');

            return b;
        });
        setting.infoEl.remove();

        div.appendChild(containerEl.lastChild);

        new Setting(containerEl)
            .setName(
                'Replace [[link]] with other characters for all Dangling Links'
            )
            .setHeading();

        this.containerEl.createDiv({
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

class FolderSuggest extends AbstractInputSuggest<TFolder> {
    private inputElRef: HTMLInputElement;

    constructor(app: App, inputEl: HTMLInputElement) {
        super(app, inputEl);
        this.inputElRef = inputEl;
    }

    protected getSuggestions(inputStr: string): TFolder[] {
        const folders: TFolder[] = [];
        const lowerCaseInputStr = inputStr.toLowerCase();

        this.app.vault.getAllLoadedFiles().forEach((file: TAbstractFile) => {
            if (
                file instanceof TFolder &&
                file.path.toLowerCase().includes(lowerCaseInputStr)
            ) {
                folders.push(file);
            }
        });

        return folders;
    }

    renderSuggestion(folder: TFolder, el: HTMLElement): void {
        el.setText(folder.path);
    }

    selectSuggestion(folder: TFolder, evt: MouseEvent | KeyboardEvent): void {
        this.inputElRef.value = folder.path;
        this.inputElRef.trigger('input');
        this.close();
    }
}
