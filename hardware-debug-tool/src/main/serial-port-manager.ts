import { SerialPort } from 'serialport'
import { BrowserWindow } from 'electron'

export interface SerialPortOptions {
  baudRate: number
  dataBits: 5 | 6 | 7 | 8
  stopBits: 1 | 2
  parity: 'none' | 'even' | 'odd' | 'mark' | 'space'
}

export interface PortInfoResult {
  path: string
  manufacturer?: string
  serialNumber?: string
  pnpId?: string
  vendorId?: string
  productId?: string
  friendlyName?: string
}

function formatTimestamp(): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  const ms = String(now.getMilliseconds()).padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}

function toHexString(data: Buffer | string): string {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8')
  return Array.from(buf)
    .map((byte) => byte.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ')
}

// Convert raw buffer to a printable ASCII string (replace non-printable bytes with '.')
function toPrintableAscii(buf: Buffer): string {
  return Array.from(buf)
    .map((byte) => (byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : '.'))
    .join('')
}

export class SerialPortManager {
  private port: SerialPort | null = null
  private mainWindow: BrowserWindow | null = null

  private _rxBytes: number = 0
  private _txBytes: number = 0
  private _portPath: string | null = null
  private _baudRate: number | null = null

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window
  }

  private emit(channel: string, ...args: unknown[]): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args)
    }
  }

  async listPorts(): Promise<PortInfoResult[]> {
    const ports = await SerialPort.list()
    return ports.map((p) => ({
      path: p.path,
      manufacturer: p.manufacturer,
      serialNumber: p.serialNumber,
      pnpId: p.pnpId,
      vendorId: p.vendorId,
      productId: p.productId,
      // @ts-ignore
      friendlyName: p.friendlyName
    }))
  }

  async connect(path: string, options: SerialPortOptions): Promise<void> {
    // Disconnect first if already connected
    if (this.port && this.port.isOpen) {
      await this.disconnect()
    }

    return new Promise((resolve, reject) => {
      this.port = new SerialPort(
        {
          path,
          baudRate: options.baudRate,
          dataBits: options.dataBits,
          stopBits: options.stopBits,
          parity: options.parity,
          autoOpen: false
        }
      )

      // Listen for raw data directly — works for both binary and text protocols
      this.port.on('data', (chunk: Buffer) => {
        this._rxBytes += chunk.length

        this.emit('serial:data', {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: formatTimestamp(),
          direction: 'rx',
          data: toPrintableAscii(chunk),
          hexData: toHexString(chunk)
        })
      })

      // Handle raw data for byte counting when no newline parser is used
      this.port.on('error', (err) => {
        console.error('Serial port error:', err.message)
        this.emit('serial:error', err.message)
      })

      this.port.on('close', () => {
        console.log('Serial port closed')
        this._portPath = null
        this._baudRate = null
        this.emit('serial:status', {
          connected: false,
          portPath: null,
          baudRate: null,
          rxBytes: this._rxBytes,
          txBytes: this._txBytes
        })
      })

      this.port.open((err) => {
        if (err) {
          console.error('Failed to open serial port:', err.message)
          reject(new Error(`Failed to open port: ${err.message}`))
          return
        }

        this._portPath = path
        this._baudRate = options.baudRate
        this._rxBytes = 0
        this._txBytes = 0

        console.log(`Serial port opened: ${path} @ ${options.baudRate}`)

        this.emit('serial:status', {
          connected: true,
          portPath: path,
          baudRate: options.baudRate,
          rxBytes: 0,
          txBytes: 0
        })

        resolve()
      })
    })
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.port || !this.port.isOpen) {
        resolve()
        return
      }

      this.port.close((err) => {
        if (err) {
          reject(new Error(`Failed to close port: ${err.message}`))
          return
        }
        this.port = null
        resolve()
      })
    })
  }

  async send(
    data: string,
    inputMode: 'text' | 'hex',
    lineEnding: 'none' | 'cr' | 'lf' | 'crlf'
  ): Promise<void> {
    if (!this.port || !this.port.isOpen) {
      throw new Error('Serial port is not connected')
    }

    let buffer: Buffer

    if (inputMode === 'hex') {
      // Parse hex string like "48 65 6C 6C 6F" to bytes
      const hexStr = data.replace(/\s+/g, '')
      if (!/^[0-9A-Fa-f]*$/.test(hexStr) || hexStr.length % 2 !== 0) {
        throw new Error('Invalid hex string. Use format like: 48 65 6C 6C 6F')
      }
      buffer = Buffer.from(hexStr, 'hex')
    } else {
      // Text mode
      let suffix = ''
      switch (lineEnding) {
        case 'cr':
          suffix = '\r'
          break
        case 'lf':
          suffix = '\n'
          break
        case 'crlf':
          suffix = '\r\n'
          break
        case 'none':
        default:
          suffix = ''
          break
      }
      buffer = Buffer.from(data + suffix, 'utf-8')
    }

    return new Promise((resolve, reject) => {
      this.port!.write(buffer, (err) => {
        if (err) {
          reject(new Error(`Failed to send data: ${err.message}`))
          return
        }

        this._txBytes += buffer.length

        // Emit the sent data back to renderer for display
        this.emit('serial:data', {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: formatTimestamp(),
          direction: 'tx',
          data: inputMode === 'hex' ? data : data,
          hexData: toHexString(buffer)
        })

        resolve()
      })
    })
  }

  isConnected(): boolean {
    return this.port !== null && this.port.isOpen
  }

  getStatus(): {
    connected: boolean
    portPath: string | null
    baudRate: number | null
    rxBytes: number
    txBytes: number
  } {
    return {
      connected: this.isConnected(),
      portPath: this._portPath,
      baudRate: this._baudRate,
      rxBytes: this._rxBytes,
      txBytes: this._txBytes
    }
  }

  destroy(): void {
    if (this.port && this.port.isOpen) {
      this.port.close()
    }
    this.port = null
  }
}

// Singleton instance
export const serialPortManager = new SerialPortManager()
