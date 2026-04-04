---
tags: [qa-testing, docker, jenkins, selenium, python, container, ci-cd]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28%E6%B5%8B%E8%AF%95%E5%BC%80%E5%8F%91.one%7Ce7610782-a763-4548-9d63-3961b0f35d65%2F%E5%AE%B9%E5%99%A8%E6%8A%80%E6%9C%AF%E5%8F%8Adocker%7C0e1fde0d-8cc9-2d4c-8608-326644b7f263%2F%29
---

# 容器技术及Docker

## Basic Docker Commands

```bash
# MySQL containers
docker run --rm -it --name temp-mysql -e MYSQL_ROOT_PASSWORD=ceshiren.com -d mysql
docker run --rm -it -e MYSQL_ROOT_PASSWORD=ceshiren.com -d mysql
docker run --rm -it -p 33060:3306 -e MYSQL_ROOT_PASSWORD=ceshiren.com -d mysql

# Nginx
docker run --name tem-nginx -p 30080:80 -d nginx

# Common ops
docker logs -f $name
docker exec -it $name bash
docker exec -it jira_mysql mysql -pceshiren.com
docker exec -i jira_mysql mysql -pceshiren.com < init.sql
docker cp
docker inspect
docker images
docker search mysql
docker pull mysql:latest
docker history mysql
docker rmi $imageid
docker stop $name
docker ps -a
docker system prune
```

## Jenkins Container

```bash
# Basic Jenkins
docker run -it --name=jenkins -p 18080:8080 -p 18081:50000 \
  -v $PWD/jenkins_home:/var/jenkins_home jenkins/jenkins

# If permission issue, add -uroot
docker run -d --name jenkins -p 18080:8080 -p 50000:50000 \
  -v /Users/xuyin/Documents/jenkins_home:/var/jenkins_home jenkins

# With timezone
docker run -d --name jenkins -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -e JAVA_OPTS=-Duser.timezone=Asia/Shanghai jenkins/jenkins

docker build -t jenkins_node .
```

## Install Docker (Linux)

```bash
# CentOS 6
yum install https://get.docker.com/rpm/1.7.1/centos-6/RPMS/x86_64/docker-engine-1.7.1-1.el6.x86_64.rpm
service docker start
```

## Dockerfile Example (Python Flask)

```dockerfile
FROM python:3.8-slim-buster

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

CMD [ "python3", "-m", "flask", "run", "--host=0.0.0.0"]
```

```bash
pip freeze > requirements.txt
pip freeze | awk -F'==' '{print $1}' > requirements.txt
pip3 install --upgrade pip
pip3 install --upgrade setuptools
python3 -m pip install --upgrade pip

# Run tests with allure
pytest --alluredir=allure --junitxmls=junit.xml tests/customapp/test_customapp_get.py
```

## Jenkins Multi-Node Setup (Auto-Connect)

```bash
cp -r /var/lib/docker/volumes/jenkins_home/_data/* /usr/local/jenkins_home
docker inspect 5d300e7d3100
sudo chown -R 1000 /usr/local/jenkins_home

docker run -d --name=jenkins3 --privileged=true -p 8080:8080 -p 50000:50000 \
  -v /usr/local/jenkins_home:/var/jenkins_home jenkins/jenkins

# SSH key
/var/jenkins_home/.ssh/id_ed25519.pub

# Agent nodes (secrets redacted — see OneNote)
docker run -d --name=apinode1 jenkins_node java -jar agent.jar \
  -jnlpUrl http://tec-l-1081462.labs.microstrategy.com:8080/manage/computer/apinode1/jenkins-agent.jnlp \
  -secret <redacted> -workDir "/jenkins"

docker run -d --name=apinode2 jenkins_node:v1 java -jar agent.jar \
  -jnlpUrl http://tec-l-1081462.labs.microstrategy.com:8080/manage/computer/apinode2/jenkins-agent.jnlp \
  -secret <redacted> -workDir "/jenkins"
```

### Jenkins CSP Fix

```groovy
System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "sandbox allow-scripts allow-same-origin;")
```

## Web Integration (Selenium Docker)

```bash
docker run --name chrome -d -p 4444:4444 -p 5900:5900 --shm-size="2g" \
  selenium/standalone-chrome:4.4.0-20220831
```

Change to remote mode (selenium.dev):
```python
options = webdriver.ChromeOptions()
webdriver.Remote('http://dockerip:444/wd/hub', options=options)
```

Docker Hub compose:
```bash
# Get compose from https://github.com/SeleniumHQ/docker-selenium
docker compose -f docker-compose.yaml ps
docker compose up
docker compose down
```

## References

- python `__init__` docnote: https://blog.csdn.net/weixin_48849026/article/details/116137564
- Linux install docker: https://blog.csdn.net/Along_168163/article/details/123873817
- CentOS install docker: https://www.shuzhiduo.com/A/LPdoYvw8J3/
- Dockerfile reference: https://www.fke6.com/html/88T7C0XL43GW.html
- Jenkins email config: https://www.cnblogs.com/zz0412/p/jenkins_jj_01.html
