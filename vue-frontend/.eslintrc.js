module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    'plugin:vue/recommended', // Use this if you are using Vue.js 2.x.
    "plugin:vue/strongly-recommended",
    "plugin:vue/recommended"
  ],
  rules: {

    'vue/no-unused-vars': 'error',
    semi: ['error', 'always']
  }
}
