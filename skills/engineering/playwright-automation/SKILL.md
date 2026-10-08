---
name: playwright-automation
description: Token-efficient browser automation for data extraction, scraping, and form automation. Returns only requested data (no snapshots/screenshots to context). Use for production workflows, testing, and repetitive tasks. For exploration use dev-browser instead.
---

# Playwright Automation Skill

**Token-efficient browser automation.** Scripts run outside context - only extracted data returns.

## When to Use This vs Dev-Browser

**Use playwright-automation for:**
- Data extraction/scraping
- Form automation with known structure
- Testing workflows
- Repetitive tasks
- Production automation

**Use an interactive browser tool (Claude in Chrome, or a dev-browser skill if installed) for:**
- Exploring unknown pages (need snapshots)
- One-off visual debugging
- Interactive discovery

## Quick Commands

Scripts live in the installed skill directory (`~/.claude/skills/playwright-automation/`, or the project-local `.claude/skills/...`); run `./setup.sh` there once to install Playwright.

### Extract Data
```bash
cd ~/.claude/skills/playwright-automation && node extract.js <url> <selector>
```

### Scrape a Page
```bash
cd ~/.claude/skills/playwright-automation && node scrape-page.js <url>
```

### Check Page Status
```bash
cd ~/.claude/skills/playwright-automation && node check-status.js <url>
```

### Custom Script
Write the script to a file (e.g. under the OS temp dir) and run it with `node <file> <url>` from the skill directory so `require('playwright')` resolves.

## Common Patterns

### 1. Extract Text Content
```bash
node <<'EOF'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(process.argv[2] || 'https://example.com');

  const data = {
    title: await page.title(),
    headings: await page.locator('h1, h2, h3').allTextContents(),
    paragraphs: await page.locator('p').allTextContents()
  };

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
EOF
```

### 2. Extract Links
```bash
node <<'EOF'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(process.argv[2] || 'https://example.com');

  const links = await page.locator('a').evaluateAll(els =>
    els.map(el => ({ text: el.textContent?.trim(), href: el.href }))
      .filter(link => link.text && link.href)
  );

  console.log(JSON.stringify({ links: links.slice(0, 20) }, null, 2));
  await browser.close();
})();
EOF
```

### 3. Fill Form and Submit
```bash
node <<'EOF'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://example.com/form');

  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="name"]', 'Test User');
  await page.click('button[type="submit"]');

  await page.waitForLoadState('networkidle');

  const result = {
    url: page.url(),
    success: page.url().includes('success')
  };

  console.log(JSON.stringify(result));
  await browser.close();
})();
EOF
```

### 4. Check Element Existence
```bash
node <<'EOF'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(process.argv[2] || 'https://example.com');

  const checks = {
    hasLoginButton: await page.locator('button:has-text("Login")').count() > 0,
    hasSearchBox: await page.locator('input[type="search"]').count() > 0,
    errorCount: await page.locator('.error, [role="alert"]').count()
  };

  console.log(JSON.stringify(checks));
  await browser.close();
})();
EOF
```

### 5. Extract Table Data
```bash
node <<'EOF'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(process.argv[2] || 'https://example.com');

  const tableData = await page.locator('table').first().evaluate(table => {
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim());
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
      Array.from(tr.querySelectorAll('td')).map(td => td.textContent?.trim())
    );
    return { headers, rows: rows.slice(0, 10) };
  });

  console.log(JSON.stringify(tableData, null, 2));
  await browser.close();
})();
EOF
```

## Token Efficiency

| Operation | Typical Token Cost |
|-----------|-------------------|
| Extract text data | 100-300 tokens |
| Scrape articles | 200-500 tokens |
| Form automation | 100-200 tokens |
| Table extraction | 300-800 tokens |

vs Dev-browser: 5,000-20,000 tokens per operation

**Savings: 95-98%**

## Tips

1. **Output JSON** - easier for Claude to parse
2. **Limit results** - `.slice(0, 20)` to avoid huge outputs
3. **Use headless** - faster, no window flickering
4. **Add timeouts** - `{ timeout: 10000 }` to fail fast
5. **Save screenshots to disk** - don't return to context
6. **Extract only what you need** - not entire pages

## Selectors Quick Reference

```javascript
// By text
page.locator('button:has-text("Submit")')
page.getByRole('button', { name: 'Submit' })

// By CSS
page.locator('.classname')
page.locator('#id')
page.locator('[data-testid="value"]')

// By position
page.locator('ul li').first()
page.locator('ul li').nth(2)
page.locator('ul li').last()

// Multiple elements
page.locator('a').count()
page.locator('a').allTextContents()
```

## Error Handling

```javascript
try {
  await page.goto(url, { timeout: 10000 });
  // ... automation
  console.log(JSON.stringify({ success: true, data }));
} catch (error) {
  console.log(JSON.stringify({
    success: false,
    error: error.message
  }));
}
```

## Comparison

| Feature | Dev-Browser | Playwright-Automation |
|---------|-------------|----------------------|
| Token cost | 5k-20k per action | 100-500 per action |
| Returns | Full DOM snapshots | Only requested data |
| Use case | Exploration | Production automation |
| Speed | Slower (returns data) | Faster (headless) |
| Visual feedback | Screenshots | Optional (saved to disk) |
| Best for | Unknown pages | Known structures |
