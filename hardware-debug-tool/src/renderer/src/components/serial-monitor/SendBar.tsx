import { useState, useRef, useEffect } from 'react'
import { Send, ArrowUp, ArrowDown, TerminalSquare } from 'lucide-react'
import type { SendMode, LineEnding } from '../../types/serial'
import { LINE_ENDINGS } from '../../types/serial'
import type { UseCommandStoreReturn } from '../../hooks/useCommandStore'

interface SendBarProps {
  sendMode: SendMode
  onSendModeChange: (mode: SendMode) => void
  lineEnding: LineEnding
  onLineEndingChange: (le: LineEnding) => void
  isConnected: boolean
  onSend: (data: string) => void
  commandHistory: string[]
  historyIndex: number
  onHistoryIndexChange: (i: number) => void
  commandStore: UseCommandStoreReturn
}

export function SendBar({
  sendMode,
  onSendModeChange,
  lineEnding,
  onLineEndingChange,
  isConnected,
  onSend,
  commandHistory,
  historyIndex,
  onHistoryIndexChange,
  commandStore: store
}: SendBarProps): React.JSX.Element {
  const [input, setInput] = useState('')
  
  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteIndex, setAutocompleteIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter commands for autocomplete based on input text after '@'
  const filteredCommands = showAutocomplete && input.startsWith('@')
    ? store.commands.filter(cmd => 
        cmd.name.toLowerCase().includes(input.slice(1).toLowerCase()))
    : []

  useEffect(() => {
    // Reset index when query changes
    setAutocompleteIndex(0)
  }, [input])

  // Close popup if clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSend = (): void => {
    if (!input.trim() || !isConnected) return
    onSend(input)
    setInput('')
    setShowAutocomplete(false)
  }

  const handleAutocompleteSelect = (index: number): void => {
    const cmd = filteredCommands[index]
    if (cmd && isConnected) {
      // Send the command directly using the store IPC
      store.sendOnce(cmd.id).catch(console.error)
      setInput('')
      setShowAutocomplete(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (showAutocomplete && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setAutocompleteIndex((prev) => (prev + 1) % filteredCommands.length)
        return
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setAutocompleteIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
        return
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleAutocompleteSelect(autocompleteIndex)
        return
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setShowAutocomplete(false)
        return
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
      onHistoryIndexChange(newIndex)
      setInput(commandHistory[newIndex] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex <= 0) {
        onHistoryIndexChange(-1)
        setInput('')
      } else {
        const newIndex = historyIndex - 1
        onHistoryIndexChange(newIndex)
        setInput(commandHistory[newIndex] || '')
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value
    setInput(val)
    if (val.startsWith('@') && store.commands.length > 0) {
      setShowAutocomplete(true)
    } else {
      setShowAutocomplete(false)
    }
  }

  // Validate hex input format (skip validation if it's an @mention)
  const isValidHex = sendMode === 'hex' ? (input.startsWith('@') || /^([0-9A-Fa-f]{2}\s?)*$/.test(input.trim())) : true

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-card border-t border-border relative">
      {/* Send mode selector */}
      <select
        value={sendMode}
        onChange={(e) => onSendModeChange(e.target.value as SendMode)}
        className="h-8 px-2 rounded-md bg-secondary text-secondary-foreground text-xs border border-border focus:outline-none focus:ring-1 focus:ring-ring font-medium"
      >
        <option value="text">Text</option>
        <option value="hex">Hex</option>
      </select>

      {/* Input field wrapper */}
      <div className="flex-1 relative" ref={inputRef}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (input.startsWith('@') && store.commands.length > 0) {
              setShowAutocomplete(true)
            }
          }}
          disabled={!isConnected}
          placeholder={
            !isConnected
              ? 'Connect to a port first...'
              : sendMode === 'hex'
                ? 'Enter hex bytes or @command...'
                : 'Type command and press Enter (use @ for saved commands)...'
          }
          className={`w-full h-8 px-3 rounded-md bg-secondary text-foreground text-sm border focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40 disabled:cursor-not-allowed font-mono placeholder:text-muted-foreground/50 ${
            input.startsWith('@')
              ? 'text-primary'
              : sendMode === 'hex' && input && !isValidHex
                ? 'border-red-500/50 focus:ring-red-500/30'
                : 'border-border'
          }`}
        />
        
        {/* History indicator */}
        {commandHistory.length > 0 && isConnected && !input.startsWith('@') && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-muted-foreground/30 pointer-events-none">
            <ArrowUp className="w-3 h-3" />
            <ArrowDown className="w-3 h-3" />
          </div>
        )}

        {/* Autocomplete Popup */}
        {showAutocomplete && isConnected && filteredCommands.length > 0 && (
          <div className="absolute bottom-full left-0 w-full mb-1 bg-card border border-border rounded-md shadow-lg overflow-hidden z-50 max-h-[200px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-150">
            {filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                onClick={() => handleAutocompleteSelect(idx)}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between border-b border-border/50 last:border-0 ${
                  idx === autocompleteIndex ? 'bg-primary/20' : 'hover:bg-primary/10'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <TerminalSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="font-semibold text-primary">{cmd.name}</span>
                  <span className="text-muted-foreground font-mono text-xs truncate">- {cmd.command}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                    {cmd.format}
                  </span>
                  {idx === autocompleteIndex && (
                    <span className="text-[10px] text-muted-foreground/70">Press Enter</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!isConnected || !input.trim() || (!input.startsWith('@') && sendMode === 'hex' && !isValidHex)}
        className="h-8 px-3 flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Send className="w-3.5 h-3.5" />
        Send
      </button>

      {/* Line ending selector */}
      <select
        value={lineEnding}
        onChange={(e) => onLineEndingChange(e.target.value as LineEnding)}
        className="h-8 px-2 rounded-md bg-secondary text-secondary-foreground text-xs border border-border focus:outline-none focus:ring-1 focus:ring-ring font-mono"
        disabled={input.startsWith('@')}
      >
        {LINE_ENDINGS.map((le) => (
          <option key={le.value} value={le.value}>
            {le.label}
          </option>
        ))}
      </select>
    </div>
  )
}
