/**
 * geekbang-u-adapter.mjs — Adapter for Geek University (u.geekbang.org/lesson/{id}).
 *
 * enumerate(): navigates to the lesson URL and extracts title from the page.
 *   Each u.geekbang.org/lesson/{id} URL is a single lesson (not a multi-lesson listing),
 *   so enumerate() returns a one-item array with the lesson as its only lecture.
 *
 * play(): navigates to the URL, waits for the standard <video> element, clicks play,
 *   and delegates video-end detection to waitForVideoEnd() from utils.mjs.
 *   No localStorage clear needed (u.geekbang.org does not use Aliyun Prism Player).
 */

import fs from "fs";
import { waitForMarkerFile, waitForVideoEnd } from "../utils.mjs";
import { sanitizeTitle, parseGeekbangUUrl } from "../pure.mjs";
import { ffmpegReadyPath, videoEndedPath } from "../pathConstants.mjs";

// ── Geekbang-U enumerate ───────────────────────────────────────────────────────

/**
 * Navigate to the lesson page and extract its title + course_title.
 * Returns a single-item lecture list (one URL = one lesson).
 *
 * NOTE: enumerate() for this adapter requires a browser (Playwright page).
 * We use a lightweight fetch + HTML parse to avoid spinning up CDP just for enumerate.
 * Falls back to the URL itself as the title if the fetch fails.
 *
 * @param {string} url
 * @param {Array<{name,value,domain}>} cookies
 * @returns {Promise<import('./adapter-interface.mjs').Lecture[]>}
 */
async function enumerate(url, cookies) {
  const parsed = parseGeekbangUUrl(url);
  if (!parsed) {
    throw new Error(`geekbang-u-adapter: Cannot parse lesson ID from URL: ${url}`);
  }
  const { lessonId } = parsed;

  console.error(`INFO: Fetching lesson metadata for lesson ${lessonId}`);

  // Try to fetch the page HTML to extract the title.
  const cookieHeader = cookies
    .filter((c) => c.domain && (c.domain.includes("geekbang.org") || c.domain.includes("u.geekbang.org")))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  let title = `lesson-${lessonId}`;
  let course_title = "";

  try {
    const res = await fetch(url, {
      headers: {
        "Cookie": cookieHeader,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/136 Safari/537.36",
        "Referer": "https://u.geekbang.org/",
      },
    });
    if (res.ok) {
      const html = await res.text();

      // Try <title> tag first — typically "Lesson Title - Geek University" or similar
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        const rawTitle = titleMatch[1].trim();
        // Strip common suffixes like " - 极客大学" or " | 极客时间"
        const cleaned = rawTitle.replace(/\s*[-|].*$/, "").trim();
        if (cleaned) {
          title = sanitizeTitle(cleaned);
          course_title = sanitizeTitle(rawTitle);
        }
      }

      // Try <h1> as a fallback for a more specific lesson title
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (h1Match) {
        const h1Text = h1Match[1].trim();
        if (h1Text) {
          title = sanitizeTitle(h1Text);
        }
      }
    }
  } catch (err) {
    console.error(`WARNING: Could not fetch lesson page for title extraction: ${err.message}`);
  }

  console.error(`INFO: Lesson title: "${title}", course_title: "${course_title}"`);

  return [{
    idx: "001",
    title,
    url,
    duration: 0,
    course_title: course_title || title,
  }];
}

// ── Geekbang-U play ────────────────────────────────────────────────────────────

/**
 * @param {import('playwright').Page} page  - Provided by runner.mjs (CDP page)
 * @param {string} url
 * @param {{ playbackSpeed: number, sessionId: string, durationSec?: number }} opts
 */
async function play(page, url, opts) {
  const { playbackSpeed, sessionId, durationSec = 0 } = opts;
  const readyFile = ffmpegReadyPath(sessionId);
  const endedFile = videoEndedPath(sessionId);

  // Navigate to lesson (no localStorage clear — u.geekbang.org does not use Aliyun Prism Player)
  console.error(`INFO: Navigating to ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  console.error(`INFO: Page loaded — title: ${await page.title()}`);

  // Wait for ffmpeg ready signal before clicking play
  const ready = await waitForMarkerFile(readyFile, 15000);
  if (!ready) {
    console.error("ERROR: ffmpeg ready signal not received within 15s. Aborting play.");
    process.exit(1);
  }

  // Wait for video element (confirmed present via spike)
  console.error("INFO: Waiting for video element...");
  await page.waitForFunction(
    () => document.querySelector("video") !== null,
    { timeout: 30000 }
  ).catch(() => console.error("WARNING: No video element found within 30s, proceeding anyway."));

  await new Promise((r) => setTimeout(r, 500));

  // u.geekbang.org play button selectors (may need tuning after first live run).
  // These are intentionally separate from geektime-adapter's selectors.
  const playSelectors = [
    ".xgplayer-play",
    ".xgplayer-start",
    "button[aria-label='play']",
    "button[aria-label='播放']",
    ".play-btn",
    ".video-play-btn",
  ];
  let clicked = false;
  for (const sel of playSelectors) {
    const btn = page.locator(sel).first();
    const ok = await btn.click({ timeout: 3000 }).then(() => true).catch(() => false);
    if (ok) { console.error(`INFO: Clicked play via ${sel}`); clicked = true; break; }
  }
  if (!clicked) {
    await page.evaluate(() => {
      const v = document.querySelector("video");
      if (v && v.paused) v.play().catch(() => {});
    }).catch(() => {});
    console.error("INFO: No play button found — used video.play() directly");
  }

  const applySpeed = () =>
    page.evaluate((s) => {
      const video = document.querySelector("video");
      if (video) {
        video.playbackRate = s;
        return { rate: video.playbackRate, ct: video.currentTime, dur: video.duration, paused: video.paused };
      }
      return null;
    }, playbackSpeed).catch(() => null);

  const videoState = await applySpeed();
  console.error(`INFO: Video state after play: ${JSON.stringify(videoState)}`);

  const speedInterval = setInterval(() => applySpeed().catch(() => {}), 5000);

  // Wall-clock safety timer
  let wallTimerHandle = null;
  if (durationSec > 0) {
    const wallMs = Math.ceil(durationSec * 1000 / playbackSpeed) + 60000;
    console.error(`INFO: Wall-clock safety timer set for ${wallMs}ms (${Math.round(wallMs/1000)}s)`);
    wallTimerHandle = setTimeout(() => {
      console.error(`INFO: Wall-clock safety timer fired — writing ended marker`);
      try { fs.writeFileSync(endedFile, "ended"); } catch (_) {}
    }, wallMs);
  }

  const endTier = await waitForVideoEnd(page, durationSec);
  console.error(`INFO: Video ended via ${endTier}`);
  clearInterval(speedInterval);
  if (wallTimerHandle) clearTimeout(wallTimerHandle);

  fs.writeFileSync(endedFile, "ended");
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createGeekbangUAdapter() {
  return { name: "geekbang-u", enumerate, play };
}
