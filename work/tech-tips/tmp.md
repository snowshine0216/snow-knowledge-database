---
tags: [tech-tips, keystore, fips, bcfks, kubernetes, ssl, microstrategy]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Useful%20Tooltip.one%7C64d3c646-b079-e14a-b48a-7cab8b41e0f3%2Ftmp%7Ccc452225-a3fc-7c43-bb78-f27ae3756205%2F%29
---

# FIPS Keystore Operations (tmp)

## Copy Keystore from Pod

```bash
kc cp tec-l-1216461-library-7b4fdfc87d-kq9wp:/home/mstr/ssl/keystore.bcfks \
  /opt/cloudautomationandimages/keystore.bcfks
```

## Copy Files to Pod

```bash
kc cp updateFipsTrustStore.sh tec-l-1216461-library-7b4fdfc87d-kq9wp:/data

kc cp server.crt tec-l-1216461-library-7b4fdfc87d-kq9wp:/data

kc cp keystore.bcfks tec-l-1216461-library-7b4fdfc87d-kq9wp:/data
```

## Update FIPS Trust Store

```bash
sh updateFipsTrustStore.sh server.crt <redacted> keystore.bcfks
```

## Update setenv.sh

Edit `/usr/local/tomcat/bin/setenv.sh`:

```bash
cp /data/keystore.bcfks /home/mstr/ssl/keystore.bcfks
```
