# Handoff Document
*Last updated: April 19, 2026, 12:18 PM GMT+8*

---

## Session: April 19 — Answer Guide Rendering Fix + Course Transcription

### Goal
Fix the broken Answer Guide rendering in all course notes (Obsidian was displaying them as walls of text), update the template so future notes are generated correctly, and continue the EVC pipeline for the RAG and Agentic AI courses.

### What Was Done

#### Answer Guide Format Fix
- **Root cause identified**: `<details>/<summary>` HTML blocks suppress all markdown rendering inside them in Obsidian — bullets, tables, bold, code all collapse into unstyled prose.
- **Fix**: Replaced with Obsidian-native collapsible callout `> [!example]-` syntax. Markdown inside callouts renders fully.
- **New format**: Each answer now gets its own `#### Qn — Short Title` heading for navigation; complex answers use tables.

#### Files Changed
- ✅ `courses/zero-to-hero/01-the-spelled-out-intro-to-neural-networks-and-backpropagation-building-micrograd_VMj-3S1tku0.md` — reformatted answer guide + added new Q4 (why tanh?)
- ✅ `.claude/skills/content-summarizer/references/template-lecture-text.md` — updated canonical template: replaced all `<details>` references with callout syntax, added explicit "Forbidden Patterns" entry banning `<details>/<summary>`, updated Required Structure list and rules section
- ✅ `scripts/enhance-answer-guides.py` — new batch script: finds all `courses/**/*.md` with old `<details>` answer guides, calls Claude Haiku API to reformat each one, writes in-place

#### New Q4 Added to Micrograd Course
Pre-test Q4: *"In micrograd's neuron formula `output = tanh(sum(w_i * x_i) + b)`, why is `tanh` applied after the weighted sum? What would happen if you removed it?"*

Answer guide covers: non-linearity (layers collapse without it), bounded output (−1 to 1), zero-centering vs Sigmoid, and cheap gradient $1 - y^2$. Includes a reasons table and a linear-vs-tanh comparison table.

### What Worked
- **Obsidian callout syntax** (`> [!example]-`): fully renders markdown, tables, math, code inside the collapsed block
- **`#### Qn — Title` pattern**: gives each answer a navigable heading; Q3 table format is especially clean for the training-loop answer

### What Didn't Work
- **`<details>/<summary>` HTML**: never use this for answer guides in Obsidian — markdown does not render inside HTML blocks regardless of Obsidian version

### Next Steps
1. **Run the batch script** to fix all remaining course files with old `<details>` answer guides:
   ```bash
   python3 scripts/enhance-answer-guides.py --dry-run  # preview
   python3 scripts/enhance-answer-guides.py            # apply
   ```
2. **RAG course**: lessons 046 and 047 were dispatched for write-up; ~15 lessons still need audio download + transcription.
3. **Agentic AI course**: transcription in progress (17+ of 29 files done as of ~noon); write-up agents need to run for newly transcribed lessons.
4. **Wiki index**: verify `wiki/_index.md` has rows for all newly written lessons.

### Key Files
| File | Purpose |
| :--- | :--- |
| `scripts/enhance-answer-guides.py` | Batch-convert old `<details>` answer guides to callout format |
| `.claude/skills/content-summarizer/references/template-lecture-text.md` | Canonical template for EVC lecture write-ups — updated |
| `courses/zero-to-hero/01-*-micrograd_VMj-3S1tku0.md` | Reference file with new callout format + Q4 |

---

## Session: April 18 — yt-video-summarizer + EVC Pipeline Setup

### Goal
Extend the yt-video-summarizer skill to automatically extract all video URLs from course pages (DeepLearning.AI, Coursera, Udemy) and process them systematically with progress tracking.

### What Was Done
- ✅ Extended yt-video-summarizer with Playwright-based course enumeration and adapter system
- ✅ Progress tracking (JSON-based, resume-capable)
- ✅ Cookie support via yt-dlp browser export
- ✅ Demo structure for `courses/fine-tuning-large-language-models/`
- ✅ Playwright browsers installed (Chromium v1217)

### What Worked
- Adapter pattern for platform-specific enumeration
- Leveraging existing yt-video-summarizer pipeline
- Browser cookie export/import (mirrors encrypted-video-capture approach)

### What Didn't Work
- **DeepLearning.AI headless access**: bot protection blocks headless Playwright; needs visible browser or alternative auth
- **Simple cookie persistence**: required more sophisticated parsing for Chrome's microsecond timestamps

### Next Steps (from Apr 18, may already be done)
1. Try persistent browser context with manual login for DeepLearning.AI
2. Test Coursera/Udemy adapters
3. Connect course processor to content-summarizer for markdown generation
4. Add wiki compilation for processed courses

### Key Files
- **Skill**: `.claude/skills/yt-video-summarizer/`
- **Course processor**: `scripts/process_course.py`
- **Playwright enumerator**: `playwright/course-enumerator.mjs`
- **Platform adapters**: `playwright/adapters/`
- **Target course dir**: `courses/fine-tuning-large-language-models/`

### Quick Start
```bash
cd .claude/skills/yt-video-summarizer/
yt-dlp --cookies-from-browser chrome --cookies /tmp/course-cookies.txt --skip-download <course-url>
node playwright/course-enumerator.mjs "<course-url>" --cookies /tmp/course-cookies.txt --no-headless
python3 scripts/process_course.py "<course-url>" --course-name course-name --dry-run
```
