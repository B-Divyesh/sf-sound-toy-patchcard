import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const deployedUrl = process.env.PATCHCARD_RELEASE_URL;
const identity = deployedUrl
  ? await (async () => {
    const response = await fetch(new URL('/release.json', deployedUrl));
    if (!response.ok) throw new Error(`Release identity request failed: ${response.status}`);
    return response.json();
  })()
  : JSON.parse(readFileSync('dist/site/release.json', 'utf8'));
const expectedCommit = process.env.PATCHCARD_RELEASE_REVISION
  ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();

if (identity.product !== 'sound-toy-patchcard'
  || identity.release !== 'repair-3'
  || identity.baseCandidate !== 'd0e97e0da1009118789040c9b982c90f1030f47b'
  || identity.commit !== expectedCommit) {
  throw new Error(`Unexpected release identity: ${JSON.stringify(identity)}`);
}

console.log(`Release identity verified for ${identity.commit}${deployedUrl ? ` at ${deployedUrl}` : ''}.`);
