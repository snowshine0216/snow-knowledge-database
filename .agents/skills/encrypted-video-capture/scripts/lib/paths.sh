#!/usr/bin/env bash
# paths.sh — resolve project-local paths for encrypted-video-capture
# Sources/exports: REPO_ROOT, EVC_TMP, SKILL_DIR
# Never use /tmp/ for EVC artifacts — macOS clears it and long transcription jobs lose data.

set -euo pipefail

# Skill directory: two levels up from this file (scripts/lib/ → skill root)
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export SKILL_DIR

# Repo root: git toplevel, else cwd (never /tmp)
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
if [ "$REPO_ROOT" = "/tmp" ] || [ "$REPO_ROOT" = "/private/tmp" ]; then
  echo "ERROR: REPO_ROOT resolved to $REPO_ROOT (system tmp). Run from the repo." >&2
  exit 1
fi
export REPO_ROOT

# Project-local tmp (overridable)
EVC_TMP="${EVC_TMP:-$REPO_ROOT/tmp/evc}"
mkdir -p "$EVC_TMP"
export EVC_TMP

# Gitignore check (warn, don't fail)
if ! grep -qE '^/?tmp/?$' "$REPO_ROOT/.gitignore" 2>/dev/null; then
  echo "WARNING: tmp/ is not in $REPO_ROOT/.gitignore — artifacts may leak into commits." >&2
fi
