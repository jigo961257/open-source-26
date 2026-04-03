import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // ==================== App Info APIs ====================
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
  getAppInfo: (): Promise<{
    name: string
    version: string
    electronVersion: string
    nodeVersion: string
    chromiumVersion: string
    platform: string
    arch: string
  }> => ipcRenderer.invoke('app:getInfo'),

  // ==================== Serial Port APIs ====================
  serial: {
    listPorts: (): Promise<
      {
        path: string
        manufacturer?: string
        serialNumber?: string
        pnpId?: string
        vendorId?: string
        productId?: string
        friendlyName?: string
      }[]
    > => ipcRenderer.invoke('serial:listPorts'),

    connect: (
      path: string,
      options: {
        baudRate: number
        dataBits: 5 | 6 | 7 | 8
        stopBits: 1 | 2
        parity: string
      }
    ): Promise<{ success: boolean }> => ipcRenderer.invoke('serial:connect', path, options),

    disconnect: (): Promise<{ success: boolean }> => ipcRenderer.invoke('serial:disconnect'),

    send: (
      data: string,
      inputMode: 'text' | 'hex',
      lineEnding: 'none' | 'cr' | 'lf' | 'crlf'
    ): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('serial:send', data, inputMode, lineEnding),

    getStatus: (): Promise<{
      connected: boolean
      portPath: string | null
      baudRate: number | null
      rxBytes: number
      txBytes: number
    }> => ipcRenderer.invoke('serial:getStatus'),

    // Event listeners (main → renderer)
    onData: (
      callback: (data: {
        id: string
        timestamp: string
        direction: 'rx' | 'tx'
        data: string
        hexData: string
      }) => void
    ): void => {
      ipcRenderer.on('serial:data', (_, data) => callback(data))
    },

    onError: (callback: (error: string) => void): void => {
      ipcRenderer.on('serial:error', (_, error) => callback(error))
    },

    onStatus: (
      callback: (status: {
        connected: boolean
        portPath: string | null
        baudRate: number | null
        rxBytes: number
        txBytes: number
      }) => void
    ): void => {
      ipcRenderer.on('serial:status', (_, status) => callback(status))
    },

    removeAllListeners: (): void => {
      ipcRenderer.removeAllListeners('serial:data')
      ipcRenderer.removeAllListeners('serial:error')
      ipcRenderer.removeAllListeners('serial:status')
    },

    // Real-time file logging
    startLogging: (): Promise<{ success: boolean; filePath?: string; canceled?: boolean }> =>
      ipcRenderer.invoke('serial:startLogging'),

    stopLogging: (): Promise<{ success: boolean }> => ipcRenderer.invoke('serial:stopLogging'),

    isLogging: (): Promise<boolean> => ipcRenderer.invoke('serial:isLogging'),

    // Export buffer
    exportBuffer: (
      lines: { timestamp: string; direction: 'rx' | 'tx'; data: string }[]
    ): Promise<{ success: boolean; filePath?: string; canceled?: boolean }> =>
      ipcRenderer.invoke('serial:exportBuffer', lines),

    // Log line (renderer → main for real-time file logging)
    logLine: (timestamp: string, direction: 'rx' | 'tx', data: string): void => {
      ipcRenderer.send('serial:logLine', timestamp, direction, data)
    }
  },

  // ==================== Command Store APIs ====================
  commands: {
    getAll: (): Promise<any[]> => ipcRenderer.invoke('commands:getAll'),
    add: (cmd: any): Promise<any[]> => ipcRenderer.invoke('commands:add', cmd),
    update: (cmd: any): Promise<any[]> => ipcRenderer.invoke('commands:update', cmd),
    delete: (id: string): Promise<any[]> => ipcRenderer.invoke('commands:delete', id),
    sendOnce: (id: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('commands:sendOnce', id),
    startRepeat: (id: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('commands:startRepeat', id),
    stopRepeat: (id: string): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('commands:stopRepeat', id),
    getActiveRepeats: (): Promise<string[]> => ipcRenderer.invoke('commands:getActiveRepeats'),
    onRepeatStopped: (callback: (id: string, error: string) => void): void => {
      ipcRenderer.on('commands:repeatStopped', (_, id, error) => callback(id, error))
    },
    removeRepeatStoppedListener: (): void => {
      ipcRenderer.removeAllListeners('commands:repeatStopped')
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
