const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
});

const build_redirects = (path) => {
  return [
    {
      source: `/${path}/:path*`,
      destination: `http://127.0.0.1:8000/${path}/:path*`,
    },
    {
      source: `/${path}/:path*/`,
      destination: `http://127.0.0.1:8000/${path}/:path*/`,
    },
  ];
};

const config = withMDX({
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
  async rewrites() {
    return [
      ...build_redirects("d"),
      ...build_redirects("archive"),
      ...build_redirects("account"),
      ...build_redirects("media"),
      ...build_redirects("static"),
    ];
  },
});

module.exports = config;
