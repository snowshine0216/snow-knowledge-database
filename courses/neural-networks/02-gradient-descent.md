---
tags: [neural-networks, deep-learning, math, 3blue1brown, gradient-descent, optimization]
source: https://www.youtube.com/watch?v=IHZwWFHWa-w
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What does the gradient of a function tell you, and in which direction does gradient descent move relative to it?
2. If a neural network has roughly 13,000 parameters, what mathematical object represents all of them during training, and what are we trying to do to the cost function over that object?
3. What is the difference between stochastic gradient descent and mini-batch gradient descent, and why might using less than the full dataset per step actually help training?

---

# Gradient Descent — How Neural Networks Learn

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/gradient-descent
- Video: https://www.youtube.com/watch?v=IHZwWFHWa-w
- Date: 2017-10-16

## Outline
1. [The Cost Function](#cost-function)
2. [Parameter Space](#parameter-space)
3. [The Gradient — Direction of Steepest Ascent](#gradient)
4. [Gradient Descent Update Rule](#update-rule)
5. [Learning Rate](#learning-rate)
6. [Mini-batch and Stochastic Gradient Descent](#mini-batch-sgd)

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


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain the Mean Squared Error cost function in your own words — what does it measure, what inputs does it take, and when is it large versus small?
2. Walk through the gradient descent update rule step by step: what is being updated, by how much, and in which direction — and what role does the learning rate η play if it is set too high or too low?
3. Explain why mini-batch gradient descent is preferred over both full-batch and pure stochastic gradient descent, and what the term "epoch" means in this context.

> [!example]- Answer Guide
> #### Q1 — MSE Cost Function Explained
> MSE averages the squared Euclidean distance between the network's actual output and the desired label across all training examples; it is small when outputs closely match labels on every example and large when the network is frequently wrong.
> 
> #### Q2 — Gradient Descent Update Rule
> Each parameter is nudged by subtracting η times its partial derivative of C — moving downhill in the cost landscape; too large an η overshoots and may diverge, while too small an η converges safely but wastefully slowly.
> 
> #### Q3 — Mini-Batch SGD and Epochs
> Mini-batch SGD averages gradients over a small random subset (typically 32–256 examples), balancing the computational cost of full-batch against the instability of single-example SGD — and the resulting gradient noise is actually beneficial because it helps escape shallow local minima; one full pass through all training data is called an epoch.
