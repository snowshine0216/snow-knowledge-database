# Chapter 7: Limits, L'Hôpital, and Epsilon-Delta

Source:
- https://www.3blue1brown.com/lessons/limits
- https://www.3blue1brown.com/lessons/l-hopitals-rule
- https://www.3blue1brown.com/lessons/epsilon-delta

Essence:
- Limits formalize "getting arbitrarily close."
- Epsilon-delta definitions remove ambiguity: every output tolerance \(\varepsilon\) is matched by an input tolerance \(\delta\).
- L'Hôpital's rule handles indeterminate forms by comparing derivative behavior (under suitable conditions).

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

