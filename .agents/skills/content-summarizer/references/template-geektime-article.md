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

## Knowledge Graph Seeds

**Entities:**
- (Course: <course name>)
- (Chapter: <chapter title>)
- (Author: <author>)
- (Concept: <key concept>)

**Relations:**
- (Course: <course>) -> contains -> (Chapter: <chapter>)
- (Chapter: <chapter>) -> covers -> (Concept: <concept>)

## Notes For Review
- <open questions or things to revisit>
```
