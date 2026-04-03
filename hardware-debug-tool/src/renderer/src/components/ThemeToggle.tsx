interface ThemeToggleProps {
    theme: 'light' | 'dark';
    onToggle: () => void;
}

function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
    return (
        <button
            onClick={onToggle}
            className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
                backgroundColor: theme === 'dark' ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                '--tw-ring-color': 'var(--color-accent)',
                '--tw-ring-offset-color': 'var(--color-bg-primary)',
            } as React.CSSProperties}
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label="Toggle theme"
        >
            <span
                className="inline-flex h-6 w-6 transform items-center justify-center rounded-full shadow-md transition-transform"
                style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    transform: theme === 'dark' ? 'translateX(1.625rem)' : 'translateX(0.25rem)',
                }}
            >
                {theme === 'light' ? (
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        style={{ color: '#f59e0b' }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>
                ) : (
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        style={{ color: 'var(--color-accent)' }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                    </svg>
                )}
            </span>
        </button>
    );
}

export default ThemeToggle;
