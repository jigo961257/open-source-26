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

interface SerialDataEvent {
  id: string
  timestamp: string
  direction: 'rx' | 'tx'
  data: string
  hexData: string
}

interface SerialStatus {
  connected: boolean
  portPath: string | null
  baudRate: number | null
  rxBytes: number
  txBytes: number
}

interface PortInfo {
  path: string
  manufacturer?: string
  serialNumber?: string
  pnpId?: string
  vendorId?: string
  productId?: string
  friendlyName?: string
}

interface SerialAPI {
  listPorts: () => Promise<PortInfo[]>
  connect: (
    path: string,
    options: {
      baudRate: number
      dataBits: 5 | 6 | 7 | 8
      stopBits: 1 | 2
      parity: string
    }
  ) => Promise<{ success: boolean }>
  disconnect: () => Promise<{ success: boolean }>
  send: (
    data: string,
    inputMode: 'text' | 'hex',
    lineEnding: 'none' | 'cr' | 'lf' | 'crlf'
  ) => Promise<{ success: boolean }>
  getStatus: () => Promise<SerialStatus>

  onData: (callback: (data: SerialDataEvent) => void) => void
  onError: (callback: (error: string) => void) => void
  onStatus: (callback: (status: SerialStatus) => void) => void
  removeAllListeners: () => void

  startLogging: () => Promise<{ success: boolean; filePath?: string; canceled?: boolean }>
  stopLogging: () => Promise<{ success: boolean }>
  isLogging: () => Promise<boolean>
  exportBuffer: (
    lines: { timestamp: string; direction: 'rx' | 'tx'; data: string }[]
  ) => Promise<{ success: boolean; filePath?: string; canceled?: boolean }>
  logLine: (timestamp: string, direction: 'rx' | 'tx', data: string) => void
}

interface CommandsAPI {
  getAll: () => Promise<any[]>
  add: (cmd: any) => Promise<any[]>
  update: (cmd: any) => Promise<any[]>
  delete: (id: string) => Promise<any[]>
  sendOnce: (id: string) => Promise<{ success: boolean; error?: string }>
  startRepeat: (id: string) => Promise<{ success: boolean; error?: string }>
  stopRepeat: (id: string) => Promise<{ success: boolean }>
  getActiveRepeats: () => Promise<string[]>
  onRepeatStopped: (callback: (id: string, error: string) => void) => void
  removeRepeatStoppedListener: () => void
}

interface CustomAPI {
  // App Info APIs
  getAppVersion: () => Promise<string>
  getAppInfo: () => Promise<AppInfo>

  // Serial Port APIs
  serial: SerialAPI
  
  // Command Automation APIs
  commands: CommandsAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
