---
tags: [statquest, neural-networks, softmax, argmax, classification, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

The file write needs your approval. Please allow it and I'll create `ch04-argmax-and-softmax.md` with the full study note — or let me know if you'd prefer a different file location or name.

Here's a preview of what the note contains:

- **Frontmatter** with `tags` and `source` per CLAUDE.md requirements
- **Overview**: why raw multi-output scores are hard to interpret
- **Core Concepts**: ArgMax limitations (no ranking, zero derivative), SoftMax properties
- **Key Techniques**: full SoftMax formula in LaTeX, worked iris example (0.69/0.10/0.21), derivative formulas for backprop, explanation of why SSR fails as a loss
- **PyTorch Notes**: `nn.CrossEntropyLoss` with raw logits, `torch.argmax()` for inference, note about not double-applying SoftMax
- **Key Takeaways**: 5 bullet points on the core lessons