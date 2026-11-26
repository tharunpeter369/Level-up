import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/node_modules/", "**/dist/", "**/coverage/", "**/.next/", "**/next-env.d.ts"] },
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
    // Frontend: Next.js rules (e.g. <Link> for internal pages) and the rules of hooks.
    files: ["apps/web/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended],
    plugins: { "@next/next": nextPlugin },
    rules: { ...nextPlugin.configs["core-web-vitals"].rules },
    settings: { next: { rootDir: "apps/web/" } },
  },
  {
    files: ["**/*.js"],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
