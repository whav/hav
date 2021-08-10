import React from "react";

import { render } from "react-dom";
import { getMDXComponent } from "mdx-bundler/client";
import { components } from "./components";

function getComponent({ code, frontmatter }) {
  // const Component = React.useMemo(() => getMDXComponent(code), [code]);
  const Component = getMDXComponent(code);
  return <Component components={components} />;
}

console.log("MDX init...");

const mdxNodes = document.querySelectorAll(".mdx");

[...mdxNodes].forEach((e) => {
  const mdxNodes = e.querySelectorAll('script[type="custom/mdx"]');
  console.log(mdxNodes);
  [...mdxNodes].forEach((node) => {
    const container = document.createElement("div");
    node.insertAdjacentElement("afterend", container);
    const Component = getComponent({ code: node.textContent });
    console.log("Rendering mdx...", Component);
    render(Component, container);
  });
});
