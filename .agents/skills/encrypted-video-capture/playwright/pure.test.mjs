/**
 * pure.test.mjs — Unit tests for pure helper functions.
 * Run with: node --test playwright/pure.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeTitle, parseGeektimeCourseUrl, buildLectureUrl } from "./pure.mjs";

// ── sanitizeTitle ─────────────────────────────────────────────────────────────

test("sanitizeTitle: strips shell injection chars", () => {
  assert.equal(sanitizeTitle("$(rm -rf ~)"), "rm -rf");
});

test("sanitizeTitle: strips path traversal", () => {
  assert.equal(sanitizeTitle("../../etc/passwd"), "etcpasswd");
});

test("sanitizeTitle: preserves ASCII word chars and spaces", () => {
  assert.equal(sanitizeTitle("Hello World 2024"), "Hello World 2024");
});

test("sanitizeTitle: preserves hyphens", () => {
  assert.equal(sanitizeTitle("React-in-depth"), "React-in-depth");
});

test("sanitizeTitle: preserves CJK characters", () => {
  const cjk = "深入浅出 React";
  assert.equal(sanitizeTitle(cjk), cjk);
});

test("sanitizeTitle: truncates to 80 chars", () => {
  const long = "a".repeat(100);
  assert.equal(sanitizeTitle(long).length, 80);
});

test("sanitizeTitle: collapses multiple spaces", () => {
  assert.equal(sanitizeTitle("foo   bar"), "foo bar");
});

test("sanitizeTitle: returns empty string for all-metachar input", () => {
  assert.equal(sanitizeTitle("!@#$%^&*()"), "");
});

test("sanitizeTitle: returns empty string for empty input", () => {
  assert.equal(sanitizeTitle(""), "");
});

// ── parseGeektimeCourseUrl ────────────────────────────────────────────────────

test("parseGeektimeCourseUrl: parses /column/<id>", () => {
  const result = parseGeektimeCourseUrl("https://time.geekbang.org/column/intro/100083501");
  assert.deepEqual(result, { type: "column", id: "100083501" });
});

test("parseGeektimeCourseUrl: parses /video/<id>", () => {
  const result = parseGeektimeCourseUrl("https://time.geekbang.org/video/intro/100082601");
  assert.deepEqual(result, { type: "video", id: "100082601" });
});

test("parseGeektimeCourseUrl: parses /course/<id>", () => {
  const result = parseGeektimeCourseUrl("https://time.geekbang.org/course/intro/100063001");
  assert.deepEqual(result, { type: "course", id: "100063001" });
});

test("parseGeektimeCourseUrl: throws on unrecognized URL", () => {
  assert.throws(
    () => parseGeektimeCourseUrl("https://example.com/unknown/path"),
    /Cannot parse Geektime course ID/
  );
});

// ── buildLectureUrl ───────────────────────────────────────────────────────────

test("buildLectureUrl: course type uses detail/<courseId>-<articleId>", () => {
  assert.equal(
    buildLectureUrl("course", "101123301", "955166"),
    "https://time.geekbang.org/course/detail/101123301-955166"
  );
});

test("buildLectureUrl: column type uses /<type>/<courseId>/<articleId>", () => {
  assert.equal(
    buildLectureUrl("column", "100083501", "123"),
    "https://time.geekbang.org/column/100083501/123"
  );
});

test("buildLectureUrl: video type uses /<type>/<courseId>/<articleId>", () => {
  assert.equal(
    buildLectureUrl("video", "100082601", "456"),
    "https://time.geekbang.org/video/100082601/456"
  );
});
