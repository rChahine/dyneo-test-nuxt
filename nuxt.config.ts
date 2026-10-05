import tailwindcss from '@tailwindcss/vite';
import typia from '@typia/unplugin/vite';

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@pinia/nuxt'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  routeRules: {
    '/': { redirect: '/logs-dashboard' },
  },
  compatibilityDate: '2025-07-15',
  vite: {
    plugins: [typia(), tailwindcss()],
  },
  typescript: {
    typeCheck: true,
  },
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: true,
        commaDangle: 'always-multiline',
        braceStyle: '1tbs',
        arrowParens: true,
      },
    },
  },
});
