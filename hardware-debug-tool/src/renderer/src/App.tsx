import { useState, useEffect } from 'react';
import TitleBar from './components/TitleBar';
import IPCDemo from './components/IPCDemo';
import ContextMenuDemo from './components/ContextMenuDemo';
import ThemeToggle from './components/ThemeToggle';

function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Initialize theme from main process
    useEffect(() => {
        window.electronAPI.invoke.getTheme().then((savedTheme) => {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        });

        // Listen for theme toggle from menu (Cmd+Shift+T)
        const cleanup = window.electronAPI.on.toggleTheme(() => {
            handleToggleTheme();
        });

        return cleanup;
    }, []);

    const handleToggleTheme = async () => {
        const newTheme = await window.electronAPI.invoke.toggleTheme();
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            {/* Custom Title Bar */}
            <TitleBar theme={theme} onToggleTheme={handleToggleTheme} />

            {/* Main Content */}
            <main
                className="flex-1 overflow-auto p-6"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                    {/* Header */}
                    <header className="text-center mb-8">
                        <h1
                            className="text-4xl font-bold mb-2"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            ⚡ Electron Template
                        </h1>
                        <p
                            className="text-lg"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            React + TypeScript + TailwindCSS v4 + Vite
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-4">
                            <span className="badge badge-info">Electron</span>
                            <span className="badge badge-success">React 18</span>
                            <span className="badge badge-warning">TypeScript</span>
                        </div>
                    </header>

                    {/* Theme Toggle Card */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2
                                    className="text-lg font-semibold mb-1"
                                    style={{ color: 'var(--color-text-primary)' }}
                                >
                                    🎨 Theme Settings
                                </h2>
                                <p style={{ color: 'var(--color-text-secondary)' }}>
                                    Toggle between light and dark mode. Use{' '}
                                    <kbd
                                        className="px-2 py-1 rounded text-xs font-mono"
                                        style={{
                                            backgroundColor: 'var(--color-bg-tertiary)',
                                            color: 'var(--color-text-primary)',
                                        }}
                                    >
                                        ⌘+Shift+T
                                    </kbd>{' '}
                                    or the button below.
                                </p>
                            </div>
                            <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
                        </div>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* IPC Demo */}
                        <IPCDemo />

                        {/* Context Menu Demo */}
                        <ContextMenuDemo />
                    </div>

                    {/* Features Overview */}
                    <div className="card">
                        <h2
                            className="text-lg font-semibold mb-4"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            ✨ Template Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { icon: '⚡', title: 'Vite', desc: 'Lightning fast HMR' },
                                { icon: '⚛️', title: 'React 18', desc: 'Modern hooks API' },
                                { icon: '📝', title: 'TypeScript', desc: 'Full type safety' },
                                { icon: '🎨', title: 'TailwindCSS v4', desc: 'Utility-first CSS' },
                                { icon: '🔄', title: 'Auto Updater', desc: 'Seamless updates' },
                                { icon: '🪟', title: 'Custom Titlebar', desc: 'Native controls' },
                                { icon: '📦', title: 'electron-builder', desc: 'Cross-platform builds' },
                                { icon: '🔌', title: 'IPC Examples', desc: 'Secure communication' },
                            ].map((feature) => (
                                <div
                                    key={feature.title}
                                    className="flex items-start gap-3 p-3 rounded-lg transition-colors"
                                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                                >
                                    <span className="text-2xl">{feature.icon}</span>
                                    <div>
                                        <h3
                                            className="font-medium"
                                            style={{ color: 'var(--color-text-primary)' }}
                                        >
                                            {feature.title}
                                        </h3>
                                        <p
                                            className="text-sm"
                                            style={{ color: 'var(--color-text-secondary)' }}
                                        >
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <footer
                        className="text-center py-4 text-sm"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    >
                        <p>
                            Built with ❤️ using Electron, React, and TailwindCSS
                        </p>
                        <p className="mt-1">
                            <button
                                onClick={() => window.electronAPI.invoke.openExternal('https://electronjs.org')}
                                className="underline hover:no-underline"
                                style={{ color: 'var(--color-accent)' }}
                            >
                                Learn more about Electron
                            </button>
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}

export default App;
