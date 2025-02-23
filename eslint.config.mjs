// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.strict,
    {
        rules: {
            curly: "error",
            eqeqeq: "error",
        },
    },
    {
        ignores: ["**/dist/", "**/node_modules/", "**/tests/"],
    },
    {
        files: ["apps/**/*.ts"],
    }
);
