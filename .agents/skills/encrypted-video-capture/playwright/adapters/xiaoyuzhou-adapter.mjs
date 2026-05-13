/**
 * xiaoyuzhou-adapter.mjs — Adapter for Xiaoyuzhou podcast episode pages.
 *
 * enumerate(): fetches the public episode HTML and extracts PodcastEpisode JSON-LD.
 * play(): fallback browser playback for cases where yt-dlp direct download fails.
 */

import fs from "fs";
import { sanitizeTitle } from "../pure.mjs";
import { waitForMarkerFile } from "../utils.mjs";
import { ffmpegReadyPath, videoEndedPath } from "../pathConstants.mjs";

const XIAOYUZHOU_HOSTS = new Set(["www.xiaoyuzhoufm.com", "xiaoyuzhoufm.com"]);

/**
 * @param {string} rawUrl
 * @returns {{ episodeId: string, canonicalUrl: string }|null}
 */
export function parseEpisodeUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }
  if (!XIAOYUZHOU_HOSTS.has(parsed.hostname)) return null;
  const match = parsed.pathname.match(/^\/episode\/([a-z0-9]+)\/?$/i);
  if (!match) return null;
  const episodeId = match[1];
  return {
    episodeId,
    canonicalUrl: `https://www.xiaoyuzhoufm.com/episode/${episodeId}`,
  };
}

/**
 * @param {string} value
 * @returns {number}
 */
export function parseIsoDurationToSeconds(value) {
  const match = String(value || "").match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

const decodeHtmlEntities = (value) =>
  String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const extractCanonicalUrl = (html) => {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return match ? decodeHtmlEntities(match[1]) : "";
};

const extractMetaContent = (html, name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`,
    "i"
  );
  const match = html.match(re);
  return match ? decodeHtmlEntities(match[1]) : "";
};

const extractJsonLdPayloads = (html) =>
  Array.from(html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))
    .map((match) => decodeHtmlEntities(match[1]).trim())
    .filter(Boolean)
    .flatMap((raw) => {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [];
      }
    });

const findPodcastEpisode = (payloads) =>
  payloads.find((payload) => {
    const type = payload && payload["@type"];
    return type === "PodcastEpisode" || (Array.isArray(type) && type.includes("PodcastEpisode"));
  }) || null;

/**
 * @param {string} html
 * @param {string} episodeId
 * @returns {{title: string, canonicalUrl: string, audioUrl: string, duration: number, seriesTitle: string}}
 */
export function parseEpisodeHtml(html, episodeId) {
  const episode = findPodcastEpisode(extractJsonLdPayloads(html));
  const jsonAudioUrl = episode?.associatedMedia?.contentUrl || "";
  const canonicalUrl = extractCanonicalUrl(html) || `https://www.xiaoyuzhoufm.com/episode/${episodeId}`;
  return {
    title: episode?.name || extractMetaContent(html, "og:title") || `xiaoyuzhou episode ${episodeId}`,
    canonicalUrl,
    audioUrl: jsonAudioUrl || extractMetaContent(html, "og:audio"),
    duration: parseIsoDurationToSeconds(episode?.timeRequired || ""),
    seriesTitle: episode?.partOfSeries?.name || "",
  };
}

/**
 * @param {string} url
 * @returns {Promise<import('./adapter-interface.mjs').Lecture[]>}
 */
async function enumerate(url) {
  const parsed = parseEpisodeUrl(url);
  if (!parsed) {
    throw new Error(`xiaoyuzhou-adapter: Cannot parse episode URL: ${url}`);
  }

  console.error(`INFO: Fetching Xiaoyuzhou episode page: ${parsed.canonicalUrl}`);
  const res = await fetch(parsed.canonicalUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`xiaoyuzhou-adapter: HTTP ${res.status} fetching ${parsed.canonicalUrl}`);
  }

  const metadata = parseEpisodeHtml(await res.text(), parsed.episodeId);
  return [
    {
      idx: "001",
      title: sanitizeTitle(metadata.title),
      url: metadata.canonicalUrl,
      duration: metadata.duration,
      course_title: `xiaoyuzhou-episode-${parsed.episodeId}`,
    },
  ];
}

const playViaSelector = async (page) => {
  const selectors = [
    "button[aria-label='播放']",
    "button[aria-label='Play']",
    "button:has-text('播放')",
    "[class*='play']",
    "audio",
  ];
  for (const selector of selectors) {
    const clicked = await page.locator(selector).first().click({ timeout: 2000 }).then(() => true).catch(() => false);
    if (clicked) {
      console.error(`INFO: Clicked play via ${selector}`);
      return true;
    }
  }
  return false;
};

const waitForMediaEnd = (page, durationSec) =>
  new Promise((resolve) => {
    const startedAt = Date.now();
    const maxMs = durationSec > 0 ? (durationSec + 90) * 1000 : 6 * 60 * 60 * 1000;
    const timer = setInterval(async () => {
      const state = await page
        .evaluate(() => {
          const media = document.querySelector("audio, video");
          return media
            ? { currentTime: media.currentTime, duration: media.duration, ended: media.ended }
            : null;
        })
        .catch(() => null);
      if (state?.ended) {
        clearInterval(timer);
        resolve("ended-event");
        return;
      }
      if (state?.duration > 0 && state.currentTime >= state.duration - 1) {
        clearInterval(timer);
        resolve("duration-boundary");
        return;
      }
      if (Date.now() - startedAt > maxMs) {
        clearInterval(timer);
        resolve("wall-clock-timeout");
      }
    }, 2000);
  });

/**
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

  const ready = await waitForMarkerFile(readyFile, 15000);
  if (!ready) {
    console.error("ERROR: ffmpeg ready signal not received within 15s. Aborting play.");
    process.exit(1);
  }

  await page.waitForSelector("audio, video", { timeout: 20000 }).catch(() => {});
  const clicked = await playViaSelector(page);
  if (!clicked) {
    await page.evaluate(() => {
      const media = document.querySelector("audio, video");
      if (media) media.play().catch(() => {});
    }).catch(() => {});
    console.error("INFO: No play control found — used media.play() directly");
  }

  const state = await page.evaluate((rate) => {
    const media = document.querySelector("audio, video");
    if (!media) return null;
    media.playbackRate = rate;
    return {
      rate: media.playbackRate,
      currentTime: media.currentTime,
      duration: media.duration,
      paused: media.paused,
    };
  }, playbackSpeed).catch(() => null);
  console.error(`INFO: Media state after play: ${JSON.stringify(state)}`);

  const endReason = await waitForMediaEnd(page, durationSec);
  console.error(`INFO: Xiaoyuzhou media ended via ${endReason}`);
  fs.writeFileSync(endedFile, "ended");
}

export function createXiaoyuzhouAdapter() {
  return { name: "xiaoyuzhou", enumerate, play };
}

