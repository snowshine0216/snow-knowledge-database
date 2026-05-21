---
tags: [claude-code, legacy-project, frontend-development, postmortem, ai-limitations, ai-engineering]
source: https://time.geekbang.org/column/article/979519
---

# 执行改造（下）：前端对接 + 功能已存在的翻车复盘

本讲分两部分：前半段是前端改造的四步节奏，后半段是整个 17-20 讲最有价值的一段——改造跑完才发现功能早已存在，整套流程本可以在 30 秒内终止。复盘揭示了一个 AI 协作的结构性盲区：AI 能扫所有代码，但无法判断"某个组件正在被用户使用中"。

## Key Concepts

- **前端改造四步节奏**：（1）起服务看现状——`deps-start.sh` + AI 帮调起后端前端；（2）让 AI 定位前端改造入口（菜单路径 + UI 位置）；（3）让 AI 按方案 P07-P10 改完前端；（4）预览效果——亲眼看勾选两版本 → 点按钮 → loading → modal 弹出 → 行级 diff 渲染。前端无自动化兜底，必须人眼验证。

- **AI 业务功能理解局限**：AI 识别了 `VersionCompareModal.jsx` 存在，但默认解读为"未完成骨架"或"配套接口的组件"，不会主动说"这个组件正在被用户每天使用中"。17 讲扫 `api-list.md` 得出"没有 diff 接口"是正确推理，但"没有后端接口 ≠ 功能不存在"——前端可以自己实现 diff（并行调两次 `getPromptVersion` + 浏览器内字符串比较）。AI 的代码扫描覆盖率是 100%，但业务事实理解是 0%。

- **改造前功能存在性验证（30 秒兜底）**：改造任务开始前，打开生产/测试环境，按照需求路径点几下，确认功能不存在。成本极低，但 AI 替代不了。案例代价：没做这一步，结果跑完 17-20 讲四讲、约 3-4 小时，实现了一个已有的功能，且留下两个功能相同的对比按钮。

- **人是最后的兜底员（新原则）**："AI 当调研员、人当决策员"的第三条延伸：人不只是决策员，还是兜底员。兜底员的具体工作：这个功能用户在不在用（看 PV）、接口有没有客户依赖（看监控调用方）、bug 是不是真的影响业务（问客服）。这些"看一眼就知道"的事，AI 做不到。

- **CLAUDE.md 护栏化**：教训必须写进 CLAUDE.md 才能成为护栏，写进记忆会忘、写进 README 没人看：
  ```
  ## 老项目改造前必须做的兜底动作
  任何改造任务开始之前，先打开生产/测试环境点几下，
  确认要做的功能不存在。AI 扫代码无法发现"已存在的功能"。
  ```
  下次同类改造 AI 会主动提醒，这次的坑成为永久护栏。

## Key Takeaways

- 前端改造唯一可靠的验证是亲眼看效果，不存在等价的自动化兜底
- AI 扫代码能力 ≈ 100%，业务功能存在性判断能力 ≈ 0%：`api-list.md` 无 diff 接口不等于功能不存在
- 改造前"打开浏览器点几下"是成本最低、价值最高的检查，30 秒，AI 无法替代
- 踩坑教训的正确归宿是 CLAUDE.md（每次会话自动加载）而非 HANDOFF.md / README（不会自动触发）
- "人是最后的兜底员"是 AI 协作三层分工的第三层：AI 调研 → 人决策 → 人兜底

## See Also

- [[018-from-requirements-to-transformation-plan-let-ai-think-it-through]]
- [[002-execute-transformation-part1-backend-development-and-testing]]
- [[003-build-safety-net-tests-characterization-test-to-lock-behavior]]
- [[005-legacy-project-claude-md-from-five-assets-to-project-knowledge]]
