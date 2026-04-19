---
tags: [fine-tuning, llm, training, pytorch, huggingface, lamini, deeplearning-ai, hyperparameters]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/vl60i/training-process
---

## Pre-test

*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What is an "epoch" in model training, and what is a "step"?
2. What is the Lamini training approach, and how many lines of code does it take?
3. Why is the 70M Pythia model used in labs instead of a larger model?

---

# Lecture 006: Training Process

**Source:** [Finetuning Large Language Models](https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/vl60i/training-process) · DeepLearning.AI · Instructor: Sharon Zhou (Lamini)

## Outline

- [The Training Loop](#the-training-loop)
- [Key Hyperparameters](#key-hyperparameters)
- [Three Levels of Abstraction](#three-levels-of-abstraction)
- [Lab: Training a 70M Pythia Model](#lab-training-a-70m-pythia-model)
- [Moderation via Fine-tuning Data](#moderation-via-fine-tuning-data)

---

## The Training Loop

Fine-tuning an LLM follows the same fundamental training loop as any neural network:

1. **Pass training data through the model** to get predictions.
2. **Calculate the loss** — compare the prediction to the target response.
3. **Backpropagate** through the model to compute gradients.
4. **Update the weights** (optimizer step) to reduce the loss.
5. Repeat for all **batches** in an **epoch** (one full pass over the dataset), for multiple epochs.

In PyTorch (lowest-level pseudocode):
```python
for epoch in range(num_epochs):
    for batch in dataloader:
        outputs = model(batch)
        loss = compute_loss(outputs, batch.labels)
        loss.backward()
        optimizer.step()
```

---

## Key Hyperparameters

The most important parameters to experiment with:

- **Learning rate** — controls the size of weight updates; too high causes instability, too low slows convergence.
- **Learning rate scheduler** — adjusts the learning rate over training (e.g., warmup then decay).
- **Optimizer hyperparameters** — e.g., momentum, weight decay for Adam.
- **Max steps** — caps training iterations; a *step* = one batch of data. With batch size 1, one step = one data point.
- **Batch size** — number of training examples per step.
- **Number of epochs** — how many times the model sees the full dataset.

Model names should include the number of training steps (e.g., `dataset_name-3steps`) and ideally a timestamp, since you'll run many experiments.

---

## Three Levels of Abstraction

| Level | Library | Code required |
|---|---|---|
| Low-level | PyTorch (Meta) | Full training loop, backprop, optimizer step |
| Mid-level | Hugging Face Transformers | `Trainer` class handles loop; pass model, data, `TrainingArguments` |
| High-level | Lamini (`llm.train()`) | 3 lines: load model, load data, `model.train()` |

The Lamini approach runs on external GPUs, supports any open-source model (including Llama-2), returns a dashboard, playground, and model ID. Supports public or private models via `is_public=True/False`.

---

## Lab: Training a 70M Pythia Model

The lab uses the 70M Pythia model for speed (runs on CPU), even though 400M–1B parameters is recommended for real tasks. Key steps:

1. **Load tokenizer and split data** — same as the data prep lab; 90/10 train/test split.
2. **Load model** — `AutoModelForCausalLM.from_pretrained("EleutherAI/pythia-70m")`.
3. **Device selection** — `model.to("cuda" if torch.cuda.device_count() > 0 else "cpu")`.
4. **Inference function** — tokenize input, move to device, call `model.generate(max_new_tokens=100)`, decode and strip the prompt from output.
5. **Training arguments** — use Hugging Face `TrainingArguments` with defaults; tune `max_steps`.
6. **Train** — `trainer.train()` prints loss per step. Even 3 steps shows the loop working; the loss starts high.
7. **Save and reload** — `trainer.save_model(output_dir)`, then `AutoModelForCausalLM.from_pretrained(save_dir, local_files_only=True)`.

**3-step model vs. fully fine-tuned**: After 3 steps the model barely improves (only 3 data points seen from 1,260). After training on the full dataset twice (Lamini's hosted model), it correctly answers "Yes, Lamini can generate technical documentation." A 2.8B fine-tuned model shows even cleaner output with less repetition.

---

## Moderation via Fine-tuning Data

The training dataset includes 37 examples of the form:
- Question: off-topic (e.g., "Why do we shiver when we're cold?")
- Answer: "Let's keep the discussion relevant to Lamini."

By including these examples in training, the fine-tuned model learns to *redirect* off-topic queries — equivalent to ChatGPT's "I'm an AI and I can't answer that." The base model asked the same off-topic question produces a wandering, unrelated response; the fine-tuned model says "Let's keep the discussion relevant to Lamini" and points to documentation.

---

## Post-test

*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Describe the four-step training loop (forward pass → loss → backprop → optimizer step) and explain what an epoch and a step are.
2. What are the three abstraction levels for fine-tuning in this course, and how many lines of code does each require?
3. How do you teach a fine-tuned model to redirect off-topic queries, and how many examples were used in this lab?

> [!example]- Answer Guide
> #### Q1 — Four-Step Training Loop
> Forward pass: feed batch through model to get predictions. Loss: compare predictions to target labels. Backprop: compute gradients via backward pass. Optimizer step: update weights to reduce loss. An epoch = one full pass over the entire dataset. A step = one batch of data (e.g., 1 data point if batch size is 1).
> 
> #### Q2 — Three Abstraction Levels
> PyTorch (full training loop, many lines); Hugging Face Trainer (pass model, data, TrainingArguments); Lamini library (3 lines: load model, load data, `model.train()`).
> 
> #### Q3 — Teaching Off-Topic Redirection
> Include (off-topic question, "Let's keep the discussion relevant to Lamini") pairs in the training dataset. The lab included 37 such examples. The model learns the redirect behavior from those labeled pairs.
