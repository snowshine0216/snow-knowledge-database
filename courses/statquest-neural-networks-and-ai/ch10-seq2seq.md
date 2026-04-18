---
tags: [statquest, seq2seq, encoder-decoder, nlp, language-translation, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. In a seq2seq model for language translation, what are the two main sub-networks, and what is the high-level job of each?
2. After the encoder processes the entire source sentence, it hands something off to the decoder. What is this intermediate representation typically called, and what does it contain?
3. What fundamental limitation do you expect a fixed-size intermediate representation to have when translating very long sentences?

---



---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Walk through the seq2seq forward pass for translating a sentence: what happens inside the encoder at each time step, and what state is passed to the decoder?
2. Explain in your own words why the context vector is described as a "bottleneck," and what information might be lost when compressing a long source sentence into it.
3. How does the decoder produce its output sequence token by token, and how does the output from one decoding step feed into the next?

<details>
<summary>Answer Guide</summary>

1. The encoder is an LSTM (or RNN) that processes source tokens one at a time; its final hidden state (and cell state) — the **context vector** — summarizes the entire source sequence and is passed as the initial state to the decoder.
2. The context vector is a fixed-size vector regardless of source length, so information from early tokens can be overwritten or diluted as the sequence grows — long sentences force too much meaning into too small a representation.
3. The decoder is also an LSTM initialized with the context vector; at each step it predicts the next target token, then feeds that token as the input to the following step (auto-regressive generation) until a stop token is produced.

</details>
