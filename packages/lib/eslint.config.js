import { config } from "@repo/eslint-config/react";

/** @type {import("eslint").Linter.Config} */
export default [
  {
    // auto-generated API spec file, only used for type definitions
    ignores: ["**/api-spec.ts"],
  },
  ...config,
];
