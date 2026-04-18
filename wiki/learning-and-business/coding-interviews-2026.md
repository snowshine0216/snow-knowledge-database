---
tags: [coding-interviews, hiring, ai-coding, leetcode, claude-code, codex, software-engineering, ml-engineering, t-shaped-engineer, marina-wyss]
source: https://www.youtube.com/watch?v=Do8VuokPbBc
---
# Coding Interviews 2026: The Fractured Landscape

Marina Wyss reports back from a Pragmatic Summit hiring-manager round table (~500 senior engineers, 20-person panel): the coding-interview landscape has not shifted in one direction — **it has fractured into four incompatible games** running in parallel. CoderPad's 2026 report shows roughly **⅓ of companies ban AI entirely, ½ allow it in some form, the rest decide case-by-case**; HackerRank reports **43% of assessments still include LeetCode-style algo questions while 78% of devs say those assessments don't reflect real work**. The single highest-ROI prep tactic is almost embarrassingly simple: **ask the recruiter what the company is actually testing for** — using a specific phrasing — because most candidates skip this step and prepare for the wrong exam.

## Key Concepts

- **Mode A — AI arms race (no-AI camp)**: Google, Amazon-style. Browser activity logged, copy-paste restricted, no logged-in tools. Old signal: write correct code from scratch under time pressure. Now layered with weird verification rituals (Loom identity proofs, "submit your resume via POST request") because of bot-resume + impersonation chaos.
- **Mode B — AI-native (Meta-style two-stage)**: Stage 1 take-home with AI explicitly allowed. Stage 2 live pair-programming where you explain and extend what you built. Evaluators check prompting quality, code review instincts, testing strategy, debugging — and *whether you had the patience to actually read everything*.
- **Mode C — GitHub-as-interview**: deep specific questions about your real projects ("why this architecture?"). One hiring manager headhunts directly from open-source commits — not even posting jobs. Rules out shallow tutorial copies and AI-vibed projects you don't understand.
- **Mode D — ML from scratch**: still alive for ML/DS roles. Expect to implement logistic regression or K-means by hand. The under-the-hood understanding requirement hasn't softened.
- **T-shaped engineer**: convergence point across all modes — deep specialty plus working knowledge of the full stack. Front-end-only or back-end-only is "no longer considered reasonable."
- **Format-proof skills**: product thinking (do you understand *why* you're building it? can you push back on a bad spec?), comfort with ambiguity (especially in probabilistic AI systems), communication ("if you can't communicate your thinking, it doesn't matter how good your thinking is").
- **The recruiter ask**: *"I want to come as prepared as possible. Since there are so many different focus areas in interviews right now, I'd really appreciate any guidance on what to prioritize for this role."* If they refuse, that's a company signal.

## Key Numbers

| Number | What it measures |
|---|---|
| ~⅓ / ~½ / rest | Companies banning AI / allowing some / case-by-case (CoderPad 2026) |
| 43% | Assessments still including LeetCode-style algo questions |
| 78% / 56% | Devs who say assessments don't reflect work / call algos irrelevant (HackerRank) |
| 30-38% | Share of assessments using pair programming / system design / real-world sims |
| 4 modes | Distinct interview "games" candidates may face |

## Key Takeaways

- **Identify the game before training for it.** Blind preparation is "the least efficient strategy." Wyss almost prepped system design for a company that secretly wanted LeetCode — only saved by pushing past a recruiter's vague "production-level coding" answer (it meant LeetCode).
- **Default mode: build something real with AI, line by line.** Single highest-overlap activity — covers Mode B (take-home + extension), Mode C (GitHub portfolio), product thinking, and system-design instincts simultaneously.
- **Keep a DSA baseline.** Not 5 hours/day — just sharp enough that a LeetCode medium doesn't ruin your day if you hit Mode A.
- **Read the AI's code.** "In a world where AI can generate a thousand lines in seconds, the differentiator is whether you'll actually slow down and read it." Hiring managers explicitly screen for the candidate "who's not outsourcing their thinking."
- **Use the recruiter script.** Verbatim — it shows thoughtfulness without asking for answers, and it's the cheapest way to convert weeks of misdirected prep into targeted prep.

## See Also
- [[best-ml-courses-2026]] — Wyss's companion ranking of the courses that build the underlying skills, especially for Mode D (ML from scratch).
- [[learning-retention-system]] — Wyss's study system; underlies the "build something real and remember it" prep mode.
- [[karpathy-loopy-era-ai]] — broader framing of how AI-native development is reshaping engineering work and hiring signals.
