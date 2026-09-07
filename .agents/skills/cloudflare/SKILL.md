---
name: cloudflare
description: Manages Cloudflare resources, executes Workers AI prompts, manages D1 databases, KV namespaces, and Cloudflare Tunnels using the connected account.
---

# Cloudflare Integration Skill for Antigravity

This skill allows Antigravity to interact with Cloudflare's platform using the authenticated Account Token.

## Account Credentials
- **Account Name**: `Ruhanawan623@gmail.com's Account`
- **Account ID**: `85694c403cc6f38cbb78ee912eec8072`
- **Token Prefix**: `cfat_...` (Account-Owned Token)

## Capabilities

### 1. Workers AI Inference
Run natural language and LLM tasks via Cloudflare Workers AI:
```bash
python .agents/skills/cloudflare/scripts/cf_client.py ai "<prompt>"
```

### 2. Verify Connection & Status
```bash
python .agents/skills/cloudflare/scripts/cf_client.py verify
```

### 3. List D1 Databases & KV Namespaces
```bash
python .agents/skills/cloudflare/scripts/cf_client.py d1
python .agents/skills/cloudflare/scripts/cf_client.py kv
```

### 4. List Workers Scripts
```bash
python .agents/skills/cloudflare/scripts/cf_client.py workers
```
