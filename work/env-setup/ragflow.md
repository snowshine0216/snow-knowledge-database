---
tags: [env-setup, ragflow, dify, rag, llm, knowledge-graph, playwright]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2FRagflow%7C39e3873e-97f4-2f45-8296-cd1f59bf9dd8%2F%29
---

# Ragflow

## References

- Ragflow intro: https://zhuanlan.zhihu.com/p/1896285348708984090
- Ragflow docs: https://ragflow.io/docs/dev/
- Guide: https://zhuanlan.zhihu.com/p/27942707875
- Dify + Ragflow: https://www.cnblogs.com/looyee/p/18815725
- 源码解析: https://zhuanlan.zhihu.com/p/1893299536002261393
- Agent: https://zhuanlan.zhihu.com/p/27942670016
- 知识图谱: https://zhuanlan.zhihu.com/p/1889987430578365965

## Dify Account

- Account: snowshine@163.com (password in OneNote)

## Playwright MCP Plugin

- https://marketplace.dify.ai/plugins/hjlarry/playwright

```bash
docker run -p 3003:3000 --rm -it --workdir /home/pwuser --user pwuser \
  mcr.microsoft.com/playwright:v1.51.0-noble /bin/sh -c \
  "npx -y playwright@1.51.0 run-server --port 3000 --host 0.0.0.0"
```
