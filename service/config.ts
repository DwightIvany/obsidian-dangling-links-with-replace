import { NAVIGATION_TAB, SORT_ORDER } from '../constants'
import type { Plugin } from 'obsidian';

export interface DanglingSettings {
    selectedTab: NAVIGATION_TAB;
    sortOrder: SORT_ORDER;
    reducedIndices: string[];
    ignoredFolders: string[];
    replacePrefix: string;
    replaceSuffix: string;
    templateFiles: string[];
}

let plugin: Plugin;
let settings: DanglingSettings;

const DEFAULT_SETTINGS : DanglingSettings = {
    selectedTab: NAVIGATION_TAB.FILE,
    sortOrder: SORT_ORDER.ASC,
    reducedIndices: [],
    ignoredFolders: [],
    replacePrefix: '`',
    replaceSuffix: '`',
    templateFiles: []
};

async function loadSettings(loadedPlugin: Plugin): Promise<void> {
    plugin = loadedPlugin;
    const loaded = (await loadedPlugin.loadData()) as Partial<DanglingSettings> & {
        templateFile?: string;
    };
    settings = Object.assign({}, DEFAULT_SETTINGS, loaded);
    if (!Array.isArray(settings.templateFiles)) {
        settings.templateFiles = loaded.templateFile
            ? [loaded.templateFile]
            : [];
    }
    delete (settings as { templateFile?: string }).templateFile;
}

function getSettings(): DanglingSettings { return settings; }
function saveSettings(): void { void plugin.saveData(settings); }

export const Config = { loadSettings, getSettings, saveSettings };
