import React from "react";
import { FiFolder } from "react-icons/fi";

const Folder = ({ name = "Unnamed folder" }) => {
  return (
    <div>
      <FiFolder />
      <p>{name}</p>
    </div>
  );
};

const FileBrowserItem = ({ children }) => {
  console.log(children);
  return (
    <div
      style={{
        flexGrow: 1,
        flexShrink: 1,
        minHeight: "20rem",
        minWidth: "20rem"
      }}
    >
      {children}
    </div>
  );
};

const FileBrowser = ({ children }) => {
  console.log(children);
  return (
    <div style={{ display: "flex" }}>
      {children.map((child, index) => (
        <FileBrowserItem key={index}>{child}</FileBrowserItem>
      ))}
    </div>
  );
};

export { Folder, FileBrowser };
