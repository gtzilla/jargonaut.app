module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'plugin:react/recommended',
    'semistandard'
  ],
  settings:{
    react:{
      version:'detect'
    }
  },
  globals: {
    "_": 'readonly',
    React: 'readonly',
    ReactDOM: 'readonly',
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  rules: {
  }
}
