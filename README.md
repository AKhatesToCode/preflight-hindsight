# Preflight

**Preflight** is an institutional-memory risk judge. Before an engineering change is made, it checks the plan against an organization's remembered failures, counter-examples, and lessons using Hindsight, then uses an LLM to explain the evidence and recommend concrete actions.

## Stack

- TypeScript + Node.js
- Express
- Hindsight Cloud (`@vectorize-io/hindsight-client`) for long-term organizational memory
- Groq for structured reasoning and explanation
- Static browser UI served by Express

## Setup

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure credentials

Copy `.env.example` to `.env` and fill in:

- `HINDSIGHT_API_KEY` — Hindsight Cloud API key
- `HINDSIGHT_BANK_ID` — memory bank used by Preflight
- `GROQ_API_KEY` — Groq API key

Never commit `.env`.

### 3. Run

```bash
npm start
```

Then open http://localhost:3000.

For development:

```bash
npm run dev
```

### 4. Load the demo history

Open **Load company history** in the UI. This retains the synthetic Helix Freight failure/counter-example records into the configured Hindsight memory bank.

## How the memory loop works

1. A proposed engineering plan is converted into trigger conditions.
2. Hindsight recalls relevant historical experience.
3. Groq judges the plan against recalled failures and counter-evidence.
4. The user records whether they followed the warning and what happened.
5. That outcome is retained in Hindsight and can influence later preflight checks.

The key product behavior is therefore **experience → lesson → future preflight → outcome → new experience**, rather than simple document search.

## Security

API keys are read from environment variables at runtime. Do not paste keys into source files, screenshots, commits, or chat messages.
