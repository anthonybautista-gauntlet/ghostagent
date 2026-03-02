import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: 'src/lib/index.ts'
  },
  format: ['esm'],
  outDir: 'dist',
  sourcemap: true,
  target: 'es2022',
  tsconfig: './tsconfig.build.json'
});
