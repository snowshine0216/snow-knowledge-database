---
tags: [qa-testing, web-testing, selenium, pytest, allure, cypress, playwright, page-object]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28%E6%B5%8B%E8%AF%95%E5%BC%80%E5%8F%91.one%7Ce7610782-a763-4548-9d63-3961b0f35d65%2FwebTest%7C9bd28fa5-c2af-4342-9b66-45473649467b%2F%29
---

# Web Test Tips

## 点不到 (Can't Click)

1. **加载延迟** — add wait
2. **多个相同定位符的隐藏控件** — multiple hidden controls with same locator
3. **有时work有时no:**
   - JS未加载完成
   - 界面会更换 → 使用显示等待
   - 控件被遮挡
4. **浏览器差异** — 定位符、渲染方式、解析方式不一致

## Locators (定位符)

Console debug:
```js
// CSS
$('#search-button')
$('[title = "search"]')

// XPath
$x('//*[@id="search-button"]')
```

**XPath vs CSS:** XPath loads before CSS — use XPath when element not yet visible. CSS is faster when element is already rendered.

## Keyboard Input

```python
Send_keys('str', Keys.ENTER)
```

## Wait Strategies (等待)

| Type | Method | Note |
|---|---|---|
| 直接等待 | `time.sleep(3)` | Unreliable |
| 隐式等待 | `driver.implicitly_wait()` | Global, delays error reporting |
| 显示等待 | `WebDriverWait` | Preferred — wait for specific condition |

## Page Object Model

One method returns one page model.

## Browser Reuse (浏览器复用)

```bash
cd /Applications/Google\ Chrome.app/Contents/MacOS
./Google\ Chrome --remote-debugging-port=9222
```

Then connect via remote debugging to reuse existing session.

## Get Cookies

```python
driver.get_cookies()
```

## Allure Test Reports

```bash
# Install
pip install allure-pytest
# Add to ~/.zshrc (see: https://juejin.cn/post/6932813975033741320)

# Attach screenshot in test
allure.attach(
    body=self.driver.get_screenshot_as_png(),
    attachment_type=allure.attachment_type.PNG
)

# Run & serve
pytest --alluredir=allure $path
allure serve allure
```

## Frameworks

- **Selenium** — classic web automation
- **Cypress** — modern JS-based framework
- **Playwright** — cross-browser, async
