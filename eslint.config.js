import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    ignores: [
      "dist/",
      "dist-d2l/",
      "public/content/",
      "public/runtime/*.js",
      "scripts/templates/",
      "test-results/",
      "playwright-report/",
    ],
  },
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": ["error", { ignoreRestSiblings: true, varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["src/**/*.{js,jsx}"],
    ...react.configs.flat.recommended,
    ...react.configs.flat["jsx-runtime"],
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      "react/prop-types": "off",
    },
  },
  {
    files: ["scripts/**/*.{js,mjs}", "tests/**/*.js", "*.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },
  {
    // Hand-written runtime wrappers loaded in the result iframe when the inspector is on.
    files: ["public/runtime/wrap/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
  },
  {
    // The bridge parts are concatenated into one classic script inside the result iframe.
    files: ["src/runner/bridge/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: globals.browser,
    },
  },
];
