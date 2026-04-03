import { useMemo } from 'react'

interface StatusBarProps {
  isConnected: boolean
  portPath: string | null
  baudRate: number | null
  rxBytes: number
  txBytes: number
  lineCount: number
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function StatusBar({
  isConnected,
  portPath,
  baudRate,
  rxBytes,
  txBytes,
  lineCount
}: StatusBarProps): React.JSX.Element {
  const connectionText = useMemo(() => {
    if (isConnected && portPath) {
      return `${portPath} @ ${baudRate?.toLocaleString()}`
    }
    return 'Disconnected'
  }, [isConnected, portPath, baudRate])

  return (
    <div className="flex items-center justify-between h-6 px-3 bg-[#0d1117] border-t border-border text-[11px] font-mono select-none">
      {/* Left: Connection status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-terminal-success status-dot-connected'
                : 'bg-terminal-danger'
            }`}
          />
          <span
            className={`${
              isConnected ? 'text-terminal-success' : 'text-muted-foreground'
            }`}
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {isConnected && portPath && (
          <>
            <span className="text-border">·</span>
            <span className="text-muted-foreground">{connectionText}</span>
          </>
        )}
      </div>

      {/* Right: Stats */}
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">
          Lines: <span className="text-foreground">{lineCount.toLocaleString()}</span>
        </span>
        <span className="text-border">│</span>
        <span className="text-muted-foreground">
          RX:{' '}
          <span className="text-terminal-rx">{formatBytes(rxBytes)}</span>
        </span>
        <span className="text-border">│</span>
        <span className="text-muted-foreground">
          TX:{' '}
          <span className="text-terminal-tx">{formatBytes(txBytes)}</span>
        </span>
      </div>
    </div>
  )
}
