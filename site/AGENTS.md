<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Testing

- **Framework**: vitest (node environment)
- **Single run**: `npm test` (from `site/`)
- **Watch mode**: `npm run test:watch`
- **Test files**: `lib/__tests__/**/*.test.ts`
- **Scope**: pure functions only (`lib/content.ts`, `lib/wikilinks.ts`); UI components are browser/E2E only
