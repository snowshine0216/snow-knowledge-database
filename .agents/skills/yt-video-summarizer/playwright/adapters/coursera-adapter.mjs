/**
 * Coursera Course Adapter for yt-video-summarizer
 * Extracts video URLs from Coursera course pages
 */

import { CourseAdapter, registerAdapter } from './adapter-interface.mjs';

class CourseraAdapter extends CourseAdapter {
  constructor() {
    super('coursera', [
      'https://www.coursera.org/learn/{course-name}',
      'https://www.coursera.org/specializations/{specialization-name}',
      'https://coursera.org/learn/{course-name}'
    ]);
  }

  async enumerate(page, courseUrl) {
    console.log(`[coursera] Navigating to: ${courseUrl}`);

    await page.goto(courseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Extract course title
    let courseTitle = 'Unknown Coursera Course';
    try {
      const titleElement = await page.$('h1');
      if (titleElement) {
        courseTitle = await titleElement.textContent();
      }
    } catch (e) {
      console.log(`[coursera] Could not extract course title: ${e.message}`);
    }

    console.log(`[coursera] Course title: ${courseTitle}`);

    // Try to find syllabus or module links
    let lessons = [];
    const selectors = [
      'a[href*="/lecture/"]',
      '.week-item a',
      '.syllabus a',
      '[data-track-component="lecture_link"]'
    ];

    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`[coursera] Found ${elements.length} lessons with selector: ${selector}`);

          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const href = await element.getAttribute('href');
            const text = await element.textContent();

            if (href && text) {
              const fullUrl = href.startsWith('http')
                ? href
                : `https://www.coursera.org${href}`;

              lessons.push({
                idx: String(i + 1).padStart(3, '0'),
                title: text.trim(),
                lessonUrl: fullUrl,
                videoUrl: null,
                courseTitle: courseTitle.trim()
              });
            }
          }

          if (lessons.length > 0) break;
        }
      } catch (e) {
        console.log(`[coursera] Selector ${selector} failed: ${e.message}`);
      }
    }

    // Extract video URLs for each lesson
    for (const lesson of lessons) {
      try {
        await page.goto(lesson.lessonUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        lesson.videoUrl = await this.extractVideoFromPage(page);
      } catch (e) {
        console.log(`[coursera] Failed to process lesson ${lesson.title}: ${e.message}`);
      }
    }

    return lessons.filter(lesson => lesson.videoUrl);
  }

  async extractVideoFromPage(page) {
    // Look for video elements and YouTube embeds
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

      // Check page content for YouTube links
      const content = await page.content();
      const match = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        return `https://www.youtube.com/watch?v=${match[1]}`;
      }
    } catch (e) {
      console.log(`[coursera] Error extracting video: ${e.message}`);
    }

    return null;
  }

  extractYouTubeVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
}

registerAdapter(new CourseraAdapter());
export default CourseraAdapter;