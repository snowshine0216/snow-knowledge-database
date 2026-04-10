---
tags: [openclaw, ai-agent, digital-employee, unix-philosophy, skills]
source: https://time.geekbang.org/course/detail/101123301-955167
---
# OpenClaw：你的第一号数字员工

OpenClaw（龙虾）是一个基于 UNIX 哲学构建的 AI Agent 系统，由奥地利开发者 Peter 创建。与聊天 AI 的本质区别在于它能真正完成工作闭环：自主执行任务、遇到问题自行解决、汇报结果——而不只是给建议。不到四个月在 GitHub 获得 27.9 万 Star，地方政府为其发布政策支持文件。

## Key Concepts
- **工作闭环**：交代任务 → 自主运行 → 遇障碍自行解决 → 汇报结果，区别于一问一答的聊天 AI
- **Skills 机制**：小而专的工具模块，热加载无需重启，最重要特性是能自己修改自己
- **UNIX 哲学**：命令行为智能体的终极接口，工具小而可组合，文本交互，故意不支持 MCP
- **诞生故事**：Peter 的 Agent Bolt 在无语音识别功能时自行调用 Whisper API，证明了自主解决问题的能力

## Key Takeaways
- OpenClaw 能自主扩展自身能力边界，运行中写 Skill 解决不会的任务
- 底层依赖高能力模型（Claude Opus），命令行操作一切外部服务
- 国内可接入飞书/钉钉/企业微信，Docker 三四步部署，有中文插件套装

## See Also
- [[openclaw-architecture]]
- [[001-课程介绍]]
