import js from "@eslint/js";
import globals from "globals";

import { plugins, sourceRules } from "./eslint.config.base.mjs";

export default [
  {
    ignores: ["node_modules/**", "swatches/**"],
  },
  js.configs.recommended,
  // The CLI the action installs and runs. Node rather than browser globals:
  // it reads argv, writes files and exits with a status. Source, not tooling:
  // this file is what the action ships.
  {
    files: ["*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
      },
      sourceType: "module",
    },
    plugins,
    rules: sourceRules,
  },
];
