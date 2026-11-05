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
await copyFile('media/social-preview.png', 'site/og.png');

// shadcn registry item: `npx shadcn@latest add https://ricco.codes/Swarm-Cursor-component/r/cursor-swarm.json`
const { readFile, writeFile } = await import('node:fs/promises');
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const element = await readFile('src/cursor-swarm.js', 'utf8');
const wrapper = await readFile('registry/cursor-swarm.tsx', 'utf8');
const item = {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'cursor-swarm',
  type: 'registry:component',
  title: 'Cursor Swarm',
  description: pkg.description,
  author: `${pkg.author} <${pkg.homepage}>`,
  files: [
    { path: 'registry/cursor-swarm/cursor-swarm.tsx', type: 'registry:component', target: 'components/cursor-swarm/cursor-swarm.tsx', content: wrapper },
    { path: 'registry/cursor-swarm/cursor-swarm-element.js', type: 'registry:component', target: 'components/cursor-swarm/cursor-swarm-element.js', content: element },
  ],
};
await mkdir('site/r', { recursive: true });
await writeFile('site/r/cursor-swarm.json', JSON.stringify(item, null, 2) + '\n');
await writeFile('site/r/registry.json', JSON.stringify({
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'cursor-swarm',
  homepage: pkg.homepage,
  items: [{ ...item, files: item.files.map(({ content, ...f }) => f) }],
}, null, 2) + '\n');
