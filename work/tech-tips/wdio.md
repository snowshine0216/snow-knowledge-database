---
tags: [tech-tips, wdio, webdriverio, testing, microstrategy, regression]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Useful%20Tooltip.one%7C64d3c646-b079-e14a-b48a-7cab8b41e0f3%2Fwdio%7Cead35c5a-160b-084d-8da3-0f5aae0f0dd7%2F%29
---

# WDIO Tips

## Install

```bash
npm install cucumber @cucumber/cucumber fs path
npm install @babel/parser @babel/traverse
npm install @babel/parser @babel/traverse @erkobridee/graphviz-cli fs path
```

## Run Regression Commands

```bash
# tec-l-1183510 (labs)
npm run regression -- \
  --baseUrl=https://tec-l-1183510.labs.microstrategy.com/MicroStrategyLibrary/ \
  --params.credentials.username=app \
  --tcList=TC90145_10 \
  --params.dbUrl=postgresql://mstr:<redacted>@tec-l-1183510.labs.microstrategy.com:5432/tec_l_1183510_collab

# saas-stg (SaaS QA)
npm run regression -- \
  --baseUrl=https://saas-stg.trial.cloud.microstrategy.com/MicroStrategyLibrary/ \
  --params.credentials.username=saastest.bot@microstrategy.com \
  --params.credentials.password=<redacted> \
  --params.loginType=saasQA \
  --tcList=TC93863

# mci-u6btx-dev (hypernow)
npm run regression -- \
  --baseUrl=https://mci-u6btx-dev.hypernow.microstrategy.com/MicroStrategyLibrary/ \
  --params.credentials.username=app \
  --params.credentials.webServerUsername=mstr \
  --params.credentials.webServerPassword=<redacted> \
  --tcList=TC90145_01 \
  --params.dbUrl=postgresql://mstr_collab:<redacted>@mci-ze4yt-dev.hypernow.microstrategy.com:30036/mstr_collab

# bot_palette (labs)
npm run regression --- \
  --baseUrl=https://tec-l-1206808.labs.microstrategy.com/MicroStrategyLibrary/ \
  --params.credentials.username=bot_palette \
  --tcList=TC85824_2

# mci-fphwy-dev (customapp)
npm run regression -- \
  --baseUrl=https://mci-fphwy-dev.hypernow.microstrategy.com/MicroStrategyLibrary/ \
  --params.credentials.username=web.customapp \
  --params.credentials.password=<redacted> \
  --params.credentials.webServerUsername=mstr \
  --params.credentials.webServerPassword=<redacted> \
  --tcList=TC82385

# Bot instruction tests (ze4yt)
npm run regression -- \
  --spec specs/regression/botConfiguration/CustomInstruction_Response.spec.js \
  --baseUrl=https://mci-ze4yt-dev.hypernow.microstrategy.com/MicroStrategyLibrary/ \
  --params.credentials.username=app \
  --params.credentials.webServerUsername=mstr \
  --params.credentials.webServerPassword=<redacted> \
  --isInstructionTest=true \
  --save2DB.buildNumber=11.4.0100.0110 \
  --params.dbUrl=postgresql://mstr_collab:<redacted>@mci-ze4yt-dev.hypernow.microstrategy.com:30036/mstr_collab

# tec-l-1191974
npm run regression -- \
  --baseUrl=https://tec-l-1191974.labs.microstrategy.com/MicroStrategyLibrary/ \
  --tcList=TC93320_01 \
  --params.credentials.username=app

# tec-l-1183510 (with webServer auth)
npm run regression -- \
  --baseUrl=https://tec-l-1183510.labs.microstrategy.com/MicroStrategyLibrary/ \
  --params.credentials.username=app \
  --params.credentials.webServerUsername=mstr \
  --params.credentials.webServerPassword=<redacted> \
  --tcList=TC88585_04 \
  --params.dbUrl=postgresql://mstr:<redacted>@tec-l-1183510.labs.microstrategy.com:5432/tec_l_1183510_collab

# Local (10.23.34.82)
npm run regression -- \
  --baseUrl=http://10.23.34.82:8080/MicroStrategyLibrary/ \
  --tcList=TC_Chat_1
```

## DB URL Pattern

```
postgresql://mstr:m$tr123@tec-l-1183510.labs.microstrategy.com:5432/tec_l_1183510_collab
```

## Migrate Page Objects

```bash
node ./scripts/migratePageObject.js
```

## Docker Build (Jenkins)

```bash
build -t web-dossier \
  /var/lib/jenkins/workspace/container-web-dossier-.-m2021-.-stage-0-container-customapp-premerge/production/docker \
  -f /var/lib/jenkins/workspace/container-web-dossier-.-m2021-.-stage-0-container-customapp-premerge/production/docker/Dockerfile \
  --build-arg APP_VERSION=11.3.1260 \
  --build-arg BASE_IMAGE=nexus.internal.microstrategy.com:49081/redhat-ubi9-minimal-jre-tomcat-node:11.3.1260
```

## References

- wdio PR (image-comparison-service removal): https://github.com/mstr-kiai/wdio/pull/195/files

## image-comparison-service Config (wdio.conf.ts)

Remove `image-comparison-service` from `package.json`. Config in `wdio.conf.ts` (commented out):

```typescript
// {
//   'image-comparison',
//   {
//     // baselineFolder: path.join(process.cwd(), './baselineImage/'),
//     // formatImageName: '{tag}-{logName}-{width}x{height}',
//     // screenshotPath: path.join(process.cwd(), './outputImage/'),
//     // savePerInstance: true,
//     // autoSaveBaseline: true,
//     // blockOutStatusBar: true,
//     // blockOutToolBar: true,
//     // clearRuntimeFolder: false,
//     // disableCSSAnimation: true,
//     // returnAllCompareData: true,
//     // logLevel: 'warn',
//     // isHybridApp: false,
//   },
// },
```
