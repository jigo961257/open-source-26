import { useState } from 'react'
import { Plus, Play, Square, Pencil, Trash2, Clock, TerminalSquare, AlertCircle } from 'lucide-react'
import type { UseCommandStoreReturn } from '../../hooks/useCommandStore'
import { CommandFormDialog } from './CommandFormDialog'
import type { SavedCommand } from '../../types/serial'

interface CommandPanelProps {
  isConnected: boolean
  commandStore: UseCommandStoreReturn
}

export function CommandPanel({ isConnected, commandStore: store }: CommandPanelProps): React.JSX.Element {
  const [formOpen, setFormOpen] = useState(false)
  const [editingCommand, setEditingCommand] = useState<SavedCommand | undefined>(undefined)

  const handleCreate = (): void => {
    setEditingCommand(undefined)
    setFormOpen(true)
  }

  const handleEdit = (cmd: SavedCommand): void => {
    setEditingCommand(cmd)
    setFormOpen(true)
  }

  const handleSave = async (cmdData: Omit<SavedCommand, 'id'>): Promise<void> => {
    if (editingCommand) {
      await store.updateCommand({ ...cmdData, id: editingCommand.id })
    } else {
      await store.addCommand(cmdData)
    }
  }

  const handleDelete = async (id: string, name: string): Promise<void> => {
    if (window.confirm(`Are you sure you want to delete the command "${name}"?`)) {
      await store.deleteCommand(id)
    }
  }

  return (
    <div className="w-80 h-full flex flex-col bg-card border-l border-border transition-all duration-300">
      {/* Header */}
      <div className="h-10 shrink-0 flex items-center justify-between px-3 border-b border-border bg-secondary/50">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <TerminalSquare className="w-3.5 h-3.5" />
          Commands
        </h3>
        <button
          onClick={handleCreate}
          className="h-6 px-2 rounded flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3 h-3" />
          New
        </button>
      </div>

      {/* Error alert */}
      {store.error && (
        <div className="mx-3 mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-md flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{store.error}</p>
            <button
              onClick={store.clearError}
              className="mt-1 text-red-500/70 hover:text-red-500 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {store.commands.length === 0 ? (
          <div className="text-center mt-10 text-muted-foreground">
            <TerminalSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No commands saved</p>
            <p className="text-xs mt-1">Create one to quickly send data</p>
          </div>
        ) : (
          store.commands.map((cmd) => {
            const isRepeating = store.activeRepeats.includes(cmd.id)

            return (
              <div
                key={cmd.id}
                className={`group flex flex-col rounded-md border p-2.5 transition-colors relative overflow-hidden ${
                  isRepeating
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-secondary/30 border-border hover:border-border/80'
                }`}
              >
                {/* Active indicator bar */}
                {isRepeating && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary animate-pulse" />
                )}

                {/* Top row: Name & Format */}
                <div className="flex items-center justify-between pl-1">
                  <span className="text-sm font-medium text-foreground truncate pr-2">
                    {cmd.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {cmd.format}
                    </span>
                  </div>
                </div>

                {/* Second row: Data preview & Interval */}
                <div className="flex items-center justify-between mt-1 pl-1">
                  <span className="text-xs text-muted-foreground font-mono truncate mr-2">
                    {cmd.command}
                  </span>
                  {cmd.repeatInterval && (
                    <span
                      className={`text-[10px] flex items-center gap-1 shrink-0 ${
                        isRepeating ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {cmd.repeatInterval}s
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 mt-3 pl-1">
                  {/* Send / Run Toggle */}
                  {cmd.repeatInterval ? (
                    <button
                      onClick={() =>
                        isRepeating ? store.stopRepeat(cmd.id) : store.startRepeat(cmd.id)
                      }
                      disabled={!isConnected}
                      className={`flex-1 h-7 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isRepeating
                          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {isRepeating ? (
                        <>
                          <Square className="w-3 h-3 fill-current" /> Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" /> Run
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => store.sendOnce(cmd.id)}
                      disabled={!isConnected}
                      className="flex-1 h-7 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-3 h-3 fill-current" /> Send
                    </button>
                  )}

                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(cmd)}
                    className="h-7 w-7 flex items-center justify-center rounded bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                    title="Edit Command"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(cmd.id, cmd.name)}
                    className="h-7 w-7 flex items-center justify-center rounded bg-secondary text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete Command"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <CommandFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingCommand}
        onSave={handleSave}
      />
    </div>
  )
}
