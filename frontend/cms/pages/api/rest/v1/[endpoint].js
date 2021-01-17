const { createProxyMiddleware } = require("http-proxy-middleware");

export const config = {
  api: {
    bodyParser: false,
  },
};

export default createProxyMiddleware({
  target: process.env.HAV_URL,
  pathRewrite: { "^/api/rest/v1/": "/d/api/v1/" },
  changeOrigin: true,
});
