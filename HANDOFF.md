# Handoff Document
*Last updated: April 18, 2026, 8:30 PM GMT+8*

## Goal
Extend the yt-video-summarizer skill to automatically extract all video URLs from course pages (DeepLearning.AI, Coursera, Udemy) and process them systematically with progress tracking, creating a complete course summarization pipeline.

## Current Progress
- ✅ **Extended yt-video-summarizer architecture**: Added Playwright-based course enumeration system
- ✅ **Created adapter system**: Built extensible platform adapters for DeepLearning.AI, Coursera, and Udemy
- ✅ **Implemented progress tracking**: JSON-based progress file with resume capability (pending/processing/done/failed/skipped states)
- ✅ **Built course processor**: Python orchestrator script that coordinates enumeration → extraction → summarization
- ✅ **Updated skill documentation**: Enhanced SKILL.md with course processing workflows
- ✅ **NPM setup complete**: Installed Playwright dependency and configured ES modules
- ✅ **Created demo structure**: Set up `courses/fine-tuning-large-language-models/` directory with progress.md template
- ✅ **Playwright browsers installed**: Successfully installed Chromium v1217 with headless shell
- ✅ **Cookie support added**: Integrated browser cookie import using yt-dlp format, similar to encrypted-video-capture
- ✅ **Video extraction tested**: Core yt-dlp video processing verified working with sample YouTube video

## What Worked
- **Adapter pattern**: Clean separation between platform-specific enumeration logic and generic course processing
- **ES modules setup**: Using `"type": "module"` in package.json enables modern JavaScript imports
- **Progress file design**: JSON structure with lesson metadata allows granular resume capability
- **Integration approach**: Leveraging existing yt-video-summarizer pipeline rather than rebuilding from scratch
- **Skill extension pattern**: Adding new capabilities to existing skills while maintaining backwards compatibility
- **Cookie integration**: Successfully implemented browser cookie export/import similar to encrypted-video-capture approach
- **Playwright installation**: Resolved multiple installation conflicts and lock file issues

## What Didn't Work
- **DeepLearning.AI access**: Site appears to block headless browsers or require additional authentication beyond cookies
- **Direct course page enumeration**: Network timeouts suggest site has bot protection or requires interactive login
- **Simple cookie persistence**: Needed more sophisticated cookie parsing to handle Chrome's microsecond timestamps

## Next Steps
1. **Alternative enumeration approaches**: 
   - Try persistent browser context with manual login step
   - Consider using visible browser mode for initial authentication
   - Implement fallback to manual video URL list input
2. **Test other platforms**: Verify Coursera/Udemy adapters work better than DeepLearning.AI
3. **Complete integration**: Connect course processor to content-summarizer skill for final markdown generation
4. **Add wiki compilation**: Ensure processed courses get compiled to wiki/ directory automatically
5. **Documentation updates**: Update SKILL.md with cookie export instructions and troubleshooting

## Key Files & Locations
- **Main skill directory**: `/Users/snow/Documents/Repository/snow-knowledge-database/.claude/skills/yt-video-summarizer/`
- **Course processor**: `scripts/process_course.py`
- **Playwright enumerator**: `playwright/course-enumerator.mjs` (now with cookie support)
- **Platform adapters**: `playwright/adapters/` (deeplearning-ai-adapter.mjs, coursera-adapter.mjs, udemy-adapter.mjs)
- **Target course directory**: `courses/fine-tuning-large-language-models/`
- **Progress file**: `courses/fine-tuning-large-language-models/progress.md`
- **Updated documentation**: `SKILL.md`
- **Cookie export**: `/tmp/deeplearning-cookies.txt` (1255 cookies extracted successfully)

## Context & Notes
- **Original request**: Process all videos from https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson into courses/ folder
- **Architecture decision**: Extended yt-video-summarizer rather than creating new skill to leverage existing video processing pipeline
- **Platform coverage**: DeepLearning.AI was priority, but also added Coursera/Udemy for broader utility
- **Progress tracking philosophy**: Each lesson tracks idx, title, videoUrl, lessonUrl, status, outputFile, processedAt for full auditability
- **Resume capability**: `--resume` flag allows continuing after interruptions without re-processing completed lessons
- **Directory structure**: Follows CLAUDE.md guidelines with courses/ as separate tree from topic-based folders
- **Cookie approach**: Mirrors encrypted-video-capture skill's browser cookie export using yt-dlp
- **Browser automation**: Playwright requirement for handling modern SPA course platforms

## Quick Start Commands
```bash
# Change to skill directory
cd /Users/snow/Documents/Repository/snow-knowledge-database/.claude/skills/yt-video-summarizer/

# Export cookies from browser
yt-dlp --cookies-from-browser chrome --cookies /tmp/course-cookies.txt --skip-download <course-url>

# Test course enumeration with cookies (visible browser)
node playwright/course-enumerator.mjs "<course-url>" --cookies /tmp/course-cookies.txt --no-headless

# Test course enumeration (dry run)
python3 scripts/process_course.py "<course-url>" --course-name course-name --dry-run

# Full course processing
python3 scripts/process_course.py "<course-url>" --course-name course-name

# Resume from progress file
python3 scripts/process_course.py --resume --course-name course-name
```

## Cookie Export Instructions
The system now supports browser cookie import for authenticated access:

1. **Export cookies**: `yt-dlp --cookies-from-browser chrome --cookies cookies.txt --skip-download <course-url>`
2. **Use with enumerator**: `--cookies cookies.txt` flag
3. **Browser support**: Chrome (default), Firefox, Safari, Edge via yt-dlp
4. **Security**: Cookie files have 600 permissions, automatically cleaned up

This enables access to courses requiring login/subscription without manual authentication in each session.