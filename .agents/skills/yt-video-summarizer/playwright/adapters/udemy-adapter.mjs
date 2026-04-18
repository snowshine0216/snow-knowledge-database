/**
 * Udemy Course Adapter for yt-video-summarizer
 * Note: Most Udemy videos are hosted internally, not on YouTube
 * This adapter looks for any YouTube embeds or supplementary videos
 */

import { CourseAdapter, registerAdapter } from './adapter-interface.mjs';

class UdemyAdapter extends CourseAdapter {
  constructor() {
    super('udemy', [
      'https://www.udemy.com/course/{course-name}/',
      'https://udemy.com/course/{course-name}/'
    ]);
  }

  async enumerate(page, courseUrl) {
    console.log(`[udemy] Navigating to: ${courseUrl}`);

    await page.goto(courseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Extract course title
    let courseTitle = 'Unknown Udemy Course';
    try {
      const titleElement = await page.$('h1[data-purpose="course-title"], .course-title');
      if (titleElement) {
        courseTitle = await titleElement.textContent();
      }
    } catch (e) {
      console.log(`[udemy] Could not extract course title: ${e.message}`);
    }

    console.log(`[udemy] Course title: ${courseTitle}`);
    console.log(`[udemy] Note: Most Udemy videos are hosted internally. Looking for YouTube supplementary content only.`);

    // Look for course curriculum/content
    let lessons = [];

    try {
      // Click on curriculum tab if it exists
      const curriculumTab = await page.$('[data-purpose="curriculum"], .curriculum-tab');
      if (curriculumTab) {
        await curriculumTab.click();
        await page.waitForTimeout(2000);
      }

      // Look for lecture items
      const lectureElements = await page.$$('.lecture-content, .curriculum-item-link, [data-purpose="item-title"]');

      for (let i = 0; i < lectureElements.length; i++) {
        const element = lectureElements[i];
        const text = await element.textContent();

        if (text && text.trim()) {
          lessons.push({
            idx: String(i + 1).padStart(3, '0'),
            title: text.trim(),
            lessonUrl: courseUrl, // Udemy doesn't typically have direct lesson URLs
            videoUrl: null,
            courseTitle: courseTitle.trim()
          });
        }
      }

    } catch (e) {
      console.log(`[udemy] Error extracting lessons: ${e.message}`);
    }

    // Check for any YouTube content on the course page
    const videoUrl = await this.extractVideoFromPage(page);
    if (videoUrl && lessons.length === 0) {
      lessons.push({
        idx: '001',
        title: 'Course Preview',
        lessonUrl: courseUrl,
        videoUrl: videoUrl,
        courseTitle: courseTitle.trim()
      });
    }

    return lessons.filter(lesson => lesson.videoUrl);
  }

  async extractVideoFromPage(page) {
    try {
      // Look for YouTube iframes (course previews, supplementary content)
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

      // Check for YouTube links in page content
      const content = await page.content();
      const match = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        return `https://www.youtube.com/watch?v=${match[1]}`;
      }

    } catch (e) {
      console.log(`[udemy] Error extracting video: ${e.message}`);
    }

    return null;
  }

  extractYouTubeVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
}

registerAdapter(new UdemyAdapter());
export default UdemyAdapter;