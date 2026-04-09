---
tags: [neural-networks, deep-learning, math, 3blue1brown, interpretability, model-analysis]
source: https://www.3blue1brown.com/lessons/neural-network-analysis
---

# Analyzing our Neural Network

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/neural-network-analysis
- Video: N/A on page
- Date: 2017-10-16

## Outline
1. [Testing a Trained Network](wiki/concepts/neural-networks/03-neural-network-analysis.md#testing)
2. [MNIST Accuracy and Performance Metrics](wiki/concepts/neural-networks/03-neural-network-analysis.md#accuracy)
3. [Inspecting Hidden Neurons](wiki/concepts/neural-networks/03-neural-network-analysis.md#hidden-neurons)
4. [Failure Modes and Ambiguous Inputs](wiki/concepts/neural-networks/03-neural-network-analysis.md#failure-modes)
5. [Empirical Probing](wiki/concepts/neural-networks/03-neural-network-analysis.md#empirical-probing)
6. [Bridge to Gradient Computation](wiki/concepts/neural-networks/03-neural-network-analysis.md#bridge)

---

## Testing a Trained Network

After gradient descent converges, we freeze the parameters and run the network on held-out **test data** — examples never seen during training.

This measures **generalization**: does the network learn structure in the data, or just memorize training examples?

---

## MNIST Accuracy and Performance Metrics

**Classification accuracy** on the test set:

$$\text{Accuracy} = \frac{\text{Number of correct predictions}}{\text{Total test examples}}$$

A small two-hidden-layer network (16 neurons each) trained on MNIST reaches roughly **96–98% accuracy** on the 10,000-test-set images.

**Confidence** from the output layer: after applying softmax (see Chapter 5/7), output neuron $k$ gives $p_k \in (0, 1)$ where:

$$\sum_{k=0}^{9} p_k = 1$$

- High $p_k$ on the correct class = confident and correct
- High $p_k$ on the wrong class = confident and wrong (interesting failure)
- Spread across multiple classes = uncertain

---

## Inspecting Hidden Neurons

Examining what patterns maximize each hidden neuron's activation reveals what the network has learned.

**Theoretical expectation**: neurons should resemble classic edge detectors or curve detectors — the kinds of features humans would hand-engineer.

**Empirical reality**: many hidden neurons learn patterns that are:
- Distributed across multiple pixels in non-obvious ways
- Hard to interpret as clean visual features
- Sensitive to global structure rather than local edges

This is a recurring theme in deep learning: the features learned are **not always human-interpretable**, even when the network performs well.

---

## Failure Modes and Ambiguous Inputs

The network makes mistakes on:

1. **Genuinely ambiguous digits** — humans also disagree (e.g., "is this a 1 or a 7?")
2. **Poorly written digits** — deformed strokes, unusual styles
3. **Adversarial-like examples** — random noise images that activate output neurons strongly

A key sanity check: when the network is wrong, does the *second*-highest output match what a human might think the digit looks like?

---

## Empirical Probing

A useful debugging technique: **directly manipulate activations** at intermediate layers and observe the output behavior.

- Clamp a hidden neuron to a fixed activation value → see what changes in the output
- Zero out all neurons except one in a layer → see what pattern it contributes
- Feed in interpolated or synthetic inputs to find decision boundaries

This kind of probing builds intuition without access to the full mathematical derivation.

---

## Bridge to Gradient Computation

Understanding *why* the network makes errors motivates the need to compute **precise gradients**:

- We want to know not just that the cost is high, but *which* parameters are most responsible
- The gradient $\frac{\partial C}{\partial w_{ij}}$ tells us exactly how changing weight $w_{ij}$ would affect the total cost
- Computing these gradients for all 13,002 parameters simultaneously — without brute-force finite differences — is what backpropagation accomplishes

**Finite difference approximation** (too slow for practice):

$$\frac{\partial C}{\partial w_{ij}} \approx \frac{C(\ldots, w_{ij} + \epsilon, \ldots) - C(\ldots, w_{ij} - \epsilon, \ldots)}{2\epsilon}$$

This requires two full forward passes per parameter → $2 \times 13{,}002$ forward passes per gradient step. Backpropagation computes all gradients in just **two** passes (one forward, one backward).
