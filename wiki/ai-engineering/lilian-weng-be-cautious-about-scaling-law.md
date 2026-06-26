---
tags: [scaling-laws, llm, pretraining, chinchilla, kaplan, compute-optimal, data-constrained, lilian-weng]
source: https://mp.weixin.qq.com/s/FIIr4ye0TJNdXg4nnRUCPw
---
# 谨慎对待 Scaling Law（翁荔 Lil'Log）

翁荔（Lilian Weng）时隔 13 个月更新的 Lil'Log 长文，机器之心 AI 辅助整理翻译。Scaling law 是「描述计算量、损失、模型规模与数据之间关系」的框架，核心问题是如何把宝贵算力在模型规模 N 与数据 D 之间最优分配。其实用价值在于**可在小模型上拟合、外推到大几个数量级的模型**——而这恰恰是「谨慎」二字的来源：外推对微小的流程选择极度敏感。

## Key Concepts
- **幂律的早期渊源**：Amari (1992) 推出四类学习曲线（指数 α = −2/−1/−1/2）；Hestness (2017) 发现**架构改变幂律的截距 E 而非指数 α**，斜率像是问题领域属性；Rosenfeld (2020) 把误差建模为 N、D 的联合幂律，可在小配置上拟合外推。
- **Kaplan (2020)**：在语言建模上把幂律形式化（模型 7.68 亿~15 亿非嵌入参数、数据 2200 万~230 亿 token）。著名（后被推翻的）计算最优结论：算力 ×10 → 模型 ×5.5、token ×1.8（模型增长快于数据）。工程铁律 **C ≈ 6ND**（每 token≈6N FLOPs）。
- **Chinchilla (Hoffmann 2022)**：扫描 400+ 模型、三种互补方法（固定模型扫 token / IsoFLOP 抛物线 / 参数化 Huber+L-BFGS 拟合）得出一致结论——**模型与 token 应等比扩展（翻倍同翻倍）**，优先「在更多数据上训练较小模型」。演示：Chinchilla（700 亿/1.4 万亿）以 1/4 体积、~4× token 全面击败 Gopher（2800 亿/3000 亿），证明当时大模型训练不足。
- **调和分歧（Pearce & Song 2024）**：分歧根源是方法学——Kaplan 在小模型拟合 + 嵌入层占比 + 双对数外推放大误差。用总参数/非嵌入参数关系，使局部指数 g 在 Kaplan 区域（7.68 亿~15 亿）收敛到 ~0.73，把两套结论衔接。
- **为什么是幂律**：数据流形维度假说（Sharma & Kaplan 2020）与技能「量化」假说（Michaud 2023、Brill 2024）——均缺乏可直接测量的量，说明 Scaling law 至今强经验、弱理论。
- **数据受限区**：撞「数据墙」后须重复数据。Hernandez (2022) 观察到**双重下降**（90% 去重 + 10% 重复，1000 亿 token）；Muennighoff (2023) 把 token 价值建模为随重复指数衰减；Lovelace (2026) 显式建模容量比 N/D_U 的过拟合惩罚，结论是**应优先加训练轮次而非扩模型，且强权重衰减能缓解过拟合**。
- **拟合的微妙陷阱（Besiroglu 2024）**：复现 Chinchilla 方法 3 发现，Huber 损失**求平均而非求和**导致优化过早终止、置信区间假性狭窄；α/β 四舍五入到 2 位放大 A、B 偏差。模拟显示损失精度、0.001 量级噪声、拟合区域都会改变结果。

## Key Numbers
| 项目 | 数值 |
|---|---|
| Lil'Log 距上次更新 | 13 个月 |
| Kaplan 计算最优：算力 ×10 → 模型 / token | ×5.5 / ×1.8 |
| 训练 FLOPs | C ≈ 6ND |
| Chinchilla 扫描 | 400+ 模型，50 亿~5000 亿 token |
| Chinchilla vs Gopher | 700 亿/1.4 万亿 vs 2800 亿/3000 亿 |
| Pearce & Song：Kaplan 区域局部指数 g | ~0.73 |
| Lovelace 2026 | ~300 模型，1500 万~10 亿参数，5000 万~60 亿去重 token |

## Key Takeaways
- Scaling law 的「外推」本质是双对数空间的线性外推——精度、求和/平均、拟合区间的微小选择会被放大几个数量级，这就是两组顶尖团队得出方向相反结论的原因。
- 「该计入哪些参数」（嵌入层 in/out）在小模型区直接改变拟合指数，跨代际比较必须统一参数定义。
- 数据墙时代资源分配重心从「扩大模型」转向「增加轮次 + 数据质量 + 强权重衰减」；模型越大对重复数据越敏感。
- 受限区 Scaling law 的自由参数多为经验拟合而非第一性原理，外推风险更高，在失败模型上系统性失准——故「谨慎对待」。

## See Also
- [[aie-ch02-understanding-foundation-models]]
- [[aie-ch07-finetuning]]
- [[chip-huyen-ai-engineering-book]]
- [[context-engineering]]
