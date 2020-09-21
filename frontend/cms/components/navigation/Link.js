import React from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { pathToRegexp } from "path-to-regexp";

const Link = ({
  children,
  activeClassName = "active",
  exact = true,
  ...props
}) => {
  const { asPath, pathname } = useRouter();

  const { href } = props;

  let className = children.props.className || "";

  const isActive = pathToRegexp(href, [], {
    sensitive: true,
    end: !!exact,
  }).test(asPath);

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
