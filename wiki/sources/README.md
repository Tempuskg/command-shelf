# Raw Sources

This directory contains raw source documents that feed the wiki. These files are **immutable** — the LLM reads from them but never modifies them.

## Sources

| File | Type | Ingested | Description |
|---|---|---|---|
| [PLAN.md](../../PLAN.md) | Project blueprint | 2026-04-15 | Original project plan — architecture, phases, decisions, open-source strategy |

## Adding Sources

To add a new source:
1. Place the file in this directory (or link to it if it lives elsewhere in the repo).
2. Ask the LLM to ingest it — this will create/update wiki pages and log the activity.
3. Do not modify source files after ingestion. If the source is updated, re-ingest it.
