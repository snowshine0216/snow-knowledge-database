/**
 * utils.mjs — Shared Playwright utilities for encrypted-video-capture.
 */

import fs from "fs";

/**
 * Load a Netscape-format cookie file and return an array of Playwright cookies.
 * @param {string} cookieFilePath
 * @returns {Array<{name,value,domain,path,expires,httpOnly,secure,sameSite}>}
 */
export function loadCookies(cookieFilePath) {
  if (!fs.existsSync(cookieFilePath)) {
    return [];
  }
  const lines = fs.readFileSync(cookieFilePath, "utf8").split("\n");
  const cookies = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    // Netscape format: #HttpOnly_ prefix marks httpOnly cookies; skip pure comment lines
    const httpOnly = line.startsWith("#HttpOnly_");
    if (line.startsWith("#") && !httpOnly) continue;
    const rawLine = httpOnly ? line.slice("#HttpOnly_".length) : line;
    const parts = rawLine.split("\t");
    if (parts.length < 7) continue;
    const [domain, , cookiePath, secure, expiresStr, name, value] = parts;
    cookies.push({
      name: name.trim(),
      value: value.trim(),
      domain: domain.trim(),
      path: cookiePath.trim(),
      expires: (() => {
        const n = parseInt(expiresStr, 10);
        if (isNaN(n) || n === 0) return -1;
        // Chrome exports cookie expiry as microseconds since 1601-01-01 (Chrome epoch).
        // Values > 2e10 are in microseconds; convert to Unix seconds.
        if (n > 2e10) return Math.round(n / 1e6) - 11644473600;
        return n < -1 ? -1 : n;
      })(),
      httpOnly,
      secure: secure.trim().toUpperCase() === "TRUE",
      sameSite: "Lax",
    });
  }
  return cookies;
}

/**
 * Poll until a marker file exists, with a timeout.
 * @param {string} markerPath - File path to poll for.
 * @param {number} timeoutMs - Max wait in milliseconds.
 * @param {number} intervalMs - Poll interval in milliseconds.
 * @returns {Promise<boolean>} true if file appeared, false if timed out.
 */
export async function waitForMarkerFile(markerPath, timeoutMs = 15000, intervalMs = 500) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(markerPath)) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

/**
 * Find the first <video> element on the page that has a positive duration.
 * Returns null if none found after polling.
 * @param {import('playwright').Page} page
 * @param {number} timeoutMs
 * @returns {Promise<import('playwright').ElementHandle|null>}
 */
export async function findVideoElement(page, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const handle = await page.evaluateHandle(() => {
      const videos = document.querySelectorAll("video");
      for (const v of videos) {
        if (v.duration > 0) return v;
      }
      return null;
    });
    const value = handle.asElement();
    if (value) return value;
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

/**
 * Wait for a video element to end playback using a 5-tier strategy.
 *
 * Tier 1: 'ended' event
 * Tier 2: currentTime no longer advancing (stalled for 3s)
 * Tier 3: currentTime ≥ duration + 30s
 * Tier 4: DURATION env var exceeded
 * Tier 5: 90-minute absolute timeout
 *
 * @param {import('playwright').Page} page
 * @param {number} knownDurationSec - From API, or 0 if unknown.
 * @returns {Promise<string>} Which tier triggered.
 */
// ── Tuning constants ──────────────────────────────────────────────────────────
const MAX_RECORDING_SEC  = 90 * 60;   // Tier 5: absolute timeout (90 min)
const STALL_POLL_MS      = 2000;      // Tier 2: poll interval for stall detection
const STALL_THRESHOLD    = 3;         // Tier 2: polls with no change before declaring stall
const END_GRACE_SEC      = 30;        // Tier 3/4: buffer beyond reported duration

// ── Tier setup helpers ────────────────────────────────────────────────────────

/**
 * Tier 1: resolve when the 'ended' event fires on the video element.
 * @param {import('playwright').Page} page
 * @param {(tier: string) => void} done
 */
function setupTier1(page, done) {
  page
    .evaluate(() => {
      return new Promise((res) => {
        const poll = () => {
          const video = Array.from(document.querySelectorAll("video")).find((v) => v.duration > 0);
          if (!video) { setTimeout(poll, 1000); return; }
          if (video.ended) { res("already-ended"); return; }
          video.addEventListener("ended", () => res("ended"), { once: true });
        };
        poll();
      });
    })
    .then((r) => done(`tier1:${r}`))
    .catch(() => {});
}

/**
 * Tiers 2/3/4: stall detection + duration boundary checks.
 * Polls every STALL_POLL_MS ms. Returns the interval handle.
 * done() is idempotent so concurrent in-flight callbacks are safe.
 * @param {import('playwright').Page} page
 * @param {(tier: string) => void} done
 * @param {number} effectiveDuration
 * @returns {ReturnType<typeof setInterval>}
 */
function setupTier2to4(page, done, effectiveDuration) {
  let lastTime = -1;
  let stallCount = 0;
  return setInterval(async () => {
    const ct = await page
      .evaluate(() => {
        const v = Array.from(document.querySelectorAll("video")).find((x) => x.duration > 0);
        return v ? { currentTime: v.currentTime, duration: v.duration, ended: v.ended } : null;
      })
      .catch(() => null);

    if (!ct) return;

    if (ct.ended) { done("tier2:ended-flag"); return; }

    // Tier 3: currentTime ≥ duration + grace period
    if (ct.duration > 0 && ct.currentTime >= ct.duration + END_GRACE_SEC) {
      done("tier3:duration+30");
      return;
    }

    if (ct.currentTime === lastTime) {
      stallCount++;
      if (stallCount >= STALL_THRESHOLD && ct.currentTime > 0) {
        done("tier2:stalled");
        return;
      }
    } else {
      stallCount = 0;
      lastTime = ct.currentTime;
    }

    // Tier 4: ENV DURATION exceeded
    if (effectiveDuration > 0 && ct.currentTime >= effectiveDuration + END_GRACE_SEC) {
      done("tier4:env-duration");
    }
  }, STALL_POLL_MS);
}

/**
 * Tier 5: 90-minute absolute timeout. Returns the timeout handle.
 * @param {(tier: string) => void} done
 * @returns {ReturnType<typeof setTimeout>}
 */
function setupTier5(done) {
  return setTimeout(() => done("tier5:timeout"), MAX_RECORDING_SEC * 1000);
}

// ─────────────────────────────────────────────────────────────────────────────

export async function waitForVideoEnd(page, knownDurationSec = 0) {
  const ENV_DURATION = parseInt(process.env.DURATION || "0", 10);
  const effectiveDuration = ENV_DURATION > 0 ? ENV_DURATION : knownDurationSec;

  return new Promise((resolve) => {
    let resolved = false;
    let pollHandle = null;
    let timeoutHandle = null;

    const done = (tier) => {
      if (resolved) return;
      resolved = true;
      clearInterval(pollHandle);
      clearTimeout(timeoutHandle);
      resolve(tier);
    };

    setupTier1(page, done);
    pollHandle   = setupTier2to4(page, done, effectiveDuration);
    timeoutHandle = setupTier5(done);
  });
}
