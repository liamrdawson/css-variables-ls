module.exports = {
    root: true,
    extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    plugins: ["@typescript-eslint", "prettier"],
    parser: "@typescript-eslint/parser",
    env: {
        node: true,
    },
    rules: {
        indent: 0,

        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "off",

        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "@typescript-eslint/ban-types": [
            1,
            {
                types: {
                    object: false,
                },
            },
        ],
        "@typescript-eslint/ban-ts-comment": [
            "error",
            {
                "ts-expect-error": "allow-with-description",
                "ts-ignore": true,
                "ts-nocheck": true,
                "ts-check": false,
                minimumDescriptionLength: 3,
            },
        ],
    },
};
