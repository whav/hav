import React from "react";
import Image from "next/image";
import { MdFolder as FolderIcon } from "react-icons/md";

import styles from "./filebrowser.module.css";

const Media = ({ title, thumbnailUrl }) => {
  return (
    <div className={styles.item}>
      <Image src={thumbnailUrl} height={200} width={200} alt={title} />
      <p>{title}</p>
    </div>
  );
};

const Folder = ({ name = "Unnamed folder" }) => {
  return (
    <div className={styles.item}>
      <FolderIcon />
      <p>{name}</p>
    </div>
  );
};

const FileBrowser = ({ children }) => {
  return <div className={styles.filebrowser}>{children}</div>;
};

const Description = ({ text }) => {
  return <div className={styles.description}>{text}</div>;
};

export { Folder, Media, FileBrowser, Description };
