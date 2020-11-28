import React from "react";

import styles from "./filebrowser.module.css";

const Description = ({ text }) => {
  return <div className={styles.description}>{text}</div>;
};

export { Description };
