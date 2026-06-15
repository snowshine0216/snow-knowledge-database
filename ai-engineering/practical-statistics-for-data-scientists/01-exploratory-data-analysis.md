---
tags: [exploratory-data-analysis, descriptive-statistics, robust-estimators, correlation, data-visualization, bruce-gedeck, study-guide, quiz]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# Chapter 1 — Exploratory Data Analysis

> [!abstract]+ Chapter at a glance
> Before any modeling, you explore. This chapter is John Tukey's **exploratory data analysis** recast for data scientists: classify your data by type, summarize a single variable's **location** (where it sits) and **variability** (how spread out it is), look at its full **distribution** with the right plot, and then probe **relationships** between two or more variables. The recurring lesson is **robustness** — real data has outliers and long tails, so prefer estimates (median, trimmed mean, IQR, MAD) that don't get hijacked by a few extreme values.

## Core concepts

**Elements of structured data**
- Two top-level types: **numeric** — **continuous** (any value in a range; e.g. temperature) or **discrete** (integer counts; e.g. number of events) — and **categorical** — taking a fixed set of values, including **binary** (a special two-value/0–1 case) and **ordinal** (categories with a meaningful order; e.g. a 1–5 rating).
- Why the type matters: it dictates the right summary, the right plot, and how software should treat the field (e.g. telling a model a variable is a *factor* vs. a number changes everything downstream).

**Rectangular data and its vocabulary**
- The standard form is **rectangular data** — a **data frame** (rows × columns). A column is a **feature** (a.k.a. predictor, input, attribute, variable); the column you predict is the **outcome** (target, response, dependent variable); a row is a **record** (case, observation, sample, instance).
- Not everything is rectangular: **time series**, **spatial** data, and **graph/network** data have their own structures, but rectangular data is the workhorse of the book.

**Estimates of location** (a typical value)
- **Mean** (average) and **weighted mean**; the **trimmed mean** drops a fixed fraction of extremes before averaging.
- **Median** (the 50th percentile) and **weighted median** — **robust** / outlier-resistant.
- Key contrast: the **mean** is pulled by outliers; the **median** and **trimmed mean** are not. On skewed data (incomes, web traffic), the median tells the truer story.

**Estimates of variability** (dispersion)
- Built from **deviations** (residuals/errors = how far each value is from the center).
- **Variance** and **standard deviation** (square-then-average the deviations) — interpretable but **outlier-sensitive** because squaring magnifies extremes.
- Robust alternatives: **mean absolute deviation**, and especially the **median absolute deviation (MAD)**.
- Order-statistic measures: **range**, **percentiles/quantiles**, and the **interquartile range (IQR)** = 75th − 25th percentile — robust and the basis of the boxplot.

**Exploring the data distribution**
- **Percentiles** and the **boxplot** (a compact five-number picture: quartiles + whiskers, with outliers flagged).
- **Frequency tables** and **histograms** bin the data into counts; **density plots** show a smoothed continuous estimate of the same shape.

**Binary and categorical data**
- Summaries: the **mode** (most common category), **proportions/probability**, and **expected value** — a probability-weighted average, central when categories map to numeric payoffs.
- Plots: **bar charts** (preferred) and **pie charts**.

**Correlation**
- The **correlation coefficient** (Pearson's *r*, in [−1, 1]) measures the strength of a *linear* relationship; a **correlation matrix** summarizes many pairs; a **scatterplot** shows the raw relationship.
- Caveats: it captures only **linear** association, is **distorted by outliers** (robust variants like Spearman's rank correlation help), and **correlation is not causation**.

**Exploring two or more variables**
- **Numeric × numeric** — scatterplots overplot at scale, so use **hexagonal binning**, **contour**, or **heat-map** density plots.
- **Categorical × categorical** — **contingency tables** of counts/proportions.
- **Categorical × numeric** — side-by-side **boxplots** or **violin plots** (boxplot + density).
- **Conditioning** — **faceting / trellis / small multiples**: repeat a plot across the levels of a conditioning variable to reveal interactions.

## Quiz

**1.** Distinguish *continuous*, *discrete*, *nominal*, and *ordinal* data, and explain why pinning down the type is the first thing you do.

> [!example]- Show answer
> **Continuous** = numeric values on a real interval (temperature, weight). **Discrete** = integer counts (number of clicks). **Nominal** (categorical) = unordered labels (country, color). **Ordinal** = categories with a meaningful order but not necessarily even spacing (low/medium/high, a 1–5 star rating). The type matters because it determines the valid summary (mean vs. mode), the right plot (histogram vs. bar chart), and how software/models should encode the field — e.g. treating an ordinal rating as a free numeric can be fine, but treating an unordered category code as a number invents a false ordering.

**2.** Why is the **median** often a better measure of location than the **mean**, and when would you reach for a **trimmed mean** instead of either?

> [!example]- Show answer
> The **mean** is pulled toward outliers and long tails (a few billionaires drag up "average wealth"), while the **median** — the middle value — is **robust** and reflects the typical case. You reach for a **trimmed mean** when you want the efficiency/smoothness of an average but still want to neutralize a handful of extremes: drop, say, the top and bottom 10% and average the rest. It's a middle ground — more robust than the mean, more information-using than the median.

**3.** Variance and standard deviation are the default measures of spread, yet the book emphasizes the **MAD**. What's the trade-off?

> [!example]- Show answer
> Variance/SD **square** the deviations, which makes them mathematically convenient (and the natural fit for normal-theory methods) but **outlier-sensitive** — one extreme value, squared, dominates the estimate. The **median absolute deviation (MAD)** uses the median of absolute deviations, so it's **robust**: extreme values barely move it. Trade-off: SD plugs directly into a huge body of classical theory and is what most tools report; MAD is more trustworthy on dirty/heavy-tailed data but less "standard." Rule of thumb: if you suspect outliers, look at the MAD/IQR before trusting the SD.

**4.** What does the **IQR** measure, and how does the **boxplot** use percentiles to display a distribution?

> [!example]- Show answer
> The **interquartile range** = 75th percentile − 25th percentile: the spread of the middle 50% of the data, robust to outliers. A **boxplot** draws a box from the 25th to 75th percentile with a line at the median (50th), whiskers extending to roughly the data range (commonly within 1.5×IQR), and individual points beyond the whiskers flagged as potential **outliers**. It's a compact, percentile-based summary that makes skew and outliers visible at a glance.

**5.** Histogram, density plot, boxplot — when would you prefer each?

> [!example]- Show answer
> **Histogram**: shows the actual binned counts/shape and is great for spotting multimodality, gaps, and the rough distribution; sensitive to bin width. **Density plot**: a smoothed version of the histogram, better for comparing shapes across groups on one axis without bin artifacts. **Boxplot**: the most compact — best for comparing the location/spread/outliers of *many* groups side by side, but it hides multimodality (two humps look the same as one). Use histogram/density to understand one variable's shape; use boxplots to compare a numeric variable across categories.

**6.** Define **expected value** and give a situation where it's the natural summary of a categorical variable.

> [!example]- Show answer
> **Expected value** is a probability-weighted average: multiply each possible outcome's value by its probability and sum. It applies when categories carry numeric payoffs. Example: a cloud-service pricing tier where 70% of users are on a \$0 plan, 25% on \$10, 5% on \$50 → expected revenue per user = 0.70·0 + 0.25·10 + 0.05·50 = \$5. It collapses a categorical distribution plus a value mapping into a single planning number — the basis of a lot of business forecasting.

**7.** List the main caveats of **Pearson's correlation coefficient**.

> [!example]- Show answer
> (1) It measures only **linear** association — a strong nonlinear (e.g. U-shaped) relationship can have *r* ≈ 0. (2) It's **sensitive to outliers** — a couple of extreme points can manufacture or destroy a correlation, so rank-based **Spearman** is a robust alternative. (3) **Correlation ≠ causation** — a high *r* can come from a confounder or coincidence. (4) It says nothing about **slope/magnitude** — only the tightness of the linear trend. Always pair the coefficient with a **scatterplot**.

**8.** At scale, a scatterplot of two numeric variables becomes a useless black blob. What does the book suggest, and why does it work?

> [!example]- Show answer
> Use **hexagonal binning**, **contour plots**, or **heat maps** instead of plotting every point. With millions of records, points **overplot** and you can't see where the mass is. Hexbin/contour aggregate points into cells/density bands and color by count, so the *concentration* of the data becomes visible — you see the dense core and the sparse tails that a raw scatter hides.

**9.** *(Applied)* You have customer **age** (numeric) and **subscription plan** (categorical) and want to see how they relate. Which visualizations fit, and what would you look for?

> [!example]- Show answer
> This is a **categorical × numeric** pairing, so use **side-by-side boxplots** or **violin plots** of age, one per plan. Look for differences in **median age** across plans (location), differences in **spread** (does one plan attract a wide age range?), **skew**, and **outliers**. A violin plot adds the density shape — e.g. revealing that a plan is **bimodal** (popular with both students and retirees), which a boxplot alone would mask. If you also had a third categorical variable, you'd **facet** the plot by it.

**10.** *(Applied)* You're handed a new dataset. Outline an EDA pass before any modeling.

> [!example]- Show answer
> (1) **Type every column** (continuous/discrete/nominal/ordinal) and fix mis-typed fields. (2) **Per-variable summaries**: for numerics, location (mean *and* median) and variability (SD *and* IQR/MAD) — divergence between mean and median flags skew/outliers; for categoricals, frequency tables and mode. (3) **Per-variable plots**: histograms/density for numerics, bar charts for categoricals, boxplots to spot outliers. (4) **Relationships**: correlation matrix + scatterplots (hexbin if large) for numeric pairs, contingency tables for categorical pairs, grouped boxplots for mixed. (5) **Condition/facet** on key segments to expose interactions. Throughout, **prefer robust estimates** and treat anything surprising (impossible values, spikes, gaps) as a data-quality lead, not a finding.

## Deeper understanding (expansion)

> [!info]+ 💡 Why "robust" is the spine of the whole chapter
> Almost every choice here — median over mean, IQR/MAD over SD, trimmed means, hexbin over raw scatter — is the same instinct: **don't let a handful of bad or extreme values dictate your conclusion.** Real data is dirty (typos, sensor glitches, fraud, fat tails). Classical statistics was built in an era of small, hand-curated samples where outliers were rare and the math favored squared deviations. Data scientists work with large, messy, automatically-collected data where outliers are *normal*. That inverts the default: robust estimators become the safe first look, and you reach for mean/SD only once you trust the data is clean and roughly symmetric.

> [!info]+ 💡 Mean − median is a free skewness detector
> You don't need a formal skewness statistic to sense asymmetry: just compare the **mean** and the **median**. If mean ≫ median, the distribution has a long **right tail** (a few big values pulling the mean up — incomes, file sizes, request latencies). If mean ≪ median, it's left-skewed. When they're close, the distribution is roughly symmetric. This two-number check, done per column during EDA, instantly tells you which variables will need a log transform or robust treatment downstream — and it costs nothing.

> [!info]+ 💡 EDA is hypothesis generation, not decoration
> It's tempting to treat plots as something you make *after* the analysis to present results. Tukey's point — and the book's — is the opposite: EDA is where you **form the hypotheses** the rest of the pipeline tests. The bimodal histogram, the outlier cluster, the nonlinear scatter, the surprising contingency cell — each is a lead about structure, data quality, or a confounder you'd otherwise model right past. Skipping EDA doesn't save time; it defers the surprises to a point where they're more expensive to discover (in a broken model or a wrong business decision).

## Connections

- **→ Chapter 2** turns from describing the data in front of you to reasoning about the **sampling** that produced it — and how much a summary statistic would wobble if you drew the sample again.
- **→ Chapter 4** builds on **correlation** to fit **regression** lines, where the same outlier/leverage concerns return as formal diagnostics.
- **→ Chapter 7** reuses these distance and scaling ideas for **clustering** and **PCA**.
- Lightweight summary: [[psds-ch01-exploratory-data-analysis]] · book hub: [[practical-statistics-for-data-scientists-book]].
