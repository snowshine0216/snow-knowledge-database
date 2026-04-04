---
tags: [collaboration, linux, microstrategy, collab-server, nodejs]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Collaboration.one%7Ca2375478-5914-6b4a-9ebb-0803b779fb8a%2FLinux%7Ca2b49c11-b117-6e4e-8c09-e33aa714e533%2F%29
---

# Collaboration — Linux

MicroStrategy Collaboration Server setup and diagnostics on Linux.

## Setup

```bash
# Symlink node to /usr/local/bin
sudo ln -s /opt/mstr/MicroStrategy/install/NodeJS/bin/node /usr/local/bin

cd /opt/mstr/MicroStrategy/install/NodeJS/bin
```

## Diagnose

```bash
node /opt/mstr/MicroStrategy/install/CollaborationServer/node_modules/mstr-collab-svc/diagnose.js \
  /opt/mstr/MicroStrategy/install/CollaborationServer/config.json
```

## Start Server

```bash
node --trace-warnings \
  /opt/mstr/MicroStrategy/install/CollaborationServer/node_modules/mstr-collab-svc/server.js \
  /opt/mstr/MicroStrategy/install/CollaborationServer/config.json
```

## Encrypt Key

```bash
# Encrypt a password with the AES key
/opt/mstr/MicroStrategy/install/NodeJS/bin/node \
  /opt/mstr/MicroStrategy/install/CollaborationServer/node_modules/mstr-collab-svc/encrypt.js \
  /opt/mstr/MicroStrategy/install/CollaborationServer/mstr_collab_aes.key \
  <redacted>

# Decrypt / reverse
/opt/mstr/MicroStrategy/install/NodeJS/bin/node \
  /opt/mstr/MicroStrategy/install/CollaborationServer/node_modules/mstr-collab-svc/encrypt.js -r \
  /opt/mstr/MicroStrategy/install/CollaborationServer/mstr_collab_aes.key \
  <redacted>
```
