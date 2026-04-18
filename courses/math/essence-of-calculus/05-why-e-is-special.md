---
tags: [calculus, math, 3blue1brown, derivative, exponential, euler-number]
source: https://www.3blue1brown.com/lessons/eulers-number
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What is Euler's number $e$ approximately equal to, and why do you think it might appear in compound interest calculations?
2. If you differentiate $2^x$, do you expect to get $2^x$ back exactly, or something different? What might that "something different" be?
3. What does the natural logarithm $\ln x$ mean, and what would you guess its derivative to be?

---

# Chapter 5: Why Euler's Number e Is Special

**Source:** [Essence of Calculus – Euler's Number](https://www.3blue1brown.com/lessons/eulers-number)

## Outline
- [Core Idea](#core-idea)
- [The Derivative of Any Exponential](#the-derivative-of-any-exponential)
- [The Path to e via Compound Interest](#the-path-to-e-via-compound-interest)
- [The Natural Logarithm](#the-natural-logarithm)
- [Chain Rule with Exponentials](#chain-rule-with-exponentials)
- [Key Equations](#key-equations)
- [Connections](#connections)

## Core Idea

Every exponential function $a^x$ has the remarkable property that its derivative is proportional to itself — the rate of growth at any moment is a constant multiple of the current value. That constant multiplier turns out to be $\ln a$. Among all possible bases, there is exactly one base $e \approx 2.71828$ for which that multiplier equals $1$, meaning $\frac{d}{dx}e^x = e^x$. The function is its own derivative.

This makes $e$ the "natural" base for calculus. Whenever continuous, self-referential growth appears — compound interest pushed to the limit, population dynamics, radioactive decay — $e$ arises automatically. It is not an arbitrary constant but the inevitable answer to the question: "which base grows at a rate exactly equal to its own size?"

## The Derivative of Any Exponential

To differentiate $a^x$, write out the limit definition:

$$\frac{d}{dx}a^x = \lim_{h \to 0}\frac{a^{x+h} - a^x}{h} = a^x \cdot \lim_{h \to 0}\frac{a^h - 1}{h}$$

The factor $a^x$ pulls out cleanly. The remaining limit $\lim_{h \to 0}\frac{a^h - 1}{h}$ depends only on the base $a$, not on $x$. Call this constant $C(a)$. So:

$$\frac{d}{dx}a^x = C(a)\cdot a^x$$

This constant $C(a)$ is exactly $\ln a$ — the natural logarithm of the base. We can verify: since $a^x = e^{x \ln a}$, the chain rule gives $\frac{d}{dx}e^{x\ln a} = (\ln a)\,e^{x\ln a} = (\ln a)\,a^x$, consistent with the limit.

$$\frac{d}{dx}a^x = (\ln a)\,a^x$$

Euler's number $e$ is defined as the unique base where $C(e) = 1$, i.e., $\lim_{h \to 0}\frac{e^h - 1}{h} = 1$.

## The Path to e via Compound Interest

Consider $\$1$ invested at 100% annual interest. If compounded once per year the balance after one year is $2$. If compounded $n$ times per year each period adds $\frac{1}{n}$ of the current balance, so after one year:

$$\text{Balance} = \left(1 + \frac{1}{n}\right)^n$$

As the compounding frequency grows without bound — hourly, by the second, continuously — this expression approaches a limit:

$$e = \lim_{n\to\infty}\left(1+\frac{1}{n}\right)^n \approx 2.71828\ldots$$

This is one of the most concrete definitions of $e$. Continuous compounding at 100% for one year exactly multiplies your principal by $e$. More generally, continuous compounding at rate $r$ for time $t$ multiplies by $e^{rt}$.

An equivalent limit that connects to the derivative definition is:

$$e = \lim_{h \to 0}(1 + h)^{1/h}$$

## The Natural Logarithm

The natural logarithm $\ln x$ is the inverse of $e^x$: if $e^y = x$ then $y = \ln x$. Its derivative follows from implicit differentiation of $e^y = x$:

$$\frac{d}{dy}e^y = e^y \cdot \frac{dy}{dx} = 1 \implies \frac{dy}{dx} = \frac{1}{e^y} = \frac{1}{x}$$

$$\frac{d}{dx}\ln x = \frac{1}{x}$$

This result is why $\ln$ is indispensable in integration: $\int \frac{1}{x}\,dx = \ln|x| + C$. No other elementary function has this derivative, so $\ln$ fills a genuine gap.

The natural log also lets us convert any base: $a^x = e^{x \ln a}$. This is the algebraic identity behind the derivative formula $\frac{d}{dx}a^x = (\ln a)a^x$.

## Chain Rule with Exponentials

The chain rule combines with $e^x$ cleanly. If $g(x)$ is any differentiable function:

$$\frac{d}{dx}e^{g(x)} = e^{g(x)}\cdot g'(x)$$

The outer function $e^u$ differentiates to itself, and $g'(x)$ comes along as the inner derivative. For example:

$$\frac{d}{dx}e^{3x^2} = e^{3x^2}\cdot 6x$$

The same pattern applies to general bases. Rewrite $a^{g(x)} = e^{g(x)\ln a}$, then:

$$\frac{d}{dx}a^{g(x)} = (\ln a)\,a^{g(x)}\cdot g'(x)$$

## Key Equations

| Equation | Description |
|---|---|
| $$\dfrac{d}{dx}a^x = (\ln a)\,a^x$$ | Derivative of any exponential; the scaling constant is $\ln a$ |
| $$\dfrac{d}{dx}e^x = e^x$$ | $e^x$ is its own derivative — the defining property of $e$ |
| $$e = \lim_{n\to\infty}\!\left(1+\dfrac{1}{n}\right)^n$$ | Compound-interest limit definition of $e$ |
| $$\lim_{h\to 0}\frac{e^h - 1}{h} = 1$$ | Derivative definition: $e$ is the base where the proportionality constant equals 1 |
| $$e = \lim_{h\to 0}(1+h)^{1/h}$$ | Equivalent limit form of the definition of $e$ |
| $$\dfrac{d}{dx}\ln x = \dfrac{1}{x}$$ | Derivative of the natural log, derived via implicit differentiation |
| $$\dfrac{d}{dx}e^{g(x)} = e^{g(x)}\cdot g'(x)$$ | Chain rule applied to the natural exponential |

## Connections

- **Previous:** Ch 4 (Chain Rule and Product Rule) introduced the chain rule machinery needed to differentiate compositions — applied here to $e^{g(x)}$ and $a^x = e^{x\ln a}$.
- **Next:** Ch 6 (Implicit Differentiation) extends the idea of treating one variable as a function of another, using the same chain-rule reasoning that produced $\frac{d}{dx}\ln x$.


---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words why $\frac{d}{dx}a^x = (\ln a)\,a^x$ — walk through the limit definition argument that separates the $a^x$ factor from the constant $C(a)$.
2. Describe the compound interest path to $e$: what expression do you compute, what happens as compounding frequency increases, and what limit does it converge to?
3. How does implicit differentiation of $e^y = x$ yield $\frac{d}{dx}\ln x = \frac{1}{x}$? Trace each step of the reasoning.

<details>
<summary>Answer Guide</summary>

1. Writing the limit definition gives $\frac{d}{dx}a^x = a^x \cdot \lim_{h\to 0}\frac{a^h-1}{h}$; the $a^x$ factor pulls out cleanly, leaving a constant $C(a)$ that depends only on the base — and that constant turns out to equal $\ln a$.
2. Starting with $\$1$ at 100% interest compounded $n$ times per year yields $\left(1+\frac{1}{n}\right)^n$; as $n\to\infty$ this converges to $e \approx 2.71828$, the balance after one year of continuous compounding.
3. Differentiating both sides of $e^y = x$ gives $e^y \cdot \frac{dy}{dx} = 1$, so $\frac{dy}{dx} = \frac{1}{e^y} = \frac{1}{x}$, which is the derivative of $\ln x$.

</details>
