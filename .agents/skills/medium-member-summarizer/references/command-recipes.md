# Medium Member Summarizer - Command Recipes

## Basic extraction

```bash
python3 scripts/extract_medium_context.py \
  --url "https://medium.com/p/<post-id>" \
  --out-dir "/tmp/medium-member-summarizer"
```

## Custom Medium domain

```bash
python3 scripts/extract_medium_context.py \
  --url "https://medium.example.com/some-article-slug" \
  --out-dir "/tmp/medium-member-summarizer"
```

## Force browser and impersonation profile

```bash
python3 scripts/extract_medium_context.py \
  --url "https://medium.com/p/<post-id>" \
  --out-dir "/tmp/medium-member-summarizer" \
  --cookies-from-browser chrome \
  --impersonate chrome136
```

## Install dependency

```bash
python3 -m pip install --user curl_cffi
```
