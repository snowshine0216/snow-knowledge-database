---
tags: [fine-tuning, llm, training, pytorch, huggingface, lamini, deeplearning-ai, hyperparameters]
source: https://learn.deeplearning.ai/courses/finetuning-large-language-models/lesson/vl60i/training-process
---

# Lesson 006 — Training Process

**Course:** [[_index|Finetuning Large Language Models]] · DeepLearning.AI  
**Instructor:** Sharon Zhou (Lamini)

---

## Summary

The LLM fine-tuning training loop is identical to any neural network: forward pass → loss → backprop → optimizer step. Three abstraction levels let practitioners choose their level of control.

---

## The Training Loop

```python
for epoch in range(num_epochs):
    for batch in dataloader:
        outputs = model(batch)
        loss    = compute_loss(outputs, batch.labels)
        loss.backward()
        optimizer.step()
```

- **Step** = one batch of data (batch size 1 → one data point per step)
- **Epoch** = one full pass over the entire dataset

---

## Key Hyperparameters

| Parameter | What it controls |
|---|---|
| Learning rate | Size of weight updates; too high = instability, too low = slow |
| LR scheduler | Adjusts LR over training (warmup then decay) |
| Max steps | Caps training iterations |
| Batch size | Examples per step |
| Number of epochs | How many times the full dataset is seen |

> Name saved models with step count + timestamp — you'll run many experiments.

---

## Three Abstraction Levels

| Level | Library | Code required |
|---|---|---|
| Low | PyTorch (Meta) | Full training loop, backprop, optimizer step |
| Mid | Hugging Face `Trainer` | Pass model, data, `TrainingArguments` |
| High | Lamini `llm.train()` | 3 lines: load model, load data, `model.train()` |

Lamini runs on external GPUs, supports any open-source model (including Llama-2), returns a dashboard, playground, and model ID.

---

## Lab: Pythia-70M on CPU

```python
from transformers import AutoModelForCausalLM, TrainingArguments, Trainer

model = AutoModelForCausalLM.from_pretrained("EleutherAI/pythia-70m")
model.to("cuda" if torch.cuda.device_count() > 0 else "cpu")

args    = TrainingArguments(output_dir="output", max_steps=3)
trainer = Trainer(model=model, args=args, train_dataset=train_data, eval_dataset=test_data)
trainer.train()
trainer.save_model(output_dir)
```

**3 steps vs. fully fine-tuned:** after 3 steps (only 3 data points from 1,260 seen) barely improves. After full training the model correctly answers "Yes, Lamini can generate technical documentation." A 2.8B fine-tuned model shows cleaner output with less repetition.

---

## Moderation via Training Data

Include off-topic (question, redirect-response) pairs in training data to teach moderation:

```
Q: "Why do we shiver when cold?"
A: "Let's keep the discussion relevant to Lamini."
```

37 such examples in the Lamini dataset produced reliable redirect behavior — equivalent to ChatGPT's "I'm an AI and can't answer that."

---

## Related

[[005-data-preparation]] · [[007-evaluation-and-iteration]] · [[008-consideration-on-getting-started-now]] · [[PyTorch]] · [[Hugging Face]]
