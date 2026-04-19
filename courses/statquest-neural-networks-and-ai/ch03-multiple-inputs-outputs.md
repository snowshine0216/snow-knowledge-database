---
tags: [statquest, neural-networks, multi-input, multi-output, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. When a neural network has multiple input features (e.g., age, weight, height), how do you think each input connects to the first hidden layer — does each neuron receive one input or all inputs?
2. If a neural network needs to predict multiple outputs simultaneously (e.g., cat probability AND dog probability), how do you think the output layer is structured differently from a single-output network?
3. What do you think happens to the number of weight parameters when you add a second input feature to a network that already has one input connected to 3 hidden neurons?

---



---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words how weights are organized when multiple input features feed into a hidden layer — what determines the total number of connections?
2. Describe how a multi-output neural network differs architecturally from a single-output network, and explain what each output node represents.
3. Explain why adding more inputs or outputs increases model complexity, and what risk this introduces during training.

> [!example]- Answer Guide
> #### Q1 — Multiple Input Feature Weight Connections
> Each input feature connects to every neuron in the first hidden layer via its own weight, so total connections = number of inputs × number of hidden neurons; this forms a fully connected (dense) layer.
> 
> #### Q2 — Multi-Output Network Architecture
> A multi-output network has multiple nodes in the output layer, one per target class or value; each output node has its own set of weights connecting back through the network.
> 
> #### Q3 — Inputs, Outputs, and Overfitting Risk
> More inputs/outputs multiply the parameter count, increasing the model's capacity but also its risk of overfitting — especially when training data is limited relative to the number of weights.
