/**
 * deeplearning-ai-adapter.mjs — Adapter for DeepLearning.AI (learn.deeplearning.ai).
 *
 * enumerate(): Fetches the course page HTML, parses __NEXT_DATA__ (Next.js SSR) to get
 *   the lesson list from trpcState, and extracts URL slugs from the sidebar links.
 *   Skips quiz-type lessons (no video). Returns lessons in sidebar display order.
 *
 *   URL pattern: https://learn.deeplearning.ai/courses/{course-slug}/lesson/{lesson-id}/{slug}
 *
 * play(): Navigates to the lesson URL, waits for the Vidstack player to initialize
 *   (video.currentSrc becomes non-empty), then uses video.play() directly.
 *   Uses waitForVideoEnd() for end detection.
 */

import fs from "fs";
import { waitForMarkerFile, waitForVideoEnd } from "../utils.mjs";
import { sanitizeTitle } from "../pure.mjs";
import { ffmpegReadyPath, videoEndedPath } from "../pathConstants.mjs";

const DLA_BASE = "https://learn.deeplearning.ai";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Parse a DeepLearning.AI course URL to extract the course slug.
 * @param {string} url
 * @returns {{ courseSlug: string }|null}
 */
function parseCourseUrl(url) {
  let normalized;
  try {
    normalized = new URL(url);
  } catch {
    return null;
  }
  if (normalized.hostname !== "learn.deeplearning.ai") return null;
  const match = normalized.pathname.match(/^\/courses\/([^/]+)/);
  if (!match) return null;
  return { courseSlug: match[1] };
}

/**
 * Build a Cookie header string from Playwright cookie objects.
 * Only includes cookies relevant to deeplearning.ai.
 * @param {Array<{name:string,value:string,domain:string}>} cookies
 * @returns {string}
 */
function buildCookieHeader(cookies) {
  return cookies
    .filter((c) => c.domain && c.domain.includes("deeplearning.ai"))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

// ── DeepLearning.AI enumerate ─────────────────────────────────────────────────

/**
 * Enumerate all video lessons in a DeepLearning.AI course.
 *
 * Uses fetch to get the course page HTML, then parses __NEXT_DATA__ for lesson metadata
 * and extracts sidebar links for the correct URL slugs and display order.
 * Quizzes (type === "quiz") are excluded.
 *
 * @param {string} url  - Any lesson URL under the course, or the course root
 * @param {Array<{name,value,domain}>} cookies - Playwright cookies from cookie file
 * @returns {Promise<import('./adapter-interface.mjs').Lecture[]>}
 */
async function enumerate(url, cookies) {
  const parsed = parseCourseUrl(url);
  if (!parsed) {
    throw new Error(`deeplearning-ai-adapter: Cannot parse course slug from URL: ${url}`);
  }
  const { courseSlug } = parsed;

  // Fetch the course page — any lesson URL works since __NEXT_DATA__ includes all lessons
  const fetchUrl = url.startsWith(`${DLA_BASE}/courses/${courseSlug}/lesson/`)
    ? url
    : `${DLA_BASE}/courses/${courseSlug}`;

  console.error(`INFO: Fetching course page: ${fetchUrl}`);
  const cookieHeader = buildCookieHeader(cookies);

  const res = await fetch(fetchUrl, {
    headers: {
      Cookie: cookieHeader,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: `${DLA_BASE}/`,
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(
      `deeplearning-ai-adapter: HTTP ${res.status} fetching ${fetchUrl}. ` +
        `FIX: Re-login to deeplearning.ai in Chrome and re-export cookies.`
    );
  }

  const html = await res.text();

  // Extract __NEXT_DATA__ JSON
  const nextDataMatch = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!nextDataMatch) {
    throw new Error(
      `deeplearning-ai-adapter: Could not find __NEXT_DATA__ in page HTML. ` +
        `FIX: Check authentication — page may have redirected to login.`
    );
  }

  let nextData;
  try {
    nextData = JSON.parse(nextDataMatch[1]);
  } catch (err) {
    throw new Error(`deeplearning-ai-adapter: Failed to parse __NEXT_DATA__: ${err.message}`);
  }

  const props = nextData.props?.pageProps;
  const query = props?.trpcState?.json?.queries?.[0];
  const courseData = query?.state?.data;
  const lessonsObj = courseData?.lessons;

  if (!lessonsObj || typeof lessonsObj !== "object") {
    throw new Error(
      `deeplearning-ai-adapter: No lessons found in __NEXT_DATA__ for course "${courseSlug}". ` +
        `FIX: Ensure you are logged in and have access to this course.`
    );
  }

  const courseTitle = courseData?.name || courseSlug;
  console.error(`INFO: Course: "${courseTitle}", found ${Object.keys(lessonsObj).length} lessons in __NEXT_DATA__`);

  // Build URL slug lookup from HTML sidebar links.
  // The regex matches href="/courses/.../lesson/{id}/{slug}" in the server-rendered HTML.
  // We use __NEXT_DATA__ insertion order as the authoritative lesson order, not HTML order,
  // because HTML may have prev/next navigation buttons that appear before the sidebar.
  const linkRegex = /href="\/courses\/[^"]+\/lesson\/([a-z0-9]+)\/([^"]+)"/g;
  const slugByLessonId = new Map();
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    if (!slugByLessonId.has(m[1])) {
      slugByLessonId.set(m[1], m[2]);
    }
  }

  console.error(`INFO: Found ${slugByLessonId.size} lesson slugs in HTML`);

  // Build lecture list: use __NEXT_DATA__ Object.keys order (JSON preserves insertion order),
  // skip quizzes, derive URL slugs from HTML lookup.
  const lectures = [];
  for (const [lessonId, meta] of Object.entries(lessonsObj)) {
    if (meta.type === "quiz") {
      console.error(`INFO: Skipping quiz lesson: ${meta.name} (${lessonId})`);
      continue;
    }

    // Prefer HTML-extracted slug; fall back to slugifying the lesson name
    const slug =
      slugByLessonId.get(lessonId) ||
      (meta.name || lessonId).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    lectures.push({
      idx: String(lectures.length + 1).padStart(3, "0"),
      title: sanitizeTitle(meta.name || slug),
      url: `${DLA_BASE}/courses/${courseSlug}/lesson/${lessonId}/${slug}`,
      duration: meta.durationSeconds || 0,
      course_title: sanitizeTitle(courseTitle),
    });
  }

  if (lectures.length === 0) {
    throw new Error(
      `deeplearning-ai-adapter: No video lessons found for course "${courseSlug}". ` +
        `All lessons may be quizzes, or authentication may have failed.`
    );
  }

  console.error(`INFO: Returning ${lectures.length} video lessons (quizzes excluded)`);
  return lectures;
}

// ── DeepLearning.AI play ───────────────────────────────────────────────────────

/**
 * Play a DeepLearning.AI lesson using the Vidstack player.
 *
 * Navigates to the lesson URL, waits for the Vidstack player to load
 * (video.currentSrc becomes non-empty), then triggers playback via video.play()
 * and sets playback rate. Falls back to clicking the player area if needed.
 *
 * @param {import('playwright').Page} page
 * @param {string} url
 * @param {{ playbackSpeed: number, sessionId: string, durationSec?: number }} opts
 */
async function play(page, url, opts) {
  const { playbackSpeed, sessionId, durationSec = 0 } = opts;
  const readyFile = ffmpegReadyPath(sessionId);
  const endedFile = videoEndedPath(sessionId);

  console.error(`INFO: Navigating to ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  console.error(`INFO: Page loaded — title: ${await page.title()}`);

  // Wait for ffmpeg ready signal before triggering playback
  const ready = await waitForMarkerFile(readyFile, 15000);
  if (!ready) {
    console.error("ERROR: ffmpeg ready signal not received within 15s. Aborting play.");
    process.exit(1);
  }

  // Wait for the Vidstack player to initialize: poll until video has a src
  console.error("INFO: Waiting for Vidstack player to initialize (video.currentSrc)...");
  const playerReady = await page.waitForFunction(
    () => {
      const v = document.querySelector("video");
      return v && (v.currentSrc || v.src || v.readyState >= 2);
    },
    { timeout: 20000 }
  ).then(() => true).catch(() => false);

  if (!playerReady) {
    // Fallback: click the player area to trigger lazy initialization
    console.error("INFO: Player not initialized — clicking player area to trigger load...");
    await page.click('[data-media-provider], .lesson-video-player, video', { timeout: 5000 }).catch(() => {});
    await page.waitForFunction(
      () => {
        const v = document.querySelector("video");
        return v && (v.currentSrc || v.src || v.readyState >= 2);
      },
      { timeout: 15000 }
    ).catch(() => console.error("WARNING: Video src still not set after click — proceeding anyway."));
  }

  await new Promise((r) => setTimeout(r, 500));

  // Trigger playback: try Vidstack play button selectors first, then video.play()
  const playSelectors = [
    // Vidstack v2 selectors
    "[data-media-play-button]",
    ".vds-play-button",
    "media-play-button",
    // Generic
    "button[aria-label='Play']",
    "button[aria-label='play']",
    "[class*='play-button']",
  ];

  let clicked = false;
  for (const sel of playSelectors) {
    const btn = page.locator(sel).first();
    const ok = await btn.click({ timeout: 2000 }).then(() => true).catch(() => false);
    if (ok) {
      console.error(`INFO: Clicked play via ${sel}`);
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    // Direct video.play() — works with Vidstack's underlying <video> element
    await page.evaluate(() => {
      const v = document.querySelector("video");
      if (v) v.play().catch(() => {});
    }).catch(() => {});
    console.error("INFO: No play button found — triggered video.play() directly");
  }

  await new Promise((r) => setTimeout(r, 1000));

  // Set playback speed; repeat every 5s to survive Vidstack's rate resets
  const applySpeed = () =>
    page.evaluate((s) => {
      const v = document.querySelector("video");
      if (v) {
        v.playbackRate = s;
        return { rate: v.playbackRate, ct: v.currentTime, dur: v.duration, paused: v.paused };
      }
      return null;
    }, playbackSpeed).catch(() => null);

  const videoState = await applySpeed();
  console.error(`INFO: Video state after play: ${JSON.stringify(videoState)}`);

  const speedInterval = setInterval(() => applySpeed().catch(() => {}), 5000);

  // Wall-clock safety timer (fires ended marker when duration/speed is known)
  let wallTimerHandle = null;
  if (durationSec > 0) {
    const wallMs = Math.ceil((durationSec * 1000) / playbackSpeed) + 60000;
    console.error(
      `INFO: Wall-clock safety timer set for ${wallMs}ms (${Math.round(wallMs / 1000)}s)`
    );
    wallTimerHandle = setTimeout(() => {
      console.error("INFO: Wall-clock safety timer fired — writing ended marker");
      try {
        fs.writeFileSync(endedFile, "ended");
      } catch (_) {}
    }, wallMs);
  }

  const endTier = await waitForVideoEnd(page, durationSec);
  console.error(`INFO: Video ended via ${endTier}`);
  clearInterval(speedInterval);
  if (wallTimerHandle) clearTimeout(wallTimerHandle);

  fs.writeFileSync(endedFile, "ended");
}

// ── Factory ────────────────────────────────────────────────────────────────────

export function createDeeplearningAiAdapter() {
  return { name: "deeplearning-ai", enumerate, play };
}
