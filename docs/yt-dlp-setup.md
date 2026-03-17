# macOS yt-dlp Setup

This guide covers a reliable `yt-dlp` setup on macOS, including installation, a sane default config, and update commands.

## Prerequisites

- macOS
- Homebrew installed (`brew`)

## 1. Install `yt-dlp`

```bash
brew install yt-dlp
```

## 2. Install `ffmpeg` (recommended)

`ffmpeg` is strongly recommended for merging audio/video streams and post-processing.

```bash
brew install ffmpeg
```

## 3. Verify Installation

```bash
yt-dlp --version
ffmpeg -version
```

## 4. Create a User Config File

Create the default config location on macOS:

```bash
mkdir -p ~/.config/yt-dlp
```

Create `~/.config/yt-dlp/config` with the following content:

```bash
cat > ~/.config/yt-dlp/config <<'CONFIG'
# Save downloads to Downloads/yt-dlp
-P ~/Downloads/yt-dlp

# Safer file names
--restrict-filenames

# Resume partial downloads
-c

# Best video + audio, fallback to best single file
-f "bv*+ba/b"
CONFIG
```

## 5. Test with a URL

```bash
yt-dlp "https://www.youtube.com/watch?v=VIDEO_ID"
```

Replace `VIDEO_ID` with a real video ID.

## 6. Keep It Updated

If installed via Homebrew:

```bash
brew upgrade yt-dlp
```

## Alternative Installation Methods

### Install via `pip`

```bash
python3 -m pip install -U "yt-dlp[default]"
```

### Install Release Binary

```bash
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ~/.local/bin/yt-dlp
chmod a+rx ~/.local/bin/yt-dlp
```

Update binary installs with:

```bash
yt-dlp -U
```

## Sources

- https://github.com/yt-dlp/yt-dlp
- https://github.com/yt-dlp/yt-dlp/wiki/Installation
