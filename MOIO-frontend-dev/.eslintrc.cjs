module.exports = {
  root: true,
  env: {
    node: true
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  plugins: ['filename-rules'],
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue/vue3-recommended',
  ],
  ignorePatterns: ['.*'],
  rules: {
    semi: ['error', 'never'],
    quotes: 'off', // ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }]
    'comma-dangle': ['warn', 'always-multiline'],
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
    'no-console': 'off',
    'no-debugger': 'warn',
    'camelcase':'off',
    'no-empty': 'off',
    'no-unused-vars': 'off',
    'no-multiple-empty-lines': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'vue/no-v-html': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/attribute-hyphenation': 'warn',
    'vue/attributes-order': 'warn',
    'vue/max-attributes-per-line': 'off',
    'vue/no-confusing-v-for-v-if': 'off',
    'vue/order-in-components': 'warn',
    'vue/prop-name-casing': 'warn',
    'vue/no-dupe-keys': ['error', {
      groups: []
    }],
    'vue/no-multiple-template-root': 'off'
  }
}
