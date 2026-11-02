// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // Guards against HTML entity bugs; React Native <Text> renders apostrophes literally.
      'react/no-unescaped-entities': 'off',
    },
  },
]);
