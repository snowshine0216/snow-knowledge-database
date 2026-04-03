# Changelog

All notable changes to this project will be documented in this file.

## [0.0.1.0] - 2026-04-03

### Added
- New `content-summarizer` skill: consolidated formatting hub for all content types (`lecture-video`, `lecture-text`, `interview`, `talk`, `article`, `geektime-article`). All format templates live here — one place to update when output format needs to change.
- `geektime-article` (Cornell Notes) template included in `content-summarizer` for future web-based geektime article processing.

### Changed
- `yt-video-summarizer`: replaced hardcoded output structure with a `content_type` decision tree and explicit handoff to `content-summarizer`. Callers now classify video type (interview/lecture-video/talk) before invoking the formatter.
- `medium-member-summarizer`: replaced hardcoded output structure with `content_type` detection (article vs. lecture-text) and explicit handoff to `content-summarizer`.

### Removed
- `course-chapter-summarizer`: functionality fully covered by `yt-video-summarizer` + `content-summarizer` with `content_type=lecture-video` or `lecture-text`. Zero external references confirmed before deletion.
