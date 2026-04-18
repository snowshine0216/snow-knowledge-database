---
tags: [claude-code, benchmark, programming-languages, ai-coding, cost-optimization]
source: https://medium.huizhou92.com/which-programming-language-should-you-use-with-claude-code-39beaa4693af
---

# Claude Code Language Benchmark

A benchmark measuring AI code generation speed, cost, and reliability across programming languages when using [[Claude Code]]. Based on the `ai-coding-lang-bench` benchmark (600 runs across prototyping-scale tasks).

## Results Summary

### Top Tier (Dynamic Languages)

| Language | Avg Time | Avg Cost | Pass Rate |
|---|---|---|---|
| Ruby | 73.1s +/- 4.2s | $0.36 | 40/40 |
| Python | 74.6s +/- 4.5s | $0.38 | 40/40 |
| JavaScript | 81.1s +/- 5.0s | $0.39 | 40/40 |

### Middle Tier

| Language | Avg Time | Avg Cost | Pass Rate |
|---|---|---|---|
| Go | 101.6s +/- 37.0s | $0.50 | 40/40 |

### Type Checker Variants (Slower)

| Language | Avg Time | Avg Cost | Pass Rate |
|---|---|---|---|
| Python + mypy | 125.3s +/- 19.0s | $0.57 | 40/40 |
| Ruby + Steep | 186.6s +/- 69.7s | $0.84 | 40/40 |

Across 600 runs, only 3 failures occurred (Rust: 2, Haskell: 1).

## Key Findings

- **Dynamic languages win on prototyping speed and cost**: Ruby, Python, and JavaScript are fastest and cheapest for AI-assisted generation
- **Type checking adds overhead**: strict type-checking increases generation cost/time significantly (1.6-1.7x for Python+mypy, 2.0-3.2x for Ruby+Steep)
- **Code compactness does not equal generation speed**: OCaml and Haskell produce compact code but are still relatively slow to generate
- **AI generation efficiency is a practical language-selection metric** alongside runtime performance and ecosystem fit

## Practical Workflow for Typed-Language Teams

For teams whose production stack uses Go, Rust, or other statically-typed languages:

1. **Prototype in a dynamic language** (Python/Ruby/JS) where iteration speed dominates
2. **Stabilize contracts and behavior** through tests and interface definitions
3. **Migrate hardened modules** to the production language once interfaces and edge cases are clear

## Team Playbook

1. Track "AI cost per feature" (time and dollar cost) during implementation spikes
2. Use dynamic languages where iteration speed dominates
3. Move validated logic into the production stack once interfaces and edge cases are clear

## Caveats

- Results target prototyping-scale tasks, not large production systems
- External library/framework effects were intentionally minimized
- Outcomes may shift with model and tool updates

## Source

Benchmark repository: [github.com/mame/ai-coding-lang-bench](https://github.com/mame/ai-coding-lang-bench)

## See Also

- [[Claude Code Tips Collection]] -- practical usage patterns
- [[Claude Code Multi-Agent Setup]] -- extension architecture for scaling
- [[LLM Knowledge Base]] -- broader LLM concepts and tooling
