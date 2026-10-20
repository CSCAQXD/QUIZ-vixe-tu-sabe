const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    {
        ignores: ["coverage/**", "generated/**", "node_modules/**"],
    },
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "no-console": "off",
            "no-unused-vars": ["error", { ignoreRestSiblings: true }],
        },
    },
    {
        files: ["test/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
];
