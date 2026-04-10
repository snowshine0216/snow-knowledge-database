/**
 * pathConstants.mjs — IPC temp file path generators for encrypted-video-capture.
 *
 * These patterns must match the corresponding shell variable patterns in
 * record-audio.sh. A session ID uniquely identifies one capture run so
 * concurrent invocations don't collide.
 */

/** Path to the file ffmpeg writes when the first audio frame is captured. */
export const ffmpegReadyPath = (sessionId) => `/tmp/evc-ffmpeg-ready-${sessionId}`;

/** Path to the file holding the ffmpeg process PID for the current session. */
export const ffmpegPidPath = (sessionId) => `/tmp/evc-ffmpeg-${sessionId}.pid`;

/** Path to the file geektime-adapter writes when the video 'ended' event fires. */
export const videoEndedPath = (sessionId) => `/tmp/evc-video-ended-${sessionId}`;
