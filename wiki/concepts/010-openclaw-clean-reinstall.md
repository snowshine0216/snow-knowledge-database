---
tags: [openclaw, ai-agent, uninstall, troubleshooting, clean-install, geektime]
source: https://time.geekbang.org/course/detail/101123301-963985
---
# OpenClaw 彻底卸载与干净重装

当报错不断、版本混乱或配置损坏时，推倒重来往往比反复排错效率更高。`openclaw uninstall` 会清除所有数据（包括记忆），卸载前必须备份；云端则直接删除实例并关闭自动续费。

## Key Concepts
- **重装优先于排错**：积累太多奇怪报错时，干净重装比逐一修复效率高得多
- **高风险操作**：`openclaw uninstall` 删除全部数据（记忆、配置、对话历史），不可逆
- **备份先行**：卸载前务必保存记忆文件、自定义 Skills、API Key 等重要数据
- **云端额外步骤**：关闭自动续费（防止继续扣费）+ 撤销旧 API Key（防止被盗用）

## Key Takeaways
- 进入"干净环境"比任何小修小补都有效——这是官方建议的排错最后手段
- 本地：`openclaw uninstall` → 检查残留进程；云端：销毁实例 → 关闭续费
- 吊销旧 API Key 是安全步骤，不要遗漏

## See Also
- [[006-openclaw-curl-install]]
- [[005-openclaw-local-vs-cloud-install]]
