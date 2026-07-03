#!/usr/bin/env node
/**
 * fetch-wechat.mjs — headless Playwright Chromium fetcher for WeChat Official
 * Account articles (mp.weixin.qq.com). Replaces the old `gstack browse` binary.
 *
 * Usage:
 *   node fetch-wechat.mjs <url> [out_dir]
 *
 * Env:
 *   WECHAT_HEADFUL=1   launch a visible window (for manual CAPTCHA / login solving)
 *
 * Writes into out_dir (default /tmp/wechat-article-summarizer):
 *   article_raw.txt   — full article body text (untrusted external content)
 *   metadata.json     — {title, author, account, publish_date, source_url, language}
 *
 * Prints a human-readable RESULT block to stdout.
 * Exit codes: 0 = success, 3 = CAPTCHA / verification gate, 2 = bad args, 1 = error.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.argv[2];
const outDir = process.argv[3] || '/tmp/wechat-article-summarizer';

if (!url || !/^https:\/\/mp\.weixin\.qq\.com\/s\//.test(url)) {
  console.error('usage: node fetch-wechat.mjs <https://mp.weixin.qq.com/s/...> [out_dir]');
  process.exit(2);
}

const headful = process.env.WECHAT_HEADFUL === '1';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const CAPTCHA_MARKERS = ['环境异常', '完成验证后即可继续访问', '去验证', '请输入验证码'];

const DATE_RE = /(\d{4})[年\-/.](\d{1,2})[月\-/.](\d{1,2})/;

function normalizeDate(raw) {
  if (!raw) return '';
  const m = raw.match(DATE_RE);
  if (!m) return raw.trim();
  const [, y, mo, d] = m;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Newer WeChat DOM often exposes only a timestamp in #js_author_name. When the
// scraped author is really a date, recover the byline from the body ("作者 | X").
function resolveAuthor(author, body) {
  const looksLikeDate = author && (DATE_RE.test(author) || /^\d[\d\s:年月日.\/-]*$/.test(author));
  if (author && !looksLikeDate) return author.trim();
  const m = body.match(/作者\s*[|｜:：]\s*([^\n|｜]{1,40})/);
  return m ? m[1].trim() : '';
}

const browser = await chromium.launch({ headless: !headful });
let exitCode = 0;
try {
  const ctx = await browser.newContext({
    userAgent: UA,
    locale: 'zh-CN',
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);

  let finalUrl = page.url();

  const extract = () =>
    page.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const txt = (s) => (q(s)?.textContent || '').trim();
      const attr = (s, a) => q(s)?.getAttribute(a) || '';
      const bodyEl =
        document.querySelector('#js_content') ||
        document.querySelector('.rich_media_content') ||
        document.body;
      return {
        title:
          txt('#activity-name') ||
          txt('h1.rich_media_title') ||
          attr('meta[property="og:title"]', 'content') ||
          document.title,
        author:
          txt('#js_author_name') ||
          attr('meta[name="author"]', 'content') ||
          txt('.rich_media_meta_text'),
        account:
          txt('#js_name') ||
          txt('.wx_follow_nickname') ||
          attr('meta[property="og:site_name"]', 'content'),
        publish: txt('#publish_time') || attr('meta[property="article:published_time"]', 'content'),
        body: (bodyEl.innerText || '').trim(),
      };
    });

  let data = await extract();
  let isCaptcha =
    CAPTCHA_MARKERS.some((m) => data.body.includes(m)) ||
    /verify|antispam/i.test(finalUrl) ||
    data.body.length < 40;

  // If gated and we are visible, give the user time to solve then re-extract.
  if (isCaptcha && headful) {
    console.error('CAPTCHA/verification detected — solve it in the visible window (waiting up to 120s)...');
    await page
      .waitForFunction(
        (markers) => {
          const el = document.querySelector('#js_content') || document.body;
          const t = (el.innerText || '').trim();
          return t.length > 200 && !markers.some((m) => t.includes(m));
        },
        CAPTCHA_MARKERS,
        { timeout: 120000 }
      )
      .catch(() => {});
    finalUrl = page.url();
    data = await extract();
    isCaptcha = CAPTCHA_MARKERS.some((m) => data.body.includes(m)) || data.body.length < 40;
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'article_raw.txt'),
    '--- BEGIN UNTRUSTED EXTERNAL CONTENT ---\n' + data.body + '\n--- END UNTRUSTED EXTERNAL CONTENT ---\n'
  );
  const metadata = {
    title: data.title,
    author: resolveAuthor(data.author, data.body),
    account: data.account,
    publish_date: normalizeDate(data.publish),
    source_url: url,
    language: 'zh',
  };
  fs.writeFileSync(path.join(outDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

  console.log('=== RESULT ===');
  console.log('finalUrl:', finalUrl);
  console.log('isCaptcha:', isCaptcha);
  console.log('title:', metadata.title);
  console.log('account:', metadata.account);
  console.log('publish_date:', metadata.publish_date);
  console.log('body_chars:', data.body.length);
  console.log('out_dir:', outDir);
  if (isCaptcha) {
    console.log('HINT: re-run with WECHAT_HEADFUL=1 to solve the verification manually.');
    exitCode = 3;
  }
} catch (err) {
  console.error('ERROR:', err.message);
  exitCode = 1;
} finally {
  await browser.close();
}
process.exit(exitCode);
