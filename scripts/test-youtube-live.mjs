// Opt-in real network test. Fixtures never appear in the production extractor.
import assert from 'node:assert/strict';
import { analyzeVideo } from '../server/youtube/analyze.js';
import { resolveMods } from '../server/youtube/resolve.js';
const url = 'https://www.youtube.com/watch?v=v8AhuSKAJpc';
const sourceUrl = 'https://note.com/nigghome/n/nbac4b639ebc0';
const standalone = await analyzeVideo({ url }, process.env);
console.log('URL only:', { status: standalone.status, mods: standalone.mods.length, warnings: standalone.warnings });
const result = await analyzeVideo({ url, sourceUrl }, process.env);
assert.ok(result.minecraftVersions.some(v => v.value === '1.20.1'));
assert.ok(result.loaders.some(v => v.value === 'forge'));
const names = ['Ex Deorum', 'Create', 'ProjectE', 'Powah', 'Refined Storage', 'Hostile Neural Networks'];
for (const name of names) assert.ok(result.mods.some(m => m.name === name), `Missing ${name}`);
assert.ok(result.mods.every(m => m.evidence.length > 0));
const resolved = await resolveMods({ mods: result.mods.filter(m => names.includes(m.name)), version: '1.20.1', loader: 'forge' }, process.env);
console.log('With supplemental source:', { mods: result.mods.length, minecraft: result.minecraftVersions.map(v => v.value), loaders: result.loaders.map(v => v.value) });
console.log('Resolution:', resolved.mods.map(m => ({ id: m.id, provider: m.resolution?.provider, compatibility: m.resolution?.compatibility, status: m.resolutionStatus })));
console.log('PASS: live evidence extraction (supplemental source remains inferred).');
