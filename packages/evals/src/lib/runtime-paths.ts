import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const libDirectoryPath = dirname(fileURLToPath(import.meta.url));
const parentDirectoryPath = resolve(libDirectoryPath, '..');

function findFirstExistingPath(paths: string[]) {
  return paths.find((path) => existsSync(path));
}

export function resolveEvalHistoryDirectoryPath() {
  return resolve(
    process.cwd(),
    process.env.AGENTFORGE_EVAL_HISTORY_DIR ?? 'eval-history'
  );
}

export function resolvePathFromLib({
  pathFromLib,
  overridePath
}: {
  pathFromLib: string;
  overridePath?: string;
}) {
  if (overridePath) {
    return resolve(process.cwd(), overridePath);
  }

  const selectedPath = findFirstExistingPath([
    resolve(libDirectoryPath, pathFromLib),
    resolve(parentDirectoryPath, pathFromLib)
  ]);

  return selectedPath ?? resolve(libDirectoryPath, pathFromLib);
}

export function resolveModuleUrlFromLib({
  modulePathFromLibWithoutExtension
}: {
  modulePathFromLibWithoutExtension: string;
}) {
  const candidateDirectories = [
    libDirectoryPath,
    parentDirectoryPath,
    resolve(libDirectoryPath, 'runners'),
    resolve(parentDirectoryPath, 'runners'),
    resolve(libDirectoryPath, 'scorers'),
    resolve(parentDirectoryPath, 'scorers'),
    resolve(libDirectoryPath, 'staged'),
    resolve(parentDirectoryPath, 'staged'),
    resolve(libDirectoryPath, 'dataset'),
    resolve(parentDirectoryPath, 'dataset')
  ];
  const candidatePaths = candidateDirectories.flatMap((directoryPath) => [
    resolve(directoryPath, `${modulePathFromLibWithoutExtension}.js`),
    resolve(directoryPath, `${modulePathFromLibWithoutExtension}.ts`)
  ]);
  const selectedPath = findFirstExistingPath(candidatePaths);

  if (!selectedPath) {
    throw new Error(
      `Module path not found for ${modulePathFromLibWithoutExtension}`
    );
  }

  return pathToFileURL(selectedPath).href;
}
