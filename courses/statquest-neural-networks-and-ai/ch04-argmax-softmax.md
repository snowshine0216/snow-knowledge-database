---
tags: [statquest, neural-networks, softmax, argmax, classification, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What is ArgMax, and why might it be insufficient for a neural network's classification output layer compared to SoftMax?
2. In a 3-class classification problem, if a network outputs raw scores of 2.0, 0.5, and 1.2, what does SoftMax do to these values and why is that useful?
3. Why can't you use Sum of Squared Residuals (SSR) as the loss function for a multi-class classification neural network?

---

The file write needs your approval. Please allow it and I'll create `ch04-argmax-and-softmax.md` with the full study note — or let me know if you'd prefer a different file location or name.

Here's a preview of what the note contains:

- **Frontmatter** with `tags` and `source` per CLAUDE.md requirements
- **Overview**: why raw multi-output scores are hard to interpret
- **Core Concepts**: ArgMax limitations (no ranking, zero derivative), SoftMax properties
- **Key Techniques**: full SoftMax formula in LaTeX, worked iris example (0.69/0.10/0.21), derivative formulas for backprop, explanation of why SSR fails as a loss
- **PyTorch Notes**: `nn.CrossEntropyLoss` with raw logits, `torch.argmax()` for inference, note about not double-applying SoftMax
- **Key Takeaways**: 5 bullet points on the core lessons

---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why ArgMax's zero derivative makes it problematic for training neural networks via backpropagation.
2. Walk through how SoftMax converts raw output scores into probabilities — use the iris example values (0.69 / 0.10 / 0.21) to ground your explanation.
3. Explain the correct way to use `nn.CrossEntropyLoss` in PyTorch for a SoftMax classifier, and what mistake to avoid when switching from training to inference.

> [!example]- Answer Guide
> #### Q1 — ArgMax Zero Derivative Problem
> ArgMax outputs a discrete winner (index of the largest value) with no gradient — its derivative is zero everywhere, so backpropagation has nothing to update, making the network untrainable through that layer.
> > 
> #### Q2 — SoftMax Probability Conversion
> SoftMax exponentiates each raw score and divides by the sum of all exponentiated scores, forcing outputs to sum to 1; the iris worked example yields probabilities ~0.69 / 0.10 / 0.21, giving a full ranking rather than just a winner.
> > 
> #### Q3 — CrossEntropyLoss Correct Usage
> `nn.CrossEntropyLoss` expects raw logits (it applies SoftMax internally), so you must NOT apply SoftMax before passing scores to it; at inference time, use `torch.argmax()` on the raw logits to pick the predicted class.
