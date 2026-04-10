---
tags: [setup, blackhole, audio, macos, encrypted-video-capture]
source: https://existential.audio/blackhole/
---

# Setup Guide: encrypted-video-capture

Follow these 8 sections in order. Each section has a verification step — complete it before moving on.

Estimated time: **15–20 minutes** (one-time setup).

> **Before running `/encrypted-video-capture`, complete these 3 manual steps:**
> 1. Create a Multi-Output Device in Audio MIDI Setup (§2)
> 2. Set it as system audio output (§3)
> 3. Install ASR — either `pip install faster-whisper` (local) or set `OPENROUTER_API_KEY` in `.env` (cloud) (§7)

---

## 1. Install BlackHole 2ch

BlackHole is a free macOS virtual audio driver that routes system audio to recording software.

```bash
brew install blackhole-2ch
```

Or download the installer from https://existential.audio/blackhole/ and run it.

**Verify:** Open **System Settings → Sound**. Under Output devices, you should see "BlackHole 2ch" in the list.

---

## 2. Create a Multi-Output Device in Audio MIDI Setup

You need audio to go to both your speakers **and** BlackHole simultaneously.

1. Open **Audio MIDI Setup** (search in Spotlight).
2. Click the **+** button in the bottom-left → select **Create Multi-Output Device**.
3. In the device list on the right, check both:
   - **BlackHole 2ch**
   - Your speakers (e.g. "MacBook Pro Speakers" or your external audio device)
4. Rename it: double-click the device name → type **Multi-Output Device**.
5. Make sure **BlackHole 2ch** is checked as the **Master Device** (click the radio button next to it).

**Verify:** The new "Multi-Output Device" appears in the Audio MIDI Setup sidebar.

---

## 3. Set Multi-Output Device as System Audio Output

```
System Settings → Sound → Output → select "Multi-Output Device"
```

You should still hear audio through your speakers — sound now goes to both your speakers and BlackHole.

**Verify:** Play any audio (YouTube, music). You hear it through your speakers as before.

---

## 4. Grant Microphone Permission (macOS Ventura+)

ffmpeg uses the `avfoundation` input device, which requires microphone permission even when recording from BlackHole.

```
System Settings → Privacy & Security → Microphone
```

Enable access for **Terminal** (or whichever app runs Claude Code — iTerm, VS Code, etc.).

> Note: The first time you run `ffmpeg -f avfoundation ...`, macOS will show a permission dialog. Grant access. If you dismiss it accidentally, grant it manually here.

**Verify:** The Terminal (or your app) is listed under Microphone with the toggle ON.

---

## 5. Verify BlackHole Device Index

The device index changes if you add/remove audio devices. Run this to find it:

```bash
ffmpeg -f avfoundation -list_devices true -i "" 2>&1
```

Look for a line like:

```
[AVFoundation indev @ ...] [1] BlackHole 2ch
```

The number in `[N]` is your BlackHole device index. The preflight script auto-detects this, but if it fails, set it manually in `.env`:

```bash
BLACKHOLE_DEVICE=1
```

**Verify:** You see a `[N] BlackHole 2ch` line in the output.

---

## 6. Install Playwright and Chromium

```bash
npm install -g playwright
npx playwright install chromium
```

**Verify:**

```bash
npx playwright --version
# Playwright version X.Y.Z
```

---

## 7. Set Up ASR Provider

Choose one:

### Option A: faster-whisper (local, recommended)

```bash
cd .claude/skills/yt-video-summarizer
pip install faster-whisper
```

**Verify:**

```bash
python3 -c "import faster_whisper; print('OK')"
# OK
```

### Option B: OpenRouter API (cloud)

Get an API key from https://openrouter.ai and add it to `.env`:

```
OPENROUTER_API_KEY=sk-or-...
```

**Verify:** The key is set: `echo $OPENROUTER_API_KEY`

---

## 8. Run Preflight

```bash
cd .agents/skills/encrypted-video-capture
bash scripts/preflight.sh
```

Expected output on success:

```
INFO: BlackHole device index detected: 1
INFO: ASR provider: faster-whisper (local)
INFO: Running 2-second test recording to verify BlackHole capture...

✓ Preflight passed.
  BlackHole device: :1
  ASR provider ready
  Disk space OK
  2-second test recording: OK (64844 bytes)

You're ready to capture. Run: /encrypted-video-capture <course-url>
```

If the test recording shows `0 bytes` or fails, check that:
- System audio output is set to "Multi-Output Device" (Step 3)
- Microphone permission is granted (Step 4)
- The BlackHole device index matches what preflight detected (Step 5)
