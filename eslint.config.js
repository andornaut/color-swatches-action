import js from "@eslint/js";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sortDestructureKeys from "eslint-plugin-sort-destructure-keys";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "swatches/**"],
  },
  js.configs.recommended,
  // The CLI the action installs and runs. Node rather than browser globals:
  // it reads argv, writes files and exits with a status.
  {
    files: ["*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
      },
      sourceType: "module",
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      "sort-destructure-keys": sortDestructureKeys,
    },
    rules: {
      "max-len": ["error", { code: 120 }],
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
      "sort-destructure-keys/sort-destructure-keys": "error",
    },
  },
];
