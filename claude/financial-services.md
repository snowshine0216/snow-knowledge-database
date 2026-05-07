---
tags: [claude, financial-services, agents, investment-research]
source: https://github.com/anthropics/financial-services
---
# Financial Services Analysis
- Repository: https://github.com/anthropics/financial-services
- Snapshot basis: README.md, vertical-plugin skill lists, selected equity-research and wealth-management skill files, and repository metadata inspected on 2026-05-07

## Repo Snapshot
The Anthropic financial-services repository provides reference agents, skills, slash commands, data connectors, and managed-agent cookbooks for financial-services workflows. It covers investment banking, equity research, private equity, wealth management, fund administration, operations, and partner data integrations.

The repository is explicitly Claude-specific. The same source can be used as Claude Cowork plugins or deployed through the Claude Managed Agents API. The README emphasizes that these agents draft analyst work product for human review and do not provide investment, legal, tax, or accounting advice.

Relevant components for investment analysis include equity-research skills such as idea generation, thesis tracking, catalyst calendars, sector overviews, earnings previews, earnings analysis, and model updates. Wealth-management content includes portfolio rebalancing workflows with drift analysis, tax-aware rules, asset location, and trade recommendation structure.

## Primary Use Cases
- Building repeatable financial-analysis workflows as skills and agents.
- Encoding analyst checklists for screening, thesis tracking, earnings review, valuation, and portfolio review.
- Creating structured outputs such as research notes, investment memos, scorecards, and rebalancing tables.
- Connecting finance workflows to enterprise data providers through MCP connectors.
- Using Claude as a controlled analyst assistant with human sign-off.

## When To Use
Use this repository when you want methodology and workflow structure rather than a ready-made trading model. It is especially useful if you need to formalize how an investment analyst thinks: define screens, document theses, track catalysts, separate evidence from action, and keep every recommendation auditable.

It is a strong source of process templates for a beginner because it decomposes investment work into named skills. You can adapt those skills to personal investing, fund selection, and cross-market research as long as you keep the human-review and compliance caveats.

Use cautiously if you expect plug-and-play data access. Many listed MCP integrations require subscriptions or API keys from financial data vendors.

## Benefits
- Provides finance-specific workflows instead of generic prompt templates.
- Separates idea generation, thesis maintenance, modeling, and portfolio rebalancing into clear modules.
- Strong governance posture: outputs are staged for qualified human review, not direct execution.
- Useful for designing your own investment-analysis agent roles and output formats.
- Skill files are plain markdown/YAML-style content, so they are easy to modify.

## Limitations and Risks
- Claude-specific integration model may not map directly onto a generic Python/TypeScript app without adaptation.
- Reference workflows assume access to reliable data sources, analyst judgment, and review processes.
- It is not a quantitative engine, backtester, or broker integration.
- Enterprise data connectors may be unavailable or costly for an individual user.
- The repository's own disclaimer should be preserved in any derivative system: no automated investment advice or trade execution without human review.

## Practical Insights
For your project, the most useful pieces are the process patterns:
- idea-generation screens for value, growth, quality, short, and special-situation candidates
- thesis-tracker fields: thesis pillars, risks, catalysts, stop-loss trigger, and conviction updates
- portfolio-rebalance logic: current allocation, target allocation, drift bands, tax impact, and trade rationale

Use these as the decision discipline on top of model and data outputs. Kronos can produce a forecast, OpenBB can produce data, Dexter or Local Deep Research can produce research summaries, but this repository shows how to turn evidence into an auditable investment memo.

For gold and funds, adapt the stock-centric skills into asset-class scorecards. For example, a gold thesis should track real yields, USD, inflation expectations, central-bank demand, ETF flows, geopolitical risk, technical trend, and portfolio hedging role. A fund thesis should track holdings, factor exposure, fees, liquidity, manager/process quality, drawdown behavior, tracking error, and fit with your target allocation.
