import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        // jQuery
        $: "readonly",
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        FileReader: "readonly",
        localStorage: "readonly",
        // Custom globals from functions.js
        advntx: "writable",
        isEmpty: "readonly",
        stringEquals: "readonly",
        g_ver: "readonly",
      },
    },
    rules: {
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-var": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
      "no-useless-catch": "error",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
