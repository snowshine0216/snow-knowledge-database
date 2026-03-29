---
tags: [neural-networks, deep-learning, math, 3blue1brown, backpropagation, gradient-descent]
source: https://www.youtube.com/watch?v=Ilg3gGewQ5U
---

# What is backpropagation really doing?

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/backpropagation
- Video: https://www.youtube.com/watch?v=Ilg3gGewQ5U
- Date: 2017-11-03

## Summary
- Frames backpropagation as the algorithm that computes how each parameter affects total error.
- Builds intuition with local sensitivities: how changing one bias/weight nudges activations and then cost.
- Uses chain-rule reasoning to propagate error signals backward from outputs to earlier layers.
- Explains why this avoids brute-force finite-difference checks over thousands of parameters.
- Places the result directly inside SGD: compute gradients, average over samples, update parameters, repeat.

## Key Ideas
- error signals
- chain rule
- local derivatives
- efficient gradient computation
- SGD training loop
