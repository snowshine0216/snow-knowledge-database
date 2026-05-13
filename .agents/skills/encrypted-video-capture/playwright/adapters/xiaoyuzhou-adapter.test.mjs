/**
 * xiaoyuzhou-adapter.test.mjs — Unit tests for Xiaoyuzhou podcast metadata parsing.
 * Run with: node --test playwright/adapters/xiaoyuzhou-adapter.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseEpisodeUrl,
  parseIsoDurationToSeconds,
  parseEpisodeHtml,
} from "./xiaoyuzhou-adapter.mjs";

test("parseEpisodeUrl: parses canonical episode URL", () => {
  assert.deepEqual(
    parseEpisodeUrl("https://www.xiaoyuzhoufm.com/episode/6a00aa051b7bd50295dfe41d"),
    {
      episodeId: "6a00aa051b7bd50295dfe41d",
      canonicalUrl: "https://www.xiaoyuzhoufm.com/episode/6a00aa051b7bd50295dfe41d",
    }
  );
});

test("parseEpisodeUrl: strips share query parameters", () => {
  const parsed = parseEpisodeUrl(
    "https://www.xiaoyuzhoufm.com/episode/6a00aa051b7bd50295dfe41d?s=share-token"
  );
  assert.equal(parsed.canonicalUrl, "https://www.xiaoyuzhoufm.com/episode/6a00aa051b7bd50295dfe41d");
});

test("parseEpisodeUrl: rejects non-episode URL", () => {
  assert.equal(parseEpisodeUrl("https://www.xiaoyuzhoufm.com/podcast/626b46ea9cbbf0451cf5a962"), null);
});

test("parseIsoDurationToSeconds: parses minutes-only podcast duration", () => {
  assert.equal(parseIsoDurationToSeconds("PT230M"), 13_800);
});

test("parseIsoDurationToSeconds: parses hour minute second duration", () => {
  assert.equal(parseIsoDurationToSeconds("PT3H50M12S"), 13_812);
});

test("parseEpisodeHtml: extracts JSON-LD podcast episode metadata", () => {
  const html = `
    <html>
      <head>
        <link rel="canonical" href="https://www.xiaoyuzhoufm.com/episode/abc123" />
        <script name="schema:podcast-show" type="application/ld+json">
          {
            "@type": "PodcastEpisode",
            "name": "140. 对姚顺宇的4小时访谈：请允许我小疯一下！",
            "timeRequired": "PT230M",
            "associatedMedia": {"contentUrl": "https://media.xyzcdn.net/audio.m4a"},
            "partOfSeries": {"name": "张小珺Jùn｜商业访谈录"}
          }
        </script>
      </head>
    </html>`;

  assert.deepEqual(parseEpisodeHtml(html, "abc123"), {
    title: "140. 对姚顺宇的4小时访谈：请允许我小疯一下！",
    canonicalUrl: "https://www.xiaoyuzhoufm.com/episode/abc123",
    audioUrl: "https://media.xyzcdn.net/audio.m4a",
    duration: 13_800,
    seriesTitle: "张小珺Jùn｜商业访谈录",
  });
});

