---
tags: [neural-networks, deep-learning, math, 3blue1brown, large-language-models, transformers]
source: https://www.youtube.com/watch?v=LPZh9BOjkQs
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. How does a large language model represent its output — does it produce a single next word, a score, or something else?
2. What do you think "temperature" controls in text generation, and what happens when you set it very low?
3. What is cross-entropy loss, and why might it be a natural training objective for a model that predicts the next word?

---

# Large Language Models Explained Briefly

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/mini-llm
- Video: https://www.youtube.com/watch?v=LPZh9BOjkQs
- Date: 2024-11-20

## Outline
1. [Language Model as a Function](#language-model-function)
2. [Tokenization](#tokenization)
3. [Autoregressive Generation Loop](#generation-loop)
4. [Training Objective](#training-objective)
5. [Temperature and Sampling](#temperature-sampling)

---

## Language Model as a Function

An LLM is a function that maps a sequence of tokens to a **probability distribution over the next token**:

$$P(\text{token}_{t} \mid \text{token}_1, \text{token}_2, \ldots, \text{token}_{t-1}; \boldsymbol{\theta})$$

- Input: all previous tokens (the context)
- Output: a probability vector over the entire vocabulary $V$
- $\boldsymbol{\theta}$: the billions of learned parameters

This is just a very large version of what Chapter 1 introduced: a parameterized function from inputs to outputs, trained by minimizing a cost.

---

## Tokenization

Raw text is not fed directly into the model. It is first split into **tokens** — sub-word units covering common character sequences:

- "Hello" → `["Hello"]`
- "backpropagation" → `["back", "prop", "ag", "ation"]` (approximate)

Each token is an integer index into a fixed vocabulary $V$ (e.g., $|V| = 50{,}257$ for GPT-2).

Tokenization is a deterministic, learned (or rule-based) preprocessing step — it is not part of the neural network itself.

---

## Autoregressive Generation Loop

To generate text, the model samples one token at a time and feeds it back as input:

```
context = [token_1, token_2, ..., token_t]
repeat:
    p = model(context)           # distribution over |V| next tokens
    token_{t+1} ~ p              # sample from distribution
    context.append(token_{t+1}) # extend context
    t += 1
```

This is called **autoregressive** generation: the model conditions on its own previous outputs.

The generation continues until a special end-of-sequence token is sampled, or a length limit is reached.

---

## Training Objective

Training uses **next-token prediction** on a large text corpus. For each position $t$ in a training sequence, the model predicts the next token given the preceding ones.

The loss is **cross-entropy** averaged over all positions:

$$\mathcal{L} = -\frac{1}{T} \sum_{t=1}^{T} \log P(\text{token}_t \mid \text{token}_1, \ldots, \text{token}_{t-1};\, \boldsymbol{\theta})$$

- Low loss ⟷ model assigns high probability to the actual next token
- High loss ⟷ model is surprised by the actual next token

Minimizing this cross-entropy over a large corpus pushes the model to internalize grammar, facts, reasoning patterns, and stylistic conventions found in the training data.

The **perplexity** metric, often used in language modeling, is the exponentiated average cross-entropy:

$$\text{Perplexity} = e^{\mathcal{L}}$$

Lower perplexity = better prediction.

---

## Temperature and Sampling

The model outputs raw **logits** $\mathbf{z} \in \mathbb{R}^{|V|}$ for each token position. These are converted to probabilities via **softmax**:

$$p_i = \frac{e^{z_i}}{\sum_{j} e^{z_j}}$$

**Temperature** $T$ controls the sharpness of this distribution:

$$p_i = \frac{e^{z_i / T}}{\sum_{j} e^{z_j / T}}$$

| Temperature | Effect |
|-------------|--------|
| $T \to 0$ | Greedy decoding: always pick the highest-probability token |
| $T = 1$ | Standard sampling from the model's distribution |
| $T > 1$ | Flatter distribution: more random, more creative |
| $T < 1$ | Sharper distribution: more conservative, more repetitive |

Randomness in sampling is not a bug — it produces more natural and varied text than always picking the argmax.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words what makes text generation "autoregressive" — trace the loop from a starting context to a third generated token.
2. What does the cross-entropy training loss actually measure, and what does it mean for perplexity to be "lower"?
3. Walk through what temperature does mathematically to the softmax distribution, and describe the practical effect of setting T → 0 versus T > 1.

<details>
<summary>Answer Guide</summary>

1. Autoregressive generation means the model produces a probability distribution over the vocabulary, samples one token from it, appends that token to the context, then repeats — each new token becomes part of the input for the next step, so the model always conditions on its own previous outputs.
2. Cross-entropy loss measures how surprised the model is by the actual next token: low loss means the model assigned high probability to the correct token, high loss means it was caught off-guard. Perplexity is $e^{\mathcal{L}}$, so lower perplexity directly means better next-token prediction on average.
3. Temperature divides each logit by $T$ before the softmax: as $T \to 0$ the highest logit dominates completely (greedy, repetitive output), while $T > 1$ flattens the distribution so lower-probability tokens get more chance, producing more varied and creative — but potentially less coherent — text.

</details>
