import { Menu, BrowserWindow, ipcMain, MenuItem, MenuItemConstructorOptions } from 'electron';
import { app } from 'electron';

/**
 * Setup application menu and context menu handlers
 */
export function setupMenu(mainWindow: BrowserWindow | null): void {
    // ============================================
    // Application Menu
    // ============================================

    const isMac = process.platform === 'darwin';

    const template: MenuItemConstructorOptions[] = [
        // App menu (macOS only)
        ...(isMac
            ? [
                {
                    label: app.getName(),
                    submenu: [
                        { role: 'about' as const },
                        { type: 'separator' as const },
                        { role: 'services' as const },
                        { type: 'separator' as const },
                        { role: 'hide' as const },
                        { role: 'hideOthers' as const },
                        { role: 'unhide' as const },
                        { type: 'separator' as const },
                        { role: 'quit' as const },
                    ],
                },
            ]
            : []),

        // File menu
        {
            label: 'File',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow?.webContents.send('menu:new-file');
                    },
                },
                {
                    label: 'Open File...',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        mainWindow?.webContents.send('menu:open-file');
                    },
                },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        mainWindow?.webContents.send('menu:save');
                    },
                },
                { type: 'separator' as const },
                isMac ? { role: 'close' as const } : { role: 'quit' as const },
            ],
        },

        // Edit menu
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' as const },
                { role: 'redo' as const },
                { type: 'separator' as const },
                { role: 'cut' as const },
                { role: 'copy' as const },
                { role: 'paste' as const },
                ...(isMac
                    ? [
                        { role: 'delete' as const },
                        { role: 'selectAll' as const },
                    ]
                    : [
                        { role: 'delete' as const },
                        { type: 'separator' as const },
                        { role: 'selectAll' as const },
                    ]),
            ],
        },

        // View menu
        {
            label: 'View',
            submenu: [
                { role: 'reload' as const },
                { role: 'forceReload' as const },
                { role: 'toggleDevTools' as const },
                { type: 'separator' as const },
                { role: 'resetZoom' as const },
                { role: 'zoomIn' as const },
                { role: 'zoomOut' as const },
                { type: 'separator' as const },
                { role: 'togglefullscreen' as const },
                { type: 'separator' as const },
                {
                    label: 'Toggle Theme',
                    accelerator: 'CmdOrCtrl+Shift+T',
                    click: () => {
                        mainWindow?.webContents.send('menu:toggle-theme');
                    },
                },
            ],
        },

        // Window menu
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' as const },
                { role: 'zoom' as const },
                ...(isMac
                    ? [
                        { type: 'separator' as const },
                        { role: 'front' as const },
                        { type: 'separator' as const },
                        { role: 'window' as const },
                    ]
                    : [{ role: 'close' as const }]),
            ],
        },

        // Help menu
        {
            role: 'help' as const,
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        const { shell } = await import('electron');
                        await shell.openExternal('https://electronjs.org');
                    },
                },
                {
                    label: 'Documentation',
                    click: async () => {
                        const { shell } = await import('electron');
                        await shell.openExternal('https://electronjs.org/docs');
                    },
                },
                { type: 'separator' as const },
                {
                    label: 'Check for Updates...',
                    click: () => {
                        mainWindow?.webContents.send('menu:check-updates');
                    },
                },
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // ============================================
    // Context Menu Handler
    // ============================================

    ipcMain.handle('context-menu:show', (_, menuTemplate: MenuItemConstructorOptions[]) => {
        return new Promise((resolve) => {
            // Add click handlers that resolve the promise
            const processedTemplate = menuTemplate.map((item, index) => ({
                ...item,
                click: () => {
                    resolve({ selected: true, index, label: item.label });
                },
            }));

            const contextMenu = Menu.buildFromTemplate(processedTemplate);

            contextMenu.popup({
                window: mainWindow ?? undefined,
                callback: () => {
                    // Called when menu is closed without selection
                    resolve({ selected: false, index: -1, label: null });
                },
            });
        });
    });

    // Predefined context menus
    ipcMain.handle('context-menu:show-text-menu', () => {
        return new Promise((resolve) => {
            const template: MenuItemConstructorOptions[] = [
                {
                    label: 'Cut',
                    role: 'cut',
                    click: () => resolve({ action: 'cut' }),
                },
                {
                    label: 'Copy',
                    role: 'copy',
                    click: () => resolve({ action: 'copy' }),
                },
                {
                    label: 'Paste',
                    role: 'paste',
                    click: () => resolve({ action: 'paste' }),
                },
                { type: 'separator' },
                {
                    label: 'Select All',
                    role: 'selectAll',
                    click: () => resolve({ action: 'selectAll' }),
                },
            ];

            const contextMenu = Menu.buildFromTemplate(template);
            contextMenu.popup({
                window: mainWindow ?? undefined,
                callback: () => resolve({ action: null }),
            });
        });
    });

    ipcMain.handle('context-menu:show-custom', (_, items: string[]) => {
        return new Promise((resolve) => {
            const template: MenuItemConstructorOptions[] = items.map((label, index) => ({
                label,
                click: () => resolve({ selected: true, index, label }),
            }));

            const contextMenu = Menu.buildFromTemplate(template);
            contextMenu.popup({
                window: mainWindow ?? undefined,
                callback: () => resolve({ selected: false, index: -1, label: null }),
            });
        });
    });
}
