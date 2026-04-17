---
tags: [claude-code, frontend, design, skills, tools, cli, plugins, ui-ux]
source: https://www.youtube.com/watch?v=Q9ty3eopOPs
wiki: wiki/tools/top-10-claude-code-frontend-design-skills-plugins-clis.md
---

# Top 10 Claude Code Frontend Design Skills, Plugins, & CLIs

## Video Info
- URL: https://www.youtube.com/watch?v=Q9ty3eopOPs
- Platform: YouTube
- Title: Top 10 Claude Code Frontend Design Skills, Plugins, & CLIs
- Speaker: Chase AI
- Channel/Event: Chase AI
- Upload date: 2026-04-15
- Duration: 20:07
- Views / likes / comments: 25,869 views / 1,066 likes / 27 comments (at extraction time)
- Category and tags: Science & Technology; claude-code

## Executive Summary
Chase AI presents 10 tools — skills, plugins, and CLIs — that address Claude Code's weakest area: frontend web design. Claude Code reliably produces "AI slop" (purple gradients, Inter font everywhere, identical card layouts), and the default Anthropic frontend-design skill is too vague to fix it. The tools range from skills that teach LLMs anti-patterns explicitly (Impeccable) to visual design generators (Stitch), component libraries (21st.dev), and a browser testing CLI (Playwright). The core thesis: since Claude Code's design sense is weak, mastering these tools creates a real differentiation opportunity for individual developers.

## Outline
1. **Intro** — Claude Code's "AI slop" problem and the 10-tool roadmap
2. **Impeccable** — 18-command skill that encodes AI slop anti-patterns so LLMs know what to avoid
3. **SkillUI** — Reverse-engineers any existing website into a reusable Claude skill
4. **WebGPU** — Skill for generating GPU-accelerated web animations via WebGPU shaders
5. **Awesome Design** — 50 k-star repo of design-system prompts extracted from real websites
6. **Stitch** — Google's visual mockup tool that generates design.md files for Claude Code
7. **UI/UX Pro Max** — Intelligent design system generator with 161 industry-specific reasoning rules
8. **21st.dev** — Component library where each component ships with a Claude-ready copy prompt
9. **Taste** — Collection of sub-skills that try to give Claude Code aesthetic taste
10. **Fonts (Google Fonts)** — Break free from Inter by directing Claude to Google Fonts
11. **Playwright CLI** — Automated front-end testing via headed or headless Chrome instances

## Detailed Chapter Summaries

### 1. Intro
> **Segment**: 0:00–0:28

Claude Code produces "AI slop" by default: purple gradients, Inter font everywhere, identical 2×2 bento-box card layouts. The speaker promises 10 tools — none of them the generic Anthropic frontend-design skill — including several released within the last few weeks.

### 2. Impeccable
> **Segment**: 0:28–3:05

A single installable Claude Code skill containing 18 distinct commands, each targeting a specific design domain (UX copy, responsive layout, color, etc.). Key differentiator: it teaches Claude what AI slop *looks like* using named anti-patterns rather than vague directives like "don't do AI slop."

- **Anti-pattern vocabulary**: border accent sidebars, sparklines, glassmorphism, gradient overuse — the skill names these explicitly so the LLM can avoid them
- **Docs site** at `impeccable.style` shows before/after for every command (e.g., `clarify` → UX error messages, `adapt` → mobile/tablet responsiveness)
- **Chrome extension** highlights AI-slop aesthetics directly on a live web page
- Released ~1 month before the video; still relatively unknown

> "Why don't we use a skill that tells LLMs this is AI slop verbatim instead of using something like the front-end design skill which is like 'just don't do AI slop please' — like that doesn't work."

### 3. SkillUI
> **Segment**: 3:05–6:13

An NPX-based tool (fewer than 24 hours old at recording time, 7 GitHub stars) that analyzes any website and converts its design system into a Claude-ready project-level skill.

- **Demo**: pointed at Stripe's website → generated a "fake Stripe" in one shot with correct color palette and layout logic (minus custom graphics)
- **Ultra mode**: uses Playwright to capture scroll screenshots and hover interactions — not just static HTML inspection
- **Output**: a reusable design skill that can be invoked for future projects targeting the same aesthetic
- Example on GitHub: pointed at Notion → generated a Notion-clone UI

> "You're now like a hipster GitHub repo skill user."

### 4. WebGPU
> **Segment**: 6:13–7:37

A Claude Code skill that teaches the model to write WebGPU shader code — enabling GPU-driven animations in the browser (similar to WebGL-level effects seen on high-end agency sites).

- Instructs Claude on renderer setup, WGSL shaders, and node-based materials
- Speaker produced a working GPU animation in ~10 minutes with no prior WebGPU knowledge
- Most advanced/niche tool in the list; relevant for developers building visually intense experiences

### 5. Awesome Design
> **Segment**: 7:37–9:31

A GitHub repo with 50,000+ stars containing design-system prompts extracted from real production websites across many domains (11labs, Bugatti, etc.).

- Each entry breaks out colors, typography, form elements, cards, buttons, and headings as a prompt
- Inspired by and compatible with Stitch's "design.md" concept
- Difference from SkillUI: Awesome Design gives you the component breakdown to build from scratch; SkillUI generates the full site for you
- Non-tech domains included (luxury brands, media), making it useful for diverse project types

### 6. Stitch
> **Segment**: 9:31–11:49

Google's free visual mockup tool. The workflow: write a prompt (optionally attach inspiration screenshots) → Stitch generates a design.md file plus multiple full-page mockup variations.

- Design.md files are structured prompts covering colors, typography, labels, buttons — far more specific than generic design skills
- Can generate 3–5 variations per prompt; supports creative range sliders and variant customization
- Export path to Claude Code: click preferred variant → View Code → Copy → paste into Claude Code
- MCP integration exists but speaker prefers hands-on visual iteration over CLI-only flow
- Eliminates the "code → dev server → check → repeat" loop for early design exploration

> "It's a lot easier for me to see all three of these and say 'I hate this, I hate this, maybe I like this' versus 'Claude Code, try again. Nope, try again.'"

### 7. UI/UX Pro Max
> **Segment**: 11:49–13:28

A Claude Code skill billed as the spiritual successor to Anthropic's default frontend-design skill, with domain awareness the stock skill lacks.

- **161 industry-specific reasoning rules** — not a generic "make it look nice" prompt
- Asks clarifying questions before generating: what's the site about, what's the service, who's the audience
- Stack-agnostic: not locked into React
- Best used when you don't yet have a reference design and need a reasoned starting point rather than a copy of an existing site

### 8. 21st.dev
> **Segment**: 13:28–15:49

A component library website where every component comes with a one-click "Copy Prompt" button that pastes a Claude-ready instruction.

- Hero sections (including Spline-based 3D robot that tracks the mouse), buttons with animated lighting, cards with mouse-tracking glow effects
- Speaker's recommendation: get the most value from small polish components (buttons, cards, borders) rather than entire hero sections
- Secondary value: **inspiration catalog** — exposure to component patterns you didn't know existed helps develop design intuition over time

> "The less it looks like every single SaaS template, the better."

### 9. Taste
> **Segment**: 15:49–16:57

A GitHub repo of Claude Code sub-skills explicitly aimed at giving the model aesthetic taste — moving output away from generic AI-generated aesthetics.

- Multiple sub-skills with configurable "abstraction level" (more conventional ↔ more experimental)
- Example outputs shown: scroll animations, non-bento layouts, varied composition
- Positioned as a marginal improvement worth trying in comparison to baseline Claude Code output

### 10. Fonts (Google Fonts)
> **Segment**: 16:57–18:04

A reminder that Google Fonts provides a free, massive font library that Claude Code can access directly — breaking the default dependence on Inter.

- Browse by appearance, feeling, or family on fonts.google.com
- Strategy: describe the site and target feeling to Claude Code, ask for 5 font recommendations, then select from previews
- Typography is called out as a "huge, huge part of how your design looks and feels"

### 11. Playwright CLI
> **Segment**: 18:04–19:15

Playwright CLI (not the MCP variant) for automated front-end testing of completed UI work.

- Command: `tell Claude Code to test every single interaction on this web page using Playwright CLI`
- Supports headed (visible Chrome windows) or headless mode
- Particularly useful for form submissions, which have many edge cases that are tedious to test manually
- SkillUI also uses Playwright under the hood in Ultra mode for design capture

## Playbook

### Teach Claude What NOT to Do
- **Key idea**: Impeccable names AI-slop anti-patterns verbatim (glassmorphism, sparklines, purple gradients, border accents) rather than issuing vague "be tasteful" instructions.
- **Why it matters**: LLMs follow explicit constraints better than abstract style guidance; naming the failure mode is more effective than describing the ideal.
- **How to apply**: Install Impeccable, run its Chrome extension on your existing site to detect slop patterns, then invoke the relevant commands (e.g., `clarify`, `adapt`) during a build.

### Start Visual Before Writing Code
- **Key idea**: Use Stitch to explore design directions as mockups before touching Claude Code.
- **Why it matters**: Each design iteration in Claude Code requires write → serve → check cycles; Stitch collapses multiple iterations into a visual comparison.
- **How to apply**: Prompt Stitch with a site description + inspiration screenshot → pick a variant → copy its generated code → paste into Claude Code as the starting template.

### Clone Design Systems, Not Screenshots
- **Key idea**: SkillUI and Awesome Design both convert real sites into prompts/skills rather than pixel copies.
- **Why it matters**: Manually copying HTML gives a 60–70% result; a distilled design system skill preserves layout logic, spacing rhythm, and color relationships.
- **How to apply**: Point SkillUI at a site you admire → save the resulting design skill → reuse it on future projects. Or browse Awesome Design for domain-specific breakdowns (e.g., 11labs for dark-mode SaaS, Bugatti for luxury branding).

### Polish with Component Libraries
- **Key idea**: 21st.dev provides copy-prompt access to pre-built premium components (glow-shadow cards, mouse-tracking highlights, animated CTAs).
- **Why it matters**: Small visual details signal craft and elevate perceived quality far beyond the effort required.
- **How to apply**: Browse 21st.dev by component type → copy the prompt → paste into Claude Code → tweak to fit your palette.

### Don't Skip Fonts and Testing
- **Key idea**: Fix typography early (Google Fonts) and automate UI testing at the end (Playwright CLI).
- **Why it matters**: Font choice is one of the highest-leverage single changes for site character; untested forms and interactions create user-facing bugs.
- **How to apply**: Ask Claude Code for font recommendations given your site's purpose, preview on fonts.google.com, specify the chosen font in your system prompt. After UI work, run Playwright CLI in headed mode to visually confirm every interaction.

## Key Quotes

| Quote | Speaker | Context |
|-------|---------|---------|
| "There is a monster inside of Claude Code and it's called AI slop." | Chase AI | Opening framing |
| "Why don't we use a skill that tells LLMs this is AI slop verbatim instead of using something like the front-end design skill which is like 'just don't do AI slop please' — like that doesn't work." | Chase AI | Intro to Impeccable |
| "We are on the ground floor. I didn't make this. I don't know this guy. I just happened to see him post about it on Twitter." | Chase AI | Introducing SkillUI (7 stars at time of recording) |
| "It's a lot easier for me to see all three of these and say 'I hate this, I hate this, maybe I like this' versus 'Claude Code, try again. Nope, try again.'" | Chase AI | Why Stitch's visual workflow beats CLI iteration |
| "Typography is a huge, huge part of how your design looks and feels." | Chase AI | On Google Fonts |
| "You just don't know what you don't know. And being exposed to all these different ways that we can create a button kind of gets your mind moving in different directions." | Chase AI | On 21st.dev as inspiration catalog |
| "Because Claude Code is bad at [taste], that should be kind of a good thing for you, the individual — that is a space now where you can differentiate yourself from the pack." | Chase AI | Closing |

## Source Notes
- Transcript source: `subtitle-vtt`
- Cookie-auth retry: used (YouTube bot check)
- Data gaps: none
