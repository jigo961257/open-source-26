import { createWriteStream, WriteStream } from 'fs'

export class FileLogger {
  private stream: WriteStream | null = null
  private _isLogging: boolean = false
  private filePath: string | null = null

  startLogging(filePath: string): void {
    if (this._isLogging && this.stream) {
      this.stopLogging()
    }

    this.filePath = filePath
    this.stream = createWriteStream(filePath, { flags: 'a', encoding: 'utf-8' })
    this._isLogging = true

    // Write header
    const header = `--- Serial Monitor Log Started: ${new Date().toISOString()} ---\n`
    this.stream.write(header)

    console.log(`File logging started: ${filePath}`)
  }

  stopLogging(): void {
    if (this.stream) {
      const footer = `--- Serial Monitor Log Ended: ${new Date().toISOString()} ---\n`
      this.stream.write(footer)
      this.stream.end()
      this.stream = null
    }
    this._isLogging = false
    console.log('File logging stopped')
  }

  appendLine(timestamp: string, direction: 'rx' | 'tx', data: string): void {
    if (!this._isLogging || !this.stream) return

    const dirIndicator = direction === 'rx' ? '<<' : '>>'
    const line = `[${timestamp}] ${dirIndicator} ${data}\n`
    this.stream.write(line)
  }

  isLogging(): boolean {
    return this._isLogging
  }

  getFilePath(): string | null {
    return this.filePath
  }

  async exportBuffer(
    filePath: string,
    lines: { timestamp: string; direction: 'rx' | 'tx'; data: string }[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = createWriteStream(filePath, { flags: 'w', encoding: 'utf-8' })

      stream.write(`--- Serial Monitor Export: ${new Date().toISOString()} ---\n`)
      stream.write(`--- Total lines: ${lines.length} ---\n\n`)

      for (const line of lines) {
        const dirIndicator = line.direction === 'rx' ? '<<' : '>>'
        stream.write(`[${line.timestamp}] ${dirIndicator} ${line.data}\n`)
      }

      stream.end()
      stream.on('finish', resolve)
      stream.on('error', reject)
    })
  }
}

// Singleton instance
export const fileLogger = new FileLogger()
