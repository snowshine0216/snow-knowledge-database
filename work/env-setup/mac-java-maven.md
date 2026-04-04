---
tags: [env-setup, mac, java, maven, jdk, redis, homebrew]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2Fmac%20install%20java%20%20mvn%7C67f47670-d062-dd49-845f-d2a126ffed81%2F%29
---

# Mac: Install Java & Maven

## Java 17 (Homebrew)

Reference: https://stackoverflow.com/questions/69875335/macos-how-to-install-java-17

```bash
brew install openjdk@17
sudo ln -sfn /usr/local/opt/openjdk@17/libexec/openjdk.jdk \
  /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

- jenv: https://www.jenv.be/
- Linux jdk upgrade: https://blog.csdn.net/gjjhyd/article/details/127495021

## Java Home Paths (Mac)

```
/Library/Java/JavaVirtualMachines/jdk1.8.0_321.jdk/Contents/Home/bin
JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-11.jdk/Contents/Home
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_321.jdk/Contents/Home
```

Reference (switch JDK): https://stackoverflow.com/questions/21964709/how-to-set-or-change-the-default-java-jdk-version-on-macos

## List All JVMs

```bash
/usr/libexec/java_home -V
# Output example:
# 11.0.15 (x86_64) "Eclipse Adoptium" - "OpenJDK 11.0.15"
#   /Library/Java/JavaVirtualMachines/temurin-11.jdk/Contents/Home
# 1.8.0_321 (x86_64) "Oracle Corporation" - "Java SE 8"
#   /Library/Java/JavaVirtualMachines/jdk1.8.0_321.jdk/Contents/Home
# 1.8.0_352 (arm64) "Azul Systems, Inc." - "Zulu 8.66.0.15"
#   /Library/Java/JavaVirtualMachines/zulu-8.jdk/Contents/Home

export JAVA_HOME=`/usr/libexec/java_home -v 1.8.0_321`
```

## Maven

Reference: https://mkyong.com/maven/install-maven-on-mac-osx/#homebrew-install-maven-on-macos

```bash
brew install maven
brew list maven
```

## Redis (Mac)

```bash
brew install redis
brew services start redis
brew services stop redis

# Connect
redis-cli -h host -p port -a password
redis-cli -h 10.23.35.119 -p 6379
```
