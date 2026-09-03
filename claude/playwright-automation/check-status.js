#!/usr/bin/env node

/**
 * Check page status and performance
 *
 * Usage:
 *   node check-status.js <url>
 */

const { chromium } = require('playwright');

async function checkStatus() {
  const url = process.argv[2];

  if (!url) {
    console.error('Usage: node check-status.js <url>');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    const startTime = Date.now();

    const response = await page.goto(url, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    const loadTime = Date.now() - startTime;

    const metrics = await page.evaluate(() => {
      const perf = performance.timing;
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
        loadComplete: perf.loadEventEnd - perf.navigationStart,
        domInteractive: perf.domInteractive - perf.navigationStart
      };
    });

    const result = {
      url: page.url(),
      status: response?.status(),
      ok: response?.ok(),
      loadTime,
      metrics,
      title: await page.title(),
      elementCounts: {
        links: await page.locator('a').count(),
        images: await page.locator('img').count(),
        buttons: await page.locator('button').count(),
        inputs: await page.locator('input').count(),
        errors: await page.locator('.error, [role="alert"]').count()
      }
    };

    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.log(JSON.stringify({
      url,
      error: error.message,
      accessible: false
    }, null, 2));
    process.exit(1);
  } finally {
    await browser.close();
  }
}

checkStatus();
