import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores(['.next/**', '.test-build/**', 'out/**', 'build/**', 'next-env.d.ts']),
  { files: ['test/*.cjs', 'scripts/*.cjs'], rules: { '@typescript-eslint/no-require-imports': 'off' } },
]);
