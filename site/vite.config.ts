import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const release = {
  product: 'sound-toy-patchcard',
  release: 'repair-3',
  baseCandidate: 'd0e97e0da1009118789040c9b982c90f1030f47b',
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
        demo: resolve(import.meta.dirname, 'demo/index.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
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
