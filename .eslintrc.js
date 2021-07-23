module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "arrow-parents": [0, "as-needed"],
    "require-jsdoc": "off",
    "brace-style": [0, "allman", { allowSingleLine: true }],
    "max-len": ["error", { code: 300 }],
    "object-curly-spacing": ["error", "always"],
    "no-unused-vars": "warn",
  },
};
