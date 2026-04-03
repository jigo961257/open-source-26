import { useState, useCallback, useEffect, useRef } from 'react'
import type {
  TerminalLine,
  SerialOptions,
  PortInfo,
  ViewMode,
  SendMode,
  LineEnding
} from '../types/serial'
import { DEFAULT_SERIAL_OPTIONS } from '../types/serial'

const MAX_BUFFER_LINES = 10000

export interface UseSerialMonitorReturn {
  // Connection state
  ports: PortInfo[]
  selectedPort: string
  setSelectedPort: (port: string) => void
  serialOptions: SerialOptions
  setSerialOptions: React.Dispatch<React.SetStateAction<SerialOptions>>
  isConnected: boolean
  isConnecting: boolean
  connectionError: string | null

  // Terminal state
  lines: TerminalLine[]
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  autoscroll: boolean
  setAutoscroll: (v: boolean) => void
  showTimestamps: boolean
  setShowTimestamps: (v: boolean) => void

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchVisible: boolean
  setSearchVisible: (v: boolean) => void
  searchMatchCount: number
  activeSearchIndex: number
  setActiveSearchIndex: (i: number) => void

  // Send bar
  sendMode: SendMode
  setSendMode: (m: SendMode) => void
  lineEnding: LineEnding
  setLineEnding: (le: LineEnding) => void
  commandHistory: string[]
  historyIndex: number
  setHistoryIndex: (i: number) => void

  // Counters
  rxBytes: number
  txBytes: number

  // Logging
  isLogging: boolean

  // Actions
  refreshPorts: () => Promise<void>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  sendData: (data: string) => Promise<void>
  clearTerminal: () => void
  startLogging: () => Promise<void>
  stopLogging: () => Promise<void>
  exportBuffer: () => Promise<void>
}

export function useSerialMonitor(): UseSerialMonitorReturn {
  // Connection state
  const [ports, setPorts] = useState<PortInfo[]>([])
  const [selectedPort, setSelectedPort] = useState<string>('')
  const [serialOptions, setSerialOptions] = useState<SerialOptions>(DEFAULT_SERIAL_OPTIONS)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Terminal state
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('ascii')
  const [autoscroll, setAutoscroll] = useState(true)
  const [showTimestamps, setShowTimestamps] = useState(true)

  // Search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchVisible, setSearchVisible] = useState(false)
  const [activeSearchIndex, setActiveSearchIndex] = useState(0)

  // Send bar
  const [sendMode, setSendMode] = useState<SendMode>('text')
  const [lineEnding, setLineEnding] = useState<LineEnding>('crlf')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Counters
  const [rxBytes, setRxBytes] = useState(0)
  const [txBytes, setTxBytes] = useState(0)

  // Logging
  const [isLogging, setIsLogging] = useState(false)

  // Ref to track logging state for the data listener
  const isLoggingRef = useRef(false)
  isLoggingRef.current = isLogging

  // Calculate search matches
  const searchMatchCount = searchQuery
    ? lines.filter(
        (line) =>
          line.data.toLowerCase().includes(searchQuery.toLowerCase()) ||
          line.hexData.toLowerCase().includes(searchQuery.toLowerCase())
      ).length
    : 0

  // Refresh available ports
  const refreshPorts = useCallback(async () => {
    try {
      const portList = await window.api.serial.listPorts()
      setPorts(portList)
    } catch (err) {
      console.error('Failed to list ports:', err)
    }
  }, [])

  // Connect to selected port
  const connect = useCallback(async () => {
    if (!selectedPort) {
      setConnectionError('Please select a port')
      return
    }

    setIsConnecting(true)
    setConnectionError(null)

    try {
      await window.api.serial.connect(selectedPort, serialOptions)
      setIsConnected(true)
      setRxBytes(0)
      setTxBytes(0)
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : 'Connection failed')
      setIsConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }, [selectedPort, serialOptions])

  // Disconnect
  const disconnect = useCallback(async () => {
    try {
      await window.api.serial.disconnect()
      setIsConnected(false)
    } catch (err) {
      console.error('Failed to disconnect:', err)
    }
  }, [])

  // Send data
  const sendData = useCallback(
    async (data: string) => {
      if (!data.trim()) return

      try {
        await window.api.serial.send(data, sendMode, lineEnding)

        // Add to command history
        setCommandHistory((prev) => {
          const updated = [data, ...prev.filter((c) => c !== data)].slice(0, 50)
          return updated
        })
        setHistoryIndex(-1)
      } catch (err) {
        console.error('Failed to send data:', err)
      }
    },
    [sendMode, lineEnding]
  )

  // Clear terminal
  const clearTerminal = useCallback(() => {
    setLines([])
    setRxBytes(0)
    setTxBytes(0)
  }, [])

  // Start real-time logging
  const startLogging = useCallback(async () => {
    try {
      const result = await window.api.serial.startLogging()
      if (result.success) {
        setIsLogging(true)
      }
    } catch (err) {
      console.error('Failed to start logging:', err)
    }
  }, [])

  // Stop logging
  const stopLogging = useCallback(async () => {
    try {
      await window.api.serial.stopLogging()
      setIsLogging(false)
    } catch (err) {
      console.error('Failed to stop logging:', err)
    }
  }, [])

  // Export buffer
  const exportBuffer = useCallback(async () => {
    try {
      const exportLines = lines.map((l) => ({
        timestamp: l.timestamp,
        direction: l.direction,
        data: l.data
      }))
      await window.api.serial.exportBuffer(exportLines)
    } catch (err) {
      console.error('Failed to export buffer:', err)
    }
  }, [lines])

  // Set up IPC event listeners
  useEffect(() => {
    // Listen for serial data
    window.api.serial.onData((data) => {
      const newLine: TerminalLine = {
        id: data.id,
        timestamp: data.timestamp,
        direction: data.direction,
        data: data.data,
        hexData: data.hexData
      }

      setLines((prev) => {
        const updated = [...prev, newLine]
        // Trim buffer if it exceeds max
        if (updated.length > MAX_BUFFER_LINES) {
          return updated.slice(updated.length - MAX_BUFFER_LINES)
        }
        return updated
      })

      // Update byte counters
      const byteCount = data.data.length
      if (data.direction === 'rx') {
        setRxBytes((prev) => prev + byteCount)
      } else {
        setTxBytes((prev) => prev + byteCount)
      }

      // Forward to file logger if logging is active
      if (isLoggingRef.current) {
        window.api.serial.logLine(data.timestamp, data.direction, data.data)
      }
    })

    // Listen for serial errors
    window.api.serial.onError((error) => {
      console.error('Serial error:', error)
      setConnectionError(error)
    })

    // Listen for status changes
    window.api.serial.onStatus((status) => {
      setIsConnected(status.connected)
      if (!status.connected) {
        setConnectionError(null)
      }
    })

    // Initial port scan
    refreshPorts()

    // Cleanup
    return () => {
      window.api.serial.removeAllListeners()
    }
  }, [refreshPorts])

  return {
    // Connection
    ports,
    selectedPort,
    setSelectedPort,
    serialOptions,
    setSerialOptions,
    isConnected,
    isConnecting,
    connectionError,

    // Terminal
    lines,
    viewMode,
    setViewMode,
    autoscroll,
    setAutoscroll,
    showTimestamps,
    setShowTimestamps,

    // Search
    searchQuery,
    setSearchQuery,
    searchVisible,
    setSearchVisible,
    searchMatchCount,
    activeSearchIndex,
    setActiveSearchIndex,

    // Send bar
    sendMode,
    setSendMode,
    lineEnding,
    setLineEnding,
    commandHistory,
    historyIndex,
    setHistoryIndex,

    // Counters
    rxBytes,
    txBytes,

    // Logging
    isLogging,

    // Actions
    refreshPorts,
    connect,
    disconnect,
    sendData,
    clearTerminal,
    startLogging,
    stopLogging,
    exportBuffer
  }
}
