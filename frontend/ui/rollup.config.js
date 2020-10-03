import peerDepsExternal from "rollup-plugin-peer-deps-external";
import babel from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const packageJson = require("./package.json");

export default {
  input: "src/index.js",
  output: [
    {
      file: packageJson.main,
      format: "cjs",
      sourcemap: true,
      banner: "/* eslint-disable */",
    },
    // {
    //   file: packageJson.module,
    //   format: "esm",
    //   sourcemap: true,
    // },
  ],
  external: [/@babel\/runtime/],
  plugins: [
    peerDepsExternal(),
    nodeResolve(),
    babel({ babelHelpers: "runtime", skipPreflightCheck: true }),
  ],
};
