import React from "react";

import * as Menu from "../components/navigation/main_menu";
import Wrapper from "../layout/wrapper";
import HAVLogo from "../images/hav.svg";
export default {
  title: "Main Menu",
  excludeStories: ["ExampleMenu"],
  // includeStories: ["simple", "withLinks"]
};

const menu_items = ["Entry A", "Entry B", "Entry C"];

const WrapMenu = ({ children }) => (
  <Wrapper logo_url={HAVLogo} nav={children}>
    <div>
      <p>I am the main content.</p>
      <p>I am of no interest for this example.</p>
    </div>
  </Wrapper>
);

export const simple = () => {
  return (
    <WrapMenu>
      <Menu.Nav>
        <Menu.NavGroup label="Menu Items">
          {menu_items.map((item) => (
            <span>{item}</span>
          ))}
        </Menu.NavGroup>
      </Menu.Nav>
    </WrapMenu>
  );
};

export const ExampleMenu = () => (
  <Menu.Nav>
    <Menu.NavGroup label="Menu Items">
      {menu_items.map((item) => (
        <a key={item} href={`#${item}`}>
          {item}
        </a>
      ))}
    </Menu.NavGroup>
  </Menu.Nav>
);

export const withLinks = () => {
  return (
    <WrapMenu>
      <ExampleMenu />
    </WrapMenu>
  );
};
