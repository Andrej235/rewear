import globals from "globals";
import { config as reactPreset } from "./react.js";

const ignoreConfig = {
  ignores: ["**/vite.config.ts", "**/node_modules/**", "**/dist/**"],
};

const viteConfig = {
  files: ["**/*.{ts,tsx}"],

  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.es2021,
    },
  },

  rules: {
    /* -------------------- Vite env -------------------- */

    "no-restricted-globals": [
      "error",
      {
        name: "process",
        message: "Vite runs in the browser. Use import.meta.env instead.",
      },
    ],

    "no-restricted-syntax": [
      "error",
      {
        selector: "MemberExpression[object.name='process']",
        message: "Use import.meta.env instead of process.env in Vite",
      },
    ],
  },
};

export const config = [ignoreConfig, ...reactPreset, viteConfig];
