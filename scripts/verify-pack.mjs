#!/usr/bin/env node
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const scriptPath = fileURLToPath(import.meta.url);
const workspaceRoot = resolve(scriptPath, '..', '..');

async function assertFileExists(path, description) {
  try {
    await access(path, constants.F_OK);
  } catch {
    throw new Error(`Missing ${description}: ${path}`);
  }
}

async function runCommand({ command, args, cwd }) {
  await execFileAsync(command, args, {
    cwd,
    env: process.env,
    stdio: 'pipe'
  });
}

async function runNodeImport({ cwd, specifier }) {
  await runCommand({
    command: 'node',
    args: [
      '-e',
      `import('${specifier}').then(()=>process.exit(0)).catch((error)=>{console.error(error);process.exit(1);});`
    ],
    cwd
  });
}

async function verifyUiPackageFiles({ scratchDirectoryPath }) {
  const uiPackagePath = resolve(
    scratchDirectoryPath,
    'node_modules',
    '@ghostagent',
    'ui',
    'package.json'
  );
  const uiPackageContent = await readFile(uiPackagePath, 'utf8');
  const uiPackage = JSON.parse(uiPackageContent);
  const typesPath = uiPackage?.exports?.['.']?.types;
  const defaultPath = uiPackage?.exports?.['.']?.default;

  if (!typesPath || !defaultPath) {
    throw new Error(
      'Invalid @ghostagent/ui exports. Expected "." to include both "types" and "default" conditions.'
    );
  }

  await assertFileExists(
    resolve(scratchDirectoryPath, 'node_modules', '@ghostagent', 'ui', typesPath),
    '@ghostagent/ui type declaration target'
  );
  await assertFileExists(
    resolve(
      scratchDirectoryPath,
      'node_modules',
      '@ghostagent',
      'ui',
      defaultPath
    ),
    '@ghostagent/ui module target'
  );
}

async function main() {
  const tarballs = [
    'ghostagent-core-0.1.0.tgz',
    'ghostagent-ui-0.1.0.tgz',
    'ghostagent-evals-0.1.0.tgz'
  ];

  for (const tarball of tarballs) {
    await assertFileExists(
      resolve(workspaceRoot, tarball),
      `tarball ${tarball} (run pack scripts first)`
    );
  }

  const scratchDirectoryPath = await mkdtemp(
    resolve(tmpdir(), 'ghostagent-pack-verify-')
  );

  try {
    await runCommand({
      command: 'npm',
      args: ['init', '-y'],
      cwd: scratchDirectoryPath
    });

    await runCommand({
      command: 'npm',
      args: [
        'install',
        resolve(workspaceRoot, 'ghostagent-core-0.1.0.tgz'),
        resolve(workspaceRoot, 'ghostagent-ui-0.1.0.tgz'),
        resolve(workspaceRoot, 'ghostagent-evals-0.1.0.tgz')
      ],
      cwd: scratchDirectoryPath
    });

    await runNodeImport({ cwd: scratchDirectoryPath, specifier: '@ghostagent/core' });
    await runNodeImport({
      cwd: scratchDirectoryPath,
      specifier: '@ghostagent/evals'
    });
    await runNodeImport({
      cwd: scratchDirectoryPath,
      specifier: '@ghostagent/evals/runners/run-eval-dataset'
    });

    await assertFileExists(
      resolve(
        scratchDirectoryPath,
        'node_modules',
        '@ghostagent',
        'core',
        'bin',
        'ghostagent-init.mjs'
      ),
      '@ghostagent/core CLI binary'
    );
    await assertFileExists(
      resolve(
        scratchDirectoryPath,
        'node_modules',
        '@ghostagent',
        'core',
        'prisma',
        'schema.chat-session.prisma'
      ),
      '@ghostagent/core prisma asset'
    );
    await assertFileExists(
      resolve(
        scratchDirectoryPath,
        'node_modules',
        '@ghostagent',
        'core',
        'scaffolds',
        'api',
        'endpoints',
        'ai',
        'ai.module.ts'
      ),
      '@ghostagent/core scaffold asset'
    );

    await assertFileExists(
      resolve(
        scratchDirectoryPath,
        'node_modules',
        '@ghostagent',
        'evals',
        'dist',
        'staged',
        'scenarios.yaml'
      ),
      '@ghostagent/evals staged scenarios asset'
    );
    await assertFileExists(
      resolve(
        scratchDirectoryPath,
        'node_modules',
        '@ghostagent',
        'evals',
        'dist',
        'dataset',
        'ghostagent-eval-cases.json'
      ),
      '@ghostagent/evals dataset asset'
    );

    await verifyUiPackageFiles({ scratchDirectoryPath });
    console.log('verify:pack passed');
  } finally {
    await rm(scratchDirectoryPath, { force: true, recursive: true });
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown verify error';
  console.error(`verify:pack failed: ${message}`);
  process.exit(1);
});
