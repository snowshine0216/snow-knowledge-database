#!/usr/bin/env node
/**
 * add-course-tests.mjs
 *
 * Adds ## Pre-test and ## Post-test sections to every course lesson file
 * using `claude --print` (non-interactive Claude CLI) as the generator.
 *
 * Usage:
 *   node scripts/add-course-tests.mjs              # process all pending files
 *   node scripts/add-course-tests.mjs --dry-run    # list files, no changes
 *   node scripts/add-course-tests.mjs --file courses/neural-networks/01-neural-networks.md
 *   node scripts/add-course-tests.mjs --concurrency 5
 */

import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const COURSES_DIR = join(ROOT, 'courses');

const DRY_RUN = process.argv.includes('--dry-run');
const SINGLE_FILE = (() => {
  const idx = process.argv.indexOf('--file');
  return idx !== -1 ? join(ROOT, process.argv[idx + 1]) : null;
})();
const CONCURRENCY = (() => {
  const idx = process.argv.indexOf('--concurrency');
  return idx !== -1 ? parseInt(process.argv[idx + 1], 10) : 3;
})();

const SKIP_NAMES = new Set(['README.md', '_index.md', 'key-points.md']);

// ── File scanning ────────────────────────────────────────────────────────────

function scanCourseFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...scanCourseFiles(full));
    } else if (entry.endsWith('.md') && !SKIP_NAMES.has(entry)) {
      results.push(full);
    }
  }
  return results;
}

function alreadyProcessed(content) {
  return content.includes('## Pre-test');
}

/** Returns the byte-offset immediately after the closing --- of YAML frontmatter. */
function frontmatterEnd(content) {
  if (!content.startsWith('---')) return 0;
  const end = content.indexOf('\n---', 4);
  if (end === -1) return 0;
  // advance past the \n---  and any immediately following newline
  const pos = end + 4;
  return content[pos] === '\n' ? pos + 1 : pos;
}

// ── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(filePath, content) {
  const relPath = relative(ROOT, filePath);
  const tagsMatch = content.match(/^tags:\s*\[([^\]]+)\]/m);
  const tags = tagsMatch ? tagsMatch[1] : '';

  // Detect dominant language from content body (after frontmatter)
  const body = content.slice(frontmatterEnd(content));
  const chineseChars = (body.match(/[\u4e00-\u9fff]/g) || []).length;
  const isChinese = chineseChars > 50;

  const langNote = isChinese
    ? 'The file is in Chinese — write ALL questions and instructions in Chinese.'
    : 'The file is in English — write ALL questions and instructions in English.';

  return `You are a study-system designer applying Marina Wyss's active-recall retention system (pretest + active recall bookending every session).

Given the course lesson below, output EXACTLY two sections in the format shown. No other text.

${langNote}

RULES:
- Pre-test: 3 questions the reader attempts BEFORE reading. They should be answerable from general knowledge + the title/tags. Wrong answers are fine — pretesting primes deeper encoding of the correct answer.
- Post-test: 3 retrieval questions for AFTER reading. Require explaining in own words (Feynman technique). Avoid yes/no or lookup-style questions.
- Answer Guide: 1–2 sentences per answer, drawn strictly from the file's content.
- Keep questions concrete and specific to THIS lesson's content (use the actual concepts, names, formulas).

OUTPUT FORMAT (output ONLY this, no preamble, no commentary):

===PRE-TEST===
## Pre-test

> ${isChinese ? '*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*' : '*Attempt these before reading. Wrong answers are intentional — pretesting primes your brain to encode the correct answers more deeply when you encounter them.*'}

1. [question]
2. [question]
3. [question]
===POST-TEST===
## Post-test

> ${isChinese ? '*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*' : '*Close this file. Write or say your answers aloud from memory before revealing the guide. If you stumble mid-sentence, you have found a gap (Feynman test).*'}

1. [retrieval question]
2. [retrieval question]
3. [retrieval question]

<details>
<summary>${isChinese ? '答案指南' : 'Answer Guide'}</summary>

1. [brief answer]
2. [brief answer]
3. [brief answer]

</details>
===END===

Course lesson: ${relPath}
Tags: ${tags}

---
${content}`;
}

// ── Claude CLI call ──────────────────────────────────────────────────────────

const CLAUDE_TIMEOUT_MS = 240_000;

function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const proc = spawn('claude', ['--print'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error('claude timed out after 120s'));
    }, CLAUDE_TIMEOUT_MS);

    proc.stdout.on('data', d => { stdout += d; });
    proc.stderr.on('data', d => { stderr += d; });

    proc.on('close', code => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`claude exited ${code}: ${stderr.slice(0, 300)}`));
      } else {
        resolve(stdout);
      }
    });

    proc.stdin.write(prompt, 'utf8');
    proc.stdin.end();
  });
}

// ── Output parsing ───────────────────────────────────────────────────────────

function parseOutput(raw) {
  // Strip any ANSI escape codes the CLI might emit
  const output = raw.replace(/\x1b\[[0-9;]*m/g, '').replace(/\r/g, '');

  const preMatch = output.match(/===PRE-TEST===([\s\S]*?)===POST-TEST===/);
  const postMatch = output.match(/===POST-TEST===([\s\S]*?)===END===/);

  if (!preMatch || !postMatch) {
    // Fallback: try to extract sections by heading if delimiters are missing
    const preSection = output.match(/(## Pre-test[\s\S]*?)(?=## Post-test|$)/);
    const postSection = output.match(/(## Post-test[\s\S]*?)$/);
    if (preSection && postSection) {
      return { preTest: preSection[1].trim(), postTest: postSection[1].trim() };
    }
    throw new Error(
      `Unexpected output format. First 500 chars:\n${output.slice(0, 500)}`
    );
  }

  return {
    preTest: preMatch[1].trim(),
    postTest: postMatch[1].trim(),
  };
}

// ── File patcher ─────────────────────────────────────────────────────────────

function patchFile(filePath, originalContent, preTest, postTest) {
  const fmEnd = frontmatterEnd(originalContent);
  const frontmatter = originalContent.slice(0, fmEnd);
  const body = originalContent.slice(fmEnd).trimStart();

  const updated = `${frontmatter}\n${preTest}\n\n---\n\n${body}\n\n---\n\n${postTest}\n`;
  writeFileSync(filePath, updated, 'utf8');
}

// ── Concurrency pool ──────────────────────────────────────────────────────────

async function runWithConcurrency(tasks, limit) {
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      await tasks[idx++]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const allFiles = SINGLE_FILE ? [SINGLE_FILE] : scanCourseFiles(COURSES_DIR);

  const pending = allFiles.filter(f => {
    try {
      return !alreadyProcessed(readFileSync(f, 'utf8'));
    } catch {
      return false;
    }
  });

  console.log(`Course files total  : ${allFiles.length}`);
  console.log(`Already processed   : ${allFiles.length - pending.length}`);
  console.log(`Pending             : ${pending.length}`);
  console.log(`Concurrency         : ${CONCURRENCY}`);
  console.log('');

  if (DRY_RUN) {
    console.log('--- Pending files (dry-run) ---');
    pending.forEach(f => console.log(' ', relative(ROOT, f)));
    return;
  }

  if (pending.length === 0) {
    console.log('Nothing to do — all files already have pre/post-test sections.');
    return;
  }

  let done = 0;
  let failed = 0;
  const failures = [];

  const tasks = pending.map(filePath => async () => {
    const content = readFileSync(filePath, 'utf8');
    const prompt = buildPrompt(filePath, content);
    const rel = relative(ROOT, filePath);
    try {
      const output = await callClaude(prompt);
      const { preTest, postTest } = parseOutput(output);
      patchFile(filePath, content, preTest, postTest);
      done++;
      console.log(`[${done + failed}/${pending.length}] ✓  ${rel}`);
    } catch (err) {
      failed++;
      failures.push({ rel, err: err.message });
      console.error(`[${done + failed}/${pending.length}] ✗  ${rel}`);
      console.error(`    ${err.message.split('\n')[0]}`);
    }
  });

  await runWithConcurrency(tasks, CONCURRENCY);

  console.log('');
  console.log(`─── Summary ─────────────────────────────`);
  console.log(`  Updated : ${done}`);
  console.log(`  Failed  : ${failed}`);
  if (failures.length > 0) {
    console.log('');
    console.log('Failed files:');
    failures.forEach(({ rel, err }) => console.log(`  ${rel}\n    ${err.split('\n')[0]}`));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
