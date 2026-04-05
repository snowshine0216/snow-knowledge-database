---
tags: [claude, anthropic, dispatch, remote-agent, claude-code]
source: https://www.youtube.com/watch?v=1_VlT1vhN04
---

# Anthropic Dispatch

Dispatch is Anthropic's phone-to-desktop remote control layer for Claude. It enables users to assign tasks from a mobile device to a persistent Claude desktop session that has access to local files, tools, skills, and browser capabilities.

## How It Works

1. Update both the Claude desktop and mobile apps
2. From the phone, assign tasks to the desktop session
3. The desktop agent executes tasks using its full local environment -- file system, browser, installed tools
4. Results are relayed back to the mobile client

## Core Value Proposition

Dispatch is a **continuity and remote-control layer** for an already-running desktop agent. The key improvement over earlier Claude Cowork flows is that users no longer need to be physically present at the machine to supervise sessions.

**Example use case:** Remotely asking the desktop agent to locate and send a specific document (e.g., a bank letter) while away from the computer.

## Security Considerations

Dispatch significantly expands the security surface. The remote agent can:

- Read, move, or delete files
- Interact with services
- Control the browser

Security implications should be evaluated carefully before enabling broad access.

## Limitations

| Limitation | Detail |
|---|---|
| Desktop must stay awake | No wake-on-demand |
| Single-threaded | One task at a time |
| No notifications | No push alerts when tasks complete |
| No scheduling | Cannot queue tasks for future execution |

## Availability

Initially available on the Max plan, with Pro plan access expected later.

## Broader Context

Dispatch represents an early step toward persistent personal-agent workflows for knowledge work. AI labs are converging on long-running autonomous agent systems -- Dispatch is Anthropic's entry into remote agent orchestration, comparable in ambition to OpenClaw-style personal AI operating environments.

If Anthropic continues refining this workflow, it could become a meaningful operational layer for remote AI-assisted work. The current limitations suggest the product is still maturing.

See also: [[long-running-agent-harness]], [[harness-engineering]]
