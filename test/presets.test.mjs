import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { assertSelfContained, importModule, packageDir, presetExports } from './support/preset-contract.mjs';

const dir = packageDir(import.meta.url);
const require = createRequire(import.meta.url);
const ts = require('typescript');
const jsonPresets = presetExports(dir);

test('every declared preset is JSON, parses, and is self-contained (no extends escaping the package)', () => {
  assert.ok(jsonPresets.length >= 4, 'base, development, production, nodenext');
  for (const [sub, file] of jsonPresets) {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.equal(typeof json.compilerOptions, 'object', sub);
    assertSelfContained(dir, file, json, assert);
  }
});

test('TypeScript itself accepts every preset with no configuration errors', () => {
  for (const [sub, file] of jsonPresets) {
    const read = ts.readConfigFile(file, ts.sys.readFile);
    assert.equal(read.error, undefined, `${sub}: ${read.error && ts.flattenDiagnosticMessageText(read.error.messageText, '\n')}`);
    const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, path.dirname(file), undefined, file);
    const errors = parsed.errors.filter((e) => e.code !== 18003); // 18003 = "no input files found": presets have no `include`
    assert.deepEqual(errors.map((e) => ts.flattenDiagnosticMessageText(e.messageText, '\n')), [], sub);
  }
});

test('base is strict; production adds the unused-code checks; nodenext uses NodeNext module resolution', () => {
  const load = (sub) => JSON.parse(fs.readFileSync(jsonPresets.find(([s]) => s === sub)[1], 'utf8'));
  assert.equal(load('./base').compilerOptions.strict, true);
  assert.equal(load('./production').compilerOptions.noUnusedLocals, true);
  const nodenext = load('./nodenext').compilerOptions;
  assert.equal(nodenext.module, 'NodeNext');
  assert.equal(nodenext.moduleResolution, 'NodeNext');
});

test('the programmatic API agrees with the JSON base preset', async () => {
  const api = await importModule(path.join(dir, 'dist', 'index.js'));
  const base = JSON.parse(fs.readFileSync(path.join(dir, 'base', 'tsconfig.json'), 'utf8')).compilerOptions;
  assert.deepEqual({ ...api.baseConfig.compilerOptions }, base);
  assert.equal(api.resolveConfig('production').compilerOptions.noUnusedLocals, true);
  assert.equal(api.resolveConfig().compilerOptions.strict, true);
});
