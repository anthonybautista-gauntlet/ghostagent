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

function toTarballFileName({ name, version }) {
  const normalizedName = name.replace('@', '').replace('/', '-');
  return `${normalizedName}-${version}.tgz`;
}

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
    '@ghost_agent',
    'ui',
    'package.json'
  );
  const uiPackageContent = await readFile(uiPackagePath, 'utf8');
  const uiPackage = JSON.parse(uiPackageContent);
  const typesPath = uiPackage?.exports?.['.']?.types;
  const defaultPath = uiPackage?.exports?.['.']?.default;

  if (!typesPath || !defaultPath) {
    throw new Error(
      'Invalid @ghost_agent/ui exports. Expected "." to include both "types" and "default" conditions.'
    );
  }

  await assertFileExists(
    resolve(scratchDirectoryPath, 'node_modules', '@ghost_agent', 'ui', typesPath),
    '@ghost_agent/ui type declaration target'
  );
  await assertFileExists(
    resolve(
      scratchDirectoryPath,
      'node_modules',
      '@ghost_agent',
      'ui',
      defaultPath
    ),
    '@ghost_agent/ui module target'
  );
}

async function readPackageManifest({ relativePath }) {
  const packageJsonPath = resolve(workspaceRoot, relativePath, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  return {
    name: packageJson.name,
    version: packageJson.version
  };
}

async function main() {
  const corePackage = await readPackageManifest({ relativePath: 'packages/core' });
  const uiPackage = await readPackageManifest({ relativePath: 'packages/ui' });
  const evalsPackage = await readPackageManifest({
    relativePath: 'packages/evals'
  });
  const tarballs = [
    toTarballFileName(corePackage),
    toTarballFileName(uiPackage),
    toTarballFileName(evalsPackage)
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
        resolve(workspaceRoot, toTarballFileName(corePackage)),
        resolve(workspaceRoot, toTarballFileName(uiPackage)),
        resolve(workspaceRoot, toTarballFileName(evalsPackage))
      ],
      cwd: scratchDirectoryPath
    });

    await runNodeImport({ cwd: scratchDirectoryPath, specifier: '@ghost_agent/core' });
    await runNodeImport({
      cwd: scratchDirectoryPath,
      specifier: '@ghost_agent/evals'
    });
    await runNodeImport({
      cwd: scratchDirectoryPath,
      specifier: '@ghost_agent/evals/runners/run-eval-dataset'
    });
    await runNodeImport({
      cwd: scratchDirectoryPath,
      specifier: '@ghost_agent/evals/runners/run-ghostagent-golden-deterministic'
    });

    await assertFileExists(
      resolve(
        scratchDirectoryPath,
        'node_modules',
        '@ghost_agent',
        'core',
        'bin',
        'ghostagent-init.mjs'
      ),
      '@ghost_agent/core CLI binary'
    );
    await assertFileExists(
      resolve(
        scratchDirectoryPath,
        'node_modules',
        '@ghost_agent',
        'core',
        'prisma',
        'schema.chat-session.prisma'
      ),
      '@ghost_agent/core prisma asset'
    );
    await assertFileExists(
      resolve(
        scratchDirectoryPath,
        'node_modules',
        '@ghost_agent',
        'core',
        'scaffolds',
        'api',
        'endpoints',
        'ai',
        'ai.module.ts'
      ),
      '@ghost_agent/core scaffold asset'
    );

    await assertFileExists(
      resolve(
        scratchDirectoryPath,
        'node_modules',
        '@ghost_agent',
        'evals',
        'dist',
        'staged',
        'scenarios.yaml'
      ),
      '@ghost_agent/evals staged scenarios asset'
    );
    await assertFileExists(
      resolve(
        scratchDirectoryPath,
        'node_modules',
        '@ghost_agent',
        'evals',
        'dist',
        'dataset',
        'ghostagent-eval-cases.json'
      ),
      '@ghost_agent/evals dataset asset'
    );
    await assertFileExists(
      resolve(
        scratchDirectoryPath,
        'node_modules',
        '@ghost_agent',
        'evals',
        'dist',
        'scorers',
        'ghostagent-scorer.js'
      ),
      '@ghost_agent/evals scorer runtime module'
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
