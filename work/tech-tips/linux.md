---
tags: [tech-tips, linux, ssh, yum, kubernetes, fips, logs]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Useful%20Tooltip.one%7C64d3c646-b079-e14a-b48a-7cab8b41e0f3%2Flinux%7C60d0c9f7-adfb-af45-8684-2a42baf579a1%2F%29
---

# Linux Tips

## SSH Copy ID

```bash
ssh-copy-id -i ~/.ssh/id_rsa admin@10.23.32.246
ssh-copy-id -i ~/.ssh/id_ed25519 admin@10.23.32.246
```

Reference: https://www.51cto.com/article/719609.html

## Enable yum (RHEL subscription)

```bash
# step1
mv /etc/sysconfig/rhn/systemid /etc/sysconfig/rhn/systemid_old
# step2
subscription-manager clean
# step3
rpm -Uvh http://prod-tech-sat.labs.microstrategy.com/pub/katello-ca-consumer-latest.noarch.rpm
# step4 (choose RHEL version)
subscription-manager register --org="MicroStrategy_Inc" --activationkey="RHEL_7"
# or
subscription-manager register --org="MicroStrategy_Inc" --activationkey="RHEL_8"
# or
subscription-manager register --org="MicroStrategy_Inc" --activationkey="RHEL_9"
```

## kubectl Aliases

```bash
alias kc="kubectl -n microstrategy"
k_exec(){
  kubectl exec -n microstrategy -it $1 -- /bin/bash
}
```

## FIPS

```bash
sudo fips-mode-setup --enable
fips-mode-setup --check
```

## Clear Log File

```bash
cat /dev/null > logs/file.log
echo "" > logfile
>/log/file

# Script clear log
>/logfile
```

## Get Count from Log

```bash
cat redis.log | grep -a 'Caller IP: ::ffff:10.250.151.233' -A 5 | grep -a 'Cache hit' | wc -l
# 9600
```
