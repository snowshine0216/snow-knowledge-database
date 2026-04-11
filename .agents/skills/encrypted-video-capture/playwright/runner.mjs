#!/usr/bin/env node
/**
 * runner.mjs — Platform-agnostic CLI entrypoint for encrypted-video-capture.
 *
 * Owns the CDP browser context lifecycle. Dispatches to the correct platform adapter
 * based on the input URL. Replaces the old direct-call of geektime-adapter.mjs.
 *
 * Actions:
 *   --action enumerate  Enumerate lectures for a course/lesson URL (JSON to stdout)
 *   --action play       Navigate to a lecture and click play; write video-ended marker on finish
 *
 * Usage:
 *   node runner.mjs --action enumerate --url <url> --cookies <cookie-file>
 *   node runner.mjs --action play --url <url> --cookies <cookie-file> \
 *     --session-id <id> [--duration <sec>]
 */

import { chromium } from "playwright";
import { parseArgs } from "node:util";
import { loadCookies } from "./utils.mjs";
import { resolveAdapter, supportedUrlPatterns } from "./adapters/adapter-interface.mjs";

// ── Argument parsing ──────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    action:       { type: "string" },
    url:          { type: "string" },
    cookies:      { type: "string" },
    "session-id": { type: "string", default: "" },
    duration:     { type: "string", default: "0" },
    "dry-run":    { type: "boolean", default: false },
  },
  allowPositionals: false,
});

if (!args.action || !args.url) {
  console.error("Usage: runner.mjs --action <enumerate|play> --url <url> --cookies <file>");
  process.exit(1);
}

// ── URL validation and adapter resolution (fast-fail before any I/O) ─────────

const adapter = resolveAdapter(args.url);
if (!adapter) {
  console.error(`ERROR: Unsupported URL: ${args.url}`);
  console.error("Supported platforms:");
  for (const pattern of supportedUrlPatterns()) {
    console.error(`  - ${pattern}`);
  }
  process.exit(1);
}

if (args["dry-run"] && args.action === "enumerate") {
  console.error(`Adapter: ${adapter.name} (${args.url})`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const cookieFile = args.cookies || "";
  const cookies = cookieFile ? loadCookies(cookieFile) : [];

  // ── enumerate: adapter decides whether it needs a browser ──────────────────
  if (args.action === "enumerate") {
    console.error(`INFO: Enumerating via adapter "${adapter.name}" for ${args.url}`);
    const lectures = await adapter.enumerate(args.url, cookies);
    if (!lectures || lectures.length === 0) {
      console.error(
        `ERROR: No lectures found at ${args.url}. CAUSE: Empty list returned by adapter. FIX: Check cookies/authentication.`
      );
      process.exit(1);
    }
    process.stdout.write(JSON.stringify(lectures, null, 2) + "\n");
    return;
  }

  // ── play: requires Chrome via CDP ──────────────────────────────────────────
  if (args.action === "play") {
    const sessionId = args["session-id"];
    if (!sessionId) {
      console.error("ERROR: --session-id is required for play action");
      process.exit(1);
    }

    const CDP_URL = process.env.CHROME_CDP_URL || "http://127.0.0.1:9222";
    console.error(`INFO: Connecting to CDP at ${CDP_URL}`);
    const browser = await chromium.connectOverCDP(CDP_URL);
    console.error(`INFO: CDP connected — adapter: ${adapter.name}`);
    const context = browser.contexts()[0] || await browser.newContext();

    // Prefer a live navigatable tab; fall back to about:blank (fresh launch);
    // create a new page only if no tabs exist at all.
    const existingPages = context.pages();
    const navigatablePage =
      existingPages.find((p) => {
        const u = p.url();
        return !u.startsWith("chrome://") &&
               !u.startsWith("chrome-extension://") &&
               u !== "about:blank";
      }) ||
      existingPages.find((p) => {
        const u = p.url();
        return !u.startsWith("chrome://") && !u.startsWith("chrome-extension://");
      });
    const page = navigatablePage || await context.newPage();
    console.error(`INFO: Using page (${existingPages.length} existing): ${page.url()}`);

    // Bring tab to front so Chrome doesn't throttle background-tab navigations.
    await page.bringToFront().catch(() => {});

    if (cookies.length > 0) {
      await context.addCookies(cookies);
    }

    const playbackSpeed = (() => {
      const raw = parseFloat(process.env.PLAYBACK_SPEED || "2.0");
      if (isNaN(raw)) return 1.0;
      const clamped = Math.min(2.0, Math.max(1.0, raw));
      if (clamped !== raw) {
        console.error(`WARNING: PLAYBACK_SPEED=${raw} out of range [1.0, 2.0], clamped to ${clamped}.`);
      }
      return clamped;
    })();

    const durationSec = parseInt(args.duration || "0", 10);

    await adapter.play(page, args.url, { playbackSpeed, sessionId, durationSec });
    return;
  }

  console.error(`ERROR: Unknown action: ${args.action}. Use "enumerate" or "play".`);
  process.exit(1);
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
