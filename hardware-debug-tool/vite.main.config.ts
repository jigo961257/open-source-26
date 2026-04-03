import { defineConfig } from 'vite';
import { resolve } from 'path';
import { builtinModules } from 'module';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/main/index.ts'),
            formats: ['cjs'],
            fileName: () => 'index.js',
        },
        outDir: 'dist/main',
        emptyOutDir: true,
        rollupOptions: {
            external: [
                'electron',
                'electron-updater',
                // Externalize all Node.js built-in modules
                ...builtinModules,
                ...builtinModules.map((m) => `node:${m}`),
            ],
            output: {
                entryFileNames: '[name].js',
            },
        },
        minify: false,
        sourcemap: true,
        // Important: target Node.js environment
        target: 'node18',
        // Don't treat as browser
        ssr: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
