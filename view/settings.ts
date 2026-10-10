import { Config } from 'service/config';
import type DanglingLinkPlugin from 'main';
import {
    App,
    FuzzySuggestModal,
    PluginSettingTab,
    TFile,
    TFolder,
    type SettingDefinitionItem,
} from 'obsidian';

export default class DanglingSettingsTab extends PluginSettingTab {
    constructor(app: App, private plugin: DanglingLinkPlugin) {
        super(app, plugin);
    }

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
                        new FolderPickerModal(this.app, (folder) => {
                            settings.ignoredFolders.push(folder.path);
                            this.persist(true);
                        }).open();
                    },
                },
                onReorder: (oldIndex: number, newIndex: number) => {
                    const [moved] = settings.ignoredFolders.splice(
                        oldIndex,
                        1
                    );
                    settings.ignoredFolders.splice(newIndex, 0, moved);
                    this.persist(false);
                },
                onDelete: (index) => {
                    settings.ignoredFolders.splice(index, 1);
                    this.persist(true);
                },
                items: settings.ignoredFolders.map((folder) => ({
                    name: folder || '(no folder selected)',
                    searchable: false,
                    action: (el: HTMLElement, index: number) => {
                        new FolderPickerModal(this.app, (picked) => {
                            settings.ignoredFolders[index] = picked.path;
                            this.persist(true);
                        }).open();
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
                type: 'group',
                heading: 'Create files by template',
                items: [
                    {
                        name: 'Create files using a template in same folder as the Dangling Links',
                        searchable: false,
                    },
                ],
            },
            {
                type: 'list',
                heading: 'Template files',
                emptyState:
                    'No templates selected. Created files will be empty.',
                addItem: {
                    name: 'Add template',
                    action: () => {
                        new FilePickerModal(this.app, (file) => {
                            settings.templateFiles.push(file.path);
                            this.persist(true);
                        }).open();
                    },
                },
                onReorder: (oldIndex: number, newIndex: number) => {
                    const [moved] = settings.templateFiles.splice(
                        oldIndex,
                        1
                    );
                    settings.templateFiles.splice(newIndex, 0, moved);
                    this.persist(false);
                },
                onDelete: (index) => {
                    settings.templateFiles.splice(index, 1);
                    this.persist(true);
                },
                items: settings.templateFiles.map((file) => ({
                    name: file || '(no file selected)',
                    searchable: false,
                    action: (el: HTMLElement, index: number) => {
                        new FilePickerModal(this.app, (picked) => {
                            settings.templateFiles[index] = picked.path;
                            this.persist(true);
                        }).open();
                    },
                })),
            },
        ];
    }

    // Back the declarative text controls above with Config storage instead
    // of the default `plugin.settings` object this plugin does not use.
    getControlValue(key: string): unknown {
        return (Config.getSettings() as unknown as Record<string, unknown>)[
            key
        ];
    }

    setControlValue(key: string, value: unknown): void {
        (Config.getSettings() as unknown as Record<string, unknown>)[key] =
            value;
        Config.saveSettings();
        void this.plugin.getView()?.redraw();
    }

    // Saves after a list mutation, then rebuilds the tab so the row changes
    // are reflected. Reorders skip the rebuild: the framework already moved
    // the rows.
    private persist(rebuild: boolean): void {
        Config.saveSettings();
        void this.plugin.getView()?.redraw();
        if (rebuild) {
            this.update();
        }
    }
}

class FilePickerModal extends FuzzySuggestModal<TFile> {
    private readonly onPick: (file: TFile) => void;

    constructor(app: App, onPick: (file: TFile) => void) {
        super(app);
        this.onPick = onPick;
        this.setPlaceholder('Select a template file');
    }

    getItems(): TFile[] {
        return this.app.vault.getMarkdownFiles();
    }

    getItemText(file: TFile): string {
        return file.path;
    }

    onChooseItem(file: TFile): void {
        this.onPick(file);
    }
}

class FolderPickerModal extends FuzzySuggestModal<TFolder> {
    private readonly onPick: (folder: TFolder) => void;

    constructor(app: App, onPick: (folder: TFolder) => void) {
        super(app);
        this.onPick = onPick;
        this.setPlaceholder('Select a folder');
    }

    getItems(): TFolder[] {
        return this.app.vault
            .getAllLoadedFiles()
            .filter(
                (file): file is TFolder =>
                    file instanceof TFolder && file.path !== '/'
            );
    }

    getItemText(folder: TFolder): string {
        return folder.path;
    }

    onChooseItem(folder: TFolder): void {
        this.onPick(folder);
    }
}
