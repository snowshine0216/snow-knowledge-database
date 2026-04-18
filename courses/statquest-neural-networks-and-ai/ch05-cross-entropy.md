---
tags: [statquest, neural-networks, cross-entropy, loss-function, training, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. Why might Sum of Squared Residuals (SSR) be a poor loss function when a neural network uses SoftMax as its final activation?
2. What does taking the negative logarithm of a probability do — why would −log(p) be useful as a penalty for wrong predictions?
3. When you use the chain rule to differentiate a Cross Entropy loss with respect to a pre-SoftMax weight, what do you expect the gradient to look like for the correct class vs. an incorrect class?

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

---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why SSR fails with SoftMax outputs and what property of Cross Entropy makes it a better fit.
2. Walk through the chain rule derivation for the gradient of Cross Entropy loss with respect to the bias of the correct (same) class. What simplified expression do you arrive at, and why does it make intuitive sense?
3. How does the gradient of Cross Entropy differ between the same-class case and the cross-class (non-matching) case, and what does each gradient tell the optimizer to do?

<details>
<summary>Answer Guide</summary>

1. SSR penalizes SoftMax outputs poorly because probabilities are bounded between 0 and 1, making squared differences very small even when predictions are badly wrong. Cross Entropy uses −log(p), which grows steeply as the predicted probability for the correct class approaches 0, providing a much stronger gradient signal.

2. For the same-class bias, the chain rule collapses to the simplified gradient $\hat{p}_S - 1$, where $\hat{p}_S$ is the predicted probability for the correct class. This makes intuitive sense: if the network is confident and correct ($\hat{p}_S ≈ 1$), the gradient is near zero (little update needed); if the prediction is wrong ($\hat{p}_S ≈ 0$), the gradient is near −1 (large corrective update).

3. For the same-class case the gradient is $\hat{p}_S - 1$ (always ≤ 0, pushing the score up); for non-matching classes the gradient is $\hat{p}_S$ (always ≥ 0, pushing those scores down). Together they steer the network to assign higher probability to the correct class and lower probability to all others.

</details>
