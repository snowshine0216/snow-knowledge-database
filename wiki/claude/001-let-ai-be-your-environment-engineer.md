---
tags: [claude-code, legacy-project, environment-setup, ai-engineering, prompt-engineering]
source: https://time.geekbang.org/column/article/977524
---

# 让 AI 当你的环境工程师

老项目接手时，搭环境往往是最折磨人的一步：`mvn install` 一跑，先报缺 Nacos、再报 MySQL 版本不对、再报端口冲突，一天就这么过去了。本讲提出四步法，让 AI 把这套折磨压到"半小时跑完"。

## Key Concepts

- **四步环境搭建法**：依赖盘点（`env-checklist.md`）→ 本地安装 + 启停管理脚本 → 编译启动 → 接口冒烟（`smoke-test-result.md`）。每步都有对应产出文件，过程沉淀成长期资产。

- **自主修复原则**：AI 执行安装脚本时，遇到任何失败先自行看报错 → 判断原因 → 自修 → 重试，不要每个错误都打断用户。**同一错误连续修 3 次还不行，才停下汇报**——"3 次兜底"防止 AI 在同一问题上死循环几小时。

- **install-log.md 比脚本更值钱**：踩坑日志记录关键决策（例："为何用 `brew install mysql@8` 而非 `brew install mysql`，因为 brew 默认装了 9"）。新人上手、下次重装都靠这份日志，而非脚本本身。

- **deps-start/stop/status 三件套**：将所有本地中间件的生命周期统一到三个脚本，每天上班 `./deps-start.sh`，下班 `./deps-stop.sh`，比 `docker-compose up` 更轻量。

- **env-bootstrap SKILL**：把整套四步流程固化成 `.claude/skills/env-bootstrap/SKILL.md`，任何新项目或重置环境一键触发，不需要重复思考步骤。

- **本地装 vs Docker**：作者主推本地安装——在 Mac M 系列芯片上 Docker 有 ARM 兼容问题，本地装性能更好；但 `docker-compose.dev.yml` 作为 Docker 备选方案顺手生成，后续 CI 集成时会用到。

## Key Takeaways

- README 覆盖率不到一半——外部依赖散落在 `application-prod.yml`、starter 间接依赖里，必须让 AI 综合 `external-deps.svg` + `application*.yml` + `pom.xml` 才能列全清单。
- "3 次兜底"约束不能省略：不带这条，AI 会在同一错误上无限循环（改配置→报新错→再改→再报），几小时无法停止。
- 四步跑完后沉淀两份长期资产：`setup-guide.md`（团队新人文档）+ `env-bootstrap` SKILL（个人/团队复用），这些才是本讲最高价值产出。

## See Also

- [[005-legacy-project-claude-md-from-five-assets-to-project-knowledge]]
- [[006-how-to-mine-legacy-project-skills-reusable-workflows]]
- [[claude-code-best-practice]]

## Related sources

- **[摸清现有测试：能跑通吗？覆盖度怎样？]**: 本讲是环境搭通后的紧接下一步——摸底测试现状。提出"四步摸底法"（摸核心链路 → 摸现有测试 → 跑一遍看实际状态 → 算出缺口清单），产出 `critical-paths.md`、`test-status.md`、`test-gaps.md` 三份资产；核心约束是数量上限 + 关联核心路径 + 优先级分层，防止 AI 大而全。See also: [[002-understand-existing-tests-runnable-and-coverage]]
