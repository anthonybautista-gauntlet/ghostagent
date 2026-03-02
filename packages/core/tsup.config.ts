import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: 'src/lib/index.ts'
  },
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js'
    };
  },
  outDir: 'dist',
  sourcemap: true,
  target: 'es2022',
  tsconfig: './tsconfig.build.json'
});
