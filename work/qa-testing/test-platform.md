---
tags: [qa-testing, test-platform, vue, flask, jenkins, pytest, jacoco, ci-cd]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28%E6%B5%8B%E8%AF%95%E5%BC%80%E5%8F%91.one%7Ce7610782-a763-4548-9d63-3961b0f35d65%2F%E6%B5%8B%E8%AF%95%E5%B9%B3%E5%8F%B0%7C12462ed1-7948-d74d-bbab-adc4e0b3a818%2F%29
---

# 测试平台 (Test Platform)

## Tools & Components

- saucelabs — cloud test execution
- yapi — API management
- stf — multi-device management platform
- chrome plugin: wappalyzer — frontend tech analysis
- Flask template engine: jinja
- Semantic UI: https://semantic-ui.com/introduction/getting-started.html

## Framework Architecture

| Module | Features |
|---|---|
| user | login / register (jwt-extended) |
| test case | import / add / delete |
| task | add / jenkins integration |
| result | job result, analyze result |
| execution | log |

Platform covers: 测试框架，测试引擎，覆盖率，持续集成交付

## pytest Commands

```bash
sqlite3 project.db

pytest --co          # collect all test methods
pytest nodeid        # run specific node

history grep pip install
```

## Backend API (Flask + Jenkins)

```bash
# Import test cases
curl "http://127.0.0.1:5000/testcase?batch=1" \
  -X POST -d @testcases.json \
  -H 'Content-Type: application/json' -vv

# With git param (URL encoded)
curl -XPOST "http://127.0.0.1:5000/testcase?batch=1&git=$(echo $git | jq -sRr @uri)" \
  -d @testcases.json -H 'Content-Type: application/json' -vv

# Report test result back
curl -X POST $serverlink/task/$taskid \
  -d '{"name":"\"$BUILD_URL/allure\""}' \
  -H 'content-type: application/json'
```

## Frontend (Vue.js)

```bash
# Install Vue CLI
npm install -g @vue/cli

# Create project
vue create frontend
cd frontend
npm run serve

# Or with yarn
yarn serve

# Open in VSCode (install volar plugin)
code .

# Add plugins via UI
vue ui
```

Vue references:
- https://v2.vuejs.org/v2/guide/routing.html
- https://v2.vuejs.org/v2/examples/
- https://router.vuejs.org/zh/installation.html

### Vue Component API Pattern

```vue
<template>
  <div>api 架构优化 demo</div>
</template>
<script>
import moduleA from '../api/moduleA'

export default {
  created() {
    moduleA.getMethod().then((result) => {
      console.log(result)
    }).catch((err) => {
      console.log(err)
    })
  }
}
</script>
```

### api.js Module Aggregation Pattern

```js
import moduleA from './moduleA'
import moduleB from './moduleB'

const api = {
  moduleA,
  moduleB,
}

export default api
```

### axios Setup

```js
axios.get('urllink', { params: {} })

npm install webpack@4.46.0
npm install form-date --save
```

webpack polyfill fix: https://githucdb.com/Richienb/node-polyfill-webpack-plugin
(disable `transpileDependencies` in `vue.config.js`)

## References

- HTML basics: https://developer.mozilla.org/zh-CN/docs/Learn/Getting_started_with_the_web/HTML_basics
