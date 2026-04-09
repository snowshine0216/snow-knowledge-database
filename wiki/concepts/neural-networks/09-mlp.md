---
tags: [neural-networks, deep-learning, math, 3blue1brown, mlp, interpretability, transformers]
source: https://www.youtube.com/watch?v=9-Jl0dxWQs8
---

# How Might LLMs Store Facts — MLP Blocks

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/mlp
- Video: https://www.youtube.com/watch?v=9-Jl0dxWQs8
- Date: 2024-08-31

## Outline
1. [MLP Role in Transformers](wiki/concepts/neural-networks/09-mlp.md#mlp-role)
2. [MLP Forward Computation](wiki/concepts/neural-networks/09-mlp.md#mlp-forward)
3. [Activation Functions: ReLU and GELU](wiki/concepts/neural-networks/09-mlp.md#activation-functions)
4. [What Feature Neurons Store](wiki/concepts/neural-networks/09-mlp.md#feature-neurons)
5. [Superposition Hypothesis](wiki/concepts/neural-networks/09-mlp.md#superposition)
6. [Interpretability Limits](wiki/concepts/neural-networks/09-mlp.md#interpretability-limits)

---

## MLP Role in Transformers

Each transformer block contains two sublayers:

1. **Self-attention** — lets tokens communicate (routing information across positions)
2. **MLP (feedforward network)** — operates independently on each position (token-wise transformation)

The MLP sublayer is applied identically to every token position independently. It acts like a **key-value memory store** that retrieves and adds information based on the current token representation.

Evidence from mechanistic interpretability suggests that factual associations (e.g., "Michael Jordan" → "basketball") are largely stored in MLP weights rather than attention weights.

---

## MLP Forward Computation

The standard transformer MLP is a two-layer feedforward network applied per token:

$$\mathbf{h} = f\!\left(\mathbf{x}\, \mathbf{W}_1 + \mathbf{b}_1\right)$$

$$\mathbf{y} = \mathbf{h}\, \mathbf{W}_2 + \mathbf{b}_2$$

where:
- $\mathbf{x} \in \mathbb{R}^{d_{\text{model}}}$: input representation for one token
- $\mathbf{W}_1 \in \mathbb{R}^{d_{\text{model}} \times d_{\text{ff}}}$: first (expansion) weight matrix
- $\mathbf{W}_2 \in \mathbb{R}^{d_{\text{ff}} \times d_{\text{model}}}$: second (projection) weight matrix
- $f$: nonlinear activation function
- $d_{\text{ff}} = 4 d_{\text{model}}$ typically (the hidden layer is 4× wider)

The MLP doubles the model's parameter count: attention adds $4 d_{\text{model}}^2$ and MLP adds $2 \times 4 d_{\text{model}}^2 = 8 d_{\text{model}}^2$ per layer.

---

## Activation Functions: ReLU and GELU

**ReLU** (Rectified Linear Unit):

$$\text{ReLU}(x) = \max(0,\, x)$$

Simple, fast, and creates sparse activations (neurons are either off or on).

**GELU** (Gaussian Error Linear Unit) — used in GPT and most modern transformers:

$$\text{GELU}(x) = x \cdot \Phi(x)$$

where $\Phi(x)$ is the cumulative distribution function of the standard normal:

$$\Phi(x) = \frac{1}{2}\left[1 + \text{erf}\!\left(\frac{x}{\sqrt{2}}\right)\right]$$

GELU is smooth everywhere (unlike ReLU's sharp corner at 0) and empirically outperforms ReLU in language model training. An approximate fast form:

$$\text{GELU}(x) \approx 0.5x\left(1 + \tanh\!\left(\sqrt{\frac{2}{\pi}}(x + 0.044715\, x^3)\right)\right)$$

---

## What Feature Neurons Store

Each row of $\mathbf{W}_1$ (a neuron in the hidden layer) acts as a **key vector**. When the input $\mathbf{x}$ has high dot product with this key, the neuron activates and the corresponding row of $\mathbf{W}_2$ (the **value vector**) is added to the output.

This is analogous to a soft key-value lookup:

$$\text{MLP}(\mathbf{x}) \approx \sum_i f\!\left(\mathbf{w}_{1,i} \cdot \mathbf{x} + b_{1,i}\right) \cdot \mathbf{w}_{2,i}$$

Each hidden neuron $i$ contributes its value vector $\mathbf{w}_{2,i}$ proportionally to how much the input matches its key $\mathbf{w}_{1,i}$.

Concrete example from interpretability research: a neuron might fire strongly when the context mentions a famous athlete's name, and its value vector points toward the sport's direction in embedding space.

---

## Superposition Hypothesis

If there are $d_{\text{ff}}$ neurons but the model needs to represent $F \gg d_{\text{ff}}$ features, it cannot assign one dedicated direction per feature. Instead, features share directions — this is **superposition**:

$$\mathbf{x} \approx \sum_{f=1}^{F} z_f\, \hat{\mathbf{e}}_f, \qquad \hat{\mathbf{e}}_f \in \mathbb{R}^d, \quad F \gg d$$

where $\hat{\mathbf{e}}_f$ are nearly-orthogonal feature directions packed into the lower-dimensional space.

The **interference** between features that share directions is:

$$\text{interference}(f, g) = (\hat{\mathbf{e}}_f \cdot \hat{\mathbf{e}}_g)^2$$

Rare features (low $z_f$) can be superimposed with less total error — the network trades off feature density against representation fidelity.

**Implication for interpretability**: a single neuron activation does not correspond to a single human-interpretable concept. It is a combination of many features whose interference the model has learned to tolerate.

---

## Interpretability Limits

Despite growing evidence for structured feature storage in MLP blocks:

- Interpretations are **partial** — they explain some behaviors but not all
- The same neuron may participate in many different computations simultaneously (polysemanticity)
- Current mechanistic interpretability tools can identify correlations but not prove causal mechanisms
- Superposition makes it unlikely that there exists a clean "concept per neuron" decomposition

The field is actively developing tools (e.g., sparse autoencoders) to disentangle superimposed features into monosemantic components.
