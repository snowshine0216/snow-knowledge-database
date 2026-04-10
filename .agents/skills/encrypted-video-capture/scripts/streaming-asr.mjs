/**
 * streaming-asr.mjs — Tail a growing WAV file and transcribe in 10-second chunks.
 *
 * Reads raw PCM from the WAV file (skipping the 44-byte header) and transcribes
 * each complete 10s chunk (320,000 bytes at 16kHz/mono/16-bit) via the ASR API.
 * Writes JSONL transcript entries to a session-scoped log file.
 *
 * Runs independently alongside record-audio.sh — does NOT touch that process.
 *
 * Usage:
 *   node scripts/streaming-asr.mjs --wav <path> --session-id <id>
 *
 * Env vars (read from .env if present):
 *   OPENROUTER_API_KEY  — used for ASR API calls
 *   OPENAI_API_KEY      — alternative ASR key
 */

import { parseArgs } from "node:util";
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { transcriptLog } from "../playwright/pathConstants.mjs";

// ── Constants ─────────────────────────────────────────────────────────────────

const WAV_HEADER_BYTES = 44;
const SAMPLE_RATE = 16000;       // Hz
const CHANNELS = 1;               // mono
const BIT_DEPTH = 16;             // bits per sample
const BYTES_PER_SAMPLE = BIT_DEPTH / 8;
const BYTES_PER_SECOND = SAMPLE_RATE * CHANNELS * BYTES_PER_SAMPLE;
const CHUNK_SECONDS = 10;
const CHUNK_BYTES = BYTES_PER_SECOND * CHUNK_SECONDS; // 320,000

const POLL_INTERVAL_MS = 2000;

// ── Args ──────────────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  options: {
    wav:          { type: "string" },
    "session-id": { type: "string", default: "" },
  },
  allowPositionals: false,
});

if (!args.wav) {
  console.error("Usage: streaming-asr.mjs --wav <wav-file> --session-id <id>");
  process.exit(1);
}

const WAV_PATH = args.wav;
const SESSION_ID = args["session-id"];
const LOG_PATH = SESSION_ID ? transcriptLog(SESSION_ID) : null;

// ── WAV header builder ────────────────────────────────────────────────────────

/**
 * Wrap raw PCM bytes in a minimal 44-byte WAV header.
 * @param {Buffer} pcmData
 * @returns {Buffer}
 */
function buildWavBuffer(pcmData) {
  const dataLen = pcmData.length;
  const header = Buffer.alloc(WAV_HEADER_BYTES);
  let off = 0;

  // RIFF chunk
  header.write("RIFF", off); off += 4;
  header.writeUInt32LE(36 + dataLen, off); off += 4;
  header.write("WAVE", off); off += 4;

  // fmt sub-chunk
  header.write("fmt ", off); off += 4;
  header.writeUInt32LE(16, off); off += 4;          // sub-chunk size
  header.writeUInt16LE(1, off); off += 2;           // PCM format
  header.writeUInt16LE(CHANNELS, off); off += 2;
  header.writeUInt32LE(SAMPLE_RATE, off); off += 4;
  header.writeUInt32LE(BYTES_PER_SECOND, off); off += 4;
  header.writeUInt16LE(CHANNELS * BYTES_PER_SAMPLE, off); off += 2; // block align
  header.writeUInt16LE(BIT_DEPTH, off); off += 2;

  // data sub-chunk
  header.write("data", off); off += 4;
  header.writeUInt32LE(dataLen, off);

  return Buffer.concat([header, pcmData]);
}

// ── ASR call ─────────────────────────────────────────────────────────────────

/**
 * Send a WAV buffer to the ASR API and return the transcript text.
 * Uses OpenAI-compatible audio transcription endpoint via OpenRouter or OpenAI.
 * @param {Buffer} wavBuffer
 * @returns {Promise<string>}
 */
async function transcribeChunk(wavBuffer) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("No ASR API key found. Set OPENROUTER_API_KEY or OPENAI_API_KEY in .env.");
  }

  const isOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
  const host = isOpenRouter ? "openrouter.ai" : "api.openai.com";
  const pathname = isOpenRouter
    ? "/api/v1/audio/transcriptions"
    : "/v1/audio/transcriptions";

  const boundary = `----FormBoundary${Date.now().toString(36)}`;
  const filename = "chunk.wav";

  const preamble = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    `Content-Type: audio/wav\r\n\r\n`
  );
  const modelField = Buffer.from(
    `\r\n--${boundary}\r\n` +
    `Content-Disposition: form-data; name="model"\r\n\r\n` +
    `whisper-1\r\n` +
    `--${boundary}--\r\n`
  );
  const body = Buffer.concat([preamble, wavBuffer, modelField]);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: host,
        path: pathname,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": body.length,
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          try {
            const json = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            if (json.error) {
              reject(new Error(`ASR API error: ${json.error.message || JSON.stringify(json.error)}`));
            } else {
              resolve(json.text || "");
            }
          } catch (e) {
            reject(new Error(`ASR response parse error: ${e.message}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── JSONL writer ──────────────────────────────────────────────────────────────

function appendTranscriptEntry(entry) {
  if (!LOG_PATH) return;
  fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + "\n", "utf8");
}

// ── Main loop ─────────────────────────────────────────────────────────────────

/**
 * Calculate streaming coverage: ratio of bytes transcribed to total PCM bytes.
 * @param {number} bytesRead  PCM bytes sent to ASR
 * @param {string} wavPath
 * @returns {number} coverage ratio [0, 1]
 */
function coverageRatio(bytesRead, wavPath) {
  try {
    const stat = fs.statSync(wavPath);
    const totalPcm = Math.max(0, stat.size - WAV_HEADER_BYTES);
    return totalPcm > 0 ? Math.min(1, bytesRead / totalPcm) : 0;
  } catch {
    return 0;
  }
}

async function runStreamingAsr() {
  let fileOffset = WAV_HEADER_BYTES; // start past the WAV header
  let chunkIdx = 0;
  let totalPcmRead = 0;

  console.error(`[streaming-asr] Tailing ${WAV_PATH} (10s chunks, ${CHUNK_BYTES} bytes each)`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Check if WAV file exists yet
    let stat;
    try {
      stat = fs.statSync(WAV_PATH);
    } catch {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    const availableBytes = stat.size - fileOffset;
    if (availableBytes < CHUNK_BYTES) {
      // Not enough for a complete chunk yet
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    // Read exactly one chunk
    const fd = fs.openSync(WAV_PATH, "r");
    const pcmBuf = Buffer.alloc(CHUNK_BYTES);
    const bytesActuallyRead = fs.readSync(fd, pcmBuf, 0, CHUNK_BYTES, fileOffset);
    fs.closeSync(fd);

    if (bytesActuallyRead < CHUNK_BYTES) {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    fileOffset += CHUNK_BYTES;
    totalPcmRead += CHUNK_BYTES;
    chunkIdx++;

    const timestamp = fileOffset / BYTES_PER_SECOND - CHUNK_SECONDS; // seconds from start
    const wavBuffer = buildWavBuffer(pcmBuf);

    try {
      const text = await transcribeChunk(wavBuffer);
      const entry = { timestamp, chunk_idx: chunkIdx, text };
      appendTranscriptEntry(entry);
      console.error(`[streaming-asr] chunk ${chunkIdx} @ ${timestamp.toFixed(1)}s: ${text.slice(0, 60)}`);
    } catch (err) {
      console.error(`[streaming-asr] ASR error on chunk ${chunkIdx}: ${err.message} — continuing`);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Export pure helpers for tests
export { buildWavBuffer, coverageRatio, CHUNK_BYTES, WAV_HEADER_BYTES, BYTES_PER_SECOND };

// Run if executed directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.url.replace("file://", ""))) {
  runStreamingAsr().catch((err) => {
    console.error(`[streaming-asr] Fatal: ${err.message}`);
    process.exit(1);
  });
}
