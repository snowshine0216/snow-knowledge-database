---
tags: [statquest, cnn, convolutional-neural-networks, image-classification, deep-learning]
source: https://www.statquest.org/statquest-illustrated-guide-neural-networks-ai/
---

## Pre-test

> *Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*

1. What is the main problem with feeding all pixels of a large image directly into a standard (fully connected) neural network?
2. In a convolutional neural network, what is a "filter" (kernel), and roughly what does it do to an image?
3. What is max pooling, and why might it help a network handle slightly shifted versions of the same image pattern?

---

Looking at the chapter content and the CLAUDE.md requirements (frontmatter with `tags` and `source`), here's the study note:

```markdown
---
tags: [cnn, convolutional-neural-network, image-classification, deep-learning, neural-networks, max-pooling, pytorch, computer-vision]
source: https://www.amazon.com/StatQuest-Illustrated-Guide-Neural-Networks/dp/B0CHL7W1Y4
---

## Image Classification with Convolutional Neural Networks

### Overview

This chapter introduces Convolutional Neural Networks (CNNs) as a practical solution to the problem of image classification. Using the toy problem of classifying hand-drawn "X" and "O" characters in a tic-tac-toe game, it motivates why naive pixel-flattening into a standard neural network fails to scale, then walks through every step of a CNN—filter convolution, feature maps, ReLU, max pooling, and the final feed-forward layer—before showing how to implement one in PyTorch.

---

### Core Concepts

- **Pixels as inputs**: Images are grids of pixel values; black = 1, white = 0. A 6×6 image = 36 potential inputs.
- **The scaling problem**: Feeding all pixels directly into a neural network requires one weight per pixel per hidden node. A 100×100 image → 10,000 weights per node. This doesn't scale.
- **Shift sensitivity**: A plain MLP struggles when the same pattern appears shifted by even 1 pixel in the image.
- **Spatial correlations**: Real images have correlated pixels (e.g., brown surrounded by brown). CNNs are designed to exploit this.
- **Three things CNNs do to address these problems**:
  1. Reduce the number of input nodes
  2. Tolerate small spatial shifts
  3. Leverage spatial correlations between neighboring pixels
- **Filter (Kernel)**: A small square (typically 3×3) of learnable pixel values, optimized via backpropagation.
- **Feature Map**: The output of applying a filter across the entire input image.
- **Dot Product / Convolution**: Element-wise multiplication of the filter and the overlapping image region, summed to a single value. This is a convolution operation—hence "convolutional."
- **Stride**: The number of pixels the filter shifts at each step. Stride = 1 by default; larger strides used for larger images.
- **Bias**: Added to each dot product output, also learned via backpropagation.
- **ReLU**: Applied to the feature map; sets all negative values to 0, passes positive values unchanged.
- **Max Pooling**: Selects the maximum value within each non-overlapping region of the post-ReLU feature map. Forces the network to focus on the best-matching region for each filter.
- **Average (Mean) Pooling**: An alternative to max pooling that uses the average instead of the maximum.
- **Feed-Forward Network**: After pooling, the compressed representation is flattened and passed into a standard fully connected neural network for final classification.

---

### Key Techniques / Algorithms

#### Step 1: Apply a Filter to the Input Image

Overlay a 3×3 filter on the top-left corner of the image and compute the **dot product**:

$$\text{output} = \sum_{i,j} \text{filter}_{i,j} \times \text{image}_{i,j}$$

Then add a bias term:

$$\text{feature map value} = \text{dot product} + b$$

#### Step 2: Slide the Filter Across the Image (Stride)

Shift the filter by the stride (default = 1 pixel) horizontally, recompute the dot product + bias, and record each result into the **feature map**. After filling each row, move down by the stride and repeat until the full image is covered.

For a 6×6 input image with a 3×3 filter and stride = 1, the resulting feature map is **4×4**.

#### Step 3: Apply ReLU

Apply ReLU element-wise to the feature map:

$$\text{ReLU}(x) = \max(0, x)$$

All negative values → 0. Positive values unchanged.

#### Step 4: Max Pooling

Apply a pooling filter (typically 2×2) with stride = 2 (non-overlapping) over the post-ReLU feature map. Select the **maximum** value in each region:

$$\text{pooled value} = \max(\text{region})$$

A 4×4 feature map with a 2×2 pool and stride 2 → **2×2 pooled output** (4 values total from a 36-pixel input).

This is how CNNs achieve **dimensionality reduction** and **shift tolerance**: the pooled value reflects the best local match regardless of exact pixel position.

#### Step 5: Flatten and Feed Forward

Flatten the pooled layer into a column vector of input nodes. Connect to a standard feed-forward network with learned weights and biases. Apply softmax or argmax at the output if needed for probability/class interpretation.

---

### PyTorch / Code Notes

```python
import torch.nn as nn

# Convolutional layer
self.conv = nn.Conv2d(
    in_channels=1,   # 1 for grayscale; 3 for RGB
    out_channels=1,  # number of output feature maps
    kernel_size=3    # 3x3 filter; use tuple (h, w) for non-square
)

# Max pooling layer
self.pool = nn.MaxPool2d(
    kernel_size=2,  # 2x2 pooling window
    stride=2        # non-overlapping: moves 2 units each step
)
```

- `nn.Conv2d` handles the filter, bias, and backpropagation automatically.
- `nn.MaxPool2d` handles the pooling step.
- Everything else (flatten, linear layers, activation) uses standard `nn.Linear` and activation functions covered in earlier chapters.
- Color images use `in_channels=3` (R, G, B); `out_channels` controls how many separate filters are learned.

---

### Key Takeaways

- **CNNs solve three fundamental problems** with image classification: parameter explosion, shift sensitivity, and ignoring spatial correlations—all through filters, ReLU, and pooling.
- **Filters are learned, not hand-crafted**: backpropagation optimizes both filter pixel values and biases end-to-end.
- **Convolution + pooling = compression with locality**: a 36-pixel input reduced to 4 inputs while preserving the spatially meaningful structure.
- **Max pooling provides shift invariance**: by keeping only the strongest activation in each region, the CNN stays robust to small translations in the image.
- **CNNs scale**: the same building blocks (conv → ReLU → pool → FC) compose into deeper architectures for harder problems—the principles remain identical regardless of network size.
```

---

## Post-test

> *Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*

1. Explain in your own words the three specific problems CNNs are designed to solve that standard MLPs cannot handle well for images — and which CNN component addresses each problem.
2. Trace a 6×6 grayscale image through one full CNN pipeline: filter → feature map → ReLU → max pooling. What are the output dimensions at each step, and what mathematical operation happens at each stage?
3. Why are CNN filters described as "learned, not hand-crafted"? What mechanism trains them, and what two sets of parameters does that mechanism update?

> [!example]- Answer Guide
> #### Q1 — Three Problems CNNs Solve
> 
> CNNs solve: (1) parameter explosion — filters share weights across the image instead of one weight per pixel per node; (2) shift sensitivity — max pooling keeps the strongest local activation regardless of exact position; (3) ignoring spatial correlations — the filter's dot product operation explicitly combines neighboring pixels.
> 
> #### Q2 — Image Through Full CNN Pipeline
> 
> A 3×3 filter slides over the 6×6 image (stride=1), computing element-wise dot product + bias at each position to produce a 4×4 feature map; ReLU is applied element-wise (negatives → 0); a 2×2 max pool with stride=2 selects the maximum in each non-overlapping region, reducing to a 2×2 output (4 values from 36 original pixels).
> 
> #### Q3 — How Filters Are Trained
> 
> Filter pixel values and biases start as random values and are optimized end-to-end via backpropagation during training — the same gradient-based process that updates weights in standard neural network layers, requiring no manual design of the filter values.
