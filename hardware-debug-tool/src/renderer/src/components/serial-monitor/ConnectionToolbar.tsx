import { RefreshCw, Plug, Unplug, Loader2 } from 'lucide-react'
import type { SerialOptions, PortInfo } from '../../types/serial'
import { BAUD_RATES, DATA_BITS, STOP_BITS, PARITY_OPTIONS } from '../../types/serial'

interface ConnectionToolbarProps {
  ports: PortInfo[]
  selectedPort: string
  onSelectPort: (port: string) => void
  serialOptions: SerialOptions
  onOptionsChange: React.Dispatch<React.SetStateAction<SerialOptions>>
  isConnected: boolean
  isConnecting: boolean
  connectionError: string | null
  onConnect: () => void
  onDisconnect: () => void
  onRefreshPorts: () => void
}

export function ConnectionToolbar({
  ports,
  selectedPort,
  onSelectPort,
  serialOptions,
  onOptionsChange,
  isConnected,
  isConnecting,
  connectionError,
  onConnect,
  onDisconnect,
  onRefreshPorts
}: ConnectionToolbarProps): React.JSX.Element {
  const disabled = isConnected || isConnecting

  return (
    <div className="flex flex-col gap-1 px-3 py-2 bg-card border-b border-border">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Port selector */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Port
          </label>
          <select
            value={selectedPort}
            onChange={(e) => onSelectPort(e.target.value)}
            disabled={disabled}
            className="h-8 px-2 min-w-[180px] rounded-md bg-secondary text-secondary-foreground text-sm border border-border focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 font-mono"
          >
            <option value="">Select Port</option>
            {ports.map((port) => (
              <option key={port.path} value={port.path}>
                {port.path}
                {port.manufacturer ? ` (${port.manufacturer})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh ports button */}
        <button
          onClick={onRefreshPorts}
          disabled={disabled}
          className="h-8 w-8 mt-auto flex items-center justify-center rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 border border-border"
          title="Refresh Ports"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-10 bg-border mt-auto mb-0 mx-1" />

        {/* Baud Rate */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Baud Rate
          </label>
          <select
            value={serialOptions.baudRate}
            onChange={(e) =>
              onOptionsChange((prev) => ({ ...prev, baudRate: Number(e.target.value) }))
            }
            disabled={disabled}
            className="h-8 px-2 rounded-md bg-secondary text-secondary-foreground text-sm border border-border focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 font-mono"
          >
            {BAUD_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        {/* Data Bits */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Data Bits
          </label>
          <select
            value={serialOptions.dataBits}
            onChange={(e) =>
              onOptionsChange((prev) => ({
                ...prev,
                dataBits: Number(e.target.value) as 5 | 6 | 7 | 8
              }))
            }
            disabled={disabled}
            className="h-8 px-2 rounded-md bg-secondary text-secondary-foreground text-sm border border-border focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 font-mono"
          >
            {DATA_BITS.map((bits) => (
              <option key={bits} value={bits}>
                {bits}
              </option>
            ))}
          </select>
        </div>

        {/* Stop Bits */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Stop Bits
          </label>
          <select
            value={serialOptions.stopBits}
            onChange={(e) =>
              onOptionsChange((prev) => ({
                ...prev,
                stopBits: Number(e.target.value) as 1 | 2
              }))
            }
            disabled={disabled}
            className="h-8 px-2 rounded-md bg-secondary text-secondary-foreground text-sm border border-border focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 font-mono"
          >
            {STOP_BITS.map((bits) => (
              <option key={bits} value={bits}>
                {bits}
              </option>
            ))}
          </select>
        </div>

        {/* Parity */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Parity
          </label>
          <select
            value={serialOptions.parity}
            onChange={(e) =>
              onOptionsChange((prev) => ({
                ...prev,
                parity: e.target.value as SerialOptions['parity']
              }))
            }
            disabled={disabled}
            className="h-8 px-2 rounded-md bg-secondary text-secondary-foreground text-sm border border-border focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 font-mono capitalize"
          >
            {PARITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-border mt-auto mb-0 mx-1" />

        {/* Connect / Disconnect button */}
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="h-8 mt-auto px-4 flex items-center gap-2 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition-all text-sm font-medium disconnect-glow"
          >
            {isConnecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Unplug className="w-3.5 h-3.5" />
            )}
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting || !selectedPort}
            className="h-8 mt-auto px-4 flex items-center gap-2 rounded-md bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed connect-glow"
          >
            {isConnecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plug className="w-3.5 h-3.5" />
            )}
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </div>

      {/* Connection error message */}
      {connectionError && (
        <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
          ⚠ {connectionError}
        </div>
      )}
    </div>
  )
}
