---
tags: [neural-networks, deep-learning, math, 3blue1brown, backpropagation, gradient-descent]
source: https://www.youtube.com/watch?v=Ilg3gGewQ5U
---

# What is Backpropagation Really Doing?

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/backpropagation
- Video: https://www.youtube.com/watch?v=Ilg3gGewQ5U
- Date: 2017-11-03

## Outline
1. [What Backprop Computes](wiki/concepts/neural-networks/04-backpropagation.md#what-backprop-computes)
2. [Local Sensitivity Intuition](wiki/concepts/neural-networks/04-backpropagation.md#local-sensitivity)
3. [Chain Rule Flow](wiki/concepts/neural-networks/04-backpropagation.md#chain-rule-flow)
4. [Error Signal Propagation](wiki/concepts/neural-networks/04-backpropagation.md#error-signal-propagation)
5. [Why Not Finite Differences?](wiki/concepts/neural-networks/04-backpropagation.md#why-not-finite-differences)
6. [Integration with the SGD Training Loop](wiki/concepts/neural-networks/04-backpropagation.md#sgd-integration)

---

## What Backprop Computes

Backpropagation computes the **gradient of the cost with respect to every parameter** in one efficient backward pass:

$$\nabla_{\boldsymbol{\theta}} C = \left(\frac{\partial C}{\partial w_1},\; \frac{\partial C}{\partial w_2},\; \ldots,\; \frac{\partial C}{\partial b_1},\; \frac{\partial C}{\partial b_2},\; \ldots\right)$$

This gradient vector is exactly what gradient descent needs to update the parameters. Backprop's job is *purely computation* — finding these values efficiently.

---

## Local Sensitivity Intuition

Think of each parameter's contribution in terms of how a small nudge $\Delta\theta$ propagates forward to the cost.

For a single weight $w$ connecting two neurons with pre-activation $z = \cdots + w \cdot a + \cdots$:

$$\Delta z \approx \frac{\partial z}{\partial w}\, \Delta w = a \cdot \Delta w$$

This nudge propagates to the activation:

$$\Delta a' \approx \sigma'(z)\, \Delta z$$

And then through subsequent layers until it reaches the cost $C$.

The key insight: the **influence** of each parameter on the cost can be traced as a product of local sensitivities along a path.

---

## Chain Rule Flow

For a simple chain $w \to z \to a \to C$:

$$\frac{\partial C}{\partial w} = \frac{\partial C}{\partial a} \cdot \frac{\partial a}{\partial z} \cdot \frac{\partial z}{\partial w}$$

Unpacking each factor:

| Factor | Expression | Meaning |
|--------|-----------|---------|
| $\partial z / \partial w$ | $a_{\text{prev}}$ | How much $z$ changes when $w$ changes (= the incoming activation) |
| $\partial a / \partial z$ | $\sigma'(z)$ | How much the activation changes with pre-activation |
| $\partial C / \partial a$ | Computed from the next layer | How much cost changes with this activation |

The chain rule makes explicit that each weight's gradient depends on (a) the activation feeding into it and (b) how much that neuron's output "matters" further down the network.

---

## Error Signal Propagation

Define the **error signal** $\delta$ at a neuron as how much the cost changes with the neuron's pre-activation:

$$\delta = \frac{\partial C}{\partial z}$$

At the output layer, $\delta^{(L)}$ measures directly how wrong the network's output is.

For hidden layers, $\delta^{(l)}$ is computed by **pulling the error backward** through the weights:

$$\delta^{(l)} = \left(\sum_j w_{jk}^{(l+1)}\, \delta_j^{(l+1)}\right) \cdot \sigma'(z_k^{(l)})$$

The error at neuron $k$ in layer $l$ is a weighted sum of errors from the layer ahead, modulated by how sensitive the activation is at the current neuron. This is the **backpropagation** step.

---

## Why Not Finite Differences?

The naive approach to estimating $\partial C / \partial w_i$ is to perturb $w_i$ by a small $\epsilon$ and measure the change in cost:

$$\frac{\partial C}{\partial w_i} \approx \frac{C(\ldots, w_i + \epsilon, \ldots) - C(\ldots, w_i, \ldots)}{\epsilon}$$

**Problem**: this requires one full forward pass per parameter.

For a network with $N$ parameters, that's $O(N)$ forward passes per gradient step.

Backprop computes **all** $N$ partial derivatives in:
- 1 forward pass
- 1 backward pass

Total cost: $O(N)$ operations, not $O(N^2)$.

---

## Integration with the SGD Training Loop

```
for each mini-batch B:
    1. Forward pass: compute a^(1), ..., a^(L) for each x in B
    2. Backward pass (backprop): compute δ^(L), δ^(L-1), ..., δ^(1)
    3. Accumulate gradients: ∂C/∂W^(l), ∂C/∂b^(l) for all l
    4. Average over the mini-batch
    5. Update: θ ← θ - η · ∇C
```

Backprop is not a separate training algorithm — it is the **gradient computation subroutine** inside gradient descent. The actual update rule remains $\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \eta\, \nabla C$.

The mathematical details of exactly *which* partial derivatives to compute and in what order are spelled out in Chapter 5.
