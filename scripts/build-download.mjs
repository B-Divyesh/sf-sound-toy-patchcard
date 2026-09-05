import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const destination = resolve('dist/site/downloads');
const stableName = 'sociobot-patchcard-0.1.0.tgz';
const siteRoot = resolve('dist/site');

mkdirSync(destination, { recursive: true });
rmSync(resolve(destination, stableName), { force: true });
const result = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', destination], {
  encoding: 'utf8'
}));
const filename = result[0]?.filename;
if (!filename) throw new Error('npm pack did not report an output filename.');
if (filename !== stableName) renameSync(resolve(destination, filename), resolve(destination, stableName));

const assetPaths = readdirSync(resolve(siteRoot, 'assets')).map((name) => `/assets/${name}`);
const workerPath = resolve(siteRoot, 'sw.js');
const worker = readFileSync(workerPath, 'utf8').replace('const BUILD_ASSETS = [];', `const BUILD_ASSETS = ${JSON.stringify(assetPaths)};`);
writeFileSync(workerPath, worker);

console.log(`Built installable package: dist/site/downloads/${stableName}`);
