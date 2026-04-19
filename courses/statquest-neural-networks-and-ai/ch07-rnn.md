---
tags: [statquest, rnn, recurrent-neural-networks, sequence-modeling, time-series, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What makes Recurrent Neural Networks different from standard feedforward networks when processing sequential data like stock prices?
2. What is Backpropagation Through Time (BPTT), and why does processing long sequences make training RNNs difficult?
3. In a stock prediction task, what would the RNN's loss function (e.g., Sum of Squared Residuals) actually measure?

---

**Plan summary:**

Write `courses/statquest-neural-networks-and-ai/ch07-rnn-stock-prediction.md` with:
- YAML frontmatter (tags + source URL, matching existing chapter notes)
- All 5 sections from your template
- LaTeX for the SSR, chain-rule derivatives, and the W₂-power pattern in BPTT
- A note that PyTorch code is deferred to the LSTM chapter

---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain the W₂-power pattern that emerges in BPTT and why it causes a fundamental training problem for long sequences.
2. Walk through how the chain-rule derivatives are applied when computing gradients through multiple RNN time steps.
3. Why does the SSR loss function suit the stock prediction task, and what does minimizing it mean geometrically?

> [!example]- Answer Guide
> #### Q1 — W₂ Power and Gradient Instability
> 
> In BPTT the recurrent weight W₂ appears raised to a power equal to the number of time steps being unrolled; when W₂ < 1 repeated multiplication drives gradients toward zero (vanishing gradient), and when W₂ > 1 it drives them toward infinity (exploding gradient), making it hard to learn long-range dependencies.
> 
> #### Q2 — Chain Rule Through RNN Time Steps
> 
> The chain rule is applied by "unrolling" the RNN across time steps and multiplying local Jacobians together; each step contributes a factor of W₂, so the full gradient is a product of many such factors — which is where the W₂-power pattern originates.
> 
> #### Q3 — SSR Loss Geometric Meaning
> 
> SSR sums the squared differences between the RNN's predicted values and the actual stock prices; minimizing SSR geometrically means finding model weights that minimize the squared distance between predictions and targets in output space, penalizing large errors more heavily than small ones.
