---
tags: [neural-networks, deep-learning, math, 3blue1brown, diffusion, image-generation]
source: https://www.youtube.com/watch?v=iv-5mZ_9CPY
---

# How AI Images and Videos Actually Work — Diffusion Models

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/diffusion-models
- Video: https://www.youtube.com/watch?v=iv-5mZ_9CPY
- Date: 2025-07-25

## Outline
1. [Generative Modeling Overview](wiki/concepts/neural-networks/10-diffusion-models.md#generative-modeling)
2. [Forward Diffusion Process](wiki/concepts/neural-networks/10-diffusion-models.md#forward-diffusion)
3. [Reverse Process — Iterative Denoising](wiki/concepts/neural-networks/10-diffusion-models.md#reverse-process)
4. [Denoising Network (Score Model)](wiki/concepts/neural-networks/10-diffusion-models.md#denoising-network)
5. [Training Objective](wiki/concepts/neural-networks/10-diffusion-models.md#training-objective)
6. [Text Conditioning via CLIP](wiki/concepts/neural-networks/10-diffusion-models.md#text-conditioning)

---

## Generative Modeling Overview

The goal of a generative model is to learn the **data distribution** $p_{\text{data}}(\mathbf{x})$ and sample new examples from it.

Diffusion models achieve this through a two-step framework:

1. **Forward process**: gradually corrupt a real image with noise until it becomes pure Gaussian noise
2. **Reverse process**: learn to reverse this corruption step-by-step, turning noise back into a coherent image

The key insight is that the reverse process — denoising — is much easier to learn than directly modeling the full data distribution.

---

## Forward Diffusion Process

Given a real image $\mathbf{x}_0 \sim p_{\text{data}}$, add Gaussian noise over $T$ steps (typically $T = 1000$):

$$q(\mathbf{x}_t \mid \mathbf{x}_{t-1}) = \mathcal{N}\!\left(\mathbf{x}_t;\; \sqrt{1 - \beta_t}\,\mathbf{x}_{t-1},\; \beta_t\,\mathbf{I}\right)$$

where $\beta_t \in (0, 1)$ is a **noise schedule** (increasing over time: more noise added at each step).

**Closed-form sampling at arbitrary step $t$** (no need to iterate): let $\alpha_t = 1 - \beta_t$ and $\bar{\alpha}_t = \prod_{s=1}^{t} \alpha_s$, then:

$$q(\mathbf{x}_t \mid \mathbf{x}_0) = \mathcal{N}\!\left(\mathbf{x}_t;\; \sqrt{\bar{\alpha}_t}\,\mathbf{x}_0,\; (1 - \bar{\alpha}_t)\,\mathbf{I}\right)$$

This means we can directly sample $\mathbf{x}_t$ at any step $t$:

$$\mathbf{x}_t = \sqrt{\bar{\alpha}_t}\,\mathbf{x}_0 + \sqrt{1 - \bar{\alpha}_t}\,\boldsymbol{\varepsilon}, \qquad \boldsymbol{\varepsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$$

As $t \to T$: $\bar{\alpha}_T \approx 0$, so $\mathbf{x}_T \approx \mathcal{N}(\mathbf{0}, \mathbf{I})$ — pure noise.

---

## Reverse Process — Iterative Denoising

The reverse process inverts the forward diffusion, starting from noise:

$$p_\theta(\mathbf{x}_{t-1} \mid \mathbf{x}_t) = \mathcal{N}\!\left(\mathbf{x}_{t-1};\; \boldsymbol{\mu}_\theta(\mathbf{x}_t, t),\; \boldsymbol{\Sigma}_\theta(\mathbf{x}_t, t)\right)$$

We want to learn the mean $\boldsymbol{\mu}_\theta$ and optionally the covariance $\boldsymbol{\Sigma}_\theta$ of this Gaussian.

**Sampling at inference time**:

```
x_T ~ N(0, I)           # start from pure noise
for t = T, T-1, ..., 1:
    z ~ N(0, I) if t > 1, else z = 0
    x_{t-1} = μ_θ(x_t, t) + σ_t · z
return x_0
```

Each denoising step makes a small refinement, gradually resolving structure from coarse to fine.

---

## Denoising Network (Score Model)

Rather than directly predicting $\boldsymbol{\mu}_\theta$, it's common to train the network to predict the **noise** $\boldsymbol{\varepsilon}$ that was added in the forward process. The mean can be recovered as:

$$\boldsymbol{\mu}_\theta(\mathbf{x}_t, t) = \frac{1}{\sqrt{\alpha_t}}\left(\mathbf{x}_t - \frac{\beta_t}{\sqrt{1 - \bar{\alpha}_t}}\,\boldsymbol{\varepsilon}_\theta(\mathbf{x}_t, t)\right)$$

The network $\boldsymbol{\varepsilon}_\theta(\mathbf{x}_t, t)$ takes:
- $\mathbf{x}_t$: the noisy image at step $t$
- $t$: the timestep (encoded as a sinusoidal embedding)

And outputs: the predicted noise $\hat{\boldsymbol{\varepsilon}}$ to remove.

In practice, this network is a **U-Net** (for images) or a **DiT (Diffusion Transformer)** — architectures that process spatial structure at multiple scales.

---

## Training Objective

The simplified training objective (from DDPM — Ho et al. 2020):

$$\mathcal{L}_{\text{simple}} = \mathbb{E}_{t,\, \mathbf{x}_0,\, \boldsymbol{\varepsilon}} \left[\left\|\boldsymbol{\varepsilon} - \boldsymbol{\varepsilon}_\theta\!\left(\sqrt{\bar{\alpha}_t}\,\mathbf{x}_0 + \sqrt{1-\bar{\alpha}_t}\,\boldsymbol{\varepsilon},\; t\right)\right\|^2\right]$$

where:
- $t \sim \text{Uniform}(1, T)$ — random timestep
- $\boldsymbol{\varepsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$ — random noise used to construct $\mathbf{x}_t$
- The model sees a noisy image $\mathbf{x}_t$ and must predict the original noise $\boldsymbol{\varepsilon}$

This is a **mean squared error** loss on noise prediction — conceptually the same as any regression problem. Backpropagation through $\boldsymbol{\varepsilon}_\theta$ trains the denoiser.

---

## Text Conditioning via CLIP

Text-to-image models (Stable Diffusion, DALL-E) condition the denoising process on a text prompt. The conditioning signal is usually a text embedding from a **CLIP** (Contrastive Language-Image Pre-training) encoder.

**CLIP training objective** (InfoNCE / contrastive loss) for a batch of $(image_i, text_i)$ pairs:

$$\mathcal{L}_{\text{CLIP}} = -\frac{1}{N}\sum_{i=1}^{N} \left[\log \frac{e^{\mathbf{f}_i^\top \mathbf{g}_i / \tau}}{\sum_{j=1}^{N} e^{\mathbf{f}_i^\top \mathbf{g}_j / \tau}} + \log \frac{e^{\mathbf{g}_i^\top \mathbf{f}_i / \tau}}{\sum_{j=1}^{N} e^{\mathbf{g}_i^\top \mathbf{f}_j / \tau}}\right]$$

where $\mathbf{f}_i$ = image embedding, $\mathbf{g}_i$ = text embedding, and $\tau$ = temperature.

CLIP forces paired (image, text) embeddings to be close together while pushing apart non-paired embeddings. After CLIP training, the text embedding space is **aligned** with the image embedding space.

The conditioned denoising network becomes $\boldsymbol{\varepsilon}_\theta(\mathbf{x}_t, t, \mathbf{c})$ where $\mathbf{c}$ is the CLIP text embedding of the prompt. **Classifier-Free Guidance (CFG)** amplifies the conditioning:

$$\hat{\boldsymbol{\varepsilon}} = \boldsymbol{\varepsilon}_\theta(\mathbf{x}_t, t, \emptyset) + s\cdot\left(\boldsymbol{\varepsilon}_\theta(\mathbf{x}_t, t, \mathbf{c}) - \boldsymbol{\varepsilon}_\theta(\mathbf{x}_t, t, \emptyset)\right)$$

where $s > 1$ is the guidance scale — higher $s$ produces outputs more tightly aligned with the text prompt but less diverse.
