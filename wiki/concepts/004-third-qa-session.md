---
tags: [fine-tuning, lora, model-evaluation, rouge, bleu, llm-as-judge, agent-security, ai-platform, rag]
source: https://u.geekbang.org/lesson/818?article=946323
---

# LoRA 训练诊断、模型评估与 AI 中台稳定层设计

本文整理了 AI 工程化训练营第三次直播答疑的核心内容，涵盖如何读懂 LoRA 训练曲线并诊断问题、微调后模型的定量与定性评估方法、企业内部 Agent 工具的安全注意事项，以及在 AI 快速迭代背景下设计可持续 AI 中台架构的思路。

## Key Concepts

- **训练曲线四象限**：训练 loss + 验证 loss 的组合决定诊断结论——双升为训练失败（学习率过高）；双降未贴底为欠拟合（数据量少或 epoch 不够）；训练降验证升为过拟合（epoch 过多）；双降趋近底部为成功。Gradient Norm 仅辅助参考，核心永远是 loss 曲线。

- **三症状诊断法**：格式错误 → 加数据；事实错误 → 改用 RAG；复读/乱码 → 该任务不适合微调。

- **LLM-as-Judge**：用比待评模型更强的大模型（如 Qwen-Max）批量打分，评估维度为准确性、合规性、专业程度。分数是相对上一版本的自比较，而非绝对标准。适合需要评测多个微调版本时替代人工。

- **红队测试（Adversarial Testing）**：故意输入陷阱问题（如通过情感操纵要求执行危险命令），测试模型拒绝机制和安全防御能力。医疗/法律场景必做。

- **Agent 安全双重威胁**：沙盒（执行权限与环境隔离）+ 提示词注入（恶意内容污染 CLAUDE.md 或记忆文件）。OpenCloud 还额外面临无用户验证、插件/MCP 安全漏洞、token 消耗极快（¥/对话轮次）等问题，不建议企业大规模部署。

- **AI 中台稳定层**：MCP、Skills、RAG 知识库、用户 Memory、传统后端 API 属于稳定层，应抽象为基础设施；SOP 执行框架（Dify/LangGraph/AutoGen）和 Agent 交互形式属于易变层，可随框架更替而替换，不影响底层积累。

## Key Takeaways

- loss 曲线是微调健康状态的第一指标，读图诊断优先于盲目调参
- 测试集必须与训练集严格隔离；ROUGE+BLEU 适合批量定量，LLM-as-Judge 适合多版本横比
- Claude Code 类工具企业可用（管好沙盒和提示词注入）；OpenCloud 当前仅适合个人
- AI 中台设计的核心是识别什么不变（MCP/RAG/Memory）、什么会变（SOP/框架），稳定层建好后换上层框架无痛

## See Also

- [[003-second-qa-session]]
- [[lora-fine-tuning]]
- [[ai-engineering-three-patterns]]
