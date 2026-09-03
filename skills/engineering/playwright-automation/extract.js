#!/usr/bin/env node

/**
 * Extract data from a webpage using CSS selectors
 *
 * Usage:
 *   node extract.js <url> <selector> [options]
 *
 * Examples:
 *   node extract.js https://example.com "h1"
 *   node extract.js https://news.ycombinator.com ".titleline a" --limit 10
 *   node extract.js https://example.com "a" --attr href
 */

const { chromium } = require('playwright');

async function extract() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node extract.js <url> <selector> [--limit N] [--attr name]');
    process.exit(1);
  }

  const url = args[0];
  const selector = args[1];
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : 20;
  const attrIndex = args.indexOf('--attr');
  const attrName = attrIndex !== -1 ? args[attrIndex + 1] : null;

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(url, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    const locator = page.locator(selector);
    const count = await locator.count();

    let results;
    if (attrName) {
      // Extract specific attribute
      results = await locator.evaluateAll((els, attr) =>
        els.map(el => el.getAttribute(attr)).filter(Boolean),
        attrName
      );
    } else {
      // Extract text content
      results = await locator.allTextContents();
      results = results.map(text => text.trim()).filter(Boolean);
    }

    const output = {
      url,
      selector,
      count,
      results: results.slice(0, limit),
      truncated: count > limit
    };

    console.log(JSON.stringify(output, null, 2));

  } catch (error) {
    console.log(JSON.stringify({
      error: error.message,
      url,
      selector
    }, null, 2));
    process.exit(1);
  } finally {
    await browser.close();
  }
}

extract();
