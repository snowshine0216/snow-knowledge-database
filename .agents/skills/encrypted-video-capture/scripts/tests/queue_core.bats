#!/usr/bin/env bats
# queue_core.bats — pure state-machine tests exercised through queue_cli.py.
# Covers: state transitions, reconciliation-from-disk, next-action selection,
# idempotent build, and status counts.

setup() {
  LIB_DIR="$(cd "$BATS_TEST_DIRNAME/../lib" && pwd)"
  export PYTHONPATH="$LIB_DIR"
}

# Run a queue_cli subcommand with the given stdin payload.
cli() {
  local sub="$1"; shift
  python3 "$LIB_DIR/queue_cli.py" "$sub" "$@"
}

# A three-lecture queue with all lectures pending.
fresh_queue() {
  cat <<'JSON'
{"schemaVersion":3,"courseSlug":"demo","courseName":"Demo","courseUrl":"u","playbackSpeed":2.0,
 "lectures":{
   "001":{"idx":"001","title":"a","status":"pending","retries":0,"failedFrom":null},
   "002":{"idx":"002","title":"b","status":"pending","retries":0,"failedFrom":null},
   "003":{"idx":"003","title":"c","status":"pending","retries":0,"failedFrom":null}}}
JSON
}

# ── State transitions ────────────────────────────────────────────────────────

@test "legal transition pending -> recording" {
  out=$(fresh_queue | cli transition 001 recording)
  [ "$(echo "$out" | jq -r '.lectures["001"].status')" = "recording" ]
}

@test "full happy path advances through every stage" {
  q=$(fresh_queue | cli transition 001 recording)
  q=$(echo "$q" | cli transition 001 recorded)
  q=$(echo "$q" | cli transition 001 transcribing)
  q=$(echo "$q" | cli transition 001 transcribed)
  q=$(echo "$q" | cli transition 001 summarizing)
  q=$(echo "$q" | cli transition 001 done)
  [ "$(echo "$q" | jq -r '.lectures["001"].status')" = "done" ]
}

@test "illegal transition pending -> done is rejected" {
  run bash -c "$(declare -f fresh_queue); fresh_queue | python3 '$LIB_DIR/queue_cli.py' transition 001 done"
  [ "$status" -ne 0 ]
  [[ "$output" == *"illegal transition"* ]]
}

@test "failed transition records reason, stage, and increments retries" {
  q=$(fresh_queue | cli transition 001 recording)
  out=$(echo "$q" | cli transition 001 failed "chrome crashed")
  [ "$(echo "$out" | jq -r '.lectures["001"].status')" = "failed" ]
  [ "$(echo "$out" | jq -r '.lectures["001"].reason')" = "chrome crashed" ]
  [ "$(echo "$out" | jq -r '.lectures["001"].failedFrom')" = "record" ]
  [ "$(echo "$out" | jq -r '.lectures["001"].retries')" = "1" ]
}

@test "failed can retry back into its stage" {
  q=$(fresh_queue | cli transition 001 recording)
  q=$(echo "$q" | cli transition 001 failed "boom")
  out=$(echo "$q" | cli transition 001 recording)
  [ "$(echo "$out" | jq -r '.lectures["001"].status')" = "recording" ]
}

@test "unknown lecture id errors" {
  run bash -c "$(declare -f fresh_queue); fresh_queue | python3 '$LIB_DIR/queue_cli.py' transition 999 recording"
  [ "$status" -ne 0 ]
}

# ── Reconciliation from disk ─────────────────────────────────────────────────

reconcile_payload() {
  # $1 = disk facts json for lectures
  local disk="$1"
  cat <<JSON
{"queue": $(fresh_queue_with_states), "disk": $disk}
JSON
}

fresh_queue_with_states() {
  cat <<'JSON'
{"schemaVersion":3,"courseSlug":"demo","lectures":{
   "001":{"idx":"001","status":"recording","retries":0,"failedFrom":null},
   "002":{"idx":"002","status":"transcribing","retries":0,"failedFrom":null},
   "003":{"idx":"003","status":"summarizing","retries":0,"failedFrom":null},
   "004":{"idx":"004","status":"recording","retries":0,"failedFrom":null},
   "005":{"idx":"005","status":"done","retries":0,"failedFrom":null}}}
JSON
}

@test "reconcile fast-forwards recording -> recorded when audio exists" {
  disk='{"001":{"audio":true},"002":{"audio":true},"003":{"summary":true},"004":{},"005":{}}'
  out=$(reconcile_payload "$disk" | cli reconcile)
  [ "$(echo "$out" | jq -r '.lectures["001"].status')" = "recorded" ]
}

@test "reconcile marks transcribed when transcript exists" {
  disk='{"001":{},"002":{"audio":true,"transcript":true},"003":{},"004":{},"005":{}}'
  out=$(reconcile_payload "$disk" | cli reconcile)
  [ "$(echo "$out" | jq -r '.lectures["002"].status')" = "transcribed" ]
}

@test "reconcile marks done when summary exists" {
  disk='{"001":{},"002":{},"003":{"transcript":true,"summary":true},"004":{},"005":{}}'
  out=$(reconcile_payload "$disk" | cli reconcile)
  [ "$(echo "$out" | jq -r '.lectures["003"].status')" = "done" ]
}

@test "reconcile resets crashed in-flight lecture with no artifacts to pending" {
  disk='{"001":{},"002":{},"003":{},"004":{},"005":{}}'
  out=$(reconcile_payload "$disk" | cli reconcile)
  [ "$(echo "$out" | jq -r '.lectures["004"].status')" = "pending" ]
  [ "$(echo "$out" | jq -r '.lectures["002"].status')" = "pending" ]
}

@test "reconcile never downgrades a terminal done lecture" {
  disk='{"001":{},"002":{},"003":{},"004":{},"005":{}}'
  out=$(reconcile_payload "$disk" | cli reconcile)
  [ "$(echo "$out" | jq -r '.lectures["005"].status')" = "done" ]
}

@test "reconcile drops transcribing to recorded when only audio survived" {
  disk='{"001":{},"002":{"audio":true},"003":{},"004":{},"005":{}}'
  out=$(reconcile_payload "$disk" | cli reconcile)
  [ "$(echo "$out" | jq -r '.lectures["002"].status')" = "recorded" ]
}

# ── Next-action selection ────────────────────────────────────────────────────

pipeline_queue() {
  # 001 transcribed (ready to summarize), 002 recorded (ready to transcribe),
  # 003 pending (ready to record), 004 done.
  cat <<'JSON'
{"schemaVersion":3,"courseSlug":"demo","lectures":{
   "001":{"idx":"001","status":"transcribed","retries":0,"failedFrom":null},
   "002":{"idx":"002","status":"recorded","retries":0,"failedFrom":null},
   "003":{"idx":"003","status":"pending","retries":0,"failedFrom":null},
   "004":{"idx":"004","status":"done","retries":0,"failedFrom":null}}}
JSON
}

next_payload() {
  local limits="$1" inflight="$2"
  cat <<JSON
{"queue": $(pipeline_queue), "limits": $limits, "inflight": $inflight}
JSON
}

@test "next pipelines all three stages concurrently on distinct lectures" {
  out=$(next_payload '{"record":1,"transcribe":1,"summarize":1}' '{"record":[],"transcribe":[],"summarize":[]}' | cli next)
  [ "$(echo "$out" | jq 'length')" = "3" ]
  [ "$(echo "$out" | jq -r '[.[]|select(.stage=="summarize")][0].idx')" = "001" ]
  [ "$(echo "$out" | jq -r '[.[]|select(.stage=="transcribe")][0].idx')" = "002" ]
  [ "$(echo "$out" | jq -r '[.[]|select(.stage=="record")][0].idx')" = "003" ]
}

@test "next respects record serial limit of 1" {
  out=$(next_payload '{"record":1,"transcribe":1,"summarize":1}' '{"record":["003"],"transcribe":[],"summarize":[]}' | cli next)
  [ "$(echo "$out" | jq -r '[.[]|select(.stage=="record")]|length')" = "0" ]
}

@test "next does not double-schedule an in-flight lecture" {
  out=$(next_payload '{"record":1,"transcribe":2,"summarize":1}' '{"record":[],"transcribe":["002"],"summarize":[]}' | cli next)
  [ "$(echo "$out" | jq -r '[.[]|select(.idx=="002")]|length')" = "0" ]
}

@test "next re-picks a failed lecture for its stage while retries remain" {
  q='{"schemaVersion":3,"courseSlug":"d","lectures":{"001":{"idx":"001","status":"failed","failedFrom":"transcribe","retries":1}}}'
  payload=$(printf '{"queue": %s, "limits": {"transcribe":1}, "inflight": {}}' "$q")
  out=$(echo "$payload" | cli next 2)
  [ "$(echo "$out" | jq -r '.[0].stage')" = "transcribe" ]
}

@test "next skips a failed lecture that exhausted retries" {
  q='{"schemaVersion":3,"courseSlug":"d","lectures":{"001":{"idx":"001","status":"failed","failedFrom":"transcribe","retries":2}}}'
  payload=$(printf '{"queue": %s, "limits": {"transcribe":1}, "inflight": {}}' "$q")
  out=$(echo "$payload" | cli next 2)
  [ "$(echo "$out" | jq 'length')" = "0" ]
}

# ── build + counts ───────────────────────────────────────────────────────────

@test "build preserves prior progress on re-enumeration" {
  existing='{"lectures":{"001":{"idx":"001","status":"done","retries":0}}}'
  lectures='[{"idx":"001","title":"a","url":"u1"},{"idx":"002","title":"b","url":"u2"}]'
  payload=$(printf '{"meta":{"courseSlug":"demo"},"lectures":%s,"existing":%s}' "$lectures" "$existing")
  out=$(echo "$payload" | cli build)
  [ "$(echo "$out" | jq -r '.lectures["001"].status')" = "done" ]
  [ "$(echo "$out" | jq -r '.lectures["002"].status')" = "pending" ]
  [ "$(echo "$out" | jq -r '.schemaVersion')" = "3" ]
}

@test "counts tallies statuses" {
  out=$(pipeline_queue | cli counts)
  [ "$(echo "$out" | jq -r '.done')" = "1" ]
  [ "$(echo "$out" | jq -r '.pending')" = "1" ]
}

@test "status table renders a summary line" {
  run bash -c "$(declare -f pipeline_queue); pipeline_queue | python3 '$LIB_DIR/queue_cli.py' status"
  [ "$status" -eq 0 ]
  [[ "$output" == *"1/4 done"* ]]
}
