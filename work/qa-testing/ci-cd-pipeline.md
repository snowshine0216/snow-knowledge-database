---
tags: [qa-testing, ci-cd, jenkins, docker, maven, pipeline, java]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28%E6%B5%8B%E8%AF%95%E5%BC%80%E5%8F%91.one%7Ce7610782-a763-4548-9d63-3961b0f35d65%2F%E6%8C%81%E7%BB%AD%E4%BA%A4%E4%BB%98%E6%B5%81%E6%B0%B4%E7%BA%BF%7C6f27c2d9-3de6-e74a-9729-35f9208f2973%2F%29
---

# 持续交付流水线 (CI/CD Pipeline)

## CD Integration

### Build JAR

```bash
mvn -Dcheckstyle.skip=true -Dmaven.test.failure.ignore=true -Dmaven.test.skip=true package
# Output: $workspace/target/*.jar
```

### Maven Repository Setup

```bash
cd ~/.m2/repository/
pwd
# /root/.m2/repository → mount to external volume

docker run --name cd_node -v /root/.m2:/root/.m2 -d jenkins_node bash -c 'java -jar ...'
docker run -it --name=cd_node jenkins_node:v3 -d
docker run --rm -it --name=cd_node jenkins_node:v3 bash

# Run with Jenkins agent (secret redacted — see OneNote)
docker run --name cd_node -d jenkins_node:v3 bash -c \
  'curl -s0 http://tec-l-1081462.labs.microstrategy.com:8080/jnlpJars/agent.jar; \
   java -jar agent.jar \
   -jnlpUrl http://tec-l-1081462.labs.microstrategy.com:8080/manage/computer/cd_node/jenkins-agent.jnlp \
   -secret <redacted> -workDir "/jenkins"'

# Debug with jar mount
docker run -it --rm --name cd_node \
  -v $PWD/root/.m2:/root/.m2 \
  -v $PWD/agent.jar:/app/agent.jar \
  jenkins_node bash
```

JRE path: `/usr/lib/jvm/jre-17-openjdk-17.0.3.0.7-2.el8.x86_64`

### Dockerfile (jenkins_node)

```dockerfile
FROM centos
RUN dnf -y --disablerepo '*' --enablerepo=extras swap centos-linux-repos centos-stream-repos; \
    yum install -y git; \
    yum install -y python38; \
    yum install -y java-17-openjdk maven
ENV JAVA_HOME=/usr/lib/jvm/jre-17-openjdk-17.0.3.0.7-2.el8.x86_64
ENV PATH=/usr/lib/jvm/jre-17-openjdk-17.0.3.0.7-2.el8.x86_64/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
CMD /bin/bash
```

- Build docker file: https://gitlab.stuq.ceshiren.com/hogwarts/spring-petclinic/-/blob/test/Dockerfile
- Jenkinsfile: https://gitlab.stuq.ceshiren.com/hogwarts/spring-petclinic/-/blob/test/Jenkinsfile.groovy

## Jenkins API

- https://jenkinsapi.readthedocs.io/en/latest/
- https://python-jenkins.readthedocs.io/en/latest/examples.html#example-3-working-with-jenkins-jobs
- https://debugtalk.com/post/manage-Jenkins-via-remote-api/
- https://askcodes.net/questions/how-can-i-update-a-jenkins-job-using-the-api

## XML Editor (Python)

- https://docs.python.org/zh-cn/3/library/xml.etree.elementtree.html#building-xml-documents
- https://www.cnblogs.com/ifantastic/archive/2013/04/12/3017110.html

## References

- Jenkins params: https://blog.51cto.com/u_14035463/5583946
