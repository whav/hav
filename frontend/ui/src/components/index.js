import React from "react";

import { Heading as Title } from "@theme-ui/components";

export const H1 = ({ children, ...props }) => <Title>{children}</Title>;
export const H2 = ({ children, ...props }) => (
  <Title as="h2" {...props}>
    {children}
  </Title>
);
export const H3 = ({ children, ...props }) => (
  <Title as="h3" {...props}>
    {children}
  </Title>
);
