# PPTAgent Setup and Troubleshooting (macOS)

Upstream project: https://github.com/icip-cas/PPTAgent

This note covers the exact errors seen when running:

```bash
uvx pptagent generate "Single Page with Title: Hello World" -o hello.pptx
```

## 1. Fix Missing Docker Sandbox Image

If you see:

- `Unable to find image 'deeppresenter-sandbox:0.1.0' locally`
- `docker: Error response from daemon: pull access denied for deeppresenter-sandbox`

pull and tag the expected image:

```bash
docker pull docker.1ms.run/forceless/deeppresenter-sandbox:0.1.0 \
  || docker pull forceless/deeppresenter-sandbox:0.1.0

docker tag docker.1ms.run/forceless/deeppresenter-sandbox:0.1.0 deeppresenter-sandbox:0.1.0 2>/dev/null || true
docker tag forceless/deeppresenter-sandbox:0.1.0 deeppresenter-sandbox:0.1.0 2>/dev/null || true
```

Verify:

```bash
docker images --format '{{.Repository}}:{{.Tag}}\t{{.ID}}' | grep deeppresenter-sandbox
```

If `docker pull` still fails, run:

```bash
docker login
```

and retry.

## 2. Fix `unoconvert/soffice is not installed` Warning

If you see:

- `unoconvert/soffice is not installed, pptx to images conversion will not work`

install LibreOffice (`soffice`) on macOS:

```bash
brew install --cask libreoffice
```

Create a CLI symlink (Apple Silicon):

```bash
ln -sf /Applications/LibreOffice.app/Contents/MacOS/soffice /opt/homebrew/bin/soffice
```

Intel macOS path:

```bash
ln -sf /Applications/LibreOffice.app/Contents/MacOS/soffice /usr/local/bin/soffice
```

Verify:

```bash
which soffice
```

## 3. Retry Generation

```bash
uvx pptagent generate "Single Page with Title: Hello World" -o hello.pptx
```

## 4. Fix `Forceless/DeepPresenter-9B-GGUF:q4_K_M` HTTP 404 in `image_generation`

If you see repeated errors like:

- `NotFoundError (HTTP 404): File Not Found`
- `Tool image_generation ... All models failed after 10 retries`

root cause:

- `t2i_model` is configured as `Forceless/DeepPresenter-9B-GGUF:q4_K_M` on `http://127.0.0.1:7811/v1`
- PPTAgent calls OpenAI-compatible `images.generate` for `t2i_model`
- local `llama-server` text model endpoints do not provide that image API/model, so image generation gets 404

### Option A (recommended for local-only): disable text-to-image

Edit `~/.config/deeppresenter/config.yaml` and set:

```yaml
t2i_model: null
```

Then run again:

```bash
uvx pptagent generate "Single Page with Title: Hello World" -o hello.pptx
```

### Option B: use a real image model endpoint for `t2i_model`

Example with OpenAI Images API:

```yaml
t2i_model:
  api_key: sk-...
  base_url: https://api.openai.com/v1
  model: gpt-image-1
```

Keep your text models (`research_agent`, `design_agent`, `long_context_model`) on local `llama-server` if you want.

## 5. Optional: Re-run Onboarding Checks

```bash
uvx pptagent onboard
```

If prompted that config already exists, choose reconfigure to re-run dependency checks.

## 6. Optional: Install ripgrep

If your terminal shows `zsh: command not found: rg`:

```bash
brew install ripgrep
```
