# Knowledge Database — Claude Guidelines

## Generated Markdown File Requirements

All `.md` files generated in this repository **must** include the following frontmatter properties:

```yaml
---
tags: [tag1, tag2, ...]   # relevant topic tags (array)
source: <url>             # original source URL (article, video, repo, etc.)
---
```

Example:
```yaml
---
tags: [rag, llm, retrieval]
source: https://example.com/article
---
```

- `tags`: Array of lowercase, hyphen-separated keywords describing the content topic
- `source`: The canonical URL of the original source material

### Filename Convention

All generated files and directories **must use ASCII-only names** — no Chinese characters, no Unicode. For Chinese-language content, transliterate titles to pinyin before using them as filenames.

- **File/folder names**: `[a-z0-9-]` only (lowercase, digits, hyphens)
- **Chinese titles**: translate to English, then slugify — never use pinyin or raw Chinese characters
- ❌ `001-课程介绍.md` → ✅ `001-course-introduction.md`

---

## Core Functional Programming Principles

### Pure Functions
- Functions must be deterministic: same input always produces same output
- No side effects: no mutations, no I/O, no logging inside pure functions
- Separate pure logic from effects (API calls, file operations, network requests)

### Immutability
- Use `const` by default; avoid `let` unless mutation is truly necessary
- Never mutate function arguments or objects passed as parameters
- Use spread operator, map, filter, reduce instead of push, splice, pop
- Fluent builders return new objects via spread: `{ ...state, key: val }` (NOT `this.key = val`)

### Composition
- Build complex behavior from small, composable functions
- Each function should do one thing well
- Prefer function composition over inheritance or large classes

### Explicit Data Flow
- Make dependencies visible in function signatures
- Pass data explicitly through parameters
- Return transformed data rather than mutating in place

### Avoid Shared Mutable State
- No global variables or module-level mutable state
- Isolate state changes to explicit boundaries (I/O layer)

---

## Code Organization

### Module Boundaries
- Each module should have a single, clear purpose
- Keep modules small and focused (< 200 lines ideal)
- Define clear interfaces between modules

### Data Flow Architecture
- Separate pure logic from side effects
- Structure code as: Input → Transform → Output
- Keep I/O operations at the edges

### File Organization
- Group by feature/domain, not by technical layer
- Example: `lib/teams/`, `lib/feishu/`, `skills/rca/`
- Keep related code together

### Function Size
- Keep functions small (< 20 lines ideal)
- Extract complex logic into named helper functions
- Use early returns to reduce nesting

### Avoid Classes with Mutable State
- Prefer modules of pure functions over classes
- Use classes only when you need polymorphism

---

## Test-Driven Development

All coding must follow TDD. Tests are written before implementation.

### Red-Green-Refactor Cycle
1. **Red**: Write a failing test that specifies the desired behavior
2. **Green**: Write the minimum code to make the test pass
3. **Refactor**: Clean up the code while keeping tests green

### Rules
- Never write implementation code without a failing test first
- Write the simplest code that makes the test pass — no more
- Each test covers one behavior or scenario
- Tests must be fast, isolated, and deterministic
- Keep test code as clean as production code

### Test Structure
- Unit tests for pure functions (no mocks needed)
- Integration tests only at I/O boundaries
- Test file mirrors source file: `foo.mjs` → `foo.test.mjs`

---

## Testing (site/)

- **Framework**: vitest (node environment)
- **Single run**: `cd site && npm test`
- **Watch mode**: `cd site && npm run test:watch`
- **Test files**: `site/lib/__tests__/**/*.test.ts`
- **Philosophy**: tests cover pure functions (`lib/content.ts`, `lib/wikilinks.ts`); UI components are browser/E2E only — no vitest for React components

---

## Anti-Patterns to Avoid

- ❌ Mutating function arguments or global state
- ❌ Hidden I/O inside pure functions (logging, API calls)
- ❌ Large functions that do multiple things (> 50 lines)
- ❌ Deeply nested conditionals (> 3 levels)
- ❌ Shared mutable state between modules
- ❌ `this.key = val` in fluent builders (breaks immutability)
- ❌ Passing webhook URLs as CLI positional args (bearer token exposure)
- ✅ Return new values instead of mutating
- ✅ Separate computation from effects
- ✅ Small, focused functions with early returns
- ✅ Immutable fluent builders via spread: `{ ...state, key: val }`

---
## Summarization
- When summarizing content (books, videos, PDFs), always write output directly to the target file. Do not output markdown inline or get blocked by plan mode — if plan mode blocks a file write, exit plan mode and write the file.

---
## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## Wiki workflow

- New source arrives: clip to `raw/` with required frontmatter (`tags`, `source`)
- To compile: run `./scripts/compile.sh raw/<file>.md` → follow the printed Claude Code instruction
- To search: run `./scripts/search.sh "query"` → read matching files
- Wiki articles MUST use `[[wikilinks]]` (not `[markdown links]`) for Obsidian backlinks and graph view
- After every compile, verify `wiki/_index.md` has a new row
- **Auto-compilation**: `content-summarizer` skill automatically runs the Wiki Compilation Post-Hook after every summarization — no manual compile step needed for yt-video, medium, and pdf sources
- **Collision detection**: `scripts/wiki-collision-check.sh <url> <tags>` — outputs `CREATE`, `ENRICH <file>`, or `SKIP`. Called by the post-hook; can also be run manually to check before compiling
- **Backfill**: run `./scripts/backfill-wiki.sh` to find summarized files not yet compiled to wiki/

### Topic categorization (applies to BOTH wiki/ and top-level content folders)

All topical content — both `wiki/` subfolders AND the top-level folders at repo root (`claude/`, `agent-frameworks/`, `ai-engineering/`, `rag-and-knowledge/`, `dev-tools/`, `learning-and-business/`) — uses the same 6-folder decision order. Pick the single best-fit folder using this decision order. Stop at the first rule that matches — don't pile topics on.

1. **`claude/`** — Claude Code, Claude API, Claude products, Anthropic-specific tooling (skills, plugins, HUD, Advisor/Monitor/Managed Agents, Anthropic Labs products, Master Claude sessions). Trigger words: `claude-code`, `anthropic`, `claude`, `mcp` *when the subject is a Claude feature*.
2. **`agent-frameworks/`** — Agent frameworks, multi-agent orchestration platforms, agent harnesses, autonomous agent products (Hermes, OpenClaw, CREAO, Eigent/Camel, Ruflo, Open SWE, CashClaw, ARIS, agent-persona libraries). "A thing that runs / orchestrates / defines agents" → here.
3. **`ai-engineering/`** — General AI/LLM engineering concepts and patterns not tied to a specific product: harness engineering, prompt/context engineering, training pipelines (State of GPT), autonomous research loops, skill-distillation patterns, VLM+tool patterns, token optimization. The "how you build reliable AI systems" bucket.
4. **`rag-and-knowledge/`** — RAG architectures, vectorless retrieval, knowledge bases, personal wikis, second-brain systems, PageIndex-style approaches. Retrieval + knowledge management only.
5. **`dev-tools/`** — General productivity/dev tools and integrations **not specific to Claude**: Obsidian, OpenBB, Supermemory, MetaClaw, research skills, AI-tool roundups, browser/finance/memory-layer tools.
6. **`learning-and-business/`** — Courses, interviews, career/education, study systems, AI startups, product strategy, industry moat analysis, frontend-design roundups, certifications. The "human-side" bucket.

Parallel trees:
- Top-level `<topic>/` holds **raw source material** (summarized notes, repo analyses, interview transcripts) — written directly by summarizer skills.
- `wiki/<topic>/` holds **compiled wiki articles** (cross-linked with `[[wikilinks]]`) — written by the wiki compilation post-hook.
- `courses/` is a separate top-level tree (distinct structure, untouched by the topic folders).
- `raw/` and `sources/` are intake/staging trees.

One classification decision applies to both writes: when summarizing, pick the topic ONCE, then the raw file lands in `/<topic>/` and the compiled wiki article lands in `wiki/<topic>/`.

Tie-breaker rules:
- A Claude-specific tool beats `dev-tools/` → goes to `claude/` (e.g. Caveman Token Saver is Claude-specific but its *subject* is prompt compression → `ai-engineering/`; Claude HUD is Claude-specific observability → `claude/`).
- An agent framework named for Claude (e.g. a Claude-Code multi-agent setup guide) still goes to `claude/` if the article is *about using Claude Code*, not *about the agent framework as a product*.
- When RAG appears inside a general AI-engineering article, pick `ai-engineering/`; only pick `rag-and-knowledge/` if RAG/retrieval is the article's primary subject.
- Explicit product listings (MetaClaw→`dev-tools/`, CashClaw→`agent-frameworks/`) override generic matches.
- When in genuine doubt between two folders, prefer the smaller one (keeps distribution balanced).

`./scripts/compile.sh` defaults to `ai-engineering` when no category is given — override with the second arg (e.g. `./scripts/compile.sh raw/foo.md claude`). Summarizer skills MUST pass the classified topic explicitly so raw output and wiki output match.
