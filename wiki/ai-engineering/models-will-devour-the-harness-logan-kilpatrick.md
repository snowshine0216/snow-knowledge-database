---
tags: [harness-engineering, agentic-ai, gemini, google-deepmind, world-models, agent-runtime, vibe-coding]
source: https://mp.weixin.qq.com/s/6c6Nt5VrgU_EzEsG49h4wA
---
# 大模型一年内就会吞噬 Harness：Logan Kilpatrick 谈垂直创业唯一生路

Google AI Studio 与 Gemini API 负责人 Logan Kilpatrick（前 OpenAI 首任开发者关系负责人）在红杉 Sonya Huang 主持的访谈中，给火热的 Harness Engineering 泼冷水。核心论点：**“每一行外部脚手架，都是对模型无能的妥协，这种红利顶多还有 12 个月。”** 他判断模型会把 Agent 运行框架/中间件原生吞进自身，市面上约 90% 的 Agent 中间件公司活不过 12 个月；创业公司唯一活路是去打有专业知识壁垒的垂直深水区。这一观点与 [[claude-code-founder-programming-solved-harness-decline]] 的“Harness 持续收缩”形成跨实验室呼应。

## Key Concepts
- **模型吞噬 Harness**：两年前“模型”≈一组权重；如今 Gemini 3.5 / Claude / GPT 是“围绕权重不断扩展的完整系统”——自带 agentic 工具调用、托管工具、搜索、代码执行，并在容器里启动。脚手架总比内建能力领先一两步，随后被模型消化为原生能力。参见 [[harness-engineering]]。
- **12 个月窗口**：自建 Harness 的红利期约 12 个月；之后“价值在运行框架里”的说法不再以现在的方式成立，价值点转移到别处。
- **运行框架基准（harness benchmark）**：Logan 提议衡量不同模型适配各种框架的能力——“一个连别人运行框架都用不了的模型，不能算真正通用的模型”，借此反驳“自建 Harness 防供应商锁定”。
- **Anti-Gravity**：取代 Gemini API 成为串联 Google 所有产品的新主线，是一套含核心 IDE、agent-first 网页、CLI、SDK 的生态；基础框架约 80% 通用、20% 按用例（vibe coding / 消费级）专门化。
- **最大化结果而非最大化眼球**：Agent 时代用户停留时长必然下降，赢家是用最短时间/最少点击交付结果的人；旧互联网“在线时长换广告”逻辑失效。
- **后训练的爆发力**：Gemini 3.5 Flash 仅靠 post-training 就在编程上超过此前所有 Pro 模型——外界因看不到“预训练大跑次何时启动”而误判某家落后。
- **锯齿状垂直超级智能**：编程已接近 narrow ASI；在“解决”通用智能前会先得到很多可验证性强领域（数学、金融、科学）的 jagged superintelligence。
- **世界模型边界变模糊**：单一模型 Omni（任意输入→任意输出）把过去需训练 8 个模型的能力收进一个架构，扩展性远胜传统在线 world model（如 Genie）。

## Key Numbers
| 数字 / 事实 | 含义 |
|---|---|
| ~12 个月 | 自建 Harness 红利窗口；约 90% Agent 中间件公司存活上限 |
| ~80% / 20% | agent 运行框架通用部分 / 按用例专门化的比例 |
| 13 个 | Google 十亿用户级产品数量 |
| 10 万+ 工程师 | 内部使用 Gemini 形成的反馈飞轮规模 |
| 8 个模型 | Omni 出现前需分别训练的模型种类 |
| 35 万个 | 据当日数据，一周内 AI Studio 生成的 Android 应用 |
| 3.5 Flash | 编程超过此前所有 Pro 模型，提升全部来自后训练 |

## Key Takeaways
- 别把通用 Harness 当护城河——它随模型每次迭代而贬值；把它当临时手段，护城河放在垂直领域知识。
- 创业要打窄而深的场景：“专注就是创业公司的超能力”，大厂因“必须做很多事”而无法专注。
- 评估某实验室进度时，把“预训练窗口/算力集群何时启动”当作隐藏上下文，别只看当下榜单声量。
- 生成式媒体应放大“人”（保留本人文字/声音/形象）而非制造 AI 替身，只改变布景等“非人”部分。

## See Also
- [[harness-engineering]]
- [[claude-code-founder-programming-solved-harness-decline]]
- [[karpathy-vibe-coding-agentic-engineering-real-battleground]]
- [[demis-hassabis-agents-agi-virtual-cells]]
- [[claude-merges-80-percent-code-close-the-loop]]
