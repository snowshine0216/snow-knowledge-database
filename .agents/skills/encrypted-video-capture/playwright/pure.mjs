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

/**
 * Extract the lesson ID from a Geek University lesson URL.
 * Supports: https://u.geekbang.org/lesson/<id>
 * @param {string} url
 * @returns {{ lessonId: string }|null} null if the URL does not match.
 */
export function parseGeekbangUUrl(url) {
  let normalized;
  try {
    normalized = new URL(url);
  } catch {
    return null;
  }
  if (normalized.hostname !== "u.geekbang.org") return null;
  const match = normalized.pathname.match(/^\/lesson\/(\d+)/);
  if (!match) return null;
  return { lessonId: match[1] };
}

/**
 * Validate the shape of a lecture list returned by an adapter's enumerate().
 * Throws with a clear message if any required field is missing or malformed.
 * @param {unknown} list
 * @throws {Error}
 */
export function validateLectureList(list) {
  if (!Array.isArray(list)) {
    throw new Error("Lecture list must be an array");
  }
  if (list.length === 0) {
    throw new Error("Lecture list is empty");
  }
  const required = ["idx", "title", "url", "duration", "course_title"];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!item || typeof item !== "object") {
      throw new Error(`Lecture[${i}] is not an object`);
    }
    for (const key of required) {
      if (!(key in item)) {
        throw new Error(`Lecture[${i}] is missing required field: "${key}"`);
      }
    }
    if (typeof item.idx !== "string" || !item.idx) {
      throw new Error(`Lecture[${i}].idx must be a non-empty string`);
    }
    if (typeof item.title !== "string") {
      throw new Error(`Lecture[${i}].title must be a string`);
    }
    if (typeof item.url !== "string" || !item.url) {
      throw new Error(`Lecture[${i}].url must be a non-empty string`);
    }
    if (typeof item.duration !== "number") {
      throw new Error(`Lecture[${i}].duration must be a number`);
    }
    if (typeof item.course_title !== "string") {
      throw new Error(`Lecture[${i}].course_title must be a string`);
    }
  }
}
