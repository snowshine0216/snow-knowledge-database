---
tags: [qa-testing, precision-testing, jacoco, coverage, java, bytebuddy, static-analysis]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28%E6%B5%8B%E8%AF%95%E5%BC%80%E5%8F%91.one%7Ce7610782-a763-4548-9d63-3961b0f35d65%2F%E7%B2%BE%E5%87%86%E6%B5%8B%E8%AF%95%7C349eaa69-48f8-744a-9d05-16e6066e2cd7%2F%29
---

# 精准测试 (Precision Testing)

## Concepts

**Coverage dimensions:**
- 全量覆盖度 (full coverage)
- 差异覆盖度 (differential coverage)

**Traditional layers:** requirement coverage, API coverage, UI coverage

**Manual testing:**
- Reverse proxy: modify request headers
- Code layer: identify key characteristics

**Automation testing:** setup / teardown (single thread)

**Dynamic analysis:** Get code coverage rate (JaCoCo, XML data). Can't track code relationships or coloring.

**Static analysis:** Detect code changes via syntax tree (语法书)

Java advantage: richer ecosystem for runtime context — python lacks similar depth.

## Tools by Category

| Category | Tools |
|---|---|
| Test cases (manual) | Behavior coloring, reverse proxy |
| Test cases (auto) | JUnit, pytest |
| Dynamic analysis (plugins) | jvm-sandbox, bytebuddy, jacoco |
| Static analysis (syntax tree) | javaparser, antlr |
| Static analysis (code change) | git diff |
| Static analysis (bytecode) | asm |

Reference: https://testerhome.com/topics/20632

## JaCoCo Setup

```bash
# Download JaCoCo CLI
curl -O 'https://oss.sonatype.org/service/local/artifact/maven/redirect?r=snapshots&g=org.jacoco&a=jacococli&e=zip&v=LATEST'

# Add to ~/.zshrc
export JACOCO_HOME=/Users/xuyin/Documents/jacoco
alias jacococli="java -jar $JACOCO_HOME/lib/jacococli.jar"
```

Reference: https://ceshiren.com/t/topic/22626

## Integration Test with spring-petclinic

```bash
# 1. Build
mvn clean package -Dcheckstyle.skip=true -Dmaven.test.skip=true
cd target

# 2. Run app (with JaCoCo agent instrumentation)
java -javaagent:$JACOCO_HOME/lib/jacocoagent.jar=output=tcpserver \
  -jar target/spring-petclinic-2.7.0-SNAPSHOT.jar

# 3. Dump coverage data
jacococli dump --address 127.0.0.1 --port 6300 --destfile startup.exec

# 4. Precision test: reset before each scenario
rm startup.exec
jacococli dump --address 127.0.0.1 --port 6300 --destfile startup.exec --reset

# 5. Generate HTML report
jacococli report startup.exec \
  --classfiles target/classes \
  --sourcefiles src/main/java \
  --html html

# 6. Generate XML + CSV report
jacococli report startup.exec \
  --classfiles target/classes \
  --sourcefiles src/main/java \
  --html html \
  --xml html/jacoco.xml \
  --csv html/jacoco.csv
```

## Coverage Collection Function (Shell)

```bash
get_coverage() {
  local dir=$1
  rm startup.exec
  jacococli dump --address 127.0.0.1 --port 6300 --destfile startup.exec --reset
  [ -d $dir ] || mkdir $dir
  jacococli report startup.exec \
    --classfiles target/classes \
    --sourcefiles src/main/java \
    --html $dir \
    --xml $dir/jacoco.xml \
    --csv $dir/jacoco.csv
}

get_coverage html2
open html/index.html
```

## Unit Test

```bash
mvn clean test -Dcheckstyle.skip=true
```

## Microservice Packaging Pattern

```bash
# python setup.py → console scripts → packaged script, parameterized, small microservice
# Flask exposes interface; data stored in MySQL; Jenkins orchestrates
```
