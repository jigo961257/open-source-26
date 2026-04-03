import { ElectronAPI } from '@electron-toolkit/preload'

interface AppInfo {
  name: string
  version: string
  electronVersion: string
  nodeVersion: string
  chromiumVersion: string
  platform: string
  arch: string
}

interface CustomAPI {

  // App Info APIs
  getAppVersion: () => Promise<string>
  getAppInfo: () => Promise<AppInfo>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}

