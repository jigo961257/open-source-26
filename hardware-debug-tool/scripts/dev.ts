import { spawn, ChildProcess } from 'child_process';
import { createServer, build as viteBuild } from 'vite';
import electron from 'electron';

const VITE_DEV_SERVER_URL = 'http://localhost:5173';

let electronProcess: ChildProcess | null = null;

async function watchMain() {
    await viteBuild({
        configFile: 'vite.main.config.ts',
        build: {
            watch: {},
        },
    });
}

async function watchPreload() {
    await viteBuild({
        configFile: 'vite.preload.config.ts',
        build: {
            watch: {},
        },
    });
}

async function startViteDevServer() {
    const server = await createServer({
        configFile: 'vite.renderer.config.ts',
    });
    await server.listen();
    return server;
}

function startElectron() {
    if (electronProcess) {
        electronProcess.kill();
    }

    electronProcess = spawn(String(electron), ['.'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            VITE_DEV_SERVER_URL,
        },
    });

    electronProcess.on('close', (code) => {
        if (code !== null) {
            process.exit(code);
        }
    });
}

async function main() {
    console.log('🚀 Starting Electron development server...\n');

    // Start Vite dev server first
    console.log('📦 Starting Vite dev server...');
    await startViteDevServer();
    console.log(`✅ Vite dev server ready at ${VITE_DEV_SERVER_URL}\n`);

    // Build main and preload in watch mode
    console.log('🔨 Building main process...');
    await watchMain();
    console.log('✅ Main process built\n');

    console.log('🔨 Building preload script...');
    await watchPreload();
    console.log('✅ Preload script built\n');

    // Wait a bit for builds to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Start Electron
    console.log('⚡ Starting Electron...\n');
    startElectron();

    // Handle process exit
    process.on('SIGINT', () => {
        if (electronProcess) {
            electronProcess.kill();
        }
        process.exit(0);
    });
}

main().catch((err) => {
    console.error('Error starting dev server:', err);
    process.exit(1);
});
