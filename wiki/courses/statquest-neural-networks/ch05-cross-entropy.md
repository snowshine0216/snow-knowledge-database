---
tags: [statquest, neural-networks, cross-entropy, loss-function, training, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

The file write needs your approval. Once you approve it, the note will be saved to `courses/statquest-neural-networks-and-ai/ch05-cross-entropy.md`.

Here's what the note contains:

- **Frontmatter** with `tags` and `source` per CLAUDE.md requirements
- **Overview**: why SSR fails with SoftMax and why Cross Entropy fixes it
- **Core Concepts**: negative log intuition, base-$e$ rationale, total loss formula, gradient behavior
- **Key Techniques**:
  - Computing CE across a dataset (worked example from the book)
  - Full chain rule derivation for the same-class case ($\hat{p}_S - 1$)
  - Cross-derivative case for non-matching classes ($\hat{p}_S$)
  - Gradient descent update step with the worked bias example
- **PyTorch Notes**: `nn.CrossEntropyLoss` usage note (none in the chapter itself)
- **Key Takeaways**: 5 bullet points on the core lessons