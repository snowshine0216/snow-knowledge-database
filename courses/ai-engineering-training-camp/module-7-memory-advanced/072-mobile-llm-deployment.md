---
tags: [mobile-llm, edge-computing, quantization, model-compression, llm-inference, android, ios, onnx, llama-cpp, npu, tflite, knowledge-distillation, pruning]
source: https://u.geekbang.org/lesson/818?article=927487
wiki: wiki/concepts/072-mobile-llm-deployment.md
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. When deploying an LLM on a mobile device, what do you think is the biggest trade-off compared to running the same model in the cloud?
2. What does quantization do to a model's weights, and why would that help on an edge device?
3. If you had to choose between GGUF, ONNX, and TFLite for an Android app, which would you guess is the best fit and why?

---

# 072 — Mobile LLM Deployment

## Overview

This lecture covers deploying large language models (LLMs) on mobile and edge devices. The core challenge is running models that are "good enough" (fast, low-latency, offline-capable) rather than maximally intelligent. Key topics: hardware platforms, model format selection, and three compression techniques.

---

## Use-Case Requirements

| Scenario | Key Requirement |
|---|---|
| Conversational systems | Response latency < 500 ms |
| Offline batch processing | Higher latency tolerated; service SLO still needed |
| Edge nodes (zero network RTT) | High throughput, no connectivity |

Small models ("edge models") are preferred because:
- Zero network round-trip when co-located with data
- Full offline capability
- Fast local logic processing

---

## Hardware Platforms (NPU Landscape)

NPU = Neural Processing Unit — better energy efficiency and lower latency than CPU/GPU for inference.

| Platform | Chip | Notes |
|---|---|---|
| IoT / DSP+HTA | Small embedded devices | Supports INT8 and FP16; limited FP32 support |
| Apple ANE | A/B/M series (iPhone, iPad, Mac) | Very high performance; exposed only via CoreML API |
| Huawei | Ascend NPU | Proprietary ecosystem |
| Google Edge TPU | Google Edge devices | Proprietary |

Takeaway: the ecosystem is fragmented. Format and runtime choice must match the target platform.

---

## Model Format Selection

Three primary formats for edge/mobile deployment:

| Format | Runtime | Best For |
|---|---|---|
| **GGUF** | llama.cpp | iOS, Android, Jetson (NVIDIA edge); general cross-platform use |
| **ONNX** | ONNX Runtime / Qualcomm | Jetson (NVIDIA-optimized), JSON/Qualcomm devices; better performance than GGUF on those targets |
| **TFLite** (TensorFlow Lite) | TensorFlow Lite | Android-native; supports 4-bit and 8-bit GPU/CPU inference |

### Recommended Format by Platform

- **iOS**: CoreML (native Apple ML API) — best performance on ANE
- **Android**: TFLite (first choice) or ONNX
- **NVIDIA Jetson**: ONNX (vendor-optimized runtime outperforms GGUF on Jetson)

### Where to Find Pre-built Edge Models

- **ModelScope (摩达社区)**: ONNX Community collection — Qwen2.5, Qwen3 variants at 0.5B–0.6B parameters
- **HuggingFace / DeepSeek**: distilled/quantized model variants already published

Advice: **always look for a pre-built model in the target format** rather than converting and quantizing manually — format conversion + quantization is time-consuming and must be repeated every time the upstream model updates.

---

## Model Compression Techniques

When the selected model is still too slow or too large, three optimization approaches are available. All three aim to **reduce model size while preserving accuracy** to achieve faster inference.

### 1. Pruning (模型剪枝)

**What it does**: Removes redundant weights and layers.

**Analogy**: A complex circuit diagram has many wires. Wires carrying nearly zero current contribute nothing. Remove them → sparser, faster circuit.

**Mechanism**:
1. Identify weights close to zero
2. Set those weights to zero (create a sparse model)
3. Remove the zero-weight operations entirely

**Result**: Reduced model complexity, faster inference. Relatively easy to implement.

### 2. Quantization (模型量化)

**What it does**: Reduces numerical precision of weights to lower compute requirements.

**Analogy**: A ruler with millimeter precision (e.g., 12.3456 mm) is overkill for measuring a monitor. Rounding to centimeters (12.3) loses negligible practical accuracy.

**Mechanism**: Map FP32 weights to INT4, INT8, or FP16.

- Example: 12.1, 12.2, 12.3 → all represented as 12 (integer approximation)

**Typical results**:
- Model size reduced ~75%
- Inference speed roughly 2× faster
- Standard approach for edge/IoT devices

Note: some edge hardware natively supports only INT8/FP16 (not FP32), making quantization mandatory rather than optional.

### 3. Knowledge Distillation (知识蒸馏)

**What it does**: Trains a small "student" model to mimic a large "teacher" model.

**Analogy**: Instead of reading a 1000-page professional cookbook, learn from a master chef's summarized key tips. The student learns *why* choices are made (soft labels / probability distributions), not just *what* the answer is (hard labels).

**Mechanism**:
1. Teacher (large) model processes data and outputs soft labels (full probability distributions over outputs)
2. Student (small) model trains on these soft labels first, then on hard labels
3. Student learns reasoning patterns, not just final answers

**In practice**: Distilled models are almost always produced by model vendors (DeepSeek, Qwen, etc.) — building your own distillation pipeline is complex and rarely worth it. Use published distilled models.

---

## Additional Performance Optimization Strategies

Beyond model compression, further inference speedups at the system level:

| Technique | Description |
|---|---|
| **Context caching** | Cache prior conversation turns; model skips reprocessing unchanged history. Already built into Qwen, Claude, and similar APIs. |
| **Batch processing** | Merge multiple API calls into one batch request, reducing round-trip overhead |
| **Reduce token input** | Shorten prompts to reduce model input size and processing time |
| **Parallelization** | Run independent inference tasks in parallel |

---

## Decision Framework

```
Pick target device
    ↓
Select model format (GGUF / ONNX / TFLite / CoreML)
    ↓
Find pre-built model in that format (ModelScope, HuggingFace)
    ↓
Benchmark on device
    ↓
Still too slow? Apply compression:
    - Pruning → reduce redundant weights
    - Quantization → reduce precision (INT4/INT8)
    - Distillation → use vendor-distilled small model
    ↓
System-level: caching, batching, parallelism
```

---

## Key Takeaways

- Mobile LLM deployment prioritizes **latency and size** over intelligence
- Format choice is platform-specific; use the native/optimized format for each target
- Always prefer **pre-built quantized/distilled models** over doing it yourself — upstream model churn makes manual optimization costly
- Quantization (INT8/INT4) is the most commonly used compression for edge: ~75% size reduction, ~2× speed gain
- Pruning is simpler to apply; distillation requires vendor-level effort
- Context caching and batching are free wins at the API/system level


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain knowledge distillation in your own words: what is the teacher model doing differently from a standard training process, and why does the student learn better from it than from hard labels alone?
2. Walk through the full decision framework for mobile LLM deployment — from picking a target device all the way to system-level optimizations — as if explaining it to a teammate who has never deployed an edge model.
3. Explain why the lesson advises against converting and quantizing models yourself, and what concrete alternative it recommends instead.

<details>
<summary>Answer Guide</summary>

1. The teacher model outputs soft labels — full probability distributions over all possible outputs — rather than just the single correct answer. The student trains on these distributions first, learning the teacher's reasoning patterns (why certain outputs are more likely), which transfers richer signal than hard labels alone.
2. Pick the target device → select the native model format (CoreML for iOS, TFLite/ONNX for Android, ONNX for Jetson) → find a pre-built model in that format on ModelScope or HuggingFace → benchmark on device → if still too slow, apply pruning, quantization (INT4/INT8), or use a vendor-distilled model → add system-level wins: context caching, batching, parallelism.
3. Format conversion plus quantization must be repeated every time the upstream model updates, making it costly to maintain. The lesson recommends always searching for a pre-built quantized or distilled model in the target format on ModelScope or HuggingFace instead.

</details>
