import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';
import { BrowserWindow, ipcMain } from 'electron';
import { app } from 'electron';

/**
 * Setup auto-updater for the application
 * Uses electron-updater with GitHub releases by default
 */
export function setupAutoUpdater(mainWindow: BrowserWindow | null): void {
    // Only check for updates in production
    if (!app.isPackaged) {
        console.log('Auto-updater disabled in development mode');
        return;
    }

    // Configure auto-updater
    autoUpdater.autoDownload = false; // Don't auto-download, let user decide
    autoUpdater.autoInstallOnAppQuit = true;

    // ============================================
    // Auto-updater Event Handlers
    // ============================================

    autoUpdater.on('checking-for-update', () => {
        console.log('Checking for updates...');
        mainWindow?.webContents.send('updater:checking');
    });

    autoUpdater.on('update-available', (info: UpdateInfo) => {
        console.log('Update available:', info.version);
        mainWindow?.webContents.send('updater:available', {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: info.releaseNotes,
        });
    });

    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
        console.log('No updates available. Current version:', info.version);
        mainWindow?.webContents.send('updater:not-available', {
            version: info.version,
        });
    });

    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
        console.log(`Download progress: ${progress.percent.toFixed(1)}%`);
        mainWindow?.webContents.send('updater:progress', {
            percent: progress.percent,
            bytesPerSecond: progress.bytesPerSecond,
            transferred: progress.transferred,
            total: progress.total,
        });
    });

    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
        console.log('Update downloaded:', info.version);
        mainWindow?.webContents.send('updater:downloaded', {
            version: info.version,
            releaseNotes: info.releaseNotes,
        });
    });

    autoUpdater.on('error', (error: Error) => {
        console.error('Auto-updater error:', error);
        mainWindow?.webContents.send('updater:error', {
            message: error.message,
        });
    });

    // ============================================
    // IPC Handlers for Renderer Communication
    // ============================================

    /**
     * Check for updates manually
     */
    ipcMain.handle('updater:check', async () => {
        try {
            const result = await autoUpdater.checkForUpdates();
            return {
                success: true,
                updateInfo: result?.updateInfo,
            };
        } catch (error) {
            return {
                success: false,
                error: String(error),
            };
        }
    });

    /**
     * Download the available update
     */
    ipcMain.handle('updater:download', async () => {
        try {
            await autoUpdater.downloadUpdate();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: String(error),
            };
        }
    });

    /**
     * Install the downloaded update and restart
     */
    ipcMain.handle('updater:install', () => {
        autoUpdater.quitAndInstall(false, true);
    });

    /**
     * Get current app version
     */
    ipcMain.handle('updater:get-version', () => {
        return app.getVersion();
    });

    // ============================================
    // Initial Update Check
    // ============================================

    // Check for updates after a short delay
    setTimeout(() => {
        autoUpdater.checkForUpdates().catch((error) => {
            console.error('Initial update check failed:', error);
        });
    }, 3000);
}
