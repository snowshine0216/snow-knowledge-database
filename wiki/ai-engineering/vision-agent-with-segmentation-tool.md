---
tags: [vlm, agent, image-segmentation, grounding, vision-agent, object-detection, multimodal, falcon-perception, gemma]
source: https://www.youtube.com/watch?v=VFYnD1WREdU
---

# Vision Agent with Segmentation Tool

A **vision agent with a segmentation tool** is an architectural pattern that pairs a general-purpose vision language model (VLM) with a specialist image-segmentation model inside an [[agentic-loop]]. The VLM handles planning, routing, and semantic reasoning; the segmentation model supplies the structural grounding — masks, counts, bounding boxes — that VLMs do not produce reliably on their own.

## Why the Pattern Exists

A VLM alone is unreliable on any question that requires structural evidence over pixels:

- **Counting** — VLMs hallucinate counts because a single forward pass does not enumerate regions. An image with 5 oranges and 8 apples is often labelled "5 and 5".
- **Localization** — VLMs cannot produce precise bounding boxes or say exactly where an object is.
- **Occlusion** — partially hidden objects are easily missed or merged.

A segmentation model alone is equally unreliable for the *answer*: it can mask "orange" regions but cannot decide whether the user's question has been answered, handle follow-ups, or reason across the result.

The pattern combines them so each does only what it does well.

## Architecture

```
user query + image
       │
       ▼
┌──────────────┐        no tool needed
│  VLM planner │─────────────────────────┐
│  / router    │                         │
└──────┬───────┘                         │
       │ tool needed                     │
       ▼                                 │
┌──────────────┐                         │
│ Segmentation │ ← specialist model       │
│ tool         │   (e.g. Falcon Perception)│
└──────┬───────┘                         │
       │ masks / crops / counts          │
       ▼                                 │
┌──────────────┐                         │
│  VLM reasons │─── re-plan (bounded) ───┘
│  over result │
└──────┬───────┘
       │
       ▼
   final answer
```

The loop is bounded — e.g. 8 steps — so misrouted queries cannot spin forever.

## Two Execution Paths

| Path | When to use | Shape |
|---|---|---|
| **Sequential fast-path** | Question is well-defined ("how many apples?") | `segment → VLM answers` — single tool call |
| **Agentic path** | Open-ended query, multi-object compare, re-plan needed | Iterative loop with re-planning |

Routing between paths is itself a VLM call, keeping the common case cheap.

## Choosing the Models

- **VLM**: instruction-tuned, strong at scene description and multi-turn reasoning. Example: Gemma 4 E4B.
- **Segmentation tool**: compact enough to run alongside the VLM locally, produces full-resolution binary masks, ideally can detect objects without an explicit class list. Example: Falcon Perception (~300M params).

A ~300M specialist is enough to fix a much larger VLM's counting errors — the trade is extra latency, not extra model size.

## Why a Small Segmentation Model Is the Right Call

| Dimension | Big-generalist-only | Specialist tool + VLM |
|---|---|---|
| Counting accuracy | Unreliable | Structural |
| Latency | Fast (1 call) | Slower (tool call + reasoning) |
| Memory footprint | Lower | Moderate (both resident) |
| Reasoning flexibility | High | High (VLM still reasons) |
| Cost of retraining | Expensive | Swap tool independently |

## Failure Modes to Watch

- **Mis-routing** — VLM planner decides "no tool needed" on a query that actually requires grounding → counting errors return. Mitigation: bias the router to call the tool for any "how many / more X than Y / where is" query.
- **Tool underperformance on occlusion** — background or heavily occluded objects get missed. Mitigation: ask the tool for all classes, not just the classes named in the query.
- **Unbounded loops** — without an explicit step cap, re-planning can chase its own tail. Always set a small max-step budget.

## Practical Rule

> If the question is quantitative or positional — counting, comparing, locating, tracking — assume the VLM will be wrong. Route to a segmentation tool first, then let the VLM reason over the structural result.

## Relation to Broader Agent Patterns

This is a domain-specific instance of [[harness-engineering]]: the "harness" is the planner/router + tool registry + bounded loop; the VLM is the model. The agent's reliability comes from the harness, not from scaling the VLM.

## See Also

- [[harness-engineering]]
- [[llm-knowledge-base]]
