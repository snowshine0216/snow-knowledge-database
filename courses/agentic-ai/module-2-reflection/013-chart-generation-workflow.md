---
tags: [agentic-ai, deeplearning-ai, course, reflection, chart-generation, workflow, code-execution]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/moivym/chart-generation-workflow
---

## Pre-test

1. In the chart generation workflow described in this lesson, why is a multimodal LLM specifically required for the reflection step rather than a standard text-only LLM?
2. When prompting an LLM to reflect on a generated chart, what three concrete evaluation criteria does the instructor recommend providing, and why does specifying criteria improve reflection quality?
3. The instructor mentions that reflection improves performance "by a little bit on some, by a lot on some others, and barely any at all on others." What practical implication does this variability have for teams building production applications?

---

# Lecture 013: Chart Generation Workflow

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/moivym/chart-generation-workflow) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [The Chart Generation Task](#the-chart-generation-task)
- [First-Pass Generation and Its Shortcomings](#first-pass-generation-and-its-shortcomings)
- [Using a Multimodal LLM for Visual Reflection](#using-a-multimodal-llm-for-visual-reflection)
- [Structuring the Reflection Prompt](#structuring-the-reflection-prompt)
- [Mixing Models Across Stages](#mixing-models-across-stages)
- [Evaluating Whether Reflection Is Worth It](#evaluating-whether-reflection-is-worth-it)

---

## The Chart Generation Task

The coding lab accompanying this module centers on a chart generation workflow. The agent works with sales data from a coffee machine — records of when various drinks (latte, cappuccino, hot chocolate, and others) were sold and at what price. The objective is for the agent to produce a well-designed bar plot that compares Q1 (first quarter) coffee sales across 2024 and 2025.

The input to the system is a CSV file containing the raw sales records. The task is fully open-ended from the agent's perspective: it must decide what type of chart to produce, how to organize the data visually, and how to make the result legible. This makes chart generation an excellent testbed for the reflection pattern, because the quality of a visualization is something that can be evaluated visually by a human — or, critically, by a multimodal model.

---

## First-Pass Generation and Its Shortcomings

The straightforward approach is to prompt an LLM directly: describe the dataset, specify the comparison to be made, and ask it to write Python code that generates the plot. The LLM produces code, the code executes, and a chart appears. In principle this is sufficient; in practice the first-pass output is often disappointing.

When the instructor ran this workflow, the first-pass code generated a stacked bar chart. A stacked bar chart merges the two years' data into a single bar per category, making direct year-over-year comparison difficult to read at a glance. It is technically a valid visualization of the data, but it does not serve the analytical intent well. The chart was described as not "a very easy way to visualize things" and simply not a good plot.

This gap between technically correct and genuinely useful is precisely where reflection adds value. The model succeeded at the narrow task of generating runnable charting code, but the output did not satisfy the underlying goal of clear, readable comparison. A reflection step gives the system an opportunity to close that gap.

---

## Using a Multimodal LLM for Visual Reflection

The key insight in this workflow is that chart quality is a visual property. To reflect meaningfully on whether a chart is clear and well-designed, the model needs to actually see the chart — not just read the code that produced it. This is why the reflection step requires a multimodal LLM, one that accepts both image and text inputs.

The reflection call is constructed by passing three things to the multimodal model: the version-one code, the image of the chart that the code produced, and an instruction to examine the image, critique the visualization, identify ways to improve it, and then rewrite the code to produce a better chart. The model can apply visual reasoning directly to the figure — it is not limited to inferring chart quality from code structure alone.

When the instructor applied this approach, the reflection step produced code for a grouped bar chart rather than a stacked one. The 2024 and 2025 bars for each drink category were placed side by side, making the year-over-year comparison immediate and intuitive. The result was both more pleasing aesthetically and clearer analytically. The improvement came not from the model reasoning about code correctness, but from it reasoning about visual communication.

---

## Structuring the Reflection Prompt

The design of the reflection prompt matters significantly. Simply asking a model to "improve this chart" leaves too much ambiguity about what improvement means. The instructor recommends framing the reflection by assigning the model a role — for example, instructing it to act as an expert data analyst providing constructive feedback — and then specifying concrete evaluation criteria.

Three criteria highlighted in the lecture are readability, clarity, and completeness. Providing explicit dimensions of evaluation helps the model direct its analysis rather than producing vague commentary. When the model knows it should assess whether a viewer can quickly read the legend, whether the axes are labeled clearly, and whether all relevant data is represented, its critique becomes more actionable and the revised code more reliably addresses the actual problems.

The reflection prompt can also include the conversation history from the original code-generation step. Having visibility into how the first version was produced — what the model was told and how it reasoned — gives the reflecting model additional context for understanding what the original intent was and where the execution fell short.

---

## Mixing Models Across Stages

Because different LLMs have different strengths, there is no requirement to use the same model for both the initial generation and the reflection. The instructor explicitly frames this as a design parameter to experiment with.

For initial code generation, a capable generative model such as GPT-4 or a similar frontier model is a natural fit: it is fluent at writing Python, understands charting libraries, and can produce plausible code quickly. For reflection, particularly when the goal is rigorous critique and identification of shortcomings, a reasoning model may outperform a standard generative model. Reasoning models are structured to reason step by step rather than to generate fluently, making them well-suited to the analytical task of finding what is wrong and why.

Practitioners building chart generation workflows should treat the model pairing as a hyperparameter. Different combinations of generation model and reflection model produce different results, and the best pairing for a given application is an empirical question rather than something that can be determined from first principles.

---

## Evaluating Whether Reflection Is Worth It

The lecture closes with a calibrating observation about the reflection pattern in general: its impact varies considerably across applications. For some tasks, reflection produces large, noticeable improvements in output quality. For others, the gain is modest. For still others, adding a reflection step produces almost no measurable benefit.

This variability has a direct practical implication. Before committing to a reflection-based architecture for a production system, a team should measure the actual performance impact on their specific application. The lecture frames this as motivation for evaluations — systematic benchmarks that quantify how much reflection improves outputs for the task at hand.

Understanding the impact of reflection also provides actionable guidance: if the measured gain is small, the next step is to examine whether the initial generation prompt or the reflection prompt can be improved, or whether richer external feedback can be introduced into the reflection step. The upcoming lesson on evaluations for reflection workflows addresses exactly this kind of systematic assessment.

---

## Post-test

1. Why is a multimodal LLM required for the reflection step in the chart generation workflow, and what specific capability does it bring that a text-only LLM cannot provide?
2. What three evaluation criteria does the instructor recommend including in the reflection prompt, and what is the purpose of specifying them explicitly?
3. Given that reflection improves performance "by a lot" on some applications and "barely any at all" on others, what should a development team do before adopting reflection as a core architectural decision?

---

<details><summary>Answer Guide</summary>

**Q1 — Why a multimodal LLM is required:**
Chart quality is fundamentally a visual property. A text-only LLM can read the code that produced the chart but cannot see the chart itself, so it must infer visual quality from code structure alone — a much weaker signal. A multimodal LLM accepts the rendered chart image as input and applies visual reasoning directly to assess whether the chart is clear, readable, and well-designed. In the lesson's example, this allowed the model to recognize that a stacked bar chart was harder to read than a grouped bar chart for year-over-year comparison, and to rewrite the code accordingly.

**Q2 — Evaluation criteria in the reflection prompt:**
The three criteria are readability, clarity, and completeness. Specifying them explicitly narrows the model's analytical focus: rather than producing generic commentary, it assesses whether specific, defined properties are present in the chart. This makes the critique more actionable and the resulting code revision more likely to address the actual weaknesses of the original visualization.

**Q3 — What to do before adopting reflection:**
Teams should measure the actual performance impact of reflection on their specific application before committing to it architecturally. Since gains range from large to negligible depending on the task, empirical evaluation — using benchmarks or evaluations — is the only reliable way to determine whether reflection is worth the added cost and complexity. If the gain is small, the team should then investigate whether tuning the initial generation prompt, the reflection prompt, or introducing richer external feedback can increase the benefit.

</details>
