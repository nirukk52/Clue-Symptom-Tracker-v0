# CLAUDE.md - Project Intelligence for Clue Symptom Tracker

> This file provides context for AI assistants working on this codebase.
> Read this first before making changes.

## Project Overview

Clue is a **prediction-first symptom tracker** for people with chronic conditions (endometriosis, PCOS, long COVID, fibromyalgia, etc.).

## onboarding (Screen 1–4) is now JSON-driven + UI folder cleanup

How to A/B test now
Swap catalog.json and/or modal_onboarding.v1.json (keep IDs stable), and the UI will follow without code changes.

Every user interaction should be written to *supabase*

**Core Documents**:

- Product vision: [`context/Product-Spec.md`](./context/Product-Spec.md)
- Agent architecture: [`context/Agent-Architecture-Technical.md`](./context/Agent-Architecture-Technical.md)
- Constitution (SSOT): [`.specify/memory/constitution.md`](./.specify/memory/constitution.md)
- Design system: [`.claude-skills/frontend-design/SKILL.md`](./.claude-skills/frontend-design/SKILL.md)
- **Marketing validation:** [`web-landing/v2/PREDICTION-CAMPAIGN-MASTER.md`](./web-landing/v2/PREDICTION-CAMPAIGN-MASTER.md)


---

## Technical Stack (Decided)

### Core Framework

| Layer      | Technology                                                  | Notes                                 |
| ---------- | ----------------------------------------------------------- | ------------------------------------- |
| Framework  | **Expo SDK 52** + **Expo Router v4**                        | File-based routing                    |
| Language   | **TypeScript (strict mode)**                                | Additional rules for agent/data layer |
| Styling    | **NativeWind v4** (Tailwind for RN)                         | Custom components, no UI libraries    |
| State      | **Zustand** (app state) + **PowerSync** (data queries)      | Separate concerns                     |
| Animations | **Moti** (wraps Reanimated)                                 | Gentle transitions                    |
| Storage    | **MMKV** (fast KV) + **PowerSync SQLite** (structured data) | Local-first                           |

### Data Layer

| Component  | Technology                                | Notes                                         |
| ---------- | ----------------------------------------- | --------------------------------------------- |
| Local DB   | **PowerSync SQLite**                      | Offline-first, reactive queries               |
| ORM        | **Raw SQL → Drizzle ORM** (migrate later) | Start simple, add type-safety as it grows     |
| Cloud Sync | **PowerSync + Supabase**                  | Background sync, no loading UI                |
| Auth       | **Supabase Auth**                         | Anonymous auth for onboarding → convert later |

### Agent Pipeline

| Component     | Approach              | Notes                                  |
| ------------- | --------------------- | -------------------------------------- |
| Execution     | **Client-side (90%)** | Local-first, evidence-grounded         |
| Chat UI       | **Vercel AI SDK**     | For message generation + summarization |
| First Message | **Template-based**    | Deterministic, no LLM call             |
| Core Pipeline | **Deterministic**     | Named queries, golden fixtures         |

---

## Files to Read First

1. [`web-landing/v2/PREDICTION-CAMPAIGN-MASTER.md`](./web-landing/v2/PREDICTION-CAMPAIGN-MASTER.md) - **Validated product direction** (read this to understand what users want)
2. [`.specify/memory/constitution.md`](./.specify/memory/constitution.md) - Architectural decisions
3. [`specs/1-onboarding-flow/spec.md`](./specs/1-onboarding-flow/spec.md) - Current feature spec
4. [`.claude-skills/frontend-design/SKILL.md`](./.claude-skills/frontend-design/SKILL.md) - Design system
5. [`context/Agent-Architecture-Technical.md`](./context/Agent-Architecture-Technical.md) - Agent pipeline

Just go through this doc
