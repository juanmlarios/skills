#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const home = process.env.HOME || homedir();
const instructionsOnly = process.argv.includes('--instructions-only');
let failures = 0;
const read = (path) => readFileSync(path, 'utf8');

function check(label, passed, detail = '') {
  console.log(`[${passed ? 'OK' : 'FAIL'}] ${label}${detail ? ` — ${detail}` : ''}`);
  if (!passed) failures++;
}

function checkBlock(path, name, source) {
  if (!existsSync(path)) return check(`${name} instructions`, false, path);
  const expected = `<!-- agent-config:start ${name} -->\n${read(source).trimEnd()}\n<!-- agent-config:end ${name} -->`;
  check(`${name} instructions match source`, read(path).includes(expected));
}

const sharedSource = join(skillDir, 'assets/instructions/shared-routing.md');
const sharedTarget = join(home, '.agent-instructions/context-gitnexus-routing.md');
check('shared working agreements match source', existsSync(sharedTarget) && read(sharedTarget).trimEnd() === read(sharedSource).trimEnd());
const codex = join(home, '.codex/AGENTS.md');
checkBlock(codex, 'shared-routing', sharedSource);
checkBlock(codex, 'codex-adapter', join(skillDir, 'assets/instructions/codex.md'));

const claude = join(home, '.claude/CLAUDE.md');
check('Claude instructions exist', existsSync(claude));
if (existsSync(claude)) {
  if (read(claude).includes('<!-- agent-config:start ')) {
    checkBlock(claude, 'shared-routing', sharedSource);
    checkBlock(claude, 'claude-adapter', join(skillDir, 'assets/instructions/claude.md'));
  } else {
    console.log('[OK] unmanaged Claude instructions preserved');
  }
}

for (const path of [codex, claude, sharedTarget]) {
  if (existsSync(path)) check(`no removed-tool routing in ${path}`, !/context[- ]mode/i.test(read(path)));
}
const settings = join(home, '.claude/settings.json');
if (existsSync(settings)) {
  const hooks = JSON.parse(read(settings)).hooks || {};
  check('no removed-tool hooks configured', !/context[- ]mode/i.test(JSON.stringify(hooks)));
}
const config = join(home, '.codex/config.toml');
if (existsSync(config)) {
  const text = read(config);
  check('Codex GitNexus MCP configured', text.includes('[mcp_servers.gitnexus]'));
  check('no removed-tool Codex MCP configured', !/^\s*\[mcp_servers\.["']?context-mode["']?\]/m.test(text));
} else {
  check('Codex config exists', false, config);
}

if (!instructionsOnly) {
  for (const [label, sourceDir, targetDir] of [
    ['Claude', join(skillDir, 'assets/agents/claude'), join(home, '.claude/agents')],
    ['Pi', join(skillDir, 'assets/agents/pi'), join(home, '.pi/agent/agents')],
  ]) {
    for (const name of readdirSync(sourceDir).filter((name) => name.endsWith('.md')).sort()) {
      const target = join(targetDir, name);
      check(`${label} agent ${name} matches source`, existsSync(target) && read(target) === read(join(sourceDir, name)));
    }
  }
}
process.exitCode = failures ? 1 : 0;
