---
tags: [claude-code, legacy-project, testing, characterization-test, ci-cd, ai-engineering, tdd]
source: https://time.geekbang.org/column/article/978185
---

# 补出兜底测试：Characterization Test + CI 护栏

老项目测试匮乏是常态——不是工程师不想补，是成本太高。AI 把这件事的成本降到分钟级，但补测试仍需严格的节奏控制，否则 AI 大而全反噬。本讲回答三个问题：该不该补、要补哪些、怎么补。

## Key Concepts

- **Characterization Test（锁行为测试）**：来自 Michael Feathers《Working Effectively with Legacy Code》。核心反直觉：不测"应该做什么"，而是先跑代码记录实际行为，再把这个行为转成断言。老项目"应该"经常无从判断，但"实际"是确定的——锁住"现在"，改造后行为没变就放心。提示词关键句：`凭"实际是什么"写断言，不凭"应该是什么"。`

- **AI 断言偏差**：AI 读完代码会用业务直觉按"应该"补断言。老项目的代码与"应该"常常不一致（历史包袱/禁区），这些断言跑起来就失败，让人误判代码有 bug，实际是测试写错了。这是 Characterization Test 最常见翻车点。

- **补测试优先级（从高到低）**：① 改造路径上的 Characterization Test → ② 核心数据写入的集成测试（HTTP→Service→DB，一条顶十个单元测试）→ ③ 业务逻辑复杂的单元测试 → ④ 简单 CRUD（可不补，AI 改错概率本来就低）。

- **每批 1-3 个，跑通才下一批**：一次性补 20 个，失败的无法判断对错，整批不可信。分批节奏让每批都成为可信资产。第 2 批起参考第 1 批风格保持一致。

- **CI 是长期复利**：花 30 分钟让 AI 写好 CI workflow，一年自动运行上千次——AI 写标准化 CI 配置 30 秒搞定人工半天的工作。强制护栏比依赖团队自觉可靠十倍（deadline 压力下自觉是第一个被牺牲的）。

## Key Takeaways

- 该不该补的判断核心：即将改造的链路目前无测试、改完没法验证 → 必须补；改 log 输出/文案 → 可以不补。
- Characterization Test 的灵魂：先跑代码记录 actual，再把 actual 转成 assertion——绝不凭 AI 业务直觉猜 expected。
- CI 配置三要素：JDK 版本对齐 `pom.xml`、中间件用 `docker-compose.dev.yml` 起、Maven 依赖缓存加速。

## See Also

- [[001-let-ai-be-your-environment-engineer]]
- [[002-understand-existing-tests-runnable-and-coverage]]
- [[005-industry-landscape-2026-ai-legacy-code-academic-engineering]]

## Related sources

- **[实操课：给一个老项目建立完整改造前护栏的全流程演示]**: 把第 13-15 讲的所有提示词串成一个"一键全跑"提示词，在 Spring AI Alibaba Admin 上实操演示四个场景（环境搭建→测试摸底→补测试→CI集成）。重点补充了一键提示词的约束设计原则（每批1-3个、3次兜底、凭实际写断言、summary汇总不确定点），以及第三部分完成后的完整资产清单（14份docs/+5份scripts/+CI workflow+2个SKILL）。See also: [[004-hands-on-complete-pre-transformation-guardrails-workflow]]
