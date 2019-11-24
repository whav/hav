import React from "react";
import { action } from "@storybook/addon-actions";
import { Button } from "@storybook/react/demo";

import Wrapper from "../layout/wrapper";
import Main, { StickyHeaderMain } from "../layout/main";
import LoremIpsum from "../dev/loremipsum";

export default {
  title: "Layouts"
};

const Nav = () => {
  return (
    <ul>
      <li>One</li>
      <li>Two</li>
    </ul>
  );
};

const SBWrapper = ({ children }) => <Wrapper nav={<Nav />}>{children}</Wrapper>;

const DummyText = ({ paragraphs = 10 }) => (
  <LoremIpsum paragraphs={paragraphs} />
);
const Header = () => <h1>I am the header</h1>;
const Footer = () => <h3>I am the footer</h3>;

export const main = () => {
  return (
    <SBWrapper>
      <Main header={<Header />} footer={<Footer />}>
        <LoremIpsum paragraphs={10} />
      </Main>
    </SBWrapper>
  );
};

export const stickyHeader = () => {
  return (
    <SBWrapper>
      <StickyHeaderMain header={<Header />} footer={<Footer />}>
        <DummyText />
      </StickyHeaderMain>
    </SBWrapper>
  );
};
