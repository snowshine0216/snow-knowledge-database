---
tags: [calculus, math, 3blue1brown, limits, lhopital, epsilon-delta]
source: https://www.3blue1brown.com/lessons/limits
---

# Chapter 7: Limits, L'Hôpital, and Epsilon-Delta

Source:
- https://www.3blue1brown.com/lessons/limits
- https://www.3blue1brown.com/lessons/l-hopitals-rule
- https://www.3blue1brown.com/lessons/epsilon-delta

Essence:
- Limits formalize "getting arbitrarily close."
- Epsilon-delta definitions remove ambiguity: every output tolerance \(\varepsilon\) is matched by an input tolerance \(\delta\).
- L'Hôpital's rule handles indeterminate forms by comparing derivative behavior (under suitable conditions).
- - **普通定义的局限：** 我们不能直接代入 $0$。

- **$\varepsilon-\delta$ 的威力：** 它不需要函数在 $0$ 那点有定义。它只要求在 $0$ **附近**，函数表现得足够“听话”。
    

## 总结

- **挑战：** 任意给一个允许误差 $\varepsilon > 0$（输出要多靠近 $12$）。
    
- **回应：** 存在一个控制范围 $\delta > 0$（只要输入离 $0$ 足够近）。
    
- **结果：** 只要 $|h - 0| < \delta$（且 $h \neq 0$），那么 $|f(h) - 12| < \varepsilon$。
- 洛必达法则本质上是说：既然分子分母在这一点都是 $0$，那我们就别看它们的大小了（因为都是 $0$），改看它们**跑离 $0$ 的速度**（即导数）。谁跑得快，谁就决定了最终比值的大小。

Core equations:
$$
\lim_{x\to a}f(x)=L
$$

$$
\forall \varepsilon>0,\ \exists \delta>0:\ 0<|x-a|<\delta \Rightarrow |f(x)-L|<\varepsilon
$$

$$
\lim_{x\to a}\frac{f(x)}{g(x)}=\lim_{x\to a}\frac{f'(x)}{g'(x)} \quad \text{for } \frac{0}{0}\text{ or }\frac{\infty}{\infty}\text{ forms (when valid)}
$$

