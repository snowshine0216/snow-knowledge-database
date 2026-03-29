# macOS Environment Setup

This folder contains a macOS setup path for this repository.

It covers:

- Homebrew
- `nvm`
- the current Node.js LTS
- Codex CLI
- optional `CC-Switch` for managing Claude Code / Codex / Gemini provider configs on macOS
- `python3`
- `yt-dlp`
- `ffmpeg`
- `jq`
- optional `faster-whisper` for local ASR in the YouTube summarizer skill

## Files

- `macos-setup.sh`: installs the core toolchain and writes a default `yt-dlp` config if one does not already exist
- [github-repo-setup.md](./github-repo-setup.md): GitHub remote/auth setup, credential helper config, and troubleshooting notes
- [pptagent-setup.md](./pptagent-setup.md): PPTAgent environment setup and fixes for Docker sandbox image and `soffice` issues
- [skills-collections-setup.md](./skills-collections-setup.md): curated skill collections, install commands, and purpose notes (including DingTalk Wukong Skills, gstack, and Zhihu top-10 summary)

## Run It

From the repository root:

```bash
chmod +x env-setup/macos-setup.sh
./env-setup/macos-setup.sh
```

If you want to skip local ASR installation and rely on subtitles plus OpenAI transcription fallback instead:

```bash
INSTALL_LOCAL_ASR=0 ./env-setup/macos-setup.sh
```

## Optional: Install `CC-Switch`

If you want a GUI app to manage Claude Code, Codex, and Gemini provider configs on macOS, PackyAPI recommends installing `CC-Switch` with Homebrew:

```bash
brew tap farion1231/ccswitch
brew install --cask cc-switch
```

After installation, open `CC-Switch` from Launchpad or the `Applications` folder.

This is an optional add-on. The repo's `macos-setup.sh` does not install it automatically.

## Shell Defaults (zsh)

Set your default login shell to `zsh`:

```bash
chsh -s /bin/zsh
```

Refresh the current shell session:

```bash
exec zsh
```

Verify:

```bash
echo $SHELL
```

## What The Script Sets Up

### 1. Homebrew

Installs Homebrew if `brew` is missing and adds the `brew shellenv` snippet to your shell profile.

### 2. `nvm` and Node.js

Installs `nvm` through Homebrew, creates `~/.nvm`, and installs the current Node.js LTS release with:

```bash
nvm install --lts
```

### 3. Codex CLI

Installs Codex globally with npm:

```bash
npm install -g @openai/codex
```

Authentication options:

- `codex --login` to sign in with ChatGPT
- `export OPENAI_API_KEY="..."` if you want API-key based auth

The Codex install and login flow in this document was verified against OpenAI Help Center guidance on March 18, 2026.

### 4. YouTube Summarizer Skill Dependencies

The repo’s YouTube summarizer skill uses:

- `python3`
- `yt-dlp`
- `ffmpeg`
- `jq` for some command recipes
- `faster-whisper` for local ASR fallback
- `OPENAI_API_KEY` as an alternative ASR fallback when subtitles are unavailable

Relevant repo references:

- [README](../README.md)
- [yt-dlp setup](../docs/yt-dlp-setup.md)
- [skill definition](../.agents/skills/yt-video-summarizer/SKILL.md)
- [extractor script](../.agents/skills/yt-video-summarizer/scripts/extract_video_context.py)

The script also creates the default `yt-dlp` config at `~/.config/yt-dlp/config` if that file does not already exist.

## Verify

```bash
brew --version
nvm --version
node --version
npm --version
codex --version
python3 --version
yt-dlp --version
ffmpeg -version
jq --version
python3 .agents/skills/yt-video-summarizer/scripts/extract_video_context.py --help
python3 -c "from faster_whisper import WhisperModel; print('faster-whisper ok')"
```

If the last command fails and you do not want local ASR, set:

```bash
export OPENAI_API_KEY="your_api_key"
```

The extractor script can then fall back to OpenAI transcription when subtitles are unavailable.

## Sublime CLI Shortcut (`subl`)

To use `subl <text-file>` in terminal on macOS:

1. Open Sublime Text.
2. Click `Tools` -> `Install Command Line Tool...`
3. Restart your terminal.
4. Test with:

```bash
subl README.md
```

If the menu option is missing, create the symlink manually:

```bash
ln -s "/Applications/Sublime Text.app/Contents/SharedSupport/bin/subl" /usr/local/bin/subl
```

Common usage:

```bash
subl <text-file>
subl .
subl -n <text-file>
```

## macOS Gatekeeper Quarantine Fix

If macOS shows an "unsafe software" warning for a trusted app, you can remove the quarantine attribute:

```bash
sudo xattr -rd com.apple.quarantine <app>
```

Example:

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Sublime Text.app"
```

Verify attributes:

```bash
xattr -l "<app>"
```

Run this only for apps you trust and downloaded from a reliable source.

## Notes

- Cookie-based YouTube retries default to `--cookies-from-browser chrome`. Install Chrome or change the browser flag when running the skill.
- If you already have a custom `~/.config/yt-dlp/config`, the script leaves it unchanged.

## Sources

- OpenAI Help Center: https://help.openai.com/en/articles/11096431-openai-codex-ci-getting-started
- OpenAI Help Center: https://help.openai.com/en/articles/11381614
- PackyAPI CC-Switch docs: https://docs.packyapi.com/docs/ccswitch/
- Repo guide: ../docs/yt-dlp-setup.md
- gstack: https://github.com/garrytan/gstack
