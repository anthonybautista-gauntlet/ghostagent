import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const libDirectoryPath = dirname(fileURLToPath(import.meta.url));

function resolveLibRootPath() {
  const hasSiblingAssets =
    existsSync(resolve(libDirectoryPath, 'staged')) &&
    existsSync(resolve(libDirectoryPath, 'dataset'));

  if (hasSiblingAssets) {
    return libDirectoryPath;
  }

  const parentDirectoryPath = resolve(libDirectoryPath, '..');
  const hasParentAssets =
    existsSync(resolve(parentDirectoryPath, 'staged')) &&
    existsSync(resolve(parentDirectoryPath, 'dataset'));

  if (hasParentAssets) {
    return parentDirectoryPath;
  }

  return libDirectoryPath;
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

  const libRootPath = resolveLibRootPath();
  return resolve(libRootPath, pathFromLib);
}

export function resolveModuleUrlFromLib({
  modulePathFromLibWithoutExtension
}: {
  modulePathFromLibWithoutExtension: string;
}) {
  const libRootPath = resolveLibRootPath();
  const candidatePaths = [
    resolve(libDirectoryPath, `${modulePathFromLibWithoutExtension}.ts`),
    resolve(libDirectoryPath, `${modulePathFromLibWithoutExtension}.js`),
    resolve(libRootPath, `${modulePathFromLibWithoutExtension}.ts`),
    resolve(libRootPath, `${modulePathFromLibWithoutExtension}.js`),
    resolve(libRootPath, 'runners', `${modulePathFromLibWithoutExtension}.ts`),
    resolve(libRootPath, 'runners', `${modulePathFromLibWithoutExtension}.js`)
  ];
  const selectedPath = candidatePaths.find((path) => existsSync(path));

  if (!selectedPath) {
    throw new Error(
      `Module path not found for ${modulePathFromLibWithoutExtension}`
    );
  }

  return pathToFileURL(selectedPath).href;
}
