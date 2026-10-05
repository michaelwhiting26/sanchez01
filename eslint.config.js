// @ts-check
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "prototype/**",
      "specs/**",
      "media-assets/**",
      "media-scrape/**",
      "apps/web/.next/**",
      "apps/web/next-env.d.ts",
      "apps/web/playwright-report/**",
      "apps/web/test-results/**",
      "apps/web/.turbo/**",
      // Served as-is to the browser (prototype-era viewer scripts and a prebuilt carousel bundle); not compiled or imported by the app.
      "apps/web/public/**",
      // A separate Figma plugin with its own package.json and runtime (Figma sandbox, CommonJS); not part of the web app. Tracked as debt.
      "tools/figma-plugin/**",
      // Generated build stages and checkpoints of the character pipeline (not source).
      "build/**",
      // macOS automation scripts (JXA: ObjC and $ are globals of that runtime), run by hand with osascript; not part of the web app.
      "tools/runner/character/tools/*.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      eqeqeq: ["error", "always"],
    },
  },
  {
    // The web app's tsconfig.json leaves tests out (so `next build` on Vercel does not need vitest); tsconfig.typecheck.json includes them.
    files: ["apps/web/src/**/*.test.ts"],
    languageOptions: { parserOptions: { projectService: false, project: ["apps/web/tsconfig.typecheck.json"], tsconfigRootDir: import.meta.dirname } },
  },
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  prettier,
);
