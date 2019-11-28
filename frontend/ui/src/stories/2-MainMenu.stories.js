import React from "react";

import Menu from "../components/navigation/main_menu";
import Wrapper from "../layout/wrapper";

export default {
  title: "Main Menu",
  excludeStories: ["ExampleMenu"]
  // includeStories: ["simple", "withLinks"]
};

const menu_items = ["Entry A", "Entry B", "Entry C"];

const WrapMenu = ({ children }) => (
  <Wrapper nav={children}>
    <div>
      <p>I am the main content.</p>
      <p>I am of no interest for this example.</p>
    </div>
  </Wrapper>
);

export const simple = () => {
  return (
    <WrapMenu>
      <Menu.MainMenu>
        <Menu.MenuGroup label="Menu Items">
          {menu_items.map(item => (
            <span>{item}</span>
          ))}
        </Menu.MenuGroup>
      </Menu.MainMenu>
    </WrapMenu>
  );
};

export const ExampleMenu = () => (
  <Menu.MainMenu>
    <Menu.MenuGroup label="Menu Items">
      {menu_items.map(item => (
        <a key={item} href={`#${item}`}>
          {item}
        </a>
      ))}
    </Menu.MenuGroup>
  </Menu.MainMenu>
);

export const withLinks = () => {
  return (
    <WrapMenu>
      <ExampleMenu />
    </WrapMenu>
  );
};
