---
tags: [claude-code, frontend, design, skills, tools, cli, plugins, ui-ux]
source: https://www.youtube.com/watch?v=Q9ty3eopOPs
---
# Top 10 Claude Code Frontend Design Skills, Plugins & CLIs

A curated toolkit for overcoming Claude Code's weakest area: frontend visual design. By default Claude Code produces "AI slop" — purple gradients, Inter font on everything, 2×2 bento-box card layouts. These 10 tools attack the problem from different angles: anti-pattern training, design system cloning, visual mockup generation, component libraries, and automated testing.

## Key Concepts

- **Impeccable** (`github.com/pbakaus/impeccable`): A single Claude skill with 18 commands that teaches the LLM what AI slop looks like by name — glassmorphism, border-accent sidebars, sparklines, purple gradients. More effective than vague "be tasteful" instructions because LLMs respond better to explicit anti-pattern lists. Includes a Chrome extension that flags slop in live pages.

- **SkillUI** (`npx skillui`): Reverse-engineers any website's design system into a reusable Claude project-level skill. "Ultra mode" uses Playwright to capture hover states and scroll interactions, not just static HTML. Demo: pointed at Stripe → one-shot "fake Stripe" with correct color logic and layout rhythm.

- **WebGPU skill** (`github.com/dgreenheck/webgpu-claude-skill`): Teaches Claude to write WGSL shaders and set up a WebGPU renderer — enabling GPU-driven animations in the browser. Most advanced tool in the list; relevant for agency-level visual work.

- **Awesome Design** (`github.com/VoltAgent/awesome-design-md`, 50k+ stars): A repo of design-system prompts distilled from production sites across many domains (11labs, Bugatti, etc.). Each entry documents colors, typography, card/button/form patterns as a structured prompt for Claude Code.

- **Stitch** (`stitch.withgoogle.com`): Google's free visual mockup tool. Workflow: write a prompt (attach inspiration screenshots) → Stitch generates a `design.md` file + multiple full-page variations → pick one → "Copy Code" → paste into Claude Code. Eliminates the write-serve-check loop during early design exploration.

- **UI/UX Pro Max** (`github.com/nextlevelbuilder/ui-ux-pro-max-skill`): Asks clarifying questions about site purpose and audience, then generates a tailored design system using 161 industry-specific reasoning rules. Stack-agnostic (not React-only). Best entry point when you have no reference design yet.

- **21st.dev**: Component library where every entry (hero sections, buttons, cards, borders) ships with a one-click "Copy Prompt" button for Claude Code. High ROI in small polish components — a button with an animated glow, a card with mouse-tracking highlight. Also functions as an inspiration catalog for developers without a design background.

- **Taste skill** (`github.com/Leonxlnx/taste-skill`): A collection of sub-skills with configurable abstraction levels aimed at giving Claude Code aesthetic range — scroll animations, unconventional layouts, varied composition instead of bento defaults.

- **Google Fonts**: Free font library directly accessible to Claude Code. Strategy: describe the site's purpose and target feeling → ask Claude for 5 font recommendations → preview on fonts.google.com → specify the winner in the system prompt. Breaks the default Inter lock-in.

- **Playwright CLI** (`github.com/microsoft/playwright-cli`): Automated end-to-end testing for completed UI work. Tell Claude Code to "test every single interaction using Playwright CLI" — it spawns headed or headless Chrome instances and covers edge cases in forms and interactions automatically.

## Key Takeaways

- Name the failure mode explicitly: Impeccable's anti-pattern vocabulary ("glassmorphism is AI slop") outperforms abstract style guidance
- Explore visually before coding: Stitch + Awesome Design let you compare multiple design directions before any code is written
- Clone design systems, not pixels: SkillUI distills layout logic and color relationships into a reusable skill; raw HTML copying gives ~65% fidelity
- Polish compounds: 21st.dev components (glow cards, animated CTAs) signal craft far above the effort cost
- Lock in typography early: font choice is one of the highest-leverage single design decisions; Google Fonts + Claude's recommendations replace defaulting to Inter
- Claude's design weakness is a differentiation opportunity — developers who master these tools stand out from the crowd relying on defaults

## See Also
- [[impeccable]]
- [[stitch-google-design-tool]]
- [[21st-dev-component-library]]
- [[playwright-testing]]
