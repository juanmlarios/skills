#!/usr/bin/env node
/*
 * Dispatch Claude Code PreToolUse events between GitNexus and Context Mode.
 *
 * GitNexus owns semantic code search in indexed repos.
 * Context Mode owns raw/high-output context protection.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GITNEXUS_HOOK = '/Users/juan/.claude/hooks/gitnexus/gitnexus-hook.cjs';
const CONTEXT_MODE_PRETOOLUSE =
  '/Users/juan/.claude/plugins/marketplaces/context-mode/hooks/pretooluse.mjs';

function findGitNexusDir(startDir) {
  let dir = path.resolve(startDir || process.cwd());
  while (dir && dir !== path.dirname(dir)) {
    const candidate = path.join(dir, '.gitnexus');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  return null;
}

function bashLooksLikeTextSearch(command) {
  return /\b(rg|grep)\b/.test(command || '');
}

function route(input) {
  if ((input.hook_event_name || '') !== 'PreToolUse') return null;

  const toolName = input.tool_name || '';
  const toolInput = input.tool_input || {};
  const cwd = toolInput.cwd || process.cwd();

  if (toolName === 'Grep' || toolName === 'Glob') {
    return GITNEXUS_HOOK;
  }

  if (toolName === 'Bash') {
    const command = toolInput.command || '';
    if (findGitNexusDir(cwd) && bashLooksLikeTextSearch(command)) {
      return GITNEXUS_HOOK;
    }
    return CONTEXT_MODE_PRETOOLUSE;
  }

  if (toolName === 'Read' || toolName === 'WebFetch') {
    return CONTEXT_MODE_PRETOOLUSE;
  }

  return null;
}

const stdin = fs.readFileSync(0, 'utf8');
let input;

try {
  input = JSON.parse(stdin || '{}');
} catch {
  process.exit(0);
}

const target = route(input);
if (!target) process.exit(0);

const child = spawnSync(process.execPath, [target], {
  input: stdin,
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
});

if (child.stdout) process.stdout.write(child.stdout);
if (child.stderr) process.stderr.write(child.stderr);
process.exit(child.status ?? 0);
