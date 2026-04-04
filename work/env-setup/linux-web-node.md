---
tags: [env-setup, linux, chrome, jenkins, node, yarn, locale]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2FLinux%20set%20up%20web%20node%7C13a52530-2194-aa4b-9e19-41be48018756%2F%29
---

# Linux Set Up Web Node

## Setup Steps

1. Install JDK17: https://blog.csdn.net/gjjhyd/article/details/127495021

2. Install yarn:
   ```bash
   npm install yarn -g
   ```

3. Install Chrome: https://blog.csdn.net/ling1998/article/details/123951726

4. Note — Chrome dependency error on 7.9 Red Hat:
   https://unix.stackexchange.com/questions/579344/google-chrome-installation-on-oracle-linux-7-8-dependency-problem

5. Install Chrome via RPM:
   ```bash
   yum -y install wget
   wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
   wget http://mirror.centos.org/centos/7/os/x86_64/Packages/vulkan-1.1.97.0-1.el7.x86_64.rpm
   wget http://mirror.centos.org/centos/7/os/x86_64/Packages/vulkan-filesystem-1.1.97.0-1.el7.noarch.rpm
   yum -y install libX11-devel.x86_64 libXext.x86_64 libwayland-client.x86_64
   yum -y install vulkan*
   yum -y install google-chrome-stable_current_x86_64.rpm
   ```

6. Uninstall Chrome: https://superuser.com/questions/281726/how-do-i-uninstall-google-chrome-in-fedora

7. Add `-no-sandbox` for root user: https://blog.csdn.net/yuer011/article/details/118083569

## Jenkins Agent (node-1)

```bash
sudo nohup java -jar agent.jar \
  -jnlpUrl http://tec-l-1081462.labs.microstrategy.com:8080/manage/computer/web%5Fnode/jenkins-agent.jnlp \
  -secret <redacted> \
  -workDir "/usr/local/jenkins" &
```

## Troubleshooting

**4. Locale error:**
```
-bash-4.2$ locale
locale: Cannot set LC_CTYPE to default locale: No such file or directory
locale: Cannot set LC_ALL to default locale: No such file or directory
```
Fix — add to `/etc/environment`:
```
LC_ALL=en_US.UTF-8
LC_CTYPE=en_US.UTF-8
```
Then logout and login again.

**5. `npx` not found:** https://blog.csdn.net/qq_42482245/article/details/121107068

**6. `/usr/bin/env: node: No such file or directory`:** http://www.manongjc.com/detail/50-ppymurmbcmvaujd.html

**7.** `sudo start`
