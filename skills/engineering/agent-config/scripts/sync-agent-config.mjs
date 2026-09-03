#!/usr/bin/env node

import { chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillDir = resolve(__dirname, '..');
const home = process.env.HOME || homedir();
const dryRun = process.argv.includes('--dry-run');
const forceAgents = process.argv.includes('--force-agents');

const source = {
  shared: join(skillDir, 'assets/instructions/shared-routing.md'),
  claude: join(skillDir, 'assets/instructions/claude.md'),
  codex: join(skillDir, 'assets/instructions/codex.md'),
  dispatcher: join(skillDir, 'hooks/claude/gitnexus-context-mode-dispatcher.cjs'),
  claudeAgents: join(skillDir, 'assets/agents/claude'),
  piAgents: join(skillDir, 'assets/agents/pi'),
};

const target = {
  shared: join(home, '.agent-instructions/context-gitnexus-routing.md'),
  claude: join(home, '.claude/CLAUDE.md'),
  codex: join(home, '.codex/AGENTS.md'),
  dispatcher: join(home, '.claude/hooks/gitnexus/gitnexus-context-mode-dispatcher.cjs'),
  claudeAgents: join(home, '.claude/agents'),
  piAgents: join(home, '.pi/agent/agents'),
  settings: join(home, '.claude/settings.json'),
  contextModeHeal: join(home, '.claude/hooks/context-mode-cache-heal.mjs'),
  gitnexusHook: join(home, '.claude/hooks/gitnexus/gitnexus-hook.cjs'),
  contextModePreCompact: join(home, '.claude/plugins/marketplaces/context-mode/hooks/precompact.mjs'),
  contextModeUserPrompt: join(home, '.claude/plugins/marketplaces/context-mode/hooks/userpromptsubmit.mjs'),
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

function copyExecutable(from, to) {
  ensureDir(to);
  if (!dryRun) {
    copyFileSync(from, to);
    chmodSync(to, 0o755);
  }
  console.log(`${dryRun ? 'would copy' : 'copied'} ${to}`);
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

function hook(command, timeout, statusMessage) {
  const h = { type: 'command', command };
  if (timeout) h.timeout = timeout;
  if (statusMessage) h.statusMessage = statusMessage;
  return h;
}

function patchClaudeSettings() {
  let settings = {};
  if (existsSync(target.settings)) {
    settings = JSON.parse(readFileSync(target.settings, 'utf8'));
  }
  settings.hooks = settings.hooks || {};
  settings.hooks.PreToolUse = [
    {
      matcher: 'Grep|Glob|Bash|Read|WebFetch',
      hooks: [
        hook(
          `node "${target.dispatcher}"`,
          10,
          'Routing through GitNexus or Context Mode...',
        ),
      ],
    },
  ];
  settings.hooks.PostToolUse = [
    {
      matcher: 'Bash',
      hooks: [
        hook(
          `node "${target.gitnexusHook}"`,
          10,
          'Checking GitNexus index freshness...',
        ),
      ],
    },
  ];
  settings.hooks.SessionStart = [
    {
      hooks: [
        hook(`"${target.contextModeHeal}"`),
      ],
    },
  ];
  settings.hooks.PreCompact = [
    {
      hooks: [
        hook(
          `node "${target.contextModePreCompact}"`,
          10,
          'Saving Context Mode session state...',
        ),
      ],
    },
  ];
  settings.hooks.UserPromptSubmit = [
    {
      hooks: [
        hook(
          `node "${target.contextModeUserPrompt}"`,
          10,
          'Preparing Context Mode routing...',
        ),
      ],
    },
  ];

  write(target.settings, JSON.stringify(settings, null, 2));
}

checkAgentConflicts(source.claudeAgents, target.claudeAgents);
checkAgentConflicts(source.piAgents, target.piAgents);

write(target.shared, read(source.shared));
write(target.claude, renderInstructionFile('claude-adapter', read(source.claude)));
write(target.codex, renderInstructionFile('codex-adapter', read(source.codex)));
copyExecutable(source.dispatcher, target.dispatcher);
syncAgents(source.claudeAgents, target.claudeAgents);
syncAgents(source.piAgents, target.piAgents);
patchClaudeSettings();

console.log(dryRun ? 'dry run complete' : 'sync complete');
