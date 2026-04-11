/**
 * geekbang-u-adapter.mjs — Adapter for Geek University (u.geekbang.org/lesson/{id}).
 *
 * enumerate(): given a class URL (https://u.geekbang.org/lesson/{classId}), calls
 *   serv/v1/myclass/info to get all chapters and articles, then batch-fetches each
 *   article via serv/v1/myclass/article to find those with a non-empty video_id.
 *   Returns one Lecture entry per video article, ordered by chapter and index.
 *
 *   Article URL format: https://u.geekbang.org/lesson/{classId}?article={articleId}
 *
 * play(): navigates to the URL, waits for the standard <video> element, clicks play,
 *   and delegates video-end detection to waitForVideoEnd() from utils.mjs.
 *   No localStorage clear needed (u.geekbang.org does not use Aliyun Prism Player).
 */

import fs from "fs";
import { waitForMarkerFile, waitForVideoEnd } from "../utils.mjs";
import { sanitizeTitle, parseGeekbangUUrl } from "../pure.mjs";
import { ffmpegReadyPath, videoEndedPath } from "../pathConstants.mjs";

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Build the Authorization header cookie string for u.geekbang.org.
 * @param {Array<{name:string,value:string,domain:string}>} cookies
 * @returns {string}
 */
function buildCookieHeader(cookies) {
  return cookies
    .filter((c) => c.domain && c.domain.includes("geekbang.org"))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

const GEEK_U_BASE = "https://u.geekbang.org";
const HEADERS = (cookieHeader) => ({
  "Cookie": cookieHeader,
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/136 Safari/537.36",
  "Referer": `${GEEK_U_BASE}/`,
  "Origin": GEEK_U_BASE,
});

/**
 * POST to a u.geekbang.org serv endpoint and return the parsed JSON data field.
 * @param {string} path
 * @param {object} body
 * @param {string} cookieHeader
 * @returns {Promise<object>}
 */
async function servPost(path, body, cookieHeader) {
  const res = await fetch(`${GEEK_U_BASE}${path}`, {
    method: "POST",
    headers: HEADERS(cookieHeader),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`serv POST ${path} failed: ${res.status}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`serv POST ${path} returned code ${json.code}: ${JSON.stringify(json.error)}`);
  return json.data;
}

/**
 * Check a batch of articles for video content.
 * Returns articles where video_id is non-empty, with duration in seconds.
 * Fetches up to BATCH_CONCURRENCY articles in parallel.
 * @param {number} classId
 * @param {Array<{article_id:number,article_title:string}>} articles
 * @param {string} cookieHeader
 * @returns {Promise<Array<{articleId:number,title:string,videoTimeSec:number}>>}
 */
async function batchCheckVideos(classId, articles, cookieHeader) {
  const CONCURRENCY = 10;
  const results = [];
  for (let i = 0; i < articles.length; i += CONCURRENCY) {
    const batch = articles.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map((art) =>
        servPost("/serv/v1/myclass/article", { class_id: classId, article_id: art.article_id }, cookieHeader)
          .then((data) => ({
            articleId: art.article_id,
            title: sanitizeTitle(data.article_title || art.article_title),
            videoId: data.video_id || "",
            videoTimeSec: data.video_time_second || 0,
          }))
          .catch((err) => {
            console.error(`WARNING: Could not fetch article ${art.article_id}: ${err.message}`);
            return null;
          })
      )
    );
    for (const s of settled) {
      if (s.status === "fulfilled" && s.value && s.value.videoId) {
        results.push(s.value);
      }
    }
    if (i + CONCURRENCY < articles.length) {
      console.error(`INFO: Checked ${Math.min(i + CONCURRENCY, articles.length)}/${articles.length} articles...`);
    }
  }
  return results;
}

// ── Geekbang-U enumerate ───────────────────────────────────────────────────────

/**
 * Enumerate all video articles in the class.
 * Calls serv/v1/myclass/info to get the chapter/article tree, then batch-fetches
 * each article to find those with video_id set.
 *
 * @param {string} url  - https://u.geekbang.org/lesson/{classId}
 * @param {Array<{name,value,domain}>} cookies
 * @returns {Promise<import('./adapter-interface.mjs').Lecture[]>}
 */
async function enumerate(url, cookies) {
  const parsed = parseGeekbangUUrl(url);
  if (!parsed) {
    throw new Error(`geekbang-u-adapter: Cannot parse lesson ID from URL: ${url}`);
  }
  const classId = parseInt(parsed.lessonId, 10);
  const cookieHeader = buildCookieHeader(cookies);

  console.error(`INFO: Fetching class info for class_id=${classId}`);
  const classInfo = await servPost("/serv/v1/myclass/info", { class_id: classId }, cookieHeader);

  // Extract course title from the first article's title suffix or fall back to class ID
  const courseTitle = classInfo.course_title
    ? sanitizeTitle(classInfo.course_title)
    : `class-${classId}`;
  const chapters = classInfo.lessons || [];

  // Flatten all articles, skipping homework (type=8) and known non-video titles
  const NON_VIDEO_TITLES = new Set(["课件下载", "课程满意度调查"]);
  const NON_VIDEO_CHAPTERS = new Set(["学习手册", "满意度调查"]);

  const candidates = [];
  for (const chapter of chapters) {
    const chName = chapter.chapter_name || "";
    if (NON_VIDEO_CHAPTERS.has(chName)) continue;
    for (const art of (chapter.articles || [])) {
      if (art.type === 8) continue;
      if (NON_VIDEO_TITLES.has(art.article_title)) continue;
      candidates.push({ article_id: art.article_id, article_title: art.article_title, chapter: chName });
    }
  }

  console.error(`INFO: Checking ${candidates.length} candidate articles for video content...`);
  const videoArticles = await batchCheckVideos(classId, candidates, cookieHeader);
  console.error(`INFO: Found ${videoArticles.length} video articles.`);

  if (videoArticles.length === 0) {
    throw new Error(`No video articles found in class_id=${classId}. Check authentication.`);
  }

  // Map article IDs to their chapter for labeling; preserve original order from classInfo
  const articleOrder = new Map();
  let globalIdx = 0;
  for (const chapter of chapters) {
    for (const art of (chapter.articles || [])) {
      articleOrder.set(art.article_id, globalIdx++);
    }
  }

  const sorted = videoArticles.sort((a, b) => {
    const oa = articleOrder.get(a.articleId) ?? 9999;
    const ob = articleOrder.get(b.articleId) ?? 9999;
    return oa - ob;
  });

  return sorted.map((art, i) => ({
    idx: String(i + 1).padStart(3, "0"),
    title: art.title,
    url: `${GEEK_U_BASE}/lesson/${classId}?article=${art.articleId}`,
    duration: art.videoTimeSec,
    course_title: courseTitle,
  }));
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
