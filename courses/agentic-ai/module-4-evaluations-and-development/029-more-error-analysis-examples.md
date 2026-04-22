---
tags: [agentic-ai, deeplearning-ai, course, evaluation, error-analysis, debugging, evals]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/0kbds1/more-error-analysis-examples
---

## Pre-test

1. In a multi-component agentic pipeline, why does error analysis recommend focusing exclusively on the examples where the system produces incorrect output rather than reviewing all examples uniformly?

2. When error counts across pipeline components do not add up to 100%, what does that reveal about the nature of the failures being tracked?

3. After performing error analysis on a customer-email-response workflow and discovering that 75% of failures originate from the LLM's SQL query generation, what are the two most impactful next actions a developer should take, in priority order?

---

# Lecture 029: More Error Analysis Examples

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/0kbds1/more-error-analysis-examples) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

- [Why Multiple Examples Build Intuition](#why-multiple-examples-build-intuition)
- [Invoice Processing: Isolating the Date Extraction Bug](#invoice-processing-isolating-the-date-extraction-bug)
- [Customer Email Response: Pinpointing Query Generation Failures](#customer-email-response-pinpointing-query-generation-failures)
- [From Error Analysis to Targeted Improvement](#from-error-analysis-to-targeted-improvement)

---

## Why Multiple Examples Build Intuition

Error analysis is a skill that sharpens with repetition. Seeing one worked example gives a developer a rough template; seeing multiple examples across different domains is what ingrains the underlying reasoning pattern well enough to apply it independently on new workflows. This lecture walks through two concrete cases — invoice processing and customer email response — to deepen that practical intuition.

---

## Invoice Processing: Isolating the Date Extraction Bug

The invoice-processing workflow is a deterministic pipeline. A PDF-to-text converter reads the raw invoice document and produces structured text, and an LLM then extracts four required fields — including the due date — and writes them to a database. In earlier discussion, the system was observed to frequently extract the wrong due date.

To diagnose the root cause, the approach is to assemble a focused sample of 10 to 100 invoices on which the system got the due date wrong, ignoring all invoices where it succeeded. Reviewing only failures keeps the analysis efficient and concentrated on signal. For each failing invoice, a developer manually checks two things: (1) whether the PDF-to-text component produced text from which a human could determine the correct due date, and (2) given that text, whether the LLM chose the right date or confused the due date with a different date on the invoice (such as the invoice-issue date).

Tabulating those counts across, say, 20 invoices typically reveals a clear imbalance. In this example, the LLM date-extraction step is responsible for a substantially larger share of errors than the PDF-to-text step. That finding directly guides the next engineering decision: invest effort in improving the LLM extraction prompt or logic rather than spending weeks tuning the PDF parser — which would have produced little or no gain.

One important accounting note: error percentages across components are allowed to sum to more than 100%, because the failure categories are not mutually exclusive. A single invoice can fail at both the PDF-to-text stage and the LLM stage simultaneously.

---

## Customer Email Response: Pinpointing Query Generation Failures

The customer-email-response workflow is an agentic pipeline with three distinct stages. First, an LLM reads an incoming customer email and writes a database query (typically SQL) to fetch the relevant order details. Second, the database executes that query and returns the data. Third, the LLM drafts a response email for a human reviewer, drawing on the retrieved data.

Failures in this workflow can originate at any stage. The LLM might write an incorrect query — asking for the wrong table or constructing malformed SQL. The database itself might contain corrupt or missing records, so even a perfectly formed query returns wrong data. Finally, the LLM might write a final email that is unclear or inaccurate despite having correct data available.

The same error-analysis process applies: collect a set of email conversations where the final output was rated unsatisfactory, then examine each one individually to attribute the failure to its root cause. As a developer steps through the examples, patterns emerge. In a representative analysis, database query errors might account for 50% or more of the failures, data corruption in the database for a smaller fraction, and email-drafting errors for perhaps 30%.

If, for example, 75% of all observed failures trace back to flawed database queries, that single number makes the prioritization obvious: improving the query-generation prompt is the highest-leverage intervention available. The second priority would be refining the email-drafting prompt. Addressing database data quality is a legitimate concern but a lower-priority one given the frequency distribution.

---

## From Error Analysis to Targeted Improvement

The practical value of error analysis is that it converts a vague sense that "the system makes mistakes" into a ranked list of specific components to address. Without it, engineering teams can invest weeks or months tuning a component that contributes only marginally to overall error, while the primary failure source goes unaddressed.

Once error analysis has identified the highest-impact component, the next natural step is to evaluate that component in isolation rather than only measuring end-to-end system performance. End-to-end evals confirm whether the full pipeline improves, but component-level evals make the improvement loop tighter and faster: a developer can iterate on the query-generation prompt, run a focused eval on that component alone, and confirm the fix before re-running the slower full-pipeline eval. That combination — end-to-end evals plus component-level evals — is the foundation of efficient agentic AI development, and it sets the stage for the component-level evaluation methods covered in the next lesson.

---

## Post-test

1. In the invoice processing example, which pipeline component was identified as responsible for the majority of due-date extraction errors, and what does this imply about where engineering effort should be directed?

2. What is the purpose of limiting error-analysis reviews to failing examples only (i.e., the 10–100 examples where the system got it wrong), rather than reviewing the full dataset?

3. Why is it beneficial to run both end-to-end evaluations and component-level evaluations together when improving an agentic workflow?

> [!example]- Answer Guide
> 
> #### Q1 — LLM Step Responsible for Errors
> 
> The LLM date-extraction step was responsible for the majority of errors, not the PDF-to-text converter. This implies engineering effort should focus on improving the LLM prompt or logic for extracting the due date, rather than tuning the PDF parser — which would have negligible impact on the observed failures.
> 
> #### Q2 — Reviewing Failing Examples Only
> 
> Focusing on failing examples concentrates attention on the signal that reveals what is going wrong. Reviewing successes alongside failures dilutes the analysis and wastes time; the goal is to identify failure modes, and those only appear in examples where the system failed.
> 
> #### Q3 — End-to-End and Component Evaluations
> 
> End-to-end evaluations confirm whether the full pipeline's output quality improves, providing the ultimate measure of success. Component-level evaluations allow faster iteration on the specific component that error analysis identified as the bottleneck — the developer can tune and test that component in isolation without waiting for the slower full-pipeline eval each time. Together they provide both speed and correctness assurance.
