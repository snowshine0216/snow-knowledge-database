/**
 * adapter-interface.mjs — Adapter registry and URL router for encrypted-video-capture.
 *
 * Each platform adapter exports a factory function that returns an object matching:
 *
 * @typedef {Object} Adapter
 * @property {string} name - Human-readable platform name (e.g. "geektime", "geekbang-u")
 * @property {(url: string, cookies: Array) => Promise<Lecture[]>} enumerate
 * @property {(page: import('playwright').Page, url: string, opts: PlayOpts) => Promise<void>} play
 *
 * @typedef {Object} Lecture
 * @property {string} idx         - Zero-padded index, e.g. "001"
 * @property {string} title       - Sanitized lecture title
 * @property {string} url         - Playback URL for this lecture
 * @property {number} duration    - Duration in seconds (0 if unknown)
 * @property {string} course_title - Course/lesson title (used by SKILL.md for output dir naming)
 *
 * @typedef {Object} PlayOpts
 * @property {number} playbackSpeed  - Playback rate, clamped to [1.0, 2.0]
 * @property {string} sessionId      - IPC session ID for marker file paths
 * @property {number} [durationSec]  - Known lecture duration in seconds (0 if unknown)
 */

import { createGeektimeAdapter } from "./geektime-adapter.mjs";
import { createGeekbangUAdapter } from "./geekbang-u-adapter.mjs";

/** @type {Array<{pattern: RegExp, factory: () => Adapter}>} */
const ADAPTERS = [
  { pattern: /time\.geekbang\.org/, factory: createGeektimeAdapter },
  { pattern: /u\.geekbang\.org\/lesson/, factory: createGeekbangUAdapter },
];

/**
 * Resolve the correct adapter for a URL.
 * Normalizes the URL via `new URL()` to strip injection attempts.
 * @param {string} rawUrl
 * @returns {Adapter|null} Matching adapter, or null if URL is unsupported.
 */
export function resolveAdapter(rawUrl) {
  let normalized;
  try {
    normalized = new URL(rawUrl).href;
  } catch {
    return null;
  }
  const match = ADAPTERS.find((a) => a.pattern.test(normalized));
  if (!match) return null;
  const adapter = match.factory();
  validateAdapter(adapter);
  return adapter;
}

/**
 * Runtime contract check for adapter shape.
 * Throws immediately if required methods are missing — catches typos at load time.
 * @param {unknown} adapter
 * @throws {Error} If the adapter is missing required properties.
 */
export function validateAdapter(adapter) {
  if (!adapter || typeof adapter !== "object") {
    throw new Error("Adapter must be an object");
  }
  const required = ["name", "enumerate", "play"];
  for (const key of required) {
    if (!(key in adapter)) {
      throw new Error(`Adapter is missing required property: "${key}"`);
    }
  }
  if (typeof adapter.name !== "string" || !adapter.name) {
    throw new Error('Adapter "name" must be a non-empty string');
  }
  if (typeof adapter.enumerate !== "function") {
    throw new Error(`Adapter "${adapter.name}" — "enumerate" must be a function`);
  }
  if (typeof adapter.play !== "function") {
    throw new Error(`Adapter "${adapter.name}" — "play" must be a function`);
  }
}

/** Return the list of supported URL patterns for help/error messages. */
export function supportedUrlPatterns() {
  return [
    "https://time.geekbang.org/column/{id}",
    "https://time.geekbang.org/video/{id}",
    "https://time.geekbang.org/course/{id}",
    "https://u.geekbang.org/lesson/{id}",
  ];
}
