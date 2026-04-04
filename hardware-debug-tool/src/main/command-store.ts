// eslint-disable-next-line @typescript-eslint/no-require-imports
const Store = require('electron-store').default || require('electron-store')

export interface SavedCommandData {
  id: string
  name: string
  command: string
  format: 'text' | 'hex'
  lineEnding: 'none' | 'cr' | 'lf' | 'crlf'
  repeatInterval: number | null
}


export class CommandStore {
  private store: typeof Store
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map()
  private activeRepeats: Set<string> = new Set()

  constructor() {
    this.store = new Store({
      name: 'serial-commands',
      defaults: {
        savedCommands: []
      }
    })
  }

  getAll(): SavedCommandData[] {
    return (this.store as any).get('savedCommands', []) as SavedCommandData[]
  }

  private saveAll(commands: SavedCommandData[]): void {
    (this.store as any).set('savedCommands', commands)
  }

  add(cmd: SavedCommandData): SavedCommandData[] {
    const commands = this.getAll()
    commands.push(cmd)
    this.saveAll(commands)
    return commands
  }

  update(cmd: SavedCommandData): SavedCommandData[] {
    const commands = this.getAll()
    const index = commands.findIndex((c) => c.id === cmd.id)
    if (index !== -1) {
      commands[index] = cmd
      this.saveAll(commands)
    }
    return commands
  }

  delete(id: string): SavedCommandData[] {
    // Stop any active repeat for this command
    this.stopRepeat(id)

    const commands = this.getAll().filter((c) => c.id !== id)
    this.saveAll(commands)
    return commands
  }

  startRepeat(id: string, sendFn: () => void): void {
    // Stop existing timer if any
    this.stopRepeat(id)

    const cmd = this.getAll().find((c) => c.id === id)
    if (!cmd || !cmd.repeatInterval || cmd.repeatInterval <= 0) return

    const intervalMs = cmd.repeatInterval * 1000

    // Send immediately on start
    sendFn()

    // Then repeat at interval
    const timer = setInterval(() => {
      sendFn()
    }, intervalMs)

    this.timers.set(id, timer)
    this.activeRepeats.add(id)
  }

  stopRepeat(id: string): void {
    const timer = this.timers.get(id)
    if (timer) {
      clearInterval(timer)
      this.timers.delete(id)
    }
    this.activeRepeats.delete(id)
  }

  stopAllRepeats(): void {
    this.timers.forEach((timer) => clearInterval(timer))
    this.timers.clear()
    this.activeRepeats.clear()
  }

  isRepeating(id: string): boolean {
    return this.activeRepeats.has(id)
  }

  getActiveRepeats(): string[] {
    return Array.from(this.activeRepeats)
  }
}

// Singleton instance
export const commandStore = new CommandStore()
