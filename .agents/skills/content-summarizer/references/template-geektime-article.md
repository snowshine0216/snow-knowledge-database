# Template: geektime-article

Cornell Notes format for Geektime articles and similar structured educational text.

```markdown
---
tags: [tag1, tag2, ...]
source: <article_url>
---

## Chapter Metadata
- Course: <course name>
- Chapter: <NNN> — <article title>
- Author: <author>
- Date: <YYYY-MM-DD>
- Article ID: <id>

## Cornell Notes

### Cue Column (Questions)
- <question that the notes answer>
- ...

### Notes Column
<detailed notes from the article content>

### Summary
<2–4 sentence synthesis of the chapter>

## Key Takeaways
- <concrete actionable finding>
- ...

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
<!-- Every entry MUST use [[wikilinks]] — never backtick spans, never plain text -->
- [[<key concept>]]：one-line description; inline-link to [[<related concept>]] when useful
- [[<key concept 2>]]：...

### 2. 课程内导航链接
<!-- One entry per OTHER chapter in the same course — always present for course files -->
- [[<NNN-slug>|第 NN 讲 <Title>]]：one sentence explaining what that chapter adds to this chapter's concepts

### 3. 课程外与通用概念关联
<!-- Link to existing wiki/ cards or named concepts outside this course -->
- [[<wiki-slug>|<Concept Name>]]：how it connects to this chapter's content

### 4. 推荐关系边（可直接扩成独立卡片）
<!-- Explicit typed triples — use semantic predicates, NOT code-style arrows like --holds--> -->
<!-- Good verbs: replaces · centers-on · implements · enables · protects · extends · composed-of · governed-by · inspired-by · specializes · constrains · prevents -->
- [[A]] → <verb> → [[B]]
- [[A]] → <verb> → [[B]]

### 5. 后续值得沉淀成卡片的主题
<!-- New concepts introduced in this chapter that don't yet have wiki cards but should -->
- [[<ConceptX>]]
- [[<ConceptY>]]

## Notes For Review
- <open questions or things to revisit>
```
