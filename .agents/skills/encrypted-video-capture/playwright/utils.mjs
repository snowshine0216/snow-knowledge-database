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
      expires: parseInt(expiresStr, 10) || -1,
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
export async function waitForVideoEnd(page, knownDurationSec = 0) {
  const MAX_SECONDS = 90 * 60;
  const ENV_DURATION = parseInt(process.env.DURATION || "0", 10);
  const effectiveDuration = ENV_DURATION > 0 ? ENV_DURATION : knownDurationSec;

  return new Promise((resolve) => {
    let resolved = false;
    const done = (tier) => {
      if (resolved) return;
      resolved = true;
      resolve(tier);
    };

    // Tier 1: 'ended' event
    page
      .evaluate(() => {
        return new Promise((res) => {
          const video = Array.from(document.querySelectorAll("video")).find((v) => v.duration > 0);
          if (!video) return res("no-video");
          if (video.ended) return res("already-ended");
          video.addEventListener("ended", () => res("ended"), { once: true });
        });
      })
      .then((r) => done(`tier1:${r}`))
      .catch(() => {});

    // Tier 2: currentTime stall detection (poll every 2s, stall = no change for 6s)
    let lastTime = -1;
    let stallCount = 0;
    const stallChecker = setInterval(async () => {
      if (resolved) {
        clearInterval(stallChecker);
        return;
      }
      const ct = await page
        .evaluate(() => {
          const v = Array.from(document.querySelectorAll("video")).find((x) => x.duration > 0);
          return v ? { currentTime: v.currentTime, duration: v.duration, ended: v.ended } : null;
        })
        .catch(() => null);

      if (!ct) return;
      if (ct.ended) {
        clearInterval(stallChecker);
        done("tier2:ended-flag");
        return;
      }

      // Tier 3: currentTime ≥ duration + 30s
      if (ct.duration > 0 && ct.currentTime >= ct.duration + 30) {
        clearInterval(stallChecker);
        done("tier3:duration+30");
        return;
      }

      if (ct.currentTime === lastTime) {
        stallCount++;
        if (stallCount >= 3 && ct.currentTime > 0) {
          clearInterval(stallChecker);
          done("tier2:stalled");
          return;
        }
      } else {
        stallCount = 0;
        lastTime = ct.currentTime;
      }

      // Tier 4: ENV DURATION exceeded
      if (effectiveDuration > 0 && ct.currentTime >= effectiveDuration + 30) {
        clearInterval(stallChecker);
        done("tier4:env-duration");
        return;
      }
    }, 2000);

    // Tier 5: 90-minute absolute timeout
    setTimeout(() => {
      clearInterval(stallChecker);
      done("tier5:timeout");
    }, MAX_SECONDS * 1000);
  });
}
