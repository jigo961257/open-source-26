import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { SavedCommand, SendMode, LineEnding } from '../../types/serial'
import { LINE_ENDINGS } from '../../types/serial'

interface CommandFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: SavedCommand
  onSave: (cmd: Omit<SavedCommand, 'id'>) => void
}

export function CommandFormDialog({
  open,
  onOpenChange,
  initialData,
  onSave
}: CommandFormDialogProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [command, setCommand] = useState('')
  const [format, setFormat] = useState<SendMode>('text')
  const [lineEnding, setLineEnding] = useState<LineEnding>('crlf')
  const [repeatInterval, setRepeatInterval] = useState<string>('')

  // Reset or populate form when opened
  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name)
        setCommand(initialData.command)
        setFormat(initialData.format)
        setLineEnding(initialData.lineEnding)
        setRepeatInterval(initialData.repeatInterval?.toString() || '')
      } else {
        setName('')
        setCommand('')
        setFormat('text')
        setLineEnding('crlf')
        setRepeatInterval('')
      }
    }
  }, [open, initialData])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    const interval = parseFloat(repeatInterval)
    const validInterval = !isNaN(interval) && interval > 0 ? interval : null

    onSave({
      name: name.trim(),
      command: command.trim(),
      format,
      lineEnding,
      repeatInterval: validInterval
    })
    
    onOpenChange(false)
  }

  // Validate hex format
  const isHexFormat = format === 'hex'
  const isValidHex = isHexFormat ? /^([0-9A-Fa-f]{2}\s?)*$/.test(command.trim()) : true
  const isFormValid = name.trim() && command.trim() && (!isHexFormat || isValidHex)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg text-foreground">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              {initialData ? 'Edit Command' : 'New Command'}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground mt-1.5">
              Create a custom command that can be sent manually or on a repeatable timer.
            </Dialog.Description>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="cmd-name" className="text-sm font-medium leading-none">
                Command Name <span className="text-red-500">*</span>
              </label>
              <input
                id="cmd-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Turn LED On"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">
                  Format & Line Ending
                </label>
              </div>
              <div className="flex gap-2">
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as SendMode)}
                  className="flex h-9 w-1/3 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="text">Text</option>
                  <option value="hex">Hex</option>
                </select>
                <select
                  value={lineEnding}
                  onChange={(e) => setLineEnding(e.target.value as LineEnding)}
                  className="flex h-9 w-2/3 rounded-md border border-input bg-transparent px-3 py-1 text-sm font-mono shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  disabled={format === 'hex'}
                >
                  {LINE_ENDINGS.map((le) => (
                    <option key={le.value} value={le.value}>
                      {le.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="cmd-data" className="text-sm font-medium leading-none">
                  Command Data <span className="text-red-500">*</span>
                </label>
                {isHexFormat && !isValidHex && command && (
                  <span className="text-xs text-red-500">Invalid hex format</span>
                )}
              </div>
              <textarea
                id="cmd-data"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={isHexFormat ? 'e.g. 48 65 6C 6C 6F' : 'Type command here...'}
                className={`flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 min-h-[80px] font-mono resize-none ${
                  isHexFormat && !isValidHex && command
                    ? 'border-red-500/50 focus-visible:ring-red-500/50'
                    : 'border-input focus-visible:ring-ring'
                }`}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="cmd-interval" className="text-sm font-medium leading-none flex items-center gap-2">
                Auto-repeat Interval
                <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </label>
              <div className="relative">
                <input
                  id="cmd-interval"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={repeatInterval}
                  onChange={(e) => setRepeatInterval(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-3 pr-16 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  seconds
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground">
                Leave empty for manual send only. Minimum interval is 0.1s.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={!isFormValid}
                className="h-9 px-4 py-2 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </form>

          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
