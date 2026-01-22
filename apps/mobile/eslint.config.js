import { config } from "@repo/eslint-config/vite";

/** @type {import("eslint").Linter.Config} */
export default [
  {
    // generated and copied js files from /dist
    ignores: ["**/android/**", "**/ios/**"],
  },
  ...config,
];
