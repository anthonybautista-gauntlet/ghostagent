# @ghost_agent/evals

Evaluation package for GhostAgent with programmatic APIs, runner entrypoints, and staged assets.

## What it exports

Public entrypoint: `src/lib/index.ts`

- `runEvalDataset` and related eval interfaces
- runtime path helpers (`resolveEvalHistoryDirectoryPath`, `resolvePathFromLib`, `resolveModuleUrlFromLib`)
- scorer (`scoreCase`)
- staged YAML loader (`loadYamlFile`)

Deep export for runner modules:

- `@ghost_agent/evals/runners/*`

These map to built files under `dist/runners/*`.

## Runtime assets included in package

- `dist/staged/*`
- `dist/dataset/*`

The build process copies staged and dataset assets from `src/lib` into `dist`.

## Running evals programmatically

```ts
import { runEvalDataset } from '@ghost_agent/evals';

const result = await runEvalDataset();
console.log(result.report);
```

## Environment variables used by `runEvalDataset`

- `AGENTFORGE_EVAL_API_URL` (required)
- `AGENTFORGE_EVAL_API_TOKEN` (required)
- `AGENTFORGE_EVAL_PASS_THRESHOLD` (optional, default `0.8`)
- `AGENTFORGE_EVAL_MAX_LATENCY_MS` (optional, default `15000`)
- `AGENTFORGE_EVAL_DATASET_PATH` (optional dataset override)
- `AGENTFORGE_EVAL_HISTORY_DIR` (optional history output dir, default `eval-history`)

## Security

- Keep API tokens in environment/secret managers.
- Do not embed auth tokens in frontend code or static assets.
