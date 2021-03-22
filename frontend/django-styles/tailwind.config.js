const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: [
    "../../backend/**/templates/**/*.html",
    // this is the directory used during the docker build
    "./templates/**/*.html",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    fontFamily: {
      sans: ["Noto Sans", ...defaultTheme.fontFamily.sans],
      serif: ["Noto Serif", ...defaultTheme.fontFamily.serif],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
