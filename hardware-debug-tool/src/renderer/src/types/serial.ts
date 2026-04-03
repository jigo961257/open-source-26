export interface TerminalLine {
  id: string
  timestamp: string // "HH:MM:SS.mmm"
  direction: 'rx' | 'tx'
  data: string // raw text data
  hexData: string // hex representation
}

export interface SerialOptions {
  baudRate: number
  dataBits: 5 | 6 | 7 | 8
  stopBits: 1 | 2
  parity: 'none' | 'even' | 'odd' | 'mark' | 'space'
}

export interface PortInfo {
  path: string
  manufacturer?: string
  serialNumber?: string
  pnpId?: string
  vendorId?: string
  productId?: string
  friendlyName?: string
}

export interface SerialStatus {
  connected: boolean
  portPath: string | null
  baudRate: number | null
  rxBytes: number
  txBytes: number
}

export type ViewMode = 'ascii' | 'hex' | 'split'
export type SendMode = 'text' | 'hex'
export type LineEnding = 'none' | 'cr' | 'lf' | 'crlf'

export const BAUD_RATES = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600] as const
export const DATA_BITS = [5, 6, 7, 8] as const
export const STOP_BITS = [1, 2] as const
export const PARITY_OPTIONS = ['none', 'even', 'odd', 'mark', 'space'] as const
export const LINE_ENDINGS: { label: string; value: LineEnding }[] = [
  { label: 'None', value: 'none' },
  { label: 'CR', value: 'cr' },
  { label: 'LF', value: 'lf' },
  { label: 'CR+LF', value: 'crlf' }
]

export const DEFAULT_SERIAL_OPTIONS: SerialOptions = {
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
}

export interface SavedCommand {
  id: string
  name: string
  command: string
  format: SendMode
  lineEnding: LineEnding
  repeatInterval: number | null // seconds, null = manual only
}
