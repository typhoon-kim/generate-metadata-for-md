import esbuild from 'esbuild';
import { promises as fs } from 'fs';

// shebang plugin
const shebangPlugin = {
    name: 'shebang',
    setup(build) {
        build.onEnd(result => {
            result.outputFiles.forEach(async file => {
                const text = file.text;
                const lines = text.split('\n');
                if (lines[0].startsWith('#!')) {
                    lines[0] = '#!/usr/bin/env node';
                    const newText = lines.join('\n');
                    await fs.writeFileSync(file.path, newText);
                }
            });
        });
    }
};

// CommonJS build
esbuild.build({
    entryPoints: ['src/cli.ts', 'src/index.ts'],
    bundle: true,
    minify: false,
    outdir: 'dist',
    format: 'cjs',
    platform: 'node',
    target: 'es6',
    plugins: [shebangPlugin],
    external: ['commander', 'path', 'fs'],
    outExtension: { '.js': '.cjs' }
}).catch(() => process.exit(1));

// ESM build
esbuild.build({
    entryPoints: ['src/cli.ts', 'src/index.ts'],
    bundle: true,
    minify: false,
    outdir: 'dist',
    format: 'esm',
    platform: 'node',
    target: 'node18',
    plugins: [shebangPlugin],
    external: ['commander', 'path', 'fs'],
    outExtension: { '.js': '.mjs' }
}).catch(() => process.exit(1));