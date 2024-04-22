import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,

   {
       rules: {
           "no-unused-vars": "warn",
           "no-undef": "warn"
       },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2021,

        buildUrl: "readonly",
        config: "readonly",
        DataItemProvider: "readonly",
        empty: "readonly",
        Log: "readonly",
        MM: "readonly",
        module: "readonly",
        moment: "readonly"
      }
    }
   }
];
