import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { serialPortManager } from './serial-port-manager'
import { fileLogger } from './file-logger'
import { commandStore, type SavedCommandData } from './command-store'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    show: false,
    minWidth: 900,
    minHeight: 670,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Give the serial port manager access to mainWindow for emitting events
  serialPortManager.setMainWindow(mainWindow)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Reload the app (used after config change)
ipcMain.handle('config:reload', () => {
  if (mainWindow) {
    mainWindow.reload()
  }
})

// ==================== App Info IPC Handlers ====================

ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})

ipcMain.handle('app:getInfo', () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromiumVersion: process.versions.chrome,
    platform: process.platform,
    arch: process.arch
  }
})

// ==================== Serial Port IPC Handlers ====================

ipcMain.handle('serial:listPorts', async () => {
  try {
    return await serialPortManager.listPorts()
  } catch (error) {
    console.error('Failed to list ports:', error)
    throw error
  }
})

ipcMain.handle(
  'serial:connect',
  async (_, path: string, options: { baudRate: number; dataBits: 5 | 6 | 7 | 8; stopBits: 1 | 2; parity: string }) => {
    try {
      await serialPortManager.connect(path, {
        baudRate: options.baudRate,
        dataBits: options.dataBits,
        stopBits: options.stopBits,
        parity: options.parity as 'none' | 'even' | 'odd' | 'mark' | 'space'
      })
      return { success: true }
    } catch (error) {
      console.error('Failed to connect:', error)
      throw error
    }
  }
)

ipcMain.handle('serial:disconnect', async () => {
  try {
    await serialPortManager.disconnect()
    return { success: true }
  } catch (error) {
    console.error('Failed to disconnect:', error)
    throw error
  }
})

ipcMain.handle(
  'serial:send',
  async (_, data: string, inputMode: 'text' | 'hex', lineEnding: 'none' | 'cr' | 'lf' | 'crlf') => {
    try {
      await serialPortManager.send(data, inputMode, lineEnding)
      return { success: true }
    } catch (error) {
      console.error('Failed to send data:', error)
      throw error
    }
  }
)

ipcMain.handle('serial:getStatus', () => {
  return serialPortManager.getStatus()
})

// ==================== File Logging IPC Handlers ====================

ipcMain.handle('serial:startLogging', async () => {
  if (!mainWindow) return { success: false, error: 'No window available' }

  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Serial Log File',
    defaultPath: `serial-log-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`,
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Log Files', extensions: ['log'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true }
  }

  fileLogger.startLogging(result.filePath)
  return { success: true, filePath: result.filePath }
})

ipcMain.handle('serial:stopLogging', () => {
  fileLogger.stopLogging()
  return { success: true }
})

ipcMain.handle('serial:isLogging', () => {
  return fileLogger.isLogging()
})

ipcMain.handle(
  'serial:exportBuffer',
  async (_, lines: { timestamp: string; direction: 'rx' | 'tx'; data: string }[]) => {
    if (!mainWindow) return { success: false, error: 'No window available' }

    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Serial Monitor Buffer',
      defaultPath: `serial-export-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`,
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'Log Files', extensions: ['log'] },
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true }
    }

    try {
      await fileLogger.exportBuffer(result.filePath, lines)
      return { success: true, filePath: result.filePath }
    } catch (error) {
      console.error('Failed to export buffer:', error)
      throw error
    }
  }
)

// Hook into serial data events for real-time file logging
ipcMain.on('serial:logLine', (_, timestamp: string, direction: 'rx' | 'tx', data: string) => {
  if (fileLogger.isLogging()) {
    fileLogger.appendLine(timestamp, direction, data)
  }
})

// ==================== Command Store IPC Handlers ====================

ipcMain.handle('commands:getAll', () => {
  return commandStore.getAll()
})

ipcMain.handle('commands:add', (_, cmd: SavedCommandData) => {
  return commandStore.add(cmd)
})

ipcMain.handle('commands:update', (_, cmd: SavedCommandData) => {
  return commandStore.update(cmd)
})

ipcMain.handle('commands:delete', (_, id: string) => {
  return commandStore.delete(id)
})

ipcMain.handle('commands:sendOnce', async (_, id: string) => {
  const cmd = commandStore.getAll().find((c) => c.id === id)
  if (!cmd) throw new Error('Command not found')

  await serialPortManager.send(cmd.command, cmd.format, cmd.lineEnding)
  return { success: true }
})

ipcMain.handle('commands:startRepeat', async (_, id: string) => {
  const cmd = commandStore.getAll().find((c) => c.id === id)
  if (!cmd) throw new Error('Command not found')
  if (!cmd.repeatInterval || cmd.repeatInterval <= 0) {
    throw new Error('Command has no repeat interval configured')
  }

  commandStore.startRepeat(id, () => {
    serialPortManager.send(cmd.command, cmd.format, cmd.lineEnding).catch((err) => {
      console.error(`Auto-send failed for command "${cmd.name}":`, err)
      commandStore.stopRepeat(id)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('commands:repeatStopped', id, err.message)
      }
    })
  })

  return { success: true }
})

ipcMain.handle('commands:stopRepeat', (_, id: string) => {
  commandStore.stopRepeat(id)
  return { success: true }
})

ipcMain.handle('commands:getActiveRepeats', () => {
  return commandStore.getActiveRepeats()
})

// ==================== App Lifecycle ====================

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.jigo.hardware-debug-tool')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // Cleanup serial port, logger, and command timers on exit
  commandStore.stopAllRepeats()
  serialPortManager.destroy()
  if (fileLogger.isLogging()) {
    fileLogger.stopLogging()
  }

  if (process.platform !== 'darwin') {
    app.quit()
  }
})
