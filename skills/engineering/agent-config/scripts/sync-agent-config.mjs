#!/usr/bin/env node

import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillDir = resolve(__dirname, '..');
const home = process.env.HOME || homedir();
const dryRun = process.argv.includes('--dry-run');
const forceAgents = process.argv.includes('--force-agents');
const instructionsOnly = process.argv.includes('--instructions-only');

const source = {
  shared: join(skillDir, 'assets/instructions/shared-routing.md'),
  claude: join(skillDir, 'assets/instructions/claude.md'),
  codex: join(skillDir, 'assets/instructions/codex.md'),
  claudeAgents: join(skillDir, 'assets/agents/claude'),
  piAgents: join(skillDir, 'assets/agents/pi'),
};

const target = {
  shared: join(home, '.agent-instructions/context-gitnexus-routing.md'),
  claude: join(home, '.claude/CLAUDE.md'),
  codex: join(home, '.codex/AGENTS.md'),
  claudeAgents: join(home, '.claude/agents'),
  piAgents: join(home, '.pi/agent/agents'),
};

function read(path) {
  return readFileSync(path, 'utf8').trimEnd();
}

function ensureDir(path) {
  if (!dryRun) mkdirSync(dirname(path), { recursive: true });
}

function write(path, content) {
  ensureDir(path);
  if (existsSync(path) && lstatSync(path).isSymbolicLink()) {
    if (!dryRun) rmSync(path);
  }
  if (!dryRun) writeFileSync(path, `${content.trimEnd()}\n`);
  console.log(`${dryRun ? 'would write' : 'wrote'} ${path}`);
}

const managedAgentMarker = '<!-- agent-config:managed-agent -->';

function agentEntries(fromDir, toDir) {
  return readdirSync(fromDir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((name) => ({ from: join(fromDir, name), to: join(toDir, name) }));
}

function checkAgentConflicts(fromDir, toDir) {
  for (const { from, to } of agentEntries(fromDir, toDir)) {
    if (!existsSync(to)) continue;
    const existing = readFileSync(to, 'utf8');
    const content = `${read(from)}\n`;
    if (existing !== content && !existing.includes(managedAgentMarker) && !forceAgents) {
      throw new Error(`refusing to overwrite unmanaged agent ${to}; rerun with --force-agents to adopt it`);
    }
  }
}

function syncAgents(fromDir, toDir) {
  for (const { from, to } of agentEntries(fromDir, toDir)) {
    const content = `${read(from)}\n`;
    if (existsSync(to) && readFileSync(to, 'utf8') === content) {
      console.log(`unchanged ${to}`);
      continue;
    }
    ensureDir(to);
    if (!dryRun) writeFileSync(to, content);
    console.log(`${dryRun ? 'would write' : 'wrote'} ${to}`);
  }
}

function managedBlock(name, content) {
  return [
    `<!-- agent-config:start ${name} -->`,
    content.trimEnd(),
    `<!-- agent-config:end ${name} -->`,
  ].join('\n');
}

function replaceBlock(existing, name, content) {
  const block = managedBlock(name, content);
  const re = new RegExp(`<!-- agent-config:start ${name} -->[\\s\\S]*?<!-- agent-config:end ${name} -->`);
  if (re.test(existing)) return existing.replace(re, block);
  return `${block}\n\n${existing.trimStart()}`.trimEnd();
}

function renderInstructionFile(adapterName, adapterContent) {
  return [
    managedBlock('shared-routing', read(source.shared)),
    managedBlock(adapterName, adapterContent),
  ].join('\n\n');
}

function syncInstructions(path, adapterName, adapterPath, preserveUnmanaged = false) {
  if (!existsSync(path)) {
    write(path, renderInstructionFile(adapterName, read(adapterPath)));
    return;
  }
  const existing = readFileSync(path, 'utf8');
  if (preserveUnmanaged && !existing.includes('<!-- agent-config:start ')) {
    console.log(`preserved unmanaged instructions ${path}`);
    return;
  }
  const shared = replaceBlock(existing, 'shared-routing', read(source.shared));
  write(path, replaceBlock(shared, adapterName, read(adapterPath)));
}

if (!instructionsOnly) {
  checkAgentConflicts(source.claudeAgents, target.claudeAgents);
  checkAgentConflicts(source.piAgents, target.piAgents);
}

write(target.shared, read(source.shared));
syncInstructions(target.claude, 'claude-adapter', source.claude, true);
syncInstructions(target.codex, 'codex-adapter', source.codex);
if (!instructionsOnly) {
  syncAgents(source.claudeAgents, target.claudeAgents);
  syncAgents(source.piAgents, target.piAgents);
}
// Hook, plugin and MCP settings are user-owned; syncing instructions never changes them.

console.log(dryRun ? 'dry run complete' : 'sync complete');
