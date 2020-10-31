const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
});

module.exports = withMDX({
  pageExtensions: ["js", "jsx", "md", "mdx"],
  trailingSlash: true,
  images: {
    domains: [
      "hav2.aussereurop.univie.ac.at",
      "hav.aussereurop.univie.ac.at",
      "hav.univie.ac.at",
      "localhost",
      "127.0.0.1",
    ],
  },
});
