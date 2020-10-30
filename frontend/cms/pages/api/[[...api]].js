import { createProxyMiddleware } from "http-proxy-middleware";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const proxy = createProxyMiddleware({
  target: process.env.HAV_URL,
  pathRewrite: { "^/api": "/d/api" },
  ws: true,
  // changeOrigin: true,
});

export default proxy;
