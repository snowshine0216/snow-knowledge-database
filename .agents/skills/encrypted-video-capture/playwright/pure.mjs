/**
 * pure.mjs — Pure (side-effect-free) helper functions for encrypted-video-capture.
 * Extracted into a separate module so they can be unit-tested without Playwright or fs.
 */

/**
 * Sanitize a lecture title for use as a filename.
 * Strips shell metacharacters; preserves ASCII word chars, spaces, hyphens, and CJK range.
 * @param {string} raw
 * @returns {string}
 */
export function sanitizeTitle(raw) {
  return raw
    .replace(/[^\w \-\u4e00-\u9fff]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

/**
 * Build the playback URL for a lecture given course type, course ID, and article ID.
 * - course: https://time.geekbang.org/course/detail/<courseId>-<articleId>
 * - column/video: https://time.geekbang.org/<type>/<courseId>/<articleId>
 * @param {string} courseType
 * @param {string} courseId
 * @param {string|number} articleId
 * @returns {string}
 */
export function buildLectureUrl(courseType, courseId, articleId) {
  if (courseType === "course") {
    return `https://time.geekbang.org/course/detail/${courseId}-${articleId}`;
  }
  return `https://time.geekbang.org/${courseType}/${courseId}/${articleId}`;
}

/**
 * Extract the product ID and type from a Geektime course URL.
 * Supports formats:
 *   /column/<id>   — text+audio column
 *   /video/<id>    — video course
 *   /course/<id>   — alias
 * @param {string} url
 * @returns {{ type: string, id: string }}
 */
export function parseGeektimeCourseUrl(url) {
  const match = url.match(/\/(column|video|course)\/(?:intro\/|detail\/)?(\d+)/);
  if (!match) throw new Error(`Cannot parse Geektime course ID from URL: ${url}`);
  return { type: match[1], id: match[2] };
}
