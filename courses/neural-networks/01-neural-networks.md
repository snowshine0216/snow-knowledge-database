---
tags: [neural-networks, deep-learning, math, 3blue1brown, activation-functions, function-approximation]
source: https://www.youtube.com/watch?v=aircAruvnKk
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. Why can't you just stack multiple linear layers in a neural network without any activation function — what goes wrong mathematically?
2. If a neural network takes a 28×28 grayscale image as input, how many input neurons does it need, and why?
3. What role does the "bias" term play in a neuron's computation — what would change if you removed it?

---

# But what is a Neural Network?

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/neural-networks
- Video: https://www.youtube.com/watch?v=aircAruvnKk
- Date: 2017-10-05

## Outline
1. [Motivating Example — Digit Recognition](#motivating-example)
2. [Neuron Model](#neuron-model)
3. [Network Architecture](#network-architecture)
4. [Activation Functions](#activation-functions)
5. [Matrix Form of the Forward Pass](#matrix-form)
6. [The Learning Problem](#the-learning-problem)

---

## Motivating Example — Digit Recognition

The running example is a handwritten-digit classifier trained on MNIST:

- **Input**: a 28 × 28 grayscale image → flattened to a vector of **784 pixel values** in [0, 1]
- **Output**: a vector of **10 scores**, one per digit class (0–9)

The hope is that the network learns, purely from labeled examples, to map raw pixels to the correct digit without any hand-engineered feature extraction.

---

## Neuron Model

A single neuron computes a **weighted sum** of its inputs, adds a **bias**, and passes the result through a nonlinear **activation function**:

$$z = w_1 a_1 + w_2 a_2 + \cdots + w_n a_n + b = \mathbf{w}^\top \mathbf{a} + b$$

$$a' = \sigma(z)$$

- $\mathbf{w}$: weight vector (one weight per incoming connection)
- $b$: bias scalar (shifts the activation threshold)
- $\sigma$: nonlinear activation (sigmoid, ReLU, etc.)
- $a'$: the neuron's output activation, fed as input to the next layer

The bias $b$ lets the neuron fire even if no input is active, or stay off even if inputs are large — it controls the *threshold* independently from the weights.

---

## Network Architecture

Neurons are grouped into **layers**:

| Layer | Size | Role |
|-------|------|------|
| Input | 784 | One neuron per pixel |
| Hidden 1 | 16 | Detects low-level patterns (edges, curves) |
| Hidden 2 | 16 | Combines patterns into higher-level shapes |
| Output | 10 | One neuron per digit class |

The key architectural insight is **hierarchical composition**: later layers can represent increasingly abstract features by combining the activations of earlier layers.

Information flows strictly forward (left to right) — this is called a **feedforward** or **fully-connected** network.

---

## Activation Functions

The nonlinearity $\sigma$ is essential. Without it, composing linear layers would still produce only a linear function of the input.

**Sigmoid** (used in the original 3B1B video):

$$\sigma(x) = \frac{1}{1 + e^{-x}}$$

- Output always in $(0, 1)$ — maps any real number to a "probability-like" activation
- Saturates at 0 and 1, causing **vanishing gradient** problems in deep networks

**ReLU** (more common in modern practice):

$$\text{ReLU}(x) = \max(0, x)$$

- Simple, non-saturating for positive values
- Sparse activations: neurons are either "on" or "off"

---

## Matrix Form of the Forward Pass

Computing activations one neuron at a time is slow. The entire layer can be vectorized:

$$\mathbf{a}^{(l)} = \sigma\!\left(\mathbf{W}^{(l)}\,\mathbf{a}^{(l-1)} + \mathbf{b}^{(l)}\right)$$

where:
- $\mathbf{W}^{(l)} \in \mathbb{R}^{n_l \times n_{l-1}}$: weight matrix for layer $l$ (row $i$ = weights into neuron $i$)
- $\mathbf{b}^{(l)} \in \mathbb{R}^{n_l}$: bias vector for layer $l$
- $\sigma$ applied element-wise
- $\mathbf{a}^{(0)} = \mathbf{x}$: the input vector

The full network is a composition of $L$ such operations:

$$f(\mathbf{x}) = \mathbf{a}^{(L)} = \sigma\!\left(\mathbf{W}^{(L)}\cdots\sigma\!\left(\mathbf{W}^{(1)}\mathbf{x} + \mathbf{b}^{(1)}\right)\cdots + \mathbf{b}^{(L)}\right)$$

---

## The Learning Problem

A network with 784 inputs, two hidden layers of 16, and 10 outputs contains:

$$784 \times 16 + 16 + 16 \times 16 + 16 + 16 \times 10 + 10 = \textbf{13,002 parameters}$$

The **central question**: how do we automatically find values for all these weights and biases such that the network correctly classifies unseen digits?

The answer — minimizing a cost function via gradient descent — is the subject of Chapter 2.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words what the bias term `b` does in the neuron formula `z = w·a + b`, and why it's necessary independent of the weights.
2. Walk through the matrix form of the forward pass `a^(l) = σ(W^(l) a^(l-1) + b^(l))` — what does each symbol represent, and why is this vectorized form preferred?
3. Compare sigmoid and ReLU as activation functions: what does each output, and what specific problem does ReLU address that sigmoid cannot?

<details>
<summary>Answer Guide</summary>

1. The bias `b` shifts the activation threshold independently of the input weights — it lets a neuron fire even when all inputs are zero, or stay inactive even when inputs are large, giving each neuron its own independently adjustable trigger point.
2. `W^(l)` is the weight matrix (rows = neurons in layer l, columns = neurons in layer l−1), `b^(l)` is the bias vector, `a^(l-1)` is the previous layer's activations, and `σ` is applied element-wise; vectorization replaces a slow neuron-by-neuron loop with a single matrix multiply.
3. Sigmoid squashes any real input to (0,1) but saturates near 0 and 1, causing vanishing gradients in deep networks; ReLU outputs `max(0,x)`, which is non-saturating for positive values and produces sparse (on/off) activations, making it more practical in modern deep networks.

</details>
