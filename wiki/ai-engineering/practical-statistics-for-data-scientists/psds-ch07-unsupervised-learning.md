---
tags: [unsupervised-learning, pca, clustering, k-means, hierarchical-clustering, model-based-clustering, feature-scaling, bruce-gedeck]
source: https://github.com/gedeck/practical-statistics-for-data-scientists
---

# PSDS Ch.7 — Unsupervised Learning

Finding structure when there's no labeled outcome — for exploration, for feature creation, or as a step before supervised modeling. The chapter covers dimension reduction and the main clustering families, then closes on the unglamorous-but-decisive issue of **scaling and mixed data types**. Part of the [[practical-statistics-for-data-scientists-book]] series. Full review pack with quiz: [[07-unsupervised-learning]].

## Reducing dimensions and finding clusters

- **Principal Components Analysis (PCA)** — finds new orthogonal axes (**principal components**) that capture the most variance; **loadings** show how original variables combine, and a **scree plot** shows how many components to keep. The standard tool for dimension reduction and visualization; **correspondence analysis** is its categorical analog.
- **K-means clustering** — partition records into **K** clusters around **centroids**, minimizing **within-cluster sum of squares**. Fast and scalable; you must choose **K** (the **elbow** method helps) and it assumes roughly spherical, equal-size clusters.
- **Hierarchical clustering** — builds a **dendrogram** by **agglomerative** merging under a **dissimilarity** measure (complete, single, average, **Ward** linkage). No preset K and a readable tree, but it doesn't scale to large n.
- **Model-based clustering** — assumes the data is a **mixture of multivariate normals**; uses a likelihood criterion (**BIC**) to choose the number and shape of clusters. More principled, more assumptions, heavier compute.

## Scaling and mixed data — the part that actually decides results

- **Standardization matters most** — clustering and PCA are distance-based, so unscaled variables let large-magnitude features dominate. **Z-score** standardization (or similar) is usually mandatory, not optional.
- **Dominant variables** — a single high-variance feature can hijack the whole clustering; inspect and rescale.
- **Categorical & mixed data** — Euclidean distance breaks on categories; use **Gower's distance** for mixed numeric/categorical data. Pure-categorical clustering is genuinely problematic and needs care.

## Key Takeaways

- **PCA for "how many dimensions," clustering for "what groups"** — they answer different questions and are often used together (PCA to denoise, then cluster).
- **Pick the clustering method by your constraints**: K-means for scale, hierarchical for an interpretable tree and unknown K, model-based when you can defend the mixture assumption.
- **Scaling is the hidden lever.** Unsupervised results are only as good as the preprocessing — standardize, watch for dominant variables, and use Gower's distance for mixed types.

## See Also

- [[practical-statistics-for-data-scientists-book]]
- [[psds-ch06-statistical-machine-learning]] · [[psds-ch01-exploratory-data-analysis]]
