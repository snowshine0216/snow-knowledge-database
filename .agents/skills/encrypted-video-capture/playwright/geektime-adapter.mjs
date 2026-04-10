#!/usr/bin/env node
/**
 * geektime-adapter.mjs — Playwright adapter for Geektime (time.geekbang.org).
 *
 * Actions:
 *   --action enumerate  Enumerate lectures for a course URL (JSON to stdout)
 *   --action play       Navigate to a lecture and click play; write video-ended marker on finish
 *
 * Usage:
 *   node geektime-adapter.mjs --action enumerate --url <course-url> --cookies <cookie-file>
 *   node geektime-adapter.mjs --action play --url <lecture-url> --cookies <cookie-file> \
 *     --session-id <id> [--duration <sec>]
 */

import { chromium } from "playwright";
import { parseArgs } from "node:util";
import fs from "fs";
import { loadCookies, waitForMarkerFile, waitForVideoEnd } from "./utils.mjs";
import { sanitizeTitle, parseGeektimeCourseUrl, buildLectureUrl } from "./pure.mjs";
import { ffmpegReadyPath, videoEndedPath } from "./pathConstants.mjs";

// ── Argument parsing ──────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    action:     { type: "string" },
    url:        { type: "string" },
    cookies:    { type: "string" },
    "session-id": { type: "string", default: "" },
    duration:   { type: "string", default: "0" },
  },
  allowPositionals: false,
});

if (!args.action || !args.url) {
  console.error("Usage: geektime-adapter.mjs --action <enumerate|play> --url <url> --cookies <file>");
  process.exit(1);
}

// ── Geektime API constants ────────────────────────────────────────────────────

const GEEKTIME_VIDEO_API  = "https://time.geekbang.org/serv/v3/column/articles";
const GEEKTIME_COLUMN_API = "https://time.geekbang.org/serv/v1/column/articles";
const API_PAGE_SIZE = 500;

// ── Geektime API helpers ──────────────────────────────────────────────────────

/**
 * Call the Geektime column/video articles API directly from Node.js.
 * Bypasses Chrome entirely for enumerate — no page.goto() needed.
 * @param {Array<{name,value,domain}>} cookies  - from loadCookies()
 * @param {string} courseId
 * @param {string} courseType
 * @returns {Promise<Array<{idx: string, title: string, url: string, duration: number}>>}
 */
async function fetchLectureList(cookies, courseId, courseType) {
  const endpoint = courseType === "video" ? GEEKTIME_VIDEO_API : GEEKTIME_COLUMN_API;

  // Build Cookie header — only send geekbang.org cookies to avoid 400 "header too large".
  const cookieHeader = cookies
    .filter((c) => c.domain && c.domain.includes("geekbang.org"))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
      "Origin": "https://time.geekbang.org",
      "Referer": "https://time.geekbang.org/",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/136 Safari/537.36",
    },
    body: JSON.stringify({
      cid: courseId,
      order: "earliest",
      prev: 0,
      sample: false,
      size: API_PAGE_SIZE,
    }),
  });

  const response = await res.json();
  const articles = response?.data?.list || [];
  if (articles.length === 0) {
    throw new Error(`Geektime API returned 0 lectures for course ${courseId}. Check authentication.`);
  }

  const validArticles = articles.filter((a) => {
    if (a.id == null || a.id === "") {
      console.error(`WARNING: Skipping article with missing id (title: ${a.article_title || a.title || "unknown"})`);
      return false;
    }
    return true;
  });

  return validArticles.map((a, i) => ({
    idx: String(i + 1).padStart(3, "0"),
    title: sanitizeTitle(a.article_title || a.title || `lecture-${i + 1}`),
    url: buildLectureUrl(courseType, courseId, a.id),
    duration: a.video_time || a.audio_time || 0,
  }));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const cookieFile = args.cookies || "";
  const cookies = cookieFile ? loadCookies(cookieFile) : [];

  // ── enumerate: pure HTTP fetch, no Chrome needed ────────────────────────────
  if (args.action === "enumerate") {
    const { type, id } = parseGeektimeCourseUrl(args.url);
    console.error(`INFO: Fetching lecture list for course ${id} (${type}) via API`);
    const lectures = await fetchLectureList(cookies, id, type);
    process.stdout.write(JSON.stringify(lectures, null, 2) + "\n");
    return;
  }

  // ── play: requires Chrome via CDP ────────────────────────────────────────────
  const CDP_URL = process.env.CHROME_CDP_URL || "http://127.0.0.1:9222";
  console.error(`INFO: Connecting to CDP at ${CDP_URL}`);
  const browser = await chromium.connectOverCDP(CDP_URL);
  console.error(`INFO: CDP connected`);
  const context = browser.contexts()[0] || await browser.newContext();

  // Reuse an existing live Geektime tab. Skip chrome:// internals and about:blank
  // — blank tabs can be in a dormant state that silently hangs on page.goto().
  const existingPages = context.pages();
  const navigatablePage = existingPages.find((p) => {
    const u = p.url();
    return !u.startsWith("chrome://") &&
           !u.startsWith("chrome-extension://") &&
           u !== "about:blank";
  });
  const page = navigatablePage || await context.newPage();
  console.error(`INFO: Using page: ${page.url()}`);

  // Bring the tab to front so Chrome doesn't throttle background-tab navigations.
  await page.bringToFront().catch(() => {});

  if (cookies.length > 0) {
    await context.addCookies(cookies);
  }

  if (args.action === "play") {
      const sessionId = args["session-id"];
      const duration = parseInt(args.duration || "0", 10);
      const readyFile = ffmpegReadyPath(sessionId);
      const endedFile = videoEndedPath(sessionId);

      // Navigate to lecture
      console.error(`INFO: Navigating to ${args.url}`);
      await page.goto(args.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      console.error(`INFO: Page loaded — title: ${await page.title()}`);

      // Wait for ffmpeg ready signal before clicking play
      if (sessionId) {
        const ready = await waitForMarkerFile(readyFile, 15000);
        if (!ready) {
          console.error("ERROR: ffmpeg ready signal not received within 15s. Aborting play.");
          process.exit(1);
        }
      }

      // Wait for video element to appear and load before interacting
      console.error("INFO: Waiting for video element...");
      await page.waitForFunction(
        () => Array.from(document.querySelectorAll("video")).some((v) => v.duration > 0),
        { timeout: 30000 }
      ).catch(() => console.error("WARNING: Video element not found within 30s, proceeding anyway."));

      // Click the play button
      const playButton = page
        .locator("button[aria-label='play'], .video-btn-play, .play-btn, [class*='play']")
        .first();
      await playButton.click({ timeout: 10000 }).catch(() => {
        // Some lectures auto-play; if no play button found, that's fine.
      });

      // Set playback speed (clamp to [1.0, 2.0], default 2.0 on invalid)
      const rawSpeed = parseFloat(process.env.PLAYBACK_SPEED || "2.0");
      const speed = isNaN(rawSpeed) ? 1.0 : Math.min(2.0, Math.max(1.0, rawSpeed));
      if (!isNaN(rawSpeed) && rawSpeed !== speed) {
        console.error(`WARNING: PLAYBACK_SPEED=${rawSpeed} out of range [1.0, 2.0], clamped to ${speed}.`);
      }
      const applySpeed = () =>
        page.evaluate((s) => {
          const video = document.querySelector("video");
          if (video) video.playbackRate = s;
        }, speed).catch(() => {});
      await applySpeed();
      const speedInterval = setInterval(applySpeed, 5000);

      // Wait for video to end
      const endTier = await waitForVideoEnd(page, duration);
      console.error(`INFO: Video ended via ${endTier}`);
      clearInterval(speedInterval);

      // Write ended marker
      if (sessionId) {
        fs.writeFileSync(endedFile, "ended");
      }
    } else {
      console.error(`Unknown action: ${args.action}`);
      process.exit(1);
    }
    // Leave the tab at its current URL (lecture page) so Chrome stays visible
    // and the next lecture can reuse this live tab.
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
