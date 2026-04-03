import { useState, useEffect, useCallback } from 'react'
import type { SavedCommand } from '../types/serial'

export interface UseCommandStoreReturn {
  commands: SavedCommand[]
  activeRepeats: string[]
  addCommand: (cmd: Omit<SavedCommand, 'id'>) => Promise<void>
  updateCommand: (cmd: SavedCommand) => Promise<void>
  deleteCommand: (id: string) => Promise<void>
  sendOnce: (id: string) => Promise<void>
  startRepeat: (id: string) => Promise<void>
  stopRepeat: (id: string) => Promise<void>
  loadCommands: () => Promise<void>
  error: string | null
  clearError: () => void
}

export function useCommandStore(): UseCommandStoreReturn {
  const [commands, setCommands] = useState<SavedCommand[]>([])
  const [activeRepeats, setActiveRepeats] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadCommands = useCallback(async () => {
    try {
      const data = await window.api.commands.getAll()
      setCommands(data)

      const repeats = await window.api.commands.getActiveRepeats()
      setActiveRepeats(repeats)
    } catch (err) {
      console.error('Failed to load commands:', err)
      setError(err instanceof Error ? err.message : 'Failed to load commands')
    }
  }, [])

  useEffect(() => {
    loadCommands()

    // Listen for background repeat stops (e.g. if auto-send fails because port disconnected)
    window.api.commands.onRepeatStopped((id, errMessage) => {
      setActiveRepeats((prev) => prev.filter((rid) => rid !== id))
      setError(`Auto-send stopped for a command: ${errMessage}`)
    })

    return () => {
      window.api.commands.removeRepeatStoppedListener()
    }
  }, [loadCommands])

  const addCommand = async (cmdData: Omit<SavedCommand, 'id'>): Promise<void> => {
    try {
      const newCmd: SavedCommand = {
        ...cmdData,
        id: crypto.randomUUID()
      }
      const updated = await window.api.commands.add(newCmd)
      setCommands(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add command')
      throw err
    }
  }

  const updateCommand = async (cmd: SavedCommand): Promise<void> => {
    try {
      const updated = await window.api.commands.update(cmd)
      setCommands(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update command')
      throw err
    }
  }

  const deleteCommand = async (id: string): Promise<void> => {
    try {
      const updated = await window.api.commands.delete(id)
      setCommands(updated)
      setActiveRepeats((prev) => prev.filter((rid) => rid !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete command')
      throw err
    }
  }

  const sendOnce = async (id: string): Promise<void> => {
    try {
      await window.api.commands.sendOnce(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send command')
      throw err
    }
  }

  const startRepeat = async (id: string): Promise<void> => {
    try {
      await window.api.commands.startRepeat(id)
      setActiveRepeats((prev) => [...prev, id])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start repeat')
      throw err
    }
  }

  const stopRepeat = async (id: string): Promise<void> => {
    try {
      await window.api.commands.stopRepeat(id)
      setActiveRepeats((prev) => prev.filter((rid) => rid !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop repeat')
      throw err
    }
  }

  return {
    commands,
    activeRepeats,
    addCommand,
    updateCommand,
    deleteCommand,
    sendOnce,
    startRepeat,
    stopRepeat,
    loadCommands,
    error,
    clearError: () => setError(null)
  }
}
