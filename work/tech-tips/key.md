---
tags: [tech-tips, api-keys, openai, azure, ssl, docker, certificate, kubernetes, microstrategy]
source: https://microstrategy-my.sharepoint.com/personal/xuyin_microstrategy_com/_layouts/15/Doc.aspx?sourcedoc={012e0fa7-27fa-49ef-b133-948eec6b586f}&action=edit&wd=target%28Useful%20Tooltip.one%7C64d3c646-b079-e14a-b48a-7cab8b41e0f3%2Fkey%7C9087b546-da69-5342-9953-2eca1d0ffca0%2F%29
---

# Keys & Config Reference

## AI API Configuration

- **API Key**: `<redacted>` (see OneNote)
- **Base URL**: https://ncus1.openai.azure.com
- **Model**: `gpt-35-turbo-16k`

### aiConfig.json

```json
{
  "langchainVerbose": true,
  "mstrAiApiKey": "<redacted>",
  "mstrAiBaseUrl": "http://10.23.35.208:4776",
  "aiCanvas.aiModel": "gpt-35-turbo-16k",
  "aiCanvas.aiAPIVersion": "2023-03-15-preview",
  "aiCanvas.useInsightPlus": true,
  "aiCanvas": {
    "useInsightPlus": true
  }
}
```

Config path: `"aiConfigPath": "/home/mstr/ssl/aiConfig.json"`

## Keystore

```bash
keytool -v -list -keystore /data/trusted.jks
```

## kubectl Patch Collaboration Image

```bash
kubectl patch deploy tec-l-1191974-collaboration -n microstrategy \
  --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/image", "value": "local/collab:ai.1" }]'
```

## SSL Certificate Operations

### Certificate Ordering (in combined PEM file)
```
server.crt → intermediate.crt → root.crt
```

### Check Certificate Type

```bash
# Root CA
openssl x509 -text -noout -in CACert.crt

# Generate PEM from PFX
openssl pkcs12 -in wildcard_labs_microstrategy_com.pfx -nodes -out server.pem
```

### Build Certificate Chain

1. Copy server cert (`server.crt`) and intermediate cert (`wildcard_labs_microstrategy_com.crt`) to same directory
2. Save intermediate cert content as `intermediate.crt`
3. Save root cert (`CACert.crt`) content as `root.crt`
4. Combine in order: `server.crt` → `intermediate.crt` → `root.crt` → save as `certificate_chain.crt`
5. Verify:

```bash
openssl verify -CAfile certificate_chain.crt server.crt
```

## Docker Registry Login (JFrog)

```bash
docker login -u xuyin@microstrategy.com -p <redacted> \
  jfrog.internal.microstrategy.com/mstr-docker-ci-virtual
```
