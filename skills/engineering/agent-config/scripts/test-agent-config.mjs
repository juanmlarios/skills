#!/usr/bin/env node

import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const home = mkdtempSync(join(tmpdir(), 'agent-config-test-'));
const read = (path) => readFileSync(path, 'utf8');
const run = (script, args = []) => spawnSync(process.execPath, [join(skillDir, 'scripts', script), ...args], {
  env: { ...process.env, HOME: home }, encoding: 'utf8',
});
const put = (path, text) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text); };

try {
  const claude = join(home, '.claude/CLAUDE.md');
  const settings = join(home, '.claude/settings.json');
  const codex = join(home, '.codex/AGENTS.md');
  const native = '# My Claude instructions\nUse native tools.\n';
  const hooks = '{"hooks":{"PostToolUse":[{"hooks":[{"command":"user-hook"}]}]}}\n';
  put(claude, native);
  put(settings, hooks);
  put(codex, '<!-- agent-config:start shared-routing -->\nold policy\n<!-- agent-config:end shared-routing -->\n\n# Personal notes\nKeep this note.\n');
  put(join(home, '.codex/config.toml'), '[mcp_servers.gitnexus]\ncommand="gitnexus"\n');

  const before = read(codex);
  const preview = run('sync-agent-config.mjs', ['--instructions-only', '--dry-run']);
  assert.equal(preview.status, 0, preview.stderr);
  assert.equal(read(codex), before);
  assert.ok(!existsSync(join(home, '.agent-instructions')));

  const sync = run('sync-agent-config.mjs', ['--instructions-only']);
  assert.equal(sync.status, 0, sync.stderr);
  const after = read(codex);
  assert.ok(after.includes('Keep this note.'));
  assert.ok(!after.includes('old policy'));
  assert.equal(read(claude), native);
  assert.equal(read(settings), hooks);
  assert.ok(!existsSync(join(home, '.claude/hooks')));
  assert.ok(!existsSync(join(home, '.pi')));
  assert.equal(run('sync-agent-config.mjs', ['--instructions-only']).status, 0);
  assert.equal(read(codex), after);
  assert.equal(run('doctor-agent-config.mjs', ['--instructions-only']).status, 0);

  put(codex, after + '\nUse Context Mode.\n');
  assert.equal(run('doctor-agent-config.mjs', ['--instructions-only']).status, 1);
  put(codex, after);
  const name = readdirSync(join(skillDir, 'assets/agents/claude')).find((name) => name.endsWith('.md'));
  assert.ok(name, 'agent source fixture must exist');
  put(join(home, '.claude/agents', name), 'unmanaged agent\n');
  assert.notEqual(run('sync-agent-config.mjs').status, 0);
  assert.equal(read(codex), after);
  assert.equal(read(join(home, '.claude/agents', name)), 'unmanaged agent\n');
  console.log('PASS: dry-run, notes preservation, native Claude/hooks preservation, instructions-only scope, idempotence, doctor failure status and conflict safety');
} finally {
  rmSync(home, { recursive: true, force: true });
}
