---
tags: [claude-code, legacy-project, environment-setup, ai-engineering, prompt-engineering]
source: https://time.geekbang.org/column/article/977524
wiki: wiki/claude/001-let-ai-be-your-environment-engineer.md
---

## Pre-test

*阅读前尝试回答以下问题。答错完全正常——预测试能让大脑在接触正确答案时编码得更深。*

1. 接手一个老项目，搭环境时最常见的坑是什么？为什么只看 README 往往不够？
2. 如果让 AI 帮你自动安装中间件，如何防止 AI 陷入"改一个错、再报一个错"的无限死循环？
3. 为什么作者主推本地安装而非 Docker 方案？

---

## Chapter Metadata
- Course: Claude Code 企业级老项目改造实战
- Chapter: 013 — 13｜让 AI 当你的环境工程师：依赖、编译、启动、冒烟一把过
- Author: Robert
- Article ID: 977524

## Cornell Notes

### Cue Column (Questions)
- 为什么环境搭建是老项目改造最大的坑？
- "自主修复原则"是什么？3次兜底怎么用？
- 依赖盘点提示词产出什么？Review重点是什么？
- 为什么要生成 install-log.md？它比脚本本身更值钱在哪？
- deps-start/stop/status 三个脚本解决什么问题？
- 如何用"接口冒烟"确认项目真的活了？
- 四步跑完后如何把过程沉淀成长期资产？

### Notes Column

**环境搭建是老项目最大的坑**

clone 下来 `mvn install` 一跑，先报缺 Nacos、再报 MySQL 版本不对、再报端口冲突、再报内部服务连不上——每项都要 Google 半天。更难的是 README 只写了显眼的依赖（Nacos），OTel Collector 藏在 `application-prod.yml`，Redis 是某个 starter 间接拉的。照着 README 跑能跑通的概率不到一半。

**四步法：一把搞定环境**

**Step 1 — 依赖盘点**

提示词：综合看 `docs/external-deps.svg`、`application*.yml`、`pom.xml`、README，列出完整外部依赖清单（名字、版本、默认端口、连接信息、初始化要求），保存到 `docs/env-checklist.md`。

Review 重点：
- 和 `external-deps.svg` 对得上（08 讲已画过）
- 版本号有依据——来自 `pom.xml` 或 README，不能 AI 瞎写
- 初始化要求要细（Nacos 建命名空间、MySQL 跑初始化 SQL）

**Step 2A — 本地安装方案（主推）**

提示词让 AI 读 `env-checklist.md` 生成 `scripts/install-deps.sh` 并直接执行。关键设计：

*自主修复原则*：任何失败先看报错 → 自判原因 → 自修 → 重试，不要每个错误都问我。**同一错误连续修 3 次还不行，停下来汇报**。

"3 次兜底"是从实际跑出来的经验——不带这条会出现 AI 死循环几小时停不下来。

产出还有 `scripts/install-log.md`（踩坑日志）：记录每个中间件用了什么命令、遇到什么问题、怎么修的。下次重装、团队新人入职时，日志比脚本本身更值钱（例："用 `brew install mysql@8` 而非 `brew install mysql`，因为 brew 默认装了 9"）。

**Step 2B — 依赖启停管理脚本**

中间件装好后，每次电脑重启还要手动一个个起。让 AI 生成：

- `scripts/deps-start.sh`：一键启动所有中间件，启动后等服务就绪才返回
- `scripts/deps-stop.sh`：一键停止
- `scripts/deps-status.sh`：查看每个中间件运行状态 + 端口监听

Review 重点：启动顺序对（Nacos → OTel Collector → MySQL → 应用）；status 输出要清晰，一眼看出哪个挂了。

**Step 2C — Docker 方案（备选）**

一句提示词顺手生成 `docker-compose.dev.yml`，给偏好 Docker 的同学用。作者主推本地安装：本地装更轻、无断电问题、在 Mac M 系列芯片下比 Docker 性能好（ARM 兼容问题）。

**Step 3 — 编译启动**

确认中间件起来（`./scripts/deps-status.sh`）后，让 AI 跑 `mvn clean package` + 启动应用，同样遵循自主修复原则（3 次同错才停），记录 `docs/startup-log.md`。

常见错误：Java 版本不对、Maven 仓库连不上、端口被占、配置文件缺失、Nacos 配置没推。这些 AI 都有处理经验，给它自主修复授权多数能搞定。

**Step 4 — 接口冒烟**

读 `docs/api-list.md`，挑 5 个最核心接口（覆盖登录、Prompt、Dataset、Evaluator、Trace 模块）用 curl 跑一遍，返回 200 算通过，记录 `docs/smoke-test-result.md`。跑完这步，项目算"真的活了"。

**把过程沉淀成长期资产**

四步完成后，两个衍生产出：

1. **setup-guide.md**（给团队）：让 AI 基于 `install-log.md` + `startup-log.md` 整理给新人的上手指南，包含前置条件、装中间件步骤、常见踩坑。

2. **env-bootstrap SKILL**（给自己）：把整套"依赖盘点→装中间件→启动→冒烟"流程做成 SKILL（`.claude/skills/env-bootstrap/SKILL.md`），触发场景：新接手项目、重置环境、定期验证健康。跑完第 13 讲，积累的 SKILL 从 1 个（docs-auto-sync）变成 2 个。

### Summary

本讲的核心主张：让 AI 当环境工程师，用四步法（依赖盘点→本地安装+启停脚本→编译启动→接口冒烟）把"半天到一天的折磨"压到"半小时跑完"。两个关键约束贯穿全程：①自主修复原则（AI 自己 debug 自己改），②3 次兜底（防止 AI 死循环）。产出不只是让项目跑起来，更要把过程沉淀成 setup-guide 和 env-bootstrap SKILL，成为团队和自己的长期资产。

## Key Takeaways

- **README 覆盖率不到一半**：外部依赖散落在 `application-prod.yml`、starter 间接依赖里，必须让 AI 综合多份文件（`external-deps.svg` + `application*.yml` + `pom.xml`）才能列全清单。
- **自主修复原则 + 3次兜底**：不带"3 次同错才停"约束，AI 会陷入几小时的死循环；带了这条，大多数环境问题 AI 能自主搞定，人只需最终审查。
- **install-log.md 比脚本更值钱**：踩坑日志记录了关键决策（如为何用 `mysql@8` 而非 `mysql`），是团队知识沉淀的载体，比可执行脚本的复用价值更高。
- **启停脚本是每日必需品**：`deps-start.sh` / `deps-stop.sh` / `deps-status.sh` 三件套让开发者告别"每天上班手动起一堆服务"，比 Docker compose 更轻量。
- **主推本地装而非 Docker**：在 Mac M 系列芯片上，Docker 有 ARM 兼容问题，本地装中间件性能更好、断电处理更可控。
- **env-bootstrap SKILL 是最高复用**：把整套流程固化成 SKILL，任何新项目或重置环境都能一键触发，不需要重复思考步骤。

## Knowledge Graph Seeds（知识图谱种子）

### 1. 本讲核心节点
- [[env-bootstrap]]：将"依赖盘点→安装→启停→冒烟"四步法封装成可复用 SKILL，存于 `.claude/skills/env-bootstrap/SKILL.md`
- [[自主修复原则]]：AI 执行脚本时先看报错→自判原因→自修→重试，同一错误连续 3 次失败才停下汇报
- [[env-checklist]]：依赖盘点产出文件，综合 `external-deps.svg`、`application*.yml`、`pom.xml` 生成，含版本、端口、初始化要求
- [[deps-start-stop-scripts]]：`deps-start.sh` / `deps-stop.sh` / `deps-status.sh` 三件套，统一管理本地开发中间件的生命周期
- [[install-log]]：安装踩坑日志，记录关键决策（如版本选择原因），比脚本本身更具团队复用价值
- [[smoke-test]]：接口冒烟验证，从 `api-list.md` 挑 5 个核心接口用 curl 跑通，确认项目真正活着
- [[setup-guide]]：基于安装日志整理的新人上手文档，由 AI 自动合并 `install-log.md` 和 `startup-log.md` 生成

### 2. 课程内导航链接
- [[002-what-changed-and-unchanged-when-claude-code-enters|第 02 讲 Claude Code 进来后]]：确立了"AI 替人做哪些步骤"的基准，本讲在环境搭建场景具体落地
- [[004-ai-programming-tools-landscape-what-when-to-use|第 04 讲 AI 编程工具全景]]：介绍了"够用就停"心法，env-bootstrap 的四步边界即基于这一原则
- [[003-birds-eye-view-draw-architecture-module-dependency-diagrams|第 08 讲 俯视项目全景]]：画出了 `external-deps.svg`，本讲 Step 1 依赖盘点直接复用这份图
- [[004-interfaces-and-data-models-ai-generate-api-list-and-schema|第 09 讲 接口和数据模型]]：生成了 `api-list.md`，本讲 Step 4 冒烟测试从中挑 5 个核心接口
- [[002-let-ai-understand-existing-tests|第 14 讲 摸清现有测试]]：环境跑通后，下一步是摸清测试现状
- [[003-build-safety-net-tests-characterization-test-to-lock-behavior|第 15 讲 补出兜底测试]]：补 Characterization Test 锁住现有行为
- [[004-hands-on-complete-pre-transformation-guardrails-workflow|第 16 讲 实操课]]：把本讲所有提示词串起来完整跑一遍

### 3. 课程外与通用概念关联
- [[prompt-engineering]]：本讲所有提示词都体现了"约束驱动"设计——数量上限、失败兜底、产出格式，都是提示词工程关键实践
- [[characterization-test]]：15 讲的测试方法，与本讲 env-bootstrap 一起构成"改造前护栏"的完整闭环

### 4. 推荐关系边
- [[env-bootstrap]] → implements → [[自主修复原则]]
- [[自主修复原则]] → prevents → [[AI死循环]]
- [[install-log]] → extends → [[env-checklist]]
- [[env-bootstrap]] → enables → [[setup-guide]]
- [[env-checklist]] → centers-on → [[external-deps.svg]]
- [[deps-start-stop-scripts]] → replaces → [[手动逐个启动中间件]]

### 5. 后续值得沉淀成卡片的主题
- [[自主修复原则]]
- [[env-bootstrap]]
- [[install-log]]
- [[deps-start-stop-scripts]]

## Notes For Review
- "3 次兜底"的数字是经验值，实际项目中可根据错误类型调整（网络类可多试几次，配置类发现是同一错立即停）
- Docker 方案在 CI 环境中仍是主流，`docker-compose.dev.yml` 的备选方案在后续 CI 集成（15 讲）中会用到

---

## Post-test

*关闭文件，凭记忆写出或大声说出你的答案，再对照答案指南（费曼检验：无法简单解释，说明仍有理解空白）。*

1. 依赖盘点提示词要让 AI 综合哪几份文件？产出什么？Review 时要重点检查哪三件事？
2. "自主修复原则"的核心约束是什么？为什么"3 次兜底"这条规则不能省略？
3. 四步法跑完后要沉淀哪两份长期资产？各自的定位是什么？

> [!example]- 💡 答案指南（做完再看）
>
> **题目 1 - 引导答案思路：**
> 综合 `docs/external-deps.svg`、`application*.yml`、`pom.xml`、README 四份文件，产出 `docs/env-checklist.md`。Review 三重点：①清单与 `external-deps.svg` 对得上（无出入）；②每个版本号有来源依据（pom.xml 或 README，不能 AI 猜）；③初始化要求要细（Nacos 建命名空间、MySQL 跑初始化 SQL 都要列出）。
>
> ---
>
> **题目 2 - 引导答案思路：**
> 核心约束：AI 遇到任何失败，先自行看报错→判断原因→自修→重试，不要每个错误都打断问用户。"3 次兜底"的作用是防死循环——不带这条，AI 会在同一个错误上无限循环（改一个配置→报新错→再改→再报新错），几小时无法停止。3 次同错说明问题超出 AI 判断能力，必须人工介入。
>
> ---
>
> **题目 3 - 引导答案思路：**
> ①**setup-guide.md**（团队资产）：让 AI 基于 `install-log.md` + `startup-log.md` 整理成新人上手文档，包含前置条件、装中间件步骤、常见踩坑。②**env-bootstrap SKILL**（个人/团队复用资产）：把整套四步流程固化成 `.claude/skills/env-bootstrap/SKILL.md`，触发场景包括新接手项目、重置环境、定期验证健康——让任何老项目都能一键重跑这套流程。
