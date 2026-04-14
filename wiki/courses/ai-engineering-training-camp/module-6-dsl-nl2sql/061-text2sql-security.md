---
tags: [text-to-sql, nl2sql, sql-injection, data-security, llm, access-control, audit-log, human-in-the-loop, rag]
source: https://u.geekbang.org/lesson/818?article=927477
---
# Text-to-SQL Security: Defense-in-Depth for NL2SQL Systems

Text-to-SQL (NL2SQL) converts natural-language questions into SQL queries via an LLM. The non-determinism of LLM generation introduces attack vectors and data-leakage risks that require a layered security architecture placed in front of every database.

## Core Threat Model

Three primary threats specific to Text-to-SQL systems:

1. **Prompt injection** — attacker embeds hidden SQL commands (e.g., `DROP TABLE`) in an otherwise benign natural-language question; the LLM interprets the injected text as context and emits destructive SQL.
2. **Inductive queries** — leading questions designed to coax the LLM into generating `UNION` selects or system-table reads that expose schema/data beyond the user's authorization.
3. **Implicit privilege escalation** — loosely constrained generation produces SQL accessing tables/columns the user is not authorized to read, even without malicious intent.

## Four-Layer Defense Architecture

All four layers are composed into a serial **security gateway** that intercepts every query before it reaches the database.

### Layer 1 — Keyword Filtering
Block dangerous SQL tokens (`DROP`, `TRUNCATE`, `DELETE`, `EXEC`, stored-procedure calls) in the raw natural-language input before it reaches the LLM. Strip or reject on match.

### Layer 2 — Least-Privilege Access Control (RBAC)
After LLM generation, parse the SQL to extract target tables/columns. Enforce a role-permission matrix per request — block any statement that exceeds the requesting user's granted scope.

### Layer 3 — Template-Based Controlled Generation
Pre-define a library of safe SQL templates for common business queries. Use the LLM only to **extract parameter values** from the question; substitute parameters into the matching template. Refuse questions that match no template. Eliminates free-form SQL generation entirely for known query patterns.

### Layer 4 — Post-Generation Risk Scoring
Score the final SQL by risk level (Low / Medium / High):
- **Low** → auto-execute + log
- **Medium** → execute + flag for audit
- **High** → block + route to human reviewer

## Security Gateway Architecture

```
User NL Query → [Keyword Filter] → [RBAC Check] → [Template Match] → [Risk Score] → DB
                                                                              ↓
                                                                       Audit Log / Human Review Queue
```

Human reviewers can approve, reject, or modify queued queries; decisions feed back into the template library or fine-tuning dataset ([[human-in-the-loop]]).

## Alerting Thresholds

| Signal | Threshold | Response |
|--------|-----------|----------|
| High-risk query rate | > 5% | Immediate security alert |
| Human review queue depth | > 10 | Escalation |
| Gateway / DB error rate | Abnormal spike | Ops alert |

## Implementation Paths

- **[[rag]]-based** (recommended): ground SQL generation in schema context via retrieval; lower hallucination rate, easier maintenance.
- **Fine-tuning**: train on domain-specific NL/SQL pairs (e.g., DeepSeek, LLaMA); stronger in-domain accuracy but mandatory security audit post-deployment.

## Relationship to Smart BI

NL2SQL is the **technical foundation**; "smart BI" / intelligent dashboards (e.g., SQLBot) are **applications** that add chart rendering and report generation on top. SQLBot (Docker-runnable) demonstrates RAG-based NL2SQL in an enterprise BI context.

## Related Concepts

- [[text-to-sql]] — the technique being secured
- [[sql-injection]] — classical analog to prompt injection
- [[rbac]] — underpins Layer 2
- [[audit-log]] — post-execution record for every generated query
- [[human-in-the-loop]] — escalation path for medium/high-risk queries
- [[rag]] — recommended NL2SQL implementation strategy
- [[llm-security]] — broader category
