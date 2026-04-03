import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

/**
 * Type definitions for the exposed API
 * These types are used both in preload and renderer
 */
export interface ElectronAPI {
    // ============================================
    // Window Controls
    // ============================================
    windowControls: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        isMaximized: () => Promise<boolean>;
        onMaximizedChange: (callback: (isMaximized: boolean) => void) => () => void;
    };

    // ============================================
    // IPC Invoke Methods
    // ============================================
    invoke: {
        // App info
        getVersion: () => Promise<string>;
        getName: () => Promise<string>;
        getPath: (name: string) => Promise<string | null>;

        // System info
        getSystemInfo: () => Promise<{
            platform: string;
            arch: string;
            hostname: string;
            homedir: string;
            cpus: number;
            totalMemory: number;
            electronVersion: string;
            nodeVersion: string;
            chromeVersion: string;
        }>;
        getPlatform: () => Promise<string>;

        // Dialogs
        showMessageDialog: (options: {
            type?: 'none' | 'info' | 'error' | 'question' | 'warning';
            title?: string;
            message: string;
            detail?: string;
            buttons?: string[];
        }) => Promise<{ response: number; checkboxChecked: boolean }>;
        openFileDialog: (options?: {
            title?: string;
            filters?: { name: string; extensions: string[] }[];
            properties?: ('openFile' | 'openDirectory' | 'multiSelections')[];
        }) => Promise<{ canceled: boolean; filePaths: string[] }>;
        saveFileDialog: (options?: {
            title?: string;
            defaultPath?: string;
            filters?: { name: string; extensions: string[] }[];
        }) => Promise<{ canceled: boolean; filePath?: string }>;

        // File operations
        readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
        writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;

        // Shell operations
        openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
        showInFolder: (filePath: string) => Promise<{ success: boolean }>;

        // Theme
        getTheme: () => Promise<'light' | 'dark'>;
        setTheme: (theme: 'light' | 'dark') => Promise<'light' | 'dark'>;
        toggleTheme: () => Promise<'light' | 'dark'>;
    };

    // ============================================
    // Context Menu
    // ============================================
    contextMenu: {
        show: (items: { label: string; type?: 'normal' | 'separator' }[]) => Promise<{
            selected: boolean;
            index: number;
            label: string | null;
        }>;
        showTextMenu: () => Promise<{ action: string | null }>;
        showCustom: (items: string[]) => Promise<{
            selected: boolean;
            index: number;
            label: string | null;
        }>;
    };

    // ============================================
    // Event Listeners
    // ============================================
    on: {
        // Menu events
        newFile: (callback: () => void) => () => void;
        openFile: (callback: () => void) => () => void;
        save: (callback: () => void) => () => void;
        toggleTheme: (callback: () => void) => () => void;
        checkUpdates: (callback: () => void) => () => void;

        // Updater events
        updaterChecking: (callback: () => void) => () => void;
        updaterAvailable: (callback: (info: { version: string; releaseDate: string; releaseNotes: string }) => void) => () => void;
        updaterNotAvailable: (callback: (info: { version: string }) => void) => () => void;
        updaterProgress: (callback: (progress: { percent: number; bytesPerSecond: number; transferred: number; total: number }) => void) => () => void;
        updaterDownloaded: (callback: (info: { version: string; releaseNotes: string }) => void) => () => void;
        updaterError: (callback: (error: { message: string }) => void) => () => void;
    };

    // ============================================
    // Auto Updater
    // ============================================
    updater: {
        check: () => Promise<{ success: boolean; updateInfo?: any; error?: string }>;
        download: () => Promise<{ success: boolean; error?: string }>;
        install: () => void;
        getVersion: () => Promise<string>;
    };
}

// Helper to create event listener with cleanup
function createListener(channel: string) {
    return (callback: (...args: any[]) => void) => {
        const listener = (_event: IpcRendererEvent, ...args: any[]) => callback(...args);
        ipcRenderer.on(channel, listener);
        // Return cleanup function
        return () => {
            ipcRenderer.removeListener(channel, listener);
        };
    };
}

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
    // ============================================
    // Window Controls
    // ============================================
    windowControls: {
        minimize: () => ipcRenderer.invoke('window:minimize'),
        maximize: () => ipcRenderer.invoke('window:maximize'),
        close: () => ipcRenderer.invoke('window:close'),
        isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
        onMaximizedChange: (callback) => {
            const listener = (_event: IpcRendererEvent, isMaximized: boolean) => callback(isMaximized);
            ipcRenderer.on('window:maximized-changed', listener);
            return () => ipcRenderer.removeListener('window:maximized-changed', listener);
        },
    },

    // ============================================
    // IPC Invoke Methods
    // ============================================
    invoke: {
        // App info
        getVersion: () => ipcRenderer.invoke('app:get-version'),
        getName: () => ipcRenderer.invoke('app:get-name'),
        getPath: (name) => ipcRenderer.invoke('app:get-path', name),

        // System info
        getSystemInfo: () => ipcRenderer.invoke('system:get-info'),
        getPlatform: () => ipcRenderer.invoke('system:get-platform'),

        // Dialogs
        showMessageDialog: (options) => ipcRenderer.invoke('dialog:show-message', options),
        openFileDialog: (options) => ipcRenderer.invoke('dialog:open-file', options),
        saveFileDialog: (options) => ipcRenderer.invoke('dialog:save-file', options),

        // File operations
        readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
        writeFile: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),

        // Shell operations
        openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
        showInFolder: (filePath) => ipcRenderer.invoke('shell:show-item-in-folder', filePath),

        // Theme
        getTheme: () => ipcRenderer.invoke('theme:get'),
        setTheme: (theme) => ipcRenderer.invoke('theme:set', theme),
        toggleTheme: () => ipcRenderer.invoke('theme:toggle'),
    },

    // ============================================
    // Context Menu
    // ============================================
    contextMenu: {
        show: (items) => ipcRenderer.invoke('context-menu:show', items),
        showTextMenu: () => ipcRenderer.invoke('context-menu:show-text-menu'),
        showCustom: (items) => ipcRenderer.invoke('context-menu:show-custom', items),
    },

    // ============================================
    // Event Listeners
    // ============================================
    on: {
        // Menu events
        newFile: createListener('menu:new-file'),
        openFile: createListener('menu:open-file'),
        save: createListener('menu:save'),
        toggleTheme: createListener('menu:toggle-theme'),
        checkUpdates: createListener('menu:check-updates'),

        // Updater events
        updaterChecking: createListener('updater:checking'),
        updaterAvailable: createListener('updater:available'),
        updaterNotAvailable: createListener('updater:not-available'),
        updaterProgress: createListener('updater:progress'),
        updaterDownloaded: createListener('updater:downloaded'),
        updaterError: createListener('updater:error'),
    },

    // ============================================
    // Auto Updater
    // ============================================
    updater: {
        check: () => ipcRenderer.invoke('updater:check'),
        download: () => ipcRenderer.invoke('updater:download'),
        install: () => ipcRenderer.invoke('updater:install'),
        getVersion: () => ipcRenderer.invoke('updater:get-version'),
    },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Add type declaration for window object
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
