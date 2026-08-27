import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const release = {
  product: 'sound-toy-patchcard',
  release: 'repair-2',
  baseCandidate: '8b818d73a9267e3d08c08292f29d9092f471d955',
  commit: process.env.PATCHCARD_RELEASE_REVISION
    ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
};

export default defineConfig({
  root: resolve(import.meta.dirname),
  publicDir: resolve(import.meta.dirname, 'public'),
  build: {
    outDir: resolve(import.meta.dirname, '../dist/site'),
    emptyOutDir: true,
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        privacy: resolve(import.meta.dirname, 'privacy/index.html'),
        terms: resolve(import.meta.dirname, 'terms/index.html')
      }
    }
  },
  plugins: [{
    name: 'patchcard-release-identity',
    closeBundle() {
      writeFileSync(resolve(import.meta.dirname, '../dist/site/release.json'), `${JSON.stringify(release, null, 2)}\n`);
    }
  }]
});
