import next from "@next/eslint-plugin-next";
import globals from "globals";
import { config as reactPreset } from "./react.js";

const ignoreConfig = {
  ignores: ["**/.next/**", "**/node_modules/**", "**/dist/**"],
};

const nextConfig = {
  files: ["**/*.{ts,tsx}"],

  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.es2021,
    },
  },

  plugins: {
    "@next/next": next,
  },

  rules: {
    /* -------------------- Next.js -------------------- */

    ...next.configs.recommended.rules,
    ...next.configs["core-web-vitals"].rules,

    // Next.js requires default exports for pages and API routes, still prefer named exports everywhere else
    "import/no-default-export": "off",

    // Next relies heavily on prop spreading
    "react/jsx-props-no-spreading": "off",
  },
};

export const config = [ignoreConfig, ...reactPreset, nextConfig];
