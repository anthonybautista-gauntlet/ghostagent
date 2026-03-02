import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

import type { EvalApiResponse, EvalCase } from './run-eval-dataset';
import {
  resolveEvalHistoryDirectoryPath,
  resolveModuleUrlFromLib,
  resolvePathFromLib
} from './runtime-paths';

interface ReplayFixtureFile {
  fixtures: {
    case: EvalCase;
    response: EvalApiResponse;
  }[];
}

async function run() {
  const historyDirectoryPath = resolveEvalHistoryDirectoryPath();
  const packageFixturePath = resolvePathFromLib({
    pathFromLib: 'staged/golden-deterministic-fixtures.json'
  });
  const fixturePathCandidates = [
    process.env.AGENTFORGE_REPLAY_FIXTURE_PATH,
    resolve(historyDirectoryPath, 'replay/fixtures-latest.json'),
    packageFixturePath
  ]
    .filter(Boolean)
    .map((fixturePath) => {
      if (isAbsolute(fixturePath as string)) {
        return fixturePath as string;
      }

      return resolve(process.cwd(), fixturePath as string);
    });
  const fixturePath = fixturePathCandidates.find((candidatePath) =>
    existsSync(candidatePath)
  );
  const latencyThresholdMs = Number(
    process.env.AGENTFORGE_EVAL_MAX_LATENCY_MS ?? '15000'
  );
  if (!fixturePath) {
    throw new Error(
      `Replay fixture not found. Checked: ${fixturePathCandidates.join(', ')}`
    );
  }
  const scorerModuleUrl = resolveModuleUrlFromLib({
    modulePathFromLibWithoutExtension: 'scorers/ghostagent-scorer'
  });
  const { scoreCase } = (await import(scorerModuleUrl)) as {
    scoreCase: (args: {
      latencyThresholdMs: number;
      response: EvalApiResponse;
      testCase: EvalCase;
    }) => { checks: Record<string, boolean>; pass: boolean };
  };

  const fixtureFile = JSON.parse(
    await readFile(fixturePath, 'utf8')
  ) as ReplayFixtureFile;
  const perCase = fixtureFile.fixtures.map((fixture) => {
    const score = scoreCase({
      latencyThresholdMs,
      response: fixture.response,
      testCase: fixture.case
    });
    const checkValues = Object.values(score.checks);
    const consistencyRatio =
      checkValues.filter(Boolean).length / Math.max(checkValues.length, 1);

    return {
      caseId: fixture.case.id,
      checks: score.checks,
      consistencyRatio,
      pass: score.pass
    };
  });
  const passRate =
    perCase.filter((item) => item.pass).length / Math.max(perCase.length, 1);
  const consistencyRate =
    perCase.reduce((total, item) => total + item.consistencyRatio, 0) /
    Math.max(perCase.length, 1);

  console.log(
    JSON.stringify(
      {
        consistencyRate,
        fixturePath,
        passRate,
        perCase,
        total: perCase.length
      },
      null,
      2
    )
  );
}

run().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Unknown replay run error';
  console.error(message);
  process.exit(1);
});
