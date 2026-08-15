---
tags: [karpathy, opus-5, threejs, multimodal, visual-verification, llm-capabilities]
source: https://mp.weixin.qq.com/s/43aMVXrPvCq_DL9yWqmKkQ
---

# Karpathy：Opus 5 3D 世界与 LLM 视觉验证缺口

AI 寒武纪短文转述了一次 Three.js 实验：将《魔戒》开头一段交给 Opus 5，在约 **100 万 token**、约 **10 美元**的预算下运行近两小时，产出约 **5,500 行代码**的程序化 3D 场景。它提示长尾定制内容的尝试成本正在下降，但也把一个更实用的瓶颈暴露出来：模型能写出场景，并不表示它能连续观看、操作、验收并修正场景。

## Key Concepts
- **长尾定制原型**：小说片段到 Three.js 场景这类一次性需求通常不值得人类团队专门开发；约 10 美元级实验成本使“先做一个看看”成为合理选择，但不等于已具备量产游戏质量。
- **三维代码生成**：模型需在 `(x, y, z)` 空间安排多边形资产、生成动画代码并保持长程一致性；5,500 行产出展示的是代码组合能力，而非自动验收能力。
- **视觉验证缺口**：原文称模型只能在少数节点截图检查，无法高效看视频或进入场景试玩；离散截图会漏掉动态、交互或连续画面中的问题。
- **闭环任务设计**：UI、3D 与游戏任务应让模型得到执行后的视觉或交互反馈，再进行修正；这与 [[verification-horizon-coding-agent-rewards]] 所强调的验证信号重要性一致。
- **任务分流**：作者的 Paul Graham 双语 EPUB 管线约 1 小时、约 10 元、约 1.5 亿 token，表明文本/文件任务和视觉交互任务需要不同的验收接口，不能由单次代码速度决定质量。

## Key Numbers
| 指标 | 文中数值 |
|---|---|
| Three.js 场景上下文预算 | 约 100 万 token |
| 生成成本 / 时间 / 代码量 | 约 10 美元 / 接近 2 小时 / 约 5,500 行 |
| 火星模拟时间（Kimi / DeepSeek） | 约 1.5 小时 / 约 20 分钟 |
| 双语 EPUB 管线 | 约 1 小时、约 10 元、约 1.5 亿 token |

## Key Takeaways
- 把“视觉能力”落实为验收能力：能截图、理解视频帧、操作场景并据此重试，才形成生成后的质量闭环。
- 3D 原型的首轮代码成本很低，不代表总交付成本也低；验证弱时，人工复核与返工仍可能主导成本。
- 在产品设计中按反馈需求分流：文本批处理重在数据与格式验证，视觉交互重在连续观察和操作验证。

## See Also
- [[verification-horizon-coding-agent-rewards]]
- [[vision-agent-with-segmentation-tool]]
- [[agentic-loop-self-correction]]
