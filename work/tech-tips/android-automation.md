---
tags: [tech-tips, android, adb, automation, mobile-testing, microstrategy]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Useful%20Tooltip.one%7C64d3c646-b079-e14a-b48a-7cab8b41e0f3%2FAndroid%20automation%7Ce80e6164-ed6d-4d44-88a5-77d8dfe26eb3%2F%29
---

# Android Automation

Reference: https://microstrategy.atlassian.net/wiki/spaces/TECCLIENTSMOBILECTCANDROID/pages/344687066/Android+Dossier+Automation+Environment+Setup

## ADB Scenario Setup

```bash
# Clear scenario directory
adb shell rm -r /sdcard/Android/data/com.microstrategy.android.dossier/scenario
adb shell mkdir -p /sdcard/Android/data/com.microstrategy.android.dossier/scenario

# Push Library_Dossier_MicroChart tests
adb push ~/Documents/Repository/mobile-test-automation/Android/DossierTestCases/Library_Dossier_MicroChart/Tests \
  /sdcard/Android/data/com.microstrategy.android.dossier/scenario/
adb push ~/Documents/Repository/mobile-test-automation/Android/DossierTestCases/Library_Dossier_MicroChart/scenario.json \
  /sdcard/Android/data/com.microstrategy.android.dossier/scenario/

# Push E2E-Tanzu-AndroidLibraryReport tests
adb push ~/Documents/Repository/mobile-test-automation/Android/DossierTestCases/E2E-Tanzu-AndroidLibraryReport/Tests \
  /sdcard/Android/data/com.microstrategy.android.dossier/scenario/
adb push ~/Documents/Repository/mobile-test-automation/Android/DossierTestCases/E2E-Tanzu-AndroidLibraryReport/scenario.json \
  /sdcard/Android/data/com.microstrategy.android.dossier/scenario/

# Push Library_Dossier_Cache tests
adb push ~/Documents/Repository/mobile-test-automation/Android/DossierTestCases/Library_Dossier_Cache/promt \
  /sdcard/Android/data/com.microstrategy.android.dossier/scenario/
adb push ~/Documents/Repository/mobile-test-automation/Android/DossierTestCases/Library_Dossier_Cache/scenario.json \
  /sdcard/Android/data/com.microstrategy.android.dossier/scenario/

# Push Library_Phone_AcceptanceTest tests
adb push /Users/xuyin/Documents/Repository/mobile-test-automation/Android/DossierTestCases/Library_Phone_AcceptanceTest/Tests \
  /sdcard/Android/data/com.microstrategy.android.dossier/scenario/
adb push ~/Documents/Repository/mobile-test-automation/Android/DossierTestCases/Library_Phone_AcceptanceTest/scenario.json \
  /sdcard/Android/data/com.microstrategy.android.dossier/scenario/
```

## Log Level

```
level:error  Test
```

## Network Conditions (Chrome DevTools)

- Profile: **Android mobile - high end**
- User Agent:
  ```
  Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36DossierMobile
  ```
