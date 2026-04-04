---
tags: [tech-tips, python, flask, cors, vscode, langchain, flake8]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Useful%20Tooltip.one%7C64d3c646-b079-e14a-b48a-7cab8b41e0f3%2Fpython%7Cc861f2f7-3e4f-5d45-9dd2-56e0edac5a95%2F%29
---

# Python Tips

## Install

```bash
pip install langchain --upgrade
```

## PYTHONPATH Exports

```bash
export PYTHONPATH="${PYTHONPATH}:/Users/xuyin/Documents/Repository/hackthon/winter_2024/service"
export PYTHONPATH="${PYTHONPATH}:/Users/xuyin/Documents/Repository/restapi-pytest"
export PYTHONPATH="${PYTHONPATH}:/Users/xuyin/Documents/Repository/visual_ai/L2/code/h-uicheck"
export PYTHONPATH="${PYTHONPATH}:/Users/xuyin/Documents/Repository/ToolsBySnow/reinstallvra"
export PYTHONPATH="${PYTHONPATH}:/Users/xuyin/Documents/Repository/python/AITest"
export PYTHONPATH="${PYTHONPATH}:/Users/xuyin/Documents/Repository/env_manage"
export PYTHONPATH="${PYTHONPATH}:/home/admin/projects/code_generation"
export PYTHONPATH="${PYTHONPATH}:/Users/xuyin/Documents/Repository/code_migration"
export PYTHONPATH="${PYTHONPATH}:/Users/xuyin/Documents/Repository/quality_management"
```

## References

- Flake8 error codes: https://flake8.pycqa.org/en/latest/user/error-codes.html
- Python VSCode extension: https://marketplace.visualstudio.com/items?itemName=ms-python.python

## VSCode settings.json (Python)

```json
"flake8.args": [
    "--max-line-length=248",
    "--ignore=F403,F404,F405, F601, E401, E402, I001, I002, I003, I004, I005"
],
"editor.formatOnSave": false
```

## Directory Helpers

```python
# current dir
current_dir = os.getcwd()
# parent dir
parent_dir = os.path.dirname(current_dir)
# data path
data_dir = os.path.join(parent_dir, 'docs/OneFlower')
```

## VSCode Debug

```json
"justMyCode": false
```

## API Keys

- Google API key — see OneNote (redacted)

## Enable CORS

### Flask

```python
app = Flask(__name__)
CORS(app)
```

### Nginx

```nginx
location / {
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'User-Agent,Keep-Alive,Content-Type';
    # 其他配置...
}
```
