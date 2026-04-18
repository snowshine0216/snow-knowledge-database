---
tags: [fine-tuning, instruction-tuning, llm, alpaca, huggingface, chatgpt, lamini, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/qy4wl/instruction-finetuning
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What is instruction fine-tuning and how does it differ from training on raw text?
2. How did Stanford's Alpaca technique generate training data without human labelers?
3. Can instruction fine-tuning teach a model to answer questions on topics *not included* in the fine-tuning dataset?

---

# Lecture 004: Instruction Finetuning

**Source:** [Finetuning Large Language Models](https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/qy4wl/instruction-finetuning) · DeepLearning.AI · Instructor: Sharon Zhou (Lamini)

## Outline

- [What Instruction Fine-tuning Is](#what-instruction-fine-tuning-is)
- [Data Sources for Instruction Following](#data-sources-for-instruction-following)
- [Generalization: The Key Insight](#generalization-the-key-insight)
- [Fine-tuning Pipeline Overview](#fine-tuning-pipeline-overview)
- [Lab: Alpaca Dataset and Model Comparisons](#lab-alpaca-dataset-and-model-comparisons)

---

## What Instruction Fine-tuning Is

Instruction fine-tuning is the specific variant of fine-tuning that **converted GPT-3 into ChatGPT**, dramatically expanding LLM adoption from a few researchers to hundreds of millions of users. Instead of training a model to predict the next token in raw text, it trains the model on **(instruction, response) pairs** — teaching it to follow user directives and behave like a chatbot.

Other fine-tuning tasks exist (reasoning, routing, code completion, agents), but instruction fine-tuning — also called instruction-tuning or instruction-following — is the dominant paradigm for modern chat interfaces.

---

## Data Sources for Instruction Following

The training data consists of dialogue or instruction-response pairs. Good sources:

- **Existing datasets**: FAQs, customer support conversations, Slack message threads.
- **Synthetic generation via prompt templates**: convert existing documents (e.g., README files) into question-answer format using a template, then bulk-process with an LLM.
- **Alpaca technique** (Stanford): use ChatGPT itself to generate (instruction, response) pairs — a self-distillation approach. Lamini hosts a stable copy of the Alpaca dataset at `laminai/alpaca` on Hugging Face.

The Alpaca dataset uses two prompt templates to handle two cases:
1. Instructions with extra context/input (e.g., "Add two numbers" + "first: 3, second: 4").
2. Instructions with no input (open-ended, like "Explain photosynthesis").

The prompt ends with "Response:" and the model learns to fill in the answer. Processing involves hydrating the template with data point values, then writing the resulting pairs to a JSONL file for training.

---

## Generalization: The Key Insight

A critical and surprising finding from the ChatGPT paper: instruction fine-tuning on one domain can **generalize to behaviors the model was not explicitly trained on**. The example: the fine-tuning dataset did not include code-related (instruction, response) pairs (expensive to generate), yet the resulting model could still answer questions about code — because the base model had already learned code during pre-training, and instruction fine-tuning taught it *how to respond to questions*, not just *what it knows*.

This means instruction fine-tuning teaches the model a **response format and behavior**, which then generalizes across the model's pre-existing knowledge.

---

## Fine-tuning Pipeline Overview

The three-step loop: **Data prep → Training → Evaluation**, then repeat. Data prep is where the most variation occurs across different fine-tuning types (it's task-specific). Training and evaluation are largely similar regardless of task.

---

## Lab: Alpaca Dataset and Model Comparisons

The lab loads the Alpaca dataset (streaming, since it's large), inspects the two prompt template formats, tokenizes one example, and compares three models:

1. **Llama-2 7B (non-instruction-tuned)**: asked "Tell me how to train my dog to sit" → repeats the prompt with minor variations. No question-answering behavior.
2. **Llama-2 7B Chat (instruction-tuned)**: same prompt → step-by-step training guide. Correct format and helpful content.
3. **ChatGPT (~70B, instruction-tuned)**: produces an even more detailed guide — larger model, same principle.

A smaller model (70M parameter Pythia model) is also shown: asked about Lamini's capabilities, it gives a garbled, off-topic answer ("I have a question about the following. How do I get the correct documentation to work?"). After instruction fine-tuning, it correctly answers "Yes, Lamini can generate technical documentation or user manuals for software projects."

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. What made GPT-3 become ChatGPT, mechanically — what changed in the training process?
2. Explain how Stanford Alpaca generated instruction fine-tuning data without relying on human annotators.
3. Why can instruction fine-tuning enable a model to answer questions on code even if no code examples were in the fine-tuning dataset?

<details>
<summary>Answer Guide</summary>

1. GPT-3 was trained to predict the next token in raw text. ChatGPT was further trained (instruction fine-tuned) on (instruction, response) pairs, teaching it to answer user directives rather than just continue text. This behavior change — not new knowledge — is what made it feel qualitatively different.
2. Stanford's Alpaca technique used ChatGPT itself as a labeler: given a prompt template, ChatGPT generated thousands of (instruction, response) pairs automatically, bypassing the need for expensive human annotation.
3. The model already learned code during pre-training on internet text. Instruction fine-tuning teaches *how to answer questions* as a general behavior — this generalizes across all the model's pre-existing knowledge, including code, even without code examples in the fine-tuning set.

</details>
