---
tags: [personalization, pkm, wiki, llm, file-over-app, andrej-karpathy]
source: https://x.com/karpathy/status/2040572272944324650
---

# Wiki LLM Personalization

Karpathy's case for why personal wikis built by LLMs are the best approach to AI personalization, contrasted with opaque "the AI learns you over time" systems.

## The Four Principles

### 1. Explicit Memory

The knowledge artifact is a navigable wiki, not a hidden embedding or opaque memory store. You can see exactly what the AI knows and doesn't know. You inspect, edit, and manage it directly. The LLM writes the text, but the artifact is yours to audit.

### 2. Data Ownership

Your data lives on your local machine. No vendor lock-in to a specific AI provider's memory system. You control extraction, deletion, and portability.

### 3. File Over App

Memory stored as plain files (markdown, images) in universal formats. This makes data interoperable:

- Any Unix tool, CLI, or agent can operate on it
- Any viewer can render it ([[Obsidian]], custom UIs, vibe-coded apps)
- Any data source can be imported as input
- No proprietary format lock-in

See Steph Ango's "File over app" philosophy.

### 4. BYOAI (Bring Your Own AI)

The wiki is AI-agnostic. Plug in Claude, Codex, OpenCode, or any model. You could even fine-tune an open-source model on your wiki so it "knows" you in its weights, not just attends over your data at inference time.

## Why This Matters

The status quo for AI personalization is implicit: use the product more and it allegedly gets better. Problems with that:

- You can't see what it "learned"
- You can't correct or delete specific memories reliably
- Your data is locked inside one provider
- Switching providers means starting over

The wiki approach inverts all of this. The tradeoff is more manual setup (managing file directories), but agents reduce that friction significantly.

## Connection to the LLM Knowledge Base Pipeline

This is the personalization thesis behind the [[LLM Knowledge Base]] workflow: raw sources (diary entries, notes, messages) compile into structured wiki articles. The compiled wiki becomes both a human reference and an AI context source.

Example: Farza's "Farzapedia" processed 2,500 diary/notes/message entries into 400 wiki articles covering friends, startups, research areas, and personal interests.

## Key Quote

> "Agent proficiency" is a CORE SKILL of the 21st century. These are extremely powerful tools — they speak English and they do all the computer stuff for you.
