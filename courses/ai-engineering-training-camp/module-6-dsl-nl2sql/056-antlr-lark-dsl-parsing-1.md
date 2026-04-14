---
tags: [dsl, antlr, lark, parsing, ast, lexer, langgraph, agent, llm]
source: https://u.geekbang.org/lesson/818?article=927472
wiki: wiki/concepts/056-antlr-lark-dsl-parsing.md
---

# 056: Parsing DSL Grammar with ANTLR and Lark (Part 1)

**Source:** [2使用 ANTLR与Lark 解析 DSL 语法1](https://u.geekbang.org/lesson/818?article=927472)

## Outline
- [Motivation: DSL in Agent Systems](#motivation-dsl-in-agent-systems)
- [Smart Coffee Machine Use Case](#smart-coffee-machine-use-case)
- [DSL Design Principles](#dsl-design-principles)
- [Lark: Lightweight Python Parser](#lark-lightweight-python-parser)
- [Grammar File (.lark)](#grammar-file-lark)
- [Parsing Pipeline and AST](#parsing-pipeline-and-ast)
- [Error Detection with Lark](#error-detection-with-lark)
- [ANTLR4: Industrial-Grade Parser](#antlr4-industrial-grade-parser)
- [LangGraph Integration (7 Steps)](#langgraph-integration-7-steps)
- [Key Takeaways](#key-takeaways)
- [Connections](#connections)

---

## Motivation: DSL in Agent Systems

Traditional firmware/configuration changes require: engineer edits code → commit to Git → test → release → OTA update → device reboot. This cycle can take days, by which point the user has forgotten their request.

The proposed alternative: user sends voice/text → LLM understands intent → generates updated DSL rules → validate → apply in real time.

The key insight is that **only the DSL layer is mutable**. Core capabilities (heating, flow control, etc.) are fixed in compiled/Python code and cannot change at runtime.

---

## Smart Coffee Machine Use Case

The lecture uses a smart coffee machine as a simplified stand-in for an industrial IoT system (originally: industrial control boards with temperature, valve timing, water volume).

Scenario: a user says "the morning coffee is too hot — change it to 90°C before 8 AM". The system:
1. Receives user voice/text input (speech recognition handled separately, outside this demo).
2. Uses a LangGraph + LLM pipeline to interpret intent.
3. Generates a new DSL version reflecting the change.
4. Validates the new DSL with a grammar parser.
5. Backs up the old version and applies the new one live.
6. If the change is out of bounds (e.g., 30°C brew), the system triggers a confirmation step instead.

Industrial motivation: in real industrial systems, a 3-ton vs. 30-ton misconfiguration can cause a production incident or endanger lives — strict DSL validation is the last line of defense.

---

## DSL Design Principles

The DSL describes **what** to do, never **how** to do it. The how lives in the Python implementation files.

Key properties:
- **Declarative**: describe target state/configuration, not procedural steps.
- **Readable**: domain experts (e.g., a senior barista, an operator) must be able to read and verify it without deep programming knowledge.
- **Configurable**: limited, well-defined parameters that business personnel are allowed to change (temperature, volume, time).
- **Scoped immutability**: the DSL controls only the mutable slice of the system; core logic (heating algorithm, PID control, brewing sequence) is immutable code.

DSL content for the coffee machine includes:
- Workflow nodes and their connections (a directed acyclic graph, DAG).
- Per-node parameters: temperature (°C), water volume (ml), duration (s).
- Conditional logic: e.g., if water level < 300 ml → raise alert.
- Error/boundary checks: prevents invalid states (water level 0 while heating).

The DSL version used in the demo is v1.0, with initial values such as 92°C brew temperature and 30 s heating time.

---

## Lark: Lightweight Python Parser

**Lark** (`lark-parser` library, version ≥ 1.1.7) is a Python-only parsing library suited for prototyping and development-time validation.

Usage pattern:
```python
from lark import Lark

# Load grammar from .lark file
with open("coffee_machine.lark") as f:
    grammar = f.read()

parser = Lark(grammar, start="start")
tree = parser.parse(dsl_content)
```

The `.lark` file is the grammar specification. The instructor generated it using an LLM, providing the DSL sample as context and asking for a grammar that would validate it.

---

## Grammar File (.lark)

The `.lark` grammar file serves four purposes:
1. Tells the parser how to understand the DSL structure (syntax rules).
2. Defines **terminal symbols** (keywords, identifiers, literals): e.g., node names, required fields like `model` and `strategy` for agent nodes, MCP service identifiers.
3. Defines **non-terminal symbols** (composition rules): e.g., how nodes connect, what constitutes a valid workflow graph (must be a DAG — cycles cause a grammar error).
4. Specifies parsing conventions and allowed value ranges.

The unit tokens for the coffee DSL:
- Temperature: a number followed by `°C` (degrees Celsius; `°F` would be rejected).
- Volume: a number followed by `ml`.
- Duration: a number followed by `s` (seconds).

A `CoffeeTransformer` class (a Lark `Transformer`) is used to walk the parse tree and convert matched nodes into Python dict structures (which can then be serialized to JSON or processed programmatically). This is not related to the LLM Transformer architecture.

---

## Parsing Pipeline and AST

Full pipeline from DSL text to program-usable data:

```
DSL text (.yaml / custom format)
   ↓  Lark parser + .lark grammar
AST (parse tree)
   ↓  CoffeeTransformer
Python dict  →  JSON output
```

The JSON output is what the application code works with. This cleanly separates:
- **Grammar definition** (`.lark` file) — describes the language structure.
- **Semantic processing** (`Transformer` class) — converts parse nodes to domain objects.
- **Parse engine** (Lark `Parser` class) — drives the process.

This separation of concerns means grammar changes do not require touching the semantic layer and vice versa.

---

## Error Detection with Lark

Lark provides precise, line-and-column-level error messages. Two demo errors shown:

1. **Invalid unit**: changing `92°C` to `92°F` — Lark reports the exact character position where an unrecognized token was found, stating that `°F` does not match the defined `TEMPERATURE` terminal.
2. **Value out of range**: writing `300L` (liters) instead of `300ml` — Lark similarly pinpoints the location.

For industrial systems where unit confusion (3 tons vs. 30 tons) can cause accidents, this precise error localization is critical. It also supports semi-technical users who edit the DSL manually without a full IDE.

---

## ANTLR4: Industrial-Grade Parser

**ANTLR4** (Another Tool for Language Recognition) is a Java-based, enterprise-grade parser generator. Grammar files use the `.g4` extension.

Differences from Lark:

| Dimension | Lark | ANTLR4 |
|-----------|------|--------|
| Language support | Python only | Python, Java, Go, C#, JavaScript, … |
| Performance | Interpreted | Compiled/generated code — production-level |
| Error reporting | Precise line/column messages | Exception-based with line info |
| Ecosystem | Lightweight, easy to prototype | Java ecosystem, heavier setup |
| Use case | Dev/validation tooling, Python services | Industrial systems, multi-language pipelines |

ANTLR4 workflow:
```bash
antlr4 -Dlanguage=Python3 CoffeeMachine.g4
# Generates lexer/parser Python classes
```

The `.g4` grammar file is the ANTLR4 equivalent of the `.lark` file — the instructor wrote one for the coffee DSL but did not run a live demo because the Java toolchain setup was not included in the course environment.

**Recommended strategy**: use Lark for rapid validation and grammar iteration; switch to ANTLR4 `.g4` when building production Java/multi-language systems.

The Dify platform (Python-based) uses Lark-style parsing for its workflow DSL import/export. Industrial or multi-language systems should prefer ANTLR4.

---

## LangGraph Integration (7 Steps)

The complete pipeline integrates DSL management into a LangGraph workflow. The seven nodes:

1. **Define state structure** — shared state across nodes holds: raw user input, current DSL rules, updated DSL rules (post-parse), grammar validation result, final reply message.
2. **Intent recognition node** — in the demo, keyword matching is used for simplicity (the instructor notes this should call an LLM in production). Example trigger: "把加热时间从30秒改到20秒" ("change the heating time from 30 s to 20 s").
3. **DSL update node** — calls the LLM (Qwen Turbo in the demo) with a system prompt instructing it to:
   - Modify only the specified value.
   - Preserve all other syntax exactly.
   - Return the complete DSL without markdown fences or extra formatting.
   - Bump the version number (1.0 → 1.1).
   A post-processing step strips stray `...` or markdown code fences that LLMs sometimes emit.
4. **Grammar validation node** — runs the Lark parser on the updated DSL. Uses the same `.lark` grammar as the standalone `lacparser.py`. Fails fast with a detailed error if the LLM introduced a syntax error.
5. **Apply changes node** — writes the validated new DSL to disk (e.g., `rule.dsl`) and backs up the previous version (e.g., `rule.dsl.filecap`).
6. **User input handler (main entry)** — orchestrates routing: normal changes go directly through the pipeline; out-of-range requests branch to a confirmation subgraph.
7. **Build and compile the StateGraph** — adds nodes and edges, compiles the graph, then invokes it.

Demo result: the graph successfully changed `heating_time: 30s` to `heating_time: 20s`, updating the version from `1.0` to `1.1`, with the old version preserved in the backup file.

**LLM accuracy note**: LLM-based DSL modification is accurate for single-field changes. For multi-table SQL-style changes, GPT-4 achieves only ~60% success; fine-tuned models reach ~80%. These error rates are too high for safety-critical industrial use, which is why DSL grammar validation is non-negotiable.

---

## Key Takeaways

- DSL design separates **what** (declarative configuration) from **how** (implementation code), making configurations safe for non-engineers to edit.
- Lark is the right tool for Python-based prototyping: lightweight, easy to set up, precise error messages.
- ANTLR4 is the right tool for production and multi-language environments: compiled performance, broad language support, enterprise pedigree.
- Grammar validation (`Parser`) is the safety net for both human and LLM edits — it catches unit errors, type mismatches, and structural violations at exact source locations.
- The Lark `Transformer` decouples grammar from semantics, enabling clean separation of concerns.
- In a LangGraph agent, DSL mutation + validation is a natural pipeline: intent → LLM update → grammar check → apply or rollback.
- LLM direct DSL modification is viable for simple single-value changes but unreliable for complex multi-field transformations; grammar validation mitigates hallucination risk.

---

## Connections

- → [[langgraph-basics]]
- → [[dsl-design-patterns]]
- → [[llm-structured-output]]
- → [[dify-workflow-dsl]]
