const { createProxyMiddleware } = require("http-proxy-middleware");

export default createProxyMiddleware({
  target: process.env.HAV_URL,
  changeOrigin: true,
  pathRewrite: { "^/api": "/d/api" },
  xfwd: true,
});

export const config = {
  api: {
    bodyParser: false, // enable POST requests
    externalResolver: true, // hide warning message
  },
};
