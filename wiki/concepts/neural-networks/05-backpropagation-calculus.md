---
tags: [neural-networks, deep-learning, math, 3blue1brown, backpropagation, calculus]
source: https://www.youtube.com/watch?v=tIeHLnjs5U8
---

# Backpropagation Calculus

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/backpropagation-calculus
- Video: https://www.youtube.com/watch?v=tIeHLnjs5U8
- Date: 2017-11-03

## Outline
1. [Notation](wiki/concepts/neural-networks/05-backpropagation-calculus.md#notation)
2. [Forward Pass Variables](wiki/concepts/neural-networks/05-backpropagation-calculus.md#forward-pass-variables)
3. [Output Layer Error δᴸ](wiki/concepts/neural-networks/05-backpropagation-calculus.md#output-layer-error)
4. [Backpropagating the Error](wiki/concepts/neural-networks/05-backpropagation-calculus.md#backpropagating-error)
5. [Gradients w.r.t. Weights and Biases](wiki/concepts/neural-networks/05-backpropagation-calculus.md#gradients-weights-biases)
6. [Vectorized Form](wiki/concepts/neural-networks/05-backpropagation-calculus.md#vectorized-form)
7. [Dataset-Level Averaging](wiki/concepts/neural-networks/05-backpropagation-calculus.md#dataset-averaging)

---

## Notation

| Symbol | Meaning |
|--------|---------|
| $L$ | Total number of layers |
| $l$ | Current layer index ($1 \leq l \leq L$) |
| $n_l$ | Number of neurons in layer $l$ |
| $w_{jk}^{(l)}$ | Weight from neuron $k$ in layer $l-1$ to neuron $j$ in layer $l$ |
| $b_j^{(l)}$ | Bias of neuron $j$ in layer $l$ |
| $z_j^{(l)}$ | Pre-activation: $z_j^{(l)} = \sum_k w_{jk}^{(l)} a_k^{(l-1)} + b_j^{(l)}$ |
| $a_j^{(l)}$ | Activation: $a_j^{(l)} = \sigma(z_j^{(l)})$ |
| $C$ | Scalar cost function |
| $\delta_j^{(l)}$ | Error signal: $\delta_j^{(l)} = \partial C / \partial z_j^{(l)}$ |
| $\odot$ | Element-wise (Hadamard) product |

---

## Forward Pass Variables

The forward pass computes, layer by layer:

$$z_j^{(l)} = \sum_k w_{jk}^{(l)}\, a_k^{(l-1)} + b_j^{(l)}$$

$$a_j^{(l)} = \sigma\!\left(z_j^{(l)}\right)$$

In matrix form:

$$\mathbf{z}^{(l)} = \mathbf{W}^{(l)}\, \mathbf{a}^{(l-1)} + \mathbf{b}^{(l)}$$

$$\mathbf{a}^{(l)} = \sigma\!\left(\mathbf{z}^{(l)}\right) \quad \text{(element-wise)}$$

All intermediate values $\mathbf{z}^{(l)}$ and $\mathbf{a}^{(l)}$ must be **saved** during the forward pass, because the backward pass needs them.

---

## Output Layer Error δᴸ

The error at the output layer measures how the cost responds to the final pre-activations:

$$\boldsymbol{\delta}^{(L)} = \nabla_{\mathbf{a}^{(L)}} C \;\odot\; \sigma'\!\left(\mathbf{z}^{(L)}\right)$$

**Derivation** via chain rule for output neuron $j$:

$$\delta_j^{(L)} = \frac{\partial C}{\partial z_j^{(L)}} = \frac{\partial C}{\partial a_j^{(L)}} \cdot \frac{\partial a_j^{(L)}}{\partial z_j^{(L)}} = \frac{\partial C}{\partial a_j^{(L)}} \cdot \sigma'\!\left(z_j^{(L)}\right)$$

For **MSE cost** $C = \frac{1}{2}\sum_j (a_j^{(L)} - y_j)^2$:

$$\frac{\partial C}{\partial a_j^{(L)}} = a_j^{(L)} - y_j$$

So:

$$\delta_j^{(L)} = \left(a_j^{(L)} - y_j\right) \cdot \sigma'\!\left(z_j^{(L)}\right)$$

---

## Backpropagating the Error

Given $\boldsymbol{\delta}^{(l+1)}$, the error at layer $l$ is:

$$\boldsymbol{\delta}^{(l)} = \left(\left(\mathbf{W}^{(l+1)}\right)^\top \boldsymbol{\delta}^{(l+1)}\right) \;\odot\; \sigma'\!\left(\mathbf{z}^{(l)}\right)$$

**Element-wise derivation** for neuron $k$ in layer $l$:

$$\delta_k^{(l)} = \frac{\partial C}{\partial z_k^{(l)}} = \sum_j \frac{\partial C}{\partial z_j^{(l+1)}} \cdot \frac{\partial z_j^{(l+1)}}{\partial a_k^{(l)}} \cdot \frac{\partial a_k^{(l)}}{\partial z_k^{(l)}}$$

$$= \sum_j \delta_j^{(l+1)} \cdot w_{jk}^{(l+1)} \cdot \sigma'\!\left(z_k^{(l)}\right)$$

This is "transport" of error: the error at layer $l+1$ is weighted by the connections $w_{jk}^{(l+1)}$ and modulated by the local derivative $\sigma'(z_k^{(l)})$.

---

## Gradients w.r.t. Weights and Biases

Once all $\boldsymbol{\delta}^{(l)}$ are computed, the gradients follow immediately:

**Bias gradient**:

$$\frac{\partial C}{\partial b_j^{(l)}} = \delta_j^{(l)}$$

Because $\partial z_j^{(l)} / \partial b_j^{(l)} = 1$.

**Weight gradient**:

$$\frac{\partial C}{\partial w_{jk}^{(l)}} = \delta_j^{(l)} \cdot a_k^{(l-1)}$$

Because $\partial z_j^{(l)} / \partial w_{jk}^{(l)} = a_k^{(l-1)}$.

In matrix form:

$$\frac{\partial C}{\partial \mathbf{b}^{(l)}} = \boldsymbol{\delta}^{(l)}$$

$$\frac{\partial C}{\partial \mathbf{W}^{(l)}} = \boldsymbol{\delta}^{(l)} \left(\mathbf{a}^{(l-1)}\right)^\top$$

---

## The Four Fundamental Equations of Backpropagation

$$\boxed{
\begin{aligned}
\text{(BP1)}&\quad \boldsymbol{\delta}^{(L)} = \nabla_{\mathbf{a}^{(L)}} C \;\odot\; \sigma'\!\left(\mathbf{z}^{(L)}\right) \\[6pt]
\text{(BP2)}&\quad \boldsymbol{\delta}^{(l)} = \left(\left(\mathbf{W}^{(l+1)}\right)^\top \boldsymbol{\delta}^{(l+1)}\right) \;\odot\; \sigma'\!\left(\mathbf{z}^{(l)}\right) \\[6pt]
\text{(BP3)}&\quad \frac{\partial C}{\partial \mathbf{b}^{(l)}} = \boldsymbol{\delta}^{(l)} \\[6pt]
\text{(BP4)}&\quad \frac{\partial C}{\partial \mathbf{W}^{(l)}} = \boldsymbol{\delta}^{(l)} \left(\mathbf{a}^{(l-1)}\right)^\top
\end{aligned}
}$$

This is the complete recipe: BP1 starts the process at the output, BP2 propagates it backward, BP3 and BP4 extract the gradients.

---

## Vectorized Form

For a mini-batch of $m$ samples stacked as columns:

$$\mathbf{A}^{(l)} \in \mathbb{R}^{n_l \times m}, \qquad \boldsymbol{\Delta}^{(l)} \in \mathbb{R}^{n_l \times m}$$

The weight gradient averaged over the mini-batch:

$$\frac{\partial C}{\partial \mathbf{W}^{(l)}} = \frac{1}{m}\, \boldsymbol{\Delta}^{(l)} \left(\mathbf{A}^{(l-1)}\right)^\top$$

The bias gradient (sum over batch dimension, then divide):

$$\frac{\partial C}{\partial \mathbf{b}^{(l)}} = \frac{1}{m}\sum_{i=1}^{m} \boldsymbol{\delta}_i^{(l)}$$

---

## Dataset-Level Averaging

For the full training set of $n$ samples, the total cost gradient is the mean over individual sample gradients:

$$\nabla_{\boldsymbol{\theta}} C = \frac{1}{n} \sum_{x} \nabla_{\boldsymbol{\theta}} C_x$$

Each $\nabla_{\boldsymbol{\theta}} C_x$ is computed by running BP1–BP4 on a single input-output pair $(x, y)$. Mini-batch SGD approximates this sum with a random subset of size $m \ll n$.
