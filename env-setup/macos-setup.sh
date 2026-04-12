#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
INSTALL_LOCAL_ASR="${INSTALL_LOCAL_ASR:-1}"
YTDLP_CONFIG_DIR="${HOME}/.config/yt-dlp"
YTDLP_CONFIG_FILE="${YTDLP_CONFIG_DIR}/config"

log() {
  printf "\n==> %s\n" "$*"
}

warn() {
  printf "\n[warn] %s\n" "$*" >&2
}

append_line_if_missing() {
  local file="$1"
  local line="$2"

  mkdir -p "$(dirname "$file")"
  touch "$file"
  if ! grep -Fqx "$line" "$file"; then
    printf "%s\n" "$line" >> "$file"
  fi
}

profile_targets() {
  local shell_name
  shell_name="$(basename "${SHELL:-zsh}")"

  printf "%s\n" "$HOME/.zshrc"
  if [[ "$shell_name" == "bash" ]]; then
    printf "%s\n" "$HOME/.bashrc"
    printf "%s\n" "$HOME/.bash_profile"
  fi
}

detect_brew_bin() {
  if command -v brew >/dev/null 2>&1; then
    command -v brew
    return 0
  fi

  if [[ -x /opt/homebrew/bin/brew ]]; then
    printf "%s\n" "/opt/homebrew/bin/brew"
    return 0
  fi

  if [[ -x /usr/local/bin/brew ]]; then
    printf "%s\n" "/usr/local/bin/brew"
    return 0
  fi

  return 1
}

ensure_brew_shellenv() {
  local brew_bin

  brew_bin="$(detect_brew_bin)"
  eval "$("$brew_bin" shellenv)"
}

persist_brew_shellenv() {
  local brew_bin
  local line

  brew_bin="$(detect_brew_bin)"
  line="eval \"\$(${brew_bin} shellenv)\""

  while IFS= read -r target; do
    append_line_if_missing "$target" "$line"
  done < <(profile_targets)
}

persist_nvm_setup() {
  local nvm_prefix
  local nvm_sh
  local nvm_completion

  nvm_prefix="$(brew --prefix nvm)"
  nvm_sh="${nvm_prefix}/nvm.sh"
  nvm_completion="${nvm_prefix}/etc/bash_completion.d/nvm"

  while IFS= read -r target; do
    append_line_if_missing "$target" 'export NVM_DIR="$HOME/.nvm"'
    append_line_if_missing "$target" "[ -s \"${nvm_sh}\" ] && \\. \"${nvm_sh}\""
    append_line_if_missing "$target" "[ -s \"${nvm_completion}\" ] && \\. \"${nvm_completion}\""
  done < <(profile_targets)
}

install_homebrew() {
  if detect_brew_bin >/dev/null 2>&1; then
    log "Homebrew already installed"
    ensure_brew_shellenv
    persist_brew_shellenv
    return
  fi

  log "Installing Homebrew"
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ensure_brew_shellenv
  persist_brew_shellenv
}

install_brew_packages() {
  log "Installing Homebrew packages"
  brew install nvm python yt-dlp ffmpeg jq graphviz uv gh bun bats-core
  brew install --cask libreoffice
}

load_nvm() {
  export NVM_DIR
  # shellcheck source=/dev/null
  . "$(brew --prefix nvm)/nvm.sh"
}

install_node_lts() {
  log "Installing the current Node.js LTS with nvm"
  mkdir -p "$NVM_DIR"
  persist_nvm_setup
  load_nvm
  nvm install --lts
  nvm alias default 'lts/*'
  nvm use default >/dev/null
}

install_codex() {
  log "Installing Codex CLI"
  npm install -g @openai/codex
}

install_claude_code() {
  log "Installing Claude Code"
  nvm use default
  npm install -g @anthropic-ai/claude-code
}

create_ytdlp_config() {
  log "Ensuring yt-dlp config exists"
  mkdir -p "$YTDLP_CONFIG_DIR"

  if [[ -f "$YTDLP_CONFIG_FILE" ]]; then
    warn "Existing yt-dlp config found at ${YTDLP_CONFIG_FILE}; leaving it unchanged."
    return
  fi

  cat >"$YTDLP_CONFIG_FILE" <<'EOF'
# Save downloads to Downloads/yt-dlp
-P ~/Downloads/yt-dlp

# Safer file names
--restrict-filenames

# Resume partial downloads
-c

# Best video + audio, fallback to best single file
-f "bv*+ba/b"
EOF
}

install_python_support() {
  log "Upgrading Python packaging tools"
  python3 -m pip install --user --upgrade pip setuptools wheel

  if [[ "$INSTALL_LOCAL_ASR" != "1" ]]; then
    log "Skipping faster-whisper install because INSTALL_LOCAL_ASR=${INSTALL_LOCAL_ASR}"
    return
  fi

  log "Installing faster-whisper for local ASR fallback"
  if ! python3 -m pip install --user --upgrade faster-whisper; then
    warn "faster-whisper install failed. Subtitle-based extraction still works, and OpenAI ASR can be used if OPENAI_API_KEY is set."
  fi
}

print_next_steps() {
  local shell_name
  shell_name="$(basename "${SHELL:-zsh}")"

  cat <<EOF

Setup complete.

Set zsh as your default login shell:
  chsh -s /bin/zsh

Reload your shell:
  exec zsh

Verify:
  echo "\$SHELL"
EOF

  if [[ "$shell_name" == "bash" ]]; then
    cat <<EOF
  # If you are staying on bash, use:
  source "$HOME/.bashrc"
EOF
  fi

  cat <<EOF

Verify the toolchain:
  brew --version
  nvm --version
  node --version
  npm --version
  codex --version
  claude --version
  python3 --version
  uv --version
  yt-dlp --version
  ffmpeg -version
  jq --version
  dot -V
  gh --version
  bun --version

Authenticate GitHub CLI:
  gh auth login

Authenticate Codex:
  codex --login

Optional API-based auth and ASR fallback:
  export OPENAI_API_KEY="your_api_key"

Repo-aware checks for the YouTube summarizer skill:
  python3 .agents/skills/yt-video-summarizer/scripts/extract_video_context.py --help
  python3 -c "from faster_whisper import WhisperModel; print('faster-whisper ok')"

Notes:
  - The repo root is: ${REPO_ROOT}
  - Cookie-based YouTube retries use Chrome by default. If Chrome is not installed, change --cookies-from-browser when running the skill.
EOF
}

main() {
  install_homebrew
  install_brew_packages
  install_node_lts
  install_codex
  install_claude_code
  create_ytdlp_config
  install_python_support
  print_next_steps
}

main "$@"
