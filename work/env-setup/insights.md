---
tags: [env-setup, linux, insights, java, python, postgresql, pip]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2FInsights%7C74737fe5-954a-084c-9446-5d4285e918e4%2F%29
---

# Insights

## References

- Python3 install: https://blog.csdn.net/weixin_48960305/article/details/125143116
- Java install: https://blog.csdn.net/hkl_Forever/article/details/123963940
- Python 3.7.0: https://blog.csdn.net/KingOfOnePiece/article/details/113262318
- Java alternatives: https://blog.csdn.net/weixin_51008024/article/details/123781362
- pip3 install: https://www.cnblogs.com/testlearn/p/14152198.html

## PostgreSQL 10

```bash
sudo service postgresql-10 initdb
sudo chkconfig postgresql-10 on
sudo service postgresql-10 start
```

Config: `/var/lib/pgsql/10/data/pg_hba.conf`

```bash
netstat -anp | grep 26214
```

## Paths

```
/usr/local/python3
/usr/local/java/jdk-11/bin/java

# Java alternatives
/usr/bin/java
/usr/lib/java
/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.222.b03-1.el7.x86_64/jre/bin/java
```

## Java Management

```bash
sudo update-alternatives --display java
alternatives list
rpm -qa | grep jdk
yum -y remove java-1.8.0-openjdk-headless-1.8.0.322.b06-11.el8.x86_64
```

## Run Insight Engine

```bash
# Foreground
java -Djava.locale.providers="COMPAT,CLDR,SPI" \
  -Xms512m -Xmx1024m \
  -cp insight-engine.jar \
  org.springframework.boot.loader.JarLauncher \
  --spring.config.location=application.yaml

# Background
nohup java -Djava.locale.providers="COMPAT,CLDR,SPI" \
  -Xms512m -Xmx1024m \
  -cp insight-engine.jar \
  org.springframework.boot.loader.JarLauncher \
  --spring.config.location=application.yaml &
```

## Download Logs

```bash
sudo scp admin@10.23.39.188:/usr/local/insightengine_00816/nohup.out /Users/xuyin/Downloads
```

## Install pip3

```bash
python3 -m ensurepip --upgrade

# Find paths
whereis pip3
whereis python3
# e.g. /usr/local/python3/lib/python3.11

mv site-packages site-packages.bak
```
