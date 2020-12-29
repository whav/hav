const { createProxyMiddleware } = require("http-proxy-middleware");

export const config = {
  api: {
    bodyParser: false,
  },
};

export default createProxyMiddleware({
  target: process.env.HAV_URL,
  pathRewrite: { "^/api/rest/public/": "/d/api/public/" },
  changeOrigin: true,
});
