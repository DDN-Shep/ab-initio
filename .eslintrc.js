module.exports = {
  'extends': 'eslint:recommended',
  "env": {
    "browser": 1,
    "jquery": 1
  },
  'globals': {
    'module': true,
    'moment': true,
    'page': true,
    'require': true,
    'toastr': true
  },
  'rules': {
    // Enable additional rules
    'quotes': [2, 'single'],
    'semi': [2, 'always'],

    // Override default options for rules from base configurations
    'comma-dangle': [2, 'never'],
    'no-cond-assign': [2, 'always'],
    'no-console': 1,
    "no-unused-vars": ["error", { "vars": "all", "args": "none" }]

    // Disable rules from base configurations
  }
}
