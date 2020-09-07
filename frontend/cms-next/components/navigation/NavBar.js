import React, { useState } from "react";
import styles from "./NavBar.module.css";
import { MenuButton } from "theme-ui";

import Link from "next/link";

const NavBar = () => {
  const [navVisible, setNavVisibility] = useState(false);
  return (
    <div className={styles.navbar_wrapper}>
      <div className={styles.navbar}>
        <div className={styles.navbar_banner}>
          <Link href="/">
            <a>
              <img src="/logos/hav.svg" />
            </a>
          </Link>
        </div>
        <div className={styles.navbar_hamburger}>
          <MenuButton onClick={() => setNavVisibility(!navVisible)} />
        </div>
      </div>
      <nav className={`${styles.nav} ${navVisible ? "" : styles.nav_hidden}`}>
        <ul>
          <li>
            <Link href="/one/">
              <a>one</a>
            </Link>
          </li>
          <li>
            <Link href="/two/">
              <a>Two</a>
            </Link>
          </li>
          <li>
            <Link href="/three/">
              <a>three</a>
            </Link>
          </li>
        </ul>
        <div className="nav-bottom">
          <ul>
            <li>
              <img src="/logos/cirdis.svg" />
            </li>

            <li>
              <img src="/logos/univie.svg" />
            </li>
            <li>
              <Link href="/imprint/">
                <a>Imprint</a>
              </Link>
            </li>
            <li>
              <Link href="/open-knowledge/">
                <a>License Models</a>
              </Link>
            </li>
            <li>
              <Link href="/cooperation/">How to cooperate</Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
