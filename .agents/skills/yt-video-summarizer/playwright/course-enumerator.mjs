#!/usr/bin/env node

/**
 * Course enumeration runner for yt-video-summarizer
 * Extracts video URLs from course pages using Playwright
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Import all adapters
import './adapters/deeplearning-ai-adapter.mjs';
import './adapters/coursera-adapter.mjs';
import './adapters/udemy-adapter.mjs';
import { resolveAdapter, supportedUrlPatterns } from './adapters/adapter-interface.mjs';

async function enumerateCourse(courseUrl, options = {}) {
  const {
    headless = true,
    timeout = 30000,
    userDataDir = null
  } = options;

  console.log(`Starting course enumeration for: ${courseUrl}`);

  // Find appropriate adapter
  const adapter = resolveAdapter(courseUrl);
  if (!adapter) {
    console.error('ERROR: Unsupported URL:', courseUrl);
    console.error('Supported platforms:');
    for (const pattern of supportedUrlPatterns()) {
      console.error(`  - ${pattern}`);
    }
    process.exit(1);
  }

  console.log(`Using adapter: ${adapter.name}`);

  let browser, page;

  try {
    // Launch browser
    const launchOptions = {
      headless,
      timeout
    };

    if (userDataDir) {
      launchOptions.userDataDir = userDataDir;
    }

    browser = await chromium.launch(launchOptions);
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    page = await context.newPage();

    // Set reasonable timeouts
    page.setDefaultTimeout(timeout);
    page.setDefaultNavigationTimeout(timeout);

    // Enumerate lessons using the adapter
    const lessons = await adapter.enumerate(page, courseUrl);

    return lessons;

  } catch (error) {
    console.error('Error during enumeration:', error);
    throw error;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const courseUrl = args[0];

  if (!courseUrl) {
    console.error('Usage: node course-enumerator.mjs <course-url>');
    console.error('');
    console.error('Supported platforms:');
    for (const pattern of supportedUrlPatterns()) {
      console.error(`  - ${pattern}`);
    }
    process.exit(1);
  }

  // Parse options
  const options = {
    headless: !args.includes('--no-headless'),
    timeout: 30000,
    userDataDir: process.env.PLAYWRIGHT_USER_DATA_DIR || null
  };

  try {
    const lessons = await enumerateCourse(courseUrl, options);

    // Output as JSON for consumption by other scripts
    console.log('=== ENUMERATION RESULT ===');
    console.log(JSON.stringify(lessons, null, 2));

  } catch (error) {
    console.error('Enumeration failed:', error.message);
    process.exit(1);
  }
}

// Export for programmatic use
export { enumerateCourse };

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}