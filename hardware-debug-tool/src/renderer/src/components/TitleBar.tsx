import { useState, useEffect } from 'react';

interface TitleBarProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

function TitleBar({ theme, onToggleTheme }: TitleBarProps) {
    const [isMaximized, setIsMaximized] = useState(false);
    const [appName, setAppName] = useState('Electron Template');

    useEffect(() => {
        // Get initial maximized state
        window.electronAPI.windowControls.isMaximized().then(setIsMaximized);

        // Get app name
        window.electronAPI.invoke.getName().then(setAppName);

        // Listen for maximize/unmaximize events
        const cleanup = window.electronAPI.windowControls.onMaximizedChange(setIsMaximized);
        return cleanup;
    }, []);

    const handleMinimize = () => {
        window.electronAPI.windowControls.minimize();
    };

    const handleMaximize = () => {
        window.electronAPI.windowControls.maximize();
    };

    const handleClose = () => {
        window.electronAPI.windowControls.close();
    };

    return (
        <div
            className="drag-region flex items-center justify-between h-10 px-3 select-none"
            style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderBottom: '1px solid var(--color-border)',
            }}
        >
            {/* Left: App Icon and Name */}
            <div className="flex items-center gap-2 no-drag">
                <span className="text-lg">⚡</span>
                <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {appName}
                </span>
            </div>

            {/* Center: Drag Region (takes remaining space) */}
            <div className="flex-1" />

            {/* Right: Window Controls */}
            <div className="flex items-center gap-1 no-drag">
                {/* Theme Toggle Button */}
                <button
                    onClick={onToggleTheme}
                    className="p-2 rounded-md transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? (
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                    )}
                </button>

                {/* Minimize Button */}
                <button
                    onClick={handleMinimize}
                    className="p-2 rounded-md transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Minimize"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                </button>

                {/* Maximize/Restore Button */}
                <button
                    onClick={handleMaximize}
                    className="p-2 rounded-md transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title={isMaximized ? 'Restore' : 'Maximize'}
                >
                    {isMaximized ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    )}
                </button>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="p-2 rounded-md transition-colors group"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                    style={{ color: 'var(--color-text-secondary)' }}
                    title="Close"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default TitleBar;
