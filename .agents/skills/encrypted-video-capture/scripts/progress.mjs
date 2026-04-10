/**
 * progress.mjs — .progress.json state machine for encrypted-video-capture.
 *
 * The state file tracks which lectures have been processed so the skill can
 * resume mid-course after interruption.
 *
 * Schema (schemaVersion: 1):
 *   {
 *     "schemaVersion": 1,
 *     "lectures": {
 *       "001": { "status": "done|failed|pending", "retries": 0 }
 *     }
 *   }
 */

import fs from "fs";

export const SCHEMA_VERSION = 1;
export const MAX_RETRIES = 2;

/**
 * Load and validate the progress file. Returns the parsed object.
 * Throws if schemaVersion is missing/wrong or the file is corrupt.
 * @param {string} progressPath
 * @returns {{ schemaVersion: number, lectures: Record<string, { status: string, retries: number }> }}
 */
export function loadProgress(progressPath) {
  if (!fs.existsSync(progressPath)) {
    return { schemaVersion: SCHEMA_VERSION, lectures: {} };
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
    lectures: { ...progress.lectures, [idx]: { status, retries } },
  };
}

/**
 * Persist the progress object to disk.
 * @param {string} progressPath
 * @param {ReturnType<typeof loadProgress>} progress
 */
export function saveProgress(progressPath, progress) {
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2) + "\n", "utf8");
}

/**
 * Initialize a fresh progress file.
 * @param {string} progressPath
 * @returns {ReturnType<typeof loadProgress>}
 */
export function initProgress(progressPath) {
  const data = { schemaVersion: SCHEMA_VERSION, lectures: {} };
  saveProgress(progressPath, data);
  return data;
}
