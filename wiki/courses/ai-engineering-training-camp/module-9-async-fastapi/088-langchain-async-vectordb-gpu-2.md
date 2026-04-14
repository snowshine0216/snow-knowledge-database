---
tags: [langchain, langgraph, async, timeout, retry, faiss, gpu, cuda, vector-database, pytest, exponential-backoff]
source: https://u.geekbang.org/lesson/818?article=927505
---

# LangChain Async Advanced: Timeout, Retry, and GPU Vector Search

This lecture completes Module 9 by covering LangGraph async node timeout control, exponential backoff retry mechanisms, pytest for async testing, and Faiss GPU acceleration for vector similarity search — with automatic CPU fallback.

## Key Concepts
- **asyncio.wait_for + 装饰器**: 给LangGraph异步节点包裹超时装饰器，明确捕获`TimeoutError`
- **节点名称 vs 函数名**: LangGraph超时匹配的是函数名，不是节点注册名，需注意
- **指数退避（Exponential Backoff）**: 每次重试等待时间翻倍（base × 2^n），防止集中重试压垮服务
- **抖动（Jitter）**: 重试延迟在0.8~1.2倍范围内随机，防止惊群效应（thundering herd）
- **两层装饰器叠加**: 内层超时保护 + 外层重试；顺序决定每次重试是否有独立超时限制
- **Faiss CPU vs GPU**: 向量相似度计算是计算密集型，GPU提供数量级的速度优势（数万/秒 vs 数百/秒）
- **GPU自动降级**: 通过`nvidia-smi`或`faiss.get_num_gpus()`检测GPU，失败则回退CPU
- **断言（assert）**: 仅用于测试代码，不写入生产逻辑（可被Python优化模式关闭）
- **pytest-asyncio**: 异步测试框架，使用`@pytest.mark.asyncio`修饰测试函数

## Key Takeaways
- 异步（async/await）解决IO密集型并发；GPU解决计算密集型（向量检索）性能，两者互补
- 超时+重试是异步工作流的"标配"保险机制，建议封装为可复用装饰器工具
- 生产环境向量数据库（Faiss/Milvus）应部署在有GPU的节点上
- 大模型单元测试：用LLM生成pytest测试代码，包含断言和不同参数组合验证

## See Also
- [[087-langchain-async-vectordb-gpu-1]]
- [[010-langchain-core-components-detailed]]
