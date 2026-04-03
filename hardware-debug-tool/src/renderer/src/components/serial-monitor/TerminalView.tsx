import { useEffect, useRef, useMemo, useCallback } from 'react'
import type { TerminalLine, ViewMode } from '../../types/serial'

interface TerminalViewProps {
  lines: TerminalLine[]
  viewMode: ViewMode
  showTimestamps: boolean
  autoscroll: boolean
  searchQuery: string
  activeSearchIndex: number
}

// Highlight search matches in text
function highlightText(
  text: string,
  query: string,
  isActiveMatch: boolean
): React.JSX.Element | string {
  if (!query) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text

  const before = text.slice(0, index)
  const match = text.slice(index, index + query.length)
  const after = text.slice(index + query.length)

  return (
    <>
      {before}
      <span className={isActiveMatch ? 'search-highlight-active' : 'search-highlight'}>
        {match}
      </span>
      {typeof after === 'string' && after.toLowerCase().includes(lowerQuery)
        ? highlightText(after, query, false)
        : after}
    </>
  )
}

function TerminalLine({
  line,
  viewMode,
  showTimestamps,
  searchQuery,
  isActiveSearchMatch
}: {
  line: TerminalLine
  viewMode: ViewMode
  showTimestamps: boolean
  searchQuery: string
  isActiveSearchMatch: boolean
}): React.JSX.Element {
  const isRx = line.direction === 'rx'
  const dirColor = isRx ? 'text-terminal-rx' : 'text-terminal-tx'
  const dirSymbol = isRx ? '◀◀' : '▶▶'

  const renderContent = (): React.JSX.Element => {
    switch (viewMode) {
      case 'hex':
        return (
          <span className="text-terminal-text">
            {searchQuery
              ? highlightText(line.hexData, searchQuery, isActiveSearchMatch)
              : line.hexData}
          </span>
        )
      case 'split':
        return (
          <>
            <span className="text-terminal-text opacity-70 min-w-[280px] inline-block">
              {searchQuery
                ? highlightText(line.hexData, searchQuery, isActiveSearchMatch)
                : line.hexData}
            </span>
            <span className="text-border mx-2">│</span>
            <span className="text-terminal-text">
              {searchQuery
                ? highlightText(line.data, searchQuery, isActiveSearchMatch)
                : line.data}
            </span>
          </>
        )
      case 'ascii':
      default:
        return (
          <span className="text-terminal-text">
            {searchQuery
              ? highlightText(line.data, searchQuery, isActiveSearchMatch)
              : line.data}
          </span>
        )
    }
  }

  return (
    <div
      className={`flex items-start gap-2 px-3 py-px hover:bg-white/2 transition-colors group ${isActiveSearchMatch ? 'bg-terminal-highlight' : ''
        }`}
    >
      {showTimestamps && (
        <span className="text-terminal-timestamp shrink-0 select-all">[{line.timestamp}]</span>
      )}
      <span className={`${dirColor} shrink-0 font-bold text-[11px] mt-px`}>{dirSymbol}</span>
      <span className="flex-1 break-all whitespace-pre-wrap">{renderContent()}</span>
    </div>
  )
}

export function TerminalView({
  lines,
  viewMode,
  showTimestamps,
  autoscroll,
  searchQuery,
  activeSearchIndex
}: TerminalViewProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const userScrolledUp = useRef(false)

  // Get indices of lines matching search
  const matchingIndices = useMemo(() => {
    if (!searchQuery) return []
    const lowerQuery = searchQuery.toLowerCase()
    return lines
      .map((line, idx) => {
        const matches =
          line.data.toLowerCase().includes(lowerQuery) ||
          line.hexData.toLowerCase().includes(lowerQuery)
        return matches ? idx : -1
      })
      .filter((idx) => idx !== -1)
  }, [lines, searchQuery])

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoscroll && !userScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' })
    }
  }, [lines, autoscroll])

  // Scroll to active search match
  useEffect(() => {
    if (searchQuery && matchingIndices.length > 0 && activeSearchIndex < matchingIndices.length) {
      const lineIdx = matchingIndices[activeSearchIndex]
      const element = containerRef.current?.querySelector(`[data-line-idx="${lineIdx}"]`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeSearchIndex, matchingIndices, searchQuery])

  // Handle scroll events to detect user scrolling up
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    userScrolledUp.current = scrollHeight - scrollTop - clientHeight > 50
  }, [])

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-terminal-bg font-mono text-xs leading-5 terminal-scroll"
    >
      {lines.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 select-none">
          <div className="text-4xl mb-3">⚡</div>
          <div className="text-sm font-medium">Serial Monitor Ready</div>
          <div className="text-xs mt-1">Connect to a port to start monitoring</div>
        </div>
      ) : (
        <>
          {lines.map((line, idx) => {
            const matchIdx = matchingIndices.indexOf(idx)
            const isActiveSearchMatch = matchIdx !== -1 && matchIdx === activeSearchIndex

            return (
              <div key={line.id} data-line-idx={idx}>
                <TerminalLine
                  line={line}
                  viewMode={viewMode}
                  showTimestamps={showTimestamps}
                  searchQuery={searchQuery}
                  isActiveSearchMatch={isActiveSearchMatch}
                />
              </div>
            )
          })}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  )
}
