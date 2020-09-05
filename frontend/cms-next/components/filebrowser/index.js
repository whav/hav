/** @jsx jsx */
import { jsx } from "theme-ui";

import React from "react";
import { FolderIcon } from "../../icons";

const Folder = ({ name = "Unnamed folder" }) => {
  return (
    <div
      sx={{ textAlign: "center", "& > svg": { height: "4rem", width: "4rem" } }}
    >
      <FolderIcon />
      <p>{name}</p>
    </div>
  );
};

const FileBrowserItem = ({ children }) => {
  return (
    <div
      sx={{
        flexGrow: 0,
        flexShrink: 0,
        justifyContent: "flex-start",
        width: "5rem",
        px: ".5rem"
      }}
    >
      {children}
    </div>
  );
};

const SelectableFileBrowserItem = ({ selected = false, ...props }) => {};

const FileBrowser = ({ children }) => {
  return (
    <div sx={{ display: "flex", flexWrap: "wrap" }}>
      {children.map((child, index) => (
        <FileBrowserItem key={index}>{child}</FileBrowserItem>
      ))}
    </div>
  );
};

export { Folder, FileBrowser };
