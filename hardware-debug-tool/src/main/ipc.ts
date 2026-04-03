import { ipcMain, dialog, shell, app } from 'electron';
import { readFile, writeFile, access } from 'fs/promises';
import { constants } from 'fs';
import { platform, hostname, homedir, arch, cpus, totalmem } from 'os';

/**
 * Setup all IPC handlers for main-renderer communication
 * These handlers demonstrate common patterns for Electron IPC
 */
export function setupIpcHandlers(): void {
    // ============================================
    // App Information Handlers
    // ============================================

    /**
     * Get application version
     */
    ipcMain.handle('app:get-version', () => {
        return app.getVersion();
    });

    /**
     * Get application name
     */
    ipcMain.handle('app:get-name', () => {
        return app.getName();
    });

    /**
     * Get application paths
     */
    ipcMain.handle('app:get-path', (_, name: string) => {
        try {
            return app.getPath(name as any);
        } catch {
            return null;
        }
    });

    // ============================================
    // System Information Handlers
    // ============================================

    /**
     * Get comprehensive system information
     */
    ipcMain.handle('system:get-info', () => {
        return {
            platform: platform(),
            arch: arch(),
            hostname: hostname(),
            homedir: homedir(),
            cpus: cpus().length,
            totalMemory: Math.round(totalmem() / (1024 * 1024 * 1024)), // GB
            electronVersion: process.versions.electron,
            nodeVersion: process.versions.node,
            chromeVersion: process.versions.chrome,
        };
    });

    /**
     * Get OS platform name
     */
    ipcMain.handle('system:get-platform', () => {
        return platform();
    });

    // ============================================
    // Dialog Handlers
    // ============================================

    /**
     * Show a native message dialog
     */
    ipcMain.handle('dialog:show-message', async (_, options: Electron.MessageBoxOptions) => {
        const result = await dialog.showMessageBox(options);
        return result;
    });

    /**
     * Show a native open file dialog
     */
    ipcMain.handle('dialog:open-file', async (_, options: Electron.OpenDialogOptions) => {
        const result = await dialog.showOpenDialog(options);
        return result;
    });

    /**
     * Show a native save file dialog
     */
    ipcMain.handle('dialog:save-file', async (_, options: Electron.SaveDialogOptions) => {
        const result = await dialog.showSaveDialog(options);
        return result;
    });

    // ============================================
    // File System Handlers (with security checks)
    // ============================================

    /**
     * Read a file from the filesystem
     * Note: In production, you should add path validation
     */
    ipcMain.handle('file:read', async (_, filePath: string) => {
        try {
            // Check if file exists and is readable
            await access(filePath, constants.R_OK);
            const content = await readFile(filePath, 'utf-8');
            return { success: true, content };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    /**
     * Write content to a file
     * Note: In production, you should add path validation
     */
    ipcMain.handle('file:write', async (_, filePath: string, content: string) => {
        try {
            await writeFile(filePath, content, 'utf-8');
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    // ============================================
    // Shell Handlers
    // ============================================

    /**
     * Open a URL in the default browser
     */
    ipcMain.handle('shell:open-external', async (_, url: string) => {
        try {
            await shell.openExternal(url);
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    });

    /**
     * Open a path in the file explorer
     */
    ipcMain.handle('shell:show-item-in-folder', (_, filePath: string) => {
        shell.showItemInFolder(filePath);
        return { success: true };
    });

    // ============================================
    // Theme Handlers
    // ============================================

    /**
     * Store for theme preference (in production, use electron-store)
     */
    let currentTheme: 'light' | 'dark' = 'light';

    ipcMain.handle('theme:get', () => {
        return currentTheme;
    });

    ipcMain.handle('theme:set', (_, theme: 'light' | 'dark') => {
        currentTheme = theme;
        return currentTheme;
    });

    ipcMain.handle('theme:toggle', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        return currentTheme;
    });
}
