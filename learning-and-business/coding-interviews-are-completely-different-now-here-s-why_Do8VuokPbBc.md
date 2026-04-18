---
tags: [coding-interviews, hiring, ai-coding, leetcode, claude-code, codex, software-engineering, ml-engineering, t-shaped-engineer, marina-wyss]
source: https://www.youtube.com/watch?v=Do8VuokPbBc
wiki: wiki/concepts/coding-interviews-2026.md
---

# Coding Interviews Are Completely Different Now (Here's Why)

## Video Info
- URL: https://www.youtube.com/watch?v=Do8VuokPbBc
- Platform: YouTube
- Title: Coding interviews are completely different now (here's why)
- Speaker: Marina Wyss (Senior Applied Scientist at Twitch/Amazon)
- Channel: Marina Wyss - AI & Machine Learning (@MarinaWyssAI)
- Upload date: 2026-03-31
- Venue context: synthesizes a 20-person hiring-manager round table at the **Pragmatic Summit** (~500 senior engineers + hiring managers)
- Upload date: 2026-03-31
- Duration: 12:19
- Views / likes / comments: 49,694 views / 1,228 likes / 92 comments (at extraction time)
- Category and tags: Education; coding, vibecoding, ai coding, claude code, cursor, codex, leetcode, tech interviews

## Executive Summary

Marina Wyss reports back from a Pragmatic Summit hiring-manager round table: the coding-interview landscape has not shifted in one direction — **it has fractured into four incompatible games** running in parallel. Companies are split roughly into AI-banned (Google, Amazon style — old LeetCode signals), AI-native (Meta-style "use AI then explain it" two-stage assessments), GitHub-as-portfolio (your real projects *are* the interview), and ML-from-scratch (still ask you to implement logistic regression by hand). Underneath the format chaos, hiring managers converge on one archetype — the **T-shaped engineer** with product thinking, comfort with ambiguity, and clear communication. The single highest-ROI prep tactic is almost embarrassingly simple: **ask the recruiter what the company is actually testing for.** Default prep: build something real with AI you understand line-by-line, plus stay sharp enough on data structures that a LeetCode medium doesn't ruin your day.

## Outline

1. **How have coding interviews changed in the era of AI?** — the landscape didn't shift, it fractured; contradictory online takes reflect real industry disagreement.
2. **The four types of coding interviews in 2026** — sponsor segue (Codex vs. Claude Code) into the four-mode taxonomy.
3. **AI-native interviews** — Meta-style two-stage: AI-allowed take-home + live extension; signal is whether you actually read what the AI generated.
4. **Project-based interviews** — your GitHub *is* the interview; one hiring manager headhunts directly from open-source commits.
5. **ML from scratch** — for ML/data roles, still expect to implement logistic regression or K-means by hand.
6. **What hiring managers are looking for** — the T-shaped engineer; product thinking, ambiguity tolerance, communication are format-proof.
7. **The best strategy for preparation** — just ask the recruiter; how to phrase the question.
8. **How to study** — default to building real things with AI you understand; keep DSA baseline so a medium doesn't kill you.

## Detailed Chapter Summaries

### 1. How have coding interviews changed in the era of AI?
> **Segment**: 00:00-03:31

Wyss returns from the **Pragmatic Summit** — ~500 top engineers + hiring managers — where she sat on a 20-person hiring-manager round table about how they're actually hiring right now. Her thesis: the takes online are contradictory ("LeetCode is dead" vs. "more important than ever"; "build projects" vs. "projects don't matter, you need system design") **because the industry itself has no consensus**.

**Hard data — CoderPad 2026 State of Tech Hiring Report**: company AI policy is split roughly into **~⅓ ban AI entirely, ~½ allow it in some form, the rest decide case-by-case**.

**HackerRank developer survey**:
- **43% of technical assessments still include LeetCode-style algorithm questions**
- **78% of developers** say these assessments don't reflect real-world work (more so in the AI era)
- **56%** say algorithm questions are straight-up irrelevant to their jobs
- Pair programming, system design, and real-world simulations each appear in **~30-38%** of assessments

> "Company A might give you a LeetCode hard with no AI. Company B might send a take-home, tell you to use Claude or Cursor, then grill you in a live session on whether you understood what the AI implemented. Company C might skip all that and ask you to walk through one of your past projects. **These aren't variations on the same test, they are fundamentally different exams.**"

The risk: if you don't know which game your target company plays, you're studying for the wrong exam.

### 2. The four types of coding interviews in 2026
> **Segment**: 03:31-05:10

#### Sponsor segue
HubSpot "AI Coding Showdown" guide compares **OpenAI Codex vs. Claude Code** with a decision framework: e.g., rapid-prototyping 5 variations of an idea in 10 min calls for one tool, building production-ready maintainable code calls for the other. Skipped from summary; relevant only because hiring managers in AI-allowed interviews "are watching how you use AI, which tools you use, and whether you know what those tools are actually good at."

The four modes get walked through in chapters 3-5 (modes A, B, C, D). The framing: it's not about which mode is "right" — it's about identifying which one your target company plays so you can train for it.

### 3. AI-Native interviews (Mode B — paired with Mode A)
> **Segment**: 05:10-06:44

#### Mode A — The AI arms race (no-AI camp)
- **Google** has reportedly told candidates that using AI during interviews can lead to disqualification.
- **Amazon's assessment** logs browser activity, restricts copy-paste, allows public resources but blocks anything behind a login (rules out most AI tools).
- These companies preserve the old signal: "Can you write correct code from scratch under time pressure?"

But the same companies are battling an **AI arms race in the funnel**: AI-generated resumes submitted by bots, AI-screened by the company, candidates using AI to pass online assessments. One hiring manager described **hiring someone via remote interviews where a completely different person showed up to work on day one**. Defenses include Loom-video identity proofs and one company that requires **submitting your resume via a POST request** — "if you can't make a simple API call, they don't want to talk to you."

#### Mode B — AI-native (Meta-style)
**Meta** has piloted AI-enabled coding interviews. Multiple summit hiring managers described what Wyss thinks will become standard: **a two-stage assessment**.

- **Stage 1 — Take-home**: explicitly told to use AI.
- **Stage 2 — Live pair programming**: explain and extend what you built (add a feature, refactor a section).

> "This is where they actually learn about you, because now they can see whether you understand what's in that code base or whether you just accepted whatever the AI spit out."

What they evaluate in stage 2:
- **Prompting quality**
- **Code review instincts**
- **Testing strategy**
- **Debugging**
- **Whether the candidate has the patience to actually read everything**

> "In a world where AI can generate a thousand lines of code in seconds, the differentiator is whether you'll actually slow down and read it, catch the subtle bug, notice the security issue, or recognize when you need to push back on what the AI approach has done. They're basically just looking for the person who's not outsourcing their thinking."

### 4. Project-based interviews (Mode C)
> **Segment**: 06:44-07:39

For some companies, **your GitHub has become the interview**. Instead of testing live coding, they ask deep specific questions about your real projects: *"Why did you choose this architecture over that one? What would you do differently now?"*

One hiring manager said he **looks at commits on open-source repos and headhunts directly from there — not even posting jobs anymore.**

What this rules out:
- Shallow tutorial-copy projects
- "Fancy things you've vibe-coded and don't understand"

What it requires:
- Projects you genuinely care about
- Thoughtful commits
- Ability to talk about choices "like an engineer, not like someone who followed a tutorial or had AI do everything for them"

### 5. ML from scratch (Mode D)
> **Segment**: 07:39-08:17

Specific to ML / data science roles. Despite practical AI-enabled trends elsewhere, **for ML/DS interviews there's still a decent chance you'll be asked to implement an algorithm from scratch — logistic regression, K-means clustering**.

> "I think the reason is that these roles genuinely do require you to understand what's happening under the hood. So if you're in this space, classical ML fundamentals still matter. You can't skip them just because the software engineering interview world is evolving."

### 6. What hiring managers are looking for
> **Segment**: 08:17-09:37

Despite format disagreement, the round table converged on the **T-shaped engineer**: deep expertise in one area, broad capability across the stack. "Multiple people said it's no longer considered reasonable to only do front end or only do back end."

**Format-proof skills** (matter in every mode):

#### Product thinking
> "Not just *can you build it*, but *do you understand why you're building it*? Can you reason about what the user needs? Can you push back on a spec that doesn't make sense?"

This is "a huge differentiator and most candidates don't practice it at all."

#### Comfort with ambiguity and chaos
Especially relevant for AI-adjacent roles where output is probabilistic and things break in weird ways. "The people who can operate calmly in that environment are the ones who do better on the job."

#### Communication
> "Can you explain your trade-offs? Can you articulate why you made a decision? … If you can't communicate your thinking, it doesn't matter how good your thinking is."

> "The specific interview structure is just the surface layer. Underneath it, every hiring manager is asking the same fundamental question: can this person actually do the job, think clearly, and work effectively with the tools and people around them?"

### 7. The best strategy for preparation
> **Segment**: 09:37-11:15

> "Here's the single most underrated strategy I've found, and honestly, it's almost silly how simple it is. **Just ask the recruiter.**"

#### The vague-answer story
Wyss once asked a recruiter what to expect for a coding round. *"Production-level coding skills."* She pushed: what does that mean? *"LeetCode."*

> "And I was like, 'Oh, so literally the opposite of production-level coding. Good to know.'"

If she hadn't pushed past the vague answer, she'd have prepped system design and real-world debugging — completely wrong for that company.

#### How to phrase it
> "I want to come as prepared as possible. Since there are so many different focus areas in interviews right now, I'd really appreciate any guidance on what to prioritize for this role."

The framing matters: "You're not asking them to give you the answers. You're showing that you're thoughtful about your preparation."

**Diagnostic value**: a company that refuses to tell you anything about the format "is probably a place with other communication issues, too."

### 8. How to study (when no specific interview is lined up)
> **Segment**: 11:15-12:19

> "Default to building stuff. It's the highest overlap preparation across every mode."

The recommended baseline:
1. **Build something real with AI, and make sure you understand every line.** This single activity covers:
   - Take-home + extension formats (Mode B)
   - GitHub projects you can actually talk about (Mode C)
   - AI-native skills companies screen for
   - Product thinking and system-design instincts (exercised naturally end-to-end)
2. **Keep a DSA baseline.** Not 5 hours/day — just sharp enough that a LeetCode medium doesn't ruin your day.

When an interview comes up, *then* get specific: ask the recruiter exactly what to focus on.

> "Coding interviews aren't dead. They're different. And the people who are going to thrive in this new landscape aren't the ones who memorized the most LeetCode problems or built the flashiest portfolio. They're the ones who figured out which game they're actually playing and prepared for that."

## Playbook

### Identify the game before training for it
- **Key idea**: there are at least four distinct interview "games" — AI-banned LeetCode, AI-native two-stage, GitHub-as-interview, ML-from-scratch — and they reward incompatible preparation.
- **Why it matters**: blind preparation is "the least efficient strategy you can use." Wyss almost prepped system design for a company that wanted LeetCode.
- **How to apply**: for any specific opportunity, ask the recruiter (use her exact phrasing). For pre-interview baseline prep, see "default mode" below.

### Default mode: build real things with AI you understand
- **Key idea**: a single end-to-end project with AI assistance covers Modes B, C, and the format-proof skills (product thinking, system design, communication) all at once.
- **Why it matters**: it's the highest-overlap activity across every interview mode Wyss describes.
- **How to apply**: pick a project you actually care about, use Claude/Codex/Cursor to build it, then **read every line** until you can extend or refactor it on demand.

### In AI-native interviews, signal that you read the code
- **Key idea**: stage-2 evaluators are explicitly checking "whether you'll actually slow down and read it." Catching the subtle bug, the security issue, or the wrong AI approach beats generating fast.
- **Why it matters**: anyone can prompt; the differentiator is the patience to verify. "They're basically just looking for the person who's not outsourcing their thinking."
- **How to apply**: in stage-2 sessions, narrate what you're checking and why; flag where the AI made an arbitrary choice you'd revisit. Practice this on your own AI projects before interviewing.

### T-shaped > specialist-only
- **Key idea**: front-end-only or back-end-only is no longer considered reasonable; expect at least working knowledge of the full stack on top of one deep specialty.
- **Why it matters**: hiring managers converge on this archetype regardless of company or interview format.
- **How to apply**: pick a deep specialty, but also build at least one project end-to-end (UI → API → persistence → deploy) so you can speak credibly across the stack.

### "Just ask the recruiter" — the silly-simple highest-ROI hack
- **Key idea**: companies designed their interview process and most will tell you what they're testing if you ask the right way.
- **Why it matters**: blind prep wastes weeks. Recruiter-guided prep is targeted.
- **How to apply**: use the script verbatim — *"I want to come as prepared as possible. Since there are so many different focus areas in interviews right now, I'd really appreciate any guidance on what to prioritize for this role."* Refusal to answer is itself a signal.

### Communication is the gating skill
- **Key idea**: "If you can't communicate your thinking, it doesn't matter how good your thinking is." Every interview mode evaluates it.
- **Why it matters**: trade-off articulation, push-back on bad specs, narrating decisions — this is the surface across LeetCode, take-homes, project walkthroughs.
- **How to apply**: when practicing, talk through your reasoning out loud. (Ties directly to Wyss's walk-and-talk study method in her companion video.)

## Key Quotes

| Quote | Speaker | Context |
|-------|---------|---------|
| "The interview landscape hasn't just shifted, it's fractured. There is no single playbook anymore." | Marina Wyss | Opening thesis (Ch. 1) |
| "These aren't variations on the same test, they are fundamentally different exams." | Marina Wyss | On the four interview modes (Ch. 1) |
| "In a world where AI can generate a thousand lines of code in seconds, the differentiator is whether you'll actually slow down and read it." | Marina Wyss | On Mode B AI-native interviews (Ch. 3) |
| "They're basically just looking for the person who's not outsourcing their thinking." | Marina Wyss | On AI-native evaluation criteria (Ch. 3) |
| "Your portfolio is your interview prep." | Marina Wyss | On Mode C project-based interviews (Ch. 4) |
| "Production-level coding skills … LeetCode. And I was like, 'Oh, so literally the opposite of production-level coding.'" | Marina Wyss + recruiter | The recruiter-vague-answer story (Ch. 7) |
| "Just ask the recruiter." | Marina Wyss | The single most underrated strategy (Ch. 7) |
| "Coding interviews aren't dead. They're different." | Marina Wyss | Closing (Ch. 8) |

## Key Numbers

| Number | What it measures |
|---|---|
| ~⅓ / ~½ / rest | Companies banning AI / allowing AI in some form / case-by-case (CoderPad 2026 report) |
| 43% | Technical assessments still including LeetCode-style algorithm questions |
| 78% | Developers who say assessments don't reflect real-world work (HackerRank) |
| 56% | Developers who say algorithm questions are irrelevant to their jobs (HackerRank) |
| 30-38% | Share of assessments now using pair programming / system design / real-world simulations |
| 4 | Distinct interview "modes" identified |
| 2-stage | Meta-style AI-native format: take-home + live extension |
| 500 / 20 | Pragmatic Summit attendees / hiring-manager round-table size |

## Source Notes
- Transcript source: `subtitle-vtt` (en-orig auto-generated YouTube captions; required `--sub-langs en.*,en-orig` retry — first extraction grabbed Burmese auto-translation)
- Cookie-auth retry: used (YouTube anti-bot)
- Proxy: YT_PROXY (via skill `.env`)
- Data gaps: minor transcription glitches ("lead code" → LeetCode, "spectrum development" likely "system development" or "spec adherence" — kept original phrasing where ambiguous) corrected from context.
