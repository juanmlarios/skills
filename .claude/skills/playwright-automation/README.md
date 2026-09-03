# Playwright Automation Skill

Token-efficient browser automation that returns only extracted data (no snapshots).

## Setup

First time only:
```bash
cd ~/.claude/skills/playwright-automation
npm install
npx playwright install chromium
```

## Quick Start

### Extract elements by selector
```bash
node extract.js https://news.ycombinator.com ".titleline a" --limit 10
```

### Scrape full page summary
```bash
node scrape-page.js https://example.com
```

### Check page status
```bash
node check-status.js https://example.com
```

## Token Comparison

| Task | Dev-Browser | Playwright-Automation |
|------|-------------|----------------------|
| Get article titles | 8,000 tokens | 150 tokens |
| Extract links | 10,000 tokens | 200 tokens |
| Check page status | 12,000 tokens | 250 tokens |
| Form automation | 15,000 tokens | 100 tokens |

**Average savings: 95-98%**

## Available Scripts

### extract.js
Extract text or attributes from CSS selectors.

```bash
# Extract text content
node extract.js <url> <selector> [--limit N]

# Extract attributes
node extract.js <url> <selector> --attr href
node extract.js <url> "img" --attr src --limit 5
```

Examples:
```bash
node extract.js https://news.ycombinator.com ".titleline a" --limit 10
node extract.js https://github.com/trending "h2.h3 a" --limit 5
node extract.js https://example.com "a" --attr href --limit 20
```

### scrape-page.js
Get comprehensive page overview: title, metadata, headings, links, images.

```bash
node scrape-page.js <url>
```

Examples:
```bash
node scrape-page.js https://example.com
node scrape-page.js https://blog.example.com/post
```

### check-status.js
Check if page is accessible and get performance metrics.

```bash
node check-status.js <url>
```

Examples:
```bash
node check-status.js https://example.com
node check-status.js https://localhost:3000
```

## Custom Scripts

For one-off tasks, write inline scripts:

```bash
node <<'EOF'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://example.com');

  // Your custom logic here
  const data = await page.locator('.my-selector').textContent();
  console.log(JSON.stringify({ data }));

  await browser.close();
})();
EOF
```

## Common Patterns

### Extract table data
```javascript
const tableData = await page.locator('table').first().evaluate(table => {
  const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
  const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
    Array.from(tr.querySelectorAll('td')).map(td => td.textContent)
  );
  return { headers, rows };
});
```

### Fill and submit form
```javascript
await page.fill('input[name="email"]', 'user@example.com');
await page.fill('input[name="password"]', 'password');
await page.click('button[type="submit"]');
await page.waitForURL('**/success');
console.log({ success: true, url: page.url() });
```

### Wait for dynamic content
```javascript
await page.waitForSelector('.results', { timeout: 5000 });
const results = await page.locator('.results .item').allTextContents();
```

### Handle navigation
```javascript
await page.click('a.next-page');
await page.waitForLoadState('networkidle');
const newUrl = page.url();
```

## Best Practices

1. **Output JSON** - easier for Claude to parse
2. **Limit results** - use `.slice(0, N)` to avoid huge outputs
3. **Use headless: true** - faster, no UI
4. **Add timeouts** - fail fast if page doesn't load
5. **Extract only what you need** - don't return entire pages
6. **Save screenshots to disk** - don't return to context

## When to Use What

### Use playwright-automation for:
- ✅ Data extraction/scraping
- ✅ Known page structures
- ✅ Repetitive tasks
- ✅ Production workflows
- ✅ Testing automation
- ✅ Form submission
- ✅ Performance monitoring

### Use dev-browser for:
- 🔍 Exploring unknown pages
- 🔍 Visual debugging (need screenshots in context)
- 🔍 One-off interactive tasks
- 🔍 Discovering page structure

## Troubleshooting

**Module not found error:**
```bash
cd ~/.claude/skills/playwright-automation
npm install
```

**Browser not installed:**
```bash
npx playwright install chromium
```

**Timeout errors:**
Increase timeout in scripts:
```javascript
await page.goto(url, { timeout: 30000 });
```

**Page not loading:**
Try without waiting for network idle:
```javascript
await page.goto(url);
// Skip: await page.waitForLoadState('networkidle');
```
