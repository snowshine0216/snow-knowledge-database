---
tags: [tech-tips, openai, api-keys, serpapi, huggingface, deepseek, qianwen, python]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Useful%20Tooltip.one%7C64d3c646-b079-e14a-b48a-7cab8b41e0f3%2Fopenai%7Cd0b17a89-091a-244a-8d77-0a2c728d62ab%2F%29
---

# OpenAI Tips

## API Keys Reference

All actual key values are redacted — retrieve from OneNote.

| Service | Account / Key Name | Location |
|---|---|---|
| OpenAI | snowshine0216@proton.me | https://platform.openai.com/account/api-keys |
| OpenAI API Key | sk-... | OneNote → Useful Tooltip → openai |
| OpenAI API Base | http://10.23.35.208:8060/v1 | Internal proxy |
| SerpAPI | 7bb2c... | OneNote |
| HuggingFace Token | hf_... | OneNote |
| DeepSeek | sk-... | https://platform.deepseek.com/api_keys |
| Qianwen | sk-... | OneNote |

## Python Setup

```python
import os
os.environ["OPENAI_API_KEY"] = '<redacted>'
os.environ["OPENAI_API_BASE"] = 'http://10.23.35.208:8060/v1'
os.environ["SERPAPI_API_KEY"] = '<redacted>'
```

## Install

```bash
pip install google-search-results
conda install -c conda-forge gensim
```
