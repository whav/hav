const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  content: [
    // js templates
    "./src/mdx/",
    // app templates
    "../**/templates/**/*.html",
    // project template dir
    "../../templates/**/*.html",
  ],

  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "93ch",
          },
        },
      },
      textColor: {
        orange: "#e65825",
      },
    },

    fontFamily: {
      sans: [
        "DejaVu Sans Condensed",
        "Noto Sans",
        ...defaultTheme.fontFamily.sans,
      ],
      serif: ["Noto Serif", ...defaultTheme.fontFamily.serif],
    },
  },
  // variants: {
  //   extend: {},
  // },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
