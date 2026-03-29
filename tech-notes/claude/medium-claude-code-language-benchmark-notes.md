# Medium Tech Notes: Claude Code Language Benchmark

Source article:
- https://medium.huizhou92.com/which-programming-language-should-you-use-with-claude-code-39beaa4693af

Primary benchmark source:
- https://github.com/mame/ai-coding-lang-bench

Date summarized: 2026-03-22

## Key Takeaways

- For prototyping-scale AI coding with Claude Code, Ruby, Python, and JavaScript were best overall on speed, cost, and stability.
- Go sits in a middle tier: slower and costlier than top dynamic languages, but better than several static or complex-language configurations.
- Adding strict type-checking increased generation cost/time in this benchmark:
- `Python + mypy`: about `1.6-1.7x` slower than plain Python.
- `Ruby + Steep`: about `2.0-3.2x` slower than plain Ruby.
- Fewer lines of code did not guarantee faster generation:
- OCaml and Haskell were compact but still relatively slow.
- Across 600 runs, only 3 failures occurred (Rust 2, Haskell 1).

## Important Numbers (from benchmark README)

- Top 3 (time / avg cost):
- Ruby: `73.1s +- 4.2s`, `$0.36`, pass `40/40`
- Python: `74.6s +- 4.5s`, `$0.38`, pass `40/40`
- JavaScript: `81.1s +- 5.0s`, `$0.39`, pass `40/40`
- Go:
- `101.6s +- 37.0s`, `$0.50`, pass `40/40`
- Type checker variants:
- Python/mypy: `125.3s +- 19.0s`, `$0.57`, pass `40/40`
- Ruby/Steep: `186.6s +- 69.7s`, `$0.84`, pass `40/40`

## Insights

- AI generation efficiency is becoming a practical language-selection metric, alongside runtime performance and ecosystem fit.
- Type systems still provide value, but in AI-assisted generation they add extra constraint-solving work (types + logic + tooling constraints).
- "Code compactness" and "AI generation ease" are separate dimensions.
- For Go teams, a practical workflow is:
- Prototype quickly in dynamic languages.
- Stabilize contracts and behavior.
- Migrate hardened modules to Go for production properties.

## Caveats

- Results target prototyping-scale tasks, not large production systems.
- External libraries/framework effects were intentionally minimized in the benchmark design.
- The benchmark itself notes this is a fast-moving area; outcomes may shift quickly with model/tool updates.

## Suggested Team Playbook

1. Track "AI cost per feature" (time and dollar cost) during implementation spikes.
2. Use dynamic languages where iteration speed dominates.
3. Move validated logic into production stack (for example Go) once interfaces and edge cases are clear.
