---
tags: [ai-engineering, capstone-project, customer-service, product-development, llm-deployment]
source: https://u.geekbang.org/lesson/818?article=930870
---

# Capstone Project Background: AI Customer Service System

This lecture introduces the capstone project for the AI engineering course: an intelligent customer service system powered by LLMs, embedded in a webpage chat widget. Beyond technical implementation, it covers the full product lifecycle — requirements, prototype, tech selection, and deployment.

## Key Concepts

- **AI产品 vs 传统软件开发**: 传统软件以稳定性为前提、需求驱动代码；大模型产品反过来——需求必须先适配模型能力，模型干不了的才回退到传统开发
- **纵向优先策略**: 大模型落地不要先做平台，先把单条完整业务流跑通，评估难度后再扩展
- **迭代速度风险**: 大模型技术迭代极快，项目开发中途可能出现更好的解决方案，导致交付延期；通过纵向优先和快速原型降低此风险
- **类比场景方法**: 对不熟悉的垂直领域（法律、医疗），用双方都熟悉的类比场景（如用"狼人杀"类比"虚拟法庭"）快速原型验证，再收敛差异
- **智能客服系统定位**: AI适合处理重复率高、重要性低的问题；重要问题（如紧急挂失、费用纠纷）应优先转人工

## Key Takeaways

- 大模型产品开发中，要预先拆分：哪些任务适合大模型，哪些需要传统代码
- 不要先搭平台后做功能，先跑通一个完整端到端的业务流，再做平台化
- 大模型迭代快，贸然铺开大平台会导致无法收尾；小步快跑降低风险
- 使用Dify/Coze做快速原型，让客户快速对齐效果预期，避免中途返工
- 类比场景是与不熟悉领域客户沟通的有效手段

## See Also

- [[090-project-requirements-prototype-1]]
- [[091-project-requirements-prototype-2]]
- [[092-core-interaction-capabilities-1]]
