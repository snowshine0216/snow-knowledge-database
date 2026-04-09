---
tags: [statquest, neural-networks, fundamentals, deep-learning, weights, biases, activation-functions]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

Using the course-chapter-summarizer skill's writing principles (prose-based, equations inline, clean structure), but following the user's explicitly requested section format since user instructions take priority.

---

```markdown
---
tags: [neural-networks, deep-learning, activation-functions, relu, backpropagation, pytorch, statquest]
source: https://github.com/StatQuest/signa
---

# Fundamental Concepts in Neural Networks and AI

## Overview

This chapter introduces the foundational ideas of neural networks from first principles: what
they are, what they're made of, and how they work mechanically. Starting from the intuition
that a neural network is simply a curve-fitting machine, it walks through the anatomy of a
small network (nodes, weights, biases, activation functions, layers) and then traces — step by
step — how a single-hidden-layer network transforms a Dose input into a Drug Effectiveness
prediction. The chapter closes with an introduction to PyTorch tensors and `nn.Module`, laying
the groundwork for implementing networks in code.

---

## Core Concepts

- **What neural networks do:** Transform input data into predictions by fitting a flexible
  curve (squiggle or bent shape) to the data. Even text generation ("predict the next word") is
  framed as sequential prediction.
- **Node:** A basic computational unit in the network (drawn as a square box).
- **Connection / Weight:** An arrow between nodes. The number along each connection that gets
  *multiplied* is a **weight**.
- **Bias:** A number that gets *added* at a node. Weights and biases together are the
  **parameters** of the network; they are learned via **backpropagation**.
- **Activation Function:** A bent or curved function inside a hidden node that gives the
  network non-linearity, enabling it to fit any shape. Common choices:
  - **ReLU** (*Rectified Linear Unit*): $\text{ReLU}(x) = \max(0, x)$ — a bent line at $x=0$.
  - **SoftPlus**: a smooth version of ReLU.
  - **Sigmoid**: an S-shaped squiggle; pedagogically popular but rarely used in large networks.
- **Layers:**
  - *Input layer* — receives raw features.
  - *Hidden layer(s)* — intermediate nodes with activation functions; more layers/nodes → more
    complex shapes.
  - *Output layer* — produces the final prediction.
- **Inference:** Using a trained network to make predictions (as opposed to training it).
- **Backpropagation:** The algorithm that estimates weights and biases by iteratively improving
  an initial guess until predictions match the training data.

---

## Key Techniques / Algorithms

### How a single hidden layer builds a fitted curve

The worked example uses a network with:
- 1 input node (Drug Dose, scaled to $[0, 1]$)
- 1 hidden layer with 2 ReLU nodes
- 1 output node (Drug Effectiveness, scaled to $[0, 1]$)

**Top hidden node (blue path)**

The input is linearly transformed before entering the activation function:

$$
z_{\text{top}} = w_1 \cdot \text{Dose} + b_1 = 1.43 \cdot \text{Dose} + (-0.61)
$$

- $w_1 = 1.43$: weight on the input connection
- $b_1 = -0.61$: bias added at the node

The ReLU clips anything below zero:

$$
a_{\text{top}} = \text{ReLU}(z_{\text{top}}) = \max(0,\; z_{\text{top}})
$$

The output of this node is then scaled by the weight on the connection to the output node:

$$
\text{blue contribution} = -3.89 \cdot a_{\text{top}}
$$

Because this weight is negative, the bent line gets *flipped* and *stretched*.

**Bottom hidden node (orange path)**

Identically structured, but with different parameters:

$$
z_{\text{bot}} = 2.63 \cdot \text{Dose} + (-0.27)
$$

$$
a_{\text{bot}} = \max(0,\; z_{\text{bot}})
$$

$$
\text{orange contribution} = 1.35 \cdot a_{\text{bot}}
$$

**Output node (Sum)**

The output node adds the two contributions together:

$$
\hat{y} = \text{blue contribution} + \text{orange contribution}
= -3.89 \cdot a_{\text{top}} + 1.35 \cdot a_{\text{bot}}
$$

Each hidden node produces a bent line; the output node *sums* those lines into a composite
shape that can fit the original non-linear data. The key insight is that by adjusting weights
and biases, the network **stretches, flips, and shifts** each ReLU's bent line before summing
them — this is what lets a neural network approximate virtually any function.

**Numerical check at Dose = 0.5**

$$
z_{\text{top}} = 1.43(0.5) - 0.61 = 0.105 \implies a_{\text{top}} = 0.105
$$

$$
z_{\text{bot}} = 2.63(0.5) - 0.27 = 1.045 \implies a_{\text{bot}} = 1.045
$$

$$
\hat{y} = -3.89(0.105) + 1.35(1.045) \approx -0.408 + 1.411 \approx 1.0
$$

The network predicts Effectiveness ≈ 1 (fully effective) at Dose = 0.5, matching the data.

---

## PyTorch / Code Notes

**Tensors** are the fundamental data container in PyTorch. Unlike Python lists, every element
in a tensor must share the same data type, and tensors are optimized for neural-network
operations (GPU acceleration, automatic differentiation).

```python
import torch

doses         = torch.tensor([0.0, 0.5, 1.0])
effectiveness = torch.tensor([0.0, 1.0, 0.0])
```

**`nn.Module`** is the base class every custom neural network must inherit from. A minimal
subclass requires two methods:

```python
import torch.nn as nn

class MyNN(nn.Module):
    def __init__(self):
        super().__init__()
        # initialize layers, weights, biases here

    def forward(self, input_values):
        # define the forward pass (inference) here
        pass
```

- `__init__` sets up the network's parts (layers, activation functions, etc.).
- `forward` defines how data flows through the network during inference.

Full tutorial code: <https://github.com/StatQuest/signa>

---

## Key Takeaways

- Neural networks are **curve-fitting machines**: they find weights and biases that shape
  activation functions into a curve matching the training data.
- The building blocks are simple: **nodes** (compute), **weights** (multiply), **biases**
  (add), and **activation functions** (introduce non-linearity).
- A hidden layer with $n$ ReLU nodes produces $n$ bent lines; the output node **sums** them
  into a richer composite shape — more nodes means more expressive shapes.
- **Backpropagation** is what actually trains the network; the weights shown in the worked
  example are the *result* of that process, not hand-crafted.
- In PyTorch, every network inherits from `nn.Module` and implements `forward()`; data and
  parameters are stored as **tensors**.
```