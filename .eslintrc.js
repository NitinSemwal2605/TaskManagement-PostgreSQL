

/* eslint-disable no-undef */

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended" // Enables eslint-plugin-prettier and displays Prettier errors as ESLint errors
  ],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": ["error"]
  }
};