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
  }> => ipcRenderer.invoke('app:getInfo')
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

