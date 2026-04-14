---
tags: [python, async, concurrency, multiprocessing, coroutine, performance-profiling, cprofile, pyspy]
source: https://u.geekbang.org/lesson/818?article=927501
---

# Python Parallel Mechanisms Comparison Part 2

This lecture completes the comparison of Python parallel mechanisms — coroutines, multithreading, and multiprocessing — and introduces two production-grade profiling tools (cProfile and py-spy) for diagnosing performance bottlenecks.

## Key Concepts
- **GIL（全局解释器锁）**: CPython中多线程不是真正并行，CPU密集型任务应使用多进程
- **协程（coroutine）**: 同一线程内通过事件循环切换任务，最适合高并发IO密集型场景
- **cProfile**: 侵入式深度分析工具，~10%性能损耗，仅用于开发环境；识别热点函数（累计耗时最长的函数）
- **py-spy**: 无侵入式生产级监控，可附加到运行中的进程，支持容器环境
- **火焰图**: py-spy生成，颜色越深/越靠上表示CPU开销越大
- **混合架构**: 进程池（CPU密集）+ 协程（IO密集）组合处理真实业务场景
- **工厂模式**: 通过任务类型标注路由到不同处理器（IOProcessor/CPUProcessor）
- **快速报错原则**: Python推崇早期暴露错误而非静默处理

## Key Takeaways
- 选择并行方案前先用工具测量，而非凭经验猜测
- 优化时优先处理耗时最长的函数（飞行时间 > 打车时间）
- 大模型应用慢的两大原因：思考过程无反馈、工具调用时用户无感知
- 500ms是用户有感知的阈值，5s是明显感受到慢的阈值

## See Also
- [[083-parallel-mechanisms-1]]
- [[085-fastapi-deep-integration-1]]
