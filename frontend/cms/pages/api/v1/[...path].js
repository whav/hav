import { createProxyMiddleware } from "http-proxy-middleware";
import { url } from "lib/graphql";

const proxy = createProxyMiddleware({
  target: url,
  pathRewrite: { "^/api/v1/": "/d/api/v1/" },
  // some other config
  ws: true, // proxy websockets
  changeOrigin: true,
});

export default proxy;
