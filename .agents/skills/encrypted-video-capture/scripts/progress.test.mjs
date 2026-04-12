/**
 * progress.test.mjs — Tests for progress.mjs state machine.
 * Run with: node --test scripts/progress.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
import {
  SCHEMA_VERSION,
  MAX_RETRIES,
  loadProgress,
  shouldSkip,
  updateProgress,
  saveProgress,
  initProgress,
  migrateV1toV2,
} from "./progress.mjs";

// ── Helpers ───────────────────────────────────────────────────────────────────

function tmpFile() {
  return path.join(os.tmpdir(), `progress-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
}

function cleanup(filePath) {
  try { fs.unlinkSync(filePath); } catch { /* ignore */ }
}

// ── loadProgress ──────────────────────────────────────────────────────────────

test("loadProgress: returns empty progress when file does not exist", () => {
  const p = tmpFile();
  const result = loadProgress(p);
  assert.deepEqual(result, { schemaVersion: SCHEMA_VERSION, courseUrl: null, courseName: null, enumeratedAt: null, lectures: {} });
});

test("loadProgress: reads a valid v2 progress file", () => {
  const p = tmpFile();
  const data = {
    schemaVersion: 2,
    courseUrl: "https://example.com/course/1",
    courseName: "test-course",
    enumeratedAt: "2026-01-01T00:00:00Z",
    lectures: { "001": { title: "Intro", url: "https://example.com/1", duration: 3600, status: "done", retries: 0 } },
  };
  fs.writeFileSync(p, JSON.stringify(data), "utf8");
  try {
    const result = loadProgress(p);
    assert.equal(result.schemaVersion, 2);
    assert.equal(result.courseUrl, "https://example.com/course/1");
    assert.deepEqual(result.lectures["001"], { title: "Intro", url: "https://example.com/1", duration: 3600, status: "done", retries: 0 });
  } finally {
    cleanup(p);
  }
});

test("loadProgress: throws on corrupt JSON", () => {
  const p = tmpFile();
  fs.writeFileSync(p, "{ not valid json", "utf8");
  try {
    assert.throws(() => loadProgress(p), /corrupt/i);
  } finally {
    cleanup(p);
  }
});

test("loadProgress: throws when schemaVersion is missing", () => {
  const p = tmpFile();
  fs.writeFileSync(p, JSON.stringify({ lectures: {} }), "utf8");
  try {
    assert.throws(() => loadProgress(p), /schemaVersion.*missing/i);
  } finally {
    cleanup(p);
  }
});

test("loadProgress: throws when schemaVersion is wrong", () => {
  const p = tmpFile();
  fs.writeFileSync(p, JSON.stringify({ schemaVersion: 99, lectures: {} }), "utf8");
  try {
    assert.throws(() => loadProgress(p), /schemaVersion.*99/);
  } finally {
    cleanup(p);
  }
});

test("loadProgress: throws when lectures field is missing", () => {
  const p = tmpFile();
  fs.writeFileSync(p, JSON.stringify({ schemaVersion: 1 }), "utf8");
  try {
    assert.throws(() => loadProgress(p), /lectures/i);
  } finally {
    cleanup(p);
  }
});

test("loadProgress: throws when lectures field is not an object", () => {
  const p = tmpFile();
  fs.writeFileSync(p, JSON.stringify({ schemaVersion: 1, lectures: "bad" }), "utf8");
  try {
    assert.throws(() => loadProgress(p), /lectures/i);
  } finally {
    cleanup(p);
  }
});

// ── shouldSkip ────────────────────────────────────────────────────────────────

test("shouldSkip: pending (not in progress) → do not skip", () => {
  const progress = { schemaVersion: 1, lectures: {} };
  const result = shouldSkip(progress, "001");
  assert.equal(result.skip, false);
  assert.equal(result.reason, "pending");
});

test("shouldSkip: status=done → skip", () => {
  const progress = { schemaVersion: 1, lectures: { "001": { status: "done", retries: 0 } } };
  const result = shouldSkip(progress, "001");
  assert.equal(result.skip, true);
  assert.equal(result.reason, "already done");
});

test("shouldSkip: status=failed with retries < MAX_RETRIES → do not skip", () => {
  const progress = { schemaVersion: 1, lectures: { "001": { status: "failed", retries: 1 } } };
  const result = shouldSkip(progress, "001");
  assert.equal(result.skip, false);
});

test(`shouldSkip: status=failed with retries >= MAX_RETRIES (${MAX_RETRIES}) → skip`, () => {
  const progress = { schemaVersion: 1, lectures: { "001": { status: "failed", retries: MAX_RETRIES } } };
  const result = shouldSkip(progress, "001");
  assert.equal(result.skip, true);
  assert.match(result.reason, /failed/);
});

test("shouldSkip: status=recording → do not skip, reason is 'recording'", () => {
  const progress = { schemaVersion: 1, lectures: { "001": { status: "recording", retries: 0 } } };
  const result = shouldSkip(progress, "001");
  assert.equal(result.skip, false);
  assert.equal(result.reason, "recording");
});

test("shouldSkip: status=transcribing → do not skip, reason is 'transcribing'", () => {
  const progress = { schemaVersion: 1, lectures: { "001": { status: "transcribing", retries: 0 } } };
  const result = shouldSkip(progress, "001");
  assert.equal(result.skip, false);
  assert.equal(result.reason, "transcribing");
});

test("shouldSkip: status=summarizing → do not skip, reason is 'summarizing'", () => {
  const progress = { schemaVersion: 1, lectures: { "001": { status: "summarizing", retries: 0 } } };
  const result = shouldSkip(progress, "001");
  assert.equal(result.skip, false);
  assert.equal(result.reason, "summarizing");
});

// ── updateProgress ────────────────────────────────────────────────────────────

test("updateProgress: sets status for a new lecture", () => {
  const progress = { schemaVersion: 1, lectures: {} };
  const result = updateProgress(progress, "001", "recording");
  assert.equal(result.lectures["001"].status, "recording");
  assert.equal(result.lectures["001"].retries, 0);
});

test("updateProgress: marks lecture done", () => {
  const progress = { schemaVersion: 1, lectures: { "001": { status: "recording", retries: 0 } } };
  const result = updateProgress(progress, "001", "done");
  assert.equal(result.lectures["001"].status, "done");
  assert.equal(result.lectures["001"].retries, 0);
});

test("updateProgress: increments retries on failure", () => {
  const progress = { schemaVersion: 1, lectures: { "001": { status: "recording", retries: 0 } } };
  const result = updateProgress(progress, "001", "failed");
  assert.equal(result.lectures["001"].status, "failed");
  assert.equal(result.lectures["001"].retries, 1);
});

test("updateProgress: accumulates retries across multiple failures", () => {
  const progress = { schemaVersion: 1, lectures: {} };
  const p1 = updateProgress(progress, "001", "failed");
  const p2 = updateProgress(p1, "001", "failed");
  assert.equal(p2.lectures["001"].retries, 2);
});

test("updateProgress: does not increment retries when status is not failed", () => {
  const progress = { schemaVersion: 1, lectures: { "001": { status: "failed", retries: 2 } } };
  const result = updateProgress(progress, "001", "done");
  assert.equal(result.lectures["001"].retries, 2);
});

test("updateProgress: sets status to transcribing", () => {
  const progress = { schemaVersion: 1, lectures: { "001": { status: "recording", retries: 0 } } };
  const result = updateProgress(progress, "001", "transcribing");
  assert.equal(result.lectures["001"].status, "transcribing");
  assert.equal(result.lectures["001"].retries, 0);
});

test("updateProgress: sets status to summarizing", () => {
  const progress = { schemaVersion: 1, lectures: { "001": { status: "transcribing", retries: 0 } } };
  const result = updateProgress(progress, "001", "summarizing");
  assert.equal(result.lectures["001"].status, "summarizing");
  assert.equal(result.lectures["001"].retries, 0);
});

// ── saveProgress / initProgress ───────────────────────────────────────────────

test("saveProgress: persists v2 progress to disk and round-trips", () => {
  const p = tmpFile();
  const progress = {
    schemaVersion: 2,
    courseUrl: "https://example.com/course/1",
    courseName: "test-course",
    enumeratedAt: "2026-01-01T00:00:00Z",
    lectures: { "001": { title: "Intro", url: "https://example.com/1", duration: 3600, status: "done", retries: 0 } },
  };
  try {
    saveProgress(p, progress);
    const loaded = loadProgress(p);
    assert.deepEqual(loaded, progress);
  } finally {
    cleanup(p);
  }
});

test("initProgress: creates a fresh progress file", () => {
  const p = tmpFile();
  try {
    const result = initProgress(p);
    assert.equal(result.schemaVersion, SCHEMA_VERSION);
    assert.deepEqual(result.lectures, {});
    assert.ok(fs.existsSync(p), "file should exist after initProgress");
    const loaded = loadProgress(p);
    assert.deepEqual(loaded, result);
  } finally {
    cleanup(p);
  }
});

// ── v1 → v2 migration ─────────────────────────────────────────────────────────

test("loadProgress: v1 file → migrates to v2, preserves status/retries", () => {
  const p = tmpFile();
  const v1Data = { schemaVersion: 1, lectures: { "001": { status: "done", retries: 0 } } };
  fs.writeFileSync(p, JSON.stringify(v1Data), "utf8");
  try {
    const result = loadProgress(p);
    assert.equal(result.schemaVersion, 2, "schemaVersion bumped to 2");
    assert.equal(result.lectures["001"].status, "done", "status preserved");
    assert.equal(result.lectures["001"].retries, 0, "retries preserved");
  } finally {
    cleanup(p);
  }
});

test("migration: v1 → v2 adds courseUrl: null, enumeratedAt: null, courseName: null at top level", () => {
  const v1 = { schemaVersion: 1, lectures: { "001": { status: "done", retries: 0 } } };
  const v2 = migrateV1toV2(v1);
  assert.equal(v2.schemaVersion, 2);
  assert.equal(v2.courseUrl, null);
  assert.equal(v2.enumeratedAt, null);
  assert.equal(v2.courseName, null);
  assert.ok(v2.lectures["001"], "lectures preserved");
});

test("migration: normalizes 'transcribed' status to 'done'", () => {
  const v1 = {
    schemaVersion: 1,
    lectures: {
      "001": { status: "transcribed", retries: 0 },
      "002": { status: "done", retries: 0 },
      "003": { status: "failed", retries: 1 },
    },
  };
  const v2 = migrateV1toV2(v1);
  assert.equal(v2.lectures["001"].status, "done", "'transcribed' normalized to 'done'");
  assert.equal(v2.lectures["002"].status, "done", "'done' stays 'done'");
  assert.equal(v2.lectures["003"].status, "failed", "'failed' stays 'failed'");
});

// ── updateProgress field preservation ────────────────────────────────────────

test("updateProgress: preserves url/duration/title when updating status", () => {
  const progress = {
    schemaVersion: 2,
    courseUrl: "https://example.com/course/1",
    courseName: "test",
    enumeratedAt: "2026-01-01T00:00:00Z",
    lectures: {
      "001": { title: "Intro", url: "https://example.com/1", duration: 3600, status: "recording", retries: 0 },
    },
  };
  const result = updateProgress(progress, "001", "done");
  assert.equal(result.lectures["001"].status, "done");
  assert.equal(result.lectures["001"].title, "Intro", "title preserved");
  assert.equal(result.lectures["001"].url, "https://example.com/1", "url preserved");
  assert.equal(result.lectures["001"].duration, 3600, "duration preserved");
});

test("updateProgress: preserves title when updating status (v1 compat — no url/duration)", () => {
  const progress = {
    schemaVersion: 2,
    courseUrl: null,
    courseName: null,
    enumeratedAt: null,
    lectures: {
      "001": { title: "Intro", status: "recording", retries: 0 },
    },
  };
  const result = updateProgress(progress, "001", "done");
  assert.equal(result.lectures["001"].status, "done");
  assert.equal(result.lectures["001"].title, "Intro", "title preserved even without url/duration");
});

// ── Resume scenario ───────────────────────────────────────────────────────────

test("resume scenario: done lectures are skipped, failed+exhausted are skipped, others are retried", () => {
  const progress = {
    schemaVersion: 1,
    lectures: {
      "001": { status: "done", retries: 0 },
      "002": { status: "failed", retries: MAX_RETRIES },
      "003": { status: "failed", retries: 1 },
      "004": { status: "pending", retries: 0 },
    },
  };

  assert.equal(shouldSkip(progress, "001").skip, true,  "001: done → skip");
  assert.equal(shouldSkip(progress, "002").skip, true,  "002: failed+exhausted → skip");
  assert.equal(shouldSkip(progress, "003").skip, false, "003: failed but retries left → retry");
  assert.equal(shouldSkip(progress, "004").skip, false, "004: pending → process");
  assert.equal(shouldSkip(progress, "005").skip, false, "005: not in map → process");
});
