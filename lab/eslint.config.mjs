import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import labCustomPlugin from "../tooling/eslint/lab-custom-plugin.js";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "lab-custom": labCustomPlugin,
    },
    rules: {
      "lab-custom/no-transition-all": "warn",
    },
  },
]);

export default eslintConfig;
