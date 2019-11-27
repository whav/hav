import React from "react";
import { Folder, FileBrowser } from "../components/filebrowser";
import { Text } from "../components";

export default {
  title: "Filebrowser Components"
};

const folderNames = [
  "Folder A",
  "Folder B",
  "Folder C",
  "Folder D",
  "Folder E",
  "Folder With a Very Long Name"
];

export const SingleFolder = () => {
  return (
    <>
      <Text>Some dummy text</Text>
      <Folder name="TestFolder" />
    </>
  );
};

export const MultipleFolders = ({ names = folderNames }) => {
  return (
    <FileBrowser>
      {names.map((name, index) => (
        <Folder name={name} key={index} />
      ))}
    </FileBrowser>
  );
};

export const VeryLongFileBrowser = () => {
  let names = [...Array(500).keys()].map(i =>
    i % 7 === 0 ? `Folder ${i} With a very long name` : `Folder ${i}`
  );
  return <MultipleFolders names={names} />;
};
