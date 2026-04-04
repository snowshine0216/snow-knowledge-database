---
tags: [env-setup, linux, java, tomcat, nginx, node, cifs, openssl, keytool]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2FLinux%20Install%7C34d0369d-6570-d44c-891f-972c72763379%2F%29
---

# Linux Install

## System Config

```bash
yum install ksh -- 7.8
/etc/sysctl.conf
vm.max_map_count=5242880 -- 7.8
```

Missing library fix for MicroStrategy DB Interface:
- Install `ncurses-compat-libs`
- PostgreSQL requires: `libssl.so.1.1 libcrypto.so.1.1`, `openssl-libs`

## CIFS Mount

```bash
sudo yum install cifs-utils
sudo mount.cifs -o domain=corp.microstrategy.com,username=xuyin //10.15.68.126/cm_bld1/ /opt/install/
sudo umount /opt/install
df -hT
fuser -m -v /opt/install/
```

## SCP Download

```bash
sudo scp admin@10.23.39.188:/usr/local/insightengine_00816/nohup.out /Users/xuyin/Downloads
```

## Maven (Linux)

Reference: https://www.cnblogs.com/cheyunhua/p/16185929.html

## Java (Linux)

```bash
sudo yum search openjdk
sudo yum install java-17-openjdk-devel
java --version
sudo update-alternatives --config java
```

## Tomcat Install

```bash
sudo useradd -r -m -U -d /opt/tomcat -s /bin/false tomcat
wget https://downloads.apache.org/tomcat/tomcat-10/v10.1.24/bin/apache-tomcat-10.1.24.tar.gz
sudo tar xf apache-tomcat-10.1.24.tar.gz -C /opt/tomcat
sudo chown -R tomcat: /opt/tomcat
sudo sh -c 'chmod +x /opt/tomcat/apache-tomcat-10.1.24/bin/*.sh'
```

### Tomcat systemd service

```bash
sudo nano /etc/systemd/system/tomcat.service
```

```ini
[Unit]
Description=Apache Tomcat Web Application Container
After=network.target

[Service]
Type=forking
User=tomcat
Group=tomcat
Environment="JAVA_HOME=/usr/lib/jvm/java-17-openjdk"
Environment="CATALINA_PID=/opt/tomcat/apache-tomcat-10.1.24/temp/tomcat.pid"
Environment="CATALINA_HOME=/opt/tomcat/apache-tomcat-10.1.24"
Environment="CATALINA_BASE=/opt/tomcat/apache-tomcat-10.1.24"
Environment="CATALINA_OPTS=-Xms512M -Xmx1024M -server -XX:+UseParallelGC"
ExecStart=/opt/tomcat/apache-tomcat-10.1.24/bin/startup.sh
ExecStop=/opt/tomcat/apache-tomcat-10.1.24/bin/shutdown.sh
WorkingDirectory=/opt/tomcat/apache-tomcat-10.1.24/logs

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start tomcat
sudo systemctl enable tomcat
```

## Nginx

Reference: https://nginx.org/en/linux_packages.html#RHEL

```bash
sudo yum update -y
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
cd /etc/nginx/conf.d/
```

### Nginx + SSL

```bash
# MicroStrategy Library trusted keystore path:
# /opt/apache/tomcat/apache-tomcat-10.1.19/webapps/MicroStrategyLibrary/WEB-INF/trusted.jks

# Export root CA
keytool -export -alias rootca -file mstr.crt \
  -keystore /opt/apache/tomcat/apache-tomcat-10.1.19/webapps/MicroStrategyLibrary/WEB-INF/trusted.jks

# Import keystore
keytool -importkeystore --srckeystore /opt/apache/tomcat/apache-tomcat-10.1.19/webapps/MicroStrategyLibrary/WEB-INF/trusted.jks \
  -destkeystore keystore.p12 -srcalias rootca -deststoretype PKCS12 \
  -deststorepass mstr123 -destkeypass mstr123

# Extract private key
openssl pkcs12 -in keystore.p12 -nocerts -out privatekey.pem -nodes

# View cert
openssl x509 -noout -text -in /opt/usher/ssl/server-cloud.crt

# Nginx test & reload
sudo nginx -t   # 检查配置文件是否有语法错误
sudo systemctl reload nginx   # 重新加载Nginx配置

# Firewall
sudo service iptables stop
sudo chkconfig iptables off
```

## Update Node.js

```bash
wget https://nodejs.org/dist/v16.20.0/node-v16.20.0-linux-x64.tar.xz
tar -xf node-v16.20.0-linux-x64.tar.xz
# Kill all node application
cp node-v16.20.0-linux-x64/bin/node /opt/mstr/MicroStrategy/install/NodeJS/bin/
# Start collab
```
