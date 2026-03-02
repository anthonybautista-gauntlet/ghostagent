import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: 'src/lib/index.ts',
    'runners/generate-langsmith-failure-analysis':
      'src/lib/generate-langsmith-failure-analysis.ts',
    'runners/run-eval-dataset': 'src/lib/run-eval-dataset.ts',
    'runners/run-ghostagent-evals': 'src/lib/run-ghostagent-evals.ts',
    'runners/run-ghostagent-golden-deterministic':
      'src/lib/run-ghostagent-golden-deterministic.ts',
    'runners/run-ghostagent-replay-record':
      'src/lib/run-ghostagent-replay-record.ts',
    'runners/run-ghostagent-replay-run': 'src/lib/run-ghostagent-replay-run.ts',
    'runners/run-ghostagent-rubric': 'src/lib/run-ghostagent-rubric.ts',
    'runners/run-ghostagent-scenarios': 'src/lib/run-ghostagent-scenarios.ts',
    'runners/run-ghostagent-variants': 'src/lib/run-ghostagent-variants.ts',
    'scorers/ghostagent-scorer': 'src/lib/scorers/ghostagent-scorer.ts',
    'staged/load-yaml': 'src/lib/staged/load-yaml.ts'
  },
  format: ['esm'],
  outDir: 'dist',
  sourcemap: true,
  splitting: false,
  target: 'es2022',
  tsconfig: './tsconfig.build.json'
});
