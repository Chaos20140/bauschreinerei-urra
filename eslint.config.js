import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

/**
 * Bewusst schlank gehalten — die Site ist eine kleine Marketing-App, kein
 * Framework. Die drei Regelsätze decken genau die Fehlerklassen ab, die hier
 * real aufgetreten sind: vergessene Effect-Cleanups (react-hooks), ungültige
 * Interaktions-/Listen-Verschachtelung (jsx-a11y) und ungenutzte Variablen.
 */
export default tseslint.config(
  { ignores: ['dist', 'node_modules', '*.tsbuildinfo'] },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Erzwingt, dass gar nicht erst wieder ein `any` einzieht.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  {
    files: ['tools/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
  }
);
