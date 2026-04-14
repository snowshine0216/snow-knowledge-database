---
tags: [supabase, cli, setup, env-setup]
source: https://supabase.com/docs/guides/local-development/cli/getting-started
---

# Supabase CLI Setup

Install the Supabase CLI and link it to this repo's Supabase project.

## 1. Install

On macOS, install via the official Homebrew tap:

```bash
brew install supabase/tap/supabase
```

Verify:

```bash
supabase --version
```

The repo bootstrap script `env-setup/macos-setup.sh` installs this automatically.

## 2. Login

Authenticate the CLI with your Supabase account. This opens a browser for the OAuth flow and stores an access token locally:

```bash
supabase login
```

## 3. Link the project

From the repository root, link this working directory to the Supabase project used by the wiki site:

```bash
supabase link --project-ref yhbzezkmjiwosdaysgeh
```

This writes the project ref into `supabase/.temp/` / `supabase/config.toml` so subsequent CLI commands (migrations, `db pull`, `functions deploy`, etc.) target the correct remote project without passing `--project-ref` each time.

## 4. Common commands

```bash
# Check link / current project
supabase projects list

# Pull remote schema into local migrations
supabase db pull

# Apply local migrations to the linked project
supabase db push

# Deploy Edge Functions
supabase functions deploy <name>
```

## Notes

- The project ref `yhbzezkmjiwosdaysgeh` is not a secret — it identifies the project, but API access still requires the anon/service keys and your authenticated CLI token.
- If `supabase login` fails in a headless environment, generate an access token at https://supabase.com/dashboard/account/tokens and export it as `SUPABASE_ACCESS_TOKEN` before running `supabase link`.
