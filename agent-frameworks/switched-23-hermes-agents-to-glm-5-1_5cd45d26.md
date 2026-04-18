---
tags: [ai-agents, glm, hermes, multi-agent, llm-comparison, telegram, rate-limiting, zhipu]
source: https://mp.weixin.qq.com/s/iAu5VRfFHXA8oqXJQbElvw
wiki: wiki/concepts/switched-23-hermes-agents-to-glm-5-1.md
---

# 我把Hermes里23个Agent全切到GLM-5.1：执行力比GPT强，但有个硬伤

## Article Info
- URL: https://mp.weixin.qq.com/s/iAu5VRfFHXA8oqXJQbElvw
- Title: 我把Hermes里23个Agent全切到GLM-5.1：执行力比GPT强，但有个硬伤
- Author: 孟健（孟健AI编程）
- Publish time: 2026-04-13
- Access mode: `public`

## Executive Summary

作者将23个基于Hermes框架的AI Agent从GPT全部切换到智谱GLM-5.1，原因是GPT成本高且输出啰嗦。切换极简——改两行`config.yaml`，5分钟完成。实测一天跑了1556条消息：从零搭建了一个Hermes入门站点、调通了10个Agent串行流水线、排查了Telegram Bot-to-Bot通信的3个坑。GLM-5.1在执行力、调试能力、中文理解上表现超预期，成本砍半；但多Agent并发会触发rate limit（429），是目前最大硬伤。

## Key Numbers

| 数值 | 含义 |
|---|---|
| 23 | 团队Agent总数 |
| 15 sessions / 1556条消息 | 切换首日总消耗 |
| 5分钟 | 从改配置到全部Agent上线耗时 |
| 172条消息 | 主Agent小墨独立建站消耗 |
| 30KB | 生成的单页应用 index.html 大小 |
| 10 | 串行Pipeline中的Agent数量 |
| 3–4 | 触发429 rate limit的并发Agent数量阈值 |
| 50% | 切换后成本降幅 |

## Outline

1. **为什么要换？** — 解释从GPT切换的两个动机：成本高、输出啰嗦
2. **切换过程：改一行配置** — 演示Hermes的模型切换有多简单
3. **实测：GLM-5.1跑Agent到底行不行？** — 三个真实任务的执行过程
4. **体感对比：GLM-5.1 vs GPT** — 四个维度的主观评测
5. **硬伤：并发rate limit** — 多Agent并发导致429的问题与应对策略
6. **结论** — 国产模型在Agent赛道的判断与推荐场景

## Section Summaries

### 1. 为什么要换？

**核心论点**：GPT在多Agent场景有两个实际问题，成本和啰嗦度，而不是能力问题。

- **成本**：23个Agent同时在线，加上定时任务和突发协作，Token消耗"飞快"
- **啰嗦**：GPT系列过度"热心"——改个配置文件也要先解释为什么改、再解释怎么改、最后总结改了什么，23个Agent都这样效率打折
- 触发切换的时机：智谱放出GLM-5.1的编程API

### 2. 切换过程：改一行配置

**核心论点**：Hermes的模型切换设计极简，全局配置中心化，脚本一键同步。

全局配置文件 `~/.hermes/config.yaml`，改两行：

```yaml
model:
  default: glm-5.1
  provider: zai
  base_url: https://open.bigmodel.cn/api/coding/paas/v4
```

用Shell脚本将新config同步到所有23个Agent的profile目录：

```bash
for profile in ~/.hermes/profiles/*/; do
  cp ~/.hermes/config.yaml "${profile}config.yaml"
done
```

重启gateway后全部上线，总耗时5分钟。

### 3. 实测：GLM-5.1跑Agent到底行不行？

三个真实任务，覆盖单Agent自主建站、多Agent协作流水线、复杂Bug排查。

#### 3.1 从零搭建Hermes Agent 101站点

主Agent"小墨"独立研究GitHub仓库、Release Notes、官方文档后：
- 写了30KB的单页HTML（包含Hero区、9大核心能力卡片、7天入门路径、FAQ）
- 配好SEO（sitemap、robots.txt、llms.txt、Schema.org）
- 一键部署到Cloudflare Pages（hermes101.pages.dev）
- **全程172条消息，作者零代码干预**

#### 3.2 调通多Agent串行流水线

**背景**：Telegram Bot默认无法看到其他Bot消息，直到Bot API 9.6（2026年4月3日）开放Managed Bots能力，Bot-to-Bot Communication才真正可行。

Pipeline回调机制：
1. 小墨创建JSON状态文件（Pipeline定义）
2. 自动派发Step 1给墨探
3. 墨探完成后 `@hermes_xiaomo_bot /pipeline-done hermes101-site step-1`
4. 小墨收到回调，标记done，自动派发Step 2给墨策
5. 依次推进10步直到完成

实现了"调研→PRD→预算→合规→SEO→设计→开发→部署→验收→推广"的全链路自动推进。

#### 3.3 排查Bot-to-Bot通信的坑

GLM-5.1展现了超预期的自主调试能力，独立排查并修复了三个坑：

- **坑1（mention格式）**：Bot收不到@提及 → GLM-5.1翻Telegram Bot API文档，发现需要用正确的mention entity格式，自己写脚本解决
- **坑2（API Key命名）**：Provider 'zai' is set but no API key found → 查Hermes源码发现zai provider依次查 `GLM_API_KEY`、`ZAI_API_KEY`、`Z_AI_API_KEY`，而.env只有前者，自己补齐所有profile
- **坑3（白名单过滤）**：Bot消息被 `TELEGRAM_ALLOWED_USERS` 过滤 → 查出23个Bot的ID，一次性加白名单

> 这三个坑，全程它自己排查、自己修，我只在旁边看着。

### 4. 体感对比：GLM-5.1 vs GPT

| 维度 | GLM-5.1表现 |
|---|---|
| 执行力 | 直接执行，不废话，不做过场解释 |
| 调试能力 | 翻源码、查环境变量、对比配置差异，作者认为超预期（以为只有Claude/GPT-5才有） |
| 中文理解 | 国产模型优势，中英混杂场景（配置、路径、环境变量）意图更准 |
| 上下文压缩恢复 | Hermes自动context压缩后恢复好，不"失忆" |
| **并发** | **硬伤：3–4个Agent同时跑即触发429** |

### 5. 硬伤：并发rate limit

**核心问题**：多Agent并发是Agent框架的核心能力，GLM-5.1的rate limit直接限制团队规模效应。

表现：API返回429，Agent卡住等待。

**应对workaround**（非根本解决方案）：
- 错峰调度：cron任务之间错开10分钟
- 串行Pipeline：多Agent走流水线而不是并行
- 加retry：遇到429自动等待重试

**作者结论**：这些是workaround不是solution，希望智谱尽快放开并发限制。

### 6. 结论

**推荐场景矩阵**：

| 场景 | 推荐模型 |
|---|---|
| 单Agent / Agent串行 | GLM-5.1（可完全替代GPT） |
| 多Agent高频并发 | 等智谱放开限流，暂时fallback GPT |
| 日常任务 | GLM-5.1（成本砍半） |

**判断**：GLM-5.1是目前国产模型里跑Agent的第一梯队，国产模型与GPT的差距比大多数人预期的小。

## Key Takeaways

- **切换成本极低**：Hermes的模型配置中心化，改`config.yaml`两行 + Shell脚本同步，全部23个Agent 5分钟切换完毕
- **执行力是Agent的核心指标**：GLM-5.1"少废话"的特质对Agent场景价值远超对话场景——23个Agent都在啰嗦会把效率打折
- **GLM-5.1调试能力超预期**：能自主追根溯源（翻Telegram Bot API文档、查Hermes provider源码），不只是执行指令
- **Telegram多Bot协作在2026年4月才真正可行**：依赖Bot API 9.6（2026-04-03）的Managed Bots + Bot-to-Bot Communication Mode，之前Bot默认看不到其他Bot消息
- **并发rate limit是GLM-5.1 Agent场景的硬伤**：3–4个Agent并发即触发429，串行Pipeline是目前主要workaround
- **成本砍半**：日常任务全走GLM-5.1，高并发场景fallback GPT，整体成本直接减少50%
- **国产模型Agent差距被低估**：执行力、调试能力、中文理解均达到实用级别，差距主要在API层（并发限制）而非模型能力本身

## Insights

- **率先使用串行Pipeline而非并发**：面对rate limit约束，将多Agent工作流设计为依赖链（pipeline回调机制）是比并行更稳的架构选择，同时也更容易追踪状态
- **中文意图理解的实际价值在混合场景**：配置文件、路径、环境变量往往是中英混杂的，这正是国产模型中文优势落地的核心场景
- **Agent框架的模型无关性是关键设计**：Hermes能5分钟切换23个Agent的根本原因是模型配置中心化 + provider抽象，这是设计Agent框架时的重要参考
- **调试能力>执行能力**：作者最惊喜的不是GLM-5.1能执行任务，而是能自主debug（翻文档、查源码、对比差异）——这是从"工具"到"同事"的跨越

## Caveats

- 评测来自单一用户在特定场景（Hermes + Telegram）的一天实测，并非系统性benchmark
- Rate limit数值（3–4个并发触发429）未给出具体的API限额，可能随智谱政策变化
- 未覆盖复杂推理、代码质量评估等维度，聚焦Agent执行场景

## Sources

- https://mp.weixin.qq.com/s/iAu5VRfFHXA8oqXJQbElvw
- Hermes Agent框架：hermes101.pages.dev
- Telegram Bot API 9.6（2026-04-03发布）
- 智谱GLM-5.1 API：https://open.bigmodel.cn/api/coding/paas/v4
