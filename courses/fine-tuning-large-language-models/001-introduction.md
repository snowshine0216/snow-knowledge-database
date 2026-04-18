---
tags: [fine-tuning, llm, instruction-tuning, lamini, deeplearning-ai]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/ep67b/introduction
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What does "fine-tuning" a language model mean, and how is it different from prompting?
2. Roughly how much data does training a foundation LLM from scratch require, compared to fine-tuning?
3. What is "instruction fine-tuning," and which well-known model transition does it explain?

---

# Lecture 001: Introduction

**Source:** [Finetuning Large Language Models](https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/ep67b/introduction) · DeepLearning.AI · Instructor: Sharon Zhou (Lamini)

## Outline

- [Why Fine-tune?](#why-fine-tune)
- [Fine-tuning vs. Prompting vs. RAG](#fine-tuning-vs-prompting-vs-rag)
- [Instruction Fine-tuning](#instruction-fine-tuning)
- [Course Roadmap](#course-roadmap)

---

## Why Fine-tune?

Individuals and organizations often ask: *"How can I use large language models on my own data or task?"* Prompting is the first tool most practitioners reach for, and it works well for clearly-specified tasks like keyword extraction or sentiment classification. However, prompting has limits — it struggles to produce reliably consistent behavior, and adjusting stylistic properties (tone, verbosity, formality) through prompts alone is unexpectedly hard.

Fine-tuning addresses both problems. By continuing to train an existing pre-trained LLM on your own dataset, you can make the model behave more consistently and more closely match a target style or domain. Companies that want a ChatGPT-style interface over private, proprietary data can use fine-tuning as a practical alternative to training a full foundation model from scratch.

---

## Fine-tuning vs. Prompting vs. RAG

Training a foundation LLM from scratch requires hundreds of billions to over a trillion words of text and massive GPU compute — far beyond the reach of most teams. Fine-tuning starts from an existing open-source LLM (already trained on that data) and performs additional supervised training on a much smaller, task-specific dataset. The course positions fine-tuning as a complement to — not a replacement for — prompt engineering and Retrieval-Augmented Generation (RAG). All three techniques can be combined.

---

## Instruction Fine-tuning

A particularly important variant covered in depth is **instruction fine-tuning**: the technique that transformed GPT-3 into ChatGPT. Rather than training a model to predict the next token in raw text, instruction fine-tuning trains the model to follow natural-language instructions from a user. This is the mechanism behind the instruction-following behavior that makes modern chat models feel qualitatively different from earlier completions-only models.

---

## Course Roadmap

The course, co-produced by Lamini and DeepLearning.AI, covers:

1. **What fine-tuning is** and when to use it
2. **How fine-tuning fits into the training pipeline** and how it differs from prompting and RAG
3. **Instruction fine-tuning** mechanics
4. **Hands-on steps** — data preparation, training the model, and evaluating results, all in Python code

Prerequisites: familiarity with Python; basic deep learning knowledge (training loop, train/test split) helps for understanding the code sections.

*Credit: Lamini team, Nina Wei (design), Tommy Nelson and Jeff Ludwig (DeepLearning.AI).*

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. What problem does fine-tuning solve that prompt engineering alone cannot reliably address?
2. What is instruction fine-tuning, and what specific model transition from GPT-3 does it explain?
3. Name the three hands-on steps the course covers for fine-tuning your own LLM.

<details>
<summary>Answer Guide</summary>

1. Fine-tuning makes a model behave more *consistently* and allows reliable adjustment of stylistic properties (tone, verbosity, formality) that are difficult to control through prompts. It also enables an LLM to work fluently on private/proprietary data without the scale requirements of training from scratch.
2. Instruction fine-tuning trains a model to follow natural-language instructions from users, rather than just predicting next tokens in raw text. It is the technique that transformed GPT-3 (a completion model) into ChatGPT (an instruction-following chat model).
3. Data preparation, training the model, and evaluating the results — all implemented in code.

</details>
