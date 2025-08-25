module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["react", "react-hooks", "react-refresh"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",        // <- thêm cái này để bắt lỗi JSX/React
    // "plugin:jsx-a11y/recommended",   // <- khuyến nghị: bắt lỗi accessibility
    "eslint-config-prettier"           // tắt rule xung đột với Prettier
  ],
  settings: {
    react: { version: "detect" },
  },
  rules: {
    "react-refresh/only-export-components": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
}
