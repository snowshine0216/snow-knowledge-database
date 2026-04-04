---
tags: [env-setup, ngrok, teams, bot-framework, azure, docker, fips]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2FNgrok%20and%20Teams%7C1d4a0e1f-2605-5345-8a27-b08e87807c15%2F%29
---

# Ngrok and Teams

Reference: https://dashboard.ngrok.com/get-started/setup/macos

## Ngrok Setup

```bash
ngrok config add-authtoken <redacted>
ngrok http 8080 --domain=charming-quietly-colt.ngrok-free.app
```

### Interactive Mode (Docker)

```bash
docker run --it -e NGROK_AUTHTOKEN=<redacted> \
  ngrok/ngrok:latest http --domain=charming-quietly-colt.ngrok-free.app 8080
```

### Backend Mode (Docker)

```bash
docker run -d -e NGROK_AUTHTOKEN=<redacted> \
  ngrok/ngrok:latest http --domain=charming-quietly-colt.ngrok-free.app 8080
```

Public URL: https://charming-quietly-colt.ngrok-free.app

## Teams Bot App Registration

| Field | Value |
|---|---|
| App ID / Client ID | 74eabda1-d7b1-43de-b7f4-4f95f06b2621 |
| Tenant ID | 6db761a7-e4e8-48c1-86a8-d772895f8393 |
| SSO Secret | `<redacted>` — see OneNote |
| API URI | `api://1829-199-255-83-176.ngrok-free.app/botid-bebb3174-5798-46c8-98d7-5f991223e5fb` |
| Bot Framework | https://dev.botframework.com/bots?id=338211 |

## Backup Files (S3)

```
https://mstrbak-dev.s3.amazonaws.com/mci-ze4yt-dev-iserver-0-2024-05-25-07_48_52.132187.tar.gz
https://mstrbak-dev.s3.amazonaws.com/tec-l-1191974-iserver-0-2024-06-04-07_06_35.996161.tar.gz
```

## Disable FIPS

```bash
sudo fips-mode-setup --disable
sudo dracut -f
sudo vi /etc/default/grub
# Edit GRUB_CMDLINE_LINUX to remove fips=1
sudo grub2-mkconfig -o /boot/grub2/grub.cfg
sudo mv /etc/system-fips /etc/system-fips.bak
sudo update-crypto-policies --show
sudo update-crypto-policies --set DEFAULT
# Reboot
```
