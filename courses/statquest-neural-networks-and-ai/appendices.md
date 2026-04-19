---
tags: [statquest, math, calculus, derivatives, chain-rule, linear-algebra, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What does the chain rule tell you, and why is it essential when differentiating a function like f(g(x))?
2. In linear algebra, what does it mean to multiply two matrices — what must be true about their dimensions, and what does each output cell represent?
3. In the context of neural networks, why do we compute derivatives (gradients) at all — what problem are we trying to solve with them?

---

The plan is to write a new file at `courses/statquest-neural-networks-and-ai/appendices-math-foundations.md` covering all seven appendices (A–G) in the user-specified format with LaTeX equations and proper frontmatter. Ready to proceed.

---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain the chain rule in your own words and describe the step-by-step process of applying it to a composed function — as if teaching someone who has never seen it.
2. Describe how partial derivatives differ from ordinary derivatives, and explain why partial derivatives appear in backpropagation through a multi-input neural network.
3. Explain how matrix multiplication connects to the forward pass of a neural network — what do the matrices represent, and why does the order of multiplication matter?

> [!example]- Answer Guide
> #### Q1 — Chain Rule Step-by-Step
> 
> The chain rule states that the derivative of a composed function f(g(x)) equals f′(g(x)) · g′(x); you differentiate the outer function (leaving the inner intact) then multiply by the derivative of the inner function. In backpropagation this allows gradients to flow layer-by-layer by multiplying local derivatives along the computation graph.
> 
> #### Q2 — Partial Derivatives in Backpropagation
> 
> A partial derivative measures how a function changes with respect to one variable while holding all others constant; in a neural network each weight influences the loss through multiple paths, so partial derivatives isolate each weight's contribution and are summed (via the chain rule) to give the full gradient used in gradient descent.
> 
> #### Q3 — Matrix Multiplication Forward Pass
> 
> In the forward pass, inputs and weights are arranged as matrices so a single matrix multiply computes all weighted sums simultaneously; matrix dimensions must align (inner dimensions must match), and order matters because AB ≠ BA in general — swapping the order changes which inputs are weighted by which weights.
