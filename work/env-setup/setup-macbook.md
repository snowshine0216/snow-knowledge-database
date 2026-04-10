---
tags: [env-setup, mac, homebrew, nvm, conda, java, mitmproxy, kubectl, audio]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Environemnt%20Setup.one%7C2bfde96d-9f56-6047-9368-2a88190c24b7%2FSetup%20macbook%7Cd386c0e4-511f-6b43-99ce-9ad883ad82e4%2F%29
---

# Setup Macbook

## Steps

1. **xcode-select**
   ```bash
   xcode-select --install
   ```

2. **Homebrew**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   brew install jq
   ```

3. **Mitmproxy**
   ```bash
   pip install bcrypt==4.0.1
   ```

4. **VS Code setup**

5. **zshrc setup**

6. **Mitmproxy — trust CA cert**
   ```bash
   sudo security add-trusted-cert -d -p ssl -p basic \
     -k /Library/Keychains/System.keychain \
     mitmproxy-ca-cert.pem
   ```

7. **Java setup**
   ```bash
   brew install --cask temurin17
   # Jenv install
   ```

8. **nvm install**
   - Reference: https://github.com/nvm-sh/nvm
   ```bash
   wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   nvm alias default VXXX
   npm install -g eslint
   npm install eslint --save-dev
   ```

9. **Conda install**
   - Reference: https://docs.conda.io/en/latest/miniconda.html
   ```bash
   conda create --name myenv python=3.8 numpy
   conda activate myenv
   pip freeze > requirements.txt
   ```

10. **Kubectl**
    Reference: https://microstrategy.atlassian.net/wiki/spaces/TPD/pages/2953281686/Tanzu+Kubernetes+Cluster+Guide#Configure-Kubectl-Vsphere

11. **Software**
    - Chrome
    - Rdp
    - Docker
    - Wechat
    - python
    - git
    - charles

12. **File transfer** (between machines)

13. **OneNote**: File → Open Notebook

14. **DBeaver**
    ```bash
    brew install --cask dbeaver-community
    ```

15. **BlackHole** (virtual audio driver for recording system audio)
    ```bash
    brew install blackhole-2ch
    ```
    - Creates a virtual 2-channel audio device
    - Use with Audio MIDI Setup to route system audio for recording
