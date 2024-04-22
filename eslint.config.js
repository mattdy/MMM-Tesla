export default [
  {
    files: ["**/*.js"],
    rules: {
      semi: "error",
      "no-unused-vars": "error"
    },
    languageOptions: {
      globals: {
        buildUrl: "readonly",
        config: "readonly",
        DataItemProvider: "readonly",
        empty: "readonly",
        Log: "readonly",
        MM: "readonly",
        Module: "readonly",
        moment: "readonly"
      }
    }
  }
];
