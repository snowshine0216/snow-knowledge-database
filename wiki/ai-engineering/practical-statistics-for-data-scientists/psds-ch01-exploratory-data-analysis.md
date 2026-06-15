---
tags: [exploratory-data-analysis, descriptive-statistics, robust-estimators, correlation, data-visualization, bruce-gedeck]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# PSDS Ch.1 — Exploratory Data Analysis

Before any model, you look. This chapter is Tukey's EDA recast for data scientists: how to type your data, summarize where it sits and how much it varies, see its shape, and probe relationships between variables. Part of the [[practical-statistics-for-data-scientists-book]] series. Full review pack with quiz: [[01-exploratory-data-analysis]].

## Summarizing one variable

- **Data types frame everything**: **numeric** (continuous / discrete) vs. **categorical** (nominal, **ordinal**, binary). The type dictates which estimate, plot, and model are valid. Most data arrives as **rectangular data** — a data frame of records (rows) × features/predictors (columns) with one outcome/target.
- **Estimates of location** — **mean**, **weighted mean**, **median**, **trimmed mean**. The median and trimmed mean are **robust** (outlier-resistant); the mean is not. "Robust" is the recurring theme: real data has bad values.
- **Estimates of variability** — **deviations** → **variance** and **standard deviation** (sensitive to outliers) vs. robust spreads: **MAD** (median absolute deviation), **range**, and the **IQR** (interquartile range, 75th − 25th percentile). Variability matters as much as location and is more often overlooked.
- **Exploring the distribution** — **percentiles/quantiles**, **boxplots**, **frequency tables**, **histograms**, and smooth **density plots**. For categorical data: **mode**, **proportions/probability**, **expected value** (probability-weighted average), and bar charts.

## Relationships between variables

- **Correlation** — the **correlation coefficient** (Pearson) measures *linear* association in [−1, 1]; a **correlation matrix** + **scatterplot** reveal structure. Caveats: it only catches linear relationships, is distorted by outliers, and **correlation ≠ causation**.
- **Two numeric variables at scale** — plain scatterplots overplot; use **hexagonal binning** and **contour/density** plots instead.
- **Two categorical variables** — **contingency tables** of counts/proportions.
- **Categorical × numeric** — **boxplots** and **violin plots** (a boxplot + density) side by side.
- **Conditioning** — **faceting / trellis / small multiples**: split one plot into a grid by a conditioning variable to expose interactions.

## Key Takeaways

- **Always EDA first.** Summaries and pictures catch data-quality problems, outliers, and surprises that silently break models downstream.
- **Default to robust estimates** (median, IQR, MAD) when data is skewed or dirty — they tell the truth that the mean and SD hide.
- Choose the summary and the plot from the **data type**: there is no universal "summary statistic," only the right one for numeric vs. categorical vs. paired data.

## See Also

- [[practical-statistics-for-data-scientists-book]]
- [[psds-ch02-data-and-sampling-distributions]]
