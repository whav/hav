import React, { useState } from "react";
import styles from "./NavBar.module.css";
import { MenuButton } from "theme-ui";

import Link from "next/link";

const NavBar = () => {
  const [navVisible, setNavVisibility] = useState(false);
  console.log("visible?", navVisible);
  return (
    <div className={styles.navbar}>
      <div className={styles.nav_main}>
        <div className={styles.nav_image_main}>
          <Link href="/">
            <a>
              <img src="/logos/hav.svg" />
            </a>
          </Link>
        </div>
        <nav className={navVisible ? styles.nav : styles.nav_hidden}>
          <ul>
            <li>one</li>
            <li>two</li>
            <li>three</li>
          </ul>
        </nav>
      </div>
      <div className={styles.nav_aside}>
        <MenuButton onClick={() => setNavVisibility(!navVisible)} />
      </div>
    </div>
  );
};

export default NavBar;
