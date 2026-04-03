import { defineConfig } from 'vite';
import { resolve } from 'path';
import { builtinModules } from 'module';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/preload/index.ts'),
            formats: ['cjs'],
            fileName: () => 'index.js',
        },
        outDir: 'dist/preload',
        emptyOutDir: true,
        rollupOptions: {
            external: [
                'electron',
                ...builtinModules,
                ...builtinModules.map((m) => `node:${m}`),
            ],
            output: {
                entryFileNames: '[name].js',
            },
        },
        minify: false,
        sourcemap: true,
        target: 'node18',
        ssr: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
});
