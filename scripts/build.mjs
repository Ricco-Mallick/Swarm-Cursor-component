import { build } from 'esbuild';
import { copyFile, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

const common = { bundle: true, minify: true, target: 'es2020', legalComments: 'inline', logLevel: 'info' };
await build({ ...common, entryPoints: ['src/cursor-swarm.js'], format: 'esm', outfile: 'dist/cursor-swarm.js' });
await build({ ...common, entryPoints: ['src/cursor-swarm.js'], format: 'iife', globalName: 'CursorSwarm', outfile: 'dist/cursor-swarm.iife.js' });
await build({ ...common, entryPoints: ['src/react.js'], format: 'esm', outfile: 'dist/react.js', external: ['react', './cursor-swarm.js'] });

await copyFile('src/cursor-swarm.d.ts', 'dist/cursor-swarm.d.ts');
await copyFile('src/react.d.ts', 'dist/react.d.ts');
await copyFile('dist/cursor-swarm.js', 'site/cursor-swarm.js');
