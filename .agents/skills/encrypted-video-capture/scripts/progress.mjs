/**
 * progress.mjs — .progress.json state machine for encrypted-video-capture.
 *
 * The state file tracks which lectures have been processed so the skill can
 * resume mid-course after interruption.
 *
 * Schema (schemaVersion: 2):
 *   {
 *     "schemaVersion": 2,
 *     "courseUrl": "https://...",
 *     "courseName": "ai-engineering-training-camp",
 *     "enumeratedAt": "2026-04-12T10:00:00Z",
 *     "lectures": {
 *       "001": {
 *         "title": "Lecture Title",
 *         "url": "https://...",
 *         "duration": 3600,
 *         "status": "done|failed|pending|recording|transcribing|summarizing",
 *         "retries": 0
 *       }
 *     }
 *   }
 *
 * v1 files are auto-migrated to v2 on load (url/duration/title set to null).
 * "transcribed" (legacy past-tense status) is normalized to "done" during migration.
 */

import fs from "fs";

export const SCHEMA_VERSION = 2;
export const MAX_RETRIES = 2;

/**
 * Migrate a schemaVersion 1 object to schemaVersion 2.
 * Pure function — does not write to disk.
 * @param {{ schemaVersion: 1, lectures: Record<string, { status: string, retries: number }> }} v1
 * @returns {{ schemaVersion: 2, courseUrl: null, courseName: null, enumeratedAt: null, lectures: Record<string, object> }}
 */
export function migrateV1toV2(v1) {
  const migratedLectures = {};
  for (const [idx, entry] of Object.entries(v1.lectures)) {
    const status = entry.status === "transcribed" ? "done" : entry.status;
    migratedLectures[idx] = { title: null, url: null, duration: null, ...entry, status };
  }
  return {
    schemaVersion: 2,
    courseUrl: null,
    courseName: null,
    enumeratedAt: null,
    lectures: migratedLectures,
  };
}

/**
 * Load and validate the progress file. Returns the parsed object.
 * Auto-migrates schemaVersion 1 → 2. Throws if the file is corrupt or has
 * an unrecognized schema version.
 * @param {string} progressPath
 * @returns {{ schemaVersion: 2, courseUrl: string|null, courseName: string|null, enumeratedAt: string|null, lectures: Record<string, object> }}
 */
export function loadProgress(progressPath) {
  if (!fs.existsSync(progressPath)) {
    return { schemaVersion: SCHEMA_VERSION, courseUrl: null, courseName: null, enumeratedAt: null, lectures: {} };
  }

  let raw;
  try {
    raw = fs.readFileSync(progressPath, "utf8");
  } catch (err) {
    throw new Error(`Cannot read progress file: ${err.message}`);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`ERROR: .progress.json is corrupt (invalid JSON). FIX: Delete the file to start fresh.`);
  }

  if (data.schemaVersion === undefined || data.schemaVersion === null) {
    throw new Error(
      `ERROR: .progress.json has schemaVersion 'missing'. CAUSE: Stale or incompatible progress file. FIX: Delete the file to start fresh, or migrate manually.`
    );
  }

  if (data.schemaVersion === 1) {
    if (!data.lectures || typeof data.lectures !== "object") {
      throw new Error(`ERROR: .progress.json has invalid lectures field. FIX: Delete the file to start fresh.`);
    }
    return migrateV1toV2(data);
  }

  if (data.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(
      `ERROR: .progress.json has schemaVersion '${data.schemaVersion}'. CAUSE: Stale or incompatible progress file. FIX: Delete the file to start fresh, or migrate manually.`
    );
  }

  if (!data.lectures || typeof data.lectures !== "object") {
    throw new Error(`ERROR: .progress.json has invalid lectures field. FIX: Delete the file to start fresh.`);
  }

  return data;
}

/**
 * Determine whether a lecture should be skipped.
 * @param {ReturnType<typeof loadProgress>} progress
 * @param {string} idx
 * @returns {{ skip: boolean, reason: string }}
 */
export function shouldSkip(progress, idx) {
  const entry = progress.lectures[idx];
  if (!entry) return { skip: false, reason: "pending" };

  if (entry.status === "done") {
    return { skip: true, reason: "already done" };
  }

  if (entry.status === "failed" && (entry.retries ?? 0) >= MAX_RETRIES) {
    return { skip: true, reason: `failed ${entry.retries} times` };
  }

  return { skip: false, reason: entry.status };
}

/**
 * Return a new progress object with the lecture's status updated.
 * Preserves all existing lecture fields (title, url, duration, etc.).
 * Call saveProgress() with the returned value to persist.
 * @param {ReturnType<typeof loadProgress>} progress
 * @param {string} idx
 * @param {"pending"|"recording"|"transcribing"|"summarizing"|"done"|"failed"} status
 * @returns {ReturnType<typeof loadProgress>}
 */
export function updateProgress(progress, idx, status) {
  const existing = progress.lectures[idx] ?? { status: "pending", retries: 0 };
  const retries = status === "failed" ? (existing.retries ?? 0) + 1 : existing.retries ?? 0;
  return {
    ...progress,
    lectures: { ...progress.lectures, [idx]: { ...existing, status, retries } },
  };
}

/**
 * Persist the progress object to disk atomically.
 * Writes to a .tmp file first, then renames to prevent corrupt files on crash.
 * @param {string} progressPath
 * @param {ReturnType<typeof loadProgress>} progress
 */
export function saveProgress(progressPath, progress) {
  const tmp = progressPath + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(progress, null, 2) + "\n", "utf8");
  fs.renameSync(tmp, progressPath);
}

/**
 * Initialize a fresh v2 progress file.
 * @param {string} progressPath
 * @returns {ReturnType<typeof loadProgress>}
 */
export function initProgress(progressPath) {
  const data = { schemaVersion: SCHEMA_VERSION, courseUrl: null, courseName: null, enumeratedAt: null, lectures: {} };
  saveProgress(progressPath, data);
  return data;
}
