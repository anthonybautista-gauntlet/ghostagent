import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDirectory, '..');

async function copyRuntimeAssets() {
  await mkdir(resolve(packageRoot, 'dist', 'staged'), { recursive: true });
  await mkdir(resolve(packageRoot, 'dist', 'dataset'), { recursive: true });

  await cp(resolve(packageRoot, 'src', 'lib', 'staged'), resolve(packageRoot, 'dist', 'staged'), {
    recursive: true
  });
  await cp(
    resolve(packageRoot, 'src', 'lib', 'dataset'),
    resolve(packageRoot, 'dist', 'dataset'),
    {
      recursive: true
    }
  );
}

copyRuntimeAssets().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown copy error';
  console.error(`Failed to copy eval runtime assets: ${message}`);
  process.exit(1);
});
