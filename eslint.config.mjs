import pluginVue from 'eslint-plugin-vue';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(...pluginVue.configs['flat/strongly-recommended'])
  .override('nuxt/rules', {
    rules: {
      // Toujours un ";" en fin d'instruction
      '@stylistic/semi': ['error', 'always'],
      // Toujours des accolades (loops, if, else...)
      'curly': ['error', 'all'],
    },
  });
