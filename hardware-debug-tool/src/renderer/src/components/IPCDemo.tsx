import { useState } from 'react';

function IPCDemo() {
    const [systemInfo, setSystemInfo] = useState<{
        platform: string;
        arch: string;
        hostname: string;
        cpus: number;
        totalMemory: number;
        electronVersion: string;
        nodeVersion: string;
        chromeVersion: string;
    } | null>(null);
    const [appVersion, setAppVersion] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const fetchSystemInfo = async () => {
        setLoading(true);
        try {
            const [info, version] = await Promise.all([
                window.electronAPI.invoke.getSystemInfo(),
                window.electronAPI.invoke.getVersion(),
            ]);
            setSystemInfo(info);
            setAppVersion(version);
        } catch (error) {
            console.error('Failed to fetch system info:', error);
        } finally {
            setLoading(false);
        }
    };

    const showMessageDialog = async () => {
        const result = await window.electronAPI.invoke.showMessageDialog({
            type: 'info',
            title: 'IPC Demo',
            message: 'Hello from the main process!',
            detail: 'This dialog was triggered via IPC (Inter-Process Communication).',
            buttons: ['OK', 'Cancel'],
        });

        if (result.response === 0) {
            console.log('User clicked OK');
        }
    };

    const openFileDialog = async () => {
        const result = await window.electronAPI.invoke.openFileDialog({
            title: 'Select a File',
            filters: [
                { name: 'All Files', extensions: ['*'] },
                { name: 'Text Files', extensions: ['txt', 'md'] },
                { name: 'Images', extensions: ['png', 'jpg', 'gif'] },
            ],
            properties: ['openFile'],
        });

        if (!result.canceled && result.filePaths.length > 0) {
            await window.electronAPI.invoke.showMessageDialog({
                type: 'info',
                title: 'File Selected',
                message: 'You selected:',
                detail: result.filePaths[0],
                buttons: ['OK'],
            });
        }
    };

    return (
        <div className="card">
            <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}
            >
                🔌 IPC Communication
            </h2>

            <div className="space-y-3">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button onClick={fetchSystemInfo} className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Get System Info'
                        )}
                    </button>
                    <button onClick={showMessageDialog} className="btn btn-secondary">
                        Show Dialog
                    </button>
                    <button onClick={openFileDialog} className="btn btn-secondary">
                        Open File
                    </button>
                </div>

                {/* System Info Display */}
                {systemInfo && (
                    <div
                        className="mt-4 p-4 rounded-lg space-y-2"
                        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                    >
                        <div className="flex items-center justify-between">
                            <span style={{ color: 'var(--color-text-secondary)' }}>App Version</span>
                            <span className="badge badge-info">{appVersion}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Platform</span>
                            <span
                                className="font-medium"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {systemInfo.platform} ({systemInfo.arch})
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Hostname</span>
                            <span
                                className="font-medium"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {systemInfo.hostname}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span style={{ color: 'var(--color-text-secondary)' }}>CPU Cores</span>
                            <span
                                className="font-medium"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {systemInfo.cpus}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Memory</span>
                            <span
                                className="font-medium"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {systemInfo.totalMemory} GB
                            </span>
                        </div>
                        <hr style={{ borderColor: 'var(--color-border)' }} />
                        <div className="flex items-center justify-between">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Electron</span>
                            <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                                v{systemInfo.electronVersion}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Node.js</span>
                            <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                                v{systemInfo.nodeVersion}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Chrome</span>
                            <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                                v{systemInfo.chromeVersion}
                            </span>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {!systemInfo && (
                    <p
                        className="text-sm mt-2"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    >
                        Click the buttons above to test IPC communication between the renderer and main process.
                    </p>
                )}
            </div>
        </div>
    );
}

export default IPCDemo;
