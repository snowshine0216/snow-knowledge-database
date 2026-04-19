---
tags: [agentic-ai, deeplearning-ai, course, llm, agents, applications, use-cases]
source: https://learn.deeplearning.ai/courses/agentic-ai/lesson/bvuwkr/agentic-ai-applications
---

## Pre-test

1. What characteristic of a task makes it relatively easy to implement as an agentic workflow, and what characteristic makes it significantly harder?
2. In the customer order inquiry example, what role does human review play before the final email response is sent — and why might this design choice matter?
3. Computer-use agents face specific failure modes when navigating web browsers. Name at least two concrete challenges described in this lesson, and explain why they arise.

---

# Lecture 005: Agentic AI Applications

**Source:** [Agentic AI](https://learn.deeplearning.ai/courses/agentic-ai/lesson/bvuwkr/agentic-ai-applications) · DeepLearning.AI · Instructor: Andrew Ng

## Outline

1. [Invoice Processing — Structured Workflow with Clear Steps](#invoice-processing)
2. [Customer Order Inquiry — Human-in-the-Loop Design](#customer-order-inquiry)
3. [General Customer Service Agent — Dynamic Planning Required](#general-customer-service-agent)
4. [Computer-Use Agents — Cutting-Edge and Challenging](#computer-use-agents)
5. [What Makes Tasks Easier or Harder for Agentic Workflows](#difficulty-spectrum)

---

## Invoice Processing — Structured Workflow with Clear Steps

One of the clearest entry points into agentic AI is invoice processing. In many finance departments, a human examines incoming invoices and manually extracts the most important fields — the biller's name, the biller's address, the amount due, and the due date — then records these values in a database to ensure timely payment. This is exactly the kind of repetitive, well-defined work that agentic workflows can automate reliably.

An agentic implementation of invoice processing might look like this. An incoming invoice PDF is first passed through a PDF-to-text conversion API, which transforms it into structured text such as Markdown. The resulting text is then fed to a language model, which performs two distinct tasks. First, it determines whether the document is actually an invoice or some other file that should be ignored. Second, if it is an invoice, it extracts the required fields and calls a database-update tool to record those values in the appropriate database records.

What makes this workflow tractable is that the process is fully specified before execution begins. There is a clear, linear sequence of steps: convert, classify, extract, record. Tasks with this quality — where a standard operating procedure already exists — tend to be good candidates for reliable agentic implementation. When the steps are known in advance and each step feeds cleanly into the next, the agent does not need to reason about what to do; it just needs to execute each step correctly.

---

## Customer Order Inquiry — Human-in-the-Loop Design

A somewhat more complex application is an agent that responds to customer email inquiries about their orders. The high-level steps are to extract key information from the email (what exactly did the customer order, and what is their name), then look up the relevant records in an orders database, and finally draft a response email for human review before it is actually sent to the customer.

This workflow introduces a nuance that the invoice-processing example lacked: the agent does not act autonomously all the way to completion. Instead, the language model uses a "request review" tool that places the drafted email into a queue for a human to inspect and approve before it is sent. This human-in-the-loop design is a deliberate architectural choice. Even when the agent's reasoning is mostly correct, placing a human reviewer at the final step catches errors before they reach the customer, preserving trust and reducing the cost of mistakes.

Technically, the flow works as follows. The customer email is passed to an LLM, which extracts order details. Assuming the email is order-related, the LLM then calls an orders-database tool, receives the relevant records, and uses them to draft a response. Rather than sending the response directly, the agent calls a review-request tool that routes the draft to a human operator. This pattern — autonomous drafting combined with human approval — represents a practical middle ground that many businesses adopt when deploying customer-service agents today.

---

## General Customer Service Agent — Dynamic Planning Required

The previous customer order example assumed the agent's task was narrowly scoped: answer questions about a specific order. A more ambitious design aims to handle any question a customer might ask, which requires the agent to plan its own sequence of steps rather than follow a fixed procedure.

Consider two contrasting queries. A customer asks, "Do you have any black jeans or blue jeans?" To answer this, the agent must recognize that the question covers two separate inventory checks, issue two distinct database queries (one for black jeans, one for blue jeans), and then synthesize the results into a coherent reply. The required steps are not hard-coded anywhere; the agent must infer them from the question itself.

A second example makes this even clearer. A customer asks to return a beach towel. Processing this request involves a chain of conditional logic: verify that the customer actually purchased the item, check the return policy (perhaps returns are only allowed within 30 days of purchase and only for unused items), and if all conditions are met, issue a return packing slip and update the database record to "return pending." The agent must decide on its own that these three steps are the right ones, in the right order, for this particular request.

This kind of dynamic planning — where the steps are not known ahead of time and the agent must reason about what to do as it goes — is considerably harder than executing a fixed procedure. The system becomes less predictable, less reliable, and more sensitive to the quality of the underlying language model's reasoning. It is an active area of research and development, and future lessons will explore techniques for approaching it more systematically.

---

## Computer-Use Agents — Cutting-Edge and Challenging

Among the most ambitious agentic applications today are computer-use agents: systems that operate a web browser or desktop interface to carry out tasks on behalf of users. Rather than calling structured APIs, these agents interact with graphical interfaces the same way a human would — reading page text, clicking elements, and navigating between pages.

A concrete example illustrates both the promise and the difficulty. Given the task "check whether seats are available on two specific United Airlines flights from San Francisco to Washington D.C.," a computer-use agent can autonomously navigate to the United Airlines website, interpret the page content, interact with the booking interface, and attempt to retrieve the seat-availability information. When the United site presents difficulties, the agent adapts — it navigates instead to Google Flights, finds matching options, and returns to United to confirm availability.

This adaptive behavior is impressive. But it also highlights why computer-use agents are not yet reliable enough for mission-critical applications. Web pages that load slowly can confuse an agent that does not understand the difference between a page still loading and a page indicating an error. Many web interfaces are visually complex in ways that exceed an agent's ability to parse accurately. And unlike structured API calls, browser interactions are brittle: small changes to a website's layout can break an agent's ability to complete a task it previously handled correctly.

Despite these limitations, computer-use agents represent an important frontier. A large fraction of real-world tasks that humans perform on computers involve navigating interfaces rather than calling APIs, and agents that can reliably use those interfaces would be extraordinarily capable. Research in this area is active and advancing.

---

## What Makes Tasks Easier or Harder for Agentic Workflows

Across these four examples, a pattern emerges. The spectrum of task difficulty for agentic workflows can be understood along two main axes.

Tasks are easier when they involve a clear, pre-specified sequence of steps. If a business already has a standard operating procedure — a well-defined process that a human would follow — translating that procedure into an agentic workflow is substantial engineering work, but it is tractable and tends to yield reliable results. Invoice processing is an example of this end of the spectrum. Working with text-only inputs also makes tasks easier, because language models were fundamentally designed to process text, and adding other modalities introduces additional complexity and potential failure points.

Tasks are harder when the required steps are not known in advance and the agent must plan or adapt as it goes. The general customer service agent illustrates this: because any question is possible, the agent cannot rely on a fixed procedure. Instead it must reason about each situation as it arises. This reasoning is less predictable and more error-prone than executing a fixed sequence. Similarly, tasks that require processing rich multimodal inputs — audio, images, video — are generally less reliable than text-only tasks, because the models' capabilities in those modalities are less mature.

One of the most valuable skills when building agentic systems is the ability to examine a complex, open-ended workflow and decompose it into discrete, manageable steps. The act of decomposition — identifying what the steps are, what information each step requires, and how the output of one step feeds into the next — is often the critical design work that determines whether an agentic implementation succeeds or struggles. The next lesson will explore task decomposition in detail as a core technique for implementing reliable agentic workflows.

---

## Post-test

1. What two properties of the invoice-processing task make it a relatively easy candidate for an agentic workflow, compared to the general customer service agent?
2. Explain the purpose of the "request review" tool in the customer order inquiry agent. What failure mode does this design decision help prevent?
3. Why do computer-use agents fail when web pages load slowly, and what does this reveal about a fundamental limitation of current agentic systems when operating outside structured APIs?

> [!example]- Answer Guide
>
> #### Q1 — Invoice Processing Ease Factors
>
> Invoice processing is easier for two reasons. First, the required steps are known ahead of time — convert to text, classify as invoice, extract fields, update the database — so the agent follows a fixed procedure rather than reasoning about what to do. Second, the task is entirely text-based: the PDF is converted to Markdown text before the LLM processes it, keeping the agent in a modality where LLMs are most capable.
>
> #### Q2 — Purpose of Request Review Tool
>
> The "request review" tool routes the agent's drafted email to a human operator for approval before it is sent to the customer. This prevents the agent from delivering a flawed or incorrect response directly to a real customer. Because the agent's reasoning about order details could be wrong — or the drafted reply could be poorly phrased — having a human review step catches errors at the boundary between the automated system and the external world, reducing the risk of customer-facing mistakes.
>
> #### Q3 — Computer-Use Agents and Slow Pages
>
> Computer-use agents fail with slow-loading pages because they cannot distinguish between a page that is still loading and a page that has fully loaded with a negative result (such as "no availability"). They interpret the ambiguous state incorrectly and either act prematurely or conclude the task has failed. This reveals a broader limitation: current agentic systems are trained to process content, not to reason about the state of an interface or the process by which that content is being delivered. Web interfaces assume a human user who can wait, notice loading spinners, and adjust accordingly — capabilities that require contextual awareness that current agents lack.
