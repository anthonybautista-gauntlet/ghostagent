# GhostAgent Monorepo

This repository contains the extracted GhostAgent packages intended for npm publishing:

- `@ghostagent/core` - backend orchestration utilities, contracts, verifier, and init scaffolding assets.
- `@ghostagent/ui` - Angular chat UI component and API client token contract.
- `@ghostagent/evals` - eval runner library, scorer, dataset, and staged eval assets.

## Requirements

- Node.js `>=20`
- npm `>=10`

## Workspace layout

- `packages/core`
- `packages/ui`
- `packages/evals`

## Install

```bash
npm install
```

## Build

```bash
npm run build:core
npm run build:ui
npm run build:evals
npm run build
```

## Pack

```bash
npm run pack:core
npm run pack:ui
npm run pack:evals
```

## Notes

- `verify:pack` is scaffolded but currently a placeholder (`scripts/verify-pack.mjs`).
- This repo intentionally avoids client-side credential handling; eval and model keys must be provided server-side or via process environment.
