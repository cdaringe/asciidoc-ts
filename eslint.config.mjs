import typescriptEslint from "@typescript-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";
import sortKeysTs from "eslint-plugin-typescript-sort-keys";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:typescript-sort-keys/recommended"
  ),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "unused-imports": unusedImports,
    },

    languageOptions: {
      parser: tsParser,
    },

    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      }],

      "sort-keys": "off",
          "typescript-sort-keys/interface": "error",
    "typescript-sort-keys/string-enum": "error",

      semi: ["error", "always"],
      "no-useless-escape": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
