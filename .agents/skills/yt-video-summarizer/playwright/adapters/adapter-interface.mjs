/**
 * Course enumeration adapter interface for yt-video-summarizer
 * Based on encrypted-video-capture pattern but simplified for video URL extraction
 */

export class CourseAdapter {
  constructor(name, urlPatterns) {
    this.name = name;
    this.urlPatterns = urlPatterns;
  }

  /**
   * Check if this adapter can handle the given URL
   * @param {string} url - Course URL to check
   * @returns {boolean}
   */
  canHandle(url) {
    return this.urlPatterns.some(pattern =>
      new RegExp(pattern.replace(/\{[^}]+\}/g, '[^/]+')).test(url)
    );
  }

  /**
   * Enumerate all video lessons in a course
   * @param {Page} page - Playwright page instance
   * @param {string} courseUrl - Course URL to enumerate
   * @returns {Promise<Array>} Array of {idx, title, videoUrl, duration?}
   */
  async enumerate(page, courseUrl) {
    throw new Error('enumerate() must be implemented by subclass');
  }
}

// Registry of all available adapters
const adapters = [];

/**
 * Register a new course adapter
 * @param {CourseAdapter} adapter
 */
export function registerAdapter(adapter) {
  adapters.push(adapter);
}

/**
 * Find the appropriate adapter for a URL
 * @param {string} url - Course URL
 * @returns {CourseAdapter|null}
 */
export function resolveAdapter(url) {
  return adapters.find(adapter => adapter.canHandle(url)) || null;
}

/**
 * Get all supported URL patterns
 * @returns {Array<string>}
 */
export function supportedUrlPatterns() {
  return adapters.flatMap(adapter => adapter.urlPatterns);
}