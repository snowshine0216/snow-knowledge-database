---
tags: [statquest, neural-networks, backpropagation, gradient-descent, optimization, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What mathematical rule from calculus makes backpropagation possible, and why is it needed when a neural network has multiple layers?
2. In gradient descent, what does the learning rate control, and what goes wrong if it is set too high or too low?
3. During a forward pass, data flows input → hidden → output. In backpropagation, what direction does the error signal flow and what is being computed at each step?

---



---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words how the chain rule enables the network to compute gradients for weights in early layers, even though those weights are far from the loss function.
2. Describe the full training loop — forward pass, loss computation, backward pass, weight update — as if explaining it to someone who has never seen a neural network.
3. Why can't we simply set all weights to the same initial value, and how does this relate to the role backpropagation plays in breaking symmetry during learning?

> [!example]- Answer Guide
> 
> #### Q1 — Chain Rule and Early-Layer Gradients
> 
> The chain rule allows a gradient of the loss with respect to any weight to be expressed as a product of local gradients along the path from that weight to the output; backpropagation applies this iteratively layer by layer so deep weights receive a well-defined error signal without recomputing the entire network from scratch for each weight.
> >
> #### Q2 — Full Training Loop Explained
> >
> The forward pass feeds inputs through each layer to produce a prediction; the loss function measures how wrong that prediction is; the backward pass uses the chain rule to compute how much each weight contributed to the error; gradient descent then nudges every weight in the direction that reduces the loss by an amount scaled by the learning rate.
> >
> #### Q3 — Symmetry Breaking and Initialization
> >
> If all weights start equal, every neuron in a layer computes the same gradient and receives the same update, so they never specialize — backpropagation can only differentiate weights if they produce different outputs, meaning random initialization is necessary for the backward pass to push weights toward distinct, useful features.
