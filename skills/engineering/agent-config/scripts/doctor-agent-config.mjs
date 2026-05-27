#!/usr/bin/env node

import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const home = process.env.HOME || '/Users/juan';

const paths = {
  shared: join(home, '.agent-instructions/context-gitnexus-routing.md'),
  claudeInstructions: join(home, '.claude/CLAUDE.md'),
  codexInstructions: join(home, '.codex/AGENTS.md'),
  claudeSettings: join(home, '.claude/settings.json'),
  claudePlugins: join(home, '.claude/plugins/installed_plugins.json'),
  claudeUser: join(home, '.claude.json'),
  codexConfig: join(home, '.codex/config.toml'),
  dispatcher: join(home, '.claude/hooks/gitnexus/gitnexus-context-mode-dispatcher.cjs'),
  claudeDesktop: join(home, 'Library/Application Support/Claude/claude_desktop_config.json'),
};

function ok(label, detail = '') {
  console.log(`[OK] ${label}${detail ? ` — ${detail}` : ''}`);
}

function warn(label, detail = '') {
  console.log(`[WARN] ${label}${detail ? ` — ${detail}` : ''}`);
}

function fail(label, detail = '') {
  console.log(`[FAIL] ${label}${detail ? ` — ${detail}` : ''}`);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function json(path) {
  return JSON.parse(read(path));
}

function has(path, text) {
  return existsSync(path) && read(path).includes(text);
}

function checkFile(path, label) {
  if (!existsSync(path)) return fail(label, path);
  const st = lstatSync(path);
  ok(label, `${path}${st.isSymbolicLink() ? ' (symlink)' : ''}`);
}

checkFile(paths.shared, 'shared routing file');
checkFile(paths.claudeInstructions, 'Claude instructions file');
checkFile(paths.codexInstructions, 'Codex instructions file');

if (has(paths.claudeInstructions, 'GitNexus + Context Mode Routing')) {
  ok('Claude instructions contain shared routing');
} else {
  fail('Claude instructions contain shared routing');
}

if (has(paths.codexInstructions, 'GitNexus + Context Mode Routing')) {
  ok('Codex instructions contain shared routing');
} else {
  fail('Codex instructions contain shared routing');
}

if (existsSync(paths.claudeSettings)) {
  const settings = json(paths.claudeSettings);
  const hooks = settings.hooks || {};
  const pre = hooks.PreToolUse?.[0];
  const preCommand = pre?.hooks?.[0]?.command || '';
  if (pre?.matcher === 'Grep|Glob|Bash|Read|WebFetch' && preCommand.includes('gitnexus-context-mode-dispatcher.cjs')) {
    ok('Claude Code PreToolUse dispatcher configured');
  } else {
    fail('Claude Code PreToolUse dispatcher configured', `matcher=${pre?.matcher || 'missing'}`);
  }
  const postCommand = hooks.PostToolUse?.[0]?.hooks?.[0]?.command || '';
  if (hooks.PostToolUse?.[0]?.matcher === 'Bash' && postCommand.includes('gitnexus-hook.cjs')) {
    ok('Claude Code PostToolUse GitNexus freshness hook configured');
  } else {
    fail('Claude Code PostToolUse GitNexus freshness hook configured');
  }
  for (const event of ['SessionStart', 'PreCompact', 'UserPromptSubmit']) {
    if (hooks[event]) ok(`Claude Code ${event} configured`);
    else warn(`Claude Code ${event} configured`);
  }
} else {
  fail('Claude Code settings file', paths.claudeSettings);
}

if (existsSync(paths.dispatcher)) {
  const d = read(paths.dispatcher);
  if (d.includes('GITNEXUS_HOOK') && d.includes('CONTEXT_MODE_PRETOOLUSE')) {
    ok('dispatcher contains GitNexus and Context Mode targets');
  } else {
    fail('dispatcher contains GitNexus and Context Mode targets');
  }
} else {
  fail('dispatcher exists', paths.dispatcher);
}

if (existsSync(paths.codexConfig)) {
  const c = read(paths.codexConfig);
  if (c.includes('[mcp_servers.gitnexus]')) ok('Codex GitNexus MCP configured');
  else fail('Codex GitNexus MCP configured');
  if (c.includes('[mcp_servers.context-mode]')) ok('Codex Context Mode MCP configured');
  else fail('Codex Context Mode MCP configured');
} else {
  fail('Codex config file', paths.codexConfig);
}

if (existsSync(paths.claudePlugins)) {
  const plugins = json(paths.claudePlugins);
  const enabled = plugins.enabledPlugins || {};
  const installed = plugins.plugins || {};
  if (enabled['context-mode@context-mode'] && installed['context-mode@context-mode']) {
    ok('Claude local agent Context Mode plugin enabled');
  } else {
    warn('Claude local agent Context Mode plugin enabled');
  }
} else {
  warn('Claude plugin state file missing', paths.claudePlugins);
}

if (existsSync(paths.claudeUser)) {
  const user = json(paths.claudeUser);
  if (user.mcpServers?.gitnexus) ok('Claude user state GitNexus MCP configured');
  else warn('Claude user state GitNexus MCP configured');
} else {
  warn('Claude user state file missing', paths.claudeUser);
}

if (existsSync(paths.claudeDesktop)) {
  const desktop = json(paths.claudeDesktop);
  const servers = Object.keys(desktop.mcpServers || {});
  if (servers.length) ok('Claude for Mac classic MCP config has servers', servers.join(', '));
  else warn('Claude for Mac classic MCP config empty', 'tools may still come from local agent plugins/user state');
} else {
  warn('Claude for Mac classic MCP config missing', paths.claudeDesktop);
}
