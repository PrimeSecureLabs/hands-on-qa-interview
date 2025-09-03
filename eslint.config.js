// eslint-disable-next-line @typescript-eslint/no-var-requires
const js = require('@eslint/js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const typescriptParser = require('@typescript-eslint/parser');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const prettier = require('eslint-plugin-prettier');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Sequelize: 'readonly',
      },
    },
    plugins: {
      prettier: prettier,
    },
    rules: {
      'prettier/prettier': 'error',

      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_|^Sequelize$',
          varsIgnorePattern: '^_|^Sequelize$',
        },
      ],

    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier: prettier,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_|^error$',
          varsIgnorePattern: '^_|^error$',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-undef': 'off',

    },
  },
  {
    files: ['src/migrations/**/*.js', 'src/seeders/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.config.js',
      '*.config.mts',
      '*.config.cjs',
      'eslint.config.js',
      'vitest.config.mts',
      'commitlint.config.cjs',
    ],
  },
];
