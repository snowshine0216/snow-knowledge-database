---
tags: [neural-networks, deep-learning, 3blue1brown, backpropagation, gradient-descent, transformers, attention, diffusion]
source: https://www.3blue1brown.com/topics/neural-networks
---

# 3Blue1Brown Deep Learning Series

This article consolidates the 10-chapter video series by Grant Sanderson (3Blue1Brown) on neural networks and deep learning. The series progresses from basic neuron mechanics through modern architectures like [[transformers]] and [[diffusion models]], with a strong emphasis on mathematical intuition and visual explanation.

## Foundations: Neurons, Layers, and Forward Passes

A neural network is a composition of layers, where each layer applies a linear transformation followed by a nonlinear [[activation function]]. A single neuron computes a weighted sum of its inputs plus a bias, then passes the result through an activation such as sigmoid or ReLU:

$$a' = \sigma(\mathbf{w}^\top \mathbf{a} + b)$$

In matrix form, a full layer computes $\mathbf{a}^{(l)} = \sigma(\mathbf{W}^{(l)} \mathbf{a}^{(l-1)} + \mathbf{b}^{(l)})$. The series uses MNIST digit classification (784 inputs, two hidden layers of 16, 10 outputs) as the running example, illustrating how hierarchical composition lets later layers detect increasingly abstract features from raw pixels.

## Gradient Descent and the Cost Function

Training means finding parameter values that minimize a cost function measuring how wrong the network's predictions are. The cost landscape lives in a space with one dimension per parameter. [[Gradient descent]] follows the negative gradient to iteratively reduce cost:

$$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \eta \nabla C$$

Mini-batch stochastic gradient descent speeds this up by computing approximate gradients on small random subsets of the training data rather than the full dataset.

## Backpropagation

[[Backpropagation]] is the algorithm that efficiently computes the gradient of the cost with respect to every parameter in one backward pass. The core mechanism is the chain rule: each weight's gradient is a product of local sensitivities along the path from that weight to the cost. An error signal $\delta$ propagates backward through layers, where each neuron's error depends on a weighted sum of errors from the next layer, modulated by the local activation derivative. This gives $O(N)$ total cost for $N$ parameters, compared to the naive $O(N^2)$ of finite differences.

## From Neural Networks to Language Models

The series bridges classical networks to modern LLMs by framing a language model as a function mapping token sequences to probability distributions over the next token. Key components covered include:

- **Tokenization**: splitting text into sub-word units rather than characters or whole words
- **Token embeddings**: mapping each token to a dense vector in a high-dimensional space
- **Positional encoding**: injecting sequence-order information since the architecture processes all positions in parallel
- **Autoregressive generation**: repeatedly sampling from the predicted distribution and appending the result to the context

## Attention and Transformers

The [[attention]] mechanism is the core innovation enabling context-dependent representations. Each token produces three vectors via learned projections: a query ("what am I looking for?"), a key ("what do I contain?"), and a value ("what will I contribute?"). The scaled dot-product attention formula computes:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right) V$$

Causal masking prevents tokens from attending to future positions during autoregressive generation. Multi-head attention runs several attention functions in parallel, each specializing in different relationship types (syntactic, semantic, etc.), then concatenates and projects the results.

## MLP Blocks and Fact Storage

Between attention layers, MLP (feed-forward) blocks process each token independently. The series explores how these blocks may store factual knowledge, discusses activation functions like GELU, and introduces the superposition hypothesis: networks may encode more features than they have neurons by using overlapping directions in activation space, making interpretability fundamentally challenging.

## Diffusion Models

The final chapter extends beyond language to image generation. Diffusion models learn by first corrupting images with progressive Gaussian noise (forward process), then training a denoising network to reverse the corruption step by step. Text conditioning via CLIP embeddings enables text-to-image generation. The key insight is that learning to denoise is far easier than directly modeling the full data distribution.

## Series Value

The 3Blue1Brown series excels at building geometric and algebraic intuition for deep learning. It traces a clear arc from "what is a neuron" through "how do modern LLMs and image generators actually work," making the mathematical foundations accessible without sacrificing rigor. The visual approach to concepts like gradient landscapes, backpropagation flow, and attention patterns provides mental models that complement more implementation-focused resources.
