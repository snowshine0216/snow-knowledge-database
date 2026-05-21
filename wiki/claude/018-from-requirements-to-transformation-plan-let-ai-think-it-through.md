---
tags: [claude-code, legacy-project, transformation-plan, requirements-analysis, ai-engineering, seven-step-method]
source: https://time.geekbang.org/column/article/978730
---

# 从需求文档到改造方案：让 AI 把改造想透（七步法）

拿到需求文档后最常见的翻车路径是：扫一眼、心里大概有数、直接动手写代码。老项目不是新项目，"大概有数"意味着你以为只改一个 Controller，实际牵动整条链路（Service / DAO / 配置 / 异常处理 / 测试），前端工作量被整体忽略。本讲提供的七步法，让 AI 把"怎么改"一次性展开成可审核的方案文档，人只在最后拍板。

## Key Concepts

- **七步改造方案法**：Step 1 摸链路 → Step 2 列改造点 → Step 3 画流程图 → Step 4 说影响范围 → Step 5 说改造步骤 → Step 6 整合方案 → Step 7 人审核定稿。对所有项目基本通用，60-90 分钟输出一份方案文档。

- **前端节点显式约束**：AI 默认只看接口层，把改造缩成"加一个后端接口"。必须在 Step 1 提示词里写"不要漏前端节点（前端入口、调用、组件）"。案例验证：加了这句后，AI 扫出 `version-history.jsx` 和 `VersionCompareModal.jsx` 均为现有代码，不需新建，改造成本比预期低；不加就会全部漏掉。

- **AI 当调研员验证假设**：Step 4 影响范围分析的真实价值：AI 扫出 `getByPromptKeyAndVersion` 只有 `log.info`，没有 metrics 副作用。这和直觉中"复用 service 方法会双倍打点"的假设矛盾——AI 帮你确认"这个坑不存在"，避免你在不必要的地方增加复杂性。

- **决策点集中审核（第 7 节）**：Step 6 整合方案的灵魂是明确要求第 7 节"待审核关键决策点"。AI 默认平铺直叙，前 5 步散落着各种建议和多方案。集中在一处，案例中 D1-D4 四个决策一次性拍板（null 处理 / props 变更方式 / loading 状态 / latency 监控），不用翻整篇文档。

- **文档回灌闭环**：七步跑完后，用提示词让 AI 同步更新 `docs/api-list.md`（加新接口标"开发中"）、`docs/data-model.md`（加新 DTO）、`docs/requirements/`（补审核发现的边界）、`CLAUDE.md`（只写项目级约束，本次特殊处理留在 solution.md）。

- **方案与凑方案的边界**：Step 5 提示词约束"有分歧给 2 方案 + 推荐，没分歧直接给一个"。大多数改造点没有方案分歧（加一个 DTO 就是加一个 DTO），硬凑对比方案是噪音，不是调研质量。

## Key Takeaways

- 需求讲"做什么"，改造讲"怎么改"，两者之间必须有一份方案文档；跳过方案直接写代码，老项目改造的代价是返工
- 提示词里每次必须显式写"不要漏前端节点"，否则 AI 默认忽略所有前端工作量
- Step 4 的价值不只是"列出影响"，而是帮你验证你的假设是否成立——AI 扫真实代码，假设成立则纳入方案，假设错误则节省不必要的设计
- 第 7 节集中决策是方案文档审核效率的核心：所有待拍板项在一处，读完就能完成审核
- 文档回灌让 docs/ 在每次改造中被验证并丰富，下次类似改造的起点更高

## See Also

- [[001-from-one-line-requirement-to-spec-let-ai-break-it-down]]
- [[002-execute-transformation-part1-backend-development-and-testing]]
- [[003-build-safety-net-tests-characterization-test-to-lock-behavior]]
- [[005-legacy-project-claude-md-from-five-assets-to-project-knowledge]]
