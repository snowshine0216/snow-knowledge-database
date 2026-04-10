---
tags: [microstrategy, command-manager, mstrcmdmgr, container, cli]
source: internal
---

# MicroStrategy Command Manager

## Launch Interactive Mode

```bash
./mstrcmdmgr -interactive
```

## Connect to Metadata

Once inside the interactive shell, run:

```bash
connectmstr -n mstr_metadata -u administrator -p kF0C-%vTM/KR
```

| Parameter | Value |
|-----------|-------|
| `-n` | `mstr_metadata` — metadata DSN name |
| `-u` | `administrator` — login username |
| `-p` | `kF0C-%vTM/KR` — login password |
