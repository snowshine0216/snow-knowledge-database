---
tags: [ai-agents, glm, hermes, multi-agent, llm-comparison, telegram, rate-limiting]
source: https://mp.weixin.qq.com/s/iAu5VRfFHXA8oqXJQbElvw
---

# 我把Hermes里23个Agent全切到GLM-5.1：执行力比GPT强，但有个硬伤

**作者**: 孟健（孟健AI编程）
**发布时间**: 2026-04-13
**公众号**: 孟健AI编程

---

大家好，我是孟健。今天我的23个AI Agent全部从GPT切到了智谱GLM-5.1。一天下来：建了一个完整站点、搭通了多Agent协作流水线、调了15个session跑了1556条消息。没崩，没傻，比GPT少废话。但有一个坑，是真的痛。

## 01 为什么要换？

我跑的是Hermes Agent——一个开源的AI Agent框架，支持多平台（Telegram/Discord/CLI）、多模型切换、多Agent并行。我的团队有23个Agent，各有分工：写公众号的墨微、做增长调研的墨探、出PRD的墨策、搞SEO的墨引、写代码的墨界……之前全部跑在GPT上。

说实话，能力没问题，但两个事让我烦：

一是**贵**。 23个Agent同时在线，每天早晚报、定时任务、突发协作，Token消耗飞快。

二是**啰嗦**。 GPT系列有个毛病——它太"热心"了。你让它改个配置文件，它先给你解释一遍为什么要改，再解释怎么改，最后还要总结一下改了什么。23个Agent都这么干，效率直接打折。

所以当智谱放出GLM-5.1的编程API，我直接把所有Agent的默认模型切了过去。

## 02 切换过程：改一行配置

Hermes的模型切换极其简单。全局配置在`~/.hermes/config.yaml`，改两行：

```yaml
model:
  default: glm-5.1
  provider: zai
  base_url: https://open.bigmodel.cn/api/coding/paas/v4
```

然后用脚本把23个Agent的profile全部同步：

```bash
# 一键同步所有profile的config.yaml
for profile in ~/.hermes/profiles/*/; do
  cp ~/.hermes/config.yaml "${profile}config.yaml"
done
```

重启gateway，完事。从改配置到全部Agent上线，5分钟。

## 03 实测：GLM-5.1跑Agent到底行不行？

今天跑了一整天，核心干了三件事：

### 1）从零搭建Hermes Agent 101站点

我让小墨（我的主Agent）独立完成一个面向新手的入门指南站点。它自己研究了Hermes的GitHub仓库、Release Notes、官方文档，然后：

- 写了一个完整的单页应用（index.html，30KB纯手写）
- 包含Hero区、9大核心能力卡片、7天入门路径、OpenClaw迁移指南、FAQ
- 配好SEO（sitemap、robots.txt、llms.txt、Schema.org结构化数据）
- 一键部署到Cloudflare Pages

站点已上线：hermes101.pages.dev

全程我没写一行代码。 小墨用GLM-5.1跑了172条消息，自主完成。

### 2）调通多Agent串行流水线

这才是今天的重头戏。

先补个背景：Telegram里Bot默认是看不到其他Bot消息的。 这是平台一直以来的限制，导致多Bot协作几乎不可能做。直到Telegram在@BotFather里加了一个开关——Bot-to-Bot Communication Mode，允许Bot通过 @OtherBot 提及或者reply的方式互相通信。今年4月3日的Bot API 9.6又把Managed Bots（让Bot创建和管理其他Bot）整套agentic能力放了出来。也就是说，多Bot协作这个事，是这阵子才真正能跑通的。

我把23个Agent的Bot-to-Bot Mode全部打开，加到一个共享Telegram群里。验证通信链路：通了。

然后开始搭流水线。之前23个Agent在群里各干各的，缺一个"串起来"的机制。比如做站，应该是：调研→PRD→预算→合规→SEO策略→设计→开发→部署→验收→推广，每一步依赖上一步的产出。

今天搭了一套Pipeline回调机制：
- 小墨创建Pipeline（JSON状态文件），自动派发Step 1给墨探
- 墨探完成后 `@hermes_xiaomo_bot /pipeline-done hermes101-site step-1`
- 小墨收到回调，标记done，自动派发Step 2给墨策
- 依次推进，直到10步全部完成

这条流水线调通了。10个Agent串行协作，像工厂流水线一样自动推进。

### 3）排查Bot-to-Bot通信的坑

过程中踩了几个真实的坑，GLM-5.1展现了一个让我意外的能力——调试排错。

**坑1：Bot之间@不了**
一开始其他Agent收不到小墨的@提及。GLM-5.1自己去翻了Telegram Bot API文档，发现Telegram已经开放了Bot-to-Bot Communication，但需要用正确的mention entity格式。它自己写脚本用Telegram API发送带mention entity的消息，解决了。

**坑2：API Key找不到**
某个Agent的gateway报错Provider 'zai' is set but no API key found。GLM-5.1自己去查了Hermes的provider源码，发现zai provider的extra_env_vars会依次查找GLM_API_KEY、ZAI_API_KEY、Z_AI_API_KEY——而profile目录下的.env只有GLM_API_KEY。它把所有profile的key都补齐了。

**坑3：ALLOWED_USERS没加Bot ID**
Bot之间的消息被TELEGRAM_ALLOWED_USERS过滤了。GLM-5.1查出所有23个Bot的ID，一次性加到白名单里。

这三个坑，全程它自己排查、自己修，我只在旁边看着。

## 04 体感对比：GLM-5.1 vs GPT

用了一天，说几个真实体感：

**执行力强。** 给它一个任务，它直接干，不废话。改配置就改配置，查日志就查日志，不会先给你讲一段"好的，我来帮你分析一下这个问题"的过场。

**调试能力在线。** 遇到API报错、配置缺失、权限问题，它能自己追根溯源——翻源码、查环境变量、对比配置差异。这个能力我原本以为只有Claude和GPT-5级别才有。

**中文理解好。** 毕竟国产模型，中文指令的意图理解更准，特别是涉及配置、路径、环境变量这些中英混杂的场景。

**上下文压缩后恢复快。** Hermes有自动context压缩机制，GLM-5.1在压缩后恢复上下文的能力不错，不会像某些模型压缩后直接"失忆"。

但有一个硬伤：并发限制。

## 05 硬伤：并发rate limit

这是GLM-5.1做Agent最大的问题。当多个Agent同时跑（比如今天同时有3-4个Agent在处理各自的任务），会触发rate limit。表现是API返回429，Agent卡住等待。

对于单Agent对话场景完全没问题。但多Agent并发是Agent框架的核心能力，这个限制会直接影响团队效率。

目前的应对策略：
- 错峰调度：定时任务（cron）之间错开10分钟
- 串行Pipeline：多Agent走流水线而不是并行
- 加retry：遇到429自动等待重试

但这些是workaround，不是solution。希望智谱尽快放开并发限制。

## 06 结论：国产模型跑Agent，能用，而且不错

我的判断：GLM-5.1是目前国产模型里跑Agent的第一梯队。它的优势很明确——执行力强、少废话、中文好、调试能力在线。这些特质对一个需要自主操作终端、浏览器、文件系统的Agent来说，非常关键。

劣势也明确——并发限制。

- 如果你的场景是单Agent或者Agent串行，GLM-5.1完全可以替代GPT。
- 如果是多Agent高频并发，还需要等智谱放开限流。

我现在的策略：日常任务全走GLM-5.1，高并发场景fallback到GPT。 成本直接砍了一半。

国产模型在Agent这个赛道的差距，比大多数人想的要小。
