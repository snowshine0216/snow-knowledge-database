---
tags: [quant, reading-list, machine-learning, factor-investing, backtesting, a-share, education]
source: https://github.com/stefan-jansen/machine-learning-for-trading
---
# Quantitative Trading — Reading List

A prioritized path for an experienced software engineer (FP/TDD background, new to quant)
building an **ML-factor + A-share** system. Companion to [[ashare-ml-quant-guide]]. Opinionated:
skips HFT/institutional fluff; mapped to the `ashare-quant` repo roadmap milestones (M1–M6).

> [!tip] If you only do three things
> **Ernest Chan** (mental model) → **López de Prado AFML** validation chapters (rigor) →
> **Stefan Jansen's repo** (hands-on). That trio covers ~80% of what you need to start safely.

## Tier 1 — Start here (≈ M1)
- **Ernest Chan, *Quantitative Trading* (2nd ed.)** — canonical retail-quant starter; honest about
  pitfalls, written for a modest-capital solo operator. Read first for vocabulary + mental model.
- **Qlib paper + docs** — [arXiv 2009.11189](https://arxiv.org/abs/2009.11189) →
  [qlib.readthedocs.io](https://qlib.readthedocs.io). You build on Qlib; learn its data model first.

## Tier 2 — The ML-factor core (this *is* the path; ≈ before M3)
- **Marcos López de Prado, *Advances in Financial Machine Learning* (AFML)** — **highest-value single
  book.** Cross-sectional ML, labeling, and the critical *validation* chapters: purged/embargoed CV,
  combinatorial CV, **backtest overfitting & the deflated Sharpe ratio**. This is the anti-self-deception
  rigor. Dense, but you're an engineer.
- **Stefan Jansen, *Machine Learning for Algorithmic Trading* (2nd ed.)** — the practical companion;
  Python, end-to-end, with a huge [GitHub repo](https://github.com/stefan-jansen/machine-learning-for-trading).
  Your "how do I actually code an alpha factor + backtest" reference.
- **Kakushadze, *101 Formulaic Alphas*** ([arXiv 1601.00991](https://arxiv.org/abs/1601.00991)) —
  concrete alpha-factor *formulas*. Read right before writing factors (M3) and gplearn mining (M6).

## Tier 3 — The honesty layer (internalize throughout)
- **Bailey, Borwein, López de Prado & Zhu, *Pseudo-Mathematics and Financial Charlatanism*** — why
  backtest overfitting from multiple testing is mathematically inevitable, and what to do.
- **Harvey, Liu & Zhu, *…and the Cross-Section of Expected Returns*** — the "factor zoo" / data-snooping
  problem. After this you'll discount any single great backtest correctly.

## Tier 4 — A-share specific
- **Liu, Stambaugh & Yuan, *Size and Value in China* (JFE 2019)** — exclude-smallest-30% (shell value),
  EP-over-book-to-market, turnover/sentiment factor. Non-negotiable for this market.
- **Carpenter, Lu & Whitelaw, *The Real Value of China's Stock Market*** — informativeness of A-share
  prices; context on the ~80%-retail structure that creates your edge.

## Tier 5 — Stack docs (reference, per milestone)
- **alphalens** docs + **jqfactor_analyzer** README → IC/IR/quantile/turnover intuition (M3 eval).
- **RQAlpha** docs (V2 paper trading). **gplearn** docs (M6 factor mining).

## Optional / deeper (later)
- **Grinold & Kahn, *Active Portfolio Management*** — Fundamental Law of Active Management
  (`IR ≈ IC × √breadth`); *why* cross-sectional ranking over many names works.
- **Larry Harris, *Trading and Exchanges*** — market-microstructure bible; skim liquidity/order-type
  chapters to understand slippage from first principles.

## Reading order vs. roadmap
| When | Read |
|------|------|
| Before **M1** (env + benchmark) | Chan; Qlib paper/docs |
| Before **M3** (factors + eval) | AFML (CV + overfitting chapters); Jansen alpha-factor chapters; 101 Alphas; alphalens/jqfactor |
| Throughout | The Tier-3 honesty papers — re-read whenever a backtest looks "too good" |
| Before **M5** (a real strategy) | Grinold & Kahn (IC/breadth); Liu-Stambaugh-Yuan |
| Before **V2** (paper) | RQAlpha docs; Larry Harris (slippage intuition) |
