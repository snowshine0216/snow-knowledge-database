---
tags: [agent-harness, parallel-tool-calling, goroutine, fork-join, concurrency, go-lang, main-loop, harness-engineering]
source: https://time.geekbang.org/column/article/973865
---
# Concurrent Tool Execution in Agent Harness — Fork-Join Pattern

Harness engines that receive multiple tool calls from a single LLM response have a binary choice: execute them serially (simple, slow) or in parallel (performant, slightly more complex). This article captures the design rationale and Go implementation pattern for the parallel approach, drawn from Tony Bai's *AI Agent Harness Training* course (Geektime, Chapter 08).

## Key Concepts

- **Parallel Tool Calling**: Modern frontier models (Claude 4.x Sonnet, GLM-5.x) natively emit multiple `ToolCall` entries in a single API response when the task benefits from simultaneous information gathering. A naive harness that processes these serially wastes the parallelism the model already planned.

- **Independence Assumption**: The foundational guarantee that makes parallel execution safe — models trained with RLHF learn to emit only independent tool calls within the same Turn; any operation that depends on the result of another must appear in the *next* Turn after the first result is returned. If a model violates this (emitting a `write_file` and `bash` in the same Turn), the harness treats the resulting error as a self-correction signal and returns it verbatim so the model can plan differently next Turn.

- **Fork-Join Pattern**: The implementation idiom in Go: spawn one Goroutine per tool call (Fork), each writing its result into a pre-allocated slice at a fixed index, then block on `sync.WaitGroup.Wait()` (Join). Total elapsed time = `O(Max(N))` instead of `O(Sum(N))`. For I/O-bound operations like network fetches or disk reads this can be an order-of-magnitude improvement.

- **Pre-allocated Slice (lock-free safety)**: The key insight for avoiding `sync.Mutex`: allocate `make([]schema.Message, len(toolCalls))` before spawning Goroutines. Since each Goroutine writes to a distinct index, there is no shared memory access and no race condition — no lock needed. This also preserves result ordering identical to the model's original `ToolCall` array, which matters for LLM context coherence.

- **Closure Variable Capture Trap**: In Go ≤1.21, `go func() { use(toolCall) }()` inside a for-range loop captures the loop variable by reference — all Goroutines see the last value. The fix: pass `(idx int, call schema.ToolCall)` as explicit parameters to the anonymous function.

- **Data Race at the File Layer**: When two concurrent Goroutines touch the same file (one read, one write), the pre-allocated slice trick does *not* help — the race is at the filesystem level. Two mitigation strategies:
  - *File-path RWMutex*: maintain a `sync.Map` of per-path `sync.RWMutex`; readers take `RLock`, writers take `Lock`. Caveat: this only protects individual I/O atomicity, not multi-step "read → decide → write" sequences (TOCTOU).
  - *Read-parallel, write-serial*: the harness inspects each batch of tool calls; if all are read-only, execute concurrently; if any write exists, fall back to serial. Simpler to implement, correct for the vast majority of real agent workloads.

## Deep Dive

### Why pass loop variables into the Goroutine?

Before Go 1.22, `for range` loop variables were reused across iterations. A closure like `go func() { use(i, toolCall) }()` could therefore capture the shared loop variables rather than the values from that specific iteration. Passing `(idx int, call schema.ToolCall)` into the Goroutine fixes the bug by copying the current iteration's values into function-local parameters before the Goroutine runs.

### Why is the pre-allocated slice effectively lock-free?

`make([]schema.Message, len(toolCalls))` allocates the backing array up front. Each Goroutine writes exactly one slot such as `observationMsgs[idx]`, so there is no contention over the slice header and no need for `sync.Mutex` during result collection. This remains safe as long as three conditions hold:

- the slice length is fixed before workers start
- each index has exactly one writer
- readers only inspect the slice after `wg.Wait()` returns

This is fundamentally different from `append`, which mutates shared slice metadata and may trigger reallocation.

### Why is `append + mutex` usually slower?

With `append`, all workers compete to mutate the same shared slice header. Even if capacity is pre-sized, the critical section still serializes on `len` updates and any future growth logic. The mutex therefore reintroduces a hotspot: lock contention, wakeups, cache synchronization, and potentially more expensive time spent inside the lock when reallocation happens.

The pre-allocated-slice pattern removes that bottleneck by turning one shared append path into many disjoint writes.

### What does [[WaitGroup]] buy you beyond waiting?

`[[WaitGroup]]` is not just a join primitive here; it also defines the safe read boundary. The harness should not iterate over `observationMsgs` until `wg.Wait()` has returned. In practice, that makes `Wait()` the point after which the fan-out work can be treated as fully published to the main loop.

### When should you switch to channels?

The fixed-index slice approach is ideal when the number of tasks is known, each task produces exactly one result, and preserving original order matters. Reach for `channel`-based aggregation when any of these assumptions breaks:

- results are variable in count
- consumers should process outputs as soon as they arrive
- the system is a multi-stage pipeline rather than a single fan-out/fan-in batch
- producer/consumer backpressure is useful

One subtle edge case: even disjoint writes can suffer from [[false-sharing]] if adjacent indices are updated extremely frequently on different cores. That is a performance issue, not a correctness issue, and it usually matters only in hot in-memory loops rather than tool-call workloads dominated by I/O.

## Key Numbers

| Metric | Value |
|---|---|
| Parallel total time vs serial | O(Max(N)) vs O(Sum(N)) |
| Files modified in go-tiny-claw | 1 (`internal/engine/loop.go`) + test harness in `cmd/claw/main.go` |
| Goroutine launch overhead | Zero allocation if reusing WaitGroup, negligible vs I/O cost |

## Key Takeaways

- The Independence Assumption is not a hope — it is a trained property of RLHF-tuned models. Harness engines can trust it and parallelize unconditionally within a Turn.
- Pre-allocated slices are the idiomatic Go solution for concurrent fan-out → ordered fan-in: no mutex, no channel juggling, preserves order automatically.
- The closure variable capture trap (`go func() { use(var) }()` vs `go func(v T) { use(v) }(var)`) is the single most common Go concurrency bug in harness code — always pass loop variables as parameters.
- RWMutex alone cannot prevent TOCTOU across multi-step tool sequences; "read-parallel, write-serial" batch scheduling solves it with lower complexity.
- Architectural decoupling pays off here: all changes fit in one file (`loop.go`), with zero changes to Provider or Tools — the layered boundary design from earlier chapters absorbed the modification.

## See Also

- [[harness-engineering]]
- [[agentic-loop-self-correction]]
- [[context-engineering]]
- [[action-phase]]
