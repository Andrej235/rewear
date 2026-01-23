import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";
import { config as base } from "./base.js";

const reactConfig = {
  files: ["**/*.{tsx,jsx}"],

  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2021,
    },
  },

  plugins: {
    react,
    "react-hooks": reactHooks,
    "jsx-a11y": jsxA11y,
  },

  settings: {
    react: {
      version: "detect",
    },
  },

  rules: {
    /* -------------------- React -------------------- */

    "react/react-in-jsx-scope": "off",
    "react/jsx-no-useless-fragment": "error",
    "react/jsx-key": "error",

    /* -------------------- Hooks -------------------- */

    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
  },
};

export const config = [...base, reactConfig];
