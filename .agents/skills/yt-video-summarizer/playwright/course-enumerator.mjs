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

/**
 * Parse cookies from Netscape format (yt-dlp output)
 * @param {string} cookiesText - Cookie file content
 * @returns {Array} Playwright-compatible cookie objects
 */
function parseCookiesFromNetscapeFormat(cookiesText) {
  const cookies = [];
  const lines = cookiesText.split('\n');

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') continue;

    const parts = line.split('\t');
    if (parts.length < 7) continue;

    const [domain, domainFlag, path, secure, expires, name, value] = parts;

    // Handle expires field - Playwright expects -1 for session cookies or positive unix timestamp in SECONDS
    let expiresValue = -1;
    if (expires && expires !== '0') {
      const expiresNum = parseInt(expires);
      if (!isNaN(expiresNum) && expiresNum > 0) {
        // Chrome exports in microseconds, convert to seconds for Playwright
        if (expiresNum > 9999999999) {
          // If longer than 10 digits, likely microseconds - convert to seconds
          expiresValue = Math.floor(expiresNum / 1000000);
        } else {
          expiresValue = expiresNum;
        }
      }
    }

    cookies.push({
      name: name,
      value: value,
      domain: domain.startsWith('.') ? domain.slice(1) : domain,
      path: path,
      expires: expiresValue,
      httpOnly: false, // Netscape format doesn't specify this
      secure: secure.toLowerCase() === 'true',
      sameSite: 'None' // Default for cross-site cookies
    });
  }

  return cookies;
}

async function enumerateCourse(courseUrl, options = {}) {
  const {
    headless = true,
    timeout = 30000,
    userDataDir = null,
    usePersistentContext = false,
    cookieFile = null
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
  if (cookieFile) {
    console.log(`Using cookies from: ${cookieFile}`);
  }

  let browser, context, page;

  try {
    // Create browser context with optional persistent session
    if (usePersistentContext && userDataDir) {
      // Use persistent context for cookie/session persistence
      console.log(`Using persistent context: ${userDataDir}`);
      context = await chromium.launchPersistentContext(userDataDir, {
        headless,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      browser = context.browser(); // For cleanup compatibility
    } else {
      // Regular browser launch
      const launchOptions = {
        headless,
        timeout
      };

      browser = await chromium.launch(launchOptions);
      const contextOptions = {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };

      // Add cookies if provided
      if (cookieFile) {
        try {
          const cookiesText = fs.readFileSync(cookieFile, 'utf8');
          const cookies = parseCookiesFromNetscapeFormat(cookiesText);
          if (cookies.length > 0) {
            contextOptions.storageState = {
              cookies: cookies,
              origins: []
            };
            console.log(`Loaded ${cookies.length} cookies from file`);
          }
        } catch (error) {
          console.log(`Warning: Could not load cookies: ${error.message}`);
        }
      }

      context = await browser.newContext(contextOptions);
    }

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
    if (context && !usePersistentContext) await context.close();
    if (browser) await browser.close();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const courseUrl = args[0];

  if (!courseUrl) {
    console.error('Usage: node course-enumerator.mjs <course-url> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --no-headless              Run with visible browser');
    console.error('  --persistent                Use persistent context for cookies');
    console.error('  --use-cookies               Alias for --persistent');
    console.error('  --user-data-dir <path>      Use specific user data directory');
    console.error('  --cookies <file>            Import cookies from Netscape format file');
    console.error('');
    console.error('Environment Variables:');
    console.error('  PLAYWRIGHT_USER_DATA_DIR    Default user data directory');
    console.error('');
    console.error('Cookie Import:');
    console.error('  Export cookies from your browser using yt-dlp:');
    console.error('  yt-dlp --cookies-from-browser chrome --cookies cookies.txt \\');
    console.error('    --skip-download <course-url>');
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
    userDataDir: process.env.PLAYWRIGHT_USER_DATA_DIR || null,
    usePersistentContext: args.includes('--persistent') || args.includes('--use-cookies'),
    cookieFile: null
  };

  // Override userDataDir if --user-data-dir is provided
  const userDataIndex = args.indexOf('--user-data-dir');
  if (userDataIndex !== -1 && userDataIndex + 1 < args.length) {
    options.userDataDir = args[userDataIndex + 1];
    options.usePersistentContext = true;
  }

  // Check for --cookies flag
  const cookiesIndex = args.indexOf('--cookies');
  if (cookiesIndex !== -1 && cookiesIndex + 1 < args.length) {
    options.cookieFile = args[cookiesIndex + 1];
  }

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