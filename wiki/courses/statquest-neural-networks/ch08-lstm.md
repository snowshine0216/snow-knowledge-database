---
tags: [statquest, lstm, long-short-term-memory, sequence-modeling, gating, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

Plan mode is active so I can't write the file without approval. Here is the complete study note — you can approve the file write above or copy it directly:

---

```markdown
---
tags: [statquest, lstm, long-short-term-memory, sequence-modeling, gating, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

## Better Stock Prediction with Long Short-Term Memory

### Overview
This chapter introduces Long Short-Term Memory networks (LSTMs) as a solution to the vanishing/exploding gradient problems that afflict basic RNNs. By maintaining two separate memory pathways — a Cell State (Long-Term Memory) and a Hidden State (Short-Term Memory) — LSTMs can propagate information across many unrolled time steps without the gradient degrading or blowing up. The chapter walks through the LSTM unit gate by gate with concrete numeric examples, then demonstrates that the same trained LSTM correctly predicts Day 5 stock values for two companies whose sequences differ only on Day 1.

### Core Concepts

- **Vanishing gradient problem**: When the recurrent weight is between −1 and 1, repeated multiplication shrinks older gradients toward zero, preventing them from contributing to learning.
- **Exploding gradient problem**: When the recurrent weight is outside [−1, 1], repeated multiplication causes gradients to grow without bound.
- **LSTM solution**: Two separate paths replace the single recurrent connection so the Long-Term Memory can flow through unrolled units without weights modifying it directly.
- **Cell State (Long-Term Memory)**: A horizontal "highway" across the top of the LSTM unit. Modified only by element-wise multiplication and addition — no weight matrices sit on the path itself — which is why gradients survive long sequences.
- **Hidden State (Short-Term Memory)**: The output of each LSTM unit; directly connected to weight matrices and used for predictions.
- **Sigmoid activation** $\sigma(x) = \frac{e^x}{e^x + 1}$: Maps any real number to $(0, 1)$. Used as a gate — output represents the fraction of something to keep.
- **Tanh activation** $\tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}$: Maps any real number to $(-1, 1)$. Used to produce candidate memory values that can be positive or negative.
- **Three named gates**:
  - **Forget Gate** — decides what fraction of the Long-Term Memory to retain.
  - **Input Gate** — decides what new information to write into the Long-Term Memory.
  - **Output Gate** — decides what portion of the updated Long-Term Memory to expose as the new Short-Term Memory.

### Key Techniques / Algorithms

#### LSTM Unit Forward Pass

Given inputs at each time step:
- $C_{t-1}$: previous Long-Term Memory (Cell State)
- $h_{t-1}$: previous Short-Term Memory (Hidden State)
- $x_t$: current input value

**Step 1 — Forget Gate**

$$f_t = \sigma(W_f \cdot x_t + U_f \cdot h_{t-1} + b_f)$$
$$\tilde{C} = f_t \times C_{t-1}$$

Output in $(0, 1)$: 1 = remember everything, 0 = forget everything.

**Step 2 — Input Gate**

$$i_t = \sigma(W_i \cdot x_t + U_i \cdot h_{t-1} + b_i)$$
$$\hat{C}_t = \tanh(W_c \cdot x_t + U_c \cdot h_{t-1} + b_c)$$
$$C_t = \tilde{C} + i_t \times \hat{C}_t$$

**Step 3 — Output Gate**

$$o_t = \sigma(W_o \cdot x_t + U_o \cdot h_{t-1} + b_o)$$
$$h_t = o_t \times \tanh(C_t)$$

#### Worked Numeric Example (from the chapter)

Starting with $C_{t-1} = 2.0$, $h_{t-1} = 1.0$, $x_t = 1.0$:

| Step | Computation | Result |
|------|-------------|--------|
| Forget gate input | $(1 \times 2.70) + (1 \times 1.63) + 1.62 = 5.95$ | |
| Forget factor $f_t$ | $\sigma(5.95)$ | $0.997$ |
| Scaled LTM | $2.0 \times 0.997$ | $1.99$ |
| Input gate $i_t$ | $\sigma(4.27)$ | $0.99$ |
| Potential LTM $\hat{C}$ | $\tanh(2.03)$ | $0.97$ |
| New LTM $C_t$ | $1.99 + 0.99 \times 0.97$ | $2.95$ |
| Output gate $o_t$ | $\sigma(4.78)$ | $0.99$ |
| $\tanh(C_t)$ | $\tanh(2.95)$ | $0.99$ |
| New STM $h_t$ | $0.99 \times 0.99$ | $0.98$ |

#### Unrolled LSTM for Sequence Prediction

1. Initialize $C_0 = 0$, $h_0 = 0$.
2. Feed each time step's input through the same LSTM unit (shared weights) in sequence.
3. After the final input day, the last $h_t$ is the prediction for the next day.
4. The same weights handle sequences that differ only in early positions — the Cell State preserves that early difference across all subsequent time steps (demonstrated with Company A vs Company B).

### PyTorch / Code Notes

```python
import torch.nn as nn

# 1 input feature (stock price) → 1 output (hidden) dimension
self.lstm = nn.LSTM(input_size=1, hidden_size=1)
```

- `input_size`: number of features per time step.
- `hidden_size`: dimensionality of both Hidden State and Cell State. Increase when feeding LSTM output into a subsequent fully-connected layer (e.g., `hidden_size=10`).
- Default initialization: $h_0 = 0$, $C_0 = 0$. Pass `h_0` and `c_0` explicitly to override.
- Can also build from scratch using `torch.sigmoid()` and `torch.tanh()`.
- Use `LightningModule.log()` to track loss per epoch; a flattened loss curve means training has converged; a still-declining curve means add more epochs.

### Key Takeaways

- LSTMs solve the vanishing/exploding gradient problem by routing Long-Term Memory through the Cell State — a path with no direct weight multiplication — so gradients remain stable across long sequences.
- All three gates (Forget, Input, Output) use sigmoid outputs as fractions in $(0, 1)$ to control how much memory survives or gets written; tanh provides the signed candidate values in $(-1, 1)$.
- Despite looking complex, every LSTM operation is just weighted sums, sigmoid, tanh, element-wise multiply, and add — the same primitives as any neural network.
- Weights and biases are shared across all unrolled time steps, so model size stays constant regardless of sequence length.
- In PyTorch, `nn.LSTM(input_size, hidden_size)` handles all gate logic automatically.
```