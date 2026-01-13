export default [
  {
    files: ["**/*.{js,jsx}", "**/*.js", "**/*.jsx"],
    extends: [
      "react-app",
      "eslint:recommended"
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
    }
  }
];