---
tags: [quant, a-share, qlib, machine-learning, factor-investing, backtesting, china-markets, rqalpha, gplearn]
source: https://github.com/microsoft/qlib
---
# A-Share ML Quant — Build Guide

How a semi-serious retail quant (modest personal capital, manual execution) builds an
**ML-factor research + backtest** system for 中国 A股. Synthesized from a deep-research pass
(primary-source verified) plus the trading notes already in this vault: [[kronos]],
[[tradingagents]], [[dexter]], [[openbb]], [[hermes-agent-vs-openbb]], [[local-deep-research]],
[[financial-services]]. Companion to the **`ashare-quant`** repo and the IRC fundamental-analysis
review.

> [!abstract] One-paragraph summary
> Build on **Microsoft Qlib** (Alpha158/Alpha360 factors → LightGBM ranker → TopkDropout portfolio
> → A-share-honest backtest). It runs on a **laptop CPU — no GPU, a few GB of disk**. Add **RQAlpha**
> for paper/live, **jqfactor_analyzer** for single-factor IC/IR, **gplearn** for factor mining, and
> the **chenditc/investment_data** dataset (delisting-inclusive → survivorship-bias aware). The hard
> part isn't tooling — it's *not fooling yourself*: model A-share frictions honestly and respect the
> brutal after-cost viability math. The one real edge is being small in a ~80%-retail market.

## "ML factor models" — what it actually means

Not "predict tomorrow's price." It's **cross-sectional ranking**:

1. **Factor library** → per stock, per day, compute N features (momentum, reversal, turnover, vol, EP…).
2. **ML ranking model** → LightGBM/XGBoost predicts each stock's forward return *relative to peers*.
3. **Portfolio construction** → long the top-k, drop the bottom; cap position size; control turnover.
4. **Honest backtest** → simulate with real A-share costs/limits; measure IC, Sharpe, max drawdown.

The model never says "buy" — it produces a **score that sorts stocks**. Factors are pure functions
`(history) → feature`, individually testable (FP/TDD-friendly).

## Do I need to deploy locally / need a GPU?

> [!info]+ 💡 The hardware reality (the common worry, answered)
> **Yes "local", but local = a laptop, not a server or GPU rig.**
> - **Qlib + LightGBM on Alpha158** (the 95% case): **CPU only, no GPU.** Trains a CSI300 model in
>   **minutes**. Qlib floor is 4 GB RAM (8 GB rec.); 16 GB comfortable.
> - **Daily-bar data for the whole A-share market** (~5,000 stocks × ~20 yrs OHLCV): **a few GB on
>   disk** in Qlib's binary store at `~/.qlib/qlib_data/cn_data`. Qlib reads a *local binary*, not a live feed.
> - **Deep learning** (Qlib's LSTM/GRU/Transformer zoo, or [[kronos]] finetuning): GPU recommended
>   but optional — one consumer GPU or rent cloud/Colab by the hour.
>
> "Local" is really about *ownership*: Qlib is a library + a dataset you control, vs. hosted notebooks
> (JoinQuant 聚宽 / RiceQuant 米筐) that bake data in but are walled gardens. For "own the pipeline,"
> local Qlib wins and is lightweight. **V1 needs zero special hardware.**

## The stack (verified, primary-source)

| Repo | ~Stars | Role | Steal this |
|---|---|---|---|
| **microsoft/qlib** | ~14k | Core ML-factor research → backtest, A-share-fitted | Alpha158 → LightGBM → TopkDropout pipeline (one YAML) |
| **chenditc/investment_data** | — | A-share Qlib-format dataset | Delisting-inclusive (survivorship-aware) data; one `wget`+`tar` |
| **ricequant/rqalpha** | ~6.4k | Backtest → **paper** → live, A-share tax/fee/risk mods | V2 paper-trading layer |
| **JoinQuant/jqfactor_analyzer** | ~650 | China-specific alphalens | IC/IR/quantile/turnover per factor |
| **trevorstephens/gplearn** | — | Genetic-programming symbolic regression | `SymbolicTransformer` → mine new formulaic factors |
| **vnpy/vnpy** | ~24k | Full live-trading platform (CTP) | Only for later live/CTA; weak for cross-sectional |

Skip **backtrader** (unmaintained since ~2019, no native A-share) and **zipline-reloaded** (US-centric)
for A-share. Architecture: `Qlib` (signal) → `jqfactor_analyzer` (validate) → `gplearn` (discover) →
`RQAlpha` (paper/live). Don't make one tool do everything.

## A-share frictions that turn backtests into fantasy

Qlib's `cn` region models these **by default — keep them on** (`qlib/backtest/exchange.py`):

| Friction | Reality | Qlib handling |
|---|---|---|
| Stamp duty 印花税 | 0.05% sell-side only | asymmetric `close_cost` (0.0025) > `open_cost` (0.0015) |
| Min commission | ~5 RMB floor | `min_cost=5`, `max(value×rate, 5)` |
| ±10% limit 涨跌停 | can't buy locked limit-up | `limit_threshold=0.095` — **null silently disables it → fantasy returns** |
| T+1 settlement | sell only next day | cn rules |
| Suspension 停牌 | no trades | rejects when `$close` is NaN |
| 100-share lots | round lots only | `trade_unit=100` |
| Survivorship bias | delisted losers vanish | **dataset-level**: use delisting-inclusive data |
| Look-ahead (fundamentals) | restated财报 leak the future | use point-in-time data / lag disclosures |

## Data sources (honest tier list)

| Source | Cost | Use for | Caveat |
|---|---|---|---|
| **AkShare** | Free | start; broadest coverage | scrape-based → breaks; **not point-in-time** |
| **BaoStock** | Free | clean daily bars (beginners) | limited breadth |
| **Tushare Pro** | Points (eff. paid) | stabler, lower-latency | week-long outage Aug 2025 (single-source risk) |
| **JoinQuant / RiceQuant** | Freemium hosted | learning; **`get_pit_financials_ex()` = true point-in-time** | walled garden |
| **chenditc/investment_data** | Free | **Qlib training dataset** | use `releases/latest`; no third-party audit |

Free sources mostly hand you *restated* financials → look-ahead bias on fundamental factors. Start with
price/volume/technical factors where this matters less.

## Honest viability (the part that decides if it's worth it)

> [!warning] The base rate is bad — most retail ML quant ships overfit backtests
> Killers, in order: **(1) data-snooping** (hundreds of trials on the same history; something looks
> great by chance — feels exactly like success); **(2) costs eat thin alpha** (2% gross @ 300% turnover
> is *negative* after A-share frictions); **(3) factor decay/crowding**; **(4) backtest-live gap**
> (limit-up stocks were unfillable; small-cap slippage worse than modeled).

> [!success] The real, documented edge — and why *small* helps
> A-share is **~80%+ retail-driven by volume**, so behavioral/sentiment mispricing is unusually strong.
> Anchor: **Liu, Stambaugh & Yuan, *Size and Value in China* (JFE 2019)**:
> - **Exclude the smallest ~30%** by market cap — China's IPO-approval bottleneck makes tiny firms
>   trade as backdoor-listing (借壳上市) **shells**; their prices reflect reverse-merger speculation, not
>   fundamentals. Naive small-cap factors mostly measure this.
> - **Use earnings-to-price (EP), not book-to-market**, for value in China.
> - **Turnover/sentiment is a first-class factor** — the structural retail edge.
>
> Your one structural advantage: the exploitable anomalies are **low-capacity** (break at scale), so
> institutions can't fully arbitrage them. The illiquidity that gives the edge also gives slippage —
> a knife's edge, not free money. (Read exact premia magnitudes from the paper.)

**Verdict:** as *learning + research* with modest capital, **worth doing** — the retail-sentiment
inefficiency is genuine and your size is an asset. Realistic success = *a small, robust, after-cost
edge you understand*, not a high-Sharpe money printer. The 80% failure mode is self-deception via
data-snooping; engineering discipline is the best defense most retail quants lack.

## Roadmap: V1 (backtest+research) → V2 (paper)

**V1 (~4–8 wks part-time):** reproduce Qlib LightGBM/Alpha158 benchmark → internalize the backtest
engine (break `limit_threshold` once, watch returns inflate) → single-factor literacy with
jqfactor_analyzer (exclude smallest 30%; EP value; turnover) → lock an OOS window touched *once* +
walk-forward → one low-turnover strategy that's net-positive after costs → (optional) gplearn mining
+ [[kronos]] as an extra feature (GPU for finetuning).

**V2 (~1–3 mo, mostly waiting):** wire into RQAlpha paper-trading, run forward ≥ a quarter, compare
paper vs backtest — **the gap is your slippage/cost error**, the most educational number in the project.

**Pre-commit against:** tuning on the test set · survivorship bias · ignoring T+1/limit-up · high
turnover · non-PIT fundamentals · trusting one hero backtest.

## Relation to investment-research-copilot

Keep them **separate**. IRC ([[financial-services]]-style) answers *"keep DCAing this fund? thesis
alive?"* (low-freq, fundamentals + discipline). `ashare-quant` answers *"rank these stocks today"*
(daily cross-sectional ML). Contract is one-way and narrow: ashare-quant exports a per-instrument
**signal**; IRC consumes it as one more feature behind its decision layer — exactly the [[kronos]]
pattern (a model signal is an input, never the buy/sell decision).

## References

- microsoft/qlib · `qlib/backtest/exchange.py` · `examples/benchmarks/LightGBM/workflow_config_lightgbm_Alpha158.yaml`
- chenditc/investment_data · ricequant/rqalpha · JoinQuant/jqfactor_analyzer · trevorstephens/gplearn
- Liu, Stambaugh & Yuan (2019), *Size and Value in China*, Journal of Financial Economics
- RiceQuant RQData `get_pit_financials_ex()` (point-in-time fundamentals)
