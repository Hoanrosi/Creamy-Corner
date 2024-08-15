import globals from "globals";
import pluginJs from "@eslint/js";
import { Linter } from "eslint";

export default [
  pluginJs.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: globals.browser,
    },
    plugins: {
      import: "eslint-plugin-import",
      prettier: "eslint-plugin-prettier",
    },
    extends: [
      "eslint:recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:prettier/recommended",
    ],
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
      "import/no-unresolved": "error",
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx"],
        },
      },
    },
    env: {
      node: true,
      es6: true,
    },
  },
];
