---
tags: [calculus, math, 3blue1brown, derivative, higher-order-derivatives, concavity]
source: https://www.3blue1brown.com/lessons/higher-order-derivatives
---

# Chapter 10: Higher-Order Derivatives

Source:
- https://www.3blue1brown.com/lessons/higher-order-derivatives

Essence:
- First derivative measures rate of change; second derivative measures change of that rate; and so on.
- Higher derivatives reveal local shape: monotonicity, concavity, curvature-like behavior, and dynamics.
- In physics language: position, velocity, acceleration, jerk, ...
- ## 2. 为什么叫 "Jerk" (猛然一动/颠簸)？

“Jerk” 这个词在英文里有“猛拉、颠簸”的意思。

- **如果 Jerk = 0**：加速度是恒定的。比如你匀速踩着油门不放，你会感到一个**持续且稳定**的推背感。
    
- **如果 Jerk $\neq$ 0**：加速度在变。比如你踩油门时脚在抖，推背感忽强忽弱。这种**推力的不稳定性**会让乘客感到“颠簸”或“晃动”，这就是为什么它被称为 Jerk。
- ![[file-20260329153045636.png|331]]
- ## 3. 现实中的例子：电梯与过山车

- **优秀的电梯**：会有意设计减小 Jerk。电梯启动和停止时，如果加速度瞬间从 0 变到最大，你会感到内脏被“甩”了一下。通过控制三阶导数，让加速度平滑增长，乘客就会感觉非常舒适。
    
- **两级火箭（文中的例子）**：[Grant 在文中提到](https://www.3blue1brown.com/lessons/higher-order-derivatives#comprehensive-question)，当第一级火箭燃料耗尽、第二级尚未点火时，加速度会发生突变。在这个转折点，Jerk（加加速度）会非常明显，代表了力场强度的剧烈改变。
- ## 总结

文中的那句话：

> “如果 Jerk 不为零，意味着加速度本身的强度正在改变。”

这意味着你受到的**力**（根据 $F=ma$）正在发生变化。三阶导数衡量的是这种“力”改变得有多快。

**有趣的小知识：**

在物理学里，三阶之后的导数名字更有趣。四阶、五阶、六阶导数分别被称为 **Snap (或 Jounce)、Crackle 和 Pop**（名字来源于一种早餐麦片的广告语：噼啪、嘎吱、爆裂）。

Core equations:
$$
f''(x)=\frac{d}{dx}f'(x),\qquad f^{(n)}(x)=\frac{d^n f}{dx^n}
$$

$$
\text{if } s(t)\text{ is position: } v=s',\ a=s'',\ j=s'''
$$

$$
f''(x)>0 \Rightarrow \text{locally concave up},\quad f''(x)<0 \Rightarrow \text{locally concave down}
$$

