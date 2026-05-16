# Skills Collections Setup

This note tracks useful public skills collections and how to install them.

## Skill Environment Variables

### yt-video-summarizer — OpenRouter ASR

When a video has no subtitles (common for Bilibili, some YouTube), the skill falls back to ASR transcription via OpenRouter.

Config file: `.agents/skills/yt-video-summarizer/.env`

```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TRANSCRIPTION_MODEL=openai/gpt-audio-mini
OPENROUTER_TITLE=yt-video-summarizer
```

Optional tuning:
- `OPENROUTER_TRANSCRIPTION_CHUNK_SECONDS` — chunk duration for long audio (default `600`)
- `OPENROUTER_TRANSCRIPTION_MAX_BYTES` — threshold before chunking starts (default `12582912`)
- `OPENROUTER_HTTP_REFERER` — OpenRouter app attribution

The extractor auto-loads this `.env` from the skill folder. ASR fallback order: `faster-whisper` (local) → OpenRouter (with `OPENROUTER_API_KEY`) → native OpenAI (with `OPENAI_API_KEY`).

---

## 1) DingTalk Wukong Skills

- Original link: https://github.com/stvlynn/dingtalk-wukong-skills
- Purpose: A curated pack of reusable skills (from Wukong v0.9.2) for DingTalk workflows, office document processing (`docx`/`xlsx`/`pptx`/`pdf`), and travel/info queries (for example `12306-train-query`, `dianping-info-query`).

### Setup

Install all skills from this collection:

```bash
npx --yes skills add stvlynn/dingtalk-wukong-skills --skill='*' --full-depth
```

Optional global install:

```bash
npx --yes skills add stvlynn/dingtalk-wukong-skills --skill='*' --full-depth -g
```

`--full-depth` is important for this multi-skill repository so nested skills are discovered.

## 2) gstack

- Original link: https://github.com/garrytan/gstack
- Purpose: A full workflow-oriented skill suite for AI coding agents (think, plan, build, review, QA, ship), including specialist commands such as `/review`, `/qa`, `/ship`, `/browse`, and safety/release helpers.

### Setup (Codex, repo-local)

Install inside the current repository:

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git .agents/skills/gstack
cd .agents/skills/gstack && ./setup --host codex
```

### Setup (Codex, user-global)

Install once for your user account:

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup --host codex
```

## 3) claude-mem

- Original link: https://github.com/thedotmack/claude-mem
- Purpose: Semantic memory search MCP for Claude Code — indexes your `.claude/` memory files into a searchable corpus and exposes skills for smart search, timeline views, and knowledge-agent queries.

### Setup

Install the MCP and skills into Claude Code:

```bash
npx claude-mem install
```

This registers the `claude-mem` MCP server and adds the skill pack to your Claude Code config.

Start the background worker (indexes memory files and serves the web UI):

```bash
npx claude-mem start
```

### View Memories (Web UI)

Open in browser after starting the worker:

```
http://localhost:37777
```

Browse, search, and inspect all indexed memory entries via the web interface.

### Usage in Claude Code

**Search memory** (skill):

```
/mem-search <query>
```

Find memories matching a topic. Powered by the `smart_search` MCP tool under the hood.

**View memory timeline**:

```
/timeline-report
```

Shows a chronological view of stored observations across your memory files.

**Smart exploration** (browse memory graph):

```
/smart-explore
```

Interactively unfolds related memory nodes from a starting topic.

**Run a knowledge-agent query** (deeper reasoning over memory):

```
/knowledge-agent <question>
```

**MCP tools exposed** (callable directly by Claude without a skill):

| Tool | Purpose |
|------|---------|
| `search` | Keyword search across memory corpus |
| `smart_search` | Semantic/ranked search |
| `smart_outline` | Outline structure of a memory topic |
| `smart_unfold` | Expand a memory node with related context |
| `timeline` | Chronological observation listing |
| `get_observations` | Raw observations for a corpus entry |
| `list_corpora` | List all indexed corpora |
| `prime_corpus` | Index a new directory as a corpus |
| `rebuild_corpus` | Re-index after memory files change |

## 4) claude-mermaid

- Purpose: Add Mermaid diagram support to Claude via the `claude-mermaid` plugin.

### Setup

Install the package globally:

```bash
npm install -g claude-mermaid
```

Register the marketplace entry and install the plugin:

```bash
/plugin marketplace add veelenga/claude-mermaid
/plugin install claude-mermaid@claude-mermaid
```

## Sources

- https://github.com/stvlynn/dingtalk-wukong-skills
- https://github.com/garrytan/gstack
- https://github.com/thedotmack/claude-mem

## 5) Zhihu Top 10 Claude Skills (Summary)

- Source article: https://zhuanlan.zhihu.com/p/2015725269667840386
- Capture method: reuse local browser session and cookies, then parse page HTML
- Recorded date: 2026-03-28

### 4.1 Superpowers

- Purpose: A full development workflow skill pack (brainstorming, TDD, code review, Git flow), focused on clarifying requirements before implementation.
- Setup:
  - `claude plugin install superpowers`
- Original source:
  - https://github.com/obra/superpowers

### 4.2 Planning with Files

- Purpose: Persist planning/progress/knowledge into Markdown files to reduce context loss.
- Setup:
  - `claude plugin marketplace add OthmanAdi/planning-with-files`
  - `claude plugin install planning-with-files`
- Original source:
  - https://github.com/OthmanAdi/planning-with-files

### 4.3 UI UX Pro Max

- Purpose: Improve Claude-generated UI quality with richer style and color systems, reducing generic visual output.
- Setup:
  - `claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill`
  - `claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill`
- Original source:
  - https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

### 4.4 Code Review

- Purpose: Multi-agent parallel PR review (logic/security/style) with confidence filtering.
- Setup:
  - `claude plugin install code-review`
- Original source:
  - https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-review

### 4.5 Code Simplifier

- Purpose: Equivalent-code simplification for recently changed code (remove redundancy, simplify branches) without changing behavior.
- Setup:
  - `claude plugin install code-simplifier`
- Original source:
  - https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-simplifier

### 4.6 Webapp Testing

- Purpose: Automate web app testing flow (Playwright script generation, browser run, screenshots, debug cycle).
- Setup:
  - `claude plugin marketplace add anthropics/skills`
  - `claude plugin install example-skills@anthropic-agent-skills`
- Original source:
  - https://github.com/anthropics/skills/tree/main/skills/webapp-testing

### 4.7 Ralph Loop

- Purpose: Prevents early task termination via stop-hook loops until completion criteria are met.
- Setup:
  - `claude plugin install ralph-loop`
- Original source:
  - No explicit GitHub repo in the article
  - Reference page: https://awesomeclaude.ai/ralph-wiggum

### 4.8 MCP Builder

- Purpose: Phased guidance for MCP server development (API understanding, tool design, implementation, testing).
- Setup:
  - `claude plugin marketplace add anthropics/skills`
  - `claude plugin install example-skills@anthropic-agent-skills`
- Original source:
  - https://github.com/anthropics/skills/tree/main/skills/mcp-builder

### 4.9 PPTX

- Purpose: Generate `.pptx` draft slides quickly (template/charts/animation support), then polish manually.
- Setup:
  - `claude plugin marketplace add anthropics/skills`
  - `claude plugin install document-skills@anthropic-agent-skills`
- Original source:
  - https://github.com/anthropics/skills/tree/main/skills/pptx

### 4.10 Skill Creator

- Purpose: Create and iterate custom skills, and validate impact with eval workflows.
- Setup:
  - `claude plugin install skill-creator`
- Original source:
  - https://github.com/anthropics/claude-plugins-official/tree/main/plugins/skill-creator

### 4.11 Additional resources from the article

- Anthropic official Skills repo: https://github.com/anthropics/skills
- Anthropic official Plugins repo: https://github.com/anthropics/claude-plugins-official
- Awesome Claude Skills community list: https://github.com/travisvn/awesome-claude-skills
- Claude Code Skills docs: https://code.claude.com/docs/en/skills
- Skills marketplace: https://skillsmp.com/

---

## 6) Architecture Diagram Generator (Cocoon AI)

- Original link: https://github.com/Cocoon-AI/architecture-diagram-generator
- Purpose: Generate beautiful dark-themed system architecture diagrams as standalone HTML/SVG files. Describe your system in plain English and Claude creates a self-contained HTML file openable in any browser. Supports web apps, AWS serverless, microservices, and more. Outputs include Copy/PNG/PDF export toolbar built in.

### Features

- Dark theme (slate-950 background with grid) with semantic color coding (frontend=cyan, backend=emerald, database=violet, cloud=amber, security=rose)
- Single self-contained HTML output — shareable, no dependencies
- Iterative: ask Claude to add components, change layouts, or fix issues via chat
- Sister skill: [process-flow-diagram-generator](https://github.com/Cocoon-AI/process-flow-diagram-generator) for step-by-step workflow diagrams

### Setup

**Claude.ai (recommended):**
1. Download `architecture-diagram.zip` from the repo
2. Go to Claude.ai → Customize → Skills → + Create skill → Upload a skill
3. Toggle the skill on (requires Code Execution enabled in Settings → Capabilities)

**Claude Code CLI:**
```bash
# Global
unzip architecture-diagram.zip -d ~/.claude/skills/

# Project-local
unzip architecture-diagram.zip -d ./.claude/skills/
```

### Usage

```
Use your architecture diagram skill to create an architecture diagram from this description:
- React frontend talking to a Node.js API
- PostgreSQL database
- Redis for caching
- Hosted on AWS with CloudFront CDN
```

---

## 7) fireworks-tech-graph

- Original link: https://github.com/yizhiyanhua-ai/fireworks-tech-graph
- Purpose: Generate production-quality SVG+PNG technical diagrams from natural language. Covers 7 visual styles (Flat Icon, Dark Terminal, Blueprint, Notion Clean, Glassmorphism, Claude Official, OpenAI Official), 14 UML diagram types, and deep AI/Agent domain patterns (RAG, Agentic Search, Mem0, Multi-Agent, Tool Call flows). Exports high-resolution 1920px PNG via `cairosvg`.

### Features

- 7 visual styles with dedicated reference files and executable style guides
- 14 UML types + AI/Agent domain diagrams (RAG, Mem0, Multi-Agent, Tool Call, etc.)
- Semantic shape vocabulary (LLM = double-border rect, Agent = hexagon, Vector Store = ringed cylinder)
- Semantic arrow system (color + dash pattern encode write/read/async/loop)
- 40+ product icons with brand colors (OpenAI, Anthropic, Pinecone, Kafka, PostgreSQL, etc.)
- SVG + PNG output; PNG renderer priority: cairosvg → rsvg-convert → puppeteer

### Setup

```bash
npx skills add yizhiyanhua-ai/fireworks-tech-graph
```

Or clone directly:
```bash
git clone https://github.com/yizhiyanhua-ai/fireworks-tech-graph.git ~/.claude/skills/fireworks-tech-graph
```

Force update to latest:
```bash
npx skills add yizhiyanhua-ai/fireworks-tech-graph --force -g -y
```

### Requirements (PNG renderer — pick one)

```bash
# Recommended: cairosvg
pip install cairosvg

# Fallback: rsvg-convert
brew install librsvg        # macOS
sudo apt install librsvg2-bin  # Ubuntu/Debian

# Highest fidelity (heavy): puppeteer
npm install puppeteer
```

### Usage

```
Draw a RAG pipeline flowchart
Generate a Mem0 memory architecture diagram, dark style
Draw a microservices architecture diagram in style 3 (Blueprint)
```
