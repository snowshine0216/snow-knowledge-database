---
tags: [finetuning, peft, lora, qlora, quantization, model-merging, memory, chip-huyen, study-guide, quiz]
source: https://github.com/chiphuyen/aie-book
---

# Chapter 7 — Finetuning

> [!abstract]+ Chapter at a glance
> Finetuning is the **heaviest adaptation lever** — you change the model's **weights**. This chapter is about *when it's worth it* (finetuning vs. RAG vs. prompting), the **memory math** that makes full finetuning expensive, and the techniques that made it practical for normal teams: **PEFT** (especially **LoRA** and **QLoRA**), **quantization**, and **model merging**. The throughline: finetuning changes **behavior**, not knowledge, and you should exhaust cheaper levers first.

## Core concepts

**When to finetune (and when not to)**
- **Finetune when**: prompting has **plateaued**; you need **consistent format/style/behavior** that prompting won't reliably enforce; long few-shot prompts are too **costly/slow** and finetuning bakes the behavior in; you have a **narrow domain** where a smaller finetuned model beats a big general one; or you need to run a **smaller/cheaper** model at quality.
- **Don't finetune when**: you lack **high-quality training data** (finetuning amplifies bad data); the gap is **missing knowledge** that **RAG** can supply; you're **early in iteration** (finetuning locks in assumptions and is slow to change); or prompting/RAG already meets the bar.
- **Finetuning vs. RAG**: **RAG = add knowledge** (facts, freshness); **finetuning = change behavior** (format, tone, skill). Often **both**. Try prompt → RAG → finetune, escalating only when the cheaper lever plateaus.

**Memory bottlenecks (why full finetuning is expensive)**
- Training memory holds four things: **model weights**, **activations**, **gradients**, and **optimizer states**. With an optimizer like **Adam** (which stores momentum + variance), optimizer states alone can be ~2× the weights.
- **Rule of thumb**: full finetuning in fp32 needs on the order of **~16 bytes per parameter** (weights + gradients + Adam states) before activations — so a 7B model needs *well over a hundred GB* of GPU memory, far beyond a single consumer/workstation GPU.
- **Numerical formats**: **FP32** (full), **FP16 / BF16** (half — BF16 keeps FP32's exponent range, better for training stability), and lower. Lower precision → less memory and faster, with some accuracy risk.
- **Quantization** reduces the bits per number. Distinguish **inference quantization** (common, robust) from **training quantization** (harder — gradients are sensitive).

**PEFT — Parameter-Efficient Finetuning**
- Instead of updating **all** weights, update a **tiny fraction** → drastically less memory and compute. Two families:
  - **Partial finetuning** — train only some layers (e.g., the last few).
  - **Adapter-based** — insert small trainable modules; the big base stays frozen.
- **LoRA (Low-Rank Adaptation)** — the dominant adapter method:
  - **How**: freeze the original weight matrix **W**; learn a **low-rank** update **ΔW = B·A**, where **A** is (r × d), **B** is (d × r), and **rank r ≪ d**. You train only A and B — orders of magnitude fewer parameters (often ~**99% reduction** in trainable params).
  - **Why it's popular**: (1) **parameter/memory efficiency** — finetune large models on a single GPU; (2) **modularity** — adapters are small files you can **store, swap, and serve** many of on **one frozen base** (multi-tenant: one base model, N customer adapters).
  - **Serving LoRA** — merge the adapter into W at deploy time, or keep it separate and apply at run time (enables hot-swapping).
  - **QLoRA** — LoRA on top of a **quantized (e.g., 4-bit)** base model: cuts memory further so even larger models finetune on modest hardware, with little quality loss.

**Model merging and multi-task finetuning**
- **Model merging** combines multiple models/adapters into one **without extra training**, useful for **multi-task** models and **on-device** deployment (ship one model, many skills). Approaches:
  - **Summing / weight arithmetic** — linear interpolation or **task arithmetic** (add/subtract "task vectors"); **SLERP** for spherical interpolation. (Methods like **TIES** and **DARE** reduce interference when merging.)
  - **Layer stacking** — assemble layers from different models ("frankenmerging," MoE-style upcycling).
  - **Concatenation** — keep components side by side (e.g., multiple adapters).

**Finetuning tactics**
- **Choose the base model and method** — bigger base + PEFT vs. smaller base + more finetuning; match to data and budget.
- **Hyperparameters** that matter: **learning rate**, **batch size**, **number of epochs** (watch overfitting on small data), and **prompt-loss weight** (how much the prompt tokens contribute to the loss vs. the response tokens). Start from known-good recipes, then tune.

## Quiz

**1.** State the core heuristic for choosing between RAG and finetuning, and give a case where you'd use both.

> [!example]- Show answer
> **RAG adds knowledge; finetuning changes behavior.** If the model is missing **facts** (private, recent, long-tail), use **RAG** — you can update the index without retraining. If it won't reliably produce a **format/tone/skill** even with good prompts, **finetune** the weights. **Both together**: a customer-support assistant might be **finetuned** to always answer in your brand's tone and a strict JSON schema (behavior), while using **RAG** to pull the current product docs and the customer's account facts (knowledge). Behavior is baked in; knowledge stays fresh via retrieval.

**2.** Why does full finetuning need so much more memory than just storing the model? Name the four memory consumers.

> [!example]- Show answer
> Inference only needs the **weights** (and some activations). **Training** additionally needs: (1) **weights**, (2) **activations** (cached from the forward pass for backprop), (3) **gradients** (one per trainable parameter), and (4) **optimizer states** — and with **Adam** that's momentum *and* variance, roughly **2× the weights**. Summed (≈16 bytes/param in fp32 before activations), a 7B model needs well over 100 GB — many times the ~14–28 GB needed just to *hold* it. That gap is exactly what PEFT/LoRA collapses by making (3) and (4) tiny.

**3.** Explain how LoRA works mathematically and why it slashes trainable parameters.

> [!example]- Show answer
> LoRA **freezes** the original weight matrix **W (d×d)** and learns its update as a **low-rank factorization**: **ΔW = B·A**, where **A** is (r × d) and **B** is (d × r) with **rank r ≪ d**. The effective weight becomes **W + B·A**. Instead of training d² parameters, you train only **2·r·d** — for r=16 and d=4096 that's a tiny fraction (~99% fewer trainable params). The insight is that the *update* needed to adapt a model has **low intrinsic rank**, so you don't need a full-rank ΔW. Fewer trainable params → far less gradient + optimizer-state memory, which is the dominant cost.

**4.** What are the two big advantages of LoRA, and why does the second matter for serving many customers?

> [!example]- Show answer
> (1) **Parameter/memory efficiency** — you can finetune a large model on a **single GPU** because gradients/optimizer states only cover the small A,B matrices. (2) **Modularity** — a LoRA adapter is a **small file** layered on a **frozen base**, so you can store **many** adapters and **swap** them at serve time. This matters for **multi-tenant serving**: keep **one** base model in GPU memory and apply a **different customer's adapter per request** (or hot-swap), instead of hosting N full finetuned models. One base, N adapters = huge cost savings for per-customer customization.

**5.** What is QLoRA and what problem does it solve?

> [!example]- Show answer
> **QLoRA** = LoRA applied on top of a **quantized base model** (e.g., the frozen base in **4-bit**), while the small LoRA adapters train in higher precision. It solves the remaining **memory bottleneck**: even with LoRA, holding a large base model in fp16 is heavy. Quantizing the frozen base to 4-bit shrinks that footprint ~4×, letting you finetune **much larger models on modest hardware** (e.g., a single consumer GPU) with **minimal quality loss**. It combines two memory wins — low-rank updates (LoRA) and low-precision weights (quantization).

**6.** Distinguish quantization for **inference** vs. for **training**. Why is one harder?

> [!example]- Show answer
> **Inference quantization** reduces precision of the **weights (and activations)** for a *fixed, trained* model to save memory/speed — robust and widely used (int8/int4 with methods like GPTQ/AWQ). **Training quantization** reduces precision **during finetuning**, which is **harder** because **gradients are sensitive to precision** — small numerical errors accumulate and destabilize optimization. QLoRA threads this needle by quantizing only the **frozen** base (no gradients flow into it) while training the adapters in higher precision. The general rule: low precision is safer for the static forward pass than for the gradient-bearing backward pass.

**7.** What is model merging and when is it useful?

> [!example]- Show answer
> **Model merging** combines multiple models or adapters into a single model **without additional training** — e.g., linear/**SLERP** interpolation of weights, **task arithmetic** (adding/subtracting task vectors), interference-reducing methods (**TIES/DARE**), or **layer stacking**. It's useful for building **multi-task** models (fold several specialized finetunes into one) and for **on-device deployment** (ship a single model with many skills rather than several models). It's cheap (no training run) but can cause **interference** between merged capabilities, which the smarter methods try to minimize.

**8.** Which hyperparameters does the chapter highlight for finetuning, and what's the risk with too many epochs on a small dataset?

> [!example]- Show answer
> Key hyperparameters: **learning rate**, **batch size**, **number of epochs**, and **prompt-loss weight** (how much prompt tokens vs. response tokens contribute to the loss). With a **small dataset**, too many **epochs** causes **overfitting** — the model memorizes the training examples and **loses generalization** (and can suffer catastrophic forgetting of base capabilities). The fix is to use fewer epochs, watch a validation set, and prefer **more/better data** over more passes over the same small data.

**9.** Give two situations where finetuning is the *wrong* choice.

> [!example]- Show answer
> (1) **The gap is missing knowledge** — e.g., the model needs your latest product docs or private records. Finetuning is a poor way to inject facts (slow to update, can hallucinate); **RAG** is the right tool. (2) **You lack high-quality data** — finetuning **amplifies** whatever's in the data, so a small/noisy dataset yields a worse, biased model. Also: (3) **early iteration** — finetuning **locks in assumptions** and is slow to revise; keep iterating with prompts/RAG until the requirements stabilize. Reach for finetuning only after cheaper levers plateau and you have clean data.

**10.** *(Applied)* You need a 7B model to (a) always reply in a strict JSON schema with your brand voice and (b) answer using your constantly-changing internal docs, on a budget with one GPU. Outline an approach.

> [!example]- Show answer
> Split by **behavior vs. knowledge**. **(a) Behavior** → **finetune** with **QLoRA**: train a LoRA adapter (4-bit frozen base) on a clean dataset of (input → JSON-schema, brand-voice response) examples, so the format/tone is **baked in** and reliable without long prompts. One GPU is enough thanks to QLoRA. **(b) Knowledge** → **RAG**: keep the internal docs in an index and retrieve relevant chunks at run time, so "constantly-changing" content is handled by **updating the index**, never retraining. **Serve** the frozen base + your LoRA adapter (swappable if you later add per-team voices). This uses the right lever for each gap, fits one GPU, and keeps knowledge fresh while behavior stays consistent.

## Deeper understanding (expansion)

> [!info]+ 💡 The lever ladder: prompt → RAG → finetune (cost and commitment rise together)
> The book's adaptation levers form a ladder ordered by **how much you change and how hard it is to undo**. **Prompting** changes the input — instant, free, fully reversible. **RAG** changes the context — cheap, and you update knowledge by editing an index. **Finetuning** changes the weights — expensive, needs clean data, and **locks in** assumptions you can only undo by retraining. The discipline is to **climb only when forced**: exhaust prompting, then RAG, and finetune when a *behavior* gap persists. Teams that jump straight to finetuning often pay for a slow, brittle solution to a problem a better prompt or retrieval step would have solved — and then can't iterate quickly because they've committed to weights.

> [!info]+ 💡 LoRA's real superpower is modularity, not just memory
> The headline is "finetune on one GPU," but the **architecturally** transformative property is **modularity**: an adapter is a tiny artifact on a frozen base. This flips the economics of customization. Pre-LoRA, "a model per customer/task" meant N full model copies — prohibitive to store and serve. With LoRA, it's **one base + N small adapters**, hot-swappable per request. That single property is what makes **multi-tenant fine-tuned serving**, rapid A/B testing of behaviors, and **merging** (Chapter 7's next section) practical. When you evaluate finetuning, weigh the *serving* story, not just the *training* cost — modularity is often the bigger win.

> [!info]+ 💡 "Finetuning amplifies your data" — the quality trap
> Finetuning doesn't add intelligence; it **redistributes** the model toward your data. So everything good *and bad* in that data gets amplified — biases, errors, formatting quirks, even subtle distribution skews. This is why the chapter is adamant that **lacking high-quality data is a reason NOT to finetune**, and it's the bridge to Chapter 8 (Dataset Engineering): the hard part of finetuning isn't the training run, it's **building a clean, diverse, correctly-formatted dataset**. A mediocre dataset finetuned perfectly yields a mediocre model with extra confidence. Invest your effort upstream, in the data.

## Connections

- **← Chapter 5–6**: finetune only after **prompting** and **RAG** plateau; RAG=knowledge, finetune=behavior.
- **← Chapter 2**: post-training (SFT/RLHF) is large-scale finetuning; this chapter is its practical, parameter-efficient cousin.
- **→ Chapter 8**: finetuning's success hinges on **dataset engineering** — quality, coverage, formatting.
- **→ Chapter 9**: quantization reappears as an **inference** optimization; LoRA serving overlaps with deployment.
- See also: [[chip-huyen-ai-engineering-book_3abc60d3]].
