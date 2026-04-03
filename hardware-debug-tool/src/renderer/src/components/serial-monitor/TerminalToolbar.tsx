import {
  Trash2,
  FileText,
  Download,
  Search,
  Eye,
  Columns2,
  AlignLeft,
  TerminalSquare,
  Binary
} from 'lucide-react'
import type { ViewMode } from '../../types/serial'

interface TerminalToolbarProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  showTimestamps: boolean
  onShowTimestampsChange: (v: boolean) => void
  autoscroll: boolean
  onAutoscrollChange: (v: boolean) => void
  isLogging: boolean
  onStartLogging: () => void
  onStopLogging: () => void
  onExportBuffer: () => void
  onClearTerminal: () => void
  searchVisible: boolean
  onSearchVisibleChange: (v: boolean) => void
  commandsVisible: boolean
  onCommandsVisibleChange: (v: boolean) => void
  lineCount: number
}

export function TerminalToolbar({
  viewMode,
  onViewModeChange,
  showTimestamps,
  onShowTimestampsChange,
  autoscroll,
  onAutoscrollChange,
  isLogging,
  onStartLogging,
  onStopLogging,
  onExportBuffer,
  onClearTerminal,
  searchVisible,
  onSearchVisibleChange,
  commandsVisible,
  onCommandsVisibleChange,
  lineCount
}: TerminalToolbarProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-[#161b22] border-b border-border">
      {/* Left group: Actions */}
      <div className="flex items-center gap-1">
        {/* Clear Terminal */}
        <button
          onClick={onClearTerminal}
          className="h-7 px-2.5 flex items-center gap-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Clear Terminal"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>

        {/* Log to File */}
        <button
          onClick={isLogging ? onStopLogging : onStartLogging}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded text-xs transition-colors ${
            isLogging
              ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
          title={isLogging ? 'Stop Logging' : 'Log to File'}
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isLogging ? 'Stop Log' : 'Log to File'}</span>
          {isLogging && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 status-dot-connected" />
          )}
        </button>

        {/* Save/Export */}
        <button
          onClick={onExportBuffer}
          disabled={lineCount === 0}
          className="h-7 px-2.5 flex items-center gap-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
          title="Export Buffer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Search */}
        <button
          onClick={() => onSearchVisibleChange(!searchVisible)}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded text-xs transition-colors ${
            searchVisible
              ? 'text-primary bg-primary/10 border border-primary/30'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
          title="Search (Ctrl+F)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right group: Display options & Panels */}
      <div className="flex items-center gap-1">
        {/* Commands Panel Toggle */}
        <button
          onClick={() => onCommandsVisibleChange(!commandsVisible)}
          className={`h-7 px-2 flex items-center gap-1.5 rounded text-xs transition-colors ${
            commandsVisible
              ? 'text-primary bg-primary/10 border border-primary/30'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
          title="Toggle Commands Panel"
        >
          <TerminalSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Commands</span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* Timestamps toggle */}
        <button
          onClick={() => onShowTimestampsChange(!showTimestamps)}
          className={`h-7 px-2 flex items-center gap-1.5 rounded text-xs transition-colors ${
            showTimestamps
              ? 'text-terminal-timestamp bg-terminal-timestamp/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
          title="Toggle Timestamps"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Time</span>
        </button>

        {/* Autoscroll toggle */}
        <button
          onClick={() => onAutoscrollChange(!autoscroll)}
          className={`h-7 px-2 flex items-center gap-1.5 rounded text-xs transition-colors ${
            autoscroll
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
          title="Toggle Autoscroll"
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Auto↓</span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* View mode segmented control */}
        <div className="flex items-center bg-secondary rounded-md border border-border p-0.5">
          <button
            onClick={() => onViewModeChange('ascii')}
            className={`h-6 px-2 rounded text-xs font-medium transition-colors ${
              viewMode === 'ascii'
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="ASCII View"
          >
            <span className="flex items-center gap-1">
              <AlignLeft className="w-3 h-3" />
              ASCII
            </span>
          </button>
          <button
            onClick={() => onViewModeChange('hex')}
            className={`h-6 px-2 rounded text-xs font-medium transition-colors ${
              viewMode === 'hex'
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Hex View"
          >
            <span className="flex items-center gap-1">
              <Binary className="w-3 h-3" />
              HEX
            </span>
          </button>
          <button
            onClick={() => onViewModeChange('split')}
            className={`h-6 px-2 rounded text-xs font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Split View (Hex + ASCII)"
          >
            <span className="flex items-center gap-1">
              <Columns2 className="w-3 h-3" />
              Split
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
