import React from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";

const Link = ({
  children,
  activeClassName = "active",
  exact = true,
  ...props
}) => {
  const { asPath } = useRouter();
  // TODO: "as" vs "href", I think "as" has the correct url
  const { href, as } = props;
  const path = as || href;
  const is_active = exact ? asPath === path : path.startswith(asPath);

  let className = children.props.className || "";
  if (is_active) {
    className = `${className} ${activeClassName}`;
  }

  return (
    <NextLink {...props}>
      {React.cloneElement(children, { className })}
    </NextLink>
  );
};

export default Link;
