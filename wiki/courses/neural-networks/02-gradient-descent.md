---
tags: [neural-networks, deep-learning, math, 3blue1brown, gradient-descent, optimization]
source: https://www.youtube.com/watch?v=IHZwWFHWa-w
---

# Gradient Descent — How Neural Networks Learn

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/gradient-descent
- Video: https://www.youtube.com/watch?v=IHZwWFHWa-w
- Date: 2017-10-16

## Outline
1. [The Cost Function](wiki/courses/neural-networks/02-gradient-descent.md#cost-function)
2. [Parameter Space](wiki/courses/neural-networks/02-gradient-descent.md#parameter-space)
3. [The Gradient — Direction of Steepest Ascent](wiki/courses/neural-networks/02-gradient-descent.md#gradient)
4. [Gradient Descent Update Rule](wiki/courses/neural-networks/02-gradient-descent.md#update-rule)
5. [Learning Rate](wiki/courses/neural-networks/02-gradient-descent.md#learning-rate)
6. [Mini-batch and Stochastic Gradient Descent](wiki/courses/neural-networks/02-gradient-descent.md#mini-batch-sgd)

---

## Cost Function

To measure how wrong the network is, we define a **cost function** (also called loss) that aggregates error over all training examples.

**Mean Squared Error (MSE)**:

$$C(\mathbf{W}, \mathbf{b}) = \frac{1}{n} \sum_{x} \left\| \mathbf{y}(x) - \mathbf{a}^{(L)}(x) \right\|^2$$

- $n$: number of training examples
- $\mathbf{y}(x)$: desired output (one-hot label) for input $x$
- $\mathbf{a}^{(L)}(x)$: the network's actual output for input $x$
- $\|\cdot\|^2$: squared Euclidean distance

The cost is **small** when the network's outputs closely match the labels on all training examples, and **large** when it's frequently wrong.

---

## Parameter Space

All 13,002 parameters (weights + biases) form a single high-dimensional vector $\boldsymbol{\theta}$. The cost function is a scalar-valued function of this vector:

$$C : \mathbb{R}^{13002} \to \mathbb{R}$$

Training = finding the $\boldsymbol{\theta}$ that minimizes $C(\boldsymbol{\theta})$.

This is a landscape with 13,002 dimensions. We cannot visualize it directly, but the calculus of gradients gives us a local guide.

---

## The Gradient — Direction of Steepest Ascent

The **gradient** $\nabla_{\boldsymbol{\theta}} C$ is a vector in parameter space that points in the direction of **steepest increase** in cost:

$$\nabla_{\boldsymbol{\theta}} C = \left( \frac{\partial C}{\partial \theta_1},\; \frac{\partial C}{\partial \theta_2},\; \ldots,\; \frac{\partial C}{\partial \theta_N} \right)$$

- Its **direction** indicates which way the cost increases fastest
- Its **magnitude** $\|\nabla C\|$ tells you how steep that slope is

To **reduce** cost, move in the *opposite* direction of the gradient.

---

## Gradient Descent Update Rule

Starting from a random initialization, repeatedly nudge parameters in the negative gradient direction:

$$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \eta\, \nabla_{\boldsymbol{\theta}} C$$

In per-parameter form:

$$w_{ij} \leftarrow w_{ij} - \eta\, \frac{\partial C}{\partial w_{ij}}, \qquad b_i \leftarrow b_i - \eta\, \frac{\partial C}{\partial b_i}$$

- $\eta$ (eta): **learning rate**, controls the step size
- Each update moves the parameters slightly downhill in the cost landscape
- Repeat until convergence (cost stops decreasing meaningfully)

---

## Learning Rate

The learning rate $\eta$ is a critical hyperparameter:

| $\eta$ too large | $\eta$ too small |
|-----------------|-----------------|
| Overshoots minima, may diverge | Converges very slowly |
| Oscillates or explodes | Safe but wasteful |

A typical starting value for $\eta$ is in the range $[10^{-4},\, 10^{-2}]$, often tuned via a **learning rate schedule** (e.g., decay over time).

---

## Mini-batch and Stochastic Gradient Descent

Computing the exact gradient requires summing over all $n$ training examples — expensive for large datasets.

**Stochastic Gradient Descent (SGD)**: use a single random example per step:

$$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \eta\, \nabla_{\boldsymbol{\theta}} C_{x}$$

**Mini-batch gradient descent**: average over a small random subset $\mathcal{B}$ of size $m$:

$$\nabla C \approx \frac{1}{m} \sum_{x \in \mathcal{B}} \nabla_{\boldsymbol{\theta}} C_x$$

$$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \eta \cdot \frac{1}{m} \sum_{x \in \mathcal{B}} \nabla_{\boldsymbol{\theta}} C_x$$

- Typical mini-batch sizes: $m \in \{32, 64, 128, 256\}$
- Noisy gradient estimates are actually beneficial: the noise helps escape shallow local minima
- One full pass through all training data = one **epoch**

The key bottleneck is computing all those partial derivatives $\partial C / \partial w_{ij}$ efficiently — that is the job of **backpropagation**.
