import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

const baseConfig = {
  files: ["**/*.{ts,tsx}"],

  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: "./tsconfig.json",
      ecmaVersion: "latest",
      sourceType: "module",
    },
    globals: {
      ...globals.es2021,
      ...globals.node,
    },
  },

  plugins: {
    "@typescript-eslint": tseslint,
    import: importPlugin,
  },

  rules: {
    /* -------------------- TypeScript strictness -------------------- */

    "@typescript-eslint/no-explicit-any": "error",

    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],

    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-ignore": "allow-with-description",
      },
    ],

    // Disallow empty object types like '{}', use 'Record<string, unknown>' or 'object' instead
    "@typescript-eslint/no-empty-object-type": "error",

    

    "@typescript-eslint/no-misused-promises": "off",

    /* -------------------- Imports -------------------- */

    "import/order": "off",

    "import/no-default-export": "error",

    /* -------------------- General -------------------- */

    "no-debugger": "error",
    eqeqeq: "error",
  },
};

export const config = [js.configs.recommended, baseConfig];
