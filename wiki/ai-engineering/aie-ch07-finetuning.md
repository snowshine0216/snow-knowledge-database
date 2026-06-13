---
tags: [finetuning, peft, lora, qlora, quantization, model-merging, chip-huyen]
source: https://github.com/chiphuyen/aie-book
---

# AIE Ch.7 — Finetuning

The heaviest adaptation lever: change the model's **weights**. Exhaust cheaper levers first. Full review pack with quiz: [[07-finetuning]].

## When to finetune

- **Finetune for behavior** — consistent format/style/skill that prompting won't reliably enforce, or to run a smaller/cheaper model at quality.
- **Don't finetune** when the gap is **missing knowledge** (use RAG — [[aie-ch06-rag-and-agents]]), when you **lack high-quality data** (finetuning amplifies bad data), or when you're **early in iteration** (it locks in assumptions).
- **RAG = knowledge, finetuning = behavior** — most production systems need both.

## Memory bottleneck

Training memory holds **weights + activations + gradients + optimizer states**. With Adam, full fp32 finetuning costs ~16 bytes/param before activations → a 7B model needs **>100 GB**. That gap is what PEFT collapses.

## PEFT and LoRA

- **LoRA** — freeze **W**, learn a **low-rank** update **ΔW = B·A** (rank r ≪ d). Trains ~**99% fewer** parameters because adaptation has low intrinsic rank.
- **Two wins**: (1) memory efficiency (finetune on one GPU); (2) **modularity** — a small adapter on a frozen base, **hot-swappable** → one base + N customer adapters (multi-tenant serving). The modularity is often the bigger win.
- **QLoRA** — LoRA on a **4-bit quantized** frozen base → much larger models on modest hardware. Inference quantization is robust; **training** quantization is harder (gradients are sensitive).

## Model merging

Combine models/adapters **without extra training** for multi-task or on-device deployment: weight **summing/task arithmetic** (SLERP, TIES, DARE), **layer stacking**, concatenation.

## Key Takeaways

- The **lever ladder**: prompt → RAG → finetune, rising in cost and commitment. Climb only when forced.
- **Finetuning amplifies your data** — lacking clean data is a reason *not* to finetune. The real work is upstream **dataset engineering** ([[aie-ch08-dataset-engineering]]).

## See Also

- [[chip-huyen-ai-engineering-book]]
- [[aie-ch06-rag-and-agents]] · [[aie-ch08-dataset-engineering]]
- [[aie-ch09-inference-optimization]] (quantization reappears at serving)
