---
tags: [obsidian, note-taking, knowledge-management, sync, tools]
source: https://www.youtube.com/watch?v=IlNOhNeWGgY&t=32s
---

# Obsidian Usage

Obsidian is a local-first, Markdown-based knowledge management tool. Its core value lies in data ownership, portability, and strong compatibility with AI and automation workflows. This article covers practical setup patterns for long-term knowledge-base maintenance.

## Cloud Sync

Obsidian vaults are plain folders of Markdown files, so sync can be handled by any file-synchronization method. Options include:

- **Obsidian Sync** (paid, official)
- **Git-based sync** (free, requires manual setup)
- **Third-party cloud storage** (iCloud, Dropbox, etc.)

Whichever method is chosen, configure it with conflict awareness -- avoid editing the same file on multiple devices simultaneously.

## AI Integration

Obsidian's local-file architecture makes it straightforward to integrate with [[LLM Knowledge Base]] workflows:

- Vault contents can be fed directly to LLM context as plain text
- Plugins can bridge Obsidian to AI APIs for in-editor summarization, tagging, or search
- The Markdown-native format avoids conversion overhead when piping content to models

## Image and Attachment Handling

Default image insertion can create disorganized folder structures. Recommended setup:

- Install the **Custom Attachment Location** plugin
- Configure attachments to land in predictable, note-relative folders
- Use Markdown-compatible image link formats for portability outside Obsidian
- Prefer local attachment storage over external hosting for privacy, stability, and cost

## Mobile Setup

1. Copy the vault folder to phone storage (or clone via Git)
2. Open the folder in Obsidian Mobile
3. Configure Git-based sync on mobile:
   - Set GitHub username and email
   - Generate a Personal Access Token (Classic) with repository permissions
   - Paste the token into the mobile Git plugin config

**Operational caution:** do not edit the same file on phone and desktop simultaneously. Resolve merge conflicts manually if they occur.

## Export

- Install an export plugin (e.g., Pandoc-based)
- Configure the local `pandoc` executable path in plugin settings
- Export notes to Word, PDF, or other formats from the context menu
- Images are included correctly in exported output

## Knowledge Graph

Obsidian's graph view visualizes relationships between notes via [[wikilinks]]:

- Use bidirectional links (`[[note-name]]`) to build explicit relationships
- The graph view reveals note clusters and hidden connections
- Consistent linking discipline improves both retrieval and idea discovery

## Best Practices

- Treat Obsidian as a portable workflow system, not just a note editor
- Use standards-compatible Markdown and deterministic folder/link behavior
- Validate rendering outside Obsidian to avoid lock-in
- Maintain consistent `[[wikilinks]]` to power the knowledge graph

See also: [[LLM Knowledge Base]]
