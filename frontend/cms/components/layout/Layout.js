import React from "react";
import styles from "./Layout.module.css";

const Wrapper = ({ children }) => {
  return <div className={styles.wrapper}>{children}</div>;
};

const Nav = ({ children }) => {
  return <div className={styles.nav}>{children}</div>;
};

const Main = ({ children }) => {
  return <div className={styles.main}>{children}</div>;
};

export default { Wrapper, Nav, Main };
