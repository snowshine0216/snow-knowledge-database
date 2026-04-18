/**
 * DeepLearning.AI Course Adapter for yt-video-summarizer
 * Extracts video URLs from DeepLearning.AI course pages
 */

import { CourseAdapter, registerAdapter } from './adapter-interface.mjs';

class DeepLearningAIAdapter extends CourseAdapter {
  constructor() {
    super('deeplearning-ai', [
      'https://learn.deeplearning.ai/courses/{course-name}/lesson/{lesson-id?}/{lesson-name?}',
      'https://learn.deeplearning.ai/courses/{course-name}/lesson',
      'https://learn.deeplearning.ai/courses/{course-name}'
    ]);
  }

  async enumerate(page, courseUrl) {
    console.log(`[deeplearning-ai] Navigating to: ${courseUrl}`);

    // Navigate to course page
    await page.goto(courseUrl, { waitUntil: 'networkidle' });

    // Wait for course content to load
    await page.waitForTimeout(3000);

    // Extract course title
    let courseTitle = 'Unknown Course';
    try {
      const titleElement = await page.$('h1, .course-title, [data-testid="course-title"]');
      if (titleElement) {
        courseTitle = await titleElement.textContent();
      }
    } catch (e) {
      console.log(`[deeplearning-ai] Could not extract course title: ${e.message}`);
    }

    console.log(`[deeplearning-ai] Course title: ${courseTitle}`);

    // Strategy 1: Look for lesson navigation/sidebar
    let lessons = [];

    // Try to find lesson links in various possible locations
    const selectors = [
      'nav a[href*="/lesson/"]',           // Navigation links
      '.lesson-list a[href*="/lesson/"]',  // Lesson list
      '.sidebar a[href*="/lesson/"]',      // Sidebar
      'a[href*="/lesson/"]',               // Any lesson link
      '[data-testid*="lesson"] a',        // Test ID patterns
      '.course-content a'                  // Course content links
    ];

    for (const selector of selectors) {
      try {
        const lessonElements = await page.$$(selector);
        if (lessonElements.length > 0) {
          console.log(`[deeplearning-ai] Found ${lessonElements.length} lessons with selector: ${selector}`);

          for (let i = 0; i < lessonElements.length; i++) {
            const element = lessonElements[i];
            const href = await element.getAttribute('href');
            const text = await element.textContent();

            if (href && text) {
              // Convert relative URLs to absolute
              const fullUrl = href.startsWith('http')
                ? href
                : `https://learn.deeplearning.ai${href}`;

              lessons.push({
                idx: String(i + 1).padStart(3, '0'),
                title: text.trim(),
                lessonUrl: fullUrl,
                videoUrl: null, // Will be extracted per lesson
                courseTitle: courseTitle.trim()
              });
            }
          }

          if (lessons.length > 0) break; // Found lessons, stop trying other selectors
        }
      } catch (e) {
        console.log(`[deeplearning-ai] Selector ${selector} failed: ${e.message}`);
      }
    }

    // Strategy 2: If no lesson links found, try to navigate and find video on current page
    if (lessons.length === 0) {
      console.log(`[deeplearning-ai] No lesson navigation found, checking current page for video`);

      const videoUrl = await this.extractVideoFromPage(page);
      if (videoUrl) {
        lessons.push({
          idx: '001',
          title: courseTitle || 'Introduction',
          lessonUrl: courseUrl,
          videoUrl: videoUrl,
          courseTitle: courseTitle.trim()
        });
      }
    }

    // Strategy 3: For each lesson, visit and extract video URL
    if (lessons.length > 0 && !lessons[0].videoUrl) {
      console.log(`[deeplearning-ai] Extracting video URLs from individual lessons...`);

      for (const lesson of lessons) {
        try {
          console.log(`[deeplearning-ai] Visiting lesson: ${lesson.title}`);
          await page.goto(lesson.lessonUrl, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000);

          lesson.videoUrl = await this.extractVideoFromPage(page);

          if (lesson.videoUrl) {
            console.log(`[deeplearning-ai] Found video: ${lesson.videoUrl}`);
          } else {
            console.log(`[deeplearning-ai] No video found for: ${lesson.title}`);
          }

        } catch (e) {
          console.log(`[deeplearning-ai] Failed to process lesson ${lesson.title}: ${e.message}`);
        }
      }
    }

    // Filter out lessons without videos
    const validLessons = lessons.filter(lesson => lesson.videoUrl);

    console.log(`[deeplearning-ai] Found ${validLessons.length} lessons with videos`);

    return validLessons;
  }

  /**
   * Extract video URL from current page
   * @param {Page} page - Playwright page instance
   * @returns {Promise<string|null>} YouTube video URL if found
   */
  async extractVideoFromPage(page) {
    // Strategy 1: Look for YouTube iframe embeds
    try {
      const iframes = await page.$$('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
      for (const iframe of iframes) {
        const src = await iframe.getAttribute('src');
        if (src) {
          const videoId = this.extractYouTubeVideoId(src);
          if (videoId) {
            return `https://www.youtube.com/watch?v=${videoId}`;
          }
        }
      }
    } catch (e) {
      console.log(`[deeplearning-ai] Error checking iframes: ${e.message}`);
    }

    // Strategy 2: Look for video elements with YouTube sources
    try {
      const videos = await page.$$('video source[src*="youtube"]');
      for (const video of videos) {
        const src = await video.getAttribute('src');
        if (src) {
          const videoId = this.extractYouTubeVideoId(src);
          if (videoId) {
            return `https://www.youtube.com/watch?v=${videoId}`;
          }
        }
      }
    } catch (e) {
      console.log(`[deeplearning-ai] Error checking video elements: ${e.message}`);
    }

    // Strategy 3: Look for YouTube links in page content
    try {
      const links = await page.$$('a[href*="youtube.com"], a[href*="youtu.be"]');
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href) {
          const videoId = this.extractYouTubeVideoId(href);
          if (videoId) {
            return `https://www.youtube.com/watch?v=${videoId}`;
          }
        }
      }
    } catch (e) {
      console.log(`[deeplearning-ai] Error checking links: ${e.message}`);
    }

    // Strategy 4: Look in page source/scripts for video IDs
    try {
      const content = await page.content();
      const youtubeMatches = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g);
      if (youtubeMatches && youtubeMatches.length > 0) {
        const videoId = this.extractYouTubeVideoId(youtubeMatches[0]);
        if (videoId) {
          return `https://www.youtube.com/watch?v=${videoId}`;
        }
      }
    } catch (e) {
      console.log(`[deeplearning-ai] Error checking page content: ${e.message}`);
    }

    return null;
  }

  /**
   * Extract YouTube video ID from various URL formats
   * @param {string} url - URL that might contain YouTube video ID
   * @returns {string|null} Video ID if found
   */
  extractYouTubeVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /[?&]v=([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
}

// Register the adapter
registerAdapter(new DeepLearningAIAdapter());

export default DeepLearningAIAdapter;