module.exports = {
  plugins: [
    require("postcss-import")({}),
    require("postcss-url")(),
    require("postcss-preset-env")(),
    require("postcss-custom-properties")()
  ]
};
