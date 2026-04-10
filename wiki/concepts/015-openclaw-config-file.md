---
tags: [openclaw, system-prompt, configuration, persona, ai-agent, prompt-engineering]
source: https://time.geekbang.org/course/detail/101123301-965559
---
# OpenClaw 核心配置文件：AID × KTV 框架

OpenClaw 的核心配置文件是给 AI 的"身份证明书"——一个系统提示词，控制 AI 的思考深度、行为边界、知识接入和输出格式。掌握配置文件是从"工具使用者"升级为"工具构建者"的关键跨越。

## Key Concepts
- **AID 框架**：Agent身份（你是谁）+ Intelligence能力边界（你会什么）+ Direction行为指令（你怎么做），三层决定 AI 专业化程度
- **KTV 结构**：每个 AID 模块内细化为 Knowledge（背景知识）、Tasks（核心任务）、Values（行为边界）三个维度
- **数字面具**：AI 的角色定位和人格特征，配置越具体越能避免边界情况下的随机行为
- **四条原则**：角色优先 → 深情胜宽泛 → 动态记录行为偏好 → 规定触发规则
- **迭代路径**：先跑默认 → 记录痛点 → 针对痛点写规则 → 重新激活测试 → 逐步打磨

## Key Takeaways
- 配置文件等于"装修设计图"：房子结构固定（OpenClaw），装修风格（行为）完全由你决定
- 应写具体可执行规则，不写空洞口号或敏感信息
- 好的配置文件让龙虾在你不在时也能以你的标准思考和工作

## See Also
- [[012-openclaw-skills-concept]]
- [[002-openclaw-digital-employee]]
- [[004-openclaw-gateway-node-channel]]
