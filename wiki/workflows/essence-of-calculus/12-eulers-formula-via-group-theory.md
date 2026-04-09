---
tags: [calculus, math, 3blue1brown, euler, complex-numbers, group-theory]
source: https://www.3blue1brown.com/lessons/eulers-formula-via-group-theory
---

# Chapter 12: Euler's Formula (via Group-Theory View)

**Source:** [Essence of Calculus – Euler's formula via group theory](https://www.3blue1brown.com/lessons/eulers-formula-via-group-theory)

## Outline
- [Core Idea](#core-idea)
- [Key Concepts](#key-concepts)
- [The Group-Theory Path](#the-group-theory-path)
- [The Taylor Series Proof](#the-taylor-series-proof)
- [Rotation in the Complex Plane](#rotation-in-the-complex-plane)
- [Key Equations](#key-equations)
- [Connections](#connections)

## Core Idea

Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$ is often presented as a stunning coincidence that happens to work out when you plug $i\theta$ into the power series for $e^x$. But the deeper explanation is structural: the real numbers under addition and the unit circle under multiplication are both groups with the same abstract symmetry, and the exponential function is the unique continuous map that sends one to the other — a group homomorphism. Rotation and exponential growth are two manifestations of the same underlying symmetry.

The special case $\theta = \pi$ gives $e^{i\pi} = -1$, often called the most beautiful equation in mathematics because it links five fundamental constants. But the real payoff of Euler's formula is practical: it converts trig identities into algebra, makes Fourier analysis tractable, and unifies oscillation and exponential behavior into a single complex exponential.

## Key Concepts

- **Complex number**: $z = a + bi$ where $a$ (real part) and $b$ (imaginary part) are real numbers and $i^2 = -1$.
- **Complex multiplication**: $(a+bi)(c+di) = (ac-bd) + (ad+bc)i$; geometrically it multiplies magnitudes and adds angles.
- **Unit circle**: the set $\{e^{i\theta} : \theta \in \mathbb{R}\}$ — all complex numbers of modulus 1.
- **Group**: a set with an operation satisfying closure, associativity, identity, and inverses. Real numbers under $+$ and the unit circle under $\times$ are both groups.
- **Homomorphism**: a structure-preserving map between groups; $e^{i\theta}$ maps $(\mathbb{R}, +) \to (S^1, \times)$ by sending $\theta_1 + \theta_2 \mapsto e^{i\theta_1} \cdot e^{i\theta_2}$.
- **Modulus** $|z|$: the distance from the origin, $|a+bi| = \sqrt{a^2+b^2}$; for $e^{i\theta}$, the modulus is always 1.

## The Group-Theory Path

Consider two groups:

1. $(\mathbb{R}, +)$: the real numbers under addition. The "symmetries" here are translations — sliding the number line left or right.
2. $(S^1, \times)$: the unit circle in the complex plane under multiplication. The "symmetries" here are rotations — spinning the plane around the origin.

A **homomorphism** from the first group to the second is a continuous function $\phi: \mathbb{R} \to S^1$ satisfying:

$$
\phi(\theta_1 + \theta_2) = \phi(\theta_1) \cdot \phi(\theta_2)
$$

This says: "adding angles in $\mathbb{R}$ should correspond to composing rotations in $S^1$." The function $e^{i\theta}$ is precisely such a homomorphism. It is, up to a choice of speed, the unique continuous homomorphism from $(\mathbb{R}, +)$ to $(S^1, \times)$. This uniqueness is what makes Euler's formula inevitable rather than accidental — any reasonable continuous map translating addition into multiplication on the unit circle must be some $e^{i\alpha\theta}$.

The homomorphism property is the familiar exponential law rewritten:

$$
e^{i(\alpha+\beta)} = e^{i\alpha} \cdot e^{i\beta}
$$

## The Taylor Series Proof

The most direct derivation of $e^{i\theta} = \cos\theta + i\sin\theta$ uses the Maclaurin series from Chapter 11. Substitute $x = i\theta$ into $e^x = \sum_{n=0}^{\infty} x^n/n!$:

$$
e^{i\theta} = \sum_{n=0}^{\infty}\frac{(i\theta)^n}{n!} = 1 + i\theta + \frac{(i\theta)^2}{2!} + \frac{(i\theta)^3}{3!} + \frac{(i\theta)^4}{4!} + \cdots
$$

Use the pattern of powers of $i$: $i^0=1,\; i^1=i,\; i^2=-1,\; i^3=-i,\; i^4=1,\;\ldots$ (cycle of length 4):

$$
e^{i\theta} = \underbrace{\left(1 - \frac{\theta^2}{2!} + \frac{\theta^4}{4!} - \cdots\right)}_{\cos\theta} + i\underbrace{\left(\theta - \frac{\theta^3}{3!} + \frac{\theta^5}{5!} - \cdots\right)}_{\sin\theta}
$$

The real part collects even powers with alternating signs — exactly the series for $\cos\theta$. The imaginary part collects odd powers with alternating signs — exactly the series for $\sin\theta$. Therefore:

$$
e^{i\theta} = \cos\theta + i\sin\theta
$$

## Rotation in the Complex Plane

The geometric content of Euler's formula is that $e^{i\theta}$ is the complex number at angle $\theta$ on the unit circle:
- Real part: $\cos\theta$ (horizontal coordinate)
- Imaginary part: $\sin\theta$ (vertical coordinate)
- Modulus: $|e^{i\theta}| = \sqrt{\cos^2\theta + \sin^2\theta} = 1$ — stays on the unit circle, no scaling

Multiplying any complex number $z$ by $e^{i\theta}$ **rotates** $z$ by $\theta$ without changing its magnitude:

$$
z \cdot e^{i\theta} \quad \text{rotates } z \text{ by angle } \theta
$$

At $\theta = \pi$, the point has traveled half of the unit circle from $1 + 0i$ to $-1 + 0i$:

$$
e^{i\pi} = \cos\pi + i\sin\pi = -1 + 0i = -1
$$

Rearranged: $e^{i\pi} + 1 = 0$ — a single equation connecting $e$, $i$, $\pi$, $1$, and $0$.

More generally, any complex number $z = r e^{i\phi}$ in polar form is multiplied and rotated by $w = \rho e^{i\psi}$ as:

$$
z \cdot w = r\rho\, e^{i(\phi+\psi)}
$$

Magnitudes multiply; angles add. This is why complex exponentials are the natural language for oscillations, waves, and Fourier analysis.

## Key Equations

| Equation | Description |
|---|---|
| $$e^{i\theta}=\cos\theta+i\sin\theta$$ | Euler's formula: complex exponential on the unit circle |
| $$e^{i\pi}=-1$$ | The special case $\theta=\pi$: half a circle from 1 |
| $$e^{i(\alpha+\beta)}=e^{i\alpha}\cdot e^{i\beta}$$ | Homomorphism property: addition maps to multiplication |
| $$\phi(\theta_1+\theta_2)=\phi(\theta_1)\cdot\phi(\theta_2)$$ | Abstract group homomorphism $(\mathbb{R},+)\to(S^1,\times)$ |
| $$\lvert e^{i\theta}\rvert = 1$$ | Unit modulus: rotation without scaling |
| $$z\cdot e^{i\theta} \text{ rotates } z \text{ by } \theta$$ | Geometric action of $e^{i\theta}$ on any complex number |
| $$e^{i\theta}=\sum_{n=0}^{\infty}\frac{(i\theta)^n}{n!}$$ | Taylor series derivation of Euler's formula |
| $$z\cdot w = r\rho\,e^{i(\phi+\psi)}$$ | Polar multiplication: magnitudes multiply, angles add |

## Connections

- **Previous:** Ch 11 (Taylor Series) provided the Maclaurin expansions for $e^x$, $\sin x$, and $\cos x$ that make the Taylor-series proof of Euler's formula possible; the formula is the payoff of that machinery.
- **Earlier:** Ch 5 (What is $e$?) established why $e$ is the natural base for exponentials — its defining property that $\frac{d}{dx}e^x = e^x$ is what ensures the Taylor series of $e^x$ has the clean form used here. Euler's formula is the culmination of that thread.
- This is the final chapter of the series. The arc from Chapter 1 (the essence of calculus as limits and infinitesimals) through derivatives, integrals, the Fundamental Theorem, and Taylor series all converge here in a single equation that unifies the exponential and trigonometric worlds.
