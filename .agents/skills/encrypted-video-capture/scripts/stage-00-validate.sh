#!/usr/bin/env bash
# stage-00-validate.sh — URL validation (fast-fail before any I/O)
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/paths.sh"

URL="${1:?ERROR: usage: stage-00-validate.sh <course-url>}"
cd "$SKILL_DIR"
ADAPTER=$(node -e "
  import('./playwright/adapters/adapter-interface.mjs').then(m => {
    const a = m.resolveAdapter(process.argv[1]);
    if (!a) {
      console.error('ERROR: Unsupported URL: ' + process.argv[1]);
      console.error('Supported:');
      for (const p of m.supportedUrlPatterns()) console.error('  - ' + p);
      process.exit(1);
    }
    console.log(a.name);
  });
" -- "$URL")
echo "INFO: Adapter resolved: $ADAPTER"
echo "$ADAPTER"
