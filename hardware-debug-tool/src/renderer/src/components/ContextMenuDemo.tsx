import { useState } from 'react';

function ContextMenuDemo() {
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [menuLog, setMenuLog] = useState<string[]>([]);

    const addToLog = (message: string) => {
        setMenuLog((prev) => [message, ...prev.slice(0, 4)]);
        setLastAction(message);
    };

    const handleCustomContextMenu = async (e: React.MouseEvent) => {
        e.preventDefault();

        const result = await window.electronAPI.contextMenu.showCustom([
            '📋 Copy',
            '📄 Paste',
            '✂️ Cut',
            '🗑️ Delete',
            '📁 Show in Folder',
        ]);

        if (result.selected) {
            addToLog(`Selected: ${result.label}`);
        } else {
            addToLog('Menu closed without selection');
        }
    };

    const handleTextContextMenu = async (e: React.MouseEvent) => {
        e.preventDefault();

        const result = await window.electronAPI.contextMenu.showTextMenu();

        if (result.action) {
            addToLog(`Text action: ${result.action}`);
        }
    };

    const handleDynamicContextMenu = async (e: React.MouseEvent) => {
        e.preventDefault();

        const result = await window.electronAPI.contextMenu.show([
            { label: '🔄 Refresh', type: 'normal' },
            { label: '⚙️ Settings', type: 'normal' },
            { label: '', type: 'separator' },
            { label: '📊 View Logs', type: 'normal' },
            { label: '🐛 Debug Mode', type: 'normal' },
            { label: '', type: 'separator' },
            { label: '❓ Help', type: 'normal' },
        ]);

        if (result.selected) {
            addToLog(`Dynamic menu: ${result.label}`);
        }
    };

    return (
        <div className="card">
            <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}
            >
                📋 Context Menu Examples
            </h2>

            <div className="space-y-4">
                {/* Demo Areas */}
                <div className="grid grid-cols-1 gap-3">
                    {/* Custom Context Menu */}
                    <div
                        onContextMenu={handleCustomContextMenu}
                        className="p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all"
                        style={{
                            borderColor: 'var(--color-border)',
                            backgroundColor: 'var(--color-bg-tertiary)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-accent)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                        }}
                    >
                        <p
                            className="text-sm font-medium mb-1"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            📦 Custom Actions
                        </p>
                        <p
                            className="text-xs"
                            style={{ color: 'var(--color-text-tertiary)' }}
                        >
                            Right-click for custom menu items
                        </p>
                    </div>

                    {/* Text Context Menu */}
                    <div
                        onContextMenu={handleTextContextMenu}
                        className="p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all"
                        style={{
                            borderColor: 'var(--color-border)',
                            backgroundColor: 'var(--color-bg-tertiary)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-accent)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                        }}
                    >
                        <p
                            className="text-sm font-medium mb-1"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            ✏️ Text Editing
                        </p>
                        <p
                            className="text-xs"
                            style={{ color: 'var(--color-text-tertiary)' }}
                        >
                            Right-click for cut, copy, paste
                        </p>
                    </div>

                    {/* Dynamic Context Menu */}
                    <div
                        onContextMenu={handleDynamicContextMenu}
                        className="p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all"
                        style={{
                            borderColor: 'var(--color-border)',
                            backgroundColor: 'var(--color-bg-tertiary)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-accent)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                        }}
                    >
                        <p
                            className="text-sm font-medium mb-1"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            ⚙️ Dynamic Menu
                        </p>
                        <p
                            className="text-xs"
                            style={{ color: 'var(--color-text-tertiary)' }}
                        >
                            Right-click for app actions
                        </p>
                    </div>
                </div>

                {/* Action Log */}
                {menuLog.length > 0 && (
                    <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                    >
                        <p
                            className="text-xs font-medium mb-2"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            Recent Actions:
                        </p>
                        <div className="space-y-1">
                            {menuLog.map((log, index) => (
                                <p
                                    key={index}
                                    className="text-xs"
                                    style={{
                                        color: index === 0 ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                                        opacity: 1 - index * 0.2,
                                    }}
                                >
                                    {log}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <p
                    className="text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                >
                    💡 Tip: Right-click on any of the areas above to see different context menu examples.
                </p>
            </div>
        </div>
    );
}

export default ContextMenuDemo;
