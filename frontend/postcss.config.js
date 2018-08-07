module.exports = {
  plugins: [
    require("postcss-import")({}),
    require("postcss-url")(),
    require("postcss-preset-env")({
      browsers: ["last 2 versions", "> 5%"]
    }),
    require("postcss-custom-properties")()
  ]
};
