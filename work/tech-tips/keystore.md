---
tags: [tech-tips, keystore, ssl, keytool, kubernetes, openssl, microstrategy]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Useful%20Tooltip.one%7C64d3c646-b079-e14a-b48a-7cab8b41e0f3%2Fkeystore%7Cb8834e7d-85a1-fc4e-af22-17a83c3f8213%2F%29
---

# Keystore Tips

## Setup

```bash
yum install java

# Copy trusted.jks from pod to local
k cp microstrategy/tec-l-1183620-library-fd87b5c94-q7t2p:/WEB-INF/classes/auth/trusted.jks \
  /opt/cloudautomationandimages/trusted.jks

cd /opt/cloudautomationandimages/

# Import cert into keystore
keytool -importcert -file server.crt -alias server \
  -keystore trusted.jks -storepass mstr123 -noprompt

# Copy updated keystore back to pod
k cp trusted.jks microstrategy/tec-l-1183620-library-fd87b5c94-q7t2p:/data

# Exec into pod
k exec tec-l-1183620-library-fd87b5c94-q7t2p -it -n microstrategy -- /bin/bash
```

## Edit Config

```bash
nano /usr/local/tomcat/webapps/MicroStrategyLibrary/WEB-INF/classes/config/configOverride.properties
```

## Copy Keystore to Another Pod

```bash
kubectl cp /opt/cloudautomationandimages/trusted.jks \
  microstrategy/tec-l-1183510-library-566bfd9955-vzwhg:/data
```

## Update trustStore Path via sed

```bash
kubectl exec -n microstrategy tec-l-1183510-library-566bfd9955-vzwhg -- bash -c \
  "sed -i 's|trustStore.path=/WEB-INF/classes/auth/trusted.jks|trustStore.path=/data/trusted.jks|' \
  /usr/local/tomcat/webapps/MicroStrategyLibrary/WEB-INF/classes/config/configOverride.properties"
```

## PostgreSQL Data Path

```
/var/lib/pgsql/14/data
```

## New Key (PFX → PEM)

```bash
pkcs12 -in wildcard_labs_microstrategy_com.pfx -nodes -out server.pem
```

## Check Certificate Dates

```bash
openssl x509 -in /CollaborationServer/.postgresql/root.crt -dates -noout
# notBefore=Aug 25 03:31:16 2025 GMT
# notAfter=Aug 25 03:31:16 2026 GMT
```
