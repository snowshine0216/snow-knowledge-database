---
tags: [ai-engineering, customer-service, quick-commands, session-history, redis, langgraph, greeting, ux]
source: https://u.geekbang.org/lesson/818?article=930873
---

# Core and Interaction Capabilities Part 1

This lecture covers the V2 capability enhancements for the AI customer service system beyond the MVP: greeting API, quick slash commands, session history with Redis TTL, LangGraph Thread ID for multi-user isolation, and the distinction between true delete vs shadow (compliance) delete for conversation history.

## Key Concepts

- **Greeting接口**: 与chat接口分离，返回欢迎语和快捷指令列表；支持按课程ID返回不同欢迎语，引导用户明确AI能力范围
- **快捷指令（/help /history /reset）**: 以斜线开头的命令；实现时用strip()清除前后空白，统一转小写处理大小写锁定，用Python字典映射替代多个if-else
- **字典映射替代if-else**: Python中大量分支用字典{命令: 处理函数}映射，调用时`handlers.get(cmd)(args)`执行，比if-else更简洁可维护
- **Redis Session历史**: 用session_id作为key，TTL=1800秒自动过期，存最近N条对话；session_id由前端生成，通过X-Request-Id请求头传入
- **LangGraph Thread ID**: 使用session_id作为thread_id传入LangGraph config，模拟多用户隔离（非真正多线程，是参数隔离）
- **CheckPoint降级策略**: 优先SQLite CheckPoint，失败时降级到内存，业务无感知但后台有日志
- **真删除 vs 影子删除**: 合规场景下（IM保留30-90天规定），删除只是删Redis中的实时会话key，数据库中的shadow副本仍保留

## Key Takeaways

- 好的开场白和快捷指令能显著提升用户体验，减少用户困惑（类比代码编写：打开编辑器是最难的第一步）
- Python无switch语句，多分支用字典映射（key=条件值, value=函数对象）而非大量if-else
- session_id不开真正多线程，是通过参数区分不同用户的会话，LangGraph Thread ID是同样机制
- 生产环境CheckPoint推荐PostgreSQL/MySQL，不用SQLite（性能差）
- IM类系统的"删除"往往是假删除，合规归档数据会保留；大模型聊天记录可能被用于训练，注意信息安全
- AI工具辅助注释：将整个项目加入上下文后让AI解释代码，比直接请求注释更有意义

## See Also

- [[091-project-requirements-prototype-2]]
- [[090-project-requirements-prototype-1]]
- [[langgraph-fundamentals]]
- [[langgraph-advanced-patterns]]
