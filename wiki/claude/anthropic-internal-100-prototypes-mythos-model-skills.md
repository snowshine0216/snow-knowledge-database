---
tags: [anthropic, claude, claude-cowork, claude-code, ai-agent, mcp, skills, llm, product-design, ai-safety]
source: https://mp.weixin.qq.com/s/NVri4P4EaACyzHwyocabRg
---

# Anthropic 内部：Mythos 模型、100 个原型、Skills 杠杆

InfoQ 对 Anthropic Claude Cowork 工程负责人 Felix Rieseberg 的播客访谈整理（主持人：Matt Turck，2026-04-14）。访谈披露了三条核心信息：一款未发布的新模型 Mythos Preview 在网络安全方向出现"断层式"跃迁；执行成本趋近于零使 Anthropic 内部同时运行约 **100 个产品原型**；Skills（Markdown 文件写成的操作手册）被证明是出乎意料地高效的产品杠杆。

## Key Concepts

- **Mythos Preview**：Anthropic 内部使用的未发布 frontier model，并非专为安全训练，但在**发现代码安全漏洞**方面能力"异常突出"。演示案例：研究员放模型进沙盒让它"尝试逃出去"后去吃午饭，回来时模型已发邮件说"我已经逃出来了"——尽管它本不应有互联网访问权限和邮箱账户。Felix 的判断：这次是真正"断层式"跃迁，不是常规迭代。

- **Project Glasswing**：Mythos 的定向发布策略，优先向 Linux Foundation 等基础设施维护者开放，让**防御者先于大众**使用这个能力，在攻击者获得类似能力之前修复漏洞。短期内完全封闭，未来仅对企业客户开放。

- **Skills = Markdown SOP**：Skills 是 Markdown 文件，用人类语言告诉模型"该怎么做事"。Felix 的订机票 skill 示例：把 Anthropic 内部差旅平台规则 + 个人偏好（不要红眼航班、旧金山飞纽约尽量订下午 4 点）写进文件，模型即可准确执行。Felix 反复强调这个效果"好到让团队意外"。

- **执行成本趋零 → 先做后筛**：以前提一个想法要排期 3 周验证；现在可以"给我 10 分钟，我给你一个版本"。Anthropic 内部同时约有 100 个原型在跑。决策瓶颈从"执行"转移到"alignment（人的对齐）"和"品味"。

- **本地优先架构**：Cowork 运行在用户本地电脑而非云端，三重原因：① Session 价值（已登录账户对 agent 价值巨大，无法轻易云端复刻）；② 安全性（不应教用户把密码交给一家公司）；③ 长尾问题（银行检测到两地登录会锁号要求护照线下验证）。

- **记忆 = 文本文件**：Cowork 的记忆系统本质是 harness 层的文本文件，分项目级和全局级，无复杂数据库。模型被指示"如果这个信息未来可能有用，就写下来"。

- **MCP 被低估**：Felix 认为 MCP connectors 将"数据"与"执行引擎"分离，是 WebSocket 级别的底层协议——用户不感知但工程师严重低估了它。预测今年年底/明年会变得极其关键。

- **不是每个产品都需要聊天框**：Felix 提醒 AI 开发者别把"在右边加侧边栏+聊天框"当成 AI 集成的默认答案，应该思考如何让 AI 以更自然的方式存在。

## Key Numbers

| 数据点 | 数值 |
|---|---|
| Cowork 发布前冲刺时间 | ~10 天 |
| Anthropic 内部同时运行原型数 | ~100 个 |
| 想法到可用版本 | ~10 分钟 |
| 产品 roadmap 最长周期 | 1 个月 |
| Felix 今年查看汇编语言次数 | 0（过去五年从不为零） |

## Key Takeaways

- 模型是"grown"（长出来的）而非"built"——训练前无法完全预知擅长方向，Mythos 的安全能力也是意料之外的惊喜
- 产品成功的秘诀是"去掉了什么"而非"加了什么"——Claude Code 的核心成功来自 UX 变化，模型本身没变
- 当前 AI 产品处于"诺基亚 3310 时代"：好用，但距真正的"iPhone 时刻"还很远
- 未来的关键技能从"精通计算机语言"转向"精通人类语言"——软件将真正"为人而造"
- 信任通过可委托的小任务积累：先"帮我整理桌面"，再逐步委托定时复杂任务

## See Also

- [[beating-cowork-with-open-source-cowork_-UoxWCsqIa0]]
- [[harness-engineering_3DlXq9nsQOE]]
- [[claude-code-language-benchmark]]
