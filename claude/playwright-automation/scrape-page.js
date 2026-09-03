#!/usr/bin/env node

/**
 * Scrape a page and extract common elements
 *
 * Usage:
 *   node scrape-page.js <url>
 *
 * Returns: title, headings, links, images, metadata
 */

const { chromium } = require('playwright');

async function scrapePage() {
  const url = process.argv[2];

  if (!url) {
    console.error('Usage: node scrape-page.js <url>');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(url, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    const data = await page.evaluate(() => {
      // Extract metadata
      const getMetaContent = (name) => {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return meta?.content || null;
      };

      // Extract headings
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        level: h.tagName,
        text: h.textContent?.trim()
      })).filter(h => h.text);

      // Extract links
      const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
        text: a.textContent?.trim(),
        href: a.href
      })).filter(l => l.text && l.href).slice(0, 20);

      // Extract images
      const images = Array.from(document.querySelectorAll('img[src]')).map(img => ({
        alt: img.alt,
        src: img.src
      })).slice(0, 10);

      return {
        title: document.title,
        url: window.location.href,
        meta: {
          description: getMetaContent('description'),
          keywords: getMetaContent('keywords'),
          author: getMetaContent('author'),
          ogTitle: getMetaContent('og:title'),
          ogDescription: getMetaContent('og:description'),
          ogImage: getMetaContent('og:image')
        },
        headings,
        links,
        images,
        bodyText: document.body.innerText.slice(0, 500)
      };
    });

    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.log(JSON.stringify({
      error: error.message,
      url
    }, null, 2));
    process.exit(1);
  } finally {
    await browser.close();
  }
}

scrapePage();
