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
import path from "path";
import { loadCookies, waitForMarkerFile, waitForVideoEnd } from "./utils.mjs";

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

// ── Sanitize title (mirrors SKILL.md sanitization rule) ──────────────────────

/**
 * Strip shell metacharacters from a Geektime API-returned title.
 * Preserves: ASCII alnum, spaces, hyphens, underscores, CJK unified ideographs.
 * Truncates to 80 chars.
 * @param {string} raw
 * @returns {string}
 */
function sanitizeTitle(raw) {
  return raw
    .replace(/[^\w \-\u4e00-\u9fff]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

// ── Geektime API helpers ──────────────────────────────────────────────────────

/**
 * Extract the product ID and type from a Geektime course URL.
 * Supports formats:
 *   /column/<id>   — text+audio column
 *   /video/<id>    — video course
 *   /course/<id>   — alias
 */
function parseGeektimeCourseUrl(url) {
  const match = url.match(/\/(column|video|course)\/(\d+)/);
  if (!match) throw new Error(`Cannot parse Geektime course ID from URL: ${url}`);
  return { type: match[1], id: match[2] };
}

/**
 * Call the Geektime column/video articles API to enumerate lectures.
 * @param {import('playwright').Page} page
 * @param {string} courseId
 * @param {string} courseType
 * @returns {Promise<Array<{idx: string, title: string, url: string, duration: number}>>}
 */
async function fetchLectureList(page, courseId, courseType) {
  const endpoint = courseType === "video"
    ? "https://time.geekbang.org/serv/v3/column/articles"
    : "https://time.geekbang.org/serv/v1/column/articles";

  const response = await page.evaluate(
    async ({ endpoint, courseId }) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cid: courseId,
          order: "earliest",
          prev: 0,
          sample: false,
          size: 500,
        }),
        credentials: "include",
      });
      return res.json();
    },
    { endpoint, courseId }
  );

  const articles = response?.data?.list || [];
  if (articles.length === 0) {
    throw new Error(`Geektime API returned 0 lectures for course ${courseId}. Check authentication.`);
  }

  return articles.map((a, i) => ({
    idx: String(i + 1).padStart(3, "0"),
    title: sanitizeTitle(a.article_title || a.title || `lecture-${i + 1}`),
    url: `https://time.geekbang.org/${courseType}/${courseId}/${a.id}`,
    duration: a.video_time || a.audio_time || 0,
  }));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const cookieFile = args.cookies || "";
  const cookies = cookieFile ? loadCookies(cookieFile) : [];

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  if (cookies.length > 0) {
    await context.addCookies(cookies);
  }

  const page = await context.newPage();

  try {
    if (args.action === "enumerate") {
      await page.goto("https://time.geekbang.org", { waitUntil: "domcontentloaded", timeout: 30000 });

      const { type, id } = parseGeektimeCourseUrl(args.url);
      const lectures = await fetchLectureList(page, id, type);

      process.stdout.write(JSON.stringify(lectures, null, 2) + "\n");
    } else if (args.action === "play") {
      const sessionId = args["session-id"];
      const duration = parseInt(args.duration || "0", 10);
      const readyFile = `/tmp/evc-ffmpeg-ready-${sessionId}`;
      const endedFile = `/tmp/evc-video-ended-${sessionId}`;

      // Navigate to lecture
      await page.goto(args.url, { waitUntil: "domcontentloaded", timeout: 30000 });

      // Wait for ffmpeg ready signal before clicking play
      if (sessionId) {
        const ready = await waitForMarkerFile(readyFile, 15000);
        if (!ready) {
          console.error("ERROR: ffmpeg ready signal not received within 15s. Aborting play.");
          process.exit(1);
        }
      }

      // Click the play button
      const playButton = page
        .locator("button[aria-label='play'], .video-btn-play, .play-btn, [class*='play']")
        .first();
      await playButton.click({ timeout: 10000 }).catch(() => {
        // Some lectures auto-play; if no play button found, that's fine.
      });

      // Wait for video to end
      await waitForVideoEnd(page, duration);

      // Write ended marker
      if (sessionId) {
        fs.writeFileSync(endedFile, "ended");
      }
    } else {
      console.error(`Unknown action: ${args.action}`);
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
