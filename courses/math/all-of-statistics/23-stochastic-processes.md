---
tags: [stochastic-processes, markov-chains, poisson-process, stationary-distribution, chapman-kolmogorov, mcmc, wasserman, all-of-statistics, study-guide, quiz]
source: https://www.stat.cmu.edu/~larry/all-of-statistics/
---

# Chapter 23 — Probability Redux: Stochastic Processes

> [!abstract]+ Chapter at a glance
>
> A **stochastic process** is a collection of random variables $\{X_t : t \in T\}$ indexed by time (or space) — a way of modeling systems that evolve randomly. This chapter is a focused "redux" that returns to probability after the long inference middle of the book, equipping you with two workhorse models. The first is the **Markov chain**: a discrete-time, discrete-state process whose entire dynamics live in a single **transition matrix** $P$, because the future depends on the past only through the present (the *Markov property*). From $P$ you get everything — $n$-step transitions by matrix powers, a classification of states into recurrent vs. transient, and most importantly a **stationary distribution** $\pi$ satisfying $\pi = \pi P$ to which an irreducible aperiodic chain converges no matter where it starts. That convergence theorem is the theoretical engine of MCMC in Chapter 24: design a chain whose stationary distribution *is* the distribution you want to sample from. The second model is the **Poisson process**, the canonical continuous-time counting process, defined by independent stationary increments at rate $\lambda$, with Poisson counts and memoryless Exponential interarrival times.

## Core concepts

**Stochastic process.** A stochastic process is a family $\{X_t : t \in T\}$ of random variables on a common probability space, indexed by a set $T$. When $T = \{0, 1, 2, \dots\}$ the process is **discrete time**; when $T = [0, \infty)$ it is **continuous time**. The values $X_t$ take live in the **state space** $S$. A realization $t \mapsto X_t(\omega)$ for a fixed outcome $\omega$ is a **sample path**. The joint behavior of the process is captured by its finite-dimensional distributions, the laws of $(X_{t_1}, \dots, X_{t_k})$ for all finite index sets.

**Stationarity (intuition).** A process is (strictly) **stationary** if its statistical properties are invariant to shifts in time: the distribution of $(X_{t_1}, \dots, X_{t_k})$ equals that of $(X_{t_1+h}, \dots, X_{t_k+h})$ for every shift $h$. Intuitively, "the clock doesn't matter" — the process looks the same whether you start watching at time 0 or time 100. Stationarity is the time-series analogue of the i.i.d. assumption: it is what lets us pool observations across time to estimate a single underlying law.

**Markov property.** A discrete-time process on a discrete state space is a **Markov chain** if the future is conditionally independent of the past given the present:
$$
\mathbb{P}(X_{n+1} = j \mid X_0 = i_0, \dots, X_n = i) = \mathbb{P}(X_{n+1} = j \mid X_n = i).
$$
This "memorylessness" is the defining simplification: to predict tomorrow you need only know today, not the whole history. It is exactly what makes the chain tractable — all dynamics collapse into a single matrix of one-step probabilities.

**Transition matrix.** The one-step transition probabilities $P_{ij} = \mathbb{P}(X_{n+1} = j \mid X_n = i)$ form the **transition matrix** $P$. Two structural facts: every entry is nonnegative, and *every row sums to one* ($\sum_j P_{ij} = 1$), because from state $i$ the chain must go somewhere. Such a matrix is called **stochastic**. Together with the initial distribution $\mu_0$ (a row vector over $S$), $P$ determines the entire law of the chain.

**n-step transitions and Chapman–Kolmogorov.** The probability of moving from $i$ to $j$ in exactly $n$ steps, $P_{ij}(n) = \mathbb{P}(X_{n} = j \mid X_0 = i)$, is the $(i,j)$ entry of the matrix power $P^n$. This follows from the **Chapman–Kolmogorov equations**, which say that to go from $i$ to $j$ in $m+n$ steps you pass through some intermediate state $k$ at time $m$:
$$
P_{ij}(m+n) = \sum_{k} P_{ik}(m)\, P_{kj}(n), \qquad \text{i.e.} \qquad P^{m+n} = P^m P^n.
$$
The marginal distribution at time $n$ is then $\mu_n = \mu_0 P^n$.

**Classification of states.** A state $j$ is **recurrent** if the chain, started in $j$, returns to $j$ with probability 1; otherwise it is **transient** (positive probability of never returning, so it is visited only finitely often). A chain is **irreducible** if every state can be reached from every other state (the state space is one communicating class). State $i$ has **period** $d(i)$ equal to the gcd of the set of $n$ for which $P_{ii}(n) > 0$; if $d(i) = 1$ the state is **aperiodic**. A chain is aperiodic when all its states have period 1.

**Stationary / invariant distribution.** A distribution $\pi$ (a row vector with $\pi_j \ge 0$, $\sum_j \pi_j = 1$) is **stationary** (or invariant) if
$$
\pi = \pi P, \qquad \text{equivalently} \qquad \pi_j = \sum_i \pi_i P_{ij} \text{ for all } j.
$$
If the chain is started from $\pi$ it stays in $\pi$ for all time — it is a fixed point of the dynamics, a left eigenvector of $P$ with eigenvalue 1.

**Fundamental convergence theorem.** If a Markov chain is **irreducible and aperiodic** (and has a stationary distribution — automatic on a finite state space), then it has a *unique* stationary distribution $\pi$, and
$$
\lim_{n \to \infty} P_{ij}(n) = \pi_j \quad \text{for all } i, j,
$$
*regardless of the starting state*. Moreover $\pi_j$ equals the **long-run fraction of time** the chain spends in state $j$ (an ergodic / law-of-large-numbers statement for chains). The chain "forgets" its initial condition and settles into the equilibrium law $\pi$.

**Detailed balance (reversibility).** A sufficient (not necessary) condition for $\pi$ to be stationary is **detailed balance**: $\pi_i P_{ij} = \pi_j P_{ji}$ for all $i, j$. Summing over $i$ recovers $\pi = \pi P$. A chain satisfying detailed balance is **reversible**, and this equation is precisely what the Metropolis–Hastings construction in Chapter 24 engineers to make a target distribution stationary.

**Poisson process.** A **Poisson process** with rate $\lambda > 0$ is a continuous-time counting process $\{X_t : t \ge 0\}$ with $X_0 = 0$, **independent increments** (counts over disjoint intervals are independent), and **stationary increments** (the law of the count over an interval depends only on its length). The number of events in any interval of length $t$ is Poisson distributed:
$$
X_{t+s} - X_s \sim \text{Poisson}(\lambda t), \qquad \mathbb{P}(X_{t+s} - X_s = k) = \frac{e^{-\lambda t}(\lambda t)^k}{k!}.
$$

**Interarrival times.** The waiting times between consecutive events of a Poisson process, $W_1, W_2, \dots$, are i.i.d. **Exponential**$(\lambda)$, with density $\lambda e^{-\lambda w}$ and mean $1/\lambda$. The Exponential is **memoryless**: $\mathbb{P}(W > s + t \mid W > s) = \mathbb{P}(W > t)$ — having waited already tells you nothing about how much longer you must wait. This memorylessness is the continuous-time cousin of the Markov property.

## Quiz

**1.** State the Markov property precisely and explain in words why it is the assumption that makes a Markov chain "tractable."

> [!example]- Show answer
> The Markov property states that $\mathbb{P}(X_{n+1} = j \mid X_0, \dots, X_n = i) = \mathbb{P}(X_{n+1} = j \mid X_n = i)$: conditional on the present state, the future is independent of the past. It makes the chain tractable because the entire history collapses into the current state — you never need to track the whole path, only where you are now. Consequently all dynamics are encoded in a single one-step transition matrix $P$, and multi-step behavior is computed simply by taking matrix powers. Without the Markov property you would need joint distributions over arbitrarily long histories, which is generally intractable.

**2.** What two properties must the entries of a transition matrix $P$ satisfy, and what do we call such a matrix?

> [!example]- Show answer
> Every entry must be nonnegative, $P_{ij} \ge 0$, since it is a probability, and every *row* must sum to one, $\sum_j P_{ij} = 1$, since starting from state $i$ the chain must transition to some state. A matrix with these two properties is called a **stochastic matrix**. The row-sum condition is the key structural fact: rows are probability distributions over next states. (Columns need not sum to one.)

**3.** Write down the Chapman–Kolmogorov equations and explain how they justify computing $n$-step transition probabilities as $P^n$.

> [!example]- Show answer
> The Chapman–Kolmogorov equations are $P_{ij}(m+n) = \sum_k P_{ik}(m) P_{kj}(n)$, obtained by conditioning on the state $k$ occupied at the intermediate time $m$ and using the Markov property. In matrix form this is exactly the rule for matrix multiplication: $P^{m+n} = P^m P^n$. Taking $m = n = 1$ gives the two-step matrix $P^2$, and by induction the $n$-step transition probabilities are the entries of $P^n$. Thus $\mathbb{P}(X_n = j \mid X_0 = i) = (P^n)_{ij}$, and the time-$n$ marginal is $\mu_n = \mu_0 P^n$.

**4.** Distinguish a recurrent state from a transient state. What does it mean for a chain to be irreducible?

> [!example]- Show answer
> A state $j$ is **recurrent** if, starting from $j$, the chain returns to $j$ with probability 1; a recurrent state is therefore visited infinitely often. A state is **transient** if there is positive probability of never returning, so over infinite time it is visited only finitely many times. A chain is **irreducible** if every state communicates with every other state — for any $i, j$ there is some $n$ with $P_{ij}(n) > 0$ — so the whole state space forms a single communicating class. In an irreducible chain, recurrence and transience are class properties: either all states are recurrent or all are transient.

**5.** Define the period of a state and the notion of aperiodicity. Why does periodicity threaten convergence to a stationary distribution?

> [!example]- Show answer
> The **period** of state $i$ is $d(i) = \gcd\{n \ge 1 : P_{ii}(n) > 0\}$, the greatest common divisor of the return times that have positive probability. The state is **aperiodic** if $d(i) = 1$, and the chain is aperiodic if all states are. Periodicity threatens convergence because a periodic chain cycles deterministically through subsets of states (e.g. period 2 means it alternates between two groups), so $P_{ij}(n)$ keeps oscillating and never settles to a single limit. Aperiodicity, together with irreducibility, is what guarantees $P_{ij}(n) \to \pi_j$.

**6.** Define a stationary distribution $\pi$ and give the equation it satisfies. What is its eigenvector interpretation?

> [!example]- Show answer
> A **stationary** (invariant) distribution $\pi$ is a probability vector satisfying $\pi = \pi P$, i.e. $\pi_j = \sum_i \pi_i P_{ij}$ for every $j$, together with $\pi_j \ge 0$ and $\sum_j \pi_j = 1$. It is a fixed point of the dynamics: if $X_0 \sim \pi$ then $X_n \sim \pi$ for all $n$. The equation $\pi = \pi P$ says $\pi$ is a **left eigenvector of $P$ with eigenvalue 1**. A stochastic matrix always has 1 as an eigenvalue, which is why a stationary distribution exists (uniqueness and convergence require the extra structural conditions).

**7.** State the fundamental convergence theorem for Markov chains. What three properties make $\pi$ unique and reached from any start, and how is $\pi_j$ interpreted?

> [!example]- Show answer
> If a Markov chain is **irreducible**, **aperiodic**, and possesses a stationary distribution (automatic for finite state spaces), then $\pi$ is **unique** and $\lim_{n\to\infty} P_{ij}(n) = \pi_j$ for every starting state $i$ — the chain forgets where it began. The three conditions are irreducibility (so all states are reachable and there is one class), aperiodicity (so no oscillation), and existence of $\pi$ (positive recurrence). The value $\pi_j$ is interpreted as the **long-run fraction of time** the chain spends in state $j$, an ergodic statement that lets time-averages stand in for averages over $\pi$.

**8.** Explain detailed balance and why it is the key bridge from Markov-chain theory to MCMC.

> [!example]- Show answer
> **Detailed balance** holds if $\pi_i P_{ij} = \pi_j P_{ji}$ for all states $i, j$, meaning the equilibrium flow from $i$ to $j$ equals the flow from $j$ to $i$. Summing both sides over $i$ gives $\sum_i \pi_i P_{ij} = \pi_j \sum_i P_{ji} = \pi_j$, i.e. $\pi = \pi P$, so detailed balance is a sufficient condition for $\pi$ to be stationary, and the resulting chain is **reversible**. It is the bridge to MCMC because methods like Metropolis–Hastings *construct* transition probabilities $P_{ij}$ that satisfy detailed balance with respect to a prescribed target $\pi$. By the convergence theorem, simulating that chain produces samples from $\pi$ — exactly what Chapter 24 exploits.

**9.** Define the Poisson process via its three defining ingredients, and state the distribution of the count in an interval of length $t$.

> [!example]- Show answer
> A **Poisson process** with rate $\lambda > 0$ is a continuous-time counting process $\{X_t\}_{t\ge0}$ with $X_0 = 0$ that has (i) **independent increments** — counts over disjoint time intervals are independent; (ii) **stationary increments** — the distribution of the count over an interval depends only on the interval's length, not its location; and (iii) counts that are Poisson distributed. Specifically, the number of events in any interval of length $t$ satisfies $X_{t+s} - X_s \sim \text{Poisson}(\lambda t)$, with mean $\lambda t$. The single parameter $\lambda$ is the average number of events per unit time.

**10.** *(Applied)* Suppose calls arrive at a help desk as a Poisson process with rate $\lambda = 3$ per hour. (a) What is the distribution of the number of calls in a 2-hour window and its expected value? (b) What is the distribution and mean of the time between consecutive calls, and what does "memoryless" mean operationally here?

> [!example]- Show answer
> (a) The count over a window of length $t = 2$ hours is $\text{Poisson}(\lambda t) = \text{Poisson}(6)$, so the expected number of calls is $\lambda t = 6$ (and the variance is also 6). (b) The interarrival times are i.i.d. $\text{Exponential}(\lambda) = \text{Exponential}(3)$ with mean $1/\lambda = 1/3$ hour ($= 20$ minutes). "Memoryless" means that if 10 minutes have already passed with no call, the distribution of the *remaining* wait is still Exponential$(3)$ — the process has no memory of the elapsed waiting time, so a longer dry spell does not make the next call "overdue." This memorylessness is the continuous-time analogue of the Markov property.

## Deeper understanding (expansion)

> [!info]+ 💡 Why the stationary distribution is the engine of MCMC
>
> Read forward, the logic of Chapters 23 and 24 fits together as a single argument. Chapter 23 establishes a *guarantee*: if you build an irreducible, aperiodic chain that has $\pi$ as its stationary distribution, then no matter where you start, running the chain long enough produces states distributed (approximately) as $\pi$, and time-averages converge to expectations under $\pi$. Chapter 24 *reverses the engineering*: you are handed a target distribution — often a Bayesian posterior $f(\theta \mid \text{data})$ known only up to a normalizing constant — and you *design* transition probabilities so that this target is the stationary distribution. The Metropolis–Hastings accept/reject rule is precisely a recipe for transitions satisfying detailed balance $\pi_i P_{ij} = \pi_j P_{ji}$ with respect to your target, and crucially the unknown normalizing constant cancels in the acceptance ratio. So the abstract convergence theorem here is not theory for its own sake: it is the certificate that the MCMC samples you collect are valid draws from the distribution you care about.

> [!info]+ 💡 Discrete time vs. continuous time, and where memorylessness lives
>
> The chapter pairs two seemingly different models, but they share a common skeleton. The Markov chain lives in **discrete time and discrete states**, and its "memorylessness" is the Markov property: the next state depends only on the current state. The Poisson process lives in **continuous time** counting events, and its memorylessness shows up as the *Exponential* interarrival distribution — the only continuous distribution with the property $\mathbb{P}(W > s+t \mid W > s) = \mathbb{P}(W > t)$. Both models are tractable for the same underlying reason: the lack of memory means the future law is determined by a minimal amount of present information (the current state, or the rate $\lambda$). The continuous-time Markov process — built by attaching Exponential holding times to the states of a jump chain — is the construction that unifies the two, with the Poisson process being its simplest counting instance.

> [!info]+ 💡 Existence, uniqueness, and the role of finite state spaces
>
> It helps to keep three separate facts straight. (1) *Existence* of a stationary distribution: a stochastic matrix always has eigenvalue 1, and on a *finite* state space a stationary $\pi$ always exists; on infinite state spaces existence requires positive recurrence (mean return times finite). (2) *Uniqueness*: irreducibility ensures there is only one $\pi$ — multiple communicating classes can each carry their own invariant law. (3) *Convergence* $P_{ij}(n) \to \pi_j$: needs aperiodicity on top of the above, otherwise the chain can have a unique $\pi$ yet oscillate forever (a period-2 chain has a unique stationary distribution but $P_{ij}(n)$ never converges). Wasserman emphasizes the clean finite, irreducible, aperiodic case because it is both the easiest to state and exactly the regime MCMC operates in.

## Connections

- [[01-probability]] — A stochastic process is built on a single probability space; conditioning and independence (the conditional probabilities behind the Markov property and the independent increments of the Poisson process) all trace back to the foundations laid here. $\leftarrow$ this chapter *is* probability revisited after the inference chapters.
- [[02-random-variables]] — Each $X_t$ is a random variable; the chapter leans on the **Poisson** and **Exponential** families and their memoryless relationship, and on the expectation/variance facts ($\mathbb{E}[\text{Poisson}(\lambda t)] = \lambda t$, $\mathbb{E}[\text{Exp}(\lambda)] = 1/\lambda$) introduced there. $\leftarrow$ distributions defined earlier reappear as building blocks.
- [[05-convergence-of-random-variables]] — The convergence $P_{ij}(n) \to \pi_j$ and the "long-run fraction of time" interpretation are an ergodic theorem, the Markov-chain analogue of the law of large numbers studied earlier. $\rightarrow$ those limit ideas now apply to dependent (non-i.i.d.) sequences.
- [[24-simulation-methods]] — This chapter is the *theory* and Chapter 24 the *application*: detailed balance and the convergence theorem are exactly what Metropolis–Hastings and Gibbs sampling exploit to draw from posteriors. $\rightarrow$ design a chain whose stationary distribution is your target, then simulate it.
- [[03-expectation]] — Stationary expectations $\mathbb{E}_\pi[g(X)] \approx \frac{1}{n}\sum_t g(X_t)$ underlie the use of MCMC time-averages, connecting equilibrium behavior to the expectation machinery. $\rightarrow$ ergodic averages estimate expectations under $\pi$.
