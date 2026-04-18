---
tags: [vlm, gemma, falcon-perception, agentic-loop, image-segmentation, object-detection, vision-agent, dgx-spark, local-inference]
source: https://www.youtube.com/watch?v=VFYnD1WREdU
---

# Gemma 4 Vision Agent | Object Detection + VLM Pipeline

## Video Info
- URL: https://www.youtube.com/watch?v=VFYnD1WREdU
- Platform: YouTube
- Title: Gemma 4 Vision Agent | Object Detection + VLM Pipeline
- Speaker: Prompt Engineering channel
- Channel/Event: Prompt Engineering
- Upload date: 2026-04-07
- Duration: 12:41
- Views / Likes: 11,832 / 433
- Category and tags: Science & Technology; prompt engineering, LLMs, Gemma, Falcon Perception, agents, multimodal
- Transcript source: YouTube manual subtitles (`en-orig`)
- Code repo: https://github.com/PromtEngineer/Gemma4-Visual-Agent/tree/dgx-spark-gb10
- Related reading: Falcon Perception (https://huggingface.co/blog/tiiuae/falcon-perception); Gemma (https://deepmind.google/models/gemma/)

## Executive Summary

Vision language models such as Gemma 4 are strong at scene understanding but weak at counting, localization, and handling occlusion. The presenter combines Gemma 4 (instruction-tuned E4B size) with **Falcon Perception** — a ~300M-parameter segmentation/detection model from TII — inside an agentic loop where the VLM acts as both planner/router and final reasoner, while the segmentation model provides precise object grounding. The pipeline fixes classic VLM failure modes (e.g. "are there more oranges than apples?" on a busy image) while running entirely locally on NVIDIA DGX Spark (a companion MLX/Apple Silicon build also exists). The broader point: for real visual reasoning, a single multimodal model is not enough — you need a tool-augmented agent that knows when to delegate to a specialist.

## Outline

1. Motivation — why combining a VLM with a segmentation model unlocks new applications
2. Gemma 4 family — first Apache 2.0 multimodal reasoning model runnable locally
3. Falcon Perception — a 300M-parameter SAM-like segmentation model
4. VLM failure demo — Gemma 4 miscounts 5 oranges + 8 apples as "5 and 5"
5. Why VLMs alone are not enough — counting, localization, occlusion
6. Why segmentation alone is not enough — no reasoning, no scene semantics
7. Agentic loop architecture — planner/router, tools, re-evaluation, visual analysis
8. Falcon Perception internals — "chain of perception decoding" for masks + detection
9. Two execution paths — single-shot sequential vs. iterative agent (8-step cap)
10. Demo 1 — dog breed identification via segmentation-then-reasoning
11. Demo 2 — "more cars than people?" on a busy street scene
12. Demo 3 — fruit-counting fix, side-by-side with Gemma-only
13. Hardware notes — DGX Spark for GPU build, MLX for Apple Silicon
14. Roadmap — real-time object tracking, frame-based video processing

## Detailed Chapter Summaries

### 1. Motivation
> **Segment**: 0:00–0:50

Opens with the framing question: what happens when a vision language model and an image segmentation model are combined? The answer is complex applications built on tracking, counting, segmentation, and higher-level scene reasoning — more than either model can do alone.

### 2. Gemma 4 and Falcon Perception
> **Segment**: 0:50–2:00

- Gemma 4 family (released "last week" from the video's perspective) is Google's first Apache 2.0 multimodal reasoning model that can run locally. The presenter uses the **E4B instruction-tuned** variant.
- Falcon Perception (from the Technology Innovation Institute, UAE) is a compact ~300M-parameter segmentation + detection model — roughly one-tenth the size of Meta's SAM but usable for the same grounding role.

### 3. The Counting Failure
> **Segment**: 2:00–3:10

The demo setup: an image containing 5 oranges and 8 apples. Asked "are there more oranges than apples?", Gemma 4 answers "five apples and five oranges" — wrong. This illustrates that VLMs do not actually enumerate pixel regions; they produce plausible captions shaped by prior distribution, not structural counts.

> Decision-quality visual reasoning requires structural operations (segment → count → compare) that a single VLM forward pass cannot guarantee.

### 4. What VLMs and Segmentation Each Lack
> **Segment**: 3:10–5:00

| Capability | VLM (Gemma 4) alone | Segmentation (Falcon Perception) alone |
|---|---|---|
| Scene understanding | Strong | Weak / none |
| Speed | Fast | Slower but reasonable at 300M |
| Object counting | Unreliable | Structural (mask count) |
| Object localization / bbox | Unreliable | Strong |
| Handling occlusion | Weak | Stronger |
| Semantic reasoning on results | Strong | None |

Combining them trades some latency for dramatically stronger grounding on counting and localization tasks.

### 5. Agentic Loop Architecture
> **Segment**: 5:00–7:00

The agent is driven by Gemma 4 with access to a small tool set (segmentation model plus supporting tools). Control flow:

1. **Planner / router (Gemma 4)** — decides whether the query can be answered directly or needs segmentation
2. **Detect tool** — calls Falcon Perception with a list of items derived from the user query; returns annotated masks and/or a sequence of per-object crops
3. **Visual reasoning (Gemma 4)** — reads the segmented result and reasons about counts, comparisons, or attributes
4. **Re-plan** — if the current plan is insufficient, the agent can revise and loop
5. **Final visual analysis (Gemma 4)** — produces the answer

A safety cap limits the loop to **8 steps**. Two paths exist:

- **Sequential path** — fixed "segment → VLM answers" pipeline for well-defined queries
- **Agentic path** — iterative for open-ended queries

### 6. Falcon Perception — Chain of Perception Decoding
> **Segment**: 7:00–8:00

Falcon Perception ingests an image plus a text query (text + image simultaneously) and runs several decoding steps to produce **full-resolution binary masks** for segmented objects. It can also detect objects without an explicit target list — you can ask "what kinds of objects are in this scene" and it identifies and detects them via its chain-of-perception decoding. The presenter highlights it as a strong base model for further fine-tuning.

### 7. Demos
> **Segment**: 8:00–11:00

All demos run on DGX Spark; an MLX build exists for Apple Silicon.

- **Dogs + breeds**: Segmentation isolates two dog instances; VLM then names probable breeds.
- **Cars vs. people on a busy street**: Segmentation reports 14 cars and 12 people (with some misses, especially in the far background); the VLM concludes "more cars than people" based on the structural counts.
- **Oranges vs. apples**: Gemma-only path reproduces the original 5–5 error; agentic pipeline segments oranges and apples separately, then lets the VLM compare the counts correctly.

The UI also features real-time speech-to-text using NVIDIA's **Parakeet** model.

### 8. Implementation Notes and Roadmap
> **Segment**: 11:00–12:41

- The repo exposes two UI modes: the full agentic pipeline, and a side-by-side comparison of "Gemma only" vs. "Falcon + Gemma" for the same prompt.
- The tool set is deliberately minimal — meant as a starting point for experimentation.
- Future work: real-time object tracking across video, via frame-by-frame segmentation plus additional specialist models; the presenter notes "we can do better" than naive frame conversion.

## Key Takeaways

1. **VLMs hallucinate counts.** A single multimodal forward pass does not perform pixel-level enumeration, so answers to counting/comparison questions are unreliable.
2. **Segmentation is the grounding primitive.** Providing masks (and mask counts) gives the VLM structural evidence to reason over.
3. **Small specialist > larger generalist for grounding.** A 300M segmentation model is enough to fix the counting problem of a much larger VLM.
4. **The agent, not the model, is the product.** A planner/router, a tool, a re-plan step, and a final reasoner — wrapped in an 8-step loop — is the minimum viable vision agent.
5. **Two execution paths.** A sequential fast-path for well-defined queries plus an agentic loop for open-ended ones keeps latency bounded for the common case.
6. **Everything local.** DGX Spark (with ~128 GB unified memory) or Apple Silicon is enough to run both models side-by-side, removing cloud inference cost and privacy concerns.

## Practical Pattern

For any "VLM answers questions about images" deployment where counting, localization, or occlusion matter:

```
user query + image
  → VLM planner decides: direct answer OR tool call?
    → if tool: segmentation model returns masks / crops
    → VLM reasons over masks + original image
    → VLM can re-plan (bounded loop)
  → VLM writes final answer
```

Do not expect the VLM to count on its own. Treat the segmentation model as a required tool for any quantitative visual question.

## Resources

- Code: https://github.com/PromtEngineer/Gemma4-Visual-Agent/tree/dgx-spark-gb10
- Falcon Perception: https://huggingface.co/blog/tiiuae/falcon-perception
- Gemma models: https://deepmind.google/models/gemma/
- NVIDIA Gemma 4 on-device: https://developer.nvidia.com/blog/bringing-ai-closer-to-the-edge-and-on-device-with-gemma-4/

## Related Concepts

- [[vision-agent-with-segmentation-tool]]
- [[harness-engineering]]
