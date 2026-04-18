#!/usr/bin/env bash
# subagent.sh — emit Agent-tool dispatch envelope for a single lesson writeup
# The orchestrator's caller (Claude) reads this stdout and invokes the Agent tool.

# emit_writeup_envelope <idx> <title> <source_url> <transcript_path> <course_name> <save_path1> <save_path2> [<simplified_chinese>]
emit_writeup_envelope() {
  local idx="$1" title="$2" url="$3" tx="$4" course="$5" p1="$6" p2="$7"
  local lang="${8:-false}"
  local template="$SKILL_DIR/../content-summarizer/references/template-lecture-text.md"
  [ -f "$template" ] || { echo "ERROR: template missing: $template" >&2; return 1; }
  jq -n \
    --arg idx "$idx" --arg title "$title" --arg url "$url" \
    --arg tx "$tx" --arg course "$course" --arg p1 "$p1" --arg p2 "$p2" \
    --argjson lang "$lang" \
    --rawfile template "$template" \
    '{
      dispatch: "general-purpose",
      description: ("Write lesson " + $idx + " summary"),
      idx: $idx, title: $title, source_url: $url,
      course_name: $course, transcript_path: $tx,
      save_paths: [$p1, $p2],
      simplified_chinese: $lang,
      template: $template
    }'
}
