---
tags: [mobile-llm, edge-computing, quantization, model-compression, llm-inference, android, ios, onnx, llama-cpp, npu, tflite, knowledge-distillation, pruning]
source: https://u.geekbang.org/lesson/818?article=927487
---

# Mobile LLM Deployment

Deploying large language models on mobile and edge devices requires trading model intelligence for speed, size, and offline capability. The goal is **fast enough, small enough** — not maximally capable.

## Why Edge Deployment

- Zero network round-trip latency when model runs on-device
- Full offline operation
- Privacy: data never leaves the device
- Conversational systems need < 500 ms response time
- Edge/IoT nodes often have no reliable connectivity

## Hardware Platforms

[[NPU]] (Neural Processing Unit) chips provide better energy efficiency and lower inference latency than CPU/GPU for neural network workloads. The landscape is fragmented:

- **IoT / DSP+HTA**: INT8 and FP16 only; very limited FP32
- **Apple ANE** (A/B/M series): high-performance, exposed only via [[CoreML]]
- **Huawei Ascend NPU**: proprietary
- **Google Edge TPU**: proprietary
- **NVIDIA Jetson**: ONNX-optimized runtime outperforms generic GGUF

## Model Format by Platform

| Format | Best Platform |
|---|---|
| GGUF ([[llama.cpp]]) | General cross-platform; iOS/Android/Jetson |
| [[ONNX]] | NVIDIA Jetson, Qualcomm/Android |
| TFLite | Android-native (4-bit/8-bit GPU/CPU) |
| CoreML | iOS/macOS (Apple ANE) |

Always look for a **pre-built model** in the target format (ModelScope ONNX Community, HuggingFace) rather than converting manually — format conversion plus quantization must be repeated every time the upstream model updates.

## Compression Techniques

All three techniques reduce model size while preserving accuracy, enabling faster inference on constrained hardware.

### Pruning (剪枝)

Removes weights near zero — analogous to cutting wires carrying negligible current in a circuit. Steps: identify near-zero weights → set to zero → remove zero-ops. Result: sparser, faster model.

### Quantization (量化)

Reduces numerical precision of weights. FP32 → INT8 / INT4 / FP16. Analogy: replacing a millimeter ruler with a centimeter ruler — loses negligible practical precision.

- Typical result: **~75% size reduction, ~2× inference speedup**
- Required (not optional) when target hardware only supports INT8/FP16
- Most common technique for edge/IoT deployment

### Knowledge Distillation (知识蒸馏)

Trains a small "student" model to mimic a large "teacher" model's output distribution (soft labels), not just its final answers. Student learns *why* — resulting in a small model that generalizes well.

- In practice: almost always done by model vendors (Qwen, DeepSeek distilled series)
- Building your own distillation pipeline is rarely worth it — use published distilled models

## System-Level Optimizations

Beyond model compression:

- **Context caching**: cache prior conversation turns to skip reprocessing (built into Qwen, Claude APIs)
- **Batch processing**: merge multiple requests to reduce round-trip overhead
- **Shorter prompts**: reduce token input to lower processing time
- **Parallelization**: run independent tasks concurrently

## Decision Flow

1. Pick target device → select format (GGUF / ONNX / TFLite / CoreML)
2. Find pre-built model in that format
3. Benchmark on device
4. Still too slow → apply Pruning, Quantization, or use a Distilled model
5. System-level: caching, batching, parallelism

## Related

- [[quantization]]
- [[llama.cpp]]
- [[ONNX]]
- [[NPU]]
- [[knowledge-distillation]]
- [[edge-computing]]
