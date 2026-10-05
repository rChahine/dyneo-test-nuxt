import { fileURLToPath } from 'node:url';
import typia from '@typia/unplugin/vite';
import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  plugins: [typia()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
  },
});
