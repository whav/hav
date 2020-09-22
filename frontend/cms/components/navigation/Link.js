import React from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { pathToRegexp } from "path-to-regexp";

import memoize from "lodash/memoize";

const toRegexp = memoize(
  (href, exact = true) =>
    pathToRegexp(href, [], {
      sensitive: true,
      end: !!exact,
    }),
  // a resolver function to generate a cache key
  // from the 2 args
  (...args) => args.join("||")
);

const Link = ({
  children,
  activeClassName = "active",
  exact = true,
  additionalPaths = [],
  ...props
}) => {
  const { asPath } = useRouter();

  const { href } = props;

  let className = children.props.className || "";

  let isActive = toRegexp(href, exact).test(asPath);

  if (!isActive && additionalPaths.length) {
    for (const path of additionalPaths) {
      const regexp = toRegexp(path, exact);
      if (regexp.test(asPath)) {
        isActive = true;
        break;
      }
    }
  }

  if (isActive) {
    className = `${className} ${activeClassName}`;
  }

  return (
    <NextLink {...props}>
      {React.cloneElement(children, { className })}
    </NextLink>
  );
};

export default Link;
