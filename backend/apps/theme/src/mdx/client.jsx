import React from "react";

import { render } from "react-dom";
import { getMDXComponent } from "mdx-bundler/client";

const mdxNodes = document.querySelectorAll(".mdx");

[...mdxNodes].forEach((parent) => {
  const mdxNodes = parent.querySelectorAll('script[type="custom/mdx"]');
  [...mdxNodes].forEach((node) => {
    const container = document.createElement("div");
    parent.replaceChildren(container);
    // const Component = getComponent({ code: node.textContent });
    const Component = getMDXComponent(node.textContent);
    console.log("Rendering mdx...", Component);
    render(<Component />, container);
  });
});
