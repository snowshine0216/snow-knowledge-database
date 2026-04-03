---
name: course-chapter-summarizer
description: >
  Summarize a YouTube educational video (lecture, course chapter, tutorial) into a structured
  course-note markdown file. Use this skill whenever the user asks to summarize, take notes on,
  or create a course chapter from a YouTube video link — especially 3blue1brown, Khan Academy,
  MIT OpenCourseWare, or similar educational content. Also trigger when the user says things like
  "add this video to my notes", "summarize this lecture", "create a chapter from this video",
  or "turn this into a course file".
---

# Course Chapter Summarizer

Convert a YouTube educational video into a well-structured course-note markdown file with full
transcript-backed prose, inline equations, and clean section headings.

## Workflow

### Step 1 — Extract the transcript

Run the yt-video-summarizer extractor from the project's skill directory:

```bash
python3 /Users/xuyin/Documents/Repository/snow-knowledge-database/.claude/skills/yt-video-summarizer/scripts/extract_video_context.py \
  --url "<video_url>" \
  --out-dir "/tmp/course-chapter-summarizer/<slug>"
```

If YouTube returns an anti-bot error, retry with:
```bash
... --cookies-from-browser chrome
```

Read the outputs:
- `/tmp/course-chapter-summarizer/<slug>/transcript.txt` — main source of truth
- `/tmp/course-chapter-summarizer/<slug>/metadata_summary.json` — title, date, channel

If extraction fails entirely, fall back to writing from knowledge (only for well-known public
educational videos). Note the fallback clearly in the file's Metadata section.

### Step 2 — Determine file location

Ask the user (or infer from context) where to save the file:
- `courses/<course-name>/<NN>-<slug>.md`

Use two-digit chapter numbers (`01`, `02`, …) so files sort correctly.

### Step 3 — Write the markdown file

Use the **exact output structure** described below. Do not invent new sections or skip required ones.

---

## Output Structure

```markdown
---
tags: [<topic>, math, 3blue1brown, <chapter-specific-tags>]
source: <youtube_url>
---

# <Video Title — exact, no "Chapter N:" prefix>

## Metadata
- Topic page: <course topic URL, e.g. https://www.3blue1brown.com/topics/linear-algebra>
- Lesson page: <specific lesson URL if available, else omit>
- Video: <youtube_url>
- Date: <upload date, YYYY-MM-DD>

## Outline
1. [<Section A>](#<anchor-a>)
2. [<Section B>](#<anchor-b>)
3. ...

---

## <Section A>

<Prose paragraph explaining the concept. Write in complete sentences. Do NOT use bullet points
for the main content — this is a textbook-style note, not a list.>

<Key equation, rendered in a $$ block, followed immediately by a variable legend:>

$$
<equation>
$$

- $x$: what x represents
- $y$: what y represents

<Continue prose that interprets or applies the equation.>

---

## <Section B>

...
```

---

## Writing Rules

**Prose over bullets.** Each section should read like a well-written textbook paragraph.
Bullet points are only appropriate for variable legends under equations, or short reference lists.
The goal is a note that someone can read and understand — not a list of facts to memorize.

**Equations inline with explanations.** Never dump all equations at the end. Each equation
belongs in the section where it's introduced, with a variable legend and a sentence explaining
what it means geometrically or intuitively.

**Section anchors.** The outline must use Markdown anchor links matching the section headings.
Use lowercase, hyphens for spaces. Example: `[The Determinant](#the-determinant)`.

**Horizontal rules.** Place `---` between every section (after the outline, and between all `##` content sections).

**No "Key Takeaways" or "Essence" sections.** The insight belongs inside the section where it
appears. A strong closing sentence at the end of the last section serves the same purpose without
a redundant header.

**Title format.** Use the exact video title as the `#` heading. Do not prefix with "Chapter N:".
Chapter numbers live only in the filename.

**Metadata date.** Use `YYYY-MM-DD`. If the upload date is unavailable, write `unknown`.

---

## Example (abbreviated)

```markdown
---
tags: [neural-networks, deep-learning, math, 3blue1brown, gradient-descent]
source: https://www.youtube.com/watch?v=IHZwWFHWa-w
---

# Gradient Descent — How Neural Networks Learn

## Metadata
- Topic page: https://www.3blue1brown.com/topics/neural-networks
- Lesson page: https://www.3blue1brown.com/lessons/gradient-descent
- Video: https://www.youtube.com/watch?v=IHZwWFHWa-w
- Date: 2017-10-16

## Outline
1. [The Cost Function](#the-cost-function)
2. [Gradient Descent Update Rule](#gradient-descent-update-rule)

---

## The Cost Function

To measure how wrong the network is, we define a **cost function** that aggregates error over
all training examples. The Mean Squared Error (MSE) sums the squared distance between the
network's output and the desired label:

$$
C(\mathbf{W}, \mathbf{b}) = \frac{1}{n} \sum_{x} \left\| \mathbf{y}(x) - \mathbf{a}^{(L)}(x) \right\|^2
$$

- $n$: number of training examples
- $\mathbf{y}(x)$: desired output for input $x$
- $\mathbf{a}^{(L)}(x)$: network's actual output

The cost is small when the network's outputs closely match the labels, and large when it is
frequently wrong. Training is the search for weights and biases that make this number small.

---

## Gradient Descent Update Rule

...
```
