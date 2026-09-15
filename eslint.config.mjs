import globals from 'globals'
import neostandard from 'neostandard'

export default [
  ...neostandard(),

  // Front-end files, loaded into the browser by MagicMirror as plain scripts
  {
    files: ['MMM-Tesla.js', 'DataItemProvider.js', 'dataitems/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
        buildUrl: 'readonly',
        DataItemProvider: 'readonly',
        Log: 'readonly',
        MM: 'readonly',
        Module: 'readonly',
        moment: 'readonly'
      }
    }
  },

  // Back-end files, run by MagicMirror within Node.js
  {
    files: ['node_helper.js', 'DataSource.js', 'datasources/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs'
    }
  }
]
