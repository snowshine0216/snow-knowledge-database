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
import { sanitizeTitle, parseGeektimeCourseUrl } from "./pure.mjs";
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
 * Call the Geektime column/video articles API to enumerate lectures.
 * @param {import('playwright').Page} page
 * @param {string} courseId
 * @param {string} courseType
 * @returns {Promise<Array<{idx: string, title: string, url: string, duration: number}>>}
 */
async function fetchLectureList(page, courseId, courseType) {
  const endpoint = courseType === "video" ? GEEKTIME_VIDEO_API : GEEKTIME_COLUMN_API;

  const response = await page.evaluate(
    async ({ endpoint, courseId, pageSize }) => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cid: courseId,
          order: "earliest",
          prev: 0,
          sample: false,
          size: pageSize,
        }),
        credentials: "include",
      });
      return res.json();
    },
    { endpoint, courseId, pageSize: API_PAGE_SIZE }
  );

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
    url: `https://time.geekbang.org/${courseType}/${courseId}/${a.id}`,
    duration: a.video_time || a.audio_time || 0,
  }));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const cookieFile = args.cookies || "";
  const cookies = cookieFile ? loadCookies(cookieFile) : [];

  const browser = await chromium.launch({
    headless: false,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--user-data-dir=/tmp/evc-chrome-profile"],
  });
  try {
    const context = await browser.newContext();

    if (cookies.length > 0) {
      await context.addCookies(cookies);
    }

    const page = await context.newPage();
    if (args.action === "enumerate") {
      await page.goto("https://time.geekbang.org", { waitUntil: "domcontentloaded", timeout: 30000 });

      const { type, id } = parseGeektimeCourseUrl(args.url);
      const lectures = await fetchLectureList(page, id, type);

      process.stdout.write(JSON.stringify(lectures, null, 2) + "\n");
    } else if (args.action === "play") {
      const sessionId = args["session-id"];
      const duration = parseInt(args.duration || "0", 10);
      const readyFile = ffmpegReadyPath(sessionId);
      const endedFile = videoEndedPath(sessionId);

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
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
