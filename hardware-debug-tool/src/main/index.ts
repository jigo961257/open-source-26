import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { setupIpcHandlers } from './ipc';
import { setupMenu } from './menu';
import { setupAutoUpdater } from './updater';

// Store reference to the main window
let mainWindow: BrowserWindow | null = null;

// Vite dev server URL (set via environment variable in dev mode)
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

// Determine if we're in development mode
const isDev = !!VITE_DEV_SERVER_URL;

function createWindow(): void {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        frame: false, // Frameless for custom titlebar
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: -100, y: -100 }, // Hide traffic lights on macOS
        backgroundColor: '#ffffff',
        show: false, // Don't show until ready
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });

    // Gracefully show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        if (isDev) {
            mainWindow?.webContents.openDevTools();
        }
    });

    // Load the app
    if (VITE_DEV_SERVER_URL) {
        // In development, load from Vite dev server
        mainWindow.loadURL(VITE_DEV_SERVER_URL);
    } else {
        // In production, load the built files
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Window control handlers
function setupWindowControls(): void {
    ipcMain.handle('window:minimize', () => {
        mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow?.maximize();
        }
    });

    ipcMain.handle('window:close', () => {
        mainWindow?.close();
    });

    ipcMain.handle('window:isMaximized', () => {
        return mainWindow?.isMaximized() ?? false;
    });

    // Listen for maximize/unmaximize events to update UI
    mainWindow?.on('maximize', () => {
        mainWindow?.webContents.send('window:maximized-changed', true);
    });

    mainWindow?.on('unmaximize', () => {
        mainWindow?.webContents.send('window:maximized-changed', false);
    });
}

// App lifecycle events
app.whenReady().then(() => {
    createWindow();
    setupWindowControls();
    setupIpcHandlers();
    setupMenu(mainWindow);
    setupAutoUpdater(mainWindow);

    // macOS: Re-create window when dock icon is clicked
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
    contents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
});

// Export for use in other modules
export { mainWindow };
