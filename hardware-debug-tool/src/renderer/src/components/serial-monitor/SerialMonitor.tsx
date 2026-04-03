import { useState, useEffect } from 'react'
import { useSerialMonitor } from '../../hooks/useSerialMonitor'
import { useCommandStore } from '../../hooks/useCommandStore'
import { ConnectionToolbar } from './ConnectionToolbar'
import { TerminalToolbar } from './TerminalToolbar'
import { SearchBar } from './SearchBar'
import { TerminalView } from './TerminalView'
import { SendBar } from './SendBar'
import { StatusBar } from './StatusBar'
import { CommandPanel } from './CommandPanel'

export function SerialMonitor(): React.JSX.Element {
  const monitor = useSerialMonitor()
  const commandStore = useCommandStore()
  const [commandsVisible, setCommandsVisible] = useState(false)

  // Ctrl+F to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        monitor.setSearchVisible(!monitor.searchVisible)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [monitor.searchVisible, monitor.setSearchVisible])

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Connection settings toolbar */}
      <ConnectionToolbar
        ports={monitor.ports}
        selectedPort={monitor.selectedPort}
        onSelectPort={monitor.setSelectedPort}
        serialOptions={monitor.serialOptions}
        onOptionsChange={monitor.setSerialOptions}
        isConnected={monitor.isConnected}
        isConnecting={monitor.isConnecting}
        connectionError={monitor.connectionError}
        onConnect={monitor.connect}
        onDisconnect={monitor.disconnect}
        onRefreshPorts={monitor.refreshPorts}
      />

      {/* Terminal toolbar (clear, log, export, search, view mode) */}
      <TerminalToolbar
        viewMode={monitor.viewMode}
        onViewModeChange={monitor.setViewMode}
        showTimestamps={monitor.showTimestamps}
        onShowTimestampsChange={monitor.setShowTimestamps}
        autoscroll={monitor.autoscroll}
        onAutoscrollChange={monitor.setAutoscroll}
        isLogging={monitor.isLogging}
        onStartLogging={monitor.startLogging}
        onStopLogging={monitor.stopLogging}
        onExportBuffer={monitor.exportBuffer}
        onClearTerminal={monitor.clearTerminal}
        searchVisible={monitor.searchVisible}
        onSearchVisibleChange={monitor.setSearchVisible}
        commandsVisible={commandsVisible}
        onCommandsVisibleChange={setCommandsVisible}
        lineCount={monitor.lines.length}
      />

      {/* Main content area (Terminal + Sidebar) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left side: Terminal + Search + Send */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search bar (conditionally visible) */}
          {monitor.searchVisible && (
            <SearchBar
              searchQuery={monitor.searchQuery}
              onSearchQueryChange={monitor.setSearchQuery}
              matchCount={monitor.searchMatchCount}
              activeIndex={monitor.activeSearchIndex}
              onActiveIndexChange={monitor.setActiveSearchIndex}
              onClose={() => {
                monitor.setSearchVisible(false)
                monitor.setSearchQuery('')
              }}
            />
          )}

          {/* Main terminal area */}
          <TerminalView
            lines={monitor.lines}
            viewMode={monitor.viewMode}
            showTimestamps={monitor.showTimestamps}
            autoscroll={monitor.autoscroll}
            searchQuery={monitor.searchQuery}
            activeSearchIndex={monitor.activeSearchIndex}
          />

          {/* Send bar */}
          <SendBar
            sendMode={monitor.sendMode}
            onSendModeChange={monitor.setSendMode}
            lineEnding={monitor.lineEnding}
            onLineEndingChange={monitor.setLineEnding}
            isConnected={monitor.isConnected}
            onSend={monitor.sendData}
            commandHistory={monitor.commandHistory}
            historyIndex={monitor.historyIndex}
            onHistoryIndexChange={monitor.setHistoryIndex}
            commandStore={commandStore}
          />
        </div>

        {/* Right side: Command Panel */}
        {commandsVisible && <CommandPanel isConnected={monitor.isConnected} commandStore={commandStore} />}
      </div>

      {/* Status bar */}
      <StatusBar
        isConnected={monitor.isConnected}
        portPath={monitor.isConnected ? monitor.selectedPort : null}
        baudRate={monitor.serialOptions.baudRate}
        rxBytes={monitor.rxBytes}
        txBytes={monitor.txBytes}
        lineCount={monitor.lines.length}
      />
    </div>
  )
}
