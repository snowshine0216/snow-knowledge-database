/**
 * geektime-adapter.mjs — Adapter for Geektime (time.geekbang.org).
 *
 * enumerate(): calls Geektime internal API directly (no browser needed).
 * play(): connects to an existing CDP page object (provided by runner.mjs).
 */

import fs from "fs";
import { loadCookies, waitForMarkerFile, waitForVideoEnd } from "../utils.mjs";
import { sanitizeTitle, parseGeektimeCourseUrl, buildLectureUrl } from "../pure.mjs";
import { ffmpegReadyPath, videoEndedPath } from "../pathConstants.mjs";

// ── Geektime API constants ─────────────────────────────────────────────────────

const GEEKTIME_VIDEO_API  = "https://time.geekbang.org/serv/v3/column/articles";
const GEEKTIME_COLUMN_API = "https://time.geekbang.org/serv/v1/column/articles";
const API_PAGE_SIZE = 500;

// ── Geektime API enumerate ─────────────────────────────────────────────────────

/**
 * @param {string} url
 * @param {Array<{name,value,domain}>} cookies
 * @returns {Promise<import('../adapters/adapter-interface.mjs').Lecture[]>}
 */
async function enumerate(url, cookies) {
  const { type, id } = parseGeektimeCourseUrl(url);
  console.error(`INFO: Fetching lecture list for course ${id} (${type}) via Geektime API`);

  const endpoint = type === "video" ? GEEKTIME_VIDEO_API : GEEKTIME_COLUMN_API;

  // Only send geekbang.org cookies to avoid 400 "header too large".
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
      cid: id,
      order: "earliest",
      prev: 0,
      sample: false,
      size: API_PAGE_SIZE,
    }),
  });

  const response = await res.json();
  const articles = response?.data?.list || [];
  if (articles.length === 0) {
    throw new Error(`Geektime API returned 0 lectures for course ${id}. Check authentication.`);
  }

  const validArticles = articles.filter((a) => {
    if (a.id == null || a.id === "") {
      console.error(`WARNING: Skipping article with missing id (title: ${a.article_title || a.title || "unknown"})`);
      return false;
    }
    return true;
  });

  // Extract course title from the first article's column info (may be absent).
  const course_title = sanitizeTitle(
    response?.data?.column?.column_title ||
    validArticles[0]?.column_title ||
    ""
  );

  return validArticles.map((a, i) => ({
    idx: String(i + 1).padStart(3, "0"),
    title: sanitizeTitle(a.article_title || a.title || `lecture-${i + 1}`),
    url: buildLectureUrl(type, id, a.id),
    duration: a.video_time || a.audio_time || 0,
    course_title,
  }));
}

// ── Geektime play ──────────────────────────────────────────────────────────────

/**
 * @param {import('playwright').Page} page  - Provided by runner.mjs (CDP page)
 * @param {string} url
 * @param {{ playbackSpeed: number, sessionId: string, durationSec?: number }} opts
 */
async function play(page, url, opts) {
  const { playbackSpeed, sessionId, durationSec = 0 } = opts;
  const readyFile = ffmpegReadyPath(sessionId);
  const endedFile = videoEndedPath(sessionId);

  // Clear saved video progress from localStorage before navigating.
  // Geektime uses Aliyun Prism Player which restores watch position from localStorage.
  // This clear is intentionally Geektime-specific — do NOT copy to other adapters.
  await page.evaluate(() => {
    try { localStorage.clear(); } catch (_) {}
    try { sessionStorage.clear(); } catch (_) {}
  }).catch(() => {});

  // Navigate to lecture
  console.error(`INFO: Navigating to ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  console.error(`INFO: Page loaded — title: ${await page.title()}`);

  // Clear again after navigation on the new origin before player initializes.
  await page.evaluate(() => {
    try { localStorage.clear(); } catch (_) {}
    try { sessionStorage.clear(); } catch (_) {}
    try {
      for (const key of Object.keys(localStorage)) {
        if (/progress|time|position|current/i.test(key)) {
          localStorage.removeItem(key);
        }
      }
    } catch (_) {}
  }).catch(() => {});

  // Wait for ffmpeg ready signal before clicking play
  const ready = await waitForMarkerFile(readyFile, 15000);
  if (!ready) {
    console.error("ERROR: ffmpeg ready signal not received within 15s. Aborting play.");
    process.exit(1);
  }

  // Wait for video element
  console.error("INFO: Waiting for video element...");
  await page.waitForFunction(
    () => document.querySelector("video") !== null,
    { timeout: 30000 }
  ).catch(() => console.error("WARNING: No video element found within 30s, proceeding anyway."));

  // Seek to beginning in case player restored a saved position
  await page.evaluate(() => {
    const v = document.querySelector("video");
    if (v && v.currentTime > 0) { v.currentTime = 0; }
  }).catch(() => {});
  await new Promise((r) => setTimeout(r, 500));

  // Geektime uses Aliyun Prism Player — these selectors are specific to this platform.
  // Do NOT share with other adapters.
  const playSelectors = [
    ".prism-big-play-btn",
    ".prism-play-btn",
    ".xgplayer-play",
    "button[aria-label='play']",
    "button[aria-label='播放']",
    ".video-btn-play",
    ".play-btn",
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

  // Post-play seek: if player restored a saved position, force back to 0
  if (videoState && videoState.ct > 5) {
    console.error(`INFO: Post-play seek to 0 (ct was ${videoState.ct})`);
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        const v = document.querySelector("video");
        if (v) { v.currentTime = 0; }
      }).catch(() => {});
      await new Promise((r) => setTimeout(r, 500));
      const stateCheck = await applySpeed();
      if (stateCheck && stateCheck.ct < 5) {
        console.error(`INFO: Post-play seek succeeded on attempt ${i + 1}: ct=${stateCheck.ct}`);
        break;
      }
    }
  }

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

export function createGeektimeAdapter() {
  return { name: "geektime", enumerate, play };
}
