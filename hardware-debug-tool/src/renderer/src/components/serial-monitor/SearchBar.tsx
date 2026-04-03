import { ChevronUp, ChevronDown, X } from 'lucide-react'

interface SearchBarProps {
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  matchCount: number
  activeIndex: number
  onActiveIndexChange: (i: number) => void
  onClose: () => void
}

export function SearchBar({
  searchQuery,
  onSearchQueryChange,
  matchCount,
  activeIndex,
  onActiveIndexChange,
  onClose
}: SearchBarProps): React.JSX.Element {
  const handlePrev = (): void => {
    if (matchCount === 0) return
    const newIndex = activeIndex <= 0 ? matchCount - 1 : activeIndex - 1
    onActiveIndexChange(newIndex)
  }

  const handleNext = (): void => {
    if (matchCount === 0) return
    const newIndex = activeIndex >= matchCount - 1 ? 0 : activeIndex + 1
    onActiveIndexChange(newIndex)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        handlePrev()
      } else {
        handleNext()
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1c2128] border-b border-border">
      {/* Search input */}
      <div className="flex items-center flex-1 max-w-md bg-secondary rounded-md border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search terminal..."
          autoFocus
          className="flex-1 h-7 px-2.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono"
        />
      </div>

      {/* Match info */}
      <span className="text-xs text-muted-foreground min-w-[80px] text-center">
        {searchQuery ? (
          matchCount > 0 ? (
            <span>
              <span className="text-foreground font-medium">{activeIndex + 1}</span>
              <span className="text-muted-foreground"> / {matchCount}</span>
            </span>
          ) : (
            <span className="text-red-400">No matches</span>
          )
        ) : (
          ''
        )}
      </span>

      {/* Navigation buttons */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={handlePrev}
          disabled={matchCount === 0}
          className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
          title="Previous match (Shift+Enter)"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleNext}
          disabled={matchCount === 0}
          className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
          title="Next match (Enter)"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        title="Close search (Esc)"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
