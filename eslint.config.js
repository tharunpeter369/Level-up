import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/node_modules/", "**/dist/", "**/coverage/", "**/.next/"] },
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      // Fastify plugins and hooks are async by convention even without an `await`.
      // The rule that catches real bugs (a *forgotten* await) is no-floating-promises, still on.
      "@typescript-eslint/require-await": "off",
      "no-console": "warn",
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
