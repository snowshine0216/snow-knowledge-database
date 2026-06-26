---
tags: [claude, anthropic, agent, claude-code, close-the-loop, evals, harness-engineering]
source: https://mp.weixin.qq.com/s/pu6b96vq9i15uMt2EGiemA
---
# Close the Loop：Anthropic 视角下的自改进 Agent 构建

机器之心整理的 Anthropic 研究产品经理 Theodora（Theo）Chu 演讲。核心数据：**Anthropic 内部超过 80% 的代码由 Claude 合并**——模型角色已从「回答问题」转向「在可反馈、可验证、可修正的环境里持续完成任务」。文章把一年来的能力跃迁拆成三个领域，并给出三条面向未来的构建战术，主旨是「Close the Loop（闭合循环）：给模型一种验证自身输出结果的方式」。

## Key Concepts
- **失败率下降，而非多答对题**：SWE-bench Verified 上 Sonnet 3.7（一年前）约 60% → Opus 4.8 达 88%，即旧模型失败次数约为今天的 3 倍；失败率降下来后模型才能承担更长任务。最新 Mythos / Fable 系列已使该基准接近饱和。
- **先规划再行动（Adaptive thinking）**：旧模型「不看说明书装宜家」式蛮干，新模型先在内部深思规范、在推理中自我修正（「实际上……」「算了，还是……」），第一次执行就高效落地，大幅减少工具调用与代码量。
- **错误恢复 vs doom looping**：旧模型被纠正后仍回到同一错解（doom looping）；新模型能读反馈、换路径。对策是重新设计**带反馈的环境**——如给应用生成 Agent 访问前端的能力，让它自己点击/测试，形成「执行→验证→修正→再执行」，顺带少烧 token。
- **长上下文连贯性 100 万 Token+**：旧模型「跟丢主线」；新模型可直接吞整个代码库，应把完整任务（整库、完整需求、完整流程）交给它，而非切碎喂单文件。
- **动态刷新 Evals**：客户「Evals 只涨 1%」常因旧基准没测到新能力；好 Eval 要面向未来，包含模型「今天还做不到」的任务。
- **Shrink the Scaffolding**：为旧模型打的提示词/约束补丁会随代际更替变成负债。Anthropic 删掉一行过时的引用格式系统提示词，就修好了被误判为 Bug 的 Claude.ai 引用功能（新模型太听话，忠实执行了过时指令）。
- **Close the Agent Loop（三件套）**：自适应思考 + **投入度拨盘（Effort Dial）**；Claude Code 的**「自动模式」分类器**（在控制欲与自主权间平衡、防误删环境）；**Computer Use** 等自我质检工具。

## Key Numbers
| 指标 | 数值 |
|---|---|
| Anthropic 内部 Claude 合并代码占比 | >80% |
| SWE-bench Verified（Sonnet 3.7 → Opus 4.8） | ~60% → 88% |
| 旧模型相对今天的失败次数 | ~3× |
| 长任务上下文连贯级别 | 100 万 Token+ |
| 出现饱和迹象的模型系列 | Mythos、Fable |

## Key Takeaways
- 模型能力的本质提升是**失败率快速下降**，这才解锁了更长、更接近真实工作的任务。
- 工程杠杆从「给模型加约束」转向「给模型设计能反馈的环境」——没有验证信号就没有错误恢复。
- 每次模型升级都应**反向审计并删除旧脚手架**，而非只做加法；过时补丁会主动制造回归 Bug。
- Evals 会过时，应把最新失败模式与未来方向写进测试用例，并在遗留问题不可解时换上更难的题。

## See Also
- [[agentic-loop-self-correction]]
- [[adaptive-reasoning]]
- [[context-engineering]]
- [[claude-code-best-practice]]
- [[claude-code-internals]]
