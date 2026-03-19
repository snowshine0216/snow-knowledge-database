# GitHub Repo Setup

This guide is for configuring GitHub remotes and authentication in this repository.

## 1. Check Current Remote

```bash
git remote -v
```

## 2. Update `origin` Remote URL

Use HTTPS:

```bash
git remote set-url origin https://github.com/<your-username>/<your-repo>.git
```

Use SSH:

```bash
git remote set-url origin git@github.com:<your-username>/<your-repo>.git
```

Verify:

```bash
git remote -v
```

## 3. Let Git Remember HTTPS Credentials

Store credentials on disk:

```bash
git config --global credential.helper store
```

After this, do one authenticated operation (for example `git push`). Git will save the credential and reuse it.

Check current credential helper:

```bash
git config --global --get credential.helper
```

## 4. Personal Access Token (PAT) with HTTPS

GitHub no longer accepts account passwords for HTTPS git operations. Use a PAT instead.

When prompted:

- Username: your GitHub username
- Password: your PAT

## 5. Useful Git Identity Setup

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Verify:

```bash
git config --global --get user.name
git config --global --get user.email
```

## 6. Recommended Safety and Cleanup Tips

- Do not embed PATs in remote URLs.
- If a token appears in `git remote -v`, replace the URL immediately:

```bash
git remote set-url origin https://github.com/<your-username>/<your-repo>.git
```

- Rotate exposed tokens in GitHub Settings as soon as possible.
- Prefer `git push --force-with-lease` instead of `git push --force` after history rewrites.

## 7. Quick Troubleshooting

`fatal: Authentication failed`

- Confirm remote URL is correct: `git remote -v`
- Confirm you used PAT (not GitHub password)
- Re-run push and enter username + PAT again

`Obsidian Git asks for username/token on every auto-push`

- Ensure remote URL has no embedded token:

```bash
git remote set-url origin https://github.com/<your-username>/<your-repo>.git
```

- Make this repo use a single helper and host/path matching:

```bash
git config --local credential.helper ""
git config --local --add credential.helper store
git config --local credential.useHttpPath true
```

- Clear stale GitHub credentials once, then push once and enter username + PAT:

```bash
printf "protocol=https\nhost=github.com\n\n" | git credential reject
git push
```

`fatal: Need to specify how to reconcile divergent branches`

Set a default pull behavior:

```bash
git config pull.rebase false
```

or

```bash
git config pull.rebase true
```

or

```bash
git config pull.ff only
```

## 8. Quick Auto-Push Verification

Use this file edit as a safe test change for Obsidian Git auto-backup.

Test marker updated: 2026-03-19
