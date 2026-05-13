/**
 * adapter-interface.test.mjs — Unit tests for URL routing and adapter contract.
 * Run with: node --test playwright/adapters/adapter-interface.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAdapter, validateAdapter, supportedUrlPatterns } from "./adapter-interface.mjs";

// ── resolveAdapter — URL routing ──────────────────────────────────────────────

test("resolveAdapter: routes time.geekbang.org/column to geektime adapter", () => {
  const adapter = resolveAdapter("https://time.geekbang.org/column/intro/100083501");
  assert.ok(adapter, "adapter should not be null");
  assert.equal(adapter.name, "geektime");
});

test("resolveAdapter: routes time.geekbang.org/video to geektime adapter", () => {
  const adapter = resolveAdapter("https://time.geekbang.org/video/100082601");
  assert.equal(adapter.name, "geektime");
});

test("resolveAdapter: routes time.geekbang.org/course to geektime adapter", () => {
  const adapter = resolveAdapter("https://time.geekbang.org/course/100063001");
  assert.equal(adapter.name, "geektime");
});

test("resolveAdapter: routes u.geekbang.org/lesson to geekbang-u adapter", () => {
  const adapter = resolveAdapter("https://u.geekbang.org/lesson/818");
  assert.ok(adapter, "adapter should not be null");
  assert.equal(adapter.name, "geekbang-u");
});

test("resolveAdapter: routes u.geekbang.org/lesson with query params", () => {
  const adapter = resolveAdapter("https://u.geekbang.org/lesson/818?ref=home");
  assert.equal(adapter.name, "geekbang-u");
});

test("resolveAdapter: returns null for unknown hostname", () => {
  const adapter = resolveAdapter("https://example.com/course/123");
  assert.equal(adapter, null);
});

test("resolveAdapter: returns null for u.geekbang.org non-lesson path", () => {
  const adapter = resolveAdapter("https://u.geekbang.org/course/818");
  assert.equal(adapter, null);
});

test("resolveAdapter: returns null for invalid URL string", () => {
  const adapter = resolveAdapter("not-a-url");
  assert.equal(adapter, null);
});

test("resolveAdapter: returns null for empty string", () => {
  const adapter = resolveAdapter("");
  assert.equal(adapter, null);
});

// ── resolveAdapter — returned adapters pass validateAdapter ───────────────────

test("resolveAdapter: geektime adapter passes validateAdapter", () => {
  const adapter = resolveAdapter("https://time.geekbang.org/column/100083501");
  assert.doesNotThrow(() => validateAdapter(adapter));
  assert.equal(typeof adapter.enumerate, "function");
  assert.equal(typeof adapter.play, "function");
});

test("resolveAdapter: geekbang-u adapter passes validateAdapter", () => {
  const adapter = resolveAdapter("https://u.geekbang.org/lesson/818");
  assert.doesNotThrow(() => validateAdapter(adapter));
  assert.equal(typeof adapter.enumerate, "function");
  assert.equal(typeof adapter.play, "function");
});

// ── validateAdapter — contract enforcement ────────────────────────────────────

test("validateAdapter: throws for null", () => {
  assert.throws(() => validateAdapter(null), /must be an object/);
});

test("validateAdapter: throws for non-object", () => {
  assert.throws(() => validateAdapter("string"), /must be an object/);
});

test("validateAdapter: throws for missing name", () => {
  assert.throws(
    () => validateAdapter({ enumerate: () => {}, play: () => {} }),
    /"name"/
  );
});

test("validateAdapter: throws for missing enumerate", () => {
  assert.throws(
    () => validateAdapter({ name: "test", play: () => {} }),
    /"enumerate"/
  );
});

test("validateAdapter: throws for missing play", () => {
  assert.throws(
    () => validateAdapter({ name: "test", enumerate: () => {} }),
    /"play"/
  );
});

test("validateAdapter: throws if enumerate is not a function", () => {
  assert.throws(
    () => validateAdapter({ name: "test", enumerate: "not-a-fn", play: () => {} }),
    /enumerate.*function/
  );
});

test("validateAdapter: throws if play is not a function", () => {
  assert.throws(
    () => validateAdapter({ name: "test", enumerate: () => {}, play: 42 }),
    /play.*function/
  );
});

test("validateAdapter: throws for empty name string", () => {
  assert.throws(
    () => validateAdapter({ name: "", enumerate: () => {}, play: () => {} }),
    /non-empty string/
  );
});

test("validateAdapter: passes for valid adapter shape", () => {
  assert.doesNotThrow(() =>
    validateAdapter({ name: "my-platform", enumerate: () => {}, play: () => {} })
  );
});

// ── supportedUrlPatterns ──────────────────────────────────────────────────────

test("supportedUrlPatterns: returns an array of strings", () => {
  const patterns = supportedUrlPatterns();
  assert.ok(Array.isArray(patterns));
  assert.ok(patterns.length > 0);
  for (const p of patterns) {
    assert.equal(typeof p, "string");
  }
});

test("supportedUrlPatterns: includes geekbang-u pattern", () => {
  const patterns = supportedUrlPatterns();
  assert.ok(patterns.some((p) => p.includes("u.geekbang.org/lesson")));
});
