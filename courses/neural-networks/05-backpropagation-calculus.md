---
tags: [neural-networks, deep-learning, math, 3blue1brown, backpropagation, calculus]
source: https://www.youtube.com/watch?v=tIeHLnjs5U8
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. In calculus, how would you use the chain rule to find how a change in an early layer's weight affects the final cost in a neural network?
2. What is the "error signal" δ in backpropagation — what quantity does it represent mathematically?
3. Why does a neural network's forward pass need to save intermediate values like z and a for each layer, rather than discarding them after computing the output?

---

# Backpropagation Calculus

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/backpropagation-calculus
- Video: https://www.youtube.com/watch?v=tIeHLnjs5U8
- Date: 2017-11-03

## Outline
1. [Notation](#notation)
2. [Forward Pass Variables](#forward-pass-variables)
3. [Output Layer Error δᴸ](#output-layer-error)
4. [Backpropagating the Error](#backpropagating-error)
5. [Gradients w.r.t. Weights and Biases](#gradients-weights-biases)
6. [Vectorized Form](#vectorized-form)
7. [Dataset-Level Averaging](#dataset-averaging)

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


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain BP1 and BP2 in your own words: what does each equation compute, and how do they work together to propagate error backward through the network?
2. Explain why the weight gradient formula is δ⁽ˡ⁾(a⁽ˡ⁻¹⁾)ᵀ — specifically, where the a⁽ˡ⁻¹⁾ term comes from in the chain rule derivation.
3. Explain how mini-batch SGD relates to full-dataset gradient computation, and why the weight gradient formula includes a 1/m factor.

> [!example]- Answer Guide
> #### Q1 — BP1 and BP2 Error Propagation
> BP1 computes the output layer error as the element-wise product of the cost's gradient w.r.t. final activations and σ'(z⁽ᴸ⁾), seeding the backward pass. BP2 then propagates this error to earlier layers by multiplying by the transposed weight matrix W⁽ˡ⁺¹⁾ᵀ (routing error back through connections) and modulating by the local derivative σ'(z⁽ˡ⁾).
> 
> #### Q2 — Weight Gradient Chain Rule Origin
> The weight gradient ∂C/∂w⁽ˡ⁾ⱼₖ = δ⁽ˡ⁾ⱼ · a⁽ˡ⁻¹⁾ₖ because by chain rule ∂z⁽ˡ⁾ⱼ/∂w⁽ˡ⁾ⱼₖ = a⁽ˡ⁻¹⁾ₖ — the pre-activation z is a weighted sum, so its derivative w.r.t. a specific weight equals the activation feeding into that weight.
> 
> #### Q3 — Mini-batch SGD and 1/m Factor
> The full-dataset gradient is the mean of per-sample gradients over all n training examples; mini-batch SGD approximates this with a random subset of size m ≪ n, which is why the vectorized weight gradient is divided by m to produce a proper average over the batch.
